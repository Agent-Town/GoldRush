# 3D-C-BETA — Blackout Ridge landmark pack

- Branch: `sol/lm-beta-blackout-ridge`
- Fresh reference: `e91dc835a7a8f0e873dfee1c236e67860173eeb3`
- Verdict: **READY-FOR-GATES**
- Scope: Blackout Ridge only. No E6–E10 pack functions, assets, contracts, or ledger entries changed.
- Interlock: five production bodies are complete; canonical `landmarkMounts` remain empty and owned by 3D-D.

## F-01 — Sculpt and board read

The locked run camera, overview, dust-owner verdict, mask-agreement board, E3 mask table, and terrain contract establish a riverless night map about stored breath: off-map current enters a trunk, three pylon cuts route it, capacitor banks buffer it, and the ridge switch house is the defended loss condition. The pack therefore reads as **receive → cut → store → defend → orient**, not as generic town dressing.

## F-02 — Published ID list

1. `off-map-current-receiver`
2. `trunk-line-breaker-shelter`
3. `breath-bank-service-rack`
4. `ridge-switch-house`
5. `blackout-watch-lamp`

The first and fourth bodies use the source ladder's `derive` tier. The other three use `reuse`. All five share one 1,024 px E3 blue/brass/teal atlas. Preview positions exist only to prove camera legibility and mask clearance; the generated terrain contract remains unmounted.

## F-03 — Asset contract

| ID | Tier | Triangles | Byte-identical re-export | Semantic-identical re-export |
| --- | --- | ---: | --- | --- |
| `off-map-current-receiver` | derive | 1,316 | yes | yes |
| `trunk-line-breaker-shelter` | reuse | 1,456 | yes | yes |
| `breath-bank-service-rack` | reuse | 1,044 | yes | yes |
| `ridge-switch-house` | derive | 856 | yes | yes |
| `blackout-watch-lamp` | reuse | 956 | yes | yes |

Every body is base-centered, render-only, one mesh/primitive/material, and below the 3,000-triangle cap. The scoped verifier reports 1 pack / 5 assets / 3 reuse / 2 derive / 0 build-new.

## F-04 — Visual evidence and iteration

- Target: preserve the locked Blackout Ridge night identity while making five separate utility silhouettes countable and keeping every body footprint clear of gold build yards, teal trunk, red pylon rings, blue capacitor rings, the orange stake, green harvest rings, and purple spawns.
- The first blind review returned **NOT READY**: west bodies merged, the far-right footprint touched the map edge, supports were too dark, and bright bases looked pasted onto the terrain.
- Corrective pass separated the lamp from the receiver, moved the lamp fully inside a clear service pocket, recessed and darkened foundations, raised only verdict lighting, and lifted the clearance strokes above the ridge occluder.
- Fresh blind signoff after the correction: **READY**. Five bodies are distinct, grounded, inside frame, and clear of every mask family. The reviewer retained only a low note about deliberately dark watch/receiver supports. The noisy tabletop perimeter is inherited terrain presentation, not pack-owned.
- Locked-camera diagnostics (same 1,280 × 720 framing; not acceptance thresholds): normalized MAE `0.0713909`, normalized RMSE `0.103715`, thresholded 32/255 pixel-difference ratio `0.277457`, baseline mean luminance `0.603293`, candidate mean luminance `0.564375`.
- Primary board: `artifacts/map-rebuild-spike/blackout-ridge-landmarks-verdict.png`
- Run camera: `artifacts/map-rebuild-spike/blackout-ridge-landmarks-proposed.png`
- Clearance: `artifacts/map-rebuild-spike/blackout-ridge-landmarks-clearance-overlay.png`
- Four-angle check: `artifacts/map-rebuild-spike/blackout-ridge-landmarks-turntable.png`

## F-05 — Gates and ownership

- Scoped Blender verifier: pass, including deterministic byte and semantic re-export checks.
- `npx tsc --noEmit`: pass.
- `npm run build`: pass; the existing greater-than-900 kB chunk warning remains.
- `git diff --check`: pass.
- Independent review: its P2 shared-ledger recovery finding was fixed. The builder now self-heals every E2–E5 contract and preserves already-ledgered packs without importing an unselected E6–E10 contract across the split. The rerun reproduced the scoped verifier pass before entering the known recursive-review trap, which was stopped.
- Runtime terrain, collision, placement, movement, masks, water, spawns, fog, and simulation are unchanged.
- 3D-D handoff: author canonical mounts from the five published IDs after runtime collision/build-zone review; do not copy the evidence-only positions as canonical coordinates.
