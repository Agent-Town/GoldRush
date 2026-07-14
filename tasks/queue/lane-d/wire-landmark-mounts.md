# wire-landmark-mounts — the county gets its furniture (lane-d; commit prefix "feat:")
ROLE: terrain pilot. WORKDIR: lane-d (worktrees/lane-d). CODEX: model=gpt-5.6-sol effort=high
ATTENDED-AUTHORED 2026-07-15 — Sol 3D-D's seven-map landmark wave is MERGED (36 GLBs, mount records in the terrain contract JSONs, terrain-conformed via visualY). The pilot must MOUNT them or nobody sees them (the owner's priority).

Pre-flight (LANE-SAFETY): standard safe-dupe rules; LADDER-STALL protocol stands. Then npm install; build green.

## READ-FIRST: the terrain pilot module (registry pattern — extend) · a terrain contract JSON's landmarkMounts records (id/asset/position/rotation/scale + landmarkMountSpace) · MODEL-HANDOFF §landmarks (visualY grounding, never collision owners) · the seam-fix slice (rim/apron behavior unchanged).

## SCOPE: (1) When ?terrain3dPilot mounts a map, ALSO mount every landmarkMounts record with an `asset` field: load the GLB (per-map single fetch where shared atlas allows; instance repeated assets), place at position/rotation/scale, ground via Terrain.visualY, render-only (no collision/placement — the handoff law); missing/invalid asset = skip with a diag note, never an error. (2) Disposal with the terrain. LITE = no landmarks. (3) e2e additions to the registry spec: per-map landmark count matches records-with-assets, grounded within epsilon of visualY at 3 sampled mounts, disposal clean, missing-asset tolerance; both projects. (4) Owner shots: each map's landmarks at the run camera.
## Firewall: the pilot module + registry spec (additive) + artifacts/wire-landmark-mounts/. NO Sol assets/JSONs, NO sim, NO seam-fix regressions.
## Self-check: tsc+build green · registry + claim suites green both projects · zero console errors. If you exit without changes, WRITE WHY first.
END: READY-FOR-GATES + per-map mount counts.
