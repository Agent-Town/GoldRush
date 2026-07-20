# Review — lane/m4 collision-depenetration + landmark-brightness (drain)

**Slice/branch/tip:** lane/m4 (lane-b) `536ae929` (collision-depenetration) + `73996ff5` (landmark-brightness) → merged to main `109e76cc`
**Base:** merge-base `4ea4b2e1`; main was +1 disjoint art commit (`1c1d8e71` art-y29 — touched only `logs/dashboard.html` + queue bookkeeping, zero overlap with the 17 lane files) → **clean additive graft, no 3-way needed.**
**Verdict:** ✅ MERGED (s756 fire).

## What it does (player-visible)
Two attended-diagnosed playtest correctives, reproduced by the runner on lane-b:
1. **collision-depenetration / never-trap** — `depenetrateFromBlockers`/`blockerContains` (`src/world/LandmarkCollision.ts`) are now wired into actor terrain sampling and the repair-overlap path in `Game.ts`: the prospector, allied actors, and enemies are pushed out of building/palisade/landmark footprints instead of getting stuck inside them. Closes the "never-trap" P0 (actors frozen inside a repaired/rebuilt structure).
2. **landmark-brightness / perf-collapse** — the auto-tier toast is now graduated per verdict tier (`Dimming the lanterns` → `Trimming the night lights` → `Switching to the painted map`), and the runtime perf verdict is skipped while the 3D pilot is still loading (`terrain3dPilotState/run3dPilotState === 'loading'`), so a load-spike no longer trips an honest auto-degrade. Fixes the night-wrap landmark-darkness leak + the perf-collapse chain attended folded into this corrective (`4ea4b2e1`).

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | ✓ built in 1.28s |
| `e2e/never-trap.spec.ts` | 2/2 desktop + mobile (batch run) |
| `e2e/landmark-brightness.spec.ts` | 4/4 desktop + mobile (isolated single-worker, 26s) |
| `e2e/night3d-perf.spec.ts` | 4/4 desktop + mobile (isolated single-worker; desktop 2.7m, mobile 2.2m) |
| Boot | full 3D game boots + runs Night-Shift pressure waves in every perf/collision spec, both projects, no page crash |

**Contention note (F-1, non-blocking, proven):** the first combined battery (default workers, desktop+mobile+3 specs concurrent) showed 4 reds — `landmark-brightness` + `night3d-perf`, both projects — all failing at `bootPressure`'s frame-climb (`frame > 20` / Begin click) under load. The box was carrying a live art codex (y30 plates, gpt-5.6-sol) + a leftover vite (:5207) + the accounts-playwright orphan. Re-run **single-worker in isolation, every one passes green** (documented above). This is the known gate-battery-contention false-red pattern, not a regression.

## Scope check (031 gate-rider)
Diffed the graft vs main HEAD: the only removal is `autoTierToastShown` (the old single-shot toast guard), legitimately replaced by the per-tier `announce()` — within the toast-law firewall (`4ea4b2e1`). No out-of-firewall removal of committed code.

## Findings
- **F-1** (above) — contention false-reds, non-blocking, proven by isolated re-runs.
- No goal-tree leaf (ad-hoc playtest correctives, not a spec-ladder rung) — nothing to flip in `tasks/goals.json`.
