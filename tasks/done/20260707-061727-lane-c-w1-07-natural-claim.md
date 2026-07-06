# Task W1-07: the natural claim — dramatic terrain, rendering-only maximum (LANE-C, branch lane/polish, commit prefix "w1:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c. READ FIRST: AGENTS.md; specs/w1-river-valley/README.md W1-07 entry (SCOPE RAISED — owner escalation verbatim there; laws binding: rendering-only, legibility beats beauty, perf gates); src/world/Terrain.ts (sampleHeight + the anti-tiling material — you are EXTENDING W1-01's machinery, not replacing it). Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/polish main && git clean -fd`, proceed; STOP only on unmerged content/foreign edits); npm install; build green. NOTE: two other lane-c tasks (bt-02, correctives-0707) may run before or after you in this lane — each resets off main independently; you may land on a main that already carries them.

## Owner directive (the bar)
"Not a flat surface but real terrain with ups and downs and nooks and crannies… it will really add a lot." The tile-baseline LOOK dies in this slice — while the SIM stays perfectly planar (every height is render-side; movement/collision/routing byte-identical; the GT ladder handles physics separately).

## Scope
1. **Amplitude + features in `sampleHeight`** (render-side): raise `Balance.world.terrainRelief` headroom and ADD feature layers — erosion gullies feeding the river (branching channel noise), raised rock shelves/benches on the far bank, edge bluffs framing the claim boundary (tie into the vista ring so the valley reads carved, not placed), pocket depressions ("nooks") near scatter clusters. Keep the claim-side build zone CALM (the existing claimCalm mask — building placement must not read chaotic).
2. **Legibility law enforcement**: the ford remains THE readable crossing (its approach stays visually gentle); routing lanes stay visually plausible (enemies won't visibly walk through a rendered shelf — bias feature placement AWAY from the sim lanes: read the routing lane constants and mask features there, the W1-04 exclusion pattern).
3. **Material response**: slope-aware shading in the terrain shader (steeper render-slope = rockier blend from the existing texture set; gully floors darker/damp toward the river) — world-space, seam-safe with the vista ring.
4. **Scatter cooperation**: pass the new features to the W1-04 scatter seeds (rocks cluster on shelves, grass in pockets) via the existing density fields — no new scatter classes.
5. **Perf + mobile**: same vertex budgets (feature detail in the SHADER where possible, displacement octaves within the segment knobs); mobile tier keeps the calmer profile; perf snapshot before/after at wave-15 (draw calls + p95, >15% frame regression = fail loudly).
6. **e2e `w1-07-natural.spec.ts`**: relief range assertions raised to the new profile; ford-approach gentleness probe (height delta across the ford band under threshold); sim-drift proof = task-025 + m1-01 + m2-01 unmodified green; boot probes zero errors desktop + 390.

## Firewall
Touch ONLY: src/world/ (Terrain sampleHeight/material, vista seam, scatter seed fields), Balance ADDITIVE knobs, diagnostics additive, new spec. NO sim/routing/collision changes (planar law), NO camera changes, NO existing e2e edits.

## Self-check
tsc/build; new spec + battery green both projects; perf table recorded; before/after screenshots SAME poses (wide valley, ford approach, far-bank shelves, a "nook" close-up) into artifacts/w1-07/ — these four shots are the owner's judgment material for the whole terrain direction. Commit on lane/polish. End: READY-FOR-GATES + feature map description + perf table + results.
