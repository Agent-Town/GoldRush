# e8-remaining-maps — drain review (attended, 2026-09-05)

**Slice/branch/tip:** `e8-remaining-maps` · `lane/d` · tip `a16b19354` · base `57330ebfd` · merge `a65ea2c17`
**Verdict: MERGED, one declared firewall deviation accepted, one board question desked.** Claude implementer (Opus), six commits, READY-FOR-GATES under the repo's node with every red attributed against a control.

## What it does
Far Side, Low Orbit and the Eclipse compose the shipped E8 physics and gain suit-air latches measured from the starting kit: Far Side crosses its one probe crater on air at 30 s; Low Orbit works its three scaffold decks by 60 s on 5.07 s of a 60 s suit; the Eclipse works one regolith ground, then one more on the centre pad's reserve after the shadow lands at wave 10 (rim pads offline). Each latch opens the secure offer at wave 20 (A/B: latch closed → wave 22 with no offer). A new `src/systems/E8SuitAirSystem.ts` carries the suit-only rule two of the maps need; `E8PhysicsSystem.ts` is untouched and the Mare Claim's guard still asserts the three never arm it.

## Evidence (lane under node 26.4.0; merged tree re-gated, see the SHIPPED row)
| gate | result |
|---|---|
| tsc / build | 0 / 0 |
| `scripts/e8-remaining-maps.test.mjs` | 9/9 (mutation: consumer → `none()` falls back to each map's pinned null floor) |
| parity e2e desktop + 390px | 8/8, zero console/page errors |
| adjacent E8 e2e (8 specs + the E8 census), both projects | 48/48 unmodified |
| plain-boot shots both projects | 6/6, `__GR_TEST__` absent |
| `test:stats` | 0 (87+252+252+26) |
| `test:node-guards` | 647/651: the 2 reds = `goal-tracker` rejecting the heat-11 leaf's non-sha mergeHash (F-2499-2, pre-existing on main, control-proven; cured in this drain) + its `fixture-teardown` cascade |
| hash table | far-side / low-orbit / eclipse: node = chromium worker on seed 01 (`5c30efd5`, `6e1931c2`, `466507ac`); mare-claim controls `1a62757f` / `dc8e828d` unchanged; waves/timeMs/kills identical to control on all eight rows |

## Merge classification
Base `57330ebfd`. LANE-TOUCHED: `src/systems/E8SuitAirSystem.ts` (new), `src/sim/HeadlessContractSim.ts`, `src/agent/View.ts`, `assets/contracts/epoch-8-orbital/contracts.json` (three contracts), `scripts/e8-remaining-maps.test.mjs`, `e2e/e8-remaining-maps-parity.spec.ts`, `scripts/e8-remaining-maps-ride.mjs`, `public/skill.md` (E8 prose), evidence. MAIN-MOVED: `tasks/BACKLOG.md` (union), `public/skill.md` (auto-merged: main's fenced contract list vs the lane's E8 prose, non-overlapping). `assets/engine-era.json`: the merged tree re-pinned attended.

## Findings
- **F-E8RM-2 (accepted):** the new consumer file was outside the TOUCH-ONLY list; it follows the era-consumer pattern every other era uses and leaves the physics system untouched. Accepted as the honest shape.
- **F-E8RM-8 (DESKED, owner):** heat 11 claimed all three maps on 2026-09-04 under the old composition; this slice raises their bar. Their rows stay verified under their recorded pin, but a browser replay on the current engine will no longer reproduce them. The county needs a per-contract mechanic lineage (a contract's rows retire to the almanac when its mechanic changes, receipts kept as history) or a re-ride policy. Recommendation in BACKLOG.
- **F-E8RM-1/-3/-6/-7 (non-blocking):** two air consumers to consolidate later; five stale `null-floors.json` rows (guard shape-only); Low Orbit's wall does not bite (lever = debris fields, needs a ruling); a `HOLD` starves queued standing orders (documented in skill.md; a rider-facing quirk worth its own fix).
