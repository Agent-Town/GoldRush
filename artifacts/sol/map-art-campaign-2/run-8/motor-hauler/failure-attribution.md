# Shared Motor hauler — failure attribution

The first own batch was **33 pass / 7 fail**. The complete additional set of spec files mentioning the four Motor contracts was **48 pass / 18 fail / 14 skip**. The existing brightness spec is covered by the separate shared batch. All requested files run on both projects, one worker; opt-in slow playability cases remain skipped. No assertions changed.

The wider sweep found a real new regression: `terrain3d-registry.spec.ts:335` saw one vehicle GLB request in 2D mode, where zero is required. The final body owner preserves the original body in 2D/LITE. The final selected replay is **4 pass / 22 fail**: both 16-contract 2D/3D parity cases and both Motor story cases pass. The initial mobile story failure at `ss-05-e4-beats.spec.ts:96` (active beat null) cleared on both the exact base and final candidate.

The exact base is code **7c5d213487e8b4f0386eadbad6ee7c32fcff42f5**, store **a54dcc4ab31cb59e673f831b0b99161b38b62799**, engine **db5803bef10a13daa735eab2d860a2d8608dba2104d0a00571d85fb98570aad7**. Added vehicle files leave the engine inventory during replay; the shared ledger and Vehicle source restore to exact base bytes. The final candidate engine restores exactly to **b7113b37c1a7e10b10f504947a660147c581c22b667aa1df2feb695bbb96100c**.

| Existing assertion | Failure fingerprint | Owner |
| --- | --- | --- |
| Dust Flats :46 | `dustFlats` diagnostic undefined | Motor compatibility/diagnostics |
| Dust Flats :110 | road segments expected 1, received 0 | Motor compatibility/controls |
| Motor reels :80 | assay replay `malformed tape` | replay fixtures |
| E5 arsenal :60 | disarmed expected false, received true | arsenal diagnostic/toggle timing |
| Rider parity :86 / :116 | deck-build / reanchor control expected visible, hidden | Deepwater UI/contract |
| Registry :217 | triangles expected 32,768, received 51,200 | terrain registry expectations |
| Registry :281 | expected `painted-underlay-alpha-rim`, received `opaque-sculpt-edge` | terrain registry expectations |
| Registry :362 | expected `failed`, received `lite` | LITE registry expectations |
| True reel :23 / :46 | assay replay `malformed tape` | replay fixtures |

The first exact-base selected run reproduced **21 failures / 5 passes**. The mobile arsenal case passed there; a narrow base repeat failed at the opposite toggle assertion (:58, expected true, received false). A further exact-base run with `--repeat-each=3` records **5 failures / 1 pass**, including the candidate's exact mobile :60 fingerprint. All **22 final failures now match the exact base** by project, test, assertion location and expected/received values. Both toggle assertion variants and the passes remain in the receipts; no intermittent attempt is hidden.

[Base selected replay](base-final.json) · [Narrow arsenal base replay](base-arsenal.json) · [Three repeats per project](base-arsenal-repeat.json) · [Machine-readable final fingerprint comparison](failure-fingerprints.json). All failed attempts remain in raw evidence. The package makes no all-green browser or production-release claim.
