---
branch: sol/lm-beta-incline
map: incline
epoch: E2
reference: 2f1544daf1197e0d497602014fec36ab5ec9e5f5
status: READY-FOR-GATES
---

# 3D-C-BETA — Incline landmark pack

The locked sculpt reads as twin funicular cuts through two fords, four build yards, and stepped ore benches. The pack keeps both rail routes and the Panorama v2 scenery visible in verdict evidence while leaving terrain, masks, simulation, and canonical mounts unchanged.

## Published IDs

1. `lower-yard-engine-crane`
2. `west-line-brake-tower`
3. `east-line-brake-tower`
4. `upper-ore-cable-house`
5. `ford-service-pump`

All five bodies are reuse-tier, separately exported, base-centered GLBs sharing one 1024-square E2 steamworks atlas. The terrain contract still publishes `landmarkMounts: []`; `mountInterlock` remains `pending-3d-d`.

| Body | Triangles | Re-export | Source |
| --- | ---: | --- | --- |
| lower-yard-engine-crane | 2,728 | byte + semantic identical | Pressure Garden manifold |
| west-line-brake-tower | 964 | byte + semantic identical | Twin Banks winch |
| east-line-brake-tower | 976 | byte + semantic identical | Twin Banks winch |
| upper-ore-cable-house | 1,636 | byte + semantic identical | Twin Banks winch + E2 coal bins |
| ford-service-pump | 2,496 | byte + semantic identical | Pressure Garden pump |

## Evidence verdict

- The first neutral review rejected the render because it omitted the sculpt rail context and the pump marker looked detached. The final builder reuses the accepted E2 rail helper, retains the canonical panorama with a 430 m far plane, and attaches the marker to an iron post.
- A second review rejected proposal margins that were positive numerically but visually too tight. Preview positions were widened, the pump was pulled fully into frame, and clearance footprints now derive from generated contract bounds instead of hand-copied dimensions.
- Fresh final visual signoff: **READY — no visible gate defects**. Five bodies are countable; white footprints visibly avoid gold build zones, teal water, red rails, orange stakes, and green harvest rings.
- Fixed-pair telemetry against the sculpt-only run frame is diagnostic, not a similarity gate: normalized MAE `0.0924`, RMSE `0.1154`, SSIM distance `0.1486`. The movement is expected from mounted Panorama v2 scenery, restored rail geometry, and five new bodies.

## Gates

- scoped Blender pack verifier: PASS (`5` assets; reuse `5`, derive `0`, build-new `0`)
- every body: one mesh, primitive, material, embedded atlas, at most 3,000 triangles: PASS
- source `.blend` byte-identical and semantic-identical re-export: PASS
- `npx tsc --noEmit`: PASS
- `npm run build`: PASS (existing chunk-size warning only)
- `git diff --check`: PASS
- independent `codex review`: two P2 evidence findings fixed; final re-review reported no findings
- runtime `src/`, terrain contracts, mask tables, canonical mounts, and ALPHA E6-E10 maps: untouched

## 3D-D handoff

Resolve the five published IDs through the canonical Incline terrain mount contract. The positions in the verdict builder are composition evidence only and must not be copied as runtime authority without the 3D-D interlock.
