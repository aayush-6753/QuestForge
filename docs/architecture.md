# Life RPG Architecture Notes

Life RPG uses Supabase Auth for identity and an Express API for all gameplay state. The React client may ask Supabase for a session, but it must not directly write XP, gold, levels, streaks, inventory, rewards, or character attributes.

## Request Flow

1. React signs in with Supabase Auth.
2. React calls the Express API through the shared API client.
3. The API client attaches the Supabase access token as `Authorization: Bearer <token>`.
4. Express validates the token with Supabase.
5. Express uses the verified Supabase user UUID as the only trusted user identity.
6. Prisma reads and writes gameplay state in PostgreSQL.

## Security Invariants

- Backend determines authenticated user.
- Never trust `userId` from request bodies or query strings.
- XP, gold, level, streak, reward price, inventory, and quest completion changes are server controlled.
- Purchases and quest completions must become transactional when implemented.
- PostgreSQL is the primary state store.
- `localStorage` is only acceptable for client session mechanics handled by Supabase, not gameplay persistence.
- Frontend bundles must never include service-role credentials.

## Current Gameplay Surface

Only `GET /api/v1/me` touches gameplay data. It bootstraps a profile, character, and five attribute rows idempotently for the verified user.
