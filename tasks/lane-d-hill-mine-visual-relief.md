# Task hill-mine-visual-relief: the terraces become VISIBLE — heightfield tiles render through the mesh (LANE-D, branch lane/perf, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d. READ FIRST: AGENTS.md; the Hill Mine tile (merged — sim-correct, VISUALLY FLAT: owner "looks very similar… the ground tile is the same", gate artifact confirms); TR-01's continuous mesh (displaces by heightfield — THE renderer these tiles need) + TR-02 splat (both flagged); the tile descriptor system; ter-hillmine-atlas raw (batch-010 — PROCESSING AUTHORIZED this task: `node scripts/extract-alpha.mjs` per LEDGER row, full-bleed handling per its notes); the e2 bundle §B elevation table (the amplitudes the VISUAL must match). Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/perf main && git clean -fd`, proceed; STOP only on unmerged content or foreign edits); npm install; build green.

## The gap (owner finding 2026-07-08 ~13:05 + artifact-verified)
TileHeight is SIM-ONLY on the default render path; GT tiles ship invisible mountains. The Hill Mine — whose identity IS its terraces — reads as the flat claim with rails.

## Scope
1. **Heightfield tiles opt INTO the mesh renderer by data**: tile descriptors gain `render.terrainMesh: 'required'|'preferred'|'off'` — the Hill Mine (and gt-test-basin) declare `required`: the TR-01 mesh path activates FOR THAT TILE regardless of the global flag (the global default stays off for flat tiles until the owner's TR verdict; per-tile requirement is a DATA decision the tile makes about itself). Splat inherits per the same field once the owner flips TR-02.
2. **Amplitude truth**: the mesh displacement on the Hill Mine must match the bundle's elevation table — terrace steps read as REAL LEDGES at gameplay zoom (side-by-side acceptance vs the current flat artifact: an unmistakable hillside).
3. **The atlas**: process ter-hillmine-atlas (authorized) and wire it as the tile's ground texture family (mesa-rock terrace faces vs sand flats per the descriptor zones); placeholder fallback stays lawful if extraction QA fails (report it).
4. **Face shading**: terrace faces (steep-normal regions) get the slope-aware darker shading family (w1's rocky-shading pattern) so ledges read even where the atlas is subtle.
5. **Perf**: the mesh-on tile within envelopes both projects (the tile is 140×140-class — vertex budget stated).

## Firewall
Touch ONLY: the per-tile render field + its activation wiring, hill-mine + basin descriptors, the atlas processing + wiring, face shading hookup, e2e, artifacts. NO sim changes (heights identical — hash-asserted), NO global flag flips, NO claim/identity-tile visual changes (their descriptors say nothing → unchanged).

## Self-check
tsc/build; extended hill-mine e2e: mesh auto-active on the tile (diagnostics) · sim hash unchanged · flat tiles unaffected (claim byte-identity) · terrace visual heights sampled ≈ sim table; gt+tr suites + m1-01 + m2-01 + task-025 green both projects; zero console errors; **THE shot: terraces-wide, before/after side-by-side** into artifacts/hill-mine-relief/. Commit on lane/perf. End: READY-FOR-GATES + the before/after called out + results.
