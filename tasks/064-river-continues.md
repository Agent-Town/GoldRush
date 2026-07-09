# Task 064-river-continues: The Claim's river flows past the edges and into the distance (lane-c, RENDER-ONLY; commit prefix "feat:")
**OWNER ORDER 2026-07-09 (verbatim, two screenshots — the water plane stops dead at the playfield edge, bare sand beyond): "on the left and right side of The Claim, the river does not continue. I would like it to continue and also continue into the distance."**
You are Codex in worktrees/lane-c. Pre-flight per LANE-SAFETY. READ FIRST: the Claim's river/water rendering (Terrain/water plane — where the band is built and bounded), the W1-06 vista-beyond-the-claim state (`tasks/lane-c-w1-06-*.md` / its review if shipped — extend the same vista layer; if unshipped, build the river strip standalone on the same pattern), the rendering-only law (CLAUDE.md §4.6: sim planar, visuals never gameplay).

## Scope — visuals ONLY, the sim's river zone is UNTOUCHED
1. **Continue the river along its flow axis** beyond the playable bounds on BOTH sides: the same water material/band extends through the vista ground so it reads as one continuous river entering and leaving the claim, not a placed rectangle. Kill the raw water-plane corners visible in the screenshots.
2. **Continue into the distance:** the river recedes toward the horizon in the vista (a gentle meander is welcome, warmer than a ruler line), fading with the existing distance treatment (fog/haze) so it ends by atmosphere, not by geometry edge.
3. **Banks:** the vista river carries matching bank darkening/bed tint so the sand→water transition out there matches the in-claim look.
4. Budget: ≤2 added draw calls; frame p95 regression ≤5% on the perf probe; works with terrainMesh flag on AND off (both render paths).

## Firewall
Touch ONLY: river/vista rendering + its e2e + artifacts. **NO sim/zone changes (pan/sluice placement rules identical — assert), NO Balance, NO tile descriptors' gameplay fields, NO other contracts' visuals.**

## Self-check
tsc/build · The Claim boots: river continuous at both edges + visible receding into distance (screenshot both ends + a wide shot, desktop + 390px) → `artifacts/064/` · determinism/zone e2e: pannable/sluice zones byte-identical · m1-01/m2-01/tr/w1 adjacents green · draw-call count before/after · zero console.
End: **READY-FOR-GATES** + the screenshots + the draw-call delta.
