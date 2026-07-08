# perf-05 — startup-pass (defer non-critical startup asset loads)

- **Slice/branch/tip:** perf-05 startup-pass · `lane/perf` `f01e9f2` "perf: defer startup asset loads" · lane base `c4ed066`
- **Drained onto:** main `e10532f` (s216 lock) → merge commit this drain
- **Verdict:** SHIP ✅ (drain #2 of s216; drain #1 = night-shift-bite `c2d8062`/`67da924` by s215)

## What it does
Splits generated sprite/texture loading into a **critical** set (hero, claim-jumper, gold-seam, bank/river terrain) that still loads eagerly, and a **non-critical** set (Baron sheet + banner, all townsfolk, building portraits) that is now loaded via lazy `import('...png?url')` chunks and deferred until after the first rendered frame (`markStartupFrameReady()` / `afterStartupFrame()`), then prefetched before the first wave spawns. Net effect: boot payload drops ~35% and TTI/first-frame improve, with no visible-asset regression (non-critical art streams in immediately after paint).

## Evidence (gates run on the merged tree)
| Gate | Result |
| --- | --- |
| `npx tsc --noEmit` | clean |
| `npm run build` | green (318ms; `?url` deferrals produced per-asset lazy chunks) |
| `e2e/perf-05-startup.spec.ts` | **2 passed** — desktop 9.7s, mobile 7.9s |
| `e2e/044-start-screen.spec.ts` | 12 passed (both projects) |
| `e2e/m1-01-claim-jumpers-death.spec.ts` | passed (both) |
| `e2e/m2-01-build-menu.spec.ts` | passed (both) |
| `e2e/perf-02-fullbase-bench.spec.ts` | passed (both) |
| `e2e/task-025-bandits-dont-swim.spec.ts` | passed (both) |
| `e2e/perf-01-stress-budget.spec.ts` | PASS isolated single-worker (desktop 17.6s / mobile 16.8s) — see F-perf05-1 |
| `e2e/perf-04-determinism.spec.ts` | **16 passed** (both projects; same-seed identical economy hash, determinism 11.9m each) |
| console / page / asset errors | none (perf-05 spec assertions + 044 boot) |

Boot-payload numbers (from `artifacts/perf-05/summary.md`, CPU 1.25×, 20 MB/s):
| Project | TTI before→after | First frame before→after | Boot bytes before→after |
| --- | --- | --- | --- |
| desktop-chrome | 2693→2625 ms | 2518→2464 ms | 5,949,428→3,860,316 (−35%) |
| mobile-chrome | 1516→1459 ms | 1356→1324 ms | 5,952,840→3,867,510 (−35%) |

## Merge classification (base `c4ed066` → main `e10532f`)
20 files. Main advanced past the lane base (night-shift-bite + adjacents), so 3 files were touched by BOTH sides:
- **LANE-TOUCHED-only (17):** `artifacts/perf-05/*` (9), `e2e/perf-05-startup.spec.ts`, `src/assets/SpriteAnimator.ts`, `src/entities/BuildingSign.ts`, `src/main.ts`, `src/ui/BuildButton.ts`, `src/ui/Hud.ts`, `src/ui/ProspectorPanel.ts`, `src/world/Terrain.ts` — taken wholesale via `git checkout lane/perf --` (verified byte-identical to lane, empty diff).
- **MAIN-MOVED + LANE-TOUCHED (3), 3-way merged (hunks non-overlapping, verified both sides land):**
  - `src/assets/generated.ts` — lane restructures the URL map into eager `generatedAssetUrls` + lazy `generatedAssetUrlLoaders` + `nonCriticalGeneratedAssetSlots` + startup-frame gating (hunks @5-116/275); main's only delta = `setTintScalar` clamp `0,1`→`0,12` @239 (preserved).
  - `src/game/Game.ts` — lane change = `emitStorySignal` import path `'../story'`→`'../story/signals'` @57; main's harness `repair`/`screenPoint`, lantern `placeFree`, and lantern-diagnostics hunks @777/1628/2823 (all preserved).
  - `src/systems/BuildSystem.ts` — lane change = lazy `assayOfficeSignUrlLoader` + `createBuildingSignFromUrlLoader` @1/189/314; main's 9 hunks @78-1778 (all preserved).

Verified post-merge: `git diff lane/perf -- <each of the 3>` shows ONLY main's additions (both sides integrated); tsc + build clean on the merged tree.

## Findings
- **F-perf05-1 (non-blocking, environment):** `perf-01-stress-budget` failed BOTH projects on the first adjacent-battery run with `expect.poll(() => __PERF_01_TRACKER__.done, {timeout:12_000})` exceeded. Root cause = CPU starvation: the RAF-driven 5.25s sampling window overran 12s wall while a `perf-04-determinism` 600s×2 gate run + 4 parallel spec workers hammered the same machine. **Re-ran isolated `--workers=1` → PASS both projects (17.6s/16.8s).** Load-flake, not a perf-05 regression. No corrective needed. Matches the house "heavy load-flake at default workers" pattern.

## s216 note
This drain recovered from s215's death mid-perf-05-drain: s215 had staged a **partial** perf-05 index that stranded `Game.ts`+`BuildSystem.ts` (working-tree-only, unstaged) — committing it would have landed short. The leftover index was discarded and the drain redone fresh from `lane/perf`.
