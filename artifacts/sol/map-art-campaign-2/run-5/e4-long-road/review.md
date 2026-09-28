# The Long Road — run 5 correction

IMPROVED / HELD. The road and its apron are quieter and more continuous. Full road-to-horizon concept fidelity remains unaccepted.

| Original defect | Result |
| --- | --- |
| Road-to-horizon | IMPROVED locally — two wheel cuts and a pale road shoulder follow the published 380 m corridor and three existing stop spurs. HELD: the road runs across the fixed camera's view, not into a horizon; the 400 m route cannot fit the entry view. Camera/layout owner via Claude. No road, mount, terrain height or gameplay dimension changed. |
| Roadside-stop hierarchy | IMPROVED inspection — the west stop fits both declared 5 m stations; phone bounds and HUD are in the metrics. HELD at entry: the first stop is 46 m from the starting actor, beyond the entry framing. Camera/layout via Claude owns this vista. Existing stop architecture and wagon paint still fall short of the plate; they remain campaign art gaps. |
| Smeared dark ground | IMPROVED — measured fixed-region RMS and medians below. Quiet earth retains 5% of the old enlarged paint plus fine grain. The phone ground region excludes the wagon silhouette; the original broader exploratory region mixed body and ground and is not used as a texture measurement. |
| Large left-edge surface | IMPROVED — its ground apron receives the same pigment and loses self-emission locally; distant sky retains its original emission. FIXED the thin exposed-background join through a 0.51 m render-only underlap at 97 apron vertices. Outer scenery, heights, triangles, atlas and UVs are unchanged. A modest tonal boundary remains; full apron art continuity is not accepted. |
| Close wagon | HELD at entry — original visual body and footprint retained; phone projected bounds and entry HUD coverage are recorded below. FIXED inspection framing only: declare 5 m instead of the 14 m comparison. Camera/layout owner via Claude owns actor-relative entry placement and crop. |
| Portrait/story overlays | HELD at entry — persistent coverage and fully normal-HUD plain boards show the remaining obstruction; camera/UI owner via Claude. The temporary story panel is excluded only from the labelled persistent diagnostic mask. No HUD/camera/story bytes changed. |

[Desktop plate and plain before/after](board-1280.png) · [Phone plate and plain before/after](board-390.png) · [Body masks, full projected bounds and ground numbers](visual-metrics.json). Plain boots: identical seed, 1280×800 / 390×844, DPR 1, timeAlive 10 seconds, normal HUD, no debug flag/test hook. Final captures have zero console/page errors. Offscreen panorama pixels on phone are recorded as absent, not 0% occlusion.

Whole-body emission remains 0.45, with no landmark luminance increase claimed. The panorama is scenery, not a landmark body, and its existing sky emission remains 1; the correction suppresses only its near-ground emission. Both mirrored art contracts carry the same inspection stations. All terrain and landmark source/geometry/atlas bytes, mounts and collision remain unchanged. [Invariants](invariants.json) · [Saved panorama source re-export and vertex proof](panorama-verification.json) · [Triangle caps](asset-budgets.json).

The discarded outer-scenery extension failed visual verification and is preserved under `_raw`; it is not part of the shipped change.

Ground RMS: desktop **0.06023 → 0.00879 (-85.41%)**; phone **0.05571 → 0.02562 (-54.02%)**. Desktop apron fixed-region RMS **0.03081 → 0.01180 (-61.72%)**, median 0.15391 → 0.28425. The join underlap is verified geometrically; the narrow pixel strip contains only one bright base pixel, so it is not used as a statistically meaningful contrast score.

Phone wagon inspection: 14 m persistent HUD **27.35% → 0.011%** at 5 m, full bounds x116.9–273.1 / y151.2–507.7; desktop 0% at 5 m. West stop at 5 m: phone bounds x27.7–362.7 / y167.7–463.6, **0.016%** persistent coverage (desktop 0.084%). Values below 0.5% are small mask/sway sampling noise. The station metadata retains the immediately preceding sample (0.007%); the final masks are authoritative. Phone entry wagon remains **12.369%** covered, bounds x196.1–375.7 / y251.7–653.8; desktop entry 0%. These entry limits go to camera/UI via Claude.

TypeScript/default/full builds pass. The Long Road-specific errand and human-parity checks pass **4/4** across both browser projects. Shared landmark brightness/collision: **16 pass / four optional skips**. Loading/repeat: **8/8 and 2/2**. Scoped render guards **34/34** and named guards **3/3** pass. The wider Motor replay failure and stale shared-atlas census were reproduced on the campaign's exact base during Dust Flats; this map's focused checks add no failure. No protected assertion changed. Build/e2e/probe receipts are alongside this review. [Scoped node receipt](node-gates.json): the requested changed-since selector invokes the drain-only full battery, so that full selector remains HELD for the drain, not claimed green.

Four fresh runs per arm/viewport: p95 medians **8.80 → 8.85 ms desktop (+0.57%) / 9.00 → 8.90 ms phone (-1.11%)**, one timing mode in each arm. Draws **59 / 49** and rendered triangles **99,532 / 99,002** unchanged; within 15%. [All samples](performance-summary.json).

Engine `f314eba93a1f7304139063ecef8cad5ab46806bce335058cefa4abcfb1ef00f3` → `d9771424552e194e198257098a5c4e235d0101c5c9f063adf030d42fcd2ef0eb`; pin untouched. Store commit `0f6ef32c9ebb7652c6796b8ccda622a282e8ffca` pushed on `astra/corrections-3`.
