# Task GT-01: heightfield substrate — elevation API with ZERO behavior change (LANE-D, branch lane/perf, commit prefix "gt:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d. READ FIRST: AGENTS.md; **specs/gameplay-terrain/README.md** (this is slice GT-01 — the First-Claim Law and Architecture sections are binding); src/meta/ContractFamilies.ts (SCI-04 epoch registry — tile descriptors ride bundles); src/world/Terrain.ts (the render-side height system stays SEPARATE for now). Pre-flight (runner-auto-commit aware): ahead lane commits already merged to main = SAFE DUPES → `git checkout -B lane/perf main && git clean -fd`, proceed; STOP only on unmerged ahead content or foreign edits. `npm install`; build green. (M6 attempt-4 may have landed on lane/perf→main just before you — normal, reset off current main.)

## Goal (owner burst directive 2026-07-07: "lets do the terrain rebuild")
Lay the SIMULATION elevation substrate with **provable zero behavior change**: an authoritative tile heightfield API that every future GT slice consumes — while every existing tile reports dead flat.

## Scope
1. **NEW `src/sim/TileHeight.ts`**: `simHeight(x, z): number`, `simSlope(x, z): {dx, dz}`, `isTraversable(x, z): boolean` — v1 implementation reads the ACTIVE TILE DESCRIPTOR and, for epoch-1's claim (and any tile without an elevation block), returns H≡0 / slope 0 / traversable everywhere. Pure, allocation-free, deterministic (static data only — no Date/random).
2. **Tile descriptor plumbing**: extend the epoch bundle tile/biome descriptor (SCI-04 registry) with an OPTIONAL `elevation` block (grid dims, cell size, height data ref or analytic params, slopeMax, waterline). Epoch-1's descriptor explicitly omits it → flat. The `epoch-2-steamworks` stub gains a COMMENTED example schema (locked stub stays content-less).
3. **Diagnostics**: `terrain.sim = {flat: boolean, tile: <id>}` + probe values at 3 points, exposed for e2e.
4. **NO consumer changes**: movement, routing, combat, camera, water, building — all UNTOUCHED this slice. The API exists, main flat tile proves identity.

## Firewall
Touch ONLY: the new src/sim/TileHeight.ts, the descriptor schema (additive optional block), diagnostics + vite-env.d.ts additive, new e2e. NOTHING may import TileHeight into a behavior path this slice (grep-proof it in your report). NO changes to Terrain.ts render heights, sim systems, Balance values.

## Self-check (identity is the whole gate)
tsc/build. **Determinism fingerprint**: seeded run probe (the m6-r3a pattern: two seeded runs, hash sim state) — hash IDENTICAL pre/post-change (run it on a scratch checkout of main first, record both). Full adjacent battery green both projects: task-025 + m1-01 + m2-01 + sci-01 + m4-06 (serial, scratch port). New `e2e/gt-01-substrate.spec.ts`: flat-tile API returns 0/traversable at probes; diagnostics present. Zero console/page errors. Commit on lane/perf. End: READY-FOR-GATES + the two fingerprint hashes + grep-proof of zero behavior imports + results.
