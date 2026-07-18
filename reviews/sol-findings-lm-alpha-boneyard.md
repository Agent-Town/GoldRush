# 3D-C-ALPHA — Boneyard landmark pack

Reference base: `27587b7c6efbb804743f9f6aad192fd8df52bfd2`

## ID list

- `flivver-row-west-a`
- `flivver-row-west-b`
- `flivver-row-west-c`
- `spent-boiler-west`
- `spent-boiler-east`
- `flivver-row-east-a`
- `flivver-row-east-b`
- `flivver-row-east-c`
- `hauler-bed-north-a`
- `hauler-bed-north-b`
- `half-buried-sleeper`
- `unmarked-wagon`

All twelve IDs were already published in `boneyard-terrain-contract.json`. This wave fills only their empty `asset` fields and adds the pack seam; positions, rotations, scales, mask truth, terrain, panorama, and simulation remain unchanged.

## Findings

| Finding | Source-ladder verdict | Production answer |
| --- | --- | --- |
| The terrain proxies were identical low boxes, so the salvage rows had no readable machine taxonomy. | DERIVE | Six low motor flivvers now carry different missing-wheel, bare-axle, bent-panel, and bumper failures. |
| The paired boiler sites needed to read as cold E2/E3 technology surviving into E4. | REUSE | Two boiler-house bodies were compressed into soot-capped, valve-scarred relics with opposite-side damage. |
| The north row needed stripped working-vehicle remains, not two more cars. | DERIVE | Two open hauler beds use exposed tanks, three wheels, a bare rear axle, and loose tailgates. |
| The sleeper hollow is a gameplay story beat and needed a silhouette distinct from harvestable hulks. | DERIVE | A long, partly buried cabin keeps cold flue, windows, broken coupler, and an earth/rock burial bed. |
| The unmarked wagon is the map's most intact inherited object. | REUSE | The E4 wagon survives with one canvas patch, loose shaft, and hung lamp; no readable signage. |

Source tiers: 3 reuse / 9 derive / 0 build-new. Every body is one mesh, one material, base-centred, and below the 3,000-triangle ceiling (208–1,920 triangles). All twelve share one 1024² painted atlas.

## Placement proof

The clearance overlay plots the published mount footprints in white against teal build terraces, orange approach roads, green salvage points, the red sleeper hollow, and purple west/east spawn gates. The build script also checks transformed body AABBs against the 128 m map bounds and conservative radial clearance from both road segments and spawn gates. The bodies intentionally occupy the salvage/harvest rows; they do not alter those gameplay masks.

## Visual review

The first mounted render was too dark to judge the rear row on Boneyard's tar-black ground. Verdict-only world/fill exposure was raised and the board regenerated; exported materials and game lighting were not changed.

A fresh neutral reviewer returned **SHIP — high confidence**: all twelve roles are present, the six flivvers vary visibly, four-angle wraps are complete, no broken/floating geometry is visible, road and spawn-gate clearance holds, and the mounted silhouettes remain readable on the intentionally dark terrain.

## Gates

- Scoped Blender build: PASS — 12 bodies
- Blender pack verifier: PASS — 3 reuse / 9 derive / 0 build-new
- Byte-identical and semantic-identical reopen/re-export: PASS — 12/12
- One shared 1024² atlas; one material/body; no lights/cameras/animations in GLBs: PASS
- Triangle ceiling and base-centre origins: PASS — 12/12
- Exact mount IDs and transforms preserved: PASS
- Clearance assertions and overlay: PASS
- `npx tsc --noEmit`: PASS
- `npm run build`: PASS
- Neutral visual review: SHIP — high confidence
- Independent diff review: no Boneyard finding returned; its optional campaign-registry probe stopped earlier on the unrelated `e6-picnic` asset state already present outside this branch, then the reviewer self-recursed and was terminated without changing files.

READY-FOR-GATES
