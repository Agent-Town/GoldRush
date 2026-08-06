# Landmark routing regression — endpoint stop report

Date: 2026-08-07  
Task: `lane-f1507-2-landmark-routing-bisect`  
Predicate: `e2e/landmark-collision.spec.ts:68`, failing assertion at `:91`  
Outcome: **STOP — the proposed good endpoint is already red. No bisect or cure was run.**

## Validated endpoints

Both commands used the task-required `--workers=1` predicate.

| Endpoint | Expected by task | Observed | Verdict |
|---|---:|---:|---|
| `c063b5e59b34345f61666b01a4662f8811e8a110` | 10 passed | **2 failed / 8 passed** | RED on desktop and mobile at `:91` |
| `61892d1813f265fcad2133c9ab84d29db40de39f` (current `main`) | 2 failed / 8 passed | **2 failed / 8 passed** | RED on desktop and mobile at `:91` |

The first endpoint does not distinguish the proposed window. Scope 1 therefore requires an immediate stop: the first-bad commit is earlier than `c063b5e59`, and `4ab487437` is exonerated as the first-bad candidate without running a bisect.

## Named candidate

`4ab4874373f6f43dd6eb042c3e03d6e0645f7b6c` — `runner(lane-c): f1452-1-fort-solidity-routes-long-static-blockers.md`

Candidate result: **not tested as a separate arm because the task says to stop when its parent is red. It cannot be the first-bad commit.**

Full commit stat:

```text
artifacts/fort-solidity/desktop-chrome-walk-probe.png | Bin 0 -> 1055930 bytes
artifacts/fort-solidity/mobile-chrome-walk-probe.png  | Bin 0 -> 1545405 bytes
artifacts/fort-solidity/report.md                     |  99 +++++++++
assets/layer-contracts/landmark-collision-contract.json | 238 +++++++++++++++++++++
e2e/fort-landmark-collision.spec.ts                   |  95 ++++++++
e2e/fort-static-routing.spec.ts                       |  54 +++++
src/entities/Enemy.ts                                 |   2 +-
src/systems/BuildSystem.ts                            | 139 +++++++++---
8 files changed, 596 insertions(+), 31 deletions(-)
```

The candidate added static landmarks to `palisadeRoute`, but only landmarks whose long/short aspect ratio is at least `2.8` initiate a route. The failing `ruined_mining_operation` blocker is `{ x: 2, z: -5.8, halfX: 3.176, halfZ: 2.1225 }`, an aspect ratio of about `1.496`, so it is excluded from that candidate set. Its collision still depenetrates the enemy, but it does not receive a waypoint around the body. This explains why the candidate does not cure this case; it does **not** establish the earlier first-bad commit.

## Observed path versus contract

A read-only browser probe executed the unchanged `run()` body on current `main`.

- Samples: `180`.
- Start: `{ x: 1.953, z: -8.998 }`.
- Approach: `{1.908,-8.872}`, `{1.865,-8.746}`, `{1.825,-8.619}`.
- Thereafter: all samples remain at `z=-8.652`, with `x` oscillating between `1.845` and `2.061` (representative repeating values: `1.897, 1.964, 2.028, 1.871, 1.940, 2.005`).
- Maximum x deviation from the blocker center: `0.175`, far below `halfX=3.176`.
- Final sample: `{ x: 1.863, z: -8.652 }`.

Observed path shape:

```text
(1.953,-8.998) -> (1.908,-8.872) -> (1.865,-8.746) -> (1.825,-8.619)
-> oscillates at z=-8.652 with 1.845 <= x <= 2.061 for the remainder
-> (1.863,-8.652)
```

The contract requires at least one sample outside the blocker on x (`x < -1.176` or `x > 5.176`), a final z beyond its north edge (`z > -3.6775`), and no sample inside the footprint. The observed enemy instead stalls just south of the collision boundary and never routes around or through the landmark.

## Bisect and cure decision

No bisect table or culprit commit exists from this run: the required green endpoint was red. The next investigation must first recover and validate the exact tree used by the 2026-07-29 green inventory, then widen the window from that proven-green revision to `c063b5e59`.

Scope 6 did not run. Changing `Enemy.ts` or `BuildSystem.ts` here would choose a contested routing design without a named culprit and would violate the task's endpoint stop condition.
