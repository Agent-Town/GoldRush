# 3D-C-BETA — Canyon Works landmark pack

- Branch: `sol/lm-beta-canyon-works`
- Fresh reference: `e91dc835a7a8f0e873dfee1c236e67860173eeb3`
- Verdict: **READY-FOR-GATES**
- Scope: Canyon Works only. No E6–E10 pack functions, assets, contracts, or ledger entries changed.
- Interlock: five production bodies are complete; canonical `landmarkMounts` remain empty and owned by 3D-D.

## F-CW-01 — Sculpt and board read

The locked run camera, overview, dusk board, mask-agreement board, terrain contract, and authoritative E3 mask table establish the first night/network tile as a south-to-north current journey: Dynamo Sub-Hall → paired switchbacks → dam crest, with the downriver tram as the orientation threshold. The body pack therefore reads as **source → split → carry → gate → orient**, not generic town dressing.

The authoritative mask table is newer than the terrain aggregate and carries two rails: the south tram loop and the west-rim line. Clearance evidence uses that table rather than silently trusting the stale one-rail aggregate.

## F-CW-02 — Published ID list

1. `sub-hall-dynamo-house`
2. `west-switchback-line-house`
3. `east-switchback-line-house`
4. `dam-crest-gate-house`
5. `downriver-tram-lamp`

The sub-hall and dam gate use the source ladder's `derive` tier. The paired line houses and tram lamp use `reuse`. All five share one 1,024 px E3 ink-blue, copper, brass, and voltage-teal atlas. Preview positions, rotations, scales, water, and lights exist only to prove camera readability and mask clearance; they do not write runtime mounts or simulation state.

## F-CW-03 — Production asset contract

| ID | Tier | Triangles | Byte-identical re-export | Semantic-identical re-export |
| --- | --- | ---: | --- | --- |
| `sub-hall-dynamo-house` | derive | 1,768 | yes | yes |
| `west-switchback-line-house` | reuse | 1,616 | yes | yes |
| `east-switchback-line-house` | reuse | 1,616 | yes | yes |
| `dam-crest-gate-house` | derive | 1,872 | yes | yes |
| `downriver-tram-lamp` | reuse | 820 | yes | yes |

Every body is base-centered, render-only, one mesh/primitive/material, and below the 3,000-triangle cap. The scoped verifier reports 1 pack / 5 assets / 3 reuse / 2 derive / 0 build-new. `mountInterlock` is `pending-3d-d`; generated `mounts` remain `[]`.

## F-CW-04 — Clearance and ownership proof

- Gold: five build zones, including the two switchbacks and paired north galleries.
- Teal: the dam channel.
- Red: both authoritative rails.
- Blue: six pylon sites.
- Orange: the Dynamo loss-condition stake.
- Green: harvest anchors.
- White: the five evidence-only body footprints, including rotated width/depth bounds.

All white footprints remain separated from every authored mask family. The builder computes rotated extents with absolute sine/cosine terms, so the 180-degree evidence facings cannot invert or shrink a footprint. Runtime terrain, collision, movement, placement, water, spawns, fog, masks, and power-graph simulation remain unchanged.

## F-CW-05 — Visual evidence and correction loop

- Target: preserve the exact Canyon Works run state while adding five grounded, countable E3 utility silhouettes whose detailed faces read from the south-to-north camera.
- The first full-frame blind comparison passed camera/state consistency but crop review rejected the body evidence: detailed faces were turned away, the tram frame and crest were too small, and E3 iron/timber collapsed into black.
- Corrective passes turned only the evidence mounts toward the locked camera, gave the thin tram and distant crest honest evidence scale, separated the tram medallion/bell attachments, added visible flywheel bearings and aprons, lifted the E3 painted-value range, made the evidence-only water stand-in ink-blue, and closed the lineup's left-edge clipping.
- Fresh unprimed body signoff after correction: **READY**. Five bodies are countable; run + lineup + crops prove the twin-flywheel sub-hall, teal/gold breaker houses, red-apron dam gate, and suspended tram hoop. No floating attachments, broken grounding, missing geometry, or severe blur remained.
- Reviewer-retained terrain-only debt: upper terraces remain dark/featureless, the water/sculpt boundary retains hard seams and blue corner wedges, and authored circular ground marks are soft. Those belong to the existing terrain/evidence surface, not this body branch.
- Same-camera diagnostics (not acceptance thresholds): MAE `7.084182`, RMSE `18.322063`, 32/255 difference ratio `0.062619`, reference/candidate luminance `39.874722` / `33.280972`, edge-energy ratio `0.925121`.
- Primary board: `artifacts/map-rebuild-spike/canyon-works-landmarks-verdict.png`
- Run camera: `artifacts/map-rebuild-spike/canyon-works-landmarks-proposed.png`
- Clearance: `artifacts/map-rebuild-spike/canyon-works-landmarks-clearance-overlay.png`
- Four-angle check: `artifacts/map-rebuild-spike/canyon-works-landmarks-turntable.png`
- Telemetry: `artifacts/map-rebuild-spike/canyon-works-landmarks/comparison/comparison-metrics.json`

## F-CW-06 — Gates and handoff

- Scoped Blender verifier: pass, including byte-identical and semantic-identical re-export checks.
- `npx tsc --noEmit`: pass.
- `npm run build`: pass; the existing greater-than-900 kB chunk warning remains.
- `git diff --check`: pass.
- Independent code review: no actionable correctness findings; it independently reproduced the scoped verifier and production build passes.
- Shared-ledger recovery is split-aware: BETA may self-heal E2–E5 omissions and preserves already-ledgered packs, but a BETA-only build never newly imports an absent E6–E10 contract.
- 3D-D handoff: author canonical mounts from the five published IDs after runtime collision/build-zone review; do not copy the evidence-only placements as canonical coordinates.
