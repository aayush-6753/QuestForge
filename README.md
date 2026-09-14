# Life RPG

Life RPG turns real-world tasks into RPG-style quests. This repository is the hackathon foundation: authentication, API structure, Prisma schema, protected dashboard shell, and the first server-owned profile bootstrap.

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
3. Copy the anon key into `VITE_SUPABASE_ANON_KEY` and `SUPABASE_ANON_KEY`.
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
- protected `/app` route
- TanStack Query setup
- shared API client with bearer token attachment
- Express API with security middleware
- request IDs and centralized errors
- Prisma schema, committed baseline migration, and seed foundation
- RLS-enabled gameplay tables with Supabase Data API access revoked
- local CORS support for Vite dev ports `5173` and `5174`
- idempotent `GET /api/v1/me`
- responsive RPG dashboard shell
- lint, typecheck, build, and test scripts

Not implemented yet:

- quest CRUD
- quest completion
- XP reward calculations
- level progression logic
- gold economy
- reward purchasing
- inventory equipment
- achievements
- social features
- leaderboards
- recurring quests

## Future Roadmap

1. Quest CRUD with server-side ownership checks.
2. Transactional quest completion awarding XP, gold, attributes, streak updates, and activity events.
3. Shop listing and transactional purchases.
4. Inventory and cosmetic equipment.
5. Progression history and activity timeline.
6. Deployment hardening and observability.

## Deployment Notes

Deploy the client and server separately. Set Vite variables only for public client configuration. Keep database URLs and future server-only secrets out of frontend bundles.

Deployment checklist:

1. Set frontend `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_API_BASE_URL`.
2. Set backend `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `CLIENT_ORIGINS`.
3. Run `npm run db:deploy`.
4. Run `npm run db:seed`.
5. Start the backend with `npm --workspace backend run start` after `npm run build`.
