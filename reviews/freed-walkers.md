# Review — lane-c freed-walkers (turn-back ghosts replace the death poof)

**Slice:** `lane-c-freed-walkers` · **Branch:** `lane/e2-arsenal` tip `2b08966b` · **Merge:** `21658b09` (no-ff onto main) · **Drained:** s659 fire, 2026-07-16
**Verdict:** ✅ PASS — merged.

## What it does
Owner directive (2026-07-16, verbatim): *"What happens to the people that are interrupted in the contracts? In the game they just *poof* disappear... they should then run out of the screen or seek refuge in town?"* The ratified canon (cure-arms ruling 2026-07-13) is that the weapons **break the fever's grip, never kill** — "turned back, not slain" — yet `CombatSystem.killEnemy` played a dust-puff and instantly recycled the enemy: the pixels contradicted the fiction hundreds of times a run. This slice makes the pixels comply.

On a non-boss/non-elite `enemy_killed`, a new **render-only, pooled** `FreedWalkerVfx` spawns a non-colliding ghost wearing the enemy's visual at the death position:
- **Humans**: dust puff (grip breaks) → stand still one beat (0.4–0.6s, the person surfaces) → turn away from the claim and run to the nearest map edge at ≥1.5× walk speed, fading over the final ~20% of life, hard cap ≤4s.
- **Machines**: no run — seize/shudder → power-down slump in place → fade, ≤2.5s.
Concurrency cap 10 (desktop/balanced) / 6 (lite/mobile) via `PerformanceTier`; deaths beyond the cap keep today's exact behavior (dust puff only). The sim path is untouched — `enemies.recycle` fires on the same tick; XP/gold/targeting/waves/audio unchanged.

## Merge classification
Base = merge-base `fb1da42d` (2026-07-16 10:18 main). **Zero** main commits since base touch any lane file → all 8 files **LANE-TOUCHED-ONLY**, no MAIN-MOVED, no 3-way. New: `src/systems/FreedWalkerVfx.ts` (447), `e2e/freed-walkers.spec.ts` (200), 3 shots. Edited (all within firewall): `src/systems/CombatSystem.ts` (+9/-1 — import, field, ctor `new FreedWalkerVfx(vfx)`, reset/dispose delegates, one `freedWalkers.spawn(enemy)` after `dustPuff`), `src/game/PerformanceTier.ts` (+4, `freedWalkerCap` on all 3 tiers), `src/vite-env.d.ts` (+1 diagnostics type). Clean no-ff merge.

## Evidence (gates on the merged tree)
| Gate | Result |
|------|--------|
| `tsc --noEmit` | clean |
| `npm run build` | ✓ 941ms |
| `e2e/freed-walkers.spec.ts` desktop+mobile | **4/4 pass** (plain-boot ghost + sim-purity fwcap=0 A/B) |
| Adjacent: e3-crawler-boss, e4-landyacht-boss, task-025, 055-baron-kill-stop (both projects) | 28 pass, 1 skip, 1 flaky (F-1) |
| `perf-02-fullbase-bench` desktop | pass · baseP95 34.00ms · worst-wave p95 ratio **1.71** / 2.8 budget · draw **196**/200 |
| `perf-02-fullbase-bench` mobile | pass · baseP95 33.30ms · worst-wave p95 ratio **1.76** / 2.8 budget · draw **178**/200 |
| Boot probe (zero console/page errors, desktop + 390px) | covered by freed-walkers spec test-a (plain boot) + perf-02 error assertions — clean |
| Screenshots | `reviews/shots-freed-walkers/{desktop-run-out,mobile-run-out,machine-slump}.png` present |

**Sim-purity**: the fwcap=0-vs-default A/B (same seed, same probe timestamp: identical wave/kill/gold) proves the ghost system cannot touch the sim — this is the strongest guard that the ≤10-line hook is presentation-only.
**Perf**: `FreedWalkerVfx` uses InstancedMesh (moths/run-dust/shutdown-smoke, sized `MAX_CAPACITY*N` at construction) + slot-recycle — allocation-free at steady state, hard-capped. p95 ratio well inside the 2.8 wave budget on both tiers; draw-calls under 200. No before/after delta run (checkout gated for the fire), but perf-02's within-run wave-vs-baseline ratio IS the regression guard and passes.

## Findings
- **F-1 (non-blocking, contention flake):** `task-025-bandits-dont-swim.spec.ts:111` (mobile-chrome, "enemy reaches hero through the ford only") failed once under the 30-test/2-worker adjacent battery; **passed in isolation single-worker (5.4s)**. Freed-walkers touches no enemy-movement/ford/wave code (disjoint), so this is the known gate-battery-contention false-red, not a regression. No corrective owed.
- **F-2 (pre-existing, NOT this slice, attended-owned):** `scripts/goal-tracker.test.mjs` "goal tree schema is valid" is RED — it hardcodes 5 expected top-level categories but `tasks/goals.json` now has 11 (attended's goal-tree expansion). Red on main before this drain. Its OTHER assertion ("merged leaves have a done receipt + ancestral merge") **passes** with this slice's `freed-walkers` leaf flipped to merged/`21658b09`. Fix owned by attended (on OWNER'S DESK since s658); not touched here (§7.6).
