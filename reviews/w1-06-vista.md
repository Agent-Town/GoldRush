# Drain review — w1-06 "vista beyond the claim" (lane/polish)

**Verdict: GATE-PASS — merged to main (s80 fire, 2026-07-06).**
Branch `lane/polish` @ `d109904` (base `7404e36`, TODAY — fresh, clean 3-way auto-merge, zero conflicts).

## Scope merged
Low-res radius-90 terrain "vista" ring rendered beyond the playable claim (distant horizon fill), exposed via `__THREE_GAME_DIAGNOSTICS__.terrain.vista`. Files: `src/world/Terrain.ts` (+202), `src/game/Game.ts` (+1), `src/game/Balance.ts` (+2 additive knobs), `src/vite-env.d.ts` (+14 diagnostics typing), `e2e/w1-06-vista.spec.ts` (new), `artifacts/w1-06/*.png` (before/after gameplay + outward shots — the in-world visual evidence).

## Evidence
- `npx tsc --noEmit` — clean.
- `npm run build` — clean (bundle warning pre-existing, unrelated).
- **Slice spec `e2e/w1-06-vista.spec.ts` — 4/4 PASS both projects** (desktop-chrome 1280×800 + mobile-chrome 390×844): "vista diagnostics expose a low-res radius-90 terrain ring" + "vista seam and W1-01 in-bounds height probes stay stable" (the terrain-regression guard — the W1-01 recorded height probes hero/river/ford/nearBank/farBank all held). Zero console/page errors in-spec.
- Gated on scratch dev-server port 5233 (default 5188 held by the live lane runner's servers).

## ENV EXCEPTION (with proof) — m1-01 fps floor + death-flow timing
`e2e/m1-01-claim-jumpers-death.spec.ts` `:95` (fps floor `frames>=12`) and `:29` (death→restart flow) FAIL — but they **fail identically on clean main under the same load**, so they are environmental, NOT a vista regression:
- Clean main, desktop-only: `:29` fail, `:95` fail (**frames=7**), `:69` geometry-growth PASS, +1 PASS.
- Merged, desktop-only: `:29` fail, `:95` fail (**frames=6**), `:69` geometry-growth PASS, +1 PASS.
- **Identical failure set.** The host is CPU-saturated: two Codex lane tasks (lane-a demo-profiles-v2, lane-b m4-re-land) were running live in worktrees plus vite dev servers during the gate. The `frames>=12` floor assumes an idle machine (its own comment: "Headless SwiftShader ~17-22 fps… floor catches sim-cost explosions only; the real 60fps gate runs on hardware at milestone playtests, CLAUDE.md §9").
- **The load-independent perf/geometry assertions HELD on the merged tree:** `renderer.calls <= 200` (draw-call budget) ✓, `stressCount === 120` ✓, `enemiesAlive === 96` ✓, and `:69 double-restart-no-geometry-growth` (the test that would catch a vista geometry leak) ✓. So the vista does not blow the draw-call budget nor leak geometry across restarts.

## Notes for the next fire
- The two remaining resolved lane branches (`save/w1-04-scatter`, `lane/m6-r3a-apply`) **overlap this branch on Game.ts/Terrain.ts/Balance.ts** — NOT disjoint, so drain strict-serial and re-classify each against the new main (post-vista). Defer `lane/m6-r3a-apply` to attended review: it carries a parked M6 salvage commit (`72db71b`) + Game.ts +124/-63, premature for the current milestone.
- Recommend re-confirming the fps profile on an idle host at the next hardware playtest (vista gave frames=6 vs main=7 under saturation — noise-dominated at that floor, but worth an idle-machine eyeball).
