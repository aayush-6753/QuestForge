# Testing And Deployment

## Local Verification

```bash
npm ci
npm run db:generate
npm run db:deploy
npm run db:seed
npm run lint
npm run typecheck
npm test
npm run build
```

Run the app with `npm run dev`. The frontend defaults to `http://localhost:5173`; the API and database-aware health check are at `http://localhost:3001/api/health`.

## Isolated Database Tests

Create a separate PostgreSQL database whose name contains `test`, then set `INTEGRATION_DATABASE_URL` and optionally `INTEGRATION_DIRECT_URL` in `backend/.env` or the shell.

```bash
npm run test:integration
```

The runner refuses the normal `DATABASE_URL` and refuses non-local databases without `test` in the database name. For plain PostgreSQL it creates the same non-login `anon` and `authenticated` roles that Supabase supplies, applies committed migrations, then tests ownership, constraints, rollback behavior, completion concurrency, purchase concurrency, persistence, activity, and equipment. The database user therefore needs permission to create those roles when they are absent.

## Browser Tests

Create a confirmed Supabase test account and seed the catalog. Set `E2E_EMAIL` and `E2E_PASSWORD` in the shell, then run:

```bash
npx playwright install chromium
npm run test:e2e
```

The journey runs in desktop and mobile Chromium, checks profile editing, quest creation/completion, activity, purchase/equipment, refresh, relogin, and browser console errors.

The live suite was verified twice against the configured Supabase project on September 14, 2026. Its temporary auto-confirmed Auth user and associated gameplay data were removed after the run.

The same suite also passed against the compiled Express server and Vite production preview on desktop and mobile. This verifies the release artifacts locally; the public Render smoke test still requires a deployed Blueprint.

## Render Release

`render.yaml` defines a Node web service and Vite static site without Docker. Create a Render Blueprint from the repository and enter every `sync: false` value.

Backend values:

- `DATABASE_URL`: Supabase transaction/session pooler URL for Prisma runtime traffic.
- `DIRECT_URL`: direct or session-mode URL used by migrations.
- `SUPABASE_URL` and `SUPABASE_ANON_KEY`: the same project used by the frontend.
- `CLIENT_ORIGINS`: exact deployed frontend origin, without a trailing slash.

Frontend values:

- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`: public Supabase configuration.
- `VITE_API_BASE_URL`: deployed backend origin, without a trailing slash.

Before each manual backend deployment:

```bash
npm ci
npm run db:generate
npm run db:deploy
npm run db:seed
npm test
npm run build
```

After the frontend URL exists, add it to Supabase Auth redirect URLs and to backend `CLIENT_ORIGINS`. Deploy the backend, verify `/api/health`, deploy the frontend, then run `E2E_BASE_URL=https://<frontend-host> npm run test:e2e`.

## Demo Runbook

1. Sign up or sign in with a confirmed account.
2. Set the adventurer name and timezone.
3. Create an Epic quest and show its server-authored rewards.
4. Complete it and show XP, gold, attribute, level, and streak feedback.
5. Open the chronicle and show the persisted events.
6. Buy and equip a reward in the Guild Shop.
7. Refresh, sign out, sign back in, and show that quest, progression, activity, gold, and equipment remain unchanged.

For cold starts, open the API health URL first and wait for `database: "ok"` before beginning the demo.
