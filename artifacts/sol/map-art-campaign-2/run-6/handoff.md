# Corrections run 4 / campaign run 6 — completed handoff

**READY-FOR-GATES. All 16 requested maps completed in order; remaining list: none.** Each is an IMPROVED / HELD correction within the task firewall. No full concept is declared accepted. Individual reviews answer every original clause and name the owners of remaining work.

Last Claim, in Astra’s words: the missing sculpt pack is fixed. A dedicated memorial deck, panorama and five monuments now mount, and the lantern is visible at ordinary phone entry (0.134% persistent HUD coverage). The circular plate boundary, ornate rim, legacy Ark deck integration, heart/grayscale and full preserve composition remain unresolved. Those are explicit holds, not acceptance.

Desktop/phone numbers below are ordered 1280/390. HUD percentages are phone landmark-body coverage; offscreen means absent, never 0%. Inspection success does not establish entry visibility.

| Order / map | FIXED or IMPROVED evidence | Phone HUD handoff | HELD scope |
| --- | --- | --- | --- |
| 1. [Boneyard](e4-boneyard/review.md) | Sleeper 1,842/3,000 triangles; ground RMS −53.93%/−48.91%. | Boiler 5 m 0%; sleeper 8 m 0.80%; entry offscreen. | Buried scale, yard depth, vehicle body and entry framing. |
| 2. [Glow Mesa](e6-glow-mesa/review.md) | Ground RMS −41.49%/−39.21%; emission 3→0.45. | Pylon 5 m 0%; entry rack offscreen. | Raised mesa, facility grouping and entry composition. |
| 3. [Half-Life Hollow](e6-half-life-hollow/review.md) | Ground RMS −40.00%/−40.30%; median +48.17%/+73.04%. | Gate 5 m 0.17%; entry offscreen. | Ravine, suspended crossings and full gate architecture. |
| 4. [Picnic](e6-picnic/review.md) | Three blankets and gate, +1,452 triangles; ground RMS −45.92%/−43.46%. | Pylon 5 m 0%; entry pylon 21.42%, blankets offscreen. | Solid shade variant, gathering, picnic vista and entry context. |
| 5. [Dead Band](e7-dead-band/review.md) | Two silent frames, +336 triangles; ground RMS −45.64%/−40.92%. | Radio 2 m 0.523%; warning 3 m 0.026%; north frame 3.513% plus crop. Entry chart/warning 4.015%/23.843%. | Terrace hierarchy, solid variants and entry UI. |
| 6. [Relay Rush](e7-relay-rush/review.md) | Four frames, +1,264 triangles; ground RMS −51.24%/−49.40%. | Dish 3 m 6.60%; chart 2 m 0.60%; entry R2 2.914%. | Ascending layout, horn variant, entry bounds and actor overlap. |
| 7. [Far Side](e8-far-side/review.md) | Landing frame +600 triangles; broad stripe share 36.09%→1.56%; fine-grain RMS +81.75%/+89.02%. | Landing 3 m 5.768%; array 3 m 10.75%; entry landing 10.385%. | Crater, suit/pressure equipment, isolated dish composition. |
| 8. [Low Orbit](e8-low-orbit/review.md) | Rig 2,972/3,000 triangles; body dark share ~81%→~8%. | Rig 3 m 0.998%; entry 47.291%. | Suspended station/debris depth, detailed contact and entry composition. |
| 9. [Dome Basin](e9-dome-basin/review.md) | Wheel 452→1,580/3,000 triangles; ground RMS −49.33%/−39.41%; five dry segments. | Wheel 5 m 0%; entry offscreen. | Wet C3 canal, basin rails/terraces and ordinary entry. |
| 10. [Seed Run](e9-seed-run/review.md) | Vault 800→2,148/3,000; ground RMS −59.39%/−62.50%; four route segments/three green zones. | Vault 3 m 0%; entry 23.326% (increased). | Convoy body, continuous irrigation, distant settlement and entry UI. |
| 11. [Devil’s Alley](e9-devils-alley/review.md) | Three coil rigs 1,848/2,192/2,536 under 3,000; RMS −40.50%/−20.91%. | Center 3 m 0.004%; entry 5.880% (increased). | Storm corridor, functional rings, mast detail and entry composition. |
| 12. [Old Canal](e9-old-canal/review.md) | Dry masonry 552 triangles/band; winches 1,444/1,456/1,468; RMS −69.99%/−25.61%. | Winch 5 m 0.111%; entry 15.861%. | Continuous wet vista, full architecture, contact and entry UI. |
| 13. [Last Claim](e10-last-claim/review.md) | Missing pack FIXED: terrain 32,768/60,000, panorama 1,024/4,000, five monuments 528–1,328/3,000. | Lantern 5 m 0.058%; entry 0.134%, body median 0.460. | Circular boundary/rim, legacy Ark deck, heart/grayscale and full preserve view. |
| 14. [Ember Shore](e10-ember-shore/review.md) | Titan 908→2,356/3,000; body median 0.123→0.231; ground median 0.053→0.337 / 0.061→0.321. | Five 5 m inspections ≤0.199%; entry altar 0.791%. | Giant buried titan, branching fissures, rectangular tone join and contact/light pools. |
| 15. [Archive World](e10-archive-world/review.md) | Gate 1,128→888/3,000, desktop entry area −31.83%; ground RMS −55.44%/−50.11%; earned pool 0.247→0.395. | Gate 10 m 68.719% (held regression); entry 15.794%. Other inspections 8.122/7.349/13.604/0.007%. | Full vista, state-zone borders, facade/contact and camera/UI conflict. |
| 16. [River](e10-river/review.md) | Bank RMS −21.09%/−9.12%; short broken water highlights; zero new triangles. | Not applicable: zero mounted raw-route landmarks. Normal panels/dialogue still overlap. | 128 m raw versus 64 m finale charter, shoreline/ford, pan composition and quiet HUD. |

## Immutable boundaries

Full values are also in [campaign-boundaries.json](campaign-boundaries.json). Code commits stay on `sol/map-art-campaign-2`; fifteen asset commits were pushed on `astra/corrections-4`. River changes no store bytes. The final code hash is the commit containing this handoff.

| Map | Code after | Store after | Engine before → after |
| --- | --- | --- | --- |
| Boneyard | `38380fa91127e1292cab8dd17446a7ffaf248af9` | `dfac96930cee55742fde0f99c19ba4b70c9ddc05` | `491f2a917b0e360fcaa1e0eda3ee5eb7ba840cc1cd9bf852e3d574d34350725d` → `c8da6e7c043bb2f42b5fd2f94d17d83387d7a29abca9adffab1d15994ce5681e` |
| Glow Mesa | `0a92c37249663f94f5861179f1b30a69153a88b6` | `a368aba78a3f65bb93e46a9a624c617fb2d90b18` | `c8da6e7c043bb2f42b5fd2f94d17d83387d7a29abca9adffab1d15994ce5681e` → `68d976b06be1045f935047e482b765d91d61b045b45c87d77d677715b4e528e4` |
| Half-Life Hollow | `f59e22529097d7ea60d60b2102946aed80260434` | `850ae868ef5688c79f20f98f1bbda515065efa4b` | `68d976b06be1045f935047e482b765d91d61b045b45c87d77d677715b4e528e4` → `d2f15b7a6ec3c5e04fa54c71dfcc16dda4288e20d6890f0eedca77b9035b878f` |
| Picnic | `199b99705505ccecb829cfdfdf2783b29f4222eb` | `13038c4f2324f0fec063663db72ccde43238301a` | `d2f15b7a6ec3c5e04fa54c71dfcc16dda4288e20d6890f0eedca77b9035b878f` → `338b9a112823ee64444dc9d7cc4525dea0e2bc84474174c6af583ea8ce9545ad` |
| Dead Band | `f5026b15fc6c28e988157a8b6e6214a9a71fb01a` | `d852b15ac75bb588ab3c45912f0d704abe90261a` | `338b9a112823ee64444dc9d7cc4525dea0e2bc84474174c6af583ea8ce9545ad` → `c4de03c756e538abb6c3787d9a1e4b80cc03b62cc3de095eaa2fedb8df814ab4` |
| Relay Rush | `cd99e25b041526fdb44d472a1516218cea2100ad` | `0535aa5ffca2f422b0d15b378044d00b9e47771a` | `c4de03c756e538abb6c3787d9a1e4b80cc03b62cc3de095eaa2fedb8df814ab4` → `36abad02458965365c31dfe66a98155d66182324ab136feb6709bfa791ff0abc` |
| Far Side | `5d96ac7f22d3103a41436b543a04dbc186b4b274` | `d134d7607cda6b995a9421c5727fbd11f9a69230` | `36abad02458965365c31dfe66a98155d66182324ab136feb6709bfa791ff0abc` → `37a425e8df7634b36005ac5712ccee589eba59ab7aac41f7033a2949d203c146` |
| Low Orbit | `3869bbcd56da09d88cca132d84ee8ed5b9694c95` | `2a1c3e11ec470fb3761cb9e462d39b025b61f24f` | `37a425e8df7634b36005ac5712ccee589eba59ab7aac41f7033a2949d203c146` → `d7cad8f8bd1ebb800b36fff3531b8726760b5430fcb516cd39d32a71bb420bcf` |
| Dome Basin | `2ead3e33c89909f799d713b622fe7c0186fee1d4` | `4613a6ff288eb6e984dbdd44e7e861ee1627da73` | `d7cad8f8bd1ebb800b36fff3531b8726760b5430fcb516cd39d32a71bb420bcf` → `8e71546045562c64ef70c60d2616e0a2cc1cee965709dc89d691ca13d57164dc` |
| Seed Run | `64c3661c60bd3d5b212efe36630f17507843ab79` | `3c023c883f3d30179fbaef26a22629e31efe7df5` | `8e71546045562c64ef70c60d2616e0a2cc1cee965709dc89d691ca13d57164dc` → `ba67e6db9a2d8b34e23fcb1bacdc4e00a8ce72e84c347d9d6bbf3f9975a5a66f` |
| Devil’s Alley | `9d388a981ee8846298cf0ab234becf2e70a42bf8` | `57a399b81a9d2911364c0770e10a6a5c6eb414c6` | `ba67e6db9a2d8b34e23fcb1bacdc4e00a8ce72e84c347d9d6bbf3f9975a5a66f` → `6b6c1185f0c23a0a2235502e69238db177900147ab630e66db1120c9cb30ada2` |
| Old Canal | `0bafed36e53f02ea475903d6452581f9f4364138` | `ce3a6a5ad3b8d9f44c4adece0d6c8b424735b5e4` | `6b6c1185f0c23a0a2235502e69238db177900147ab630e66db1120c9cb30ada2` → `c2018fcb58b57688525b2afe23a8fd99dd20e3ce481894e58f9017db628333c7` |
| Last Claim | `19bdb6bce961c116df5d4a38b6a5e60259ed82c4` | `97d29c730796c9b5ddfae1f44073c44e1eced3e0` | `c2018fcb58b57688525b2afe23a8fd99dd20e3ce481894e58f9017db628333c7` → `2a898e9e9e87ddd72c9dea598df97363c9e179592ef33e69a54871da21c1efd3` |
| Ember Shore | `8ad1bb69df1becf12c3ab202e857ec1ff519fc93` | `caf34490756564bd8dfb1693070e479147590c58` | `2a898e9e9e87ddd72c9dea598df97363c9e179592ef33e69a54871da21c1efd3` → `0df7afdfb61520a896c158f0208e401731a733f465ab77a8fc4232bc495c65ba` |
| Archive World | `82782f50617ff7482fa5acedeee048ba6371a31c` | `8ea5370ba1dfd4bc85276380875fdb87f17f7bf7` | `0df7afdfb61520a896c158f0208e401731a733f465ab77a8fc4232bc495c65ba` → `9ab63072bf545c545e192f2a6d4623ccceb60235662638adb6f3c27736648cf5` |
| River | `the commit containing this closeout` | `8ea5370ba1dfd4bc85276380875fdb87f17f7bf7` | `9ab63072bf545c545e192f2a6d4623ccceb60235662638adb6f3c27736648cf5` → `4374cdbfcb7631c86982f9439fb30583eb3eba1acbf70e1bcccaf8fb6e210b21` |

## Verification and limits

All sixteen boundaries contain passing TypeScript/default/full builds, the five scoped render guards and three named guards, four error-free ordinary captures, and four performance runs per arm/viewport. Applicable asset/station changes include budgets, brightness/collision checks, loading/repeat, mirror invariants and source proof. Raw captures and rejected trials remain under `_raw/` and are not staged. No raw plate, gameplay/camera/HUD source, engine pin, existing e2e assertion or task/spec was changed.

Known failures are attributed against each exact map base in the per-map reviews. These include Motor malformed-tape replay, Mare/arsenal or roster expectations, E10 secured-claim/census drift, and The Claim’s stale 32,768-triangle registry assertion. The Last Claim broad census still expects painted despite the new pack. River’s broad census is an unavailable-contract exemption, so its dedicated raw boot and actual finale lever provide the real route evidence. The full node battery and engine pin remain drain-owned.

Last Claim’s paired timings cross host modes; its review retains two batches and the conservative eight-run envelope rather than claiming a causal speedup. River’s matched fast/slow modes are interpreted in its performance review. Archive’s initial full distance-trial receipt was overwritten before backup; complete derived metrics and PNGs remain, the partial receipt is retained in raw, and final station receipts are complete.

Ember and Archive’s new visual status was briefly written into the objective column. This closeout restores their exact prior objective text and places the correction in the visual column; it does not re-award or revoke objective completion.

Remaining task list: **none**. The named full-fidelity and UI/camera/contract holds remain in the linked rows for orchestration.
