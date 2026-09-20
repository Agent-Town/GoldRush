# Baron browser gates and attribution

The existing 96-test candidate run ended with **83 passed, 5 skipped, 8 failed**. No protected assertion was changed. [Gate receipt](e2e-own-and-pack-gates.json) · [Failure text](browser-fingerprints.json).

Five candidate failures reproduce on exact base `37921b5c9`, engine `011419f4873aebb9a8d9d6580844dbf02d116813898fdcc98579cfbf39a88ebe`:

- `057-baron-rocket-cart.spec.ts:257`, both projects: `blast-charge-arm` started count 0, expected >0.
- `e1-baron.spec.ts:302`, both projects: `baronAnimationLoaded=false`, expected true, after the 10-second poll.
- `f-bw-16-baron-siege.spec.ts:135`, desktop: deep-equal snapshot includes differing `bossBarY`, `railRotation` and floating-point `distanceFromBaron`. The base also fails the mobile counterpart. The varying presentation values are not deterministic simulation evidence.

The exact-base selection ran 12 tests: 6 passed, 6 failed (the five matching failures plus mobile deterministic-snapshot failure). Every candidate production byte was saved before the base replay and restored exactly. [Receipt](base-initial.json).

Three other original failures did **not** reproduce in that base selection: desktop melee test timeout; desktop capture test timeout at its initial frame wait; phone live-kiting gap 6.1006255 <= 6.3486810 at `054-baron-epic.spec.ts:312`. The first candidate retry passed both desktop timeouts but failed the phone gap again (4.8408742 <= 6.3486810), and separately hit a phone capture timeout in the end-of-test board-navigation hold. [First retry](e2e-transient-retry-gates.json).

A second exact-base replay ran the kiting and capture tests twice per project: 8/8 passed. [Repeat receipt](base-repeat-live.json). These intermittent candidate failures are not represented as exact-base reproduced defects. The kiting fixture keeps `timescale=8` active while issuing separate teleport and `advanceSim(0.5)` calls (`054-baron-epic.spec.ts:293-307`); it never enables manual simulation for that test. `Game.ts:8660` advances requested ticks but does not disable intervening live ticks. This is a concrete timing sensitivity, not proof that the original failed run was harmless. The protected fixture belongs to the test/simulation owner via Claude.

The final isolated candidate retry ran kiting and capture twice per project and passed **8/8**. The earlier selected retry also passed melee in both projects. These are passing retries, not an all-green original suite; the failed attempts remain retained. [Final retry receipt](e2e-live-isolation-gates.json). Required loading/repeat probes are recorded separately. Full changed-since guard coverage is not claimed: that path unconditionally selects the full node battery reserved for the drain; the named guard subset is recorded separately.
