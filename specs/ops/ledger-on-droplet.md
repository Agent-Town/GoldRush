# The Ledger Moves to the Server — standings/accounts/assay off KV, onto the droplet

**Status: RATIFIED 2026-08-23 (owner directive, verbatim: "No, lets do this now. If we get some users the KV store will be full and nothing will work anymore. Lets move this to the server now.")**
**L3 EXECUTED 2026-08-23 (owner: "go") — SPLIT CUTOVER LIVE: `/api/standings*` (boards + assay queue/verdict) serves from the droplet sqlite ledger through agenttown.app; accounts stay forwarded to the Cloudflare functions until the owner provides `RESEND_API_KEY` + `AUTH_CODE_PEPPER` for the droplet env (then one nginx line flips them); multiplayer forwarded permanently. F-2233-1 resolved by decision: vite present on the box via full install (the runtime-transform design stands). KV now serves ONLY accounts + rollback.**
**AMENDED same day (owner, verbatim: "We don't have to keep any runs or anything, this is pre-launch, so migration is not needed.") — THE DATA PORT IS STRUCK: the droplet ledger starts EMPTY (fresh boards, fresh accounts). L2 is SUPERSEDED. Nothing is DELETED: the KV namespace stays parked as-is (retention law), and the county's first verified-standing evidence already lives in git (artifacts/assay-e2e-20260822/). Parity of the CONTRACT is proven by L1's dual-backend suites; cutover = stand the service up empty and flip the origin.**
Preceded by: the 2026-08-22 KV cap incident (the idle worker read all 41 boards per poll); the §F.20 stay-on-KV recommendation — **overridden by the ruling above**. For the record, the eliminated failure mode is the free tier's DAILY op-rate cap (429s until the 00:00 UTC reset, data never lost); the ruling removes that class entirely by owning the storage.

## What moves, what stays
- **MOVES to the droplet (<droplet>)**: the county ledger — standings boards (all seasons), accounts, assay queue/verdict state, the public verdict slips. Storage: **SQLite via `node:sqlite`** (WAL, busy_timeout), file `/opt/goldrush-ledger/ledger.db`. Service: `goldrush-ledger.service` (systemd, own unit, NOT the assay worker's process).
- **STAYS on Cloudflare**: the static game + site (Pages), the `/goldrush` path-proxy worker, DNS, **multiplayer** (the lockstep relay/room DO is stateful edge infrastructure and is NOT in scope), and the KV namespace itself — demoted to **rollback + nightly offsite backup mirror** (never deleted; retention law).

## Laws
1. **The endpoint contract is the spec**: the droplet service serves the exact request/response contract of today's Pages Functions (`functions/api/standings.ts`, `_accounts.ts`) — the game client changes ONE line (`src/app/GameApi.ts:1` `GAME_API_ORIGIN`) and nothing else. The existing `test-standings`/`test-accounts` suites are the acceptance tests, run against the sqlite backend.
2. **Parity before cutover** (amended 2026-08-23): the contract is proven by L1's suites running green against BOTH backends; no data-corpus replay is owed (no data moves).
3. **The single-box risks become requirements** (from the 2026-08-23 owner conversation): separate systemd units with `MemoryMax` (a replay crash must not take the API); nginx serves an honest `503 {"ok":false,"error":"ledger_resting"}` when the service is down; nightly `sqlite3 .backup` + rotate locally AND mirror to the KV namespace (≈50 writes/day — free forever, instant edge rollback); restore drill documented in the runbook before cutover is called done.
4. **Multiplayer routing survives**: `GAME_API_ORIGIN` also feeds the lockstep relay default (`src/mp/LockstepClient.ts:916`). The droplet nginx MUST forward `/api/multiplayer/*` (and any relay/DO path) to the Cloudflare origin, or the client splits the origins — L3 measures which paths exist and wires the forward. Ride Together must work identically post-cutover.
5. **Rollback stays warm**: the Pages Functions + KV deployment is left intact and current until the owner retires it; cutover reverses by reverting the one-line origin flip.

## Slices
- **L1 — the ledger service core** (codex, lane-d, `tasks/l1-ledger-service-core.md`): node ≥26 service, `node:sqlite` storage adapter behind the same logic, full ported test battery. Gate: suites green on sqlite locally; zero contract drift.
- **L2 — SUPERSEDED (owner amendment above): no data migrates; the ledger starts empty.** The master is retained banked with a DO-NOT-QUEUE banner; its leaf reads superseded.
- **L3 — droplet install + cutover** (ATTENDED — server config is the attended station; SIMPLIFIED by the amendment: no import step): node 26 upgrade on the box, systemd unit + MemoryMax, nginx `/api/*` location + multiplayer forward + 503 shape, env; the service starts on an EMPTY db; then the `GAME_API_ORIGIN` flip (one-line client change + deploy) inside an owner-quiet window. Gate: live submission → pending → droplet-verified → slip, on production, post-flip; Ride Together roster check.
- **L4 — backup discipline** (codex after L3, master to be authored with L3's measured paths): the nightly backup timer + KV mirror + restore drill + runbook section.

## Integration map
Touches: `functions/api/*` (ported, not edited), new `server/ledger/**` (service + adapter + tests), `src/app/GameApi.ts` (one line, L3), `ops/droplet/**` (unit + nginx), `docs/ops/agenttown-server.md`. Untouched: sim/gameplay, tapes/verification logic (the worker keeps its HTTP contract — pointed at localhost in L3), multiplayer code, art, specs/lore.

## Ratification questions
None open — ruled. Cutover timing (L3) happens in an owner-quiet window with his one-word go.
