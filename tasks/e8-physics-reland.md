# Task e8-physics-reland: RE-LAND E8 low-g physics onto fresh main (commit prefix "feat:")
# FIRE-AUTHORED (s755, attended review welcome) — the e8-physics work is DONE + gate-green on lane/m4 `1bafa1b4`; it only needs rebuilding against current main (Game.ts moved +497/−107 since its fork, a hot-file 3-way a headless fire cannot safely hand-weave — the sim-critical CombatSystem seams demand real 3-way).

You are Codex, implementer for Gold Rush (worktree per your lane).
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md · **`git show 1bafa1b4`** — this is the CORRECT, gate-green implementation (its own `e2e/e8-physics.spec.ts` passed; reproduce its intent faithfully) · the original design master `tasks/lane-e8-physics.md` (the WHY + the E8 low-g slice) · specs/epoch-saga/e8-orbital-bundle.md · current `src/game/Game.ts` (heavily moved since the reference's fork — you are weaving the reference's hooks into TODAY's Game.ts, not replaying an old diff).

Pre-flight (LANE-SAFETY, safe-dupe): confirm your lane worktree is clean and NOT ahead of main (`git -C <worktree> log main..HEAD` EMPTY — if it holds unmerged commits STOP and report). Reset to main, `npm install`, tsc+build green BEFORE editing.

## Why (goal-tree completeness sweep, owner 2026-07-18 "is there anything else missing?" — one of the last unarmed engine slices; spec BANKED in the bundle)
E8's signature feel: low-g movement/lob physics on orbital maps, sim-deterministic. The implementation exists and is correct on `1bafa1b4`; s755 could not drain it because Game.ts is a hot file with 11 scattered hooks (several REPLACING existing behavior at the combat/blast/actor-intent seams) and the fire's 3-way tooling is sandbox-gated — a hand-weave into a +497/−107-moved Game.ts risks silent corruption (Mistake #15). The runner re-lands it clean.

## Scope (reproduce `1bafa1b4` exactly — 5 files):
1. **NEW `src/systems/E8PhysicsSystem.ts`** (156 lines, additive) — a per-contract gravity/drift profile: `filterMovement`, `scaleLobAirTime`, `scaleKnockback`, `lobArcDistanceMultiplier`, `adaptShooter`, `reset`, `diagnostics` (Low Orbit + Eclipse flags first). Deterministic, fixed-timestep math only. Copy from the reference.
2. **`src/game/Balance.ts`** (+8, additive) — the `e8Physics` tunable block (floaty/free-fall thrust+drift response, zeroGravityLobArcDistanceMultiplier, knockbackScalePerLostG). Copy the reference values.
3. **`src/vite-env.d.ts`** (+9, additive) — `e8Physics` diagnostics type + the `e8PhysicsProfile`/`e8PhysicsProbe` window test hooks.
4. **`src/game/Game.ts`** (the intricate part — weave the reference's ~11 hooks into TODAY's Game.ts, matching current context, NOT old line numbers): import E8PhysicsSystem + loadContract; construct `e8PhysicsSystem` field; wrap E8ArsenalSystem's combat with the `adaptShooter` shim; `filterMovement`-wrapped intents in `updateActors` (both single + MP paths) via `e8PhysicsIntents`; `syncE8LobPhysics` for blast shooters; `scaleLobAirTime` on `launchLob`; blast-range `* lobArcDistanceMultiplier` at the two aim sites; `e8Physics` diagnostics line; `reset(mpLocalSlot)` on teleport + bare `reset()` on run-reset; the `e8PhysicsProfile`/`e8PhysicsProbe` test hooks. **Preserve every current Game.ts behavior main added since the fork — merge, do not overwrite.**
5. **NEW `e2e/e8-physics.spec.ts`** (160 lines) — copy from the reference.

## Firewall: TOUCH-ONLY `src/systems/E8PhysicsSystem.ts` (new) + its Game wiring seams in `src/game/Game.ts` + `src/game/Balance.ts` (e8Physics block) + `src/vite-env.d.ts` (e8 hooks) + `e2e/e8-physics.spec.ts`. CombatSystem stays the sole damage resolver (you ADAPT shooters, you do not resolve damage) · Economy sole gold writer · sim stays planar/deterministic (render-only visuals via visualY). NO other files.
## Self-check (ALL green BEFORE READY-FOR-GATES): tsc + build · `e8-physics.spec.ts` BOTH projects (desktop-chrome + mobile-chrome) · a combat/blast adjacent suite (e8-arsenal + one blast/aim spec) unmodified-green BOTH projects · zero console. Paste a per-item table.
No-op guard: exit-without-changes = WRITE WHY first.
END: READY-FOR-GATES + the per-item pass table.
