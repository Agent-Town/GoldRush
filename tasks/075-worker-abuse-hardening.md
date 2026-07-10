# Task 075-worker-abuse-hardening: rate limits + input allowlists on the public workers (lane-a; commit prefix "fix:")
CODEX: model=gpt-5.6-sol effort=medium
FROM swarm findings [high+medium] `reviews/swarm-48h-confirmed.json`: telemetry ingest (`functions/api/telemetry.ts:41`) has NO rate limit and aggregates ATTACKER-CHOSEN contract keys (one curl loop pollutes the public Assay Office stats — "busiest contract: xxx-garbage"); multiplayer create/connect (`functions/api/_multiplayer.ts:51`) has no rate limit either (Origin is the only gate).
You are Codex in worktrees/lane-a. Pre-flight per LANE-SAFETY. READ FIRST: both findings' evidence entries, the accounts worker's EXISTING per-IP KV rate-limit pattern (`functions/api/_accounts.ts` — reuse it, don't invent), `docs/api-stats.md` + the TL-01 payload shape, MP-01's caps (`docs/api-multiplayer.md`).
## Scope
1. **Telemetry ingest**: per-IP KV rate limit (accounts pattern; generous for real players — e.g. 30/hour — a run takes minutes); CONTRACT-KEY ALLOWLIST (aggregate only ids present in the shipped contract registry — mirror the id list build-side or validate shape `e\d-[a-z-]+`/known set; unknown keys counted under 'other', never surfaced); payload size cap + field whitelist already per TL-01 — verify and assert.
2. **Multiplayer create/connect**: per-IP create limit (e.g. 10 rooms/hour) + connect attempts limit; friendly 429 shape ("the wire is busy").
3. **Stats read**: assert aggregates-only output unchanged; 'other' bucket renders nowhere on the site (server-side drop).
4. Harness (the wrangler-dev pattern from tl-02): rate-limit trip test, garbage-contract-key test (stats stay clean), real-shape passes.
Firewall: `functions/api/telemetry.ts`, `functions/api/_multiplayer.ts` guard sections, the harness, contract doc updates. NO client changes, NO stats schema changes, NO accounts code.
End: READY-FOR-GATES + harness output.
