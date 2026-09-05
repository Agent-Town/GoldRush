# Review: e5-storm-predicate-split — storm cargo split from schedule suppression (lane-c, codex runner, attended drain 2026-09-05)

**Slice/branch/tip:** `e5-storm-predicate-split` · `lane/c` · runner commit `6d2afe63e` over base `a076a389c` · merge `036cb6037` (no-ff, auto-resolved; no conflicts).
**Verdict:** MERGED. The enabling engine slice; Stillwater's composition is deliberately byte-unmodified (the task's parity fallback), so the e5-stillwater reskin row is NOT yet cured — the follow-up `e5-stillwater-front-crew` carries the measured candidate.

## What it does
`deepwaterStormCarriesCorsairs` (does a storm front bring a crew) is split from `deepwaterStormDisablesScheduledWaves` (does the storm suppress the generic schedule), in `Game.ts`, `HeadlessContractSim.ts`, `DeepwaterSocket.ts` and the tile renderer; both emission paths route through `deepwaterFrontCarriesWave`, so an EMPTY front emits zero `wave_started` events and a crewed front emits one. Cross-engine regression coverage added to `e2e/er01-e5-census.spec.ts`. The runner also measured the smallest Stillwater candidate (`corsairWaveSize: 1`, 32 s cycle, first front at 8 s): played riders still secure at wave 12 (360000 ms, both seeds); idle riders now LOSE at wave 3 (~100 s) — the outcome boundary the audit asked for — but every Stillwater event hash and its null-floor pin move, which the master's byte-parity guard forbade, so the candidate was reverted and recorded.

## Evidence (merged tree `036cb6037` + era pin `b061540c`)
| Gate | Result |
|---|---|
| `npx tsc --noEmit` / `npm run build` | rc 0 / rc 0 |
| `e2e/er01-e5-census.spec.ts` + `e5-stillwater-noise` + `e5-regatta-race` + `e5-flotilla-hulls` (drain port 5273, workers=1) | 32/32 desktop + 390px |
| `scripts/engine-era-guard.test.mjs` after the pin | 5/5 |
| `run-guards.mjs --changed-since a076a389c` | power-budget, task-guards, citations, gate-callers PASS; node-guards red ONLY on the s1479 per-test-timeout meta-guard (`node-guards-timeout.test.mjs`), which passes 2/2 alone — load 16–30 on the host during the battery (Astra review + playwright concurrent); environmental |
| Runner's own gates (report.md) | tsc/build pass; Stillwater 10/10; Regatta+Flotilla 21/22 (the one red a 20 s subprocess timeout on the desktop idle child, same arm green on mobile); `test:stats` pass under node 26 |
| Shipped E5 pins | Stillwater played/in-process/idle, Regatta, Flotilla: all byte-identical (report tables) |

## Merge classification (base `a076a389c`)
| File | Class | Resolution |
|---|---|---|
| `src/game/Game.ts`, `src/sim/DeepwaterSocket.ts`, `src/world/DeepwaterClaimTile.ts`, `e2e/er01-e5-census.spec.ts` | LANE-TOUCHED | clean |
| `src/sim/HeadlessContractSim.ts` | MAIN-MOVED (E7/E8 diagnostic spreads) | git auto-merged, hunks disjoint; tsc + 32/32 confirm |
| `tasks/BACKLOG.md` | MAIN-MOVED | git auto-merged (lane row + main rows) |
| `artifacts/e5-storm-predicate-split/report.md` | NEW | evidence |

## Findings
- **F-E5SP-1 (spawns a corrective in this commit):** the Stillwater cure is measured but not landed: `e5-stillwater-front-crew` (lane-c) applies the size-1 candidate as contract data, re-records Stillwater's floor/idle pins with a same-era engine pin, and proves idle-loses / played-secures in both engines.
- **F-E5SP-2 (non-blocking):** the runner's `codex review --uncommitted` was unavailable (CLI 0.149.1 rejects the configured model); no review findings were produced by the runner — this attended review stands in.
