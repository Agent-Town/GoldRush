# Boneyard — run 9 fidelity

| Earlier art clause, quoted verbatim | Run 9 answer |
| --- | --- |
| “Printed forms and the distant straight boundary remain visible; repainting those completely remains an art-owner gap.” | IMPROVED printed-form contrast using the existing Boneyard-only ground blend, 0.55→0.72. Same fixed boxes: run-6 RMS **0.032782409→0.024547906 desktop (−25.12%) / 0.032934275→0.027018006 phone (−17.96%)**. Fresh A/B gives −25.12%/−17.96% too. Ground median **0.260190→0.289009 / 0.264945→0.288176**; this is a lighter, quieter treatment, not a new texture. The distant straight boundary, residual oversized print and full illustrated ground fidelity remain HELD by the art owner via Claude. |
| “Remaining burial depth, metal/weathering and richer wreck variety are HELD by the art owner via Claude.” | IMPROVED sleeper silhouette, readable partial wheel burial, restrained rods/bands and two distinct small wrecks. Sleeper **1842→2926/3000** triangles; west-b **512→1370/3000**; east-b **512→1250/3000**. Original envelopes and mounts remain exact. Matte non-emissive sediment replaces the rejected atlas-colored base. Sleeper median **0.121470→0.221880 desktop / 0.125942→0.223300 phone**, with machinery emission still **0.45** and soil **0**. This includes changed material/silhouette proportions, not a claim that brightness equals metal fidelity. Abrupt mound edge, wood-like shell texture, merged dark chassis detail, weak small-wreck burial and remaining nine bodies' variety stay HELD for art via Claude. |

The fresh screenshot-only reviewer saw no meaningful change in the starting-view scene; the measured ground contrast reduction does not establish graveyard identity. The inspected props show a bounded improvement and clearer partial burial; full concept fidelity remains unaccepted. A crisp brown base and then a pale noisy mound were rejected before the final matte-earth revision. [Independent findings and resolution](independent-visual-review.md).

Source bounds remain exactly **9.8022×5.4878×5.1372 m** for the sleeper; all three source transforms, mount positions, collision footprints and inspection stations remain exact. Its projected mask occupies **17.46% fewer desktop / 17.22% fewer phone pixels**; west-b **24.87% / 25.00% fewer**, east-b **21.54% / 21.52% fewer**, from opening/reducing the bulky original silhouettes, not shrinking the declared envelopes. [Silhouette measurements](silhouette-comparison.json).

Each revised GLB now declares its actual **two primitives / two materials**: atlas machinery and matte earth. No triangle budget is raised. Total raw runtime GLB delta is **+159,892 B**. The original atlas pixels, terrain/panorama geometry and contracts, nine sibling models and all protected gameplay authorities are unchanged. [Bytes and counts](model-deltas.json) · [invariants](invariants.json) · [all budgets](asset-budgets.json) · [all twelve saved-source re-exports](source-verification.json) · [three recipe reproductions](recipe-verification.json).

Declared persistent HUD coverage, each against its own run-6 station:

| Body / distance | Desktop run 6 → run 9 | Phone run 6 → run 9 |
| --- | --- | --- |
| west-b / 5 m | 0.040611% → 0.032065% | 0.087598% → 0.153994% |
| west boiler / 5 m | 0% → 0.006908% | 0% → 0.018625% |
| east-b / 5 m | earlier figure absent → 0.029240% | earlier figure absent → 0.148914% |
| sleeper / 8 m | 0.004677% → 0.067549% | 0.799094% → 0.158770% |
| unmarked wagon / 5 m | 0.009766% → 0.014467% | 0.030676% → 0.043307% |

Rises are explicitly retained: west-b phone **+0.066397 percentage points**; boiler **+0.006908/+0.018625**; sleeper desktop **+0.062871**; wagon **+0.004701/+0.012631**. East-b has no old figure; fresh A/B is **0.045882→0.029240% desktop / 0.061868→0.148914% phone**, so its phone rise is also disclosed. The sleeper's large historical phone reduction is **not credited to this pass**: fresh baseline is already **0.162720%**, versus final **0.158770%**. Tiny mask-edge samples vary at unchanged views, and unchanged boiler/wagon geometry also shows small differences. No new blanket HUD-clearance acceptance follows. [Own earlier figures and fresh baselines](prior-comparison.json) · [masks, projected bounds and luminance](visual-metrics.json).

Existing owners' holds remain: layered yard depth and full entry composition (contract/layout/camera); the northern sleeper is absent from plain phone entry; the west boiler is offscreen on phone and side-cropped on desktop; ordinary phone dialogue overlaps controls (UI). Shared Motor vehicle art belongs to run 8 and is unchanged here. Full sleeper box corners still extend beyond phone sides even though its visible silhouette fits.

[Concept/plain desktop board](board-1280.png) · [concept/plain phone board](board-390.png) · [sleeper desktop crop](crop-half-buried-sleeper-1280.png) · [sleeper phone crop](crop-half-buried-sleeper-390.png). Four final ordinary boots and 24 station captures have **zero console/page errors**. Plain captures have ordinary HUD, no debug flag/test hook, seed `map-art-campaign-2`, timeAlive about 10 seconds, DPR 1, 1280×800 / 390×844.

TypeScript/default/full builds, **34/34** scoped render guards, **3/3** named guards, loading **8/8**, repeat **2/2**, source and recipe proofs pass. The complete map-ID-matching and shared browser batch ran both projects with one worker: **55 pass / five optional skips / six failures**. All six also fail on the exact baseline: four fingerprints match exactly, while two Claim-horizon values vary slightly under the same predicate. [Qualified attribution](failure-attribution.md). Candidate restored exactly. One earlier browser attempt was intentionally interrupted for visual revision; it is not counted as completed verification. The material-count guard's intermediate failure was corrected by declaring actual render counts, never by changing its assertion.

Four fresh browser runs per arm/viewport at entry, single comparable mode: p95 median **9.70→9.70 ms desktop (0%) / 9.85→9.90 ms phone (+0.51%)**, within 15%. Draws **69 / 51**, rendered triangles **100512 / 98252**, unchanged. These entry numbers do not profile the distant sleeper. [Entry samples](performance-summary.json).

At the unchanged sleeper 8 m station, four fresh browser runs per arm/viewport also pass: p95 **10.05→9.90 ms desktop (−1.49%) / 9.80→10.00 ms phone (+2.04%)**, single mode. Draws **64→65 / 45→46**; rendered triangles **101900→102984 / 99056→100140**, explicitly including the revised sleeper. Both timing and draws stay inside 15%. [Sleeper-view samples and config](sleeper-performance/performance-summary.json).

E1 payload gate is **not applicable** to this E4-only map; no E1 assets change. The engine pin remains drain-owned.

Engine `e5acca191da821a5e1bf2ad225fef65ce93a11bd32d0610213465b7b23680bd7` → `49242d1713cb1c67838adc284919b18f067b4efad6ea61a61b42cba95bdfd731`. Store `e62dbf97cc8ba3c9d8c98e338b84f37d807a67a3`, pushed/read back on `astra/fidelity-2`. READY-FOR-GATES with explicit art/UI holds and qualified baseline failures.
