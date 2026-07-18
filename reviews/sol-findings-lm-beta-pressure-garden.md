# 3D-C-BETA — Pressure Garden landmark pack

- Branch: `sol/lm-beta-pressure-garden`
- Fresh reference: `44741af1e44f5becfa1f09665a88b3b33d4ce092`
- Verdict: **READY-FOR-GATES**
- Scope: Pressure Garden only. No E6–E10 pack functions, assets, or ledger entries changed.
- Interlock: body exports are complete; canonical `landmarkMounts` remain 3D-D's responsibility.

## Published ID list

1. `garden-pressure-manifold`
2. `west-terrace-pipe-header`
3. `east-terrace-pipe-header`
4. `coal-seam-service-winch`
5. `water-band-pump-station`

All five use the source ladder's `reuse` tier and share the generated Pressure Garden atlas. The evidence-only composition places the pump in the central corridor between growing terraces, the manifold and paired headers in the 30–35 m terrace gap, and the winch outside the coal-bed build zone. It does not write runtime mounts or simulation state.

## Asset contract

| ID | Triangles | Byte-identical re-export | Semantic-identical re-export |
| --- | ---: | --- | --- |
| `garden-pressure-manifold` | 2,564 | yes | yes |
| `west-terrace-pipe-header` | 1,672 | yes | yes |
| `east-terrace-pipe-header` | 1,616 | yes | yes |
| `coal-seam-service-winch` | 1,480 | yes | yes |
| `water-band-pump-station` | 2,432 | yes | yes |

Every body is base-centered, render-only, one mesh/primitive/material, under the 3,000-triangle cap, and uses the embedded pack atlas at no more than 2,048 px.

## Visual evidence

- Target: retain the exact sculpt/run camera while making a water → pressure → coal service chain legible without occupying build zones, boiler beds, harvest anchors, or the water band.
- Locked camera comparison: both images are 1,280 × 720; normalized RMSE `0.0502782` and ImageMagick SSIM distance `0.0320356`. These are distance diagnostics, not acceptance thresholds.
- Fresh blind review: **READY**. Remaining S2 notes are shared-shadow/value compression between the two center bodies and reduced small-detail contrast; five bodies remain countable and the rotated-footprint clearance evidence passes.
- Primary board: `artifacts/map-rebuild-spike/pressure-garden-landmarks-verdict.png`
- Run camera: `artifacts/map-rebuild-spike/pressure-garden-landmarks-proposed.png`
- Clearance: `artifacts/map-rebuild-spike/pressure-garden-landmarks-clearance-overlay.png`
- Four-angle check: `artifacts/map-rebuild-spike/pressure-garden-landmarks-turntable.png`

## Gates run

- Scoped Blender verifier: 1 pack / 5 assets; all deterministic export and contract assertions pass.
- `npx tsc --noEmit`: pass.
- `npm run build`: pass; the existing large-chunk warning remains.
- Independent code review: the scoped verifier and build passed. Its recursive self-review was stopped; the concrete full-sweep failure was reproduced and triaged below.
- Repository-wide landmark verifier: inherited atlas-hash drift remains in `baron`, `dry-gulch`, `night-shift`, `the-claim`, and `twin-banks`. Pressure Garden, Mare Claim, Dome Basin, Ember Shore, Glow Mesa, Hill Mine, Regatta, Relay Valley, and Trestle match their contracts. Repairing older packs is outside this E2 body slice.
