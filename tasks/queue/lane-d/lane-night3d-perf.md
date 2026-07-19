# Task lane-night3d-perf: Night Shift 3D frame collapse — P0 (LANE-D HEAD, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md · src/world/LightRig.ts + the night-shift lighting path (the lantern/night rig — THE SUSPECT: point lights × shadow-casting sculpted terrain) · src/world/Terrain3dClaimPilot.ts (mesh materials, shadow flags, panorama) · the 3D promotion's perf-gate evidence (its p95 table covered the-claim/e5-deepwater/e9-dome-basin — all DAYLIGHT; night was the miss) · Balance render block.

Pre-flight (LANE-SAFETY): standard safe-dupe; npm install; tsc+build green.

## Why (OWNER LIVE REPORT 2026-07-19: "testing the night shift map and there are crazy lags. I am just at wave 7 but the gameflow stops completely." — P0; attended attribution probe: 3D vs 2D on night-shift = ~2.6× p95 penalty + 1-2s max stalls, freed-walkers exonerated via fwcap=0)
## Scope
1. PROFILE ON REAL GPU (headed local run, spector-style counters or renderer.info): identify the night-specific cost — shadow-casting light count × sculpt, shadow-map size/updates per frame, material features, panorama at night. Name the culprit with numbers in your report.
2. FIX to the culprit, tunables in Balance.render/night: typical shapes — cap shadow-casting lights (nearest-N lanterns cast, rest illuminate-only) · static shadow maps for static terrain (update-on-change, not per-frame) · terrain receives-but-doesn't-cast · panorama excluded from lighting. Choose by measurement, not vibes.
3. THE PERF LAW EXTENDS: the promotion's frame gate matrix permanently gains e1-night-shift (the lighting worst-case) — spec asserts p95 within 15% of the 2D baseline on night-shift under simulated wave pressure (spawnPack ladder), plus the existing daylight maps stay green.
4. Spec e2e/night3d-perf.spec.ts (both projects): the p95 gate + zero console + visual sanity screenshot (the night look survives the optimization — lanterns still read as light).
## Firewall: TOUCH-ONLY lighting/shadow/material config + Balance.render + your spec. NO sim changes, NO art changes, NO gameplay-visible light radius changes (the night MECHANIC keeps its truth).
## Self-check: tsc+build · your spec + w1-01 + freed suites green · zero console.
END: READY-FOR-GATES + the culprit-with-numbers + before/after p95 table.
