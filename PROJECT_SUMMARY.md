# UK AI Policy Tracker — Project Summary

A web app that tracks UK AI policy documents (regulations, guidance, strategy, consultations, research, funding, international agreements) sourced from GOV.UK, the ICO and the FCA. Each document is stored with structured metadata and shown across a dashboard, an explorer, and analytics pages.

> For the full engineering handoff, see `docs/DEVELOPER_GUIDE.md`. This summary is the high-level overview.

## Architecture

**Live database, no CSV.** A Python ETL writes documents straight into a Postgres (Neon) database; the Next.js frontend reads that database live via Prisma. There is no build-time data file — new documents appear on the site without a code deploy.

```
GOV.UK / ICO / FCA
        │
        ▼
  Python ETL (ingestion/extract.py)   ── LLM extraction + quality gate
        │  upsert on url (idempotent)
        ▼
   Postgres (Neon)                     ── rows: status = 'live' | 'review'
        │  Prisma, getPolicies() reads only 'live'
        ▼
  Next.js 14 frontend (Vercel)
```

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router), React, TypeScript, Tailwind CSS |
| Charts | Recharts |
| Icons | lucide-react |
| ORM | Prisma → PostgreSQL (Neon) |
| ETL | Python 3.11+, OpenAI (`gpt-4o-mini`), `psycopg`, `pydantic` |
| Hosting | Vercel (frontend), GitHub Actions (scheduled ETL) |

## Page pattern

Every data page is split in two:
- **`page.tsx`** — a server component. Fetches data with `getPolicies()` and passes it as a prop.
- **`*Content.tsx`** — a client component (`'use client'`). All interactivity (filters, sorting, charts) lives here; it receives `initialPolicies` and never fetches on its own.

This gives instant server-rendered loads with no spinners. Follow this pattern when adding a page.

## Pages

- `/` — dashboard (HomeContent)
- `/policy-explorer` — search + filters, paginated list
- `/regulations` — Regulation & Compliance only
- `/departments` — per-department charts
- `/analytics` — whole-dataset charts
- `/topics` — topic cloud + per-topic drilldown
- `/about`, `/how-it-works` — static pages

## Data model

Each document has several categorical dimensions. The guiding principle is to prefer **hard facts** (document type, dept, dates) over AI-inferred fields.

| Dimension | Field | Source | Status |
|---|---|---|---|
| Policy type | `policy_type` | AI-classified | Kept (6 fixed values) |
| Document type | `format` | GOV.UK metadata | Kept (normalised for display) |
| Sector | `sector_focus` | AI-classified | Kept (8 values) |
| Department | `dept` | Source metadata | Kept (short codes, e.g. DSIT) |
| Stage | `stage` | mixed/AI | Removed from UI |
| AI application | `ai_application` | AI-classified | Removed from UI |
| Obligations / source quote | `core_obligations`, `source_quote` | AI-extracted | Removed from UI |

Don't re-introduce removed dimensions without a deliberate reason — they were removed for accuracy.

Document-type values are normalised in `components/Badges.tsx`: `documentTypeLabel` (specific label for card badges) vs `documentTypeCategory` (grouped buckets for filters and charts).

## ETL pipeline (`ingestion/`)

`extract.py` pulls new AI-related documents, extracts structured fields with a strict LLM schema, and upserts rows into Neon (keyed on `url`, so re-runs are idempotent). Sources are the GOV.UK Search API (~9 departments), plus direct scrapers for the ICO and FCA sitemaps, with a dedicated consultation sweep.

**Quality gate:** if the model claims obligations but can't provide a verbatim supporting quote, the row is written as `status = 'review'` and hidden until a human sets it to `live`.

**Schedule:** GitHub Actions (`.github/workflows/etl.yml`) runs every Monday 06:00 UTC and can be triggered manually. Needs repo secrets `OPENAI_API_KEY` and `DATABASE_URL`.

## Running locally

```bash
npm install                # also runs `prisma generate`
npm run dev                # http://localhost:3000
npx tsc --noEmit           # type-check without building
```

Create `.env` at the repo root with `POSTGRES_PRISMA_URL` (pooled) and `POSTGRES_URL_NON_POOLING` (direct) — ask the project owner for the values.

## Deployment

- **Frontend → Vercel**, connected to `main`; every push auto-deploys. Vercel needs the Postgres env vars set or the build fails.
- **ETL → GitHub Actions**, needs `OPENAI_API_KEY` + `DATABASE_URL` as repo secrets.
- The two environments have separate secret stores.
