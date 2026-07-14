# terrain3d-02-registry — five maps stand up, with skies (lane-a; commit prefix "feat:")
ROLE: run-scene terrain pilot. WORKDIR: lane-a (worktrees/lane-a). CODEX: model=gpt-5.6-sol effort=high
ATTENDED-AUTHORED 2026-07-14 — Sol 3D-D's full E1 family is MERGED (grit-passed FIGHT-verdict terrains + mounted panoramas for all five maps, mounts in the contract JSONs). The Claim pilot proved the seam (terrain3d-01); this extends it to the family.

Pre-flight (LANE-SAFETY): standard safe-dupe rules; LADDER-STALL protocol stands. Then npm install; build green.

## READ-FIRST: the landed terrain3d-01 slice (the pilot pattern: mount, visualY feed, water agreement, determinism fingerprint — EXTEND, don't rewrite) · assets/pilots/map-rebuild-spike/ (five terrain GLBs + five panorama GLBs + per-map contract JSONs incl. PANORAMA MOUNT transforms) · artifacts/map-rebuild-spike/MODEL-HANDOFF.md (the exterior/panorama policy) · the PANORAMA LAW (docs/SOL-3D-D-QUEUE.md: render-only, never touches bounds/spawns/fog/masks).

## SCOPE:
1. REGISTRY: `?terrain3dPilot` becomes contract-keyed — a data registry (contract id → terrain GLB + panorama GLB + mounts from the contract JSONs) covering all five E1 maps; The Claim keeps working identically (its spec unmodified-green proves no regression).
2. PANORAMA MOUNT: the backdrop ring mounts at its recorded transform, render-only, beyond the playfield — verify fog-gating/spawn edges/bounds are bit-identical (the determinism fingerprint per map, flag-off).
3. Per-map water agreement probes (the terrain3d-01 grammar ×5) + per-map p95 ≤115%.
4. e2e `e2e/terrain3d-registry.spec.ts`: each of the five contracts boots flag-on with its terrain+panorama mounted (probe per map), flag-off byte-identical fingerprints, LITE painted, invalid-bytes fallback per map; zero console; both projects. terrain3d-claim-pilot spec UNMODIFIED-green.

## Firewall
Touch ONLY: the terrain pilot module (registry extension), the new spec, artifacts/terrain3d-registry/. NO Sol assets, NO sim/masks, NO tile data, NO promotion (default stays OFF — the owner tours first).

## Self-check
tsc + build green · new + claim-pilot suites green both projects · zero console errors · five owner shots (each map at the run camera, terrain + panorama).
If you exit without changes, WRITE WHY first.
END: READY-FOR-GATES + the per-map fingerprint/p95 table.
