# Task mp-01: the relay — rooms and the input wire (LANE-D, branch lane/perf, commit prefix "mp:")

You are Codex, implementer for Gold Rush, on Robin's Mac in worktrees/lane-d. READ FIRST: AGENTS.md; **specs/multiplayer/README.md (BINDING — the architecture + laws; the relay is DUMB by design)**; functions/ (AC-01's Pages Functions patterns — same deploy pipeline; Durable Objects need a class + binding, document the wrangler config the owner/fire applies); scripts/test-accounts.mjs (the harness pattern to mirror). Pre-flight: safe-dupe rule — judge by CONTENT (reset stale-but-merged tips; STOP only on genuinely unmerged content). npm install; build green. SEQUENCING: after the current lane-d queue.

## Scope (spec slice MP-01 — zero game code)
1. **The room Durable Object** (`functions/` + DO class): create-room (unguessable code out) · join (code + player name/town in, roster broadcast) · leave/timeout · tick-input fan-out (ordered, per-tick batching: collect all players' inputs for tick T, broadcast the bundle) · hash-exchange messages (opaque pass-through) · snapshot blob pass-through (≤ the run-suspend size budget, for resync/rejoin) · room dies 120s after empty.
2. **Message protocol doc**: `docs/api-multiplayer.md` — every message shape, versioned envelope (MP-02 builds against it exactly, the AC-01 contract-doc pattern).
3. **The headless harness**: `scripts/test-multiplayer.mjs` (node, no new deps, wrangler dev) — two fake clients: create/join, exchange 200 ticks of inputs, verify ordered identical delivery both sides, hash-exchange round-trip, one client drops + rejoins with a snapshot pull. Wire as `npm run test:mp`.
4. **Limits/safety**: 4 players/room, message size caps, rate limits per connection, no persistence beyond the room's life, CORS/origins per the AC-01 pattern. NO auth v1 (room code IS the key; accounts integration = MP-04's concern, note the seam).
5. Dev-mode + production config split per AC-01's discipline; without bindings the endpoints 503 cleanly ("riding together isn't saddled yet") and the game is unaffected.

## Firewall
Touch ONLY: functions/** (the DO + routes), the protocol doc, the harness + package.json script, artifacts. NO game src/, NO wrangler.toml beyond documented binding needs, NO secrets.

## Self-check
tsc/build (game untouched — m1-01 canary green both projects); `npm run test:mp` full-flow green under wrangler dev; the 503-unconfigured path proven; protocol doc complete; zero key material in diff. Commit on lane/perf. End: READY-FOR-GATES + the binding one-liner for the desk + the protocol doc pointer.
