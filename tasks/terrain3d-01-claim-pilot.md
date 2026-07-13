# terrain3d-01-claim-pilot — The Claim stands up (lane-a; commit prefix "feat:")
ROLE: run-scene terrain pilot. WORKDIR: lane-a (worktrees/lane-a). CODEX: model=gpt-5.6-sol effort=high
ATTENDED-AUTHORED 2026-07-14 — owner verdict GO ("How can I test the new map for the claim?"). Sol 3D-D's sculpted Claim terrain (assets/pilots/map-rebuild-spike/the-claim-terrain.glb, contract-verified) gets its default-off in-game mount.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): standard safe-dupe rules. If the stop-reason is an undrained sibling, report "LADDER-STALL: waiting on drain of <slice>" (fires re-queue, pre-authorized). Then `npm install --no-audit --no-fund`; `npm run build` green.

## READ-FIRST (the law lives here): artifacts/map-rebuild-spike/MODEL-HANDOFF.md IN FULL — it IS this slice's spec voice: sim stays planar; Terrain.visualY is the ONLY runtime height owner; every visible participant samples the same height source; buildings use padded-footprint samples; the mesh is NEVER collision/placement truth · the terrain contract JSONs (artifacts/map-rebuild-spike/*-terrain-contract.json — bounds/hash/planar metadata) · src/world/Terrain.ts + TileHeight.ts (GT-01's visualY seam — the socket this feeds) · the gt-02/gt-03 slices (how visualY already moves hero/enemies on the dev tile) · the ?town3dPilot/?run3dPilot pilot grammar (flag, dataset markers, fallback law).

## SCOPE:
1. `?terrain3dPilot` (default OFF, The Claim only this slice): mounts the-claim-terrain.glb as the run-scene ground; the painted tile hides ONLY while the GLB is loaded+contract-valid (tri/material/bounds check per the pilot inspect pattern); any failure → painted tile back.
2. HEIGHT FEED: derive a heightfield sample from the mounted terrain (bake a grid at load or read the contract JSON's field if provided) and feed Terrain.visualY for The Claim while the flag is on — hero, enemies, buildings (padded footprints per the handoff), pickups, motes, effects, shadows all ride the SAME source. Sim X/Z untouched (movement/collision/water/spawn/build stay planar — assert byte-identical sim via the determinism/first-claim fingerprint probes).
3. WATER AGREEMENT: the visible shoreline must keep describing the sim water mask — probe isWaterSourceAdjacent at 6 bank points and assert sluice placement still lands where the IMAGE says bank (the handoff's compromise is already sculpted this way — verify, don't re-sculpt).
4. e2e `e2e/terrain3d-claim-pilot.spec.ts`: flag-off boot byte-identical (zero GLB fetch, painted tile, flat fingerprint); flag-on: GLB mounted + painted hidden, hero/enemy/building render-y track the height source at 5 sampled points (no floaters/sinkers), sluice placement agrees, sim determinism fingerprint UNCHANGED vs flag-off, p95 ≤115%, LITE keeps painted, invalid-bytes falls back; zero console/page errors; both projects. gt-02-slope + task-025 + m1-01 UNMODIFIED-green.
5. Owner shots: the run camera on the sculpted Claim with a base built (artifacts/terrain3d-claim-pilot/).

## Firewall
Touch ONLY: the terrain pilot module (new, src/world/ or src/game/ per house layout), the Terrain.visualY feed seam (read GT-01's API — extend, don't rewrite), the ONE flag wire in Game.ts, the new spec, artifacts/. NO sim/collision/water/spawn/build logic, NO tile data, NO Sol's assets, NO other contracts.

## Self-check
tsc + build green · new spec + gt-02 + task-025 + m1-01 green both projects · determinism fingerprint identical flag-off · zero console errors · owner shots at exact paths. If you find yourself about to exit without changes, WRITE WHY into your report first.
END: READY-FOR-GATES + the height-source method (baked grid vs JSON field) + sample-point table.
