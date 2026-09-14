# Life RPG API

Base path: `/api`. Successful responses use `{ "data": ... }`. Errors use
`{ "error": { "code", "message", "requestId" } }`. Every `/api/v1` endpoint requires
`Authorization: Bearer <supabase-access-token>`.

## Health

### `GET /api/health`

Checks the API and PostgreSQL connection. Returns `200` with
`{ "data": { "status": "ok", "database": "ok" } }`, or `503 SERVICE_UNAVAILABLE`.

## Profile

### `GET /api/v1/me`

Idempotently creates and returns the authenticated profile, character, five attributes, and backend-computed progression summaries.

### `PATCH /api/v1/me`

Accepts a strict object containing at least one field:

```json
{ "displayName": "Aayush", "timezone": "Asia/Kolkata" }
```

`displayName` can be `null`; `timezone` must be a valid IANA timezone.

## Quests

### `GET /api/v1/quests?status=ACTIVE`

Lists owned quests. `status` is optional and supports `ACTIVE`, `COMPLETED`, and `ARCHIVED`.

### `POST /api/v1/quests`

```json
{
  "title": "Read a chapter",
  "description": "Optional",
  "category": "LEARNING",
  "difficulty": "MEDIUM",
  "dueAt": "2026-10-01T12:00:00.000Z"
}
```

Categories: `FITNESS`, `LEARNING`, `WORK`, `CREATIVE`, `WELLNESS`, `PERSONAL`.
Difficulties: `EASY`, `MEDIUM`, `HARD`, `EPIC`. Rewards and target attributes are derived by the backend.

### `GET /api/v1/quests/:questId`

Returns one owned quest. Missing and foreign quests both return `404 QUEST_NOT_FOUND`.

### `PATCH /api/v1/quests/:questId`

Updates one or more intent fields from the create body. Only active quests are editable.

### `DELETE /api/v1/quests/:questId`

Archives an active quest. Quests are never hard-deleted through the API.

### `POST /api/v1/quests/:questId/complete`

Accepts no body fields. Permanently completes an active quest and atomically returns the completion snapshot, awarded XP/gold/attribute XP, levels, and streak transition.

## Activity

### `GET /api/v1/activity?limit=20&cursor=<event-id>`

Returns a newest-first private page:

```json
{ "data": { "items": [], "nextCursor": null } }
```

`limit` is between 1 and 50. Pass `nextCursor` to load older events.

## Rewards And Inventory

### `GET /api/v1/rewards`

Lists the active server-priced catalog.

### `POST /api/v1/rewards/:rewardId/purchase`

Accepts no body fields. Atomically deducts the catalog price and creates one inventory item. Returns `409 INSUFFICIENT_GOLD` or `409 REWARD_ALREADY_OWNED` where applicable.

### `GET /api/v1/inventory`

Lists owned inventory with reward details and equipment state.

### `POST /api/v1/inventory/:inventoryItemId/equip`

Equips an owned reward and replaces an equipped reward of the same type atomically.

### `POST /api/v1/inventory/:inventoryItemId/unequip`

Unequips an owned reward. Both equipment endpoints accept no body fields.

## Errors

The public statuses are `400`, `401`, `404`, `409`, `429`, `500`, and `503`.
Validation is strict: unknown fields, malformed UUIDs, invalid enums, and client-authored reward values are rejected.
