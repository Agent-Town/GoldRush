# The Boneyard — run 6 correction

**IMPROVED / HELD.** The enlarged machinery print has less contrast, and the northern sleeper now has a pressure-engine silhouette. Full plain-entry concept fidelity remains unaccepted.

| Original defect | Result |
| --- | --- |
| Enlarged painted machinery flattens into the ground | IMPROVED: the existing Motor ground treatment follows this map's two actual approach corridors. Fixed-region luminance RMS falls **53.93% desktop / 48.91% phone**. Printed forms and the distant straight boundary remain visible; repainting those completely remains an art-owner gap. No height or gameplay mask changed. |
| Distinct wreck silhouettes and buried-engine scale | IMPROVED: the rectangular sleeper cabin becomes a barrel, chimney, three pairs of exposed wheels, rods and broken frame. Cylindrical UVs reduce stretched wood-like grain; an irregular tapered deposit intersects its lower wheels. **1,842 / 3,000 triangles**, from 208, in the same 9.8022 × 5.4878 × 5.1372 m local envelope. Remaining burial depth, metal/weathering and richer wreck variety are HELD by the art owner via Claude. |
| Layered yard depth at plain entry | HELD by contract/layout/camera owners via Claude. The twelve bodies retain their paired salvage-row and northern sleeper mounts. The sleeper is at (34,36); the plain phone view does not include that location. An inspection station is not evidence of entry visibility. |
| Small blocky vehicle provides little context | HELD by the shared Motor vehicle-art owner via Claude. Its shared visual is unchanged; changing it for all already-corrected Motor maps would expand this slice. |
| Portrait overlays and framing | IMPROVED inspection: boiler at 5 m has **0%** persistent phone HUD coverage, versus **45.00%** at the 14 m comparison. Sleeper at 8 m has **0.80%**, versus **39.76%** for the original body at 14 m. HELD entry: boiler is entirely offscreen on phone and partly side-cropped on desktop; the sleeper's rear upright still meets the phone weapon panel. Camera and UI owners via Claude. |

[Plain desktop board](board-1280.png) · [Plain phone board](board-390.png) · [Sleeper desktop station](sleeper-station-board-1280.png) · [Sleeper phone station](sleeper-station-board-390.png). Plain boards use 1280×800 and 390×844, DPR 1, seed `map-art-campaign-2`, timeAlive approximately 10 seconds, ordinary HUD, no debug flag or test hook. All four boots have **zero console/page errors**. Labelled station captures use the frozen diagnostic.

Whole-body emission remains **0.45**, below the 0.6 cap. Final sleeper station median display luminance is **0.1215 desktop / 0.1259 phone**; this is not a brightness improvement claim because the silhouette and sampled material proportions changed. Final desktop/phone persistent HUD coverage at 8 m is **0.005% / 0.799%**. Projected box corners extend beyond phone sides although the primary visible body fits; no full-bounds-fit claim. Full masks and bounds: [metrics](visual-metrics.json).

Terrain and panorama geometry/atlases, all mounts, footprint dimensions, mask truth and all other eleven landmark GLBs stay unchanged. Every original and saved candidate source re-exports byte-identically to its respective GLB. Station declarations are mirrored in the terrain and pack contracts. [Source proof](source-verification.json) · [invariants](invariants.json) · [budgets](asset-budgets.json) · [independent critique and resolution](independent-review.md). The reviewer rejected an intermediate block-like burial pass; the final continuous tapered deposit replaces it. Full art acceptance is withheld.

Four fresh timing runs per arm and viewport: desktop p95 median **9.80 → 9.90 ms (+1.02%)**; phone **9.95 → 9.80 ms (-1.51%)**, single comparable mode. Draw calls **62 / 49**, rendered entry triangles **97,688 / 96,948**, unchanged. Both arms meet 15%. These entry timings do not imply the distant sleeper was in view. [All frame samples](performance-summary.json).

TypeScript/default/full builds, scoped render guards **34/34**, named guards **3/3**, selected map census **2/2**, shared brightness/collision **16 pass / four opt-in skips**, loading **8/8** and repeat **2/2** pass. Motor/spec batch **24 pass / two replay failures**: both reproduce on exact code+store base with `assay replay failed: malformed tape`; [attribution](failure-attribution.md). No assertions changed. The full node battery and engine pin remain drain-owned. The first final compositor invocation selected Homebrew Python without Pillow; rerunning the same metrics/board code with the existing Pillow-equipped interpreter succeeded.

Engine `491f2a917b0e360fcaa1e0eda3ee5eb7ba840cc1cd9bf852e3d574d34350725d` → `c8da6e7c043bb2f42b5fd2f94d17d83387d7a29abca9adffab1d15994ce5681e`; pin untouched.

Store commit `dfac96930cee55742fde0f99c19ba4b70c9ddc05`, pushed on `astra/corrections-4`.
