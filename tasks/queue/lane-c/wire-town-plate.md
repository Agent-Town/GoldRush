# wire-town-plate — the town stands on real ground (lane-c; commit prefix "feat:")
ROLE: pilot wiring. WORKDIR: lane-c (worktrees/lane-c). CODEX: model=gpt-5.6-sol effort=medium
ATTENDED-AUTHORED 2026-07-13 — Sol session 3D-C's wave-1 plate MERGED (2b81dd4f, owner: "the foundation is good"); this mounts it. Sol iterates DETAIL on the same GLB path — this wire must keep working when town-plate.glb is replaced (no geometry assumptions beyond the contract).

Pre-flight (LANE-SAFETY): standard safe-dupe rules; LADDER-STALL protocol stands. Then npm install; build green.

## READ-FIRST: assets/pilots/town-plate-3d/ (GLB + verify_town_plate.py — the contract: base-center origin, plate spans the plaza, pads flat at building slots) · the ?town3dPilot dispatch pattern (TownScene.ts + TownTavernPilot.ts installTownBuildingPilot — but the plate is GROUND, not a building: new installer, same laws) · reviews/sol-3d-c-findings.md (what the plate wants from us) · docs/SOL-3D-C-QUEUE.md laws (flat-walk ±0.05; painted ground stays flag-off/LITE/failure default FOREVER).

## SCOPE:
1. `installTownPlatePilot`: mounts town-plate.glb at the plaza origin when ?town3dPilot is on ('all' or 'plate'); the painted ground plane HIDES only while the plate is loaded+valid (contract check per the pilot inspect pattern: tri cap 20k, 1 material, no lights/cameras); any failure → painted ground back, state 'failed'.
2. Actors/hero stay at y=0 (flat-walk law holds sim-side — the plate's relief is ≤0.037 so nothing needs re-anchoring; ASSERT via the town diagnostics that actor ground contact is visually clean at 3 loop points — screenshots).
3. Draw order/shadows: buildings + props + cast render above the plate exactly as above the painted ground (no z-fighting at pads — the pads are flat 0.0001; nudge the plate -0.002 if needed).
4. e2e `e2e/town-plate-blender.spec.ts` (clone the building-pilot grammar): flag-off zero-GLB + painted ground; flag-on plate loaded (contract numbers), painted ground hidden; invalid-bytes → painted ground; lite → painted; disposal clean; p95 ≤115%; zero console/page errors; both projects. Tavern + store specs UNMODIFIED-green.

## Firewall
Touch ONLY: the additive plate installer (TownTavernPilot.ts + TownScene dispatch entry), e2e/town-plate-blender.spec.ts, artifacts/wire-town-plate/. NO plate assets (Sol's territory), NO townLayout, NO actor/sim code, NO building pilots.

## Self-check
tsc + build green · plate spec + tavern + store green both projects · zero console errors · in-game screenshots (plate under the 3D town, actors grounded).
If you exit without changes, WRITE WHY first.
END: READY-FOR-GATES + the load/fallback state table.
