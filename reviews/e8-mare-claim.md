# Review — e8-orbital-contract / e8-mare-claim (lane-b)

**Slice:** lane-b-e8-orbital-contract — the E8 Mare Claim signature tile as DATA (contract + mask table, feeds 3D-D)
**Branch/tip:** `lane/m4` @ `52d533f877d3e7d163f9bfa31929984ad15a5c29` (`runner(lane-b): lane-b-e8-orbital-contract.md`)
**Base:** `01689e11` (fork point = the e7 drain; main moved 2 commits — `5c21c22d` e8-master authoring + goal leaf, `f50cc240` s691 handoff — since)
**Drain:** s692 fire, surgical 4-file graft onto clean main.

## Verdict: MERGED — data-only, locked-era INERT, all gates green.

## What it does
Adds the E8 Mare Claim as authored DATA, mirroring the shipped e6-glow-mesa / e7-relay-valley pattern key-for-key:
- **Contract entry** `e8-mare-claim` in `assets/contracts/epoch-8-orbital/contracts.json` — biome `orbital-mare-claim`, 128×128, `river:false`/`ford:false`/no water, seven build zones (two rim-premium pads, three dome-cluster pads, launch pad, mass-driver rail footing), a `mass-driver` rail (4 points, eastbound), six regolith/He-3 harvest anchors, `heightfield.mode:"visual"` (LOS crater-rim/mare classification carried for the 3D-D sculptor; sim elevation stays planar/code-owned per constitution law #6), `gravity` (0.6g feel, 2.4× lob-arc, floaty) + `atmosphere` (airIsWall, suit-timer outside domes) as authored twist params, spawn edges N/W/E, and a `debris-arc-rim` patrol route as a named lane.
- **Mask table** `assets/contracts/epoch-8-orbital/mask-tables/e8-mare-claim.json` — core keys exact vs contract; additive per-map `rimBands` (N/S/W/E crater-rim h6 segments), `mareFlat` (h0 basin), `lavaTubeMouth`, and `debrisArcLanes` (== contract `lanes.patrolRoutes`), following the e6/e7 additive precedent.
- **Node test** extension in `scripts/e3-mask-tables.test.mjs` — e8 registered in era resolver (`e8-` → `epoch-8-orbital`) + contract set; new bounds walk over `rimBands`/`mareFlat`/`lavaTubeMouth` + `debrisArcLanes`; exact-track key list (adds `gravity`/`atmosphere`) + source pointer to `specs/epoch-saga/e8-orbital-bundle.md §B`; e8 added to the bounds+no-water suite.
- **Board-gating inertness** — one added assertion in `e2e/board-gating-and-profiles.spec.ts`: `contract-card-e8-mare-claim` has count 0 in a plain (epoch-1) boot. Locked-era contract is invisible in normal play.

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, 1.24s |
| `node --test scripts/e3-mask-tables.test.mjs` | **9/9 pass** (incl. new `e8-mare-claim` exact-track + bounds/water-agreement) |
| `board-gating-and-profiles` e2e | **2/2** desktop + mobile (incl. new e8 inertness assertion) |
| `task-025-bandits-dont-swim` (adjacent) | **10/10** desktop + mobile, unmodified-green |
| Boot probe | zero console/page errors (town boots to epoch-1; e8 card absent as asserted) |

## Merge classification
Surgical 4-file graft (`git checkout 52d533f8 -- <4 files>`), NOT a full branch merge.
- **Why graft, not `git merge`:** the lane forked at `01689e11` (the e7 drain), before main's `5c21c22d` which authored the e8 master + added the `e8-mare-claim-contract` goal leaf (queued). The lane's runner commit touched ONLY the 4 real content files — its `tasks/goals.json` base→lane diff is **empty** (the runner never touched goals.json; registration lived in `5c21c22d` on main). A full merge would have to reconcile main's post-fork additions (goals leaf, STATUS, the master file) — grafting the 4 files sidesteps that entirely.
- **The 4 grafted files are MAIN-untouched since base:** `git diff --name-only 01689e11 HEAD -- <4 files>` = **empty** → zero-conflict, fast-forward-equivalent graft for contracts.json / mask-table / e3-mask-tables.test.mjs / board-gating spec.
- **goals.json** handled on main's version: flipped the `e8-mare-claim-contract` leaf `queued → merged` + `mergeHash: 52d533f8…` (40-char lane-tip, ancestral convention per e7/wire-dq-3d), keeping main's tree intact.

## Report-don't-invent / findings
- **F-e8-1 (non-blocking, pre-existing, attended-owned):** `scripts/goal-tracker.test.mjs:17` remains RED on main (stale hardcoded category-count vs 11 top-level categories = the standing §7.6 **F-1**). Unrelated to this leaf edit — it aborts before any leaf check. Not mine.
- No canon issues: orbital-era frontier-tech (domes/regolith/mass-driver/lava-tube), no firearms, no peoples-as-enemies, no gore. Water-free tile (asserted). `heightfield.mode:"visual"` respects the planar/render split (law #6); gravity/atmosphere are authored display params, application-gated to a later slice.
- **Player surface:** none yet — locked era (epoch-8 manifest `locked:true`), INERT, absent from plain boot (asserted, Mistake #10 satisfied). Application waits on its 3D-D sculpt slice → verdict is display-safe. No gazette, no deploy.
