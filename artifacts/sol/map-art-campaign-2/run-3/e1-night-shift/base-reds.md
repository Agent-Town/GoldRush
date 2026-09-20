# Existing gate failures reproduced on the exact base

Candidate broad suite: **51 passed, 4 skipped, 7 failed**, exit 1. The eight selected base controls produce **1 passed, the same 7 failed**, exit 1. These are newly measured base failures, not the task's previously named E5 fixture or shared-atlas census failures.

All three changed production files were replaced temporarily with `git show fb48bbfdc:<path>` bytes. `computeEngineHash` equals the task base's `2ad0aa1e14a1b7f639bc9c797ae5e14839d11c7b34b70f3f7ac7ca9479fbf6f4`. The candidate bytes were restored exactly afterward; engine `3a437c987c30b1738307197d4e0ebbe64520e8ddbfbbff947378930f8590a041`. [Commands, file hashes and restoration receipt](base-initial.json).

| Failure and owner | Candidate | Exact base |
| --- | --- | --- |
| `e2e/e1-night-shift.spec.ts:339`, desktop + mobile. Lighting/spec owner. | Fog expected near/far 18/42, actual 34/58. | Same assertion and values. Untouched `LightRig.ts` declares the current values. |
| `e2e/e1-night-shift.spec.ts:171`, called at 480, desktop + mobile. Suspend/persistence owner. | `waitForSavedNightWave` times out after 15,000 ms. | Same wait and timeout. |
| `e2e/e1-night-shift.spec.ts:406`, mobile. Enemy sprite/capture owner. | Sprite sample 0.289642 below required 0.35. | Sprite sample 0.215535 below 0.35. Timing-dependent pixels differ; the same threshold fails without this art change. Desktop passes both arms. |
| `e2e/shore-truth.spec.ts:44`, desktop + mobile. Dry Gulch shore-diagnostic owner. | `dampGroundRadii[0]` is undefined, so numeric comparison fails. | Same missing field. This fails on Dry Gulch before the spec reaches Twin Banks; Night Shift is not involved in this assertion. |

The candidate's brightness, landmark collision, fort collision, night light doctrine, night-mode truth, lantern assets, night pressure/performance and living-water cases pass. Four deliberate skips remain as emitted by the existing tests. The two new art regressions and both beauty-board cases pass separately. No protected assertion, storage/simulation code, lighting owner, or unrelated Dry Gulch field was edited.

Raw full logs remain at `_raw/run-3/e1-night-shift-own-and-lighting.log` and `_raw/run-3/e1-night-shift-base-initial/tests.log`. A green overall existing-spec gate is **not claimed**; the drain has the exact-base attribution for its decision.
