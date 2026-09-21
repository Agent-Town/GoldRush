# The Glow Mesa — run 6 correction

**IMPROVED / HELD.** Ground texture has less competing contrast and the five landmarks use lit diffuse paint instead of the old whole-body emission exemption. The ordinary entry still fails to present the plate's mesa composition; full concept acceptance remains withheld.

| Original defect | Result |
| --- | --- |
| Raised mesa not communicated at entry | IMPROVED material separation: the existing cap grades toward pale stone and its lower apron toward warm earth, using the existing world height. HELD entry composition by contract/layout and camera owners via Claude: the hero starts at (0,-32), south of the cap, and the fixed camera does not frame the raised mesa. No surface or height sampler changed. |
| Teal node ring not communicated | HELD by the Atomic gameplay/visibility owner via Claude. The six-vein ring is state-dependent and becomes active after dark (`e6-tile-consumers.spec.ts`); a permanent decorative active ring at daytime would misrepresent that state. |
| Facility grouping not communicated | IMPROVED paint separation at the existing inspection stations: whole-body emission falls **3.0 → 0.45**, below the 0.6 cap. Pylon median display luminance at 5 m is **0.3832 desktop / 0.3815 phone**; the formerly self-lit body was 0.7031/0.6997. This is a removal of self-light, not a claimed brightness increase. Facility placement/grouping at entry remains HELD by layout/camera owners; the five mounts and footprints are unchanged. |
| Dense mottled ground fills both views | IMPROVED: fixed-region luminance RMS falls **41.49% desktop / 39.21% phone**; median rises **28.69% / 29.17%**. The existing painted texture remains visible and no decorative paths or false geometry are invented. |
| Clipped desktop structure | HELD at ordinary entry: cooling-rack bounds project to x1138.8–1388.7, y−100.9–53.2 on 1280×800, with **95.31% persistent HUD coverage of its remaining 640 on-screen body pixels**. Inspection is IMPROVED at the declared 5 m station: **0.054% desktop / 0.105% phone** HUD coverage. UI/camera owners via Claude retain the entry problem. |
| Almost no portrait landmark context | HELD at ordinary entry: that rack has **zero on-screen body pixels**, so its HUD percentage is undefined, not 0%. Inspection is IMPROVED: pylon 14 m → 5 m reduces phone HUD **8.90% → 0%**; tall derrick is declared at 3 m, with **0.090%** phone HUD coverage and projected bounds inside the viewport. This does not change the player's starting view. |

[Desktop plain board](board-1280.png) · [Phone plain board](board-390.png) · [Derrick phone inspection](station-after-mesa-starstone-derrick-3-390-normal.png) · [Metrics, masks and full bounds](visual-metrics.json).

All four plain boots use normal HUD, no debug flag, no test hook, seed `map-art-campaign-2`, 1280×800 or 390×844 at DPR1, about ten seconds after entry. All have **zero console/page errors**. Frozen diagnostic and station frames are separately labelled. Temporary story cards remain in the normal frames and are excluded only in the explicitly labelled persistent-HUD mask.

All terrain, panorama, atlas and landmark asset bytes, dimensions, mask truth, mounts and collision footprints are unchanged. Only render-only acceptance stations change in both mirrored contracts. Terrain **32,768/60,000**, panorama **2,496/4,000** triangles; each landmark remains within **3,000**. [Invariants](invariants.json) · [Budgets](asset-budgets.json). The diffuse correction reuses the existing Pressure Garden formula; both maps pass their selected visual census, **4/4**.

TypeScript/default/full builds, scoped render guards **34/34**, named guards **3/3**, shared brightness/collision **16 pass / four opt-in skips**, loading **8/8**, repeat **2/2** pass. Own Atomic batch: **39 pass / one story-arrival timeout** at `ss-07-e6-beats.spec.ts:94` (`active() === null`); unchanged isolated retry passes **2/2**. This is recorded as a transient failure, not hidden or treated as a production fix. No assertions changed. Engine pin and full node battery remain drain-owned.

Four fresh timing runs per arm/viewport: desktop p95 **9.75 → 8.90 ms (−8.72%)**; phone **9.70 → 9.60 ms (−1.03%)**. Each arm is a single comparable mode; draws **68/48** and triangles **100,606/97,214** stay unchanged. Both meet 15%. [All samples](performance-summary.json).

Engine `c8da6e7c043bb2f42b5fd2f94d17d83387d7a29abca9adffab1d15994ce5681e` → `68d976b06be1045f935047e482b765d91d61b045b45c87d77d677715b4e528e4`; pin untouched. Store `a368aba78a3f65bb93e46a9a624c617fb2d90b18` pushed on `astra/corrections-4`.
