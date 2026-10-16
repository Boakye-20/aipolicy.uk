# UK AI Policy Tracker

A web app that tracks UK AI policy documents (regulations, guidance, strategy, consultations, research, funding and international agreements) from GOV.UK, the ICO and the FCA.

A Python pipeline reads the sources, summarises each document with an LLM and writes it to Postgres. The Next.js frontend reads that database live, so new documents appear on the site without a redeploy.

**Live:** https://uk-ai-policy-tracker.vercel.app

## Pages

| Page | What it shows |
| --- | --- |
| `/` | Headline figures and recent activity |
| `/policy-explorer` | Searchable, filterable table of every document |
| `/departments` | Activity broken down by government department |
| `/topics` | Documents grouped by topic |
| `/regulations` | Regulatory documents only |
| `/analytics` | Charts of trends over time |
| `/how-it-works`, `/about`, `/privacy` | Background and policy pages |

## Running it locally

You need Node.js 18+ and a PostgreSQL database (the project uses [Neon](https://neon.tech)).

```bash
npm install
```

Create `.env` in the project root:

```bash
POSTGRES_PRISMA_URL="postgresql://...?sslmode=require"   # pooled connection
POSTGRES_URL_NON_POOLING="postgresql://...?sslmode=require"  # direct connection
```

Then set up the database and start the dev server:

```bash
npx prisma db push    # create the tables
npx prisma db seed    # optional: load starter rows
npm run dev
```

Open http://localhost:3000.

## How it works

```
GOV.UK, ICO, FCA  ->  weekly job  ->  AI filter  ->  gpt-4o-mini  ->  Postgres  ->  website
```

1. **Collect.** Every Monday at 06:00 UTC a GitHub Actions job runs `ingestion/extract.py`.
   It looks for documents published since the last run from:
   - GOV.UK: DSIT, DBT, Cabinet Office, Home Office, Treasury, DHSC, DfE, CMA and FCA,
     plus a separate sweep for their consultations.
   - The ICO: news pages and its own consultations (read from its sitemap).
   - The FCA site (read directly from its sitemap).
2. **Filter.** A document is kept only if it mentions AI. A hit in the title or summary is
   enough. A hit only in the body needs at least 3 clear mentions, and "automated
   decision" on its own never counts. Titles containing "privacy notice" or
   "personal information charter" are skipped.
3. **Label.** The full text goes to `gpt-4o-mini`, which must fill in a fixed form:
   policy type, sector, a two-sentence summary, any obligations with the exact quote
   they came from, and an `ai_focus` score from 1 to 10 for how much the document is
   actually about AI.
4. **Save.** Each document becomes a row in the `Policy` table, keyed by its URL so
   nothing is stored twice. See [The review gate](#the-review-gate) for which rows the
   site shows. A final step marks open consultations as closed once their deadline passes.
5. **Display.** The Next.js app on Vercel reads live rows published since 1 January 2025
   through Prisma. Pages rebuild from the database at most once an hour.

The Regulations page shows rows labelled "Regulation & Compliance", minus news,
speeches and transparency records. Above the table is a hand-written "Law in force"
list (`components/StatutoryBaseline.tsx`). It is not produced by the pipeline, so update
it when new AI law is made or commenced.

Known gaps: Ofcom is not covered (its site blocks automated access), the FCA source
currently finds nothing, and the labels come from a model, so some will be wrong.

## Updating the data

The pipeline lives in `ingestion/`. It fetches documents, classifies them with
`gpt-4o-mini`, and writes them to Postgres.

```bash
cd ingestion
pip install -r requirements.txt
cp .env.example .env     # add OPENAI_API_KEY and DATABASE_URL
python extract.py                   # default: last 7 days
python extract.py --days 30         # a longer window
python extract.py --since 2026-01-01
```
`DATABASE_URL` here must be the **direct** Neon connection, not the pooler, because the
pipeline is a batch job that holds one connection and commits repeatedly.

This also runs automatically: `.github/workflows/etl.yml` runs it every Monday at
06:00 UTC, and you can trigger it by hand from the Actions tab. It needs the
`OPENAI_API_KEY` and `DATABASE_URL` repository secrets.

The same workflow has a `mode` input for cleaning up existing rows with
`ingestion/requalify.py`, which re-scores them with the current filter:
`requalify-dry-run` prints what would change, `requalify` applies it (and saves an
undo snapshot as a run artifact), and `requalify-revert` restores it (give the
`revert_run_id` of the run to undo).

## The review gate

Every row has a `status`:

- `live`: the summary is backed by a verbatim quote from the source, so the site shows it.
- `review`: the pipeline claimed obligations it could not quote. Hidden from the
  site until a human reads it and sets `status = 'live'`.
- `excluded`: the model scored `ai_focus` below 6 and the title does not name AI, so
  the document is not really about AI. Hidden, but kept so it is not processed again.

The frontend only ever queries `status = 'live'`, so unverified claims can never
reach a reader by accident.

## Project layout

```
app/              Next.js App Router pages and API routes
components/       Shared UI components
lib/              Prisma client (prisma.ts), queries (data.ts), helpers
types/            TypeScript types for a policy document
schema.prisma     Database schema
prisma/seed.ts    Seed script
ingestion/        Python ETL pipeline
docs/             Developer guide
```

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Generate the Prisma client, then build |
| `npm start` | Serve the production build |
| `npm run lint` | Lint |

## More detail

- [`docs/DEVELOPER_GUIDE.md`](docs/DEVELOPER_GUIDE.md): architecture, page patterns, conventions. Read this before changing code.
- [`DEPLOY.md`](DEPLOY.md): deploying to Vercel.

## Licence

MIT
