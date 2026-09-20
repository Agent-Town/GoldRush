# Tavern variant B — materials and Town-light match

`assets/processed/bld-tavern.png` is the hue, stroke-density, and material-language source. The final atlas continues its warm ochre horizontal planks, sepia framing, rust shingles, amber windows, and single restrained teal lantern accent around the full volume. The illustration is not projected as a flat card: geometry-derived UVs carry the same painted language around corners, which avoids variant A's paper-theater failure.

The exported GLB has one embedded 1024² painted atlas, metallic `0`, roughness `0.9`, no clearcoat, and no emissive lift. Directional plank strokes, roof courses, hatching, and upper-left highlights are painted into the atlas; narrow flat-shaded bevels provide relief without vinyl gloss.

For the Town light, the albedo was lifted inside the reference's ochre/sepia hue band rather than adding emission. In the locked TS-04 capture, non-ground luminance inside the fixed Tavern region moved from `54.31` on old B to `61.27` on new B. The adjacent existing painted facade measures `58.34`, so new B sits within `+5.0%` of that neighbor instead of silhouetting against it. Evidence: `locked-camera-old-b-vs-new-b-contact-sheet.png` and `locked-camera-old-b-vs-new-b-visual-metrics.json`.
