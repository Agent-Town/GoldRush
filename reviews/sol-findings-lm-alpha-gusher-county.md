# 3D-C-ALPHA — Gusher County landmark pack

Reference base: `27587b7c6efbb804743f9f6aad192fd8df52bfd2`

## ID list

- `derrick-01`
- `derrick-02`
- `derrick-03`
- `derrick-04`
- `derrick-05`
- `derrick-06`
- `derrick-07`
- `derrick-08`
- `outhouse-geyser`
- `county-camp-rig`

All ten IDs were already published in `gusher-county-terrain-contract.json`. This wave fills only their empty `asset` fields and adds the pack seam; positions, rotations, scales, mask truth, terrain, panorama, and simulation remain unchanged.

## Findings

| Finding | Source-ladder verdict | Production answer |
| --- | --- | --- |
| Eight identical terrain proxies did not carry the owner-painted derrick vocabulary or distinguish the three lease shelves. | DERIVE | Four silhouette families now repeat as a county kit: tapered timber derricks, horizontal pumpjacks, vertical pressure stacks, and H-gantries. Their paired bodies retain small working variations without collapsing back into one repeated tower. |
| The once-per-run outhouse eruption needed a readable setup before the gag fires. | DERIVE | A camera-facing gabled timber outhouse now carries an outlined door, teal porthole, step, pressure stack, capped vent, gauge, halo, and little flutter flag; the gag reads before it fires without becoming modern or textual. |
| The county stake needed a functioning E4 service silhouette, not another derrick. | REUSE | The accepted E4 filling shed and fuel rack are composed with a dispatch bench, warning lamp, dial, and oil patch as one camp rig. |
| The tar basin swallowed the first production values at the actual camera. | DERIVE | The shared atlas keeps the E4 palette but lifts this pack's painted values specifically for the darkest county terrain; no runtime light or terrain changed. |

Source tiers: 1 reuse / 9 derive / 0 build-new. Every body is one mesh, one material, base-centred, and below the 3,000-triangle ceiling (536–1,584 triangles; 7,552 total). All ten share one 1024² painted atlas.

## Placement proof

The clearance overlay plots the exact canonical mounts as heavy white outlined-and-crossed transformed AABBs against teal lease/build shelves, orange approach roads, purple tar seams, red wild-well circles, the green outhouse site, and the gold county camp. Build assertions prove all ten transformed AABBs stay inside the 160 m map, every derrick ID lands on its matching `wildDerricks` coordinate and fits the three-metre well footprint, and the outhouse fits its published trigger radius. Roads intentionally terminate at the working lease sites; the pack does not alter gameplay masks or collision.

## Visual review

The first mounted evidence pass was too dark on the tar-black basin. Verdict-only fill was strengthened and the shared production atlas received a source-faithful value lift; the terrain, camera, and game light rig were not changed.

Two blind inspection passes then found that accessory-level variation did not survive the gameplay camera, the camp assembly was ambiguous, and the clearance rectangles were too subtle. The final revision replaced the repeated derrick silhouette with four unmistakable rig families, consolidated the camp around a service cabin and fuel crane, gave the outhouse a camera-facing gable/door silhouette, and strengthened the full-AABB outlines and crosses. The tar pools, pale perimeter, and absence of internal terrain relief are owned by the accepted 3D-D sculpt and are not pack defects.

Final fresh, unprimed inspection verdict: **SHIP**. The reviewer identified all four rig families at the run camera, read both camp and outhouse as authored E4 bodies, found every landmark grounded, and confirmed all ten complete crossed AABBs in the clearance view.

## Gates

- Scoped Blender build: PASS — 10 bodies
- Blender pack verifier: PASS — 1 reuse / 9 derive / 0 build-new
- Byte-identical and semantic-identical reopen/re-export: PASS — 10/10
- One shared 1024² atlas; one material/body; no lights/cameras/animations in GLBs: PASS
- Triangle ceiling and base-centre origins: PASS — 10/10
- Exact canonical mount IDs and transforms preserved: PASS
- Clearance assertions and overlay: PASS
- `npx tsc --noEmit`: PASS
- `npm run build`: PASS

READY-FOR-GATES
