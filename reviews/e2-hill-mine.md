# Review: e2-hill-mine — THE HILL MINE (Epoch 2 flagship tile)

- **Slice/branch/tip:** e2-hill-mine · lane/perf `c556b50` → grafted to main `fcfdcd7`
- **Drained by:** s199 fire, 2026-07-08
- **Verdict:** ✅ MERGED — clean graft, full gate green, one pre-existing adjacent red proven not-ours.

## What it does
Ships Epoch 2's flagship terrain tile: a terraced hillside (switchback levels climbing to the mine mouth, a rail cut, flooded lower gallery) authored as an analytic heightfield, plus the `e2-hill-mine` contract manifest that renders on the town board as the FIRST epoch-2 card — locked ("awaits the Steamworks era"), the era's poster. It is the first tile that consumes the whole GT stack at once (GT-04 sightlines: terrace faces block bolt LOS, high turrets out-range the rail cut; GT-05 water depth: flooded gallery blocks deep, edge wades slow; GT-03 slope routing). Dev access `?debug&contract=e2-hill-mine` is an epoch-independent test door.

## Evidence
| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green (359ms) |
| `e2e/e2-hill-mine.spec.ts` | **9/9** desktop+mobile (1 mobile 200-enemy stress `test.skip`, same as gt-04) — scratch :5251 |
| Modified adjacents (town-t3-board, contract-briefings, sci-04-registry, e1-baron) | **38/38** single-worker |
| Unmodified adjacents gt-01/02/04/05 + task-025 + m1-01 + m2-01 | green |
| gt-03-enemy-elevation:125 mobile | RED — **proven pre-existing** (F-hm-1) |
| Console/page errors | `[]` across all specs (each asserts empty) |
| Player-visibility (rule #10) | sci-04 "contract registry lists Frontier and **locked Steamworks** in order" + town-t3-board count-aware + contract-briefings plain-no-debug — all green in a normal boot |

## Merge classification
- **Base:** merge-base `0235519`; main was +11 commits ahead but **disjoint** — `git diff --stat 0235519..main` on all 23 touched files = empty (none moved on main).
- **All 23 files LANE-TOUCHED-only, zero MAIN-MOVED.** Applied via `git checkout c556b50 -- <files>` (cherry-pick unavailable headless); post-graft `git diff --cached c556b50 -- src/ e2e/ assets/contracts/ artifacts/` = empty → staged tree byte-identical to c556b50. No 3-way needed.
- The huge `main..lane/perf` file list (200+) was pure stale-base divergence (lane/perf branched before the bfadfc2 art broad-add etc.); the actual commit `c556b50` is a clean 23-file / +756-line change.

## Findings
- **F-hm-1 (non-blocking, PRE-EXISTING — NOT this slice):** `e2e/gt-03-enemy-elevation.spec.ts:125` "enemies slow on slopes" — `expect(downhillVsFlatSpeed).toBeGreaterThanOrEqual(0.98)` flakes on **mobile** under CPU load (measured 0.592; the `downhill`/`uphill` segment wall-clock times collapsed to ~equal, a measurement artifact — the underlying `speedMul` values are all correct: flat 1.0 / uphill 0.80 / downhill 1.06). **Proof it's not the graft:** reverted `src/sim/TileHeight.ts` + `src/world/Terrain.ts` + `src/meta/ContractFamilies.ts` to clean HEAD, re-ran gt-03:125 mobile → **same failure**. Hill Mine's `hillMineHeight()` is gated behind `analytic.hillMine===1` and unreachable from gt-03's synthetic `setTerrainSim(0.6,1.1)` slope. Desktop passes; it's a mobile load-timing red. Candidate for a threshold-robustness corrective (measure speedMul, not wall-clock ratio) — owner/attended, low priority.

## Firewall
Compliant — data-side + additive/gated: `hillMineHeight()` is new and gated; `CLAIM_SIZE` falls back to `DEFAULT_CLAIM_SIZE` (64) and `nodeAnchors` to `DEFAULT_NODE_ANCHORS` when the contract omits the new `size`/`harvestAnchors`; `ContractFamilies.listBoardContracts()`/candidate expansion applies only to debug-or-launched contracts (the test door), normal boot unchanged. No GT/engine logic modified, no epoch-activation logic, no E2 enemies.
