# Review: e3-moth-season-grid — the Moth Season lights its own corridor (lane-a, Claude implementer, attended drain 2026-09-05)

**Slice/branch/tip:** `e3-moth-season-grid` · `lane/a` · tip `eb79d0c12 (archive: pruned by the A3 rewrite)` (7 commits over base `7dc8672f0`) · merge `d07a0e2e7` (no-ff).
**Verdict:** MERGED. Reskin ladder row e3-moth-season cured as CONTRACT DATA: zero `src/` edits; the honesty STOP the master reserved did not fire.

## What it does
`e3-moth-season` now declares `twist.powerGrid` (the Canyon Works seams, contract-gated): a relay span from the pylon site to the gallery lamp, dark at turn 0, lit by a BUILD on the beacon, cut by a `fevered_saboteur` row at wave 4, relit by REPAIR_UNDER; the cycle repeats waves 4–7 and the map secures at wave 12 only if the corridor carried current by then (no relay → cannot secure at any wave). A third `moth_swarm` row keeps the roster's dangerous share at 33% (50% killed the floor ride at wave 4). Floor fixture re-recorded for the new offer set (declaring `powerGrid` withdraws `turret` and buildable `lantern_post`, the same rule `e3-blackout-ridge` lives under); L7 holds: a plain boot lists the identical offer both engines read.

## Evidence (merged tree `d07a0e2e7` + the era pin)
| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc 0 |
| `npm run build` | rc 0 |
| `scripts/moth-season-pressure.test.mjs` | 3/3 |
| `scripts/e3-mask-tables.test.mjs` | 30/30 |
| `scripts/engine-era-guard.test.mjs` (after pin `324bb3cd`) | 5/5 |
| `e2e/e3-moth-season.spec.ts` (drain port 5273, workers=1) | 8/8 desktop + 390px |
| `e2e/er01-e3-census.spec.ts` | 6/8 — the two reds are `e3-canyon-works census support is explicit and deterministic` (both projects), reproduced by the implementer on a detached control of `main@7dc8672f0`; `red-inventory-lookup` lists the spec KNOWN-RED (snapshot 2026-08-11, sibling row e3-blackout-ridge) |
| `run-guards.mjs --changed-since 7dc8672f0` | see drain commit message for the final battery line |
| Both-engine hash (lane tables) | floor ride `fnv1a32:e16244f9` node = in-process; reel `fnv1a32:b391d689` node replay = chromium 1280×800 = chromium 390×844 |

## Merge classification (base `7dc8672f0`)
| File | Class | Resolution |
|---|---|---|
| `assets/contracts/epoch-3-voltage/contracts.json` | LANE-TOUCHED | clean |
| `e2e/e3-moth-season.spec.ts`, `e2e/er01-e3-census.spec.ts`, `scripts/e3-mask-tables.test.mjs`, `scripts/moth-season-pressure.test.mjs`, `scripts/fixtures/moth-season-orders.json` | LANE-TOUCHED | clean |
| `artifacts/e3-moth-season/**` | NEW / evidence | clean |
| `tasks/BACKLOG.md` | MAIN-MOVED | union: the lane's ledger row prepended onto main's |
| `assets/engine-era.json` | MAIN-MOVED | main's pin list kept; the lane's lane-tree pin dropped (that tree never ships); a fresh era-5 pin `324bb3cd` for the MERGED tree appended in the drain commit |

## Findings
- **F-E3MS-1 (non-blocking, recorded):** the master's "SECURE requires the lamp lit AT the secure wave" is not achievable inside the firewall: the connect latch is one-way in both engines (`Game.ts:6992-7000`, `HeadlessContractSim.ts:2218-2226`); what ships is "carried current BY wave 12" (real, unpassable while dark, weaker). A predicate change needs `Game.ts` + `ContractFamilies.ts` in one slice (both engines) — filed as a fire-authorable row; heat 12 decides whether the weaker rule is exploitable.
- **F-E3MS-2 (non-blocking):** `mask-tables/e3-moth-season.json` owes `pylonSites`/`prePlacedBuildables`; recorded OWED in `e3-mask-tables.test.mjs:136`.
- **F-E3MS-3 (pre-existing):** `MechanicsManifest.ts:168` gates the relay/REPAIR vocabulary on `contract.id === 'e3-blackout-ridge'`, so Canyon Works and Moth Season do not publish it — parity with the EXERCISES row; belongs to the mechanics-manifest generalisation.
- **F-E3MS-4 (pre-existing, worked around):** `new HeadlessContractSim()` inside a page throws at the first wave boundary (`RunSuspend.deepClone` on `undefined`); the proof used the county's tape-replay path.
- **Drain note:** commits are prefixed `feat: e3-moth-season —` rather than the master's `e3-moth-season-grid`; accepted (no rebase over seven commits).
