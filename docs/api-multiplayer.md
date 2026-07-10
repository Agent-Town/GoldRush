# Gold Rush Multiplayer Relay API

Multiplayer v1 is a dumb input relay. Clients run the deterministic sim; the relay only owns room membership, ordered input fan-out, hash pass-through, and the latest resync snapshot.

Cloudflare Pages Functions expose:

- `POST /api/multiplayer/create`
- `GET /api/multiplayer/connect?code=<roomCode>` with `Upgrade: websocket`

Without the Durable Object binding, both endpoints return:

```json
{ "ok": false, "error": "multiplayer_not_enabled", "message": "riding together isn't saddled yet" }
```

With multiplayer enabled, both endpoints also require a `MULTIPLAYER_RATE_LIMITS` KV binding for fixed-window abuse counters. Public limits are intentionally generous for real players:

- room create: 10 rooms per IP per hour
- room connect attempts: 30 attempts per IP per hour

When a limit trips, the route returns:

```json
{ "ok": false, "error": "rate_limited", "message": "The wire is busy. Try again later." }
```

## Binding

Pages cannot create and deploy a Durable Object class inside the Pages project; bind a companion Worker exporting `MultiplayerRoom` to the Pages project as `MULTIPLAYER_ROOMS`.

Local harness shape:

```sh
wrangler dev functions/api/_multiplayer.ts --name gold-rush-mp-room
wrangler pages dev public --do MULTIPLAYER_ROOMS=MultiplayerRoom@gold-rush-mp-room --kv MULTIPLAYER_RATE_LIMITS
```

Production Wrangler config shape for the owner/fire to apply:

```toml
[[durable_objects.bindings]]
name = "MULTIPLAYER_ROOMS"
class_name = "MultiplayerRoom"
script_name = "gold-rush-mp-room"

[[kv_namespaces]]
binding = "MULTIPLAYER_RATE_LIMITS"
id = "<kv namespace id>"
```

The companion Worker needs the class migration:

```toml
name = "gold-rush-mp-room"
main = "functions/api/_multiplayer.ts"
compatibility_date = "2026-07-08"

[[durable_objects.bindings]]
name = "MULTIPLAYER_ROOMS"
class_name = "MultiplayerRoom"

[[migrations]]
tag = "mp-01"
new_sqlite_classes = ["MultiplayerRoom"]
```

No secrets are used. No account auth in MP-01; the room code is the key. Account/session ownership is the MP-04 seam.

## CORS

HTTP routes allow:

- `https://gold-rush-3in.pages.dev`
- `https://agenttown.app`
- `https://www.agenttown.app`
- `http://localhost:*`
- `http://127.0.0.1:*`

WebSocket connects use the same Origin allowlist. Missing Origin is allowed for the Node harness.

## Room Code

`POST /api/multiplayer/create`

Request body: `{}`.

Response:

```json
{
  "ok": true,
  "v": 1,
  "type": "room-created",
  "code": "24 uppercase hex chars",
  "maxPlayers": 4,
  "emptyTtlMs": 120000
}
```

Room codes are 96-bit random values. The room lives only in the Durable Object's memory and is cleared 120 seconds after creation if nobody joins, or 120 seconds after the last player leaves.

## WebSocket Envelope

Every WebSocket message is JSON:

```json
{ "v": 1, "type": "message-type" }
```

General message cap: 220KB. Snapshot payload cap: 200KB. Per-connection rate limit: 600 messages per 10 seconds.

## Client Messages

### `join`

First message after the socket opens. Sockets that do not send `join` within 10 seconds are closed.

```json
{
  "v": 1,
  "type": "join",
  "code": "24 uppercase hex chars",
  "player": { "name": "Robin", "town": "Dawn Claim" }
}
```

Names are trimmed and capped at 24 chars; town names at 32 chars. A room holds at most 4 players.

### `input`

Opaque lockstep input for one tick.

```json
{ "v": 1, "type": "input", "tick": 42, "input": { "up": true, "tool": "pan" } }
```

The relay batches by tick. It broadcasts tick `T` only after every currently connected player has submitted input for `T`, and it never broadcasts tick `T+1` before `T`.

### `hash`

Opaque determinism hash pass-through to other players.

```json
{ "v": 1, "type": "hash", "tick": 120, "hash": "fnv1a32:598dff4d", "payload": {} }
```

### `snapshot-push`

Stores the latest resync/rejoin snapshot in memory and notifies other players.

```json
{ "v": 1, "type": "snapshot-push", "tick": 180, "snapshot": { "kind": "run-suspend", "v": 1 } }
```

### `snapshot-request`

Requests the latest stored snapshot.

```json
{ "v": 1, "type": "snapshot-request" }
```

### `ping`

```json
{ "v": 1, "type": "ping" }
```

## Server Messages

### `joined`

Sent only to the joining socket.

```json
{
  "v": 1,
  "type": "joined",
  "code": "24 uppercase hex chars",
  "playerId": "p1",
  "maxPlayers": 4,
  "roster": [{ "playerId": "p1", "name": "Robin", "town": "Dawn Claim" }]
}
```

### `roster`

Broadcast after joins, leaves, and timeouts.

```json
{
  "v": 1,
  "type": "roster",
  "code": "24 uppercase hex chars",
  "maxPlayers": 4,
  "players": [{ "playerId": "p1", "name": "Robin", "town": "Dawn Claim" }]
}
```

### `tick-inputs`

Broadcast to all players in roster order.

```json
{
  "v": 1,
  "type": "tick-inputs",
  "tick": 42,
  "inputs": [
    { "playerId": "p1", "input": { "up": true } },
    { "playerId": "p2", "input": { "down": true } }
  ]
}
```

### `hash`

Forwarded to every other player.

```json
{ "v": 1, "type": "hash", "from": "p1", "tick": 120, "hash": "fnv1a32:598dff4d", "payload": {} }
```

### `snapshot-available`

Sent to other players after a snapshot push.

```json
{ "v": 1, "type": "snapshot-available", "from": "p1", "tick": 180, "byteLength": 1024 }
```

### `snapshot`

Sent to the requesting player.

```json
{
  "v": 1,
  "type": "snapshot",
  "from": "p1",
  "tick": 180,
  "byteLength": 1024,
  "createdAt": "2026-07-09T00:00:00.000Z",
  "snapshot": { "kind": "run-suspend", "v": 1 }
}
```

If no snapshot exists:

```json
{ "v": 1, "type": "snapshot-missing" }
```

### `pong`

```json
{ "v": 1, "type": "pong", "now": 1760000000000 }
```

### `error`

```json
{ "v": 1, "type": "error", "error": "bad_tick" }
```

Protocol errors close the socket with policy-violation code `1008`.
