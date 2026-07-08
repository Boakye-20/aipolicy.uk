# aipolicy.uk — Developer Guide

A handoff reference for working on the UK AI Policy Tracker. Read this before making changes.

---

## 1. What it is

A web app that tracks UK AI policy documents (regulations, guidance, strategy, consultations, research, funding, international agreements) sourced from GOV.UK, the ICO and the FCA. Each document is stored with structured metadata and shown across a dashboard, an explorer, and analytics pages.

**Live data flow:** a Python ETL writes documents straight into a Postgres (Neon) database; the Next.js frontend reads that database live via Prisma. There is **no CSV and no build-time data file** — new documents appear on the site without a code deploy.

---

## 2. Tech stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router), React, TypeScript, Tailwind CSS |
| Charts | Recharts |
| Icons | lucide-react |
| ORM | Prisma → PostgreSQL (Neon) |
| ETL | Python 3.11+, OpenAI (`gpt-4o-mini`), `psycopg`, `pydantic` |
| Hosting | Vercel (frontend), GitHub Actions (scheduled ETL) |

---

## 3. Architecture

### Page pattern (important)
Every data page is split in two:
- **`page.tsx`** — a **server component**. It fetches data with `getPolicies()` and passes it as a prop. No `'use client'`.
- **`*Content.tsx`** — a **client component** (`'use client'`). All interactivity (filters, sorting, charts) lives here. It receives `initialPolicies` and never fetches on its own.

Example: `app/regulations/page.tsx` fetches, then renders `<RegulationsContent initialPolicies={...} />`.

This gives instant server-rendered loads with no spinners. **When adding a page, follow this pattern.**

### Data access
- **`lib/data.ts`** → `getPolicies(filters?)` is the single query function. It returns only rows with `status = 'live'` (the ETL parks uncertain rows as `status = 'review'`, hidden from the site).
- Prisma reads from Neon using env vars `POSTGRES_PRISMA_URL` (pooled) and `POSTGRES_URL_NON_POOLING` (direct). Defined in `schema.prisma`.

---

## 4. Running locally

**Prereqs:** Node 18+, and (for the ETL only) Python 3.11+.

```bash
npm install                # also runs `prisma generate`
npm run dev                # http://localhost:3000
npm run build              # prod build (runs prisma generate first)
npx tsc --noEmit           # type-check without building
```

**Frontend env** — create `.env` at the repo root:
```
POSTGRES_PRISMA_URL=postgres://...          # Neon pooled connection
POSTGRES_URL_NON_POOLING=postgres://...      # Neon direct connection
```
(Both are the same values used in Vercel. Ask the project owner for them.)

> Windows note: if `prisma generate` fails with `EPERM ... query_engine-windows.dll`, a `node` process is holding the file — stop the dev server and retry.

---

## 5. Project map

```
app/
  page.tsx                    -> HomeContent.tsx        (dashboard)
  policy-explorer/            -> PolicyExplorerContent  (search + filters, paginated list)
  regulations/                -> RegulationsContent     (Regulation & Compliance only)
  departments/                -> DepartmentsContent     (per-department charts)
  analytics/                  -> AnalyticsContent       (whole-dataset charts)
  topics/                     -> TopicsContent          (topic cloud + per-topic drilldown)
  about/, how-it-works/       (static pages)
  layout.tsx                  (sticky header, footer, nav)

components/
  Badges.tsx                  <- SHARED tag + document-type system (see §6)
  navigation/Navigation.tsx   (header nav links)

lib/
  data.ts                     (getPolicies — the only DB read)
  utils.ts                    (formatDate, cn, etc.)

types/policy.ts               (the Policy interface)
schema.prisma                 (DB schema + datasource)

ingestion/                    (the Python ETL — see §7)
.github/workflows/etl.yml     (scheduled ETL run)
```

**Legacy components** (`SearchHero`, `HomeMetrics`, `LegislativeOverview`, `RegulatorMatrix`, `SystemStatusBar`, `ProfessionalPolicyCard`, `Dashboard`, `PolicyTable`, etc.) predate the current redesign and are **not imported by any page**. Leave them or delete in a cleanup — they don't affect the live site.

---

## 6. The data model & its dimensions

The `Policy` type is in `types/policy.ts`; the DB schema is `schema.prisma`. Each document has several categorical dimensions. **Know which are shown and which were deliberately removed:**

| Dimension | Field | Source | Status | Notes |
|---|---|---|---|---|
| **Policy type** | `policy_type` | AI-classified | **KEPT** | 6 fixed values: Regulation & Compliance, Implementation Guidance, Strategy & Frameworks, Research & Analysis, Funding & Investment, International Cooperation. Shown as a coloured badge + homepage filter pills. |
| **Document type** | `format` | GOV.UK metadata (**hard fact**) | **KEPT** | Raw GOV.UK `document_type` (e.g. `open_consultation`, `policy_paper`). Normalised for display — see below. |
| **Sector** | `sector_focus` | AI-classified | **KEPT** | 8 values (Cross-Sector, Technology, Financial Services, …). Badge + filter. |
| **Department** | `dept` | Source metadata | **KEPT** | Short codes: DSIT, DBT, CMA, ICO, FCA, Cabinet_Office, Home_Office, Treasury, DfE, DHSC. Filters match on the code. |
| Stage | `stage` | mixed/AI | **REMOVED from UI** | Was unreliable (legacy fallback always returned "Active"). Field still exists in DB but is not displayed anywhere. |
| AI application | `ai_application` | AI-classified | **REMOVED from UI** | Dropped from badges, filters and charts (kept only in DB). |
| Obligations / source quote | `core_obligations`, `source_quote` | AI-extracted | **REMOVED from UI** | The old "Source evidence" panel. Padded and unreliable, so no longer shown (still extracted for the ETL quality gate). |

**Guiding principle used throughout:** prefer **hard facts** (document type, dept, dates) over AI-inferred fields; where an AI field is shown (policy_type, sector), it's because it adds a distinct, reasonably reliable axis. Don't re-introduce removed dimensions without a good reason.

### Document-type normalisation (`components/Badges.tsx`)
Raw `format` values are messy (~40 variants, mixed case). Two helpers normalise them:
- **`documentTypeLabel(format)`** → a *specific* clean label for the **card badge** (e.g. "Press release", "Open consultation").
- **`documentTypeCategory(format)`** → one of **10 grouped buckets + "Other"** for **filters and charts** (Open consultation, Closed consultation, Policy paper, Guidance, Research & reports, News & press releases, Speeches & statements, Transparency, Notices & decisions, Other).

> Rule of thumb: **badges** use `documentTypeLabel` (detail), **filters/charts** use `documentTypeCategory` (grouped). Keep them consistent when adding new document-type UI.

---

## 7. The ETL pipeline (`ingestion/`)

`extract.py` pulls new AI-related documents, extracts structured fields with a strict LLM schema, and upserts rows into Neon (keyed on `url`, so re-runs are idempotent).

**Sources:** GOV.UK Search API (a whitelist of ~9 departments), plus direct scrapers for the ICO (sitemap) and FCA (sitemap index). There's a dedicated consultation sweep so open/closed consultations aren't missed.

**Quality gate:** if the model claims obligations but can't provide a verbatim supporting quote, the row is written as `status = 'review'` and hidden until a human sets it to `live`.

**Schedule:** the real scheduler is **GitHub Actions** — `.github/workflows/etl.yml` runs every **Monday 06:00 UTC** and can be triggered manually (Actions tab → *AI Policy ETL* → *Run workflow*, with optional `days`/`since` inputs). It needs repo secrets `OPENAI_API_KEY` and `DATABASE_URL`.

**Run it by hand (from `ingestion/`, with `ingestion/.env` set):**
```bash
pip install -r requirements.txt
python extract.py               # incremental: last 7 days
python extract.py --days 30
python extract.py --since 2025-01-01
```
`ingestion/.env` needs `OPENAI_API_KEY` and `DATABASE_URL` (the Neon **direct** connection string). Both secrets are `.strip()`-ed on load, so a trailing newline in a pasted value won't break the DB connection.

### Maintenance scripts (one-offs, safe to re-run)
- **`backfill_doctype.py`** — fills `format` (document type) from the GOV.UK content API for rows missing it. Free (HTTP only, no LLM).
- **`reclassify_policy_type.py`** — re-classifies `policy_type` using the full document body. **Snapshots every row first** to `policy_type_snapshot.json`, so `python reclassify_policy_type.py --revert` restores everything.

---

## 8. Deployment

- **Frontend → Vercel**, connected to `main`. Every push to `main` auto-deploys. The homepage and several pages are statically prerendered at build time, so **Vercel needs the Postgres env vars** (`POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`) set in its project settings, or the build fails.
- **ETL → GitHub Actions**, needs `OPENAI_API_KEY` + `DATABASE_URL` as repo secrets.
- These two environments have **separate** secret stores — a DB URL must exist in both.

> Pushing to `main` deploys to production. Use a branch + PR if you want review first.

---

## 9. How to make common changes

**Add/adjust a filter** on Explorer or Regulations: filters live in the `*Content.tsx` file as `useState` plus a `.filter()` in the filter function; add a `<select>` to the filter bar. Derive options from the data (`[...new Set(policies.map(p => p.field))]`) so they never drift out of sync. Match document type on `documentTypeCategory(p.format)`.

**Add a chart** (Analytics/Departments): compute a `{ name, value }[]` array from `policies` and drop it into a Recharts `<BarChart>`/`<PieChart>`. For document-type charts, group with `documentTypeCategory`.

**Change styling:** Tailwind. The look is "sharp government" — slate palette, `border-slate-300` outlined tags, `max-w-container` (1400px) page width, minimal colour. Shared badges are in `components/Badges.tsx`.

**Add an ETL source or category rule:** edit `ingestion/extract.py` — the `DEPARTMENTS` whitelist, the strict `PolicyExtraction` schema (its `Literal`s are the exact allowed values), and the fetch functions. Changing a category's definition only affects **future** ingestion; existing rows need a re-classification script.

---

## 10. Conventions & gotchas

- **Server vs client:** page fetches on the server; interactivity in `*Content.tsx` with `'use client'`.
- **Filter values must match DB values.** Department filters match the **code** (`DSIT`), not the full name — a past bug was linking by full name and matching nothing.
- **Prisma `Date` vs `string`:** `getPolicies` casts `as unknown as Policy[]`; keep that.
- **Type-check before pushing:** `npx tsc --noEmit`. A full `npm run build` also works but locks the Prisma DLL on Windows.
- **Line endings:** the repo has mixed LF/CRLF; the `LF will be replaced by CRLF` git warnings are harmless.
- **Don't re-introduce removed dimensions** (stage, ai_application, obligations) without a deliberate reason — they were removed for accuracy, not by accident.
