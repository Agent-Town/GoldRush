# Existing gate failures and navigation retry

The broad candidate suite reports **30 passed, 6 skipped, 10 failed** (exit 1). Exact-base controls report **3 passed, 9 failed** (exit 1). The four selected Town navigation retries on the candidate then pass **4/4**, including both originally timed-out mobile cases. The eight map-specific assertion failures remain base-attributed, not fixed or waived by this art task.

Every changed tracked production file was temporarily replaced with `git show 43a73b54a:<path>` bytes. The engine matched the preceding Night Shift commit: `3a437c987c30b1738307197d4e0ebbe64520e8ddbfbbff947378930f8590a041`. All candidate bytes were restored exactly, yielding `011419f4873aebb9a8d9d6580844dbf02d116813898fdcc98579cfbf39a88ebe`. [File hashes, command and restoration receipt](base-initial.json).

| Assertion / owner | Candidate | Exact base |
| --- | --- | --- |
| `beauty-twin-banks.spec.ts:314`, both projects. Crossing fixture/spec owner via Claude. | Centre probe expects `river`, gets `bank`. | Same assertion and values. The current approved braid has a dry central plait. |
| `e1-twin-banks.spec.ts:96`, both projects. Crossing fixture/spec owner via Claude. | Centre probe expects `river`, gets `bank`. | Same assertion and values. |
| `e1-twin-banks.spec.ts:48`, called at 110, both projects. Placement fixture/gameplay owner via Claude. | `ghostValid` expects true, stays false for 5,000 ms. | Same assertion and timeout. No placement rule changed. |
| `e1-twin-banks.spec.ts:228`, called at 127, both projects. Ford-routing owner via Claude. | West-ford route predicate stays false for 15,000 ms. | Same assertion and timeout. No routing or collision data changed. |
| `landmark-collision.spec.ts:116`, called at 148, mobile. Town navigation/runtime owner via Claude. | `page.goto('/')` load wait times out at 30,000 ms. | Same navigation timeout. Candidate retry passes. |
| `landmark-collision.spec.ts:116`, called at 160, mobile. Town navigation/runtime owner via Claude. | `page.goto('/')` load wait times out at 30,000 ms. | Passes on base and on candidate retry; intermittent load timeout, not a reproducible art defect. |

The candidate's never-wedged regression, seeded diagnostics, north-marker semantics, owner crossing-rebuild regression, landmark brightness and fort solidity cases pass. Existing deliberate skips remain as emitted. No protected test assertion was edited. [Suite command/exit](e2e-own-and-pack-gates.json) · [Town retry](e2e-town-navigation-retry-gates.json) · [Spec discovery and selection](spec-discovery.json).

Raw output is retained under `_raw/run-3/e1-twin-banks-own-and-pack.log`, `_raw/run-3/e1-twin-banks-base-initial/tests.log` and `_raw/run-3/e1-twin-banks-town-navigation-retry.log`. This receipt does not claim an all-green existing-spec gate. The previously named E5 and shared-atlas-census reds were not run or patched here.
