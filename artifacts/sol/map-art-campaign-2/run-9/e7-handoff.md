# E7 fidelity — ready for the drain

2026-09-23. **READY-FOR-GATES. Remaining E7 list: none.**

| Map | Disposition |
| --- | --- |
| Dead Band | **IMPROVED / HELD**. “These simple braced frames do not yet equal the plate's layered antenna architecture.” Warning frame **156→1,464/3,000**, north gate **180→1,548/3,000**. Own run-6 station luminance **0.10425→0.18928 / 0.10956→0.19237**, and **0.13721→0.16715 / 0.12962→0.16715**. Changed-body station HUD remains below run 6; emission 0.45; ground, bounds, mounts, collision and atlas exact. Full architecture/weathering and north burial remain held. [All quoted clauses, boards, limitations and gates](e7-dead-band/review.md). |
| Relay Rush | **SKIPPED** by the explicit no-art-owned-hold rule. The latest run-6 holds name contract/layout, camera/layout, UI/camera and existing sim/presentation owners; no independent review exists in runs 3–6. All assets remain exact. [Selection](e7-scope-selection.json). |

Dead Band's mixed clause “HELD fuller yard composition by contract/collision and art/layout owners: the unselected solid post/caches cannot replace or add blockers within this task.” is answered by the two-frame art improvement and by preserving run 7's already-landed **10-body solidity**. This run does not claim that earlier work or resolve the remaining yard layout.

TypeScript/default/full builds, **34+3** scoped guards, source/recipe reproduction, generic loading **8/8**, repeat **2/2**, and six map-specific cycles pass. Browser **103 pass /5 skip /12 fail** initially: eleven reproduce on exact engine-verified base, nine with exact fingerprints; two horizon values vary. The single unmatched mobile Charter Press failure passes on base and the restored candidate's **2/2** isolated retry. [Failure resolution](e7-dead-band/failure-attribution.md). No assertions changed.

Entry p95 **8.90→8.90 /9.80→9.45 ms**; north-gate **9.00→9.65 /9.30→9.45 ms**, all **within15%**, single-mode, unchanged draws **78/56** and **57/45**. Four runs per arm/viewport/location. All capture errors zero. E1 byte delta **N/A**; two E7 GLBs add **183,916 raw bytes**.

Engine pair: `e7c87a88d08517d84983d408a876cfa994068807fa51b3c54ee96bbe24710e32` → `6655ba7569775a529216d58cf8f288556ca9fc19cfd7bbeae41dbeb9a99adf33`. Store **`892b7f6f993cfb79dcee9c96d82c32efe32ea20f`**, pushed/read back on **astra/fidelity-2**. Game: the **art: refine Dead Band silent antenna frames** commit carrying this handoff, on **sol/map-art-campaign-2**. No main/pin changes.

The initial pre-art control lacked a frozen engine inventory once the source-input JSON was added; it is diagnostic only. The closing base replay parks that JSON and verifies restoration. The first map-cycle call used a pack slug rather than runtime tile ID; the corrected canonical-tile probe passes. Both rejected attempts remain documented.

Later epoch legs, outside this task, in order: **e8-far-side → e8-low-orbit → e9-dome-basin → e9-seed-run → e9-devils-alley → e9-old-canal**. Full plate fidelity and existing code/UI/layout holds remain visible in the per-map review; READY-FOR-GATES is not a drain or shipping claim.
