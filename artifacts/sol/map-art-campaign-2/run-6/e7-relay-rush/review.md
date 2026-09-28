# Relay Rush — run 6 correction

**IMPROVED / HELD.** Four authored relay frames now mount and the starting frame gives both entry views a local landmark. The plate's ascending terraces remain unaccepted because the actual relay route occupies two equal-height ridge bands.

| Original defect | Result |
| --- | --- |
| Ascending beacon terraces not communicated | IMPROVED existing shelf separation with height-based pigment. HELD ascending geometry by contract/layout owners via Claude: the four relay sites at x−45/−25/25/45, z41 share height 5. No new elevation or walk surface is invented. |
| Route progression not communicated | FIXED omitted render selection for four existing nonblocking relay frames: **5→9 bodies**, **+1,264 authored triangles**, with increasingly tall 6.58–7.12 m silhouettes. IMPROVED local identity; static frames do not claim a relay is active. HELD whole-route vista by camera/layout owners and active signal presentation by its existing sim/presentation owner. |
| Dense dark ground markings dominate | IMPROVED fixed clear-ground RMS **−51.24% desktop / −49.40% phone**; median **+84.26% / +77.53%**, dark share below 0.1 **25.06%→0% / 28.67%→0%**. Regions avoid the added frame, actors and HUD. |
| Peripheral relay geometry clipped | IMPROVED declared west-dish inspection **14 m→3 m**: phone persistent HUD **76.11%→6.60%**, top crop eliminated. Charting station at **2 m** has **0.10% desktop / 0.60% phone** persistent coverage and fits the viewport. HELD ordinary entry: charting station remains **100%** persistent-covered on desktop with bbox x1084–1322, y−4–190; entirely offscreen on phone. The west dish is entirely offscreen on both entry views. UI/camera owners via Claude. |
| Portrait lacks useful landmark context | IMPROVED starting R2 frame: **20,727 desktop / 23,128 phone body pixels**, median **0.274 / 0.277** at whole-body emission **0.45**. Entry persistent coverage **0.082% / 2.91%**. At declared 3 m stations, phone coverage R1/R2/R3/R4 **0.044/0.261/0.852/1.092%**; all boxes fit. HELD full landscape hierarchy by layout/camera owners. |

[Desktop plain board](board-1280.png) · [Phone plain board](board-390.png) · [Full body/HUD metrics](visual-metrics.json). Plain boots use ordinary HUD, no debug or test hook, seed `map-art-campaign-2`, about ten seconds after entry, DPR1 at 1280×800 / 390×844; all four have zero console/page errors. Diagnostic stations remain labelled and retain normal-HUD captures beside masks.

The hero starts exactly at R2's center. Its head and upper body remain clear; the existing low frame platform covers **6.58% desktop / 6.48% phone** of the hero sprite, localized to feet, versus zero before. This is a visible dressing tradeoff, not a collision or walk-height change. [Depth-tested actor masks](hero-occlusion.json). The frame's full phone bbox is x41–350, y325–558. Retained west-dish paint at 3 m improves median **0.113→0.184 / 0.116→0.185** without raising emission.

All GLBs, atlases, blends, transforms, sampler, mask truth and collision bytes remain unchanged. The solid start horn stays unselected until the contract/collision owner reconciles its footprint with the Relay Valley alias. Filters and declared stations match in both variant contracts. [Invariant proof](invariants.json). Terrain **32,768/60,000**, panorama **3,084/4,000**, each body **≤3,000** triangles. [Budgets](asset-budgets.json). Six mount/dispose cycles verify all nine bodies, four additional frames, no horn, no walk surfaces, no errors and zero retained scene children.

TypeScript/default/full builds, render guards **34/34**, named guards **3/3**, own front/census **16/16**, Signal row checks **6/6**, visual census **2/2**, shared brightness/collision **16 pass / four opt-in skips**, loading **8/8**, repeat **2/2** all pass. No assertion or engine pin changed. Broader Signal profile/activation and mobile tape failures were reproduced on the exact preceding map base in [Dead Band's attribution](../e7-dead-band/failure-attribution.md); no fix is claimed here.

Four fresh timing runs per arm/viewport: desktop p95 **10.10→10.05 ms**, phone **10.00→9.95 ms**, single comparable modes, within 15%. Draw calls **68→70 / 51→52**; entry triangles **100,536→101,072 / 97,898→98,190**. [All samples](performance-summary.json).

Engine `c4de03c756e538abb6c3787d9a1e4b80cc03b62cc3de095eaa2fedb8df814ab4` → `36abad02458965365c31dfe66a98155d66182324ab136feb6709bfa791ff0abc`. Store `0535aa5ffca2f422b0d15b378044d00b9e47771a` pushed on `astra/corrections-4`.
