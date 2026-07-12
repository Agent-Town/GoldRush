# terrain-seamless — the ground stops confessing its tiles
ROLE: terrain render. WORKDIR: lane-c (worktrees/lane-c), after e2-arsenal.
CODEX: model=gpt-5.6-sol effort=high

## WHY (owner 2026-07-12, verbatim): "Same goes for the levels with the ground tiles. If the tile lines in the game would not be visible anymore, then that would add a lot to the game."
Evidence: his Dry Gulch screenshot — visible repeating tile seams across the flats. Map-beauty-dry-gulch added anti-tile for ONE map; this is the GLOBAL slice.
## READ-FIRST: reviews/map-beauty-dry-gulch.md (the anti-tile technique that shipped) · src/world/Terrain.ts + ContinuousGroundMesh.ts (ground material/UV pipeline) · the atlas convention (ter-*-atlas 2x2 tileable) · e2e/w1-01 + tr-01 + gt suites (determinism + identity guards) · config/release-budget.json.
## SCOPE
1. A shared de-tiling treatment on the ground material for ALL tiles: macro-variation (large-scale noise blend between atlas cells / rotated re-sample / detail overlay) so no repeating seam or grid line survives at gameplay zoom. Render-only; sim untouched; deterministic (seeded per tile, no Date/random-per-frame).
2. Apply to the Claim, Dry Gulch (upgrade its local fix to the shared path), Night Shift, Twin Banks, Hill Mine; per-tile knobs stay data.
3. Perf: within release budget FULL + LITE (LITE may use a cheaper single-octave variant); draw-call delta reported.
4. e2e: a seam-detector probe (sample a horizontal strip's pixel variance across former seam positions — asserts no periodic edges) + all terrain suites unmodified-green; determinism fingerprints unchanged.
## TOUCH-ONLY: world render materials/shaders, tile render params, one e2e, artifacts/.
## NO: heightfields/gameplay terrain, atlas art regeneration, Balance, sim.
## SELF-CHECK: tsc; build; w1-01 + tr-01 + gt suites + e2-hill-mine + dry-gulch relief green BOTH projects; zero console; before/after at 3 zooms on 3 maps; perf table.
END: READY-FOR-GATES + the seam-probe evidence + perf table.
