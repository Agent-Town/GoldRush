# Dredge Queen V7 visual handoff — ready for runtime inspection, not adopted

Target: preserve the reference's working flag-barge silhouette, substantial salvage crane/claw, paired covered paddle wheels, domed observation house and opening cargo hold. The original 3D interpretation is a comparison candidate, not the visual authority.

## Independent V6 comparison and response

Fresh reviewer e5_v6_asset_comparison inspected both raw references, seven rendered comparisons and twelve crops. It judged V6 substantially closer than the original: paired wheels, covered hold, domed house, torn banners and brass machinery restore the defining combination. It found no confident floating intact component. It also identified a low crane, flat claw plates, the open-lid/banner silhouette overlap, orderly wheel breaks, weak claw-damage distinction, compact hull/cabin proportions and dark small features.

V7 raises the crane above the wheelhouse, adds thickness/taper and joint bosses to the talons, raises the intact grab, and gives the damaged grab a separate drop with a lengthening hoist. The damaged main banner billows toward the near side. Root inspected intact, isolated claw/hold damage and both all-damaged views: the taller crane and drop read more clearly; the banner is more visible ahead of the bin. The open lid and banner still overlap in projection from the main camera. Actual saved-mesh checks show no flag/lid triangle intersections in either shape, so this is a remaining readability limitation, not a confirmed collision.

The hull remains more compact and the wheel break edges more regular than the illustration. Fine teal accents, banner crest, hull underside, wheel interiors and cargo need actual game-camera and material calibration. Do not prescribe emission from the neutral CPU preview alone. V7 has not yet had an independent runtime visual review; that remains part of final acceptance.

## Evidence and limits

Current GLB `878b976e52351bec321a6fd9dff96dea8320f5742ce22a34d7e30cc231b4a6d9`, 43,972 triangles, 6,499,240 bytes, 8 × 4.547772 tall × 4.410588 beam. Four original mesh/morph bindings, one embedded 1024 atlas. Structural contract, normalized finite shape keys, grounded damage, independent mast pivots, visible grab drop, chain extension, eight zero-intersection lid/flag checks and byte-identical saved-Blend re-export pass.

`candidate-source-review-v7/` is an immutable independent Sol/medium source review. It returned no confirmed functional defects and reserved visual/runtime uncertainty. `candidate-neutral-7/receipt.json` binds matched CPU previews to this GLB. `comparison.png` places original and current intact/damaged renders under the same camera and neutral lighting. This proves neither actual game lighting nor runtime acceptance.

E4's full regression still owns production. E5 assets, source, shared kit and registry are unchanged; no game builds or competing browsers have run. After E4 terminal/restoration/full source-hash reconciliation, inspect E5 through the actual loader and encounter before production adoption. Preserve gameplay and story contracts; prioritize framing, targeting, emission, damage/readability, load cancellation and persistent wreck behavior. E6–E10 remain untouched.
