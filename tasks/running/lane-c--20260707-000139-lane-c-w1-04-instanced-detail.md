# Task W1-04: instanced detail scatter (LANE-C, branch lane/polish, commit prefix "w1:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c. READ FIRST: AGENTS.md; specs/w1-river-valley/README.md (W1-04 slice; laws binding); docs/GOLD_RUSH_BRIEF.md §4. W1-03 (light/shadows) should be on main before this runs — its lighting is what makes scatter read.

## Pre-flight
`git checkout lane/polish && git reset --hard main && git clean -fd && npm install --no-audit --no-fund` (sanctioned once). `npm run build` green first.

## Scope (spec W1-04, condensed)
1. Seeded scatter (same seed system as terrain) of low-poly/billboard micro-detail: rocks, stumps, dry grass tufts, wagon ruts, claim posts — Frontier Ledger palette, procedural geometry/canvas textures only (NO art generation).
2. **THREE.InstancedMesh per detail class** — draw-call budget: ≤1 call per class, ≤6 classes; m2-01 stress ≤200 must hold with scatter ON.
3. **Placement law**: visual only — excluded from routing lanes, build pads (pad flatten radius), river/ford water, and a clear radius around harvest anchors + buildings; terrain-height placed via `visualY`; never occludes gameplay readability (legibility law — sparse near the combat lanes, denser at edges).
4. `Balance.world` density knobs desktop/mobile (≤430px reduced or off-tier); seed-stable across boots for a given seed.
5. **e2e `e2e/w1-04-detail.spec.ts`**: diagnostics {instanceClasses, totalInstances, densityTier}; assert instances avoid exclusion zones (probe a build pad + ford + a routing lane point); boot probe zero errors desktop + 390.

## Firewall
Touch ONLY: src/world/ (new Scatter module), Balance ADDITIVE, diagnostics additive, new spec. NO sim/routing/spawn/camera changes; no existing e2e edits. Commit on lane/polish, "w1:" prefix.

Self-check: tsc/build; new spec green both projects; task-025 + m1-01 + m2-01 unmodified green; perf snapshot before/after (draw calls + p95); before/after screenshots SAME pose (wide + combat-lane close) into artifacts/w1-04/. End: READY-FOR-GATES + files + results + perf table.
