# Deployment Checklist

## Before first deploy

- [ ] Switch `prisma/schema.prisma` datasource `provider` to `"postgresql"`
- [ ] Provision a Postgres database and set `DATABASE_URL` accordingly
- [ ] Run `npx prisma migrate deploy` against the production database
- [ ] Generate a strong `NEXTAUTH_SECRET` (`openssl rand -base64 32`) and set it in the host's env config
- [ ] Set `NEXTAUTH_URL` to the production origin (e.g. `https://liferecord.example.com`)
- [ ] Create at least one real admin user (via `prisma/seed.ts` adapted for prod, or a one-off script) —
      do not ship the default seeded `admin-password-123` credential to production
- [ ] Confirm `npm run build` succeeds against the production env vars

## Face generation

- [ ] Decide on a real image-generation backend (Stability, Replicate, OpenAI Images, or your own bridge)
- [ ] Set `FACE_GEN_API_URL` and `FACE_GEN_API_KEY`
- [ ] Confirm the endpoint returns `{ url, id?, checksum? }` JSON, or adapt `src/lib/faceGenerator.ts`'s
      response parsing to match your provider
- [ ] Verify the placeholder fallback (`/public/face-placeholder.svg`) still renders correctly if the
      endpoint is unreachable — this is the expected degraded state, not a bug

## Basecamp integration

- [ ] Register an app at https://launchpad.37signals.com/integrations
- [ ] Set `BASECAMP_CLIENT_ID` / `BASECAMP_CLIENT_SECRET`
- [ ] Implement the OAuth callback route (redirect URI matching your registered app) that calls
      `exchangeBasecampCode` in `src/lib/integrations/basecamp.ts`
- [ ] Implement real secret storage and wire it into `resolveAccessTokenFromSecretStore` in
      `src/lib/integrations/sync.ts`
- [ ] Configure project ID → date-tagging mapping in `/admin` → Integration Settings
- [ ] Run a manual sync (`POST /api/sync/basecamp`) and confirm `SyncRunLog` shows `success`

## Slack integration

- [ ] Register a Slack app at https://api.slack.com/apps
- [ ] Set `SLACK_CLIENT_ID` / `SLACK_CLIENT_SECRET` / `SLACK_SIGNING_SECRET`
- [ ] Implement the OAuth callback route that calls `exchangeSlackCode` in `src/lib/integrations/slack.ts`
- [ ] If accepting inbound Slack events/webhooks, verify every request with `verifySlackSignature`
      before trusting the payload
- [ ] Implement real secret storage and wire it into `resolveAccessTokenFromSecretStore`
- [ ] Configure channel ID → date-tagging mapping in `/admin` → Integration Settings
- [ ] Run a manual sync (`POST /api/sync/slack`) and confirm `SyncRunLog` shows `success`

## Security

- [ ] Confirm every mutating API route checks `session.user.role === "admin"` server-side
      (already implemented in `src/app/api/**/route.ts` — re-verify after any edits)
- [ ] Confirm `middleware.ts` correctly redirects non-admins away from `/admin`
- [ ] Rotate `NEXTAUTH_SECRET` and all provider client secrets if they were ever committed or shared
- [ ] Confirm `.env` is gitignored and only `.env.example` (no real secrets) is committed

## Observability

- [ ] Set up log shipping / error tracking for the Next.js server (route handler errors, sync failures)
- [ ] Alert on repeated `SyncRunLog.status = "error"` rows for basecamp/slack
