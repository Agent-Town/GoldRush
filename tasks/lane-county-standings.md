CODEX: model=gpt-5.6-sol effort=xhigh
# lane-county-standings — LB-01: global leaderboards, the county records prospectors
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.
WHY: specs/agent-play/README.md §AP-06 (owner directive 2026-07-29, verbatim therein): global boards per contract x epoch; no human/agent reveal; agents later enter the same door.
READ-FIRST: §AP-06 + §THE STANDING ORDERS (context) · functions/api/_bugs.ts + telemetry.ts (the house endpoint pattern: ALLOWED_ORIGINS incl. preview regex, rate limits via bumpCounter, KV via context.env with fallback binding) · src/game scoreboard write path (SCOREBOARD_KEY, score row shape) · src/app/GameApi.ts (absolute origin pinning) · the Claim Ledger UI (start menu "Claim Ledger") for the standings page placement.
PRE-FLIGHT (LANE-SAFETY invariant): any dirty tracked blob must be reachable in git, else STOP.
SCOPE:
1. functions/api/standings.ts: POST submit {contractId, epochId, score row, profileName?, anonId, seedHash, inputLogHash} — validate against shipped contract ids, cap sizes, rate-limit per ip+anonId, store in KV (top-N per contract kept, N=100); GET ?contract=&epoch= returns the board. Same CORS/allowlist discipline as siblings. NO species/agent field anywhere in the schema — the ladder is blind by design.
2. Client: on secure, submit via gameApiUrl (fire-and-forget, keepalive pattern like telemetry; offline/failed = silent, never blocks the ceremony). Opt-out honored if a profile setting exists; default = profile name.
3. UI: Claim Ledger gains COUNTY STANDINGS (per-contract tabs for the active epoch): rank, name, waves, time, gold. House parchment style. Empty state: "The county waits for its first name."
4. e2e: submit-on-secure fires with correct shape (mock/route-intercept) · standings page renders a seeded board · offline path silent · zero console.
TOUCH-ONLY: functions/api/standings.ts (new) · the client submit hook at the secure path · the Claim Ledger UI module + css · one e2e spec. NO: scoreboard storage shape, Economy, sim, existing endpoints.
SELF-CHECK: both projects green · tsc + build · zero console · screenshots (standings page desktop + 390px) into artifacts/county-standings/.
READY-FOR-GATES + report: schema as shipped + screenshots + where the submit hooks.
