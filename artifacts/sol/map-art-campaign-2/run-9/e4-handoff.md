# Run 9 E4 fidelity — integration handoff

**READY-FOR-GATES.** All four assigned maps are complete as bounded IMPROVED / HELD results. Remaining list in this E4 leg: **none**. Full concept fidelity and existing camera/layout/UI holds are not promoted to accepted. No E1 payload delta applies to this E4-only leg.

Game branch: `sol/map-art-campaign-2`. Store branch: `astra/fidelity-2`, pushed/read back at **e62dbf97cc8ba3c9d8c98e338b84f37d807a67a3**. The lane store is `Gold Rush/worktrees/GoldRush-assets`; main and the engine pin remain drain-owned. No main merge, branch reset/rebase or force-push was performed mid-run. Integrate each map's game and store pair together.

| Map | Game commit | Store commit | Evidence |
| --- | --- | --- | --- |
| Dust Flats | `47b47e43b2ab36d1ddfcd3ed9bd84ecc38ef2ec2` | `b1e2c12a979e6b598860bfb5273142ed7b05d2f3` | [Clauses, boards, numbers, holds](e4-dust-flats/review.md) |
| Long Road | `acdecff85dcd55bda4f663cdbe1f973a3b9aee97` | `e33b81277c9058ae8e8a18c595c975703d4887a7` | [Clauses, boards, numbers, holds](e4-long-road/review.md) |
| Gusher County | `b981d2515172665792408558c558bc46609fe7f9` | `8ef0a035c47622425dada043aca1145e88aaca80` | [Clauses, boards, numbers, holds](e4-gusher-county/review.md) |
| Boneyard | The fourth `art:` commit carrying this handoff, titled `art: refine Boneyard burial and salvage` | `e62dbf97cc8ba3c9d8c98e338b84f37d807a67a3` | [Clauses, boards, numbers, holds](e4-boneyard/review.md) |

Engine chain, before → after each map:

- Dust Flats: `0a23a5425e7b47bb1e7bf7cef05dacb2b3b68c103cc9337459d2bc6cc32823b0` → `7811cb664727d4e4e9da87f09ae49a92f429af42d000a50d495f36aa5e250443`.
- Long Road: `7811cb664727d4e4e9da87f09ae49a92f429af42d000a50d495f36aa5e250443` → `8a51dec200e748ad42ea24d3ffd8f53525dfc7f34edba41b260107179b9f809c`.
- Gusher County: `8a51dec200e748ad42ea24d3ffd8f53525dfc7f34edba41b260107179b9f809c` → `e5acca191da821a5e1bf2ad225fef65ce93a11bd32d0610213465b7b23680bd7`.
- Boneyard: `e5acca191da821a5e1bf2ad225fef65ce93a11bd32d0610213465b7b23680bd7` → `49242d1713cb1c67838adc284919b18f067b4efad6ea61a61b42cba95bdfd731`.

All four maps pass TypeScript/default/full builds, scoped **34+3** guards, loading **8/8**, repeat **2/2**, declared triangle budgets, exact source-envelope proofs and reproducible source/recipe exports. Existing atlas pixels, gameplay, collision, heights, masks, routes, spawns, mounts and inspection declarations are preserved. The 36 registry rows remain single-line. Emission stays ≤0.45; Boneyard soil is 0. No new raster image was generated. Fifteen existing landmark bodies were revised; no new mount was invented. [Scope proof](e4-scope-proof.json).

| Map | Complete browser batch: pass / skip / fail | Baseline qualification | Entry p95 desktop / phone, ms |
| --- | --- | --- | --- |
| Dust Flats | 85 / 5 / 20 | All 20 also fail on exact base; 16 exact fingerprints, two varying Claim-horizon samples, two opposite immediate E5 toggle assertions. The toggle pairs are explicitly not exact matches. | 9.85→9.65 / 9.65→9.60 |
| Long Road | 57 / 17 / 10 | All 10 also fail on exact base; eight exact fingerprints and two varying Claim-horizon samples. | 9.45→9.60 / 9.90→9.90 |
| Gusher County | 64 / 6 / 6 | All six also fail on exact base; four exact fingerprints and two varying Claim-horizon samples. | 9.75→9.70 / 9.70→9.80 |
| Boneyard | 55 / 5 / 6 | All six also fail on exact base; four exact fingerprints and two varying Claim-horizon samples. | 9.70→9.70 / 9.85→9.90 |

All timing profiles use four fresh runs per arm/viewport, one comparable mode, and pass the 15% gate. Entry draw counts remain unchanged. Supplementary Gusher lease timing is **9.05→8.95 /8.90→8.90 ms**, unchanged draws63/44. Supplementary Boneyard sleeper timing is **10.05→9.90 /9.80→10.00 ms**, draws64→65/45→46, including the revised off-entry geometry. Zero console/page errors in all final plain, station and performance captures. The complete browser batches are **not all green**; use the per-map failure-attribution reports, not a blanket pass label.

Retained limits: Dust's unmounted outer-field derricks and full vista; Long's materials/contact and complete apron continuity; Gusher's full field network, weathering and mechanical attachment; Boneyard's sharp mound boundary, ambiguous metal and small-wreck contact. Every declared HUD figure is compared with its own earlier review and every rise is disclosed. The shared Motor vehicle and all E10 maps are unchanged. These are render-only changes; the drain owns further gates, integration and pinning.

[Preflight and completion log](e4-run-note.md) · [Campaign report](../report.md) · [Current status table](../../../../reviews/sol-map-art-current-status-20260909.md).
