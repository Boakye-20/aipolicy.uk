"""
extract.py — UK AI Policy Tracker ETL (Postgres output)

Pulls new AI-related documents from GOV.UK, extracts structured intelligence
through a STRICT schema (the LLM is locked to your dashboard's exact category
values — it cannot invent categories or pad with filler), and upserts clean rows
straight into the Postgres (Neon) database your Next.js frontend reads via Prisma.

No CSV, no commit-back-to-repo: the frontend reads Postgres live, so new rows
appear on the site without a redeploy.

Quality gate ("show your work"): if the model states obligations but cannot
produce a verbatim source quote backing them, the row is written with
status = 'review' and hidden from users (lib/data.ts only returns status='live')
until you approve it by setting status='live' in the database.

Run (from the ingestion/ folder, after `pip install -r requirements.txt`):
    python extract.py                  # incremental: last 7 days
    python extract.py --days 30
    python extract.py --since 2025-01-01
"""

import os
import re
import sys
import time
import uuid
import argparse
import logging
from datetime import date, datetime, timedelta
from typing import Literal, List, Optional

import requests
import psycopg
from pydantic import BaseModel, Field
from openai import OpenAI

# Load OPENAI_API_KEY / DATABASE_URL from ingestion/.env if present (local runs).
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# .strip() guards against a trailing newline/space getting pasted into a GitHub
# Actions secret — psycopg otherwise reads "sslmode=require\n" as an invalid value.
OPENAI_API_KEY = (os.environ.get("OPENAI_API_KEY") or "").strip()
if not OPENAI_API_KEY:
    sys.exit("ERROR: OPENAI_API_KEY not set. Put it in ingestion/.env or your environment.")

# Use the Neon DIRECT connection (host without "-pooler"). This is a batch job
# that holds one connection and commits repeatedly — the direct connection, not
# the serverless pooler, is what that wants.
DATABASE_URL = (os.environ.get("DATABASE_URL") or "").strip()
if not DATABASE_URL:
    sys.exit("ERROR: DATABASE_URL not set. Put it in ingestion/.env or your environment.")

client = OpenAI(api_key=OPENAI_API_KEY)
MODEL = os.environ.get("ETL_MODEL", "gpt-4o-mini")  # swap via env if you want

GOV_UK_SEARCH = "https://www.gov.uk/api/search.json"

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("etl")


# ----------------------------------------------------------------------------
# Trusted departments. {slug: (abbrev shown on dashboard, dept_group)}
# Only these are ingested — whitelist, garbage-in/garbage-out control.
# ----------------------------------------------------------------------------
# Abbreviations MUST match the established dashboard vocabulary already in the
# database (underscores, "Treasury" not "HM Treasury") so the dept filter doesn't
# fragment into duplicate "Cabinet Office" vs "Cabinet_Office" entries.
DEPARTMENTS = {
    "department-for-science-innovation-and-technology": ("DSIT", "Innovation & Business"),
    "department-for-business-and-trade":               ("DBT", "Innovation & Business"),
    "cabinet-office":                                  ("Cabinet_Office", "Central Government"),
    "home-office":                                     ("Home_Office", "Security & Justice"),
    "hm-treasury":                                     ("Treasury", "Economy & Finance"),
    "department-of-health-and-social-care":            ("DHSC", "Health & Care"),
    "department-for-education":                        ("DfE", "Education"),
    "competition-and-markets-authority":               ("CMA", "Regulators"),
    "financial-conduct-authority":                     ("FCA", "Regulators"),
}

# Metadata for direct (non-GOV.UK-Search-API) sources. These don't go through
# fetch_documents/the GOV.UK Search API — each has its own discovery function
# below — but they share build_row's dept/dept_group lookup.
OTHER_SOURCES = {
    "ico": ("ICO", "Regulators"),
    "fca_direct": ("FCA", "Regulators"),
}

AI_KEYWORDS = [
    "artificial intelligence", "ai", "machine learning", "large language model",
    "llm", "generative ai", "foundation model", "algorithmic", "automated decision",
    "computer vision", "natural language processing",
]
# Word-boundary regex, not plain substring match. Short tokens like "ai" and
# "llm" otherwise collide with ordinary text/names (verified bug: "llm"
# matched inside the surname "Willmott" in an unrelated FCA press release).
_AI_KEYWORD_RE = re.compile(
    r"\b(" + "|".join(re.escape(kw) for kw in AI_KEYWORDS) + r")\b", re.IGNORECASE
)


def is_ai_relevant(text: str) -> bool:
    return bool(_AI_KEYWORD_RE.search(text))


# ----------------------------------------------------------------------------
# The strict extraction contract — Literals are YOUR dashboard's actual values,
# pulled from the existing data. The model physically cannot return anything else.
# ----------------------------------------------------------------------------
class PolicyExtraction(BaseModel):
    relevance_score: int = Field(
        ge=1, le=10,
        description=("1-10. Reserve 8-10 for binding obligations or major frameworks. "
                     "1-3 for news with no compliance implication. Do not cluster at 7."))

    priority_category: Literal["1-Critical", "2-High", "3-Medium", "4-Low", "5-Minimal"]

    requires_action: Literal["Yes", "No", "Monitor"]

    policy_type: Literal[
        "Regulation & Compliance", "Implementation Guidance", "Strategy & Frameworks",
        "Research & Analysis", "Funding & Investment", "International Cooperation"]

    business_impact: Literal["High Impact", "Strategic", "Operational", "Background"]

    sector_focus: Literal[
        "Cross-Sector", "Financial Services", "Healthcare", "Public Sector",
        "Education", "Technology", "Energy & Infrastructure", "Other/Mixed"]

    ai_application: Literal[
        "General AI Policy", "Safety & Security", "Data & Privacy",
        "Algorithmic Decision-Making", "Innovation & R&D", "Workforce & Skills",
        "International Competitiveness"]

    stage: Literal["Active", "Proposed", "Under Review", "Historical"]

    audience: Literal["Government/Public Sector", "Business/Private Sector", "General Public"]

    ai_summary: str = Field(
        description=("Exactly two sentences. First: what the document is. Second: the "
                     "specific compliance or strategic implication for a UK organisation. "
                     "No filler like 'this document outlines'. State facts."))

    core_obligations: List[str] = Field(
        max_length=3,
        description=("Concrete obligations the document EXPLICITLY imposes on an organisation "
                     "— a required action, duty, deadline, or prohibition — each under 20 words. "
                     "Include ONLY genuine requirements, NOT policy aims, goals or aspirations "
                     "(e.g. 'promote fair competition' or 'support growth' are NOT obligations). "
                     "Most documents impose 0-1; return an empty list when there are none. "
                     "Do NOT pad the list to three. Never invent obligations."))

    source_quote: Optional[str] = Field(
        default=None,
        description=("A single sentence copied VERBATIM from the source text that justifies "
                     "core_obligations. Null if there are no obligations."))

    primary_topic: str = Field(description="One short phrase, max 4 words, lowercase.")
    key_topics: List[str] = Field(max_length=3, description="2-3 specific tags, not just 'AI'.")


# ----------------------------------------------------------------------------
# Extract: GOV.UK search + clean body text
# ----------------------------------------------------------------------------
_PAGE_SIZE = 100
_MAX_PAGES = 20  # safety cap: 2000 docs/dept is far beyond any realistic window

# GOV.UK content-store document types that ARE consultations / calls for evidence.
# "Consultation" is not a policy_type in our schema — it's a document format — so
# it has to be discovered by document type, not by the LLM's category output.
CONSULTATION_DOC_TYPES = (
    "open_consultation", "closed_consultation",
    "consultation_outcome", "call_for_evidence",
)


def fetch_documents(dept_slug: str, since: str) -> list[dict]:
    """Paginate through every result in the date window. The API caps each
    response at _PAGE_SIZE — a department can publish hundreds of documents
    in a few months, so a single un-paginated call silently drops older (but
    still in-window) AI-relevant docs near the back of the list."""
    results: list[dict] = []
    start = 0
    while True:
        params = {
            "filter_organisations": dept_slug,
            # GOV.UK Search API date-range syntax: "from:YYYY-MM-DD" (the older
            # bracketed "filter_public_timestamp[from]" form now returns HTTP 422).
            "filter_public_timestamp": f"from:{since}",
            "order": "-public_timestamp",
            "count": _PAGE_SIZE,
            "start": start,
            "fields[]": ["title", "description", "public_timestamp", "link", "format", "organisations"],
        }
        try:
            r = requests.get(GOV_UK_SEARCH, params=params, timeout=30)
            r.raise_for_status()
            data = r.json()
            page = data.get("results", [])
            total = data.get("total", len(page))
        except Exception as e:
            log.error(f"GOV.UK fetch failed for {dept_slug} (start={start}): {e}")
            break

        results.extend(page)
        start += _PAGE_SIZE
        if not page or start >= total or start >= _PAGE_SIZE * _MAX_PAGES:
            break

    # GOV.UK returns `link` as a site-relative path (e.g. "/government/news/...").
    # Normalise to an absolute URL so dedup matches the existing rows (which are
    # absolute) and so fetch_body_text can hit the Content API correctly.
    for d in results:
        link = d.get("link", "")
        if link.startswith("/"):
            d["link"] = "https://www.gov.uk" + link

    relevant = [
        d for d in results
        if is_ai_relevant(d.get("title", "") + " " + d.get("description", ""))
    ]
    log.info(f"  {dept_slug}: {len(results)} fetched, {len(relevant)} AI-relevant")
    return relevant


def fetch_consultations(dept_slug: str, since: str) -> list[dict]:
    """Dedicated consultation sweep for one department.

    Two things make consultations get under-counted by the ordinary
    fetch_documents() path, so they get their own pass:

    1. They are a *document type*, not one of our six policy_type categories,
       so nothing in the normal flow specifically looks for them. Here we ask
       the GOV.UK Search API for the consultation document types directly via
       filter_content_store_document_type.

    2. Consultation titles are often generic ("Consultation on ...") and the
       AI keyword frequently lives only in the body, not the title/description.
       fetch_documents() filters on title+description and would drop those, so
       here the AI-relevance check is run against the fetched BODY text (same
       approach already used for ICO/FCA), not just the title."""
    results: list[dict] = []
    start = 0
    while True:
        params = {
            "filter_organisations": dept_slug,
            "filter_content_store_document_type": list(CONSULTATION_DOC_TYPES),
            "filter_public_timestamp": f"from:{since}",
            "order": "-public_timestamp",
            "count": _PAGE_SIZE,
            "start": start,
            "fields[]": ["title", "description", "public_timestamp", "link",
                         "content_store_document_type", "organisations"],
        }
        try:
            r = requests.get(GOV_UK_SEARCH, params=params, timeout=30)
            r.raise_for_status()
            data = r.json()
            page = data.get("results", [])
            total = data.get("total", len(page))
        except Exception as e:
            log.error(f"GOV.UK consultation fetch failed for {dept_slug} (start={start}): {e}")
            break

        results.extend(page)
        start += _PAGE_SIZE
        if not page or start >= total or start >= _PAGE_SIZE * _MAX_PAGES:
            break

    relevant = []
    for d in results:
        link = d.get("link", "")
        if link.startswith("/"):
            link = "https://www.gov.uk" + link
            d["link"] = link
        # Body-level AI check: fetch once, cache for extract() to reuse.
        title = d.get("title", "")
        desc = d.get("description", "")
        if is_ai_relevant(title + " " + desc):
            keep = True
        else:
            body = fetch_body_text(link)
            keep = bool(body and is_ai_relevant(body))
            if keep:
                d["_body_cache"] = body
        if keep:
            # Preserve the consultation document type as the row's format.
            d["format"] = d.get("content_store_document_type") or "consultation"
            d["_dept_slug"] = dept_slug
            relevant.append(d)

    log.info(f"  {dept_slug} consultations: {len(results)} fetched, {len(relevant)} AI-relevant")
    return relevant


def fetch_body_text(url: str) -> Optional[str]:
    """Clean body text via the GOV.UK Content API (strips HTML boilerplate)."""
    api_url = url.replace("https://www.gov.uk/", "https://www.gov.uk/api/content/")
    try:
        r = requests.get(api_url, timeout=30)
        r.raise_for_status()
        details = r.json().get("details", {})
        body = details.get("body", "") or details.get("introduction", "")
        if body and len(body) > 200:
            clean = re.sub(r"<[^>]+>", " ", body)
            clean = re.sub(r"\s+", " ", clean).strip()
            return clean[:18000]  # budget: enough to reach buried obligations
    except Exception:
        pass
    return None


# ----------------------------------------------------------------------------
# ICO (ico.org.uk) — a direct source outside the GOV.UK Search API.
#
# ICO disabled both its "News and blogs" and "Enforcement" RSS feeds during a
# site redesign (verified live on their /rss-feeds/ page — neither is a
# guess), and its news listing page is JS-rendered (no server-side article
# links to scrape). Their sitemap.xml is static and complete, though, so it's
# used purely for discovery + dates; each candidate's real body text is then
# fetched directly from its own URL — no guessed API, no guessed feed.
# ----------------------------------------------------------------------------
ICO_SITEMAP = "https://ico.org.uk/sitemap.xml"
_ICO_UA = {"User-Agent": "Mozilla/5.0 (compatible; aipolicy.uk-etl/1.0)"}


def _fetch_ico_article(url: str) -> Optional[dict]:
    """One GET per article. Pulls title (<h1>), the page's own Date/Type
    metadata line, and the full body text out of the same response — title
    and body are checked for AI relevance by the caller using the actual
    article content, not just the title (many ICO articles have generic
    titles, e.g. routine enforcement notices, that still cover AI topics)."""
    import html as html_module

    try:
        r = requests.get(url, timeout=30, headers=_ICO_UA)
        r.raise_for_status()
        page = r.text
    except Exception as e:
        log.error(f"ICO article fetch failed for {url}: {e}")
        return None

    # ICO pages carry a site-wide survey banner with its own <h1> ("Take our
    # website user survey") BEFORE the article headline (verified live on the
    # Clearview AI judgment page: two banner h1s, then the real one). Take the
    # first h1 that isn't the banner.
    title = ""
    for m in re.finditer(r"<h1[^>]*>([^<]+)</h1>", page):
        candidate = html_module.unescape(m.group(1)).strip()
        if candidate and "user survey" not in candidate.lower():
            title = candidate
            break

    date_m = re.search(r"<span>Date</span>\s*<strong[^>]*>([^<]+)</strong>", page)
    pub_date = None
    if date_m:
        try:
            pub_date = datetime.strptime(date_m.group(1).strip(), "%d %B %Y").date()
        except ValueError:
            pub_date = None

    type_m = re.search(r"<span>Type</span>\s*<strong[^>]*>([^<]+)</strong>", page)
    doc_type = type_m.group(1).strip() if type_m else "News"

    start = page.find('id="main-content"')
    end = page.find("</main>")
    if start == -1:
        return None
    chunk = page[start: end if end != -1 else start + 20000]
    clean = re.sub(r"<[^>]+>", " ", chunk)
    clean = re.sub(r"\s+", " ", html_module.unescape(clean)).strip()

    if not title or len(clean) < 200:
        return None

    return {
        "title": title,
        "link": url,
        "description": clean[:300],
        "public_timestamp": pub_date.isoformat() if pub_date else "",
        "format": doc_type,
        "_dept_slug": "ico",
        "_body_cache": clean[:18000],  # reused by extract() — no second fetch
    }


def fetch_ico_documents(since: str) -> list[dict]:
    """Discover ICO articles via the sitemap, filter to the date window, fetch
    each candidate once, and keep only the ones whose actual title+body text
    contain an AI keyword."""
    try:
        r = requests.get(ICO_SITEMAP, timeout=60)
        r.raise_for_status()
        xml = r.text
    except Exception as e:
        log.error(f"ICO sitemap fetch failed: {e}")
        return []

    since_dt = datetime.strptime(since, "%Y-%m-%d")
    candidate_urls = []
    for m in re.finditer(
        r"<loc>(https://ico\.org\.uk/about-the-ico/media-centre/news-and-blogs/[^<]+)</loc>\s*"
        r"<lastmod>([^<]+)</lastmod>",
        xml,
    ):
        url, lastmod = m.group(1), m.group(2)
        try:
            if datetime.strptime(lastmod[:10], "%Y-%m-%d") >= since_dt:
                candidate_urls.append(url)
        except ValueError:
            continue

    relevant = []
    for url in candidate_urls:
        doc = _fetch_ico_article(url)
        if not doc:
            continue
        if is_ai_relevant(doc["title"] + " " + doc["_body_cache"]):
            relevant.append(doc)
        time.sleep(0.2)

    log.info(f"  ICO: {len(candidate_urls)} articles in window, {len(relevant)} AI-relevant")
    return relevant


# ----------------------------------------------------------------------------
# FCA (fca.org.uk) — a direct source. The GOV.UK Search API only carries a
# handful of FCA documents (verified: 3 total in a 6-month test window) — the
# FCA's real publishing happens on its own site, not through GOV.UK.
#
# fca.org.uk's sitemap.xml is a sitemap INDEX with 2 sub-sitemaps (~50,000
# URLs combined, confirmed via fetch). The vast majority (~18,000) are
# "news/warnings" — consumer alerts about scam/clone firms, not policy — so
# those are excluded by path. The genuine policy/regulatory paths (confirmed
# by inspecting real path-prefix counts) are whitelisted below.
# ----------------------------------------------------------------------------
FCA_SITEMAP_INDEX = "https://www.fca.org.uk/sitemap.xml"
FCA_POLICY_PATHS = (
    "/news/press-releases/", "/news/news-stories/", "/news/statements/",
    "/news/speeches/", "/publications/policy-statements/",
    "/publications/consultation-papers/", "/publications/finalised-guidance/",
    "/publications/feedback-statements/", "/publications/guidance-consultations/",
    "/publications/discussion-papers/",
)

# Hyphenated AI tokens for cheap URL-slug pre-filtering (FCA slugs are descriptive).
_URL_AI_TOKENS = ("artificial-intelligence", "ai-", "-ai-", "-ai/", "/ai-",
                  "machine-learning", "automated-decision", "algorithm",
                  "generative", "foundation-model", "agentic", "big-tech")


def _url_looks_ai(url: str) -> bool:
    low = url.lower()
    return any(tok in low for tok in _URL_AI_TOKENS)


def _fetch_fca_article(url: str) -> Optional[dict]:
    """One GET per article. Title/type/date sit before <article>; body sits
    inside <article>...</article> (a small feedback-form tail gets swept in
    as harmless noise, same tradeoff as ICO's breadcrumb)."""
    import html as html_module

    try:
        r = requests.get(url, timeout=30, headers=_ICO_UA)
        r.raise_for_status()
        page = r.text
    except Exception as e:
        log.error(f"FCA article fetch failed for {url}: {e}")
        return None

    h1 = re.search(r'<h1[^>]*class="page-header"[^>]*>\s*<span>([^<]+)</span>', page)
    title = html_module.unescape(h1.group(1)).strip() if h1 else ""

    type_m = re.search(r'<span class="type">([^<]+)</span>', page)
    doc_type = type_m.group(1).strip() if type_m else "News"

    date_m = re.search(r'<time datetime="([^"]+)"', page)
    pub_date = None
    if date_m:
        try:
            pub_date = datetime.strptime(date_m.group(1)[:10], "%Y-%m-%d").date()
        except ValueError:
            pub_date = None

    start = page.find("<article")
    end = page.find("</article>")
    if start == -1:
        return None
    chunk = page[start: end + len("</article>") if end != -1 else start + 20000]
    clean = re.sub(r"<[^>]+>", " ", chunk)
    clean = re.sub(r"\s+", " ", html_module.unescape(clean)).strip()

    if not title or len(clean) < 200:
        return None

    return {
        "title": title,
        "link": url,
        "description": clean[:300],
        "public_timestamp": pub_date.isoformat() if pub_date else "",
        "format": doc_type,
        "_dept_slug": "fca_direct",
        "_body_cache": clean[:18000],
    }


def fetch_fca_documents(since: str) -> list[dict]:
    """Discover FCA policy documents via the sitemap index (2 sub-sitemaps),
    keep only whitelisted policy paths (excludes ~18k scam-warning URLs),
    filter to the date window, fetch each candidate once, and keep only the
    AI-relevant ones (checked against actual title+body, not just the URL)."""
    try:
        idx = requests.get(FCA_SITEMAP_INDEX, timeout=30)
        idx.raise_for_status()
        sub_sitemaps = re.findall(r"<loc>(https://www\.fca\.org\.uk/sitemap\.xml\?page=\d+)</loc>", idx.text)
    except Exception as e:
        log.error(f"FCA sitemap index fetch failed: {e}")
        return []

    since_dt = datetime.strptime(since, "%Y-%m-%d")
    candidate_urls = []
    for sm_url in sub_sitemaps:
        try:
            r = requests.get(sm_url, timeout=60)
            r.raise_for_status()
            xml = r.text
        except Exception as e:
            log.error(f"FCA sub-sitemap fetch failed for {sm_url}: {e}")
            continue
        for m in re.finditer(r"<loc>(https://www\.fca\.org\.uk/[^<]+)</loc>(?:<lastmod>([^<]+)</lastmod>)?", xml):
            url, lastmod = m.group(1), m.group(2)
            if not any(p in url for p in FCA_POLICY_PATHS):
                continue
            # Slug pre-filter: FCA's whitelisted paths still hold ~1.5k in-window
            # URLs (the /publications/ paths are broad). FCA slugs are descriptive,
            # so require an AI token in the URL before paying to fetch each page —
            # this cuts ~1,500 fetches to a handful. Confirmed AI-relevant FCA docs
            # all carry "ai"/"artificial-intelligence" in the slug.
            if not _url_looks_ai(url):
                continue
            if not lastmod:
                continue  # no date metadata -> can't confirm it's in window
            try:
                if datetime.strptime(lastmod[:10], "%Y-%m-%d") >= since_dt:
                    candidate_urls.append(url)
            except ValueError:
                continue

    relevant = []
    for url in candidate_urls:
        doc = _fetch_fca_article(url)
        if not doc:
            continue
        if is_ai_relevant(doc["title"] + " " + doc["_body_cache"]):
            relevant.append(doc)
        time.sleep(0.2)

    log.info(f"  FCA: {len(candidate_urls)} policy docs in window, {len(relevant)} AI-relevant")
    return relevant


# ----------------------------------------------------------------------------
# Transform: strict LLM extraction
# ----------------------------------------------------------------------------
def extract(doc: dict) -> Optional[PolicyExtraction]:
    title = doc.get("title", "")
    url = doc.get("link", "")
    source_text = (doc.get("_body_cache")        # already fetched (e.g. ICO)
                   or fetch_body_text(url)        # GOV.UK Content API
                   or f"{title}\n\n{doc.get('description', '')}")
    try:
        completion = client.beta.chat.completions.parse(
            model=MODEL,
            temperature=0,
            messages=[
                {"role": "system", "content":
                    ("You are a regulatory data extraction engine for UK AI policy. "
                     "Extract ONLY what is explicitly stated. Do not infer or embellish. "
                     "For core_obligations, list only concrete requirements the document "
                     "imposes on an organisation (an action, duty, deadline or prohibition), "
                     "never policy aims or goals, and never pad the list — an empty list is "
                     "correct when the document imposes no obligations. "
                     "The source_quote must be copied verbatim from the text provided.")},
                {"role": "user", "content":
                    f"Title: {title}\nURL: {url}\n\nSource text:\n{source_text}"},
            ],
            response_format=PolicyExtraction,
        )
        return completion.choices[0].message.parsed
    except Exception as e:
        log.error(f"Extraction failed for '{title[:60]}': {e}")
        return None


def passes_quote_gate(e: PolicyExtraction) -> bool:
    """Obligations claimed but no verbatim quote -> route to review, not live."""
    if e.core_obligations and not (e.source_quote and e.source_quote.strip()):
        return False
    return True


# ----------------------------------------------------------------------------
# Derive the dashboard's computed columns from the source + extraction
# ----------------------------------------------------------------------------
MONTHS = ["", "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"]


def recency_label(days: Optional[int]) -> str:
    if days is None:
        return "Unknown"
    if days <= 7:
        return "Last week"
    if days <= 31:
        return "Last month"
    if days <= 92:
        return "Last quarter"
    if days <= 365:
        return "Last year"
    return "Older"


def build_row(doc: dict, e: PolicyExtraction) -> dict:
    """Map a GOV.UK doc + strict extraction into one DB row (Python-native types).
    Numeric/date fields are None when unknown so Postgres accepts them."""
    slug = doc.get("_dept_slug", "")
    abbrev, group = DEPARTMENTS.get(slug) or OTHER_SOURCES.get(slug) or ("", "")

    ts = (doc.get("public_timestamp") or "")[:10]
    pub_dt = None
    try:
        pub_dt = datetime.strptime(ts, "%Y-%m-%d")
    except (ValueError, TypeError):
        pub_dt = None

    today = date.today()
    if pub_dt:
        d = pub_dt.date()
        days_since = (today - d).days
        q = (d.month - 1) // 3 + 1
        row_dates = {
            "published_date": d.isoformat(),               # cast to timestamp by PG
            "year": d.year,
            "month": d.month,
            "month_name": MONTHS[d.month],
            "quarter": q,
            "quarter_label": f"Q{q} {d.year}",
            "year_month": f"{d.year}-{d.month:02d}",
            "days_since_published": days_since,
            "recency": recency_label(days_since),
            "week_of_year": d.isocalendar().week,
        }
    else:
        row_dates = {
            "published_date": None, "year": None, "month": None, "month_name": None,
            "quarter": None, "quarter_label": None, "year_month": None,
            "days_since_published": None, "recency": "Unknown", "week_of_year": None,
        }

    fmt_raw = doc.get("format", "") or ""
    return {
        "dept": abbrev,
        "dept_group": group,
        "title": doc.get("title", ""),
        "priority_category": e.priority_category,
        "policy_type": e.policy_type,
        "business_impact": e.business_impact,
        "sector_focus": e.sector_focus,
        "ai_application": e.ai_application,
        "stage": e.stage,
        "audience": e.audience,
        "ai_summary": e.ai_summary,
        "primary_topic": e.primary_topic,
        "key_topics": ", ".join(e.key_topics),
        "summary_word_count": len(e.ai_summary.split()),
        "topics_count": len(e.key_topics),
        "description": doc.get("description", ""),
        "url": doc.get("link", ""),
        "format": fmt_raw,
        "display_type": fmt_raw.replace("_", " ").title(),
        "collection_date": today.isoformat(),
        "relevance_score": e.relevance_score,
        "requires_action": e.requires_action,
        "core_obligations": e.core_obligations,            # text[] in Postgres
        "source_quote": e.source_quote,
        **row_dates,
    }


# ----------------------------------------------------------------------------
# Load: upsert into Postgres (Prisma "Policy" table) on conflict (url)
# ----------------------------------------------------------------------------
# All columns we write. `id` is generated here because Prisma creates cuids in
# JS — the database has no default for it, so a raw insert must supply one.
DB_COLUMNS = [
    "id", "dept", "dept_group", "title", "published_date", "year", "month",
    "month_name", "quarter", "quarter_label", "year_month", "priority_category",
    "policy_type", "business_impact", "sector_focus", "ai_application", "stage",
    "audience", "ai_summary", "primary_topic", "key_topics", "recency",
    "days_since_published", "summary_word_count", "topics_count", "url",
    "description", "format", "display_type", "collection_date", "week_of_year",
    "relevance_score", "requires_action", "core_obligations", "source_quote",
    "status",
]
# Columns updated on conflict (everything except the identity/dedup keys).
_UPDATE_COLS = [c for c in DB_COLUMNS if c not in ("id", "url")]

_cols_sql = ", ".join(f'"{c}"' for c in DB_COLUMNS)
_vals_sql = ", ".join(f"%({c})s" for c in DB_COLUMNS)
_update_sql = ", ".join(f'"{c}" = excluded."{c}"' for c in _UPDATE_COLS)
UPSERT = (
    f'insert into "Policy" ({_cols_sql}) values ({_vals_sql}) '
    f'on conflict ("url") do update set {_update_sql};'
)


def existing_urls(conn) -> set[str]:
    with conn.cursor() as cur:
        cur.execute('select url from "Policy"')
        return {r[0] for r in cur.fetchall()}


def load(conn, row: dict, status: str):
    row = dict(row)
    row["id"] = "etl_" + uuid.uuid4().hex   # unique, never collides with cuids
    row["status"] = status
    with conn.cursor() as cur:
        cur.execute(UPSERT, row)


class _ConnHolder:
    """Mutable box around the live connection so _process_doc can swap in a
    fresh one after a drop, without every caller needing to know it changed."""
    def __init__(self, conn):
        self.conn = conn


def _connect() -> "psycopg.Connection":
    # autocommit: psycopg's default leaves even a plain SELECT in an open
    # transaction until commit(). With long fetch-only phases (no DB writes)
    # between sources, that transaction sits idle and Neon kills it
    # (confirmed root cause of two real crashes: AdminShutdown, then
    # IdleInTransactionSessionTimeout). Autocommit means no statement is ever
    # left in an uncommitted transaction.
    conn = psycopg.connect(DATABASE_URL)
    conn.autocommit = True
    return conn


def _reconnect(holder: _ConnHolder) -> None:
    try:
        holder.conn.close()
    except Exception:
        pass
    holder.conn = _connect()
    log.warning("  Reconnected to the database after a dropped connection.")


def _process_doc(holder: _ConnHolder, doc: dict, seen: set, counts: dict) -> None:
    """Extract + load a single candidate doc; updates `seen` and `counts`
    ("live"/"review"/"errors") in place. Shared by every source so GOV.UK and
    direct sources (ICO, etc.) go through identical quote-gate logic.

    Neon (serverless Postgres) can drop an idle/long-held connection mid-run
    (observed: psycopg.errors.AdminShutdown during a real run touching all
    sources) -- the LLM call already happened by that point, so on a drop we
    reconnect and retry the DB write once rather than losing that extraction."""
    url = doc.get("link", "")
    if not url or url in seen:
        return
    e = extract(doc)
    if not e:
        counts["errors"] += 1
        return
    row = build_row(doc, e)
    status = "live" if passes_quote_gate(e) else "review"

    for attempt in range(2):
        try:
            load(holder.conn, row, status)
            holder.conn.commit()
            break
        except psycopg.OperationalError as exc:
            log.warning(f"  DB write failed ({exc}); reconnecting...")
            _reconnect(holder)
            if attempt == 1:
                counts["errors"] += 1
                return

    seen.add(url)
    counts[status] += 1
    log.info(f"  [{status}] {e.priority_category} | {doc.get('title','')[:60]}")
    time.sleep(0.4)


# ----------------------------------------------------------------------------
# Pipeline
# ----------------------------------------------------------------------------
def run(since: Optional[str], days: Optional[int]):
    if since:
        since_date = since
    elif days:
        since_date = (date.today() - timedelta(days=days)).isoformat()
    else:
        since_date = (date.today() - timedelta(days=7)).isoformat()

    log.info(f"Fetching documents published since {since_date} (model={MODEL})")

    holder = _ConnHolder(_connect())
    try:
        seen = existing_urls(holder.conn)
        log.info(f"{len(seen)} documents already in database")

        counts = {"live": 0, "review": 0, "errors": 0}

        for slug in DEPARTMENTS:
            for doc in fetch_documents(slug, since_date):
                doc["_dept_slug"] = slug
                _process_doc(holder, doc, seen, counts)
            # Dedicated consultation sweep: catches AI consultations whose
            # keyword is only in the body, which the general sweep drops.
            for doc in fetch_consultations(slug, since_date):
                _process_doc(holder, doc, seen, counts)

        # Direct sources (no/minimal GOV.UK Search API coverage).
        for doc in fetch_ico_documents(since_date):
            _process_doc(holder, doc, seen, counts)
        for doc in fetch_fca_documents(since_date):
            _process_doc(holder, doc, seen, counts)

        new_live, new_review, errors = counts["live"], counts["review"], counts["errors"]
    finally:
        holder.conn.close()

    log.info(f"\nDone. New live: {new_live} | New to review: {new_review} | Errors: {errors}")
    if new_review:
        log.warning(f"{new_review} rows need a human glance: set status='live' in the "
                    f"database after checking (obligations claimed without a verbatim quote).")


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--since", help="ISO date, e.g. 2025-01-01")
    p.add_argument("--days", type=int, help="Look back this many days")
    a = p.parse_args()
    run(a.since, a.days)
