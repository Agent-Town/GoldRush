# Task tr-01: one ground, no seams — the continuous mesh (LANE-C, branch lane/polish, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c. READ FIRST: AGENTS.md; **specs/terrain-render/README.md (TR-01 slice — BINDING; the owner's tiles-are-temporary ruling is its header)**; the current tile-quad ground rendering (TerrainView) + GT-01 TileHeight (the heightfield the mesh samples); the tile-identity descriptors (palette/material params — TR-03 consumes them later; TR-01 must not break them). Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/polish main && git clean -fd`, proceed; STOP only on unmerged content or foreign edits); npm install; build green.

## Scope (TR-01 — the mesh, behind a flag; seams reduced, not yet gone — TR-02's splat kills them)
1. **Continuous ground mesh** per tile: one indexed grid mesh (resolution per Balance knob, ~1 vertex/wu default) displaced by the VISUAL height (the render-side relief the w1 machinery uses — sim untouched), replacing the tile-quad patchwork when `terrainMesh` flag is on (Balance/debug param; DEFAULT OFF).
2. **Same textures, same look**: the existing per-region tile textures apply via per-region UVs on the mesh (this slice changes GEOMETRY only — visible edges shrink at region borders because lighting/normals become continuous, but texture seams remain until TR-02; state this honestly in shots).
3. **Both paths gate-green**: flag-off = byte-identical current rendering (the fallback law); flag-on = all visual suites still pass (w1 suites tolerant of the mesh? run them flag-on and report — failures = findings, not silent fixes).
4. **Perf**: one draw call for the ground target; vertex count + frame p95 measured both flags at stress; mobile 390px within envelopes.
5. Side-by-side artifacts: same 3 poses (mid-claim, river bank, vista edge) flag-off vs flag-on — the owner's TR-02 verdict will build on these.

## Firewall
Touch ONLY: the ground mesh module (new), TerrainView integration behind the flag, the Balance knob, e2e, artifacts. NO sim/TileHeight changes, NO texture/splat work (TR-02), NO water rendering changes, NO camera, NO default-flag flip (owner's eye gates that).

## Self-check
tsc/build; flag-off: full w1 + m1-01 + m2-01 + task-025 byte-identical green both projects; flag-on: same suites run + report (findings listed); perf table both flags; zero console errors both flags; the side-by-side shots into artifacts/tr-01/. Commit on lane/polish. End: READY-FOR-GATES + the vertex/perf table + flag-on findings.
