# Review: e5-stillwater-front-crew-2 — the Stillwater's first crewed front (lane-c, codex runner on gpt-6-astra, attended drain 2026-09-05)

**Slice/branch/tip:** `e5-stillwater-front-crew-2` · `lane/c` · runner commit `23272e783` over base `908be18e6` · merge `69080c3cd` (no-ff; BACKLOG union only).
**Verdict:** MERGED. The last uncured RESKIN row of the 2026-09-02 audit besides Dome Basin: `e5-stillwater` now EXERCISES its mechanic (a storm front that carries a crew through the fog while the noise hunt stays live).

## What it does
Contract data only (`assets/contracts/epoch-5-deepwater/contracts.json`, the `e5-stillwater` row): `corsairWaveSize: 1` on a 32-second storm cycle with the first front at 8 seconds; the north/south schedule and the fog/noise hunt stay authored; no simulation source change (the landed predicate split lets the non-zero size decide). Browser diagnostics show storm haze 0.28, one scheduled front, one live skiff through the fog. Pins re-recorded (mask table, null floors, spec assertions) with a same-era engine pin `ea7fd35e`; new node guard `scripts/e5-stillwater-front-crew.test.mjs` added to the single `run-node-guards` invocation.

## Evidence (runner tables in `artifacts/e5-stillwater-front-crew-2/report.md`; attended re-gate on the merged tree in the drain commit message)
| Arm | Seed 01 | Seed 02 |
|---|---|---|
| played, plain | `7661ca43` SECURE w12 at 360000 ms | `3d3ea0fc` SECURE w12 at 360000 ms |
| played, in-process | `4e99e655` SECURE w12 (77 strikes) | `897e18b8` SECURE w12 (77 strikes) |
| idle, plain | `ba80f970` LOSS w3 at 104433 ms | `7ab6a335` LOSS w3 at 93367 ms |
| idle, in-process | `0ec0ed52` LOSS w3 | `b72d7bbc` LOSS w3 |
| audit null floor | `59ec4f5c` w3 | `f3da3f08` w3 |
Both Chromium projects assert the same door laws (16/16 task-suite tests each); every other E5 map's pins preserved (report §"Other E5 pins preserved"). The v1 honest STOP's isolation clause was dropped by the v2 master (F-E5FC-1): Stillwater has no Claim-Boat loss seam; the hero falling to the front IS the loss route.

## Merge classification (base `908be18e6`)
| File | Class | Resolution |
|---|---|---|
| contracts.json (`e5-stillwater` row), mask table, null-floors.json, engine-era.json, the two specs, package.json, the new test, artifacts | LANE-TOUCHED / NEW | clean (main moved no corpus file since the base: only `scripts/fire-runner.sh`, tasks and docs) |
| `tasks/BACKLOG.md` | MAIN-MOVED | union (lane row + main rows) |

## Findings
- **F-E5FC-2 (non-blocking, evidence):** the two doors' hashes are not interchangeable by design (door-specific event streams); parity here is the exact terminal law within each door plus repeat-stability. Heat 12 human rides on Stillwater will be the first cross-door tapes.
- **Desk (design, carried from v1):** whether the Claim-Boat should ever be attackable (a shared Deepwater contact/loss seam) remains the owner's question; not needed for L1/L2.
