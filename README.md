# Life RPG

Life RPG turns real-world tasks into RPG-style quests. This repository contains the hackathon foundation: authentication, API structure, Prisma schema, profile management, protected dashboard shell, and server-owned progression summaries.

## Problem

Habit and task tools often feel like plain checklists. They rarely make progress feel meaningful, personal, or game-like.

## Solution

Life RPG maps everyday effort into a character progression loop: quests, XP, gold, levels, streaks, attributes, rewards, inventory, and activity history.

## Core Idea

The frontend can authenticate users, but the backend owns gameplay state. XP, gold, levels, streaks, rewards, inventory, and quest completions must be calculated or mutated through Express and PostgreSQL.

## Tech Stack

- React, Vite, TypeScript
- React Router, TanStack Query, React Hook Form, Zod
- Tailwind CSS, Framer Motion
- Supabase Auth
- Node.js, Express, TypeScript
- Prisma ORM, PostgreSQL
- Helmet, CORS, express-rate-limit
- Vitest, Supertest, ESLint

## Architecture

```text
React
  -> Supabase Auth
  -> Express API with Bearer JWT
  -> Prisma
  -> PostgreSQL
```

React talks directly to Supabase only for authentication. All gameplay-related database mutations must go through the API.

## Repository Structure

```text
life-rpg/
  frontend/ React app
  backend/  Express API and Prisma schema
  docs/     architecture notes
```

## Prerequisites

- Node.js 22+
- npm 10+
- PostgreSQL database, preferably Supabase PostgreSQL
- Supabase project for Auth

## Local Setup

```bash
npm install
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Fill the environment variables, then run:

```bash
npm run db:generate
npm run db:migrate
npm run dev
```

## Supabase Setup

1. Create a Supabase project.
2. Copy the project URL into `VITE_SUPABASE_URL` and `SUPABASE_URL`.
3. Copy the publishable key, or legacy anon key, into `VITE_SUPABASE_ANON_KEY` and `SUPABASE_ANON_KEY`.
4. Configure Email auth in Supabase Auth.
5. Use the Supabase Postgres connection strings for `DATABASE_URL` and `DIRECT_URL`.
6. Do not add a Supabase service-role key unless a future server-only feature truly needs it.

## Environment Variables

Frontend, in `frontend/.env`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL`

Backend, in `backend/.env`:

- `NODE_ENV`
- `PORT`
- `DATABASE_URL`
- `DIRECT_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `CLIENT_ORIGINS` comma-separated allowed frontend origins

## Database Migration

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

For hosted or shared databases, apply committed migrations with:

```bash
npm run db:deploy
```

## Running Locally

```bash
npm run dev
```

Client: `http://localhost:5173`

API health: `http://localhost:3001/api/health`

## Available Scripts

- `npm run dev`
- `npm run dev:frontend`
- `npm run dev:backend`
- `npm run build`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:deploy`
- `npm run db:seed`

## API Overview

- `GET /api/health` verifies PostgreSQL and returns `{ "data": { "status": "ok", "database": "ok" } }`.
- `GET /api/v1/me` requires a Supabase bearer token. It idempotently creates and returns the user foundation with character and attribute progression summaries.
- `PATCH /api/v1/me` updates the authenticated user's nullable display name and IANA timezone.
- `GET /api/v1/quests` lists owned quests and optionally filters by `ACTIVE`, `COMPLETED`, or `ARCHIVED` status.
- `POST /api/v1/quests` creates a one-time quest with server-derived XP, gold, and target attribute.
- `GET /api/v1/quests/:questId` returns one owned quest.
- `PATCH /api/v1/quests/:questId` updates editable fields on an active owned quest and recalculates authoritative values.
- `DELETE /api/v1/quests/:questId` archives an active owned quest.
- `POST /api/v1/quests/:questId/complete` permanently completes an active owned quest and atomically awards XP, gold, attribute XP, levels, streak progress, and activity events.

Errors use:

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing bearer token.",
    "requestId": "..."
  }
}
```

## Security Architecture

The API validates Supabase JWTs and derives the user ID from the verified token. It does not trust `req.body.userId` or `req.query.userId`. Gameplay systems must remain server-authoritative and transactional as they are added.

## Current Implementation Status

Implemented:

- npm workspace foundation
- React app shell
- Supabase Auth provider
- login/signup UI
- email-confirmation-aware signup
- protected `/app` route
- TanStack Query setup
- shared API client with bearer token attachment
- Express API with security middleware
- request IDs and centralized errors
- Prisma schema, committed baseline migration, and seed foundation
- RLS-enabled gameplay tables with Supabase Data API access revoked
- local CORS support for Vite dev ports `5173` and `5174`
- idempotent `GET /api/v1/me`
- profile and timezone updates through `PATCH /api/v1/me`
- nonlinear character and attribute progression summaries
- timezone-aware streak rules
- backend-driven character and attribute XP displays
- owned one-time quest CRUD with strict intent-only validation
- server-derived quest XP, gold, and target attributes
- query-backed quest board with create, edit, filter, retry, and archive workflows
- atomic quest creation/archive activity events
- exactly-once transactional quest completion with row locking and rollback protection
- completion reward, level-up, attribute, and streak feedback in the quest board
- responsive RPG dashboard shell
- frontend environment, auth, API, profile, and progression tests
- lint, typecheck, build, and test scripts

Not implemented yet:

- gold economy
- reward purchasing
- inventory equipment
- achievements
- social features
- leaderboards
- recurring quests

## Future Roadmap

The detailed backend and frontend execution plan is in [docs/full-stack-completion-plan.md](docs/full-stack-completion-plan.md).

1. Progression history and activity timeline.
2. Shop listing and transactional purchases.
3. Inventory and cosmetic equipment.
4. Deployment hardening and observability.

## Deployment Notes

Deploy the client and server separately. Set Vite variables only for public client configuration. Keep database URLs and future server-only secrets out of frontend bundles.

Deployment checklist:

1. Set frontend `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_API_BASE_URL`.
2. Set backend `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `CLIENT_ORIGINS`.
3. Run `npm run db:deploy`.
4. Run `npm run db:seed`.
5. Start the backend with `npm --workspace backend run start` after `npm run build`.
