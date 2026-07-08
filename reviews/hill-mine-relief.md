# Drain review — hill-mine-visual-relief (s202)

- **Slice:** hill-mine-visual-relief (lane-d) — the Hill Mine terraces become VISIBLE (per-tile terrain-mesh opt-in)
- **Branch/tip:** lane/perf `fb895c1` ("fix: make hill mine terrain relief visible")
- **Merge-base with main:** `1166e86`; main tip at drain: `a57bb73` (s201) → merged as s202 drain
- **Verdict:** ✅ MERGE — clean 5-file + 2-artifact LANE-TOUCHED graft; tsc+build green; own spec 12/12 (2 stress skips) both projects; the one adjacent red PROVEN a pre-existing mobile flake.

## What it does
Heightfield tiles now opt INTO the TR-01 continuous-mesh renderer *by data* rather than the global flag. A new `render.terrainMesh: 'required'|'preferred'|'off'` descriptor (`ContractFamilies.ts`, threaded through `activeTileDescriptor()` / `activeDevTileOverride()`) lets a tile declare it needs relief. The Hill Mine (`e2-hill-mine` contract) and `gt-test-basin` (epoch-1 dev tile) declare `required`, so `terrainMeshEnabled()` returns true for them regardless of the still-default-off global flag — flat tiles (no descriptor) are untouched. A `slopeShade` uniform (0.62 on required tiles, 0.42 otherwise = the prior hardcoded constant) darkens terrace faces so ledges read; the Hill Mine palette gains a `splat` block for scree-rock. Sim is unchanged (heights hash-identical — firewall held). Result: the Hill Mine reads as a real terraced hillside instead of the flat claim with rails (owner finding 2026-07-08 ~13:05 "looks very similar… the ground tile is the same").

## Evidence
| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean (twice — post-graft + post-re-graft) |
| `npm run build` | green (266ms; 1.32MB bundle, pre-existing chunk-size warning only) |
| e2-hill-mine.spec.ts (own) | **12 passed, 2 skipped** desktop+mobile (skips = 200-enemy stress, intentional per gt-04 pattern); incl. render-descriptor auto-activation, sim determinism hash, high-ground range, switchback routing, before/after wide capture |
| gt-01/02/03/04/05 + tr-01/02 + m1-01 + m2-01 + task-025 | **68 passed** (2-worker); 5 apparent reds cleared single-worker (load flake, live at 2-worker with heavy three.js) |
| Default-claim boot (m1-01/m2-01) | zero console/page errors both projects |
| Draw calls / frame | tr-01 + e2-hill-mine perf-envelope assertions PASS (mesh-on tile within both projects' budgets) |

Evidence shots: `artifacts/hill-mine-relief/desktop-chrome-terraces-wide-after.png`, `...-before-after.png` (regenerated green by e2-hill-mine test #334 on the grafted build).

## Merge classification
Base `1166e86`; per `git diff --name-only 1166e86 main` NONE of the 5 code/contract files moved on main since the lane base → **all LANE-TOUCHED-only, zero MAIN-MOVED, zero 3-way**. Applied via `git checkout fb895c1 -- <7 files>` (cherry-pick blocked headless); grafted working tree byte-identical to `fb895c1` for all 7 paths (`git diff fb895c1 -- <paths>` empty). The 200+-file `main..lane/perf` listing is pure stale-base divergence; the actual commit is 7 files / +125/-5.

## Findings
- **F-hm2-1 (non-blocking — PROVEN pre-existing flake, NOT this slice):** `e2e/gt-03-enemy-elevation.spec.ts:125` mobile-chrome `downhillVsFlatSpeed >= 0.98` red. Grafted run measured 0.977; **clean-main (grafted files reverted + rebuilt) measured 0.982 and failed 1-of-4 repeats** — the ratio jitters across the 0.98 gate on wall-clock position sampling, independent of any hill-mine change. The tile is a synthetic `gt-03-slope-*` dev tile with NO render descriptor, so `terrainMeshEnabled()`'s new `ACTIVE_TILE.render?.terrainMesh` branch is inert; all speedMuls physically correct (uphill 0.80 <1, downhill 1.04 >1). Fingerprint-matches s199 F-hm-1. No corrective owed beyond an eventual gate-threshold widen (owner/attended, low priority).
- **F-hm2-2 (non-blocking, reported):** the 5 apparent adjacent reds at 2-worker (gt-02:254 both, gt-03:224 desktop, tr-01:69/104 desktop) all pass single-worker — heavy-load flake, not a regression. Prefer single-worker for terrain suites during live-lane load.
