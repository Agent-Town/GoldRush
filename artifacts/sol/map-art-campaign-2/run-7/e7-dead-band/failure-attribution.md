# Dead Band — exact-base browser attribution

Full serial batch: **97 passed, 14 failed, 1 skipped** in 21.3 minutes. Both collision suites, Dead Band suppression, browser/Node playbook parity, census and story checks pass on desktop and phone. No test assertion changed.

Six failures are the same three terrain-registry assertions, each on both projects, reproduced on the exact starting revision in [Picnic’s attribution](../e6-picnic/failure-attribution.md): triangle count 32768 versus 51200, painted-underlay-alpha-rim versus opaque-sculpt-edge, and invalid GLB failed versus lite.

The remaining eight failures reproduce exactly on code `823b06b1dce4b861be2fccf646245fc4cc864588` and store `8ea5370ba1dfd4bc85276380875fdb87f17f7bf7`: selected replay **2 passed / 8 failed**, 4.4 minutes.

| Assertion | Candidate and exact-base fingerprint | Owner |
| --- | --- | --- |
| `ceremony-framework.spec.ts:504`, both projects | Reload expects epoch-7-signal, receives epoch-6-atomic | Ceremony/profile persistence fixture |
| `e7-relay-rush-front.spec.ts:188`, desktop | Refusal counter expected greater than 0, receives 0; phone passes in both runs | Playbook diagnostic/fixture |
| `e7-roster.spec.ts:175`, both projects | e7Arsenal.enabled expected true, receives false | Epoch/profile fixture |
| `e7-signal-systems.spec.ts:138`, both projects | Orbital activation expected true, receives false | Epoch progression/fixture |
| `e7-playbook-rows.spec.ts:249`, phone | 180 s timeout: Save Tape / playbook-record resolves to a hidden button; desktop passes both runs | Tape HUD/mobile interaction fixture |

[Exact-base command, file hashes and restore proof](base-signal-gates.json). Base engine is the original `4374cdbfcb7631c86982f9439fb30583eb3eba1acbf70e1bcccaf8fb6e210b21`; the candidate restored byte-for-byte. These reproduced failures prevent an all-green browser claim and remain outside the edit firewall.

The separate **new** gate-caller failure is not attributed to the base: see [its pending roster fix](../gate-caller-attribution.md).
