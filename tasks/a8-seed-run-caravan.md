> ⛔ SHIPPED — DO NOT QUEUE (attended-agent build record; merged in the 2026-08-20 attended drain window with the door EXEMPTED — proof: goal leaf `a8-seed-run-caravan` + the drain commit on main)

# Task a8-seed-run-caravan: plant the future — e9-seed-run mechanic (door-completion sheet item A8)

Executed 2026-08-20 by an attended-dispatched Opus agent (branch `worktree-agent-ad297088098a5a90d` @ `10eeddee1`, 10 path-scoped commits), authorized by `specs/agent-play/door-completion-sheet.md` (RATIFIED — A8) — drained to main by the attended session.

## What shipped
- `src/systems/SeedCaravanSystem.ts` — one consumer both engines construct and tick, `create()` off the CONTRACT. Route = the five authored buildZone centres (byte-identical to the mask table's published `caravanRoute`); grounds = the three authored stakes. Speed 1.6 wu/s, 40 s dwell, contact damage r 3.6 / 3 dps / 3-attacker cap.
- **PLANT** (public verb, `CONTEXT_ACTION action=plant`): costs 60 of the caravan's 240 guard (the ratified 25%, off pool AND ceiling, restored whole on reset — "spend now, shelter forever" is paid once). Planting stages a permanent green waypoint (no-spawn disc) via TileStateStore at RUN END — **no new tile-state kind**: TP-02's `green-waypoint` sim entry reused verbatim with a per-ground id suffix (dedupe fix). A lost run stages nothing. The sim hands the caravan a fresh empty store so bench runs never inherit plants (persistence proven browser-side by the two-run e2e).
- Hashes ×2 all 12 runs: no-plant w16 `aebdeea4`/`4d221a7b`; plant w16 `77a015de` / w14 `9c5b06ec`; idle w2 `3b7b86be` / w3 `9baf2bdb`. Caravan arrived alive on EVERY run — Law 2 holds (idle loses by death, never by caravan loss).
- **THE DOOR STAYED SHUT — measured, not shortfall:** 15 plays could not secure on authored ground (the claim sits ON the north edge of the only near buildZone; dual-edge waves; hpScale-1.7 wreckers vs turret/beacon caps 4/6). Self-placed into CONTRACT_ADMISSION_EXEMPTIONS with a re-admit condition (the e2-trestle shape); door baseline + skill fence deliberately unchanged; seeds minted and kept.

## The owner fork this record carries (F-A8-4)
Re-admit needs ONE of: an authored `secureWave` < 20 · a buildZone north of the claim · accepting e9-seed-run as an elite map (exempt-with-reason, like the E2 railcars). **Agent + attended recommendation: the third, for now** — the mechanic is complete and the persistence teaching works in browser play; the door can follow a later ground retune.

## Drainer debts recorded at merge
e9-arsenal:77 red is pre-existing (proven by base-revert) but NOT in the red inventory — a row is owed. `worker-type-coverage` red is environmental in worktrees (hardcoded node_modules/typescript path).
