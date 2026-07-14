# fix-terrain3d-seams — the county meets its edges honestly (lane-a; commit prefix "fix:")
ROLE: terrain pilot. WORKDIR: lane-a (worktrees/lane-a). CODEX: model=gpt-5.6-sol effort=high
ATTENDED-AUTHORED 2026-07-14 — owner tour findings (3 screenshots): (1) "the seams have an issue with the floor" — a HARD DIAGONAL EDGE where the sculpted terrain ends and the old painted ground continues; (2) "the horizon and panorama are still the old style" — the v2 panoramas don't read in-game; (3) landmarks absent (EXPECTED — mounted packs are a granted Sol wave; not this task).

Pre-flight (LANE-SAFETY): standard safe-dupe rules; LADDER-STALL protocol stands. Then npm install; build green.

## VERIFIED ROOTS (re-trace, then fix):
- SEAM: terrain GLBs span ±32 (contract boundsMeters) but the tile's painted/procedural ground extends far beyond as the apron; the pilot hides ONLY the mesh flagged `terrainRelief === true` (Terrain3dClaimPilot.ts:208 via Game.ts:1116 — ONE child), so beyond ±32 the un-hidden painted apron abuts the grit mesh in a hard diagonal cliff of style. ALSO: multiple ground meshes carry the flag (Terrain.ts:551 + ContinuousGroundMesh.ts:60) but Game.ts:1116 `.find()`s only the FIRST.
- PANORAMA: the pilot has panorama code (34 refs) — establish in a headed probe WHY it doesn't read: mounted-but-fog-eaten (the light-ramp fog at the panorama radius), mounted-but-wrong-scale/position, or not mounted on non-claim maps. Convict with evidence before fixing.

## SCOPE:
1. THE APRON BLEND: while terrain is mounted, the painted apron REMAINS VISIBLE beyond the terrain bounds (it is the far ground) but the MEETING is honest: hide ALL relief-flagged meshes within the terrain's footprint (every flagged mesh, not `.find()`), and add a SKIRT BLEND at the terrain's rim — the terrain edge fades/feathers into the apron tone (alpha-fade rim band or a matched-tone border strip; pick what the mesh supports; document). No hard style cliff at any camera angle.
2. PANORAMA READS: convict the root per map; fix so the v2 rings actually show at the horizon (fog interaction: panoramas render beyond fog — either exclude from fog or mount inside the fog far plane per the contract transform; verify against night-shift's dusk ramp too).
3. e2e additions to the registry spec: an edge-camera probe asserts no raw terrain-rim pixel column (sample the rim band: style-cliff detector — terrain tone vs apron tone gradient must be smooth over N px), and a horizon probe asserts panorama visibility (texture/mesh present in frustum at the run camera).
4. Owner shots: the same three angles from his screenshots, fixed.

## Firewall
Touch ONLY: the terrain pilot module (hiding/skirt/panorama mount), the registry spec (additive probes), artifacts/fix-terrain3d-seams/. NO Sol GLBs, NO Terrain.ts sim/height code, NO fog system globals (pilot-scoped material/layer flags only), NO landmark work.

## Self-check
tsc + build green · registry + claim-pilot suites green both projects · zero console errors · the three before/after pairs.
If you exit without changes, WRITE WHY first.
END: READY-FOR-GATES + the panorama conviction (per map) + the skirt method chosen.
