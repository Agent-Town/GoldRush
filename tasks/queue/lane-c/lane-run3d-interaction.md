# Task lane-run3d-interaction: run3d interaction (LANE-D, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md · reviews/playtest-2026-07-18-night.md (the owner's finding this task exists for — his words are the acceptance test) · src/systems/BuildSystem.ts (ghost + placement raycast/picking) · src/world/Terrain3dClaimPilot.ts (the mesh + visualY source) · src/world/Terrain.ts (isWaterSourceAdjacent — the SIM water truth) · e2e/w1-01-terrain-relief (visualY precedent)

Pre-flight (LANE-SAFETY): standard safe-dupe rules; npm install; tsc+build green.

## Why (OWNER PLAYTEST, 2026-07-18 night, the 3D Claim)
P0 — 'I can't place the sluices next to the water. I can't preview buildings I build.' Under default-3D the build previews/ghosts render at the flat plane (buried under the sculpted mesh) and click-picking may ray against the mesh instead of the LOGICAL plane — placement aim and water-adjacency drift. The interaction layer must be promoted like the render was.

## Scope
1. PICKING IS PLANAR: all build/interaction raycasts hit the virtual y=0 sim plane (never the sculpted mesh) — clicks map to the same sim coords as 2D; assert coordinate-identity in the spec (same click → same sim point, 3D vs terrain2d).
2. PREVIEWS RIDE THE TERRAIN: ghosts, placement markers, range rings, and validity tints render AT visualY over the sculpt (the one-way height flow) — visibly on the surface, red/green readable.
3. SLUICE PROOF: on the-claim in default 3D, a sluice places at the river bank exactly where 2D allows it (spec drives the real click path; both projects).
4. Spec e2e/run3d-interaction.spec.ts + adjacents: w1-01, e9-canal-stages, the build suites.
## Firewall: TOUCH-ONLY BuildSystem's picking/preview render seams + the visualY consumers + your spec. NO placement-rule changes, NO Terrain mask changes. THE SIM STAYS PLANAR (CLAUDE.md §4.6): all gameplay positions/collision/picking live on the flat plane; the 3D mesh is render-only; visual height flows one way (visualY).
## Self-check: tsc+build · your spec + the named adjacents green both projects · zero console · screenshots where visual.
No-op guard: exit-without-changes = WRITE WHY first.
END: READY-FOR-GATES + per-item table.
