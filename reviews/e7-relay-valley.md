# Review — e7-relay-valley-contract (lane-b)

**Slice:** lane-b-e7-relay-valley-contract — the E7 signature tile as DATA (contract + mask table, feeds 3D-D)
**Branch/tip:** `lane/m4` @ `2ac97c33f558092ba6d2744797b0076f29db362d` (`runner(lane-b): lane-b-e7-relay-valley-contract.md`)
**Base:** `c52d24f6` (fork point; main moved 1 commit — `f743876e` goal-tree reconciliation — since)
**Drain:** s691 fire, surgical 4-file graft onto clean main.

## Verdict: MERGED — data-only, locked-era INERT, all gates green.

## What it does
Adds the E7 Relay Valley as authored DATA, mirroring the shipped e6-glow-mesa pattern key-for-key:
- **Contract entry** `e7-relay-valley` in `assets/contracts/epoch-7-signal/contracts.json` — biome `signal-relay-valley`, 128×128, `river:false`/`ford:false`/no water, four north-bank relay-site build zones along the ridgeline (`relay-site-r1..r4`), `heightfield.mode:"visual"` (LOS ridge/valley classification carried for the 3D-D sculptor; sim elevation stays planar/code-owned per constitution law #6), spawn edges N/W/E, and the teaching-contract `teaching-patrol` route as a named lane.
- **Mask table** `assets/contracts/epoch-7-signal/mask-tables/e7-relay-valley.json` — core keys exact vs contract; additive per-map `ridgeBands` (west/east h5 ridges + valley-floor h0) and `fogPockets` (ridge-dead-gap + west/east dead-zone pockets), following the fairground/e6 additive precedent.
- **Node test** extension in `scripts/e3-mask-tables.test.mjs` — e7 registered in era resolver + contract set; new bounds walk over `ridgeBands`/`fogPockets` + `lanes.patrolRoutes`; exact-track key list + source pointer to `specs/epoch-saga/e7-signal-bundle.md §B`; e7 added to the bounds+no-water suite.
- **Board-gating inertness** — one added assertion in `e2e/board-gating-and-profiles.spec.ts`: `contract-card-e7-relay-valley` has count 0 in a plain (epoch-1) boot. Locked-era contract is invisible in normal play.

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, 802ms |
| `node --test scripts/e3-mask-tables.test.mjs` | **8/8 pass** (incl. new `e7-relay-valley` exact-track + bounds/water-agreement) |
| `board-gating-and-profiles` e2e | **2/2** desktop + mobile (incl. new e7 inertness assertion) |
| `task-025-bandits-dont-swim` (adjacent) | **10/10** desktop + mobile, unmodified-green |
| Boot probe | zero console/page errors (town boots to epoch-1; e7 card absent as asserted) |

## Merge classification
Surgical 4-file graft (`git checkout 2ac97c33 -- <4 files>`), NOT a full branch merge.
- **Why graft, not `git merge`:** the lane forked at `c52d24f6`, before main's `f743876e` goal-tree reconciliation. Both moved `tasks/goals.json`; a full merge would have reverted main's reconciliation (stale-base trap, Mistake #15 territory). Verified the lane's *own* goals.json change (base→lane diff) is **empty** — the `e7-relay-valley-contract` leaf was already queued at `c52d24f6`, the runner never re-touched goals.json. So the lane contributes only the 4 real files.
- **The 4 grafted files are MAIN-untouched since base:** `git diff --name-only c52d24f6 f743876e` = `tasks/goals.json` only → zero-conflict, fast-forward-equivalent graft for contracts.json / mask-table / e3-mask-tables.test.mjs / board-gating spec.
- **goals.json** handled on main's version: flipped the `e7-relay-valley-contract` leaf `queued → merged` + `mergeHash: 2ac97c33…` (40-char lane-tip, ancestral convention per s689 wire-dq-3d), keeping main's reconciliation intact.

## Report-don't-invent / findings
- **F-e7-1 (non-blocking, pre-existing, attended-owned):** `scripts/goal-tracker.test.mjs:17` remains RED on main (stale hardcoded category-count vs 11 top-level categories = the standing §7.6 **F-1**). Unrelated to this leaf edit — it aborts before any leaf check. Not mine.
- No canon issues: signal-era frontier-tech (relays/ridgelines/fog), no firearms, no peoples-as-enemies, no gore. Water-free tile (asserted). `heightfield.mode:"visual"` respects the planar/render split (law #6).
- **Player surface:** none yet — locked era, INERT, absent from plain boot (asserted, Mistake #10 satisfied). Application waits on its 3D-D sculpt slice → verdict is display-safe. No gazette, no deploy.
