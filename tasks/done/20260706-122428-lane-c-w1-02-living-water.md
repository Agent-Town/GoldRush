# Task W1-02: living water (LANE-C, branch lane/polish, commit prefix "w1:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c. READ FIRST: AGENTS.md; specs/w1-river-valley/README.md (laws are binding); docs/GOLD_RUSH_BRIEF.md §4. W1-01 (terrain relief) is MERGED on main — build on it.

## Pre-flight (worktree git is registered and native now)
`git checkout lane/polish && git reset --hard main && git clean -fd && npm install --no-audit --no-fund` (reset is sanctioned HERE, once, at task start). Confirm `npm run build` green before touching anything.

## Goal
The river currently reads as a flat tinted plane. Make it LIVING water — while the SIM stays byte-identical (rendering-only law). This is the second of the two slices Robin judges the whole 3D direction on: it must be beautiful AND legible.

## Scope
1. **River shader**: animated flow along the river axis (scrolling/warped normals or noise — shader time uniform, no CPU per-frame geometry), subtle ripples, depth tint (deeper = darker center, shallows lighter), soft bank foam line where water meets the W1-01 banks (no hard seam — use the existing shoreline overlap/skirt; Terrain exports WATER_Y and sampleHeight).
2. **Ford legibility (LAW)**: the ford renders as visible stepping stones / pale shallows band — it must read as THE crossing at gameplay zoom, stronger than today, never weaker. River elsewhere must read as a barrier for bandits.
3. **Gold glints**: sparse, subtle sparkle near pan spots (harvest anchors) — a promise of gold, not a firework; Frontier Ledger restraint (brief §4: engraved, parchment-warm, never photoreal bloom soup).
4. **Perf**: shader-time animation only; measure draw calls + frame time at debugSpawn wave-15 load BEFORE and AFTER (record numbers); mobile knob (e.g. `Balance.world.waterQuality` or reuse segment knob) to degrade ripple/foam cost at 390px.
5. **e2e `e2e/w1-02-living-water.spec.ts`**: water material present + time uniform advances between frames (diagnostics); ford routing e2e (task-025 suite) UNMODIFIED-GREEN as the sim-drift proof; boot probe zero console/page errors desktop + 390 (fold into every test per house pattern).

## Firewall
Touch ONLY: water rendering (src/world/ — new files fine, e.g. src/world/Water.ts), src/world/Terrain.ts ONLY if the shoreline seam needs it (render-side), src/game/Balance.ts (ADDITIVE knobs), diagnostics in src/vite-env.d.ts + the diagnostics emitter (additive), new spec. NO changes to: routing/ford LOGIC, riverSide/ford sim geometry, CombatSystem, Economy, WaveSystem, InputController, existing e2e. Commit on lane/polish, prefix "w1:", small commits.

Self-check: tsc/build; new spec green desktop+mobile; task-025 + m2-01 + m1-01 unmodified green; perf numbers recorded (fail loudly if frame time regresses >15%); before/after screenshots from the SAME camera pose into artifacts/w1-02/ (one wide + one close on the ford). End: READY-FOR-GATES + files + results + perf table.

KNOWN-RED caveat (s61, 2026-07-06): m2-01 currently fails 5 tests at main HEAD — pre-existing F-033-2, corrective task 036 queued in main, fingerprint in reviews/w1-01-terrain-relief.md §Findings. Those exact 5 are NOT yours; your m2-01 bar is "no NEW failures beyond that fingerprint" until 036 merges (re-run against updated main if it has). task-025 + m1-01 + your new spec remain hard unmodified-green requirements. Do NOT touch m2-01 or anything in 036's firewall.
