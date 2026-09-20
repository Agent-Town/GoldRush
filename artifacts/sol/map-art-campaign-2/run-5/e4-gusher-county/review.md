# Gusher County — run 5 correction

IMPROVED / HELD. The cabin no longer hides most of the player at entry. Full oil-field concept fidelity remains unaccepted.

| Original defect | Result |
| --- | --- |
| Foreground roof partly hides player | IMPROVED — a direct sprite-alpha/depth mask found the real HomesteaderHero entirely hidden at the frozen baseline entry, despite the visible Prospector beside the cabin. Narrowing the tall left cabin to 44% of its old width exposes about 98% of the real actor. Exact paired counts below. The remaining foot overlap is retained, not declared perfect visibility. |
| Saturated red block forms | IMPROVED — the existing rust-sheet UV cell now samples the existing iron cell. No atlas was regenerated. Camp red-dominant mask share falls from about 57.6% to 0% at 5 m. The cabin, door, window and step remain connected at their narrower proportions; 126 vertices move, with no new triangles or changed heights/outer bounds. The iron roof is darker; no whole-body luminance gain is claimed. |
| Coarse dark ground | IMPROVED — quiet earth, local tar stains and wheel cuts follow the original five tar seams and three road corridors. Ground statistics below. |
| Derrick, pipe and oil-channel network | HELD — eight authored derricks remain at their outer leases, with unchanged transforms/footprints. The 160 m contract has local tar seams, roads and delivery systems, not the plate's continuous oil channels. Channel geometry and lease arrangement belong to the contract/layout owner via Claude. Connected pipe dressing and richer outer-field art remain campaign art gaps. No gameplay meaning was invented. |
| Portrait crowding | IMPROVED inspection: camp, outhouse and representative derrick fit their declared 5 m stations, with less than 0.2% persistent HUD coverage. HELD entry: the camp's full bounds extend past both phone sides and persistent HUD still covers its lower portion; camera/UI owner via Claude. Story cards stay intact in the plain boards. |

[Desktop plate and plain before/after](board-1280.png) · [Phone plate and plain before/after](board-390.png) · [Actor visibility](actor-visibility.json) · [Red-paint footprint](paint-footprint.json) · [Luminance, projected bounds and HUD masks](visual-metrics.json).

The mask uses the real actor's existing sprite alpha and animation shader, with original depth testing versus disabled depth testing on two consecutive frozen diagnostic frames. It changes only temporary diagnostic-page materials; no sprite, character asset or production actor renderer changed. A few silhouette-edge pixels can vary between frames. No DEBUG/test hook is present in the separate ordinary entry boards.

Every saved landmark source re-exports byte-identically to its GLB, from both the original source and the saved candidate. Atlas bytes, terrain, panorama, topology, object heights, overall bounds, mounts, collision and gameplay are unchanged. Only the tall cabin's X coordinates and the rust-sheet UV assignments change. Whole-body emission remains 0.45. [Source verification](source-verification.json) · [Invariants](invariants.json) · [Authored triangle caps](asset-budgets.json).

Final numbers: actor occlusion **100% → 1.998% desktop / 2.271% phone** (932/951 and 1,033/1,057 visible alpha-mask pixels). Camp red-dominant body share **57.62% / 57.65% → 0% / 0%**. Camp 5 m body median **0.15397 → 0.10523 desktop / 0.15736 → 0.11279 phone**; the darker iron paint and smaller red silhouette are deliberate, not a brightness improvement. Original silhouettes differ, so these medians are not a pure paint A/B.

Ground RMS **0.04616 → 0.02572 (-44.27%) desktop / 0.04904 → 0.02992 (-38.98%) phone**, retaining 70% of the original texture. The stronger intermediate grade failed the existing panorama-detail check; it was reduced and the protected check now passes. The final ground numbers replace the preliminary 84% / 70% reductions.

Declared 5 m camp station: phone bounds **x17.3–372.7 / y174.0–458.2**, persistent HUD **60.135% at the 14 m comparison → 0.010%**; desktop **0.006%** at 5 m. Outhouse phone **0%**, representative derrick **0.180%**; both fit in full. Tiny values below 0.5% are mask/sway sampling noise. Phone entry camp remains **19.097%** covered with bounds **x-19.8–409.8 / y365.2–690.8**; desktop entry **0%**. The phone coverage fraction rises from 13.523% because the narrower body has fewer uncovered pixels, not because the HUD grew. Its entry crop and story coverage remain a camera/UI hold via Claude.

TypeScript/default/full builds pass. Final own batch: **9 pass / one navigation-context failure**, followed by **2/2 isolated errand passes**; all ten selected checks are covered, including the three panorama aspect ratios on both browser projects. Shared brightness/collision: **16 pass / four optional skips**. Loading/repeat: **8/8 and 2/2**. Scoped render guards **34/34** and named guards **3/3** pass. [Regression, exact-base check and final retry](failure-attribution.md). The unchanged node-selector conflict remains drain-owned; no full changed-since green or engine-pin update is claimed.

Final ordinary boards use 1280×800 / 390×844, DPR 1, identical seed, timeAlive 10 seconds, normal HUD and no debug/test hook. All four final plain boots have zero console/page errors. The original entry position is (0, -6.6), after ordinary depenetration, and is identical in both arms. Neither collision nor spawn changed.

Four fresh runs per arm/viewport: median p95 **9.35 → 9.25 ms desktop (-1.07%) / 8.80 → 8.75 ms phone (-0.57%)**, one timing mode. Draws **73 / 54** and rendered triangles **100,884 / 99,212** unchanged; all within 15%. [All frame samples](performance-summary.json).

Engine `d9771424552e194e198257098a5c4e235d0101c5c9f063adf030d42fcd2ef0eb` → `491f2a917b0e360fcaa1e0eda3ee5eb7ba840cc1cd9bf852e3d574d34350725d`; pin unchanged. Store commit `b9597680a8c6eff78526b0c2af2cdc3f05b86f85` pushed on `astra/corrections-3`.
