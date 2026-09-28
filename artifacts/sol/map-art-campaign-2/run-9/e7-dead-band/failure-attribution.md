# Browser failures — exact-base attribution and candidate retry

The complete prescribed batch (nine map-matching files plus three shared landmark files, both projects, one worker) finished **103 passed / 5 skipped / 12 failed**. The exact-base selected replay finished **3 passed / 11 failed**. **Eleven failures reproduce; nine have identical fingerprints.** No assertion or runtime code changed.

| Cases | Candidate and exact-base result | Owner / disposition |
| --- | --- | --- |
| T6 Calculating House, both projects | `ceremony-framework.spec.ts:504:5` expects Signal; receives Atomic. Same assertion in both arms. | Ceremony/progression fixture owner via Claude; HELD. |
| Plain Signal-era boot, both projects | `e7-roster.spec.ts:175`, expected enabled true, received false. | Epoch/profile fixture owner; HELD. |
| S3 exit activation, both projects | `e7-signal-systems.spec.ts:138`, expected E8 activation true, received false. | Progression/fixture owner; HELD. |
| Mobile human tape parity | `e7-playbook-rows.spec.ts:249`, 180 s timeout: Save Tape is not visible. | Tape HUD/mobile interaction owner; HELD. |
| Terrain water probes, both projects | `terrain3d-registry.spec.ts:235`, expected river, received bank. | Terrain/registry fixture owner; HELD. |
| Claim horizon, both projects | Same `terrain3d-registry.spec.ts:303` assertion requires >8. Desktop **2.333546 candidate / 2.333507 base**; phone **1.742289 / 1.741676**. Numerical samples vary; the failing assertion and untouched non-E7 surface agree. | Existing Claim art/registry ownership; HELD, outside this E7 pass. |
| T10 Charter Press, mobile only | Initial candidate expects zero `open-charter-press-site` elements, receives one. It **passes on exact base**, then **passes on the restored candidate on both projects (2/2)**. | Transient initial failure; not labelled a reproduced baseline failure or an art fix. |

The automation deliberately stopped when T10 did not reproduce, before loading or timing. The isolated candidate retry resolved that exception, then those checks continued separately. Its failed automation log is retained, not disguised as a green first run. No persistent unattributed failure remains in the measured set.

Exact base: code `94d2f12723900b14973345563403ec4a0191001a`, store `9e33801ab1a2f2349fce6929f576a81a6611a7e2`, engine `e7c87a88d08517d84983d408a876cfa994068807fa51b3c54ee96bbe24710e32`. Before replay, all changed store bytes were restored and the added source-input JSON parked out of the recursive engine inventory. After replay, candidate bytes and engine **6655ba7569775a529216d58cf8f288556ca9fc19cfd7bbeae41dbeb9a99adf33** were restored exactly. The earlier pre-art control is diagnostic only; its inventory caveat is retained in [initial-baseline-caveat.md](initial-baseline-caveat.md).

[Full fingerprints](browser-failure-attribution.json) · [Restoration proof](base-failures.json) · [Closing resolution](browser-resolution.json) · [Candidate retry](e2e-charter-press-recheck-gates.json). These are failure attributions, not root-cause diagnoses.
