# Review — e4-04-orbit-road (Motor Frontier engine, part 3)

**Slice/branch/tip:** e4-04-orbit-road · lane/m3 (lane-a) · lane tip `41d6f0a2` (parent `2d05fc4c` = cw-03)
**Base for this drain:** `2d05fc4c` (cw-03 tip) — cw-03 landed on main first (`8b7723f5`) this same fire, so only e4-04's own delta is grafted here.
**Merged to main:** s565 fire, drain commit below.
**Verdict:** APPROVED — merged.

## What it does
The last E4 engine brick (attended-authored 2026-07-15): a dev-harness prototype for the Motor Frontier's ring-road spawning + road-grading, behind `?debug&e4orbit` (not player-visible yet — parity with the e4-convoy-weather harness).
- **OrbitSpawner** — contract-configurable; waves arrive on a literal ring road and orbit until telegraphed peel-off points, then peel inward (replaces edge-pops on E4 contracts only; E1–E3 untouched).
- **RoadSegment** — graded-road buildable: friendly vehicles run 2.5× faster and burn 0.4× fuel on road; enemy convoys are *attracted* to roads (route-cost 0.25×) — the tower-defense inversion where you author the enemy's path.
- `E4OrbitRoadHarness` registered in `main.ts` under the debug flag; `__GR_E4_ORBIT_ROAD__` window type.
- `Balance.e4Orbit` + `Balance.e4Road` tuning blocks.

## Merge classification (stale base; headless-fire cp + Edit re-land)
- **New files (cp from lane worktree at 41d6f0a2, tsc-verified resolving):** `src/systems/OrbitSpawner.ts` (120), `src/systems/RoadSegment.ts` (126), `src/diagnostics/E4OrbitRoadHarness.ts` (156), `e2e/e4-orbit-road.spec.ts` (62).
- **Both-moved, content-anchored Edit (disjoint from cw-03):** `src/game/Balance.ts` (`e4Orbit`/`e4Road` inserted near `catchupMultiplier`, far from cw-03's `crawler` block), `src/main.ts` (`e4orbit` harness registration, +6).
- **`src/vite-env.d.ts`:** the `__GR_E4_ORBIT_ROAD__` type line landed in the cw-03 commit `8b7723f5` (the lane-a worktree had already advanced to 41d6f0a2 when cw-03's vite-env was cp'd); it is correct and complete now that this drain lands the harness it references. Noted for honesty; no functional impact (tsc green both commits).

## Evidence (native, this fire)
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | green (551ms) |
| e4-orbit-road.spec (own) | **6/6** both projects — ring-orbit + peel telegraph, road 2.5×-speed/0.4×-fuel/convoy-attract, determinism |
| e4-convoy-weather.spec (e4-03 adjacent) | **4/4** both projects |
| task-025 (spawn/river regression) | **10/10** both projects |
| Console/page errors | zero; harness is flag-gated (`?debug&e4orbit`), plain boot never imports it |
| Captures | `artifacts/e4-orbit-road/{desktop,mobile}-chrome-{peel,road-effects}.{png,json}` |

## Findings
- **F-E4ORBIT-1 (non-blocking):** placeholder art per placeholder-first; orbit/road presentation is primitive geometry, swap-ready for E4 art.
- No blocking findings. Firewall clean: no E1–E3 spawn changes, no tiles, no boss touched.
