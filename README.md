# JOBY AI — Limitless Liferecord

A Next.js 14 (App Router, TypeScript) app: a holographic daily console with a
CMS admin, curated daily analysis + tasks, and pluggable integrations for a
generated face asset and Basecamp/Slack ingestion.

## Stack

- Next.js 14 App Router, TypeScript strict mode
- Tailwind CSS (utility layout) + hand-written CSS for the holographic glow/scanline effects
- Prisma ORM — SQLite by default for local dev/build, swap to Postgres for production
- NextAuth (Credentials provider), JWT sessions, `role` (`admin`/`member`) on `User`

## What's real vs. what needs your credentials

- **Landing page, holo UI kit, scroll reveal, day console, admin CRUD**: fully working, no external services required.
- **Face generation** (`src/lib/faceGenerator.ts`): a real pluggable HTTP client. Point `FACE_GEN_API_URL`
  at any image-generation API you run (Stability, Replicate, OpenAI Images, or your own bridge). With no
  URL configured, or on any failure, it deterministically falls back to the static abstract SVG placeholder
  at `/public/face-placeholder.svg`. **Note:** MCP tool access is agent-side only (inside a Claude session) —
  a deployed web server cannot call MCP at runtime, so there is intentionally no "live MCP connector" here.
- **Basecamp/Slack integrations** (`src/lib/integrations/`): real OAuth2 flows and API-shaped ingestion code
  (`basecamp.ts`, `slack.ts`, `sync.ts`). They are **inert** until you supply real OAuth app credentials in
  `.env` — calling `/api/sync/[provider]` before that will return a clear error via `SyncRunLog`, not fake data.

## Getting started

```bash
npm install
cp .env.example .env   # defaults already work for local SQLite dev
npx prisma generate
npx prisma migrate dev --name init   # already applied in this repo; re-run only if you reset the DB
npm run seed            # creates admin@joby.ai / admin-password-123 and member@joby.ai / member-password-123
npm run dev
```

Visit `http://localhost:3000`, sign in at `/signin`, and:

- as `admin@joby.ai`, visit `/admin` for the CMS (analysis + tasks CRUD, publish toggle, integration settings)
- as either user, visit `/day/<YYYY-MM-DD>` for the day console

## Build / verify

```bash
npm install
npx prisma generate
npm run build
npm run lint
```

## Production notes

- **Database**: switch `prisma/schema.prisma`'s `datasource` `provider` from `"sqlite"` to `"postgresql"`
  and point `DATABASE_URL` at a real Postgres instance, then re-run `npx prisma migrate dev` (or
  `migrate deploy` in CI/CD) to generate a Postgres-compatible migration. SQLite is a local/dev
  convenience only — it does not support concurrent writers.
- **Secrets**: `IntegrationSettings.tokenRef` is a reference/placeholder, not a raw OAuth token. Wire up
  a real encrypted secret store (KMS, Vault, etc.) and resolve it in `src/lib/integrations/sync.ts`'s
  `resolveAccessTokenFromSecretStore`.
- **Auth**: `NEXTAUTH_SECRET` must be a strong random value in production (`openssl rand -base64 32`).

## Environment variables

See `.env.example` for the full list: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`,
`FACE_GEN_API_URL`, `FACE_GEN_API_KEY`, `BASECAMP_CLIENT_ID`, `BASECAMP_CLIENT_SECRET`,
`SLACK_CLIENT_ID`, `SLACK_CLIENT_SECRET`, `SLACK_SIGNING_SECRET`.
