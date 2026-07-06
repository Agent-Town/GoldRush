# Task W1-06: the frontier beyond the claim (LANE-C, branch lane/polish, commit prefix "w1:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c. READ FIRST: AGENTS.md; specs/w1-river-valley/README.md (laws are binding, see the W1-06 slice entry); docs/GOLD_RUSH_BRIEF.md §4. W1-01 (terrain relief) and W1-02 (living water) are on main — build on both.

## Pre-flight (worktree git is registered and native now)
`git checkout lane/polish && git reset --hard main && git clean -fd && npm install --no-audit --no-fund` (reset is sanctioned HERE, once, at task start). Confirm `npm run build` green before touching anything.

## Goal
The world currently ends at the 64×64 claim plane: near the boundary you see terrain dissolve into fog (34→70) against the flat sky color — a floating diorama. Owner directive (Robin, 2026-07-06, after seeing W1-01): extend the terrain to the rest of the map. The claim must read as a worked plot inside a larger river valley, not the whole universe.

## Scope
1. **Vista ring mesh**: low-resolution surround terrain from the claim edge (±32) out to ~radius 90 (past the fog far plane at 70, so it fills every sightline to full fog). One mesh (ring with a hole, or an underlay plane — implementer's choice), displaced by the SAME height family: refactor `sampleHeight` so an UNCLAMPED variant continues the valley profile beyond bounds (banks keep rising away from the river; river channel continues along the river axis to the fog in both directions). The existing clamped `sampleHeight` keeps serving sim-adjacent callers — its return values for in-bounds coords must be BYTE-IDENTICAL to today.
2. **Seam law**: heights at the ±32 boundary must match the inner mesh exactly (same function family ⇒ agree at the boundary; align vertices or tuck a small overlap skirt UNDER the inner plane — no crack, no z-fighting at gameplay camera angles).
3. **Material continuity**: reuse the W1-01 anti-tiling bank material (world-space noise blending continues seamlessly across the seam). The river continuation may reuse the W1-02 water treatment at reduced cost, or a cheap tinted band if the shader budget is tight — but the water color/tone must match at the seam.
4. **Nothing lives out there**: no props, no collision, no routing/nav changes, no spawn changes. `Terrain.sample` zone logic, `bounds`, and every sim system: UNTOUCHED. Visual-only (this is the W1 rendering-only law).
5. **Perf**: target +1 draw call (+2 max if the river continuation needs its own mesh); vertex budget ≤ the inner terrain's; `Balance.world` additive knob for vista density with the mobile (≤430px) tier reduced; record perf snapshot before/after at wave-15 load (draw calls + frame time). The m2-01 stress budget (≤200 calls) must still pass.
6. **e2e `e2e/w1-06-vista.spec.ts`**: diagnostics expose vista {present, segments, radius}; assert seam continuity (probe unclamped height at ±32 equals clamped height at ±32 on a few points); boot probe zero console/page errors desktop + 390; in-bounds `sampleHeight` regression probes unchanged vs recorded W1-01 values.

## Firewall
Touch ONLY: src/world/ (Terrain.ts render-side + new file e.g. src/world/Vista.ts), src/game/Balance.ts (ADDITIVE knobs), diagnostics emitter + src/vite-env.d.ts (additive), the new spec. NO changes to: bounds/zone/sim geometry, routing/ford logic, spawning, CombatSystem/Economy/WaveSystem, existing e2e. Commit on lane/polish, prefix "w1:", small commits.

Self-check: tsc/build; new spec green desktop+mobile; task-025 + m1-01 unmodified green + m2-01 no NEW failures beyond the F-033-2 fingerprint (reviews/w1-01-terrain-relief.md §Findings — if 036 already landed on main, m2-01 must be fully 12/12); perf numbers recorded; before/after screenshots from the SAME camera pose at a claim-edge vantage into artifacts/w1-06/ (one looking outward past the boundary, one gameplay-normal). End: READY-FOR-GATES + files + results + perf table.
