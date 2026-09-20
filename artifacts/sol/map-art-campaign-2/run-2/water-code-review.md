# Shared E5 candidate review

Compared the preserved candidate against HEAD 401fb03d; identified one rendering-order regression. Static inspection found no additional concrete river, geometry, gameplay-height/collision, disposal, or current hull-transform regressions; opacity and crest tuning remain optional visual polish. No edits, tests, servers, or nested reviewers were used.

Review comment:

- [P2] Preserve mast-over-apron ordering when splitting the panorama — /Users/robin/Claude/Projects/Gold Rush/worktrees/lane-c/src/world/Terrain3dClaimPilot.ts:673-675
  In E5 overview views, including `LanternWorldStage`’s `frameBounds` camera, the apron can now overwrite the lower visible portions of distant wreck masts. The `sky` group also contains mast faces that `build_contract_panoramas.py` originally appends after the skirt. Splitting these into separate materials reverses that ordering: Three.js sorts the opaque draws by material ID, placing the newly cloned apron material last. Both materials disable depth writes and force the same far-plane depth, so depth testing cannot preserve the foreground masts where their projections overlap the apron. Keep the mast faces in an explicitly later draw. The new count/loading assertions cannot detect this regression.

## Resolution

Confirmed by a GPU pixel negative control: a red foreground mast at world y=-1 was overwritten by the blue apron (red channel 0). The routing now retains the factory's 16 post-apron mast triangles in a child draw with a later explicit render order. Positions, triangles and UVs are unchanged. A new hostile-overlap fixture passes on desktop and mobile after the correction, including zero console/page errors. Initial fixture runs with a synthetic HTML route encountered missing Vite globals and Chrome local-network HMR errors; the fixture now opens the real application document. Logs are preserved in `_raw/run-2/order-*`.
