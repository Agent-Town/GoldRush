# Exact-base attribution for five existing failures

Candidate batch: **39 pass / five failures**. Exact code base `199b99705505ccecb829cfdfdf2783b29f4222eb` and store base `13038c4f2324f0fec063663db72ccde43238301a`: **one pass / the same five failures** in the selected six-test reproduction.

| Check | Candidate and exact base fingerprint | Owner |
| --- | --- | --- |
| Plain Signal-era boot, both projects | `e7-roster.spec.ts:175`: `e7Arsenal.enabled`, expected true, received false | Epoch/profile fixture owner via Claude |
| S3 silence exit, both projects | `e7-signal-systems.spec.ts:138`: `activateEpoch('epoch-8-orbital')`, expected true, received false | Epoch progression/fixture owner via Claude |
| Mobile plain patrol delegation | `e7-playbook-rows.spec.ts:249`: 180 s timeout clicking `playbook-record` / Save Tape; the resolved button is not visible | Tape HUD/mobile interaction owner via Claude |

Desktop patrol delegation passes both times. This is attribution, not a root-cause claim. No test, gameplay, profile or HUD code was changed. The exact base engine is `338b9a112823ee64444dc9d7cc4525dea0e2bc84474174c6af583ea8ce9545ad`. The candidate restored byte-for-byte to `c4de03c756e538abb6c3787d9a1e4b80cc03b62cc3de095eaa2fedb8df814ab4` after the base run. [Commands, source hashes and restore proof](base-signal-gates.json).
