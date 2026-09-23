# Dust Flats — run 9 fidelity

**IMPROVED / HELD — READY-FOR-GATES.**

| Verbatim art-owned clause from run 5 | Result |
| --- | --- |
| “Actual outer-field derrick dressing remains a campaign art gap, not accepted by this pass.” | HELD — the twelve harvest sites do not have existing static derrick mounts in this pack. The five existing mounts are service buildings. New mounts, lease moves and the excluded LandYachtBossSystem are outside this render slice; art/contract coordination via Claude owns that addition. The two rebuilt service bodies do not substitute for those derricks. |
| “Full sparse service-chain vista remains HELD for camera/layout and subsequent art.” | IMPROVED the existing art: the east reserve changes from a red-roof shed to three hooped storage tanks, sloped iron lids, taps and a connected passive manifold; the north tower gains tapered lattice, open lookout windows, balcony and metal roof. Same original local bounds and mounts. Reserve 2,380→2,224/3,000 triangles; tower 628→826/3,000. Full entry vista remains HELD for camera/layout. Dark roof/cabin, fine metal detail and stronger contact remain art holds, confirmed by independent review. |

The latest run-8 shared Motor body is retained unchanged and excluded by this task. No other run-5 clause is promoted to FIXED. No independent run-5 critique exists.

[Plain desktop board](board-1280.png) · [plain phone board](board-390.png) · [tank detail](east-horizon-fuel-reserve-paired-crop.png) · [tower detail](north-railhead-storm-tower-paired-crop.png) · [independent review](independent-visual-review.md).

Earlier correction preserved: fixed-region ground RMS run 5 **0.0165664 / 0.0206796**, run 9 **0.0165662 / 0.0206802** (desktop / phone); fresh before/after pixels identical. No ground, panorama or road change.

The unchanged charting post at its declared 5 m station measures **0.021512% / 0.027662%** persistent HUD, compared with run-5 **0% / 0.005586%**: both tiny rises are explicitly reported. Fresh desktop before/after is identical; phone 0.033196%→0.027662%. Source, camera, station and HUD bytes are unchanged, so these are mask/sway sampling differences, not a new clearance claim. The post remains wholly offscreen at entry. [Prior-number comparison](prior-comparison.json).

Supplementary (not declared) 5 m station body medians: reserve **0.15496→0.16463 / 0.15721→0.16644**; tower **0.14588→0.12688 / 0.14671→0.12771**. The reserve silhouette occupies **24.65% fewer masked pixels** at the same outer bounds on both widths, exposing gaps between the tanks and pipework. [Mask comparison](silhouette-comparison.json). Silhouette proportions changed, so no pure material-brightness claim. Whole-body emission stays **0.45**. Tower phone mask coverage increases **0.349%→0.606%** in this supplementary view; the existing top panel partly covers the vane, retained as a UI/art limitation.

Terrain, heights, masks, routes, spawn, collision, all mount/station declarations, original atlas pixels and the other three source bodies are exact. [Invariants](invariants.json) · [budgets](asset-budgets.json) · [saved-source re-export](source-verification.json).

TypeScript/default/full builds pass, scoped render guards **34/34** and named guards **3/3** pass. All map-ID-matching specs and shared landmark brightness/collision suites ran both projects, one worker: **85 pass / five skips / 20 base-red tests**. Sixteen assertion fingerprints are exact; two horizon predicates have small pixel differences; two E5 toggle tests fail different immediate-read phases. No blanket exact-fingerprint or full-suite-green claim. [Attribution and limits](failure-attribution.md). Loading **8/8**, repeated-instance **2/2**, source re-export and [frozen-input recipe](recipe-verification.json) pass. Plain, station and performance captures report **zero console/page errors**.

Four runs per arm at 1280px: p95 median **9.85→9.65 ms (-2.03%)**, draws **[84]→[84]**, a single timing mode and within 15%.

Four runs per arm at 390px: p95 median **9.65→9.60 ms (-0.52%)**, draws **[52]→[52]**, a single timing mode and within 15%.

Entry timings do not claim the outer service bodies are in the entry frustum. E1 payload gate is not applicable to this E4-only map; no E1 source or runtime asset changes. Engine pin remains drain-owned.

Engine `0a23a5425e7b47bb1e7bf7cef05dacb2b3b68c103cc9337459d2bc6cc32823b0` → `7811cb664727d4e4e9da87f09ae49a92f429af42d000a50d495f36aa5e250443`. Store `b1e2c12a979e6b598860bfb5273142ed7b05d2f3`, pushed/read back on `astra/fidelity-2`.
