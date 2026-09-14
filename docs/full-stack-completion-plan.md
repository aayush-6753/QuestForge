# Life RPG Full-Stack Completion Plan

This plan extends the original backend roadmap into one delivery sequence for the React frontend, Express API, Prisma, PostgreSQL, and Supabase Auth.

## Product Architecture

```text
React + Supabase Auth
        |
        | Bearer access token
        v
Express API
        |
        | authenticated user ID and server-owned game rules
        v
Prisma + PostgreSQL
```

The frontend owns presentation, forms, navigation, and request state. The backend owns identity-derived authorization, reward values, XP, levels, streaks, gold, inventory, quest status, and all gameplay mutations.

## Locked Decisions

- Node.js 22 or newer.
- Render is the default deployment target; Docker remains optional and deferred.
- Supabase owns authentication. No custom password or token tables.
- Gameplay data never uses browser storage as its source of truth.
- Quest completion is permanent. Recurring quests and undo are deferred.
- Streak dates use each profile's validated IANA timezone, defaulting to `UTC`.
- Keep the current route and service structure. Add no controller, repository, queue, or state-management layer unless a later requirement proves it necessary.
- Keep success responses under `{ "data": ... }` and failures under `{ "error": { "code", "message", "requestId" } }`.

## Current Status

| Phase | Backend | Frontend | Overall |
|---|---|---|---|
| 0. Runtime foundation | Complete | Complete | Complete |
| 1. Database integrity | Complete | Contract aligned | Complete |
| 2. Auth and profile | Complete | Complete | Complete |
| 3. Progression and streak rules | Complete | Complete | Complete |
| 4. Quest CRUD | Complete | Complete | Complete |
| 5. Quest completion | Complete | Complete | Complete |
| 6. Activity history | Complete | Complete | Complete |
| 7. Rewards and inventory | Complete | Complete | Complete |
| 8. Hardening | Complete | Complete | Complete |
| 9. Integration and E2E tests | Complete; passed twice on clean isolated PostgreSQL | Complete; live suite passed twice on desktop and mobile | Complete |
| 10. Deployment | Blueprint complete; not deployed | Blueprint complete; not deployed | Needs Render access |
| 11. Demo and documentation | Complete | Complete | Local release rehearsal complete; public rehearsal pending deployment |

## Completed Frontend Foundation Through Phase 8

- Validated, fail-fast Vite configuration with test-only defaults.
- Supabase session provider, login, signup, logout, and protected routing.
- Confirmation-aware signup that waits for email verification when Supabase does not return a session.
- Shared API client that attaches the current bearer token and maps structured API failures.
- Query-backed `/me` loading, retry, empty, and error states.
- Editable display name and IANA timezone through authenticated `PATCH /api/v1/me`.
- Query-cache synchronization after profile updates.
- Character and attribute progress bars driven by backend progression summaries.
- Responsive dashboard shell and focused frontend tests for environment, auth, API, profile, and progression behavior.
- Query-backed quest board with active, completed, and archived filters.
- Quest creation and editing forms with due-date validation and server-authoritative reward display.
- Archive confirmation, mutation states, query retries, and status-specific empty states.
- Permanent quest completion with guarded pending states and conflict-aware cache reconciliation.
- Server-authored reward, character level, attribute level, and streak feedback after completion.
- Cursor-paged activity timeline with defensive event rendering and complete loading, retry, empty, and end states.
- Server-priced catalog, persistent inventory, affordability, purchase, equip, and unequip workflows.
- Central expired-session handling, route-level recovery, reduced-motion behavior, and mutation guards.

## Phase 0: Production Runtime Foundation

**Goal:** Both applications build, start, fail clearly on invalid configuration, and expose usable health/loading/error states.

Backend:

- Produce a clean `dist/server.js` artifact and start it with Node 22+.
- Bind to the configured host/port, disconnect Prisma cleanly, reject malformed JSON, and make health verify PostgreSQL.

Frontend:

- Validate `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_API_BASE_URL` at startup.
- Maintain the shared query client, API client, routing shell, and responsive base layout.
- Show deterministic loading and API failure states instead of blank screens.

Exit gate: clean install, lint, typecheck, tests, production builds, backend start, frontend preview, and database-aware health all succeed.

## Phase 1: Database Integrity and Client Contracts

**Goal:** Invalid ownership and duplicate completion states are rejected below the service layer, while the frontend remains isolated from direct gameplay-table access.

Backend:

- Enforce one completion per quest, quest/completion owner agreement, completion status/timestamp consistency, streak bounds, and nonblank quest titles.
- Keep foreign-key indexes and RLS/Data API restrictions reviewed and migrated.

Frontend:

- Keep TypeScript API types aligned with public response DTOs, not Prisma models.
- Do not add direct Supabase gameplay queries or expose database credentials.
- Handle future conflict and validation responses through the shared API error shape.

Exit gate: migrations apply from clean and existing databases; constraint tests pass; no frontend module accesses gameplay tables directly.

## Phase 2: Authentication and Profile Completion

**Goal:** A Supabase user can authenticate, bootstrap one stable character foundation, and manage personal profile settings.

Backend:

- Verify bearer tokens with Supabase and derive all ownership from the verified user ID.
- Keep `GET /api/v1/me` idempotent.
- Validate and persist nullable display names and IANA timezones through `PATCH /api/v1/me`.
- Cover missing, malformed, expired, and invalid tokens.

Frontend:

- Maintain session state and protected redirects.
- Support login, logout, signup, auth errors, and email-confirmation signup.
- Edit display name and timezone using the authenticated API.
- Refresh the shared profile cache after a successful mutation and preserve actionable server errors.

Exit gate: one real signup/login token succeeds against `/me`; unauthenticated calls return 401; two `/me` calls still leave one profile, character, and five attributes; profile changes survive refresh and relogin.

## Phase 3: Progression and Streak Presentation

**Goal:** The backend is the single source of game calculations and the frontend presents those results consistently.

Backend:

- Keep pure reward, category mapping, nonlinear level, progress-summary, timezone, and streak functions.
- Include character and per-attribute progression summaries in `/me`.
- Test exact thresholds, multi-level totals, same-day activity, gaps, DST boundaries, and timezone changes.

Frontend:

- Render character and attribute level progress from API summaries.
- Never reproduce threshold, reward, streak, or level formulas in React.
- Provide accessible progress semantics and stable loading/error behavior on mobile and desktop.

Exit gate: backend rule tests and frontend contract/component tests pass; displayed progress comes only from API-provided summaries.

## Phase 4: Quest CRUD

**Goal:** Users can create, inspect, edit, filter, and archive their own one-time quests.

Backend:

- Add strict owned CRUD routes under `/api/v1/quests`.
- Accept only title, description, category, difficulty, and due date intent fields.
- Derive reward snapshots and target attributes on the server.
- Permit edits only while active and archive instead of hard-delete.

Frontend:

- Replace the quest placeholder with a query-backed board.
- Add create/edit forms with shared client validation matching public constraints.
- Provide active/completed/archived filters, due dates, empty states, retry, and mutation-pending controls.
- Keep server responses authoritative after every mutation.

Exit gate: owned CRUD persists after restart; foreign resources appear as 404; the UI supports the complete workflow without accepting authoritative reward fields.

## Phase 5: Transactional Quest Completion

**Goal:** One action completes a quest and atomically awards all progression.

Backend:

- Add `POST /api/v1/quests/:questId/complete`.
- Lock and update quest, character, attribute, streak, completion snapshot, and activity events in one short transaction.
- Guarantee exactly-once rewards under retries and concurrent requests.

Frontend:

- Add completion controls with pending and disabled states.
- Show awarded XP, gold, attribute XP, streak changes, and level gains from the completion response.
- Invalidate or update quest, profile, and activity caches together.
- Render duplicate/already-completed conflicts without losing the server's latest state.

Exit gate: parallel completion proves only one reward grant; UI state and PostgreSQL remain identical after refresh and relogin.

## Phase 6: Activity History

**Goal:** Users can inspect a persistent, private timeline of important events.

Backend:

- Add bounded newest-first activity reads with stable, non-sensitive metadata.
- Record creation, archive, completion, level, streak, purchase, and equipment events where applicable.

Frontend:

- Replace the activity placeholder with a paged or incremental timeline.
- Add empty, loading, retry, and end-of-history states.
- Render event types defensively so older metadata remains readable.

Exit gate: activity is user-scoped, ordered, persistent, and usable on mobile and desktop.

## Phase 7: Rewards, Currency, and Inventory

**Goal:** Earned gold can buy and equip persistent cosmetic rewards.

Backend:

- Add catalog, inventory, purchase, equip, and unequip endpoints.
- Keep price and balance server-owned; make purchase and equipment replacement atomic.
- Seed a small idempotent demo catalog.

Frontend:

- Replace the shop placeholder with catalog and inventory views.
- Show price, ownership, equipped state, affordability, and mutation progress.
- Update gold, inventory, and activity caches after purchases or equipment changes.

Exit gate: users can earn, purchase, equip, refresh, and retain state without duplicate charges or cross-user access.

## Phase 8: Error, Security, Accessibility, and Logging Hardening

**Goal:** The complete product fails consistently, reveals no secrets, and remains operable.

Backend:

- Normalize 400, 401, 404, 409, 429, 500, and 503 responses.
- Audit strict schemas, ownership predicates, CORS, proxy trust, request IDs, and redacted logs.

Frontend:

- Centralize session-expiry handling and user-safe API messages.
- Add route-level recovery, keyboard/focus checks, accessible names, contrast review, and reduced-motion support.
- Prevent duplicate submissions and layout shifts across all mutation states.

Exit gate: documented failure paths are deterministic, keyboard workflows work, and logs/bundles contain no credentials or personal request bodies.

## Phase 9: Integration and End-to-End Tests

**Goal:** Prove ownership, atomicity, persistence, and user workflows against a separate PostgreSQL database.

Backend:

- Add opt-in real-database tests for two users, migrations, rollback, constraints, and concurrent completion/purchase.
- Refuse to run integration cleanup against the production database URL.

Frontend:

- Add browser tests for signup/login, profile update, quest CRUD, completion, activity, purchase, refresh, and relogin.
- Exercise mobile and desktop viewports and inspect the browser console for runtime errors.

Exit gate: the full suite passes twice from a clean isolated database.

## Phase 10: Deployment

**Goal:** Publish reproducible frontend and backend releases without Docker.

Backend:

- Deploy the Node service on Render with Node 22+, `/api/health`, Supabase pooler configuration, manual migration gate, and production CORS.

Frontend:

- Deploy the Vite static build with the public Supabase URL/key and public API URL.
- Configure SPA fallback routing and add the deployed frontend URL to backend CORS and Supabase redirect URLs.

Exit gate: the public app passes health, auth, profile, quest, completion, refresh, and restart smoke tests.

## Phase 11: Demo and Documentation Hardening

**Goal:** Freeze a reproducible release another developer can run and judges can evaluate.

Backend:

- Document endpoints, requests, responses, errors, migrations, seed behavior, and deployment procedure.

Frontend:

- Document environment setup and the demo workflow.
- Rehearse the complete experience at mobile and desktop sizes, including email confirmation and cold starts.

Exit gate: a clean clone can be configured, migrated, built, and demonstrated from the repository documentation alone.

## Minimum End-to-End Slice

```text
Signup or login
-> GET /api/v1/me
-> edit profile and timezone
-> POST /api/v1/quests
-> GET /api/v1/quests
-> complete the quest once
-> render XP, level, attribute, gold, streak, and activity changes
-> refresh and relogin
-> confirm identical PostgreSQL-backed state
```

The core vertical slice is complete after Phase 5. The hackathon base is complete after Phase 11.

## Next Phase

Release verification: run the isolated database suite, run Playwright with a confirmed test account, create the Render Blueprint, and execute the deployed smoke test and demo rehearsal.
