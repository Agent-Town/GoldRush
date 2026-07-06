# Task W1-01: terrain relief + anti-tiling (LANE-C, branch lane/polish, commit prefix "w1:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c. READ FIRST: AGENTS.md; specs/w1-river-valley/README.md (laws are binding); docs/GOLD_RUSH_BRIEF.md §4.

## Pre-flight (worktree git is registered and native now)
`git checkout lane/polish && git reset --hard main && git clean -fd && npm install --no-audit --no-fund` (worktree may hold stale pre-merge state — reset is sanctioned HERE, once, at task start). Confirm `npm run build` green before touching anything.

## Goal
Robin: the flat tiled ground is "quite boring". Replace the flat world plane with a real 3D river valley — while the SIM stays byte-identical (rendering-only law).

## Scope
1. **Heightfield terrain**: replace the ground plane with a displaced mesh (segmented plane, ~1-2m resolution near the play area). Height = layered value noise, seeded from the run seed: gentle valley profile (banks slope down to the river line; far side rises slightly), claim-side flattened (buildable area stays visually calm), local flatten under placed buildings (pad radius from footprint). Amplitude tasteful: relief you FEEL at our oblique camera, not hills that hide enemies (legibility law).
2. **Anti-tiling**: world-space noise BLEND of the existing ground texture variants (2-3 layers: packed sand, dry dirt, sparse scrub band near water) + low-frequency macro tint variation + per-sample rotation/offset jitter. The repeat pattern in Robin's screenshot must be GONE at gameplay zoom (before/after screenshot from the same camera pose proves it).
3. **Render-side height placement**: hero, enemies, pickups, buildings, ghosts sample terrain height for their visual Y (a `TerrainHeightSampler` used ONLY at render/placement — physics/sim stay planar XZ; collision/routing/distances unchanged). Water plane meets the displaced banks without gaps (shoreline overlap or skirt — W1-02 refines the water itself; do NOT restyle water this slice).
4. **Perf**: static terrain geometry (build once per run), no per-frame displacement; measure draw calls + frame time at debugSpawn wave-15 load BEFORE and AFTER (record numbers in your report); mobile knob `Balance.world.terrainSegments` (or equivalent) for lower density at 390px project.
5. **e2e `e2e/w1-01-terrain-relief.spec.ts`**: terrain mesh present with >1 height value (not flat); hero/enemy visual Y tracks sampler while sim positions unchanged (diagnostics compare); ford routing e2e (task-025 suite) UNMODIFIED-GREEN as the sim-drift proof; boot probe zero console/page errors desktop + 390.

## Firewall
Touch ONLY: src/world/Terrain.ts (+ new files under src/world/), the render-side placement call sites (visual Y only — NO writes to sim positions/velocities/collision), src/game/Balance.ts (ADDITIVE `world` knobs), new spec. NO changes to: routing/ford logic, CombatSystem, Economy, WaveSystem, InputController, existing e2e. Commit on lane/polish, prefix "w1:", small commits.

Self-check: tsc/build; new spec green desktop+mobile; task-025 + m2-01 + m1-01 unmodified green; perf numbers recorded (fail loudly if frame time regresses >15%); before/after screenshots from the SAME camera pose into artifacts/w1-01/. End: READY-FOR-GATES + files + results + perf table.
