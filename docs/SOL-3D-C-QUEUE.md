# SOL SESSION 3D-C — queue + territory (THE TOWN PLATE)
Read this first, every session start. Owner-ordered 2026-07-13 ("a Town plate to place the town on in Blender"); Fable-coordinated. Protocol: AGENTS.md §Interactive co-agent sessions.

## Identity & territory
- You are **Session 3D-C**: the TOWN GROUND PLATE — the terrain the 3D town stands on.
- Branch: `sol/town-plate`. TOUCH-ONLY: `assets/pilots/town-plate-3d/*` (.blend/.glb/renders/build scripts), `reviews/sol-3d-c-findings.md`, `artifacts/town-plate-3d/*`. When the wire seam is granted (attended will say so): ONE additive mount in the ?town3dPilot set only.
- Parallel sessions exist (3D-D map rebuilds; the factory's lanes run daily slices). NEVER write outside your territory. Read their queue files for awareness only.

## THE BRIEF
A ground plate under the town plaza: the packed-earth square, the ring road, approach paths, riverbank edge — real relief where the painting implies it (wagon ruts, the well mound, bank slopes), REPLACING the current flat painted ground WHEN the flag is on. The nine 3D buildings + props mount on top; their base-center origins sit at y=0 on your plate's surface at their townLayout positions — your plate must present a surface that makes that true (flat pads at every building slot; relief lives BETWEEN pads).

## Hard laws
1. **Coordinates are canon**: src/town/townLayout.ts positions/footprints/approach points change for NOBODY. The plate conforms to them.
2. **Actors stay planar**: the 2D cast walks at y≈0 on their loop paths — your relief along ALL walk loops + hero paths stays within ±0.05 units of 0 (the flat-walk law) so no one floats or sinks. Decorative relief goes where nobody walks.
3. Style: the plaza painting + kit plates are the texture bible — engraved warm earth, never photoreal. ONE baked material ≤2048².
4. Budgets: ≤20k tris (it is the biggest single piece in town — earned, not default), no lights/cameras, base-center origin, RECIPE.md export contract (scripts/reexport-pilot.sh must reproduce your GLB byte-identically).
5. Painted flat ground stays FOREVER as LITE tier + flag-off + load-failure fallback.

## Deliverables (one commit per wave, READY-FOR-GATES)
1. `assets/pilots/town-plate-3d/town-plate.blend` + `.glb` + build script.
2. The locked ts-04-camera A/B: painted ground vs plate, same framing, plus a walk-loop overlay render proving the flat-walk law (paths drawn on the relief).
3. Findings file: what the plate wants from the buildings (skirts? contact shadows?) — observations only, no cross-territory edits.
4. The attended session gates and merges — never self-merge, never push main.
