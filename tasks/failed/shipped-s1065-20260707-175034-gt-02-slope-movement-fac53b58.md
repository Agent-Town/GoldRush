# Task GT-02: slope movement on a dev tile (LANE-D, branch lane/perf, commit prefix "gt:")

GATE: run ONLY after GT-01 has MERGED to main (verify its commit in git log; else STOP "GT-01 not landed"). You are Codex on Robin's Mac in worktrees/lane-d. READ FIRST: AGENTS.md; specs/gameplay-terrain/README.md (GT-02 + First-Claim Law binding); src/sim/TileHeight.ts (GT-01's API — consume it, don't fork it). Pre-flight: safe-dupe rule (ahead-merged commits → reset off main, proceed; STOP only on unmerged content/foreign edits); npm install; build green.

## Goal
Elevation affects MOVEMENT for the first time — on a dev-only test tile, never the claim.

## Scope
1. **Dev tile `gt-test-basin`**: a hand-authored elevation descriptor (analytic bowl + one ridge + one impassable cliff band) registered under the epoch-1 bundle as a DEV tile, loadable ONLY via `?tile=gt-test-basin` (debug-gated param). The classic claim remains untouched and default.
2. **Movement integration**: hero + enemy step resolution reads `simHeight/simSlope` — uphill speed multiplier down to `Balance.terrainSim.uphillMin` (~0.6 at slopeMax), downhill mild bonus (~1.1 cap), `isTraversable=false` blocks like a static blocker (reuses existing blocker resolution — no new collision system). On FLAT tiles the math must reduce to exactly 1.0× (identity guard).
3. **Render agreement on the dev tile**: the visual mesh on an elevation tile samples the SAME H (sim and render agree — the honest-function collapse the spec names); characters' visual Y = sim height there (visualY offset path).
4. **Balance ADDITIVE `terrainSim` block**: uphillMin, downhillMax, slopeMax — data, tunable.

## Firewall
Touch ONLY: movement step resolution (hero/enemy speed application point), TileHeight consumers as specced, the dev tile descriptor, Balance additive, Terrain render sampling FOR ELEVATION TILES ONLY (flat path byte-identical), diagnostics, new e2e. NO routing/nav changes yet (GT-03), NO LOS changes (GT-04), NO wave/spawn changes; classic-claim suites must stay untouched-green.

## Self-check
tsc/build. **First-Claim identity**: determinism fingerprint on the classic claim IDENTICAL pre/post (two hashes in report) + full adjacent battery green both projects. Dev tile e2e `gt-02-slope.spec.ts`: uphill traverse measurably slower than flat traverse (timed teleport-walk probes), cliff band blocks (enemy + hero), downhill ≥ flat, visual Y tracks sim H at 3 probes. Screenshots of the basin tile (wide + cliff close) into artifacts/gt-02/. Zero console errors. Commit on lane/perf. End: READY-FOR-GATES + measured speed ratios + results.
