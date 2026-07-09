# Task tl-02-stats-read: `GET /api/stats` — the Assay Office's public aggregate read (lane-a; commit prefix "feat:")
FROM `specs/accounts/README.md` §TELEMETRY TL-02 (owner orders 2026-07-09; TL-01 ingest SHIPPED, KV binding LIVE per the cleared gate; TL-03a site section SHIPPED s261 and currently renders its empty state — this endpoint is what makes it tick).
You are Codex in worktrees/lane-a. Pre-flight per LANE-SAFETY. READ FIRST: `functions/api/telemetry.ts` (TL-01's ingest + KV aggregate shapes) · `specs/accounts/README.md` §TELEMETRY (TL-02 paragraph = the contract) · `site/index.html` Assay Office section (what fields it wants) · MP-01's worker-test pattern (`scripts/test-multiplayer.mjs`) for the harness shape.

## Scope
1. **`functions/api/stats.ts` — GET only, AGGREGATES ONLY:** runs assayed (today / 7 days / all-time), deepest wave, median duration, busiest contract, tier split, frame-p95 by device class — computed from TL-01's KV tallies. NEVER serves single-run rows (safe-by-construction stays true).
2. **Cache:** `Cache-Control: public, max-age=60` + edge-cache friendly (the site polls ~60s).
3. **Empty state:** zero data → `{ ok: true, empty: true }` (the site's "the office opens with the first assay" line keys off it).
4. **CORS:** same-origin + agenttown.app origins only (reuse the accounts helper).
5. **Harness:** a node script (MP-01 pattern) that seeds fake tallies into wrangler-dev KV, GETs /api/stats, asserts shape + aggregation math + the empty state. Runs green via `wrangler pages dev` locally.

## Firewall
Touch ONLY: `functions/api/stats.ts`, the harness script, `docs/api-multiplayer.md`-style contract note (new `docs/api-stats.md`), its LEDGER/BACKLOG line. **NO client/src changes (TL-03 in-game window is a separate slice), NO ingest changes, NO site edits.**

## Self-check
tsc/build green · harness green locally (paste its output) · zero identifiers anywhere in responses (assert in harness: no email/profile/nonce fields escape).
End: **READY-FOR-GATES** + the harness output + the contract doc.
