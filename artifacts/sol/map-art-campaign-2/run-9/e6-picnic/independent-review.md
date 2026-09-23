# Picnic — independent visual review

2026-09-23. Fresh context-free agent `picnic_visual_critique`; only reference plate, before/after normal-HUD full screenshots and 3x prop crops, followed by plain entry screenshots and 2x ground crops. No source or intended verdict was supplied.

The reviewer found clearer picnic identity from gingham, handled mugs, basket and brass ornament, and a canvas shelter replacing the red tabletop appearance. No obvious reversed occlusion or detached canopy corner; blanket perspective is coherent. Removing the large branching painted shadows improves scanning and character visibility.

Retained visible limitations:

- **High confidence:** weak prop contact shading and little readable canopy shade; pole feet lack weight. Broad, softened ground mottling loses granular detail and some mesa definition; crossing diagonal texture streaks can read as woven/herringbone at crop scale.
- **High confidence:** the bright canopy dominates the character and centerpiece; phone framing/HUD hides part of it. Brass rings overlap the food board; food remains mottled blocks and basket weave is soft. Cloth surface shading conveys less sag than its curved outline.
- **Medium confidence:** props feel oversized against the character, subject to perspective; the clearing loses some environmental depth as the painted structure shadows disappear.
- Gathering and reference composition remain much weaker than the plate. Stills do not verify shimmer, moving occlusion or contact from other angles.

The reviewer also caught a missing bench in the first rebuilt canopy. Direct inspection confirmed that the recipe had omitted both the existing bench and the hanging atom ornament. **Fixed before final evidence:** preserve those connected components from the frozen Blender source, add bench feet, rebuild within the unchanged whole-body envelope, and rerun captures/source proofs/gates/performance. A direct follow-up capture exposed the retained pendant intersecting the lower sagging canvas; its local vertices were lowered beneath the cloth before the final rerun. That rejected intermediate is retained under `_raw/run-9/e6-picnic-rejected-pendant-intersection/`. The rejected pre-bench images and receipts remain in `_raw/run-9/e6-picnic-rejected-without-bench/`; they are not the final acceptance evidence.

The reviewer described clearer character contact in the after image. Character rendering was not changed by this pass, so this is recorded as a perception observation and not claimed as an authored improvement. Character, gathering, camera and HUD changes remain outside this slice. Material/contact/ground-detail limitations stay HELD for art; no full plate-fidelity acceptance is claimed.

## Final canopy follow-up

The same independent reviewer reopened the final desktop/phone canopy views and 3x crop after the fix. **High confidence: bench omission resolved**, seat and both supports visible in all three views; no obvious new clipping, reversed occlusion or detached support. The narrow roof/bench gap remains readable. Bench-foot contact remains weak, especially in the crop; all prior material, terrain and environmental-shadow limitations remain. This follow-up does not establish full acceptance.
