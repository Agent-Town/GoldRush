---
status: READY-FOR-GATES
branch: sol/town-model-audit
base: e0be535cf8e6d0a39148b5e929915bae299178e2
scope: Wave 6 Town production buildings and plaza objects
date: 2026-07-14
---

# Wave 6 — Town model consistency audit

## Verdict

Eight production buildings and three plaza-object GLBs were inspected from four quadrants under one neutral rig and together at the locked TS-04 Town camera. Four assets needed visible repair: Claim Office, Chapel, covered wagon, and water trough. The Pan Monument needed only a material-contract normalization. The other six models are complete, grounded, consistently painted, and free of visible holes or disconnected parts.

- [Locked Town-camera before/after](../artifacts/town-model-audit/town-camera-before-after.png) — left is the branch-base asset set; right is Wave 6.
- [All eleven models from four angles](../artifacts/town-model-audit/final-all-models.png).
- [Four repaired models from four angles](../artifacts/town-model-audit/repaired-models-four-angle.png).
- [Per-repair before/after](../artifacts/town-model-audit/repairs-before-after.png) — each row is before, then after.

## Per-building findings

The tonal values below are the building's existing locked-camera metric against its recorded painted neighbor. Tavern is the painted style reference. All deltas remain within the 5% ceiling.

| Building | What was off | Wave 6 action | Tonal delta | Export contract |
| --- | --- | --- | ---: | --- |
| General Store | No defect across four sides. | Accepted unchanged. | 3.29% | 2,428 tris; 1 material; exact re-export |
| Schoolhouse | No holes, floating parts, or color break. | Accepted unchanged. | 0.51% | 5,520 tris; 1 material; exact re-export |
| Claim Office | Every atlas region was clamped to 27–53% of its intended palette, so the complete shell read as charcoal. | Lifted albedo inside the source painting's hue band; retained dark timber/roof contrast and zero emission. | **4.366%** vs Tavern LITE facade | 2,420 tris; 1 material; exact re-export |
| Assay Office | Complete wrap and coherent teal/ochre palette. | Accepted unchanged. | 0.547% | 3,340 tris; 1 material; exact re-export |
| Chapel | The belfry cap was centered at building Y=0 while the tower and cross sit at Y=-0.42, leaving about 0.27 units of visible daylight below the cross. | Shifted only the cap to Y=-0.42. Cross, cap, tower, footprint, silhouette, atlas, and triangle count are otherwise unchanged. | 4.98% | 3,424 tris; 1 material; exact re-export |
| Stamp Mill | Shallow industrial mass is intentional; shell is closed and colored on all sides. | Accepted unchanged. | 0.59% | 1,416 tris; 1 material; exact re-export |
| Dynamo Hall | Dark iron is intentional and fully textured, not a missing-material plane. | Accepted unchanged. | 4.81% | 2,612 tris; 1 material; exact re-export |
| Tavern | Wave 3 full wrap remains consistent from all quadrants. | Accepted unchanged as the painted reference. | 0.00% reference | 10,988 tris; 1 material; exact re-export |

## Object findings

| Object | What was off | Wave 6 action | Export contract |
| --- | --- | --- | --- |
| Covered wagon | One flat brown material made the cover, timber, wheels, and hoops collapse into a toy-like block; wheels hovered 0.03 above grade; coplanar hubs could shimmer. | Rebuilt the same footprint with an arched warm canvas, dark ribs/rails/wheels, brass hubs, axles, and bench; grounded wheels at Y=0 and offset hubs from wheel faces. | 784 tris; 1 mesh/material/256² atlas; exact re-export |
| Water trough | Boards, base, rim, and water were the same flat brown. | Kept the footprint; separated dark base, warm planks, light rim, and restrained teal water in the shared painted palette. | 408 tris; 1 mesh/material/256² atlas; exact re-export |
| Pan Monument | Complete, centered, consistently painted, and present in the plaza; legacy roughness was 0.82. | Kept geometry and palette unchanged; normalized roughness to the shared 0.9 contract. | 864 tris; 1 mesh/material/256² atlas; exact re-export |

## Gate evidence

- Official `scripts/reexport-pilot.sh` re-export is byte-identical for all eight buildings and all three objects. [Pre/post hashes](../artifacts/town-model-audit/reexport-hashes.md).
- Claim Office and Chapel saved-source verifiers: one mesh/primitive/material/embedded image, no cameras/lights/animations, byte-identical.
- Plaza props verifier: all structural/material/bounds checks and byte-identical reproduction pass; transformed-node count is explicitly zero. [Machine evidence](../artifacts/town-model-audit/plaza-props-contract.json).
- Claim Office fixed 30×25 roof-region luminance in one TS-04 frame: 0.221968; Tavern LITE facade: 0.212683; delta 4.366%. [Metric](../artifacts/town3d-claim-office/luminance-metrics.json).
- `town-claim-office-blender.spec.ts`, `town-chapel-blender.spec.ts`, and `town-plaza-props-blender.spec.ts`: desktop and mobile Chrome green, including lazy load, fallback, disposal, interaction, and frame-time gates.
- `npm run build`: green.
- No Town layout, mount path, coordinate, collision, interaction, simulation, or source-code changes. Production GLB paths remain unchanged.
- Wave 7 variants were not started; they remain gated on Wave 6 acceptance.

READY-FOR-GATES
