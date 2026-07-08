"""
reclassify_policy_type.py — authoritative re-classification of policy_type for
live rows, using the FULL document body (fetched fresh from GOV.UK) plus the
tightened category definitions.

Snapshots every live row's current policy_type to policy_type_snapshot.json on
first run (never overwritten), so the whole thing is fully reversible:
    python reclassify_policy_type.py --revert   # restore every row from snapshot

Usage (run from the ingestion/ folder; reads DATABASE_URL + OPENAI_API_KEY):
    python reclassify_policy_type.py --limit 20   # test on 20
    python reclassify_policy_type.py              # all live rows
"""

import os
import sys
import json
import time
import argparse
from typing import Literal

import psycopg
from pydantic import BaseModel

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

SNAPSHOT = os.path.join(os.path.dirname(__file__), "policy_type_snapshot.json")

SYSTEM = (
    "You classify a UK AI policy document into ONE primary function, given its full text. "
    "Regulation & Compliance: rules, obligations, enforcement, regulatory reform. "
    "Implementation Guidance: practical how-to guidance for adopting AI or complying with rules "
    "- NOT news that a tool has launched or is being deployed (those are Strategy or Funding). "
    "Strategy & Frameworks: strategies, plans, frameworks, roadmaps, UK governance bodies. "
    "Research & Analysis: studies, evaluations, data, analysis, reports. "
    "Funding & Investment: money, grants, investment, funding announcements. "
    "International Cooperation: a FOREIGN country, foreign government/regulator, foreign "
    "organisation, or international body (G7, G20, UN, OECD) is a party - summits, treaties, trade "
    "deals, or MoUs with foreign parties. CRUCIAL: if EVERY party is British (UK departments, UK "
    "regulators like ICO/CMA/FCA, the NHS, UK public bodies), it is NOT International Cooperation "
    "even if it says 'collaboration', 'partnership', 'charter', 'joint' or 'MoU' - classify those "
    "as Strategy & Frameworks."
)


class PolicyTypeOnly(BaseModel):
    policy_type: Literal[
        "Regulation & Compliance", "Implementation Guidance", "Strategy & Frameworks",
        "Research & Analysis", "Funding & Investment", "International Cooperation"]


def safe(s):
    return (s or "").encode("ascii", "replace").decode()


def classify(title, body):
    try:
        c = e.client.beta.chat.completions.parse(
            model=e.MODEL,
            temperature=0,
            messages=[
                {"role": "system", "content": SYSTEM},
                {"role": "user", "content": f"Title: {title}\n\n{body}"},
            ],
            response_format=PolicyTypeOnly,
        )
        return c.choices[0].message.parsed.policy_type
    except Exception as ex:
        print("  [classify failed]", safe(str(ex)))
        return None


def ensure_snapshot(conn):
    if os.path.exists(SNAPSHOT):
        print(f"Snapshot already present ({SNAPSHOT}) — not overwriting.")
        return
    with conn.cursor() as cur:
        cur.execute("select id, policy_type from \"Policy\" where status = 'live'")
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
        for rid, pt in snap.items():
            cur.execute('update "Policy" set policy_type = %s where id = %s', (pt, rid))
            n += 1
    conn.close()
    print(f"Reverted {n} rows to their snapshot values.")


def main(limit):
    conn = psycopg.connect(DATABASE_URL)
    conn.autocommit = True
    ensure_snapshot(conn)

    with conn.cursor() as cur:
        cur.execute(
            'select id, title, description, ai_summary, url, policy_type from "Policy" '
            "where status = 'live' order by published_date desc nulls last"
        )
        rows = cur.fetchall()
    if limit:
        rows = rows[:limit]
    print(f"{len(rows)} rows to re-classify (full body)\n")

    changed = 0
    moves = {}
    for rid, title, desc, summ, url, old in rows:
        body = e.fetch_body_text(url) or f"{desc or ''}\n{summ or ''}"
        new = classify(title or "", body)
        if not new:
            continue
        if new != old:
            with conn.cursor() as cur:
                cur.execute('update "Policy" set policy_type = %s where id = %s', (new, rid))
            changed += 1
            moves[f"{old} -> {new}"] = moves.get(f"{old} -> {new}", 0) + 1
            print(f"  {old:24} -> {new:26} | {safe(title)[:46]}")
        time.sleep(0.2)

    conn.close()
    print(f"\nDone. {changed}/{len(rows)} rows changed.")
    for k, v in sorted(moves.items(), key=lambda x: -x[1]):
        print(f"  {v:4}  {k}")


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--limit", type=int, default=0, help="Only process N rows (0 = all)")
    p.add_argument("--revert", action="store_true", help="Restore every row from the snapshot")
    a = p.parse_args()
    if a.revert:
        revert()
    else:
        main(a.limit)
