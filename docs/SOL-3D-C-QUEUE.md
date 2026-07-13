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

## WAVE 1 — ACCEPTED + MERGED (attended, 2026-07-13)
Tip 2b81dd4f merged to main. Gates verified: 8,192 tris · one 2048² material · zero lights/cameras · byte-identical re-export · flat-walk 0.037/0.034/0.0001 vs the 0.05 law · owner verdict: "the foundation is good."
## WAVE 2 — DETAIL + DECORATION (owner-directed, in progress; scope expanded 2026-07-13)
Surface detail AND town decoration per the owner's direct ask, all baked into the SAME single GLB (one file, one material — the factory's wire mounts whatever lives at town-plate.glb; keep that interface).
- BUDGET RAISED for decoration: ≤30,000 tris, material may go 2048² (unchanged). Still ONE mesh-tree, ONE material, zero lights/cameras, byte-identical re-export.
- DECOR VOCABULARY (era-1 frontier, painted-warm): barrels, crates, sacks, hitching posts, rope coils, buckets, lantern posts (unlit geometry — light belongs to the rig), a notice-board, planks, small planters, laundry line between buildings ONLY if it clears actor heads. Signage stays PICTOGRAM-ONLY (zero readable letters — house law).
- EXCLUSIONS (already shipped separately — do NOT model): the covered wagons, the water trough, the Pan Monument (plaza-props pilot owns them), all nine buildings (their GLBs mount on your flat pads), the townsfolk.
- PLACEMENT LAWS: building pads stay FLAT and CLEAR (nothing on them, nothing overhanging them); walk loops + approach paths stay clear and ≤0.05 relief (decor lives between the paths — the cast must never visually clip a barrel); the plaza CENTER ring stays open (it is the town's stage).
- Deliver the same way: READY-FOR-GATES + tip; the attended session gates (tri/material/re-export + pad-flatness + loop-clearance) and merges.
NOTE: the wire seam is FACTORY-SIDE (tasks/wire-town-plate.md) — you never need src/ access; keep modeling.

## WAVE 2 — ACCEPTED + MERGED (attended, 2026-07-13)
Tip f2d9a8d8 merged. 17,596 tris / 30k · flat-walk 0.037 · clearance 3.68 · pads clear · byte-identical. Owner-visible in-game via the factory wire (mounted, gated 18/18, deployed).
**F-3DC-1 — RECLASSIFIED (owner: "I allowed it to make a modified version - I did not want to break protocol.")**: the Pan Monument replacement was OWNER-DIRECTED, not a breach. Your variant is now ADOPTED on main (props spec 6/6, deployed). Standing rule going forward unchanged: shared-asset changes ride an explicit owner/attended grant, exactly as this one did.
**Your tavern finding is accepted**: the dark side planes on the Tavern model (full-wrap repair) — logged for session 3D-A / the factory. Good catch, correctly reported not fixed.
## WAVE 3 — THE TAVERN FULL-WRAP REPAIR (granted 2026-07-13; owner: "it is waiting for work")
Your own wave-2 finding becomes your assignment: the Tavern model's unfinished dark side planes. TERRITORY EXTENSION for this wave only: `assets/pilots/tavern-3d/*` (the .blend/.glb + renders). THE JOB: bring every face of the tavern to full-wrap standard — sides/back/roof textured as the same illustration continued around the corner (the facade painting `assets/processed/bld-tavern.png` is the style bible; the general-store/chapel GLBs are the quality bar). CONTRACT: ≤15k tris, ONE baked material ≤1024² (2048 max if the wrap truly needs it — say so), zero lights/cameras, byte-identical re-export, same slot footprint (the mount must not move: townLayout is canon). Keep the current silhouette from the town camera — this is a REPAIR, not a redesign. Deliver: READY-FOR-GATES + tip + a 4-angle turntable + the ts-04 A/B (current vs repaired). e2e/town-tavern-blender.spec.ts must stay green (the attended session runs it at the gate).

## WAVE 3 — ACCEPTED + MERGED (attended, 2026-07-13 evening)
Tip 6929c16e merged: the tavern is full-wrap (10,864 tris, 1024² material, exact former bounds, byte-identical re-export; tavern+plate battery 10/10 at the gate). The set's oldest model now matches its youngest. NO WAVE 4 QUEUED — awaiting owner direction.
