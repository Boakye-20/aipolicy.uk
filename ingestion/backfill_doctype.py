"""
backfill_doctype.py — fill Policy.format (the document type) for existing rows
that are missing it, using GOV.UK's content API.

No AI and no cost: document_type is metadata GOV.UK already publishes for every
page (policy_paper, guidance, open_consultation, research, press_release, ...).
The frontend normalises these raw values into clean labels at display time, so
this just needs to store the raw type.

Run from the ingestion/ folder (reads DATABASE_URL from .env):
    python backfill_doctype.py --limit 10   # test
    python backfill_doctype.py              # all missing GOV.UK rows
"""

import os
import sys
import time
import argparse

import requests
import psycopg

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

DATABASE_URL = (os.environ.get("DATABASE_URL") or "").strip()
if not DATABASE_URL:
    sys.exit("ERROR: DATABASE_URL not set.")


def main(limit: int):
    conn = psycopg.connect(DATABASE_URL)
    conn.autocommit = True
    with conn.cursor() as cur:
        cur.execute('select id, url from "Policy" where ("format" is null or "format" = \'\') and url like \'%gov.uk%\'')
        rows = cur.fetchall()

    if limit:
        rows = rows[:limit]
    print(f"{len(rows)} rows missing a document type\n")

    updated = 0
    misses = 0
    counts = {}
    for rid, url in rows:
        api = url.replace("https://www.gov.uk/", "https://www.gov.uk/api/content/")
        try:
            dt = requests.get(api, timeout=20).json().get("document_type")
        except Exception:
            dt = None

        if not dt:
            misses += 1
            continue

        with conn.cursor() as cur:
            cur.execute(
                'update "Policy" set "format" = %s, "display_type" = %s where id = %s',
                (dt, dt.replace("_", " ").title(), rid),
            )
        counts[dt] = counts.get(dt, 0) + 1
        updated += 1
        time.sleep(0.12)

    conn.close()
    print(f"Updated {updated} rows ({misses} had no type).\n")
    for k, v in sorted(counts.items(), key=lambda x: -x[1]):
        print(f"  {v:4}  {k}")


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--limit", type=int, default=0, help="Only process N rows (0 = all)")
    a = p.parse_args()
    main(a.limit)
