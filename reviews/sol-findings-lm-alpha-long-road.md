# 3D-C-ALPHA — The Long Road landmark pack

Reference base: `e5f67d08cf94ff7dce0caf4f06a969cb782d8cee`

## ID list

- `west-way-station`
- `middle-way-station`
- `east-way-station`
- `convoy-lead-hauler-start`
- `east-railhead`

All five IDs were already published in `long-road-terrain-contract.json`. This wave fills only their empty `asset` fields and adds the pack seam; positions, rotations, scales, mask truth, terrain, panorama, and simulation remain unchanged.

## Findings

| Finding | Source-ladder verdict | Production answer |
| --- | --- | --- |
| Three proxy huts did not tell the story of a settlement that advances by road. | REUSE | The west stop is a low wrecker/fuel apron, the middle stop grows a tall repair crane and tyre bay, and the east stop becomes a relay tower with a road-spanning toll arm. Their jobs and silhouettes remain distinct while sharing county materials. |
| The loss-condition stake was a placeholder rather than the moving town's leader. | DERIVE | The inherited E4 wagon becomes a playful lead motor caravan: engine hood, grille, headlights, tall exhaust, roof luggage, filament string, convoy flag, and the earlier wagon body all remain legible together. |
| The road ended at a tiny marker instead of a destination. | REUSE | The accepted recovery gantry becomes a hard eastern railhead with sleepers, rails, fuel crane, drop hose, and teal signal. |
| A 400 m strip can make correct landmarks disappear in a single overview. | REUSE | Evidence pairs the locked gameplay camera with a full-route overview, a five-body lineup, four angles, and an exact crossed-AABB mask overlay; no camera or light ships inside a GLB. |

Source tiers: 4 reuse / 1 derive / 0 build-new. Every body is one mesh, one material, base-centred, and below the 3,000-triangle ceiling:

| ID | Triangles |
| --- | ---: |
| `west-way-station` | 2,248 |
| `middle-way-station` | 860 |
| `east-way-station` | 796 |
| `convoy-lead-hauler-start` | 2,504 |
| `east-railhead` | 2,592 |

All five share one 1024² painted E4 atlas sourced from the shipped motor kit and owner-painted plates.

## Placement proof

The clearance overlay plots the exact canonical mounts as heavy white outlined-and-crossed transformed AABBs against teal rest-stop shelves, orange road corridors, the gold convoy route, green harvest rings, the red loss stake, and purple north/south spawn gates. Build assertions prove every body remains within the 400 × 96 m map, all three stations fit completely inside their published 24 × 16 m shelves, and the lead hauler plus railhead remain on the convoy centreline. The road and route intentionally pass through the moving vehicle and terminal; this pack does not alter masks, collision, pathing, or the loss condition.

## Visual review

The first independent review correctly returned REVISE: the station silhouettes and playful hauler read, but mounted bodies occluded four of the five crossed AABBs, a teal signal looked unsupported, and the eastern endpoint was not yet a convincing hard terminus. The correction added an attached signal mast, track-end buffer, crossed braces, coupler, a five-stop locked-camera tour, and a full-route clearance board with five labelled zooms. The evidence-only AABB curves now sit above the tallest body while preserving their exact X/Z footprints.

Fresh unprimed re-review: **SHIP** — all five complete white crossed AABBs are unmistakable; the three station jobs are distinct; the inherited wagon reads as a playful E4 motor caravan; the railhead clearly terminates the route; no floating attachment, broken wrap, or grounding defect remains visible.

## Gates

- Scoped Blender build: PASS — 5 bodies
- Blender pack verifier: PASS — 4 reuse / 1 derive / 0 build-new
- Byte-identical and semantic-identical reopen/re-export: PASS — 5/5
- One shared 1024² atlas; one material/body; no lights/cameras/animations in GLBs: PASS
- Triangle ceiling and base-centre origins: PASS — 5/5
- Exact canonical mount IDs and transforms preserved: PASS
- Rest-stop containment, map bounds, centreline assertions, and crossed-AABB overlay: PASS
- `npx tsc --noEmit`: PASS
- `npm run build`: PASS
- Independent exact-image review after correction: SHIP

READY-FOR-GATES
