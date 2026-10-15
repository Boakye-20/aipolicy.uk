"""
requalify.py — re-check every live row for how much it is actually ABOUT AI,
and hide the ones that aren't (status='excluded').

Older rows got in on a single keyword hit anywhere in the body (steel trade
measures, privacy notices with "automated decision-making" boilerplate). This
applies the same gate the ETL now uses on new rows: privacy-notice and
personal-information-charter titles are excluded outright, and everything else
is scored with extract.py's ai_focus rubric against the full body text.

Snapshots every live row's status to status_snapshot.json on first run (never
overwritten), so the whole thing is fully reversible:
    python requalify.py --revert   # restore every row from snapshot

Usage (run from the ingestion/ folder; reads DATABASE_URL + OPENAI_API_KEY):
    python requalify.py --dry-run --limit 50   # print what would change
    python requalify.py                        # all live rows
"""

import os
import sys
import json
import time
import argparse

import psycopg
from pydantic import BaseModel, Field

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

import extract as e

# Never crash printing odd characters on a cp1252 Windows console.
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

DATABASE_URL = (os.environ.get("DATABASE_URL") or "").strip()
if not DATABASE_URL:
    sys.exit("ERROR: DATABASE_URL not set.")

SNAPSHOT = os.path.join(os.path.dirname(__file__), "status_snapshot.json")

SYSTEM = (
    "You rate how much a UK government or regulator document is about AI, given its "
    "full text. Judge what the document is about, not whether the word appears."
)


class AiFocusOnly(BaseModel):
    # Same rubric as the ETL, so old and new rows are judged identically.
    ai_focus: int = Field(ge=1, le=10,
                          description=e.PolicyExtraction.model_fields["ai_focus"].description)


def safe(s):
    return (s or "").encode("ascii", "replace").decode()


def score(title, body):
    try:
        c = e.client.beta.chat.completions.parse(
            model=e.MODEL,
            temperature=0,
            messages=[
                {"role": "system", "content": SYSTEM},
                {"role": "user", "content": f"Title: {title}\n\n{body}"},
            ],
            response_format=AiFocusOnly,
        )
        return c.choices[0].message.parsed.ai_focus
    except Exception as ex:
        print("  [score failed]", safe(str(ex)))
        return None


def ensure_snapshot(conn):
    if os.path.exists(SNAPSHOT):
        print(f"Snapshot already present ({SNAPSHOT}) — not overwriting.")
        return
    with conn.cursor() as cur:
        cur.execute("select id, status from \"Policy\" where status = 'live'")
        snap = {r[0]: r[1] for r in cur.fetchall()}
    json.dump(snap, open(SNAPSHOT, "w"))
    print(f"Snapshot of {len(snap)} rows written to {SNAPSHOT}")


def revert():
    if not os.path.exists(SNAPSHOT):
        sys.exit("No snapshot file to revert from.")
    snap = json.load(open(SNAPSHOT))
    conn = psycopg.connect(DATABASE_URL)
    conn.autocommit = True
    n = 0
    with conn.cursor() as cur:
        for rid, status in snap.items():
            cur.execute('update "Policy" set status = %s where id = %s', (status, rid))
            n += 1
    conn.close()
    print(f"Reverted {n} rows to their snapshot values.")


def main(limit, dry_run):
    conn = psycopg.connect(DATABASE_URL)
    conn.autocommit = True
    if not dry_run:
        ensure_snapshot(conn)

    with conn.cursor() as cur:
        cur.execute(
            'select id, title, description, ai_summary, url, policy_type from "Policy" '
            "where status = 'live' order by published_date desc nulls last"
        )
        rows = cur.fetchall()
    if limit:
        rows = rows[:limit]
    print(f"{len(rows)} live rows to re-check{' (dry run)' if dry_run else ''}\n")

    excluded = 0
    for rid, title, desc, summ, url, ptype in rows:
        if e.is_excluded_title(title or ""):
            focus = None
        else:
            body = e.fetch_body_text(url) or f"{desc or ''}\n{summ or ''}"
            focus = score(title or "", body)
            time.sleep(0.2)
            if focus is None or focus >= e.MIN_AI_FOCUS:
                continue
        excluded += 1
        reason = "excluded title" if focus is None else f"ai_focus={focus}"
        print(f"  exclude  {reason:15} {ptype or '':24} | {safe(title)[:60]}")
        if not dry_run:
            with conn.cursor() as cur:
                cur.execute("update \"Policy\" set status = 'excluded' where id = %s", (rid,))

    conn.close()
    verb = "would be" if dry_run else "were"
    print(f"\nDone. {excluded}/{len(rows)} rows {verb} excluded.")


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--limit", type=int, default=0, help="Only process N rows (0 = all)")
    p.add_argument("--dry-run", action="store_true", help="Print changes without writing")
    p.add_argument("--revert", action="store_true", help="Restore every row from the snapshot")
    a = p.parse_args()
    if a.revert:
        revert()
    else:
        main(a.limit, a.dry_run)
