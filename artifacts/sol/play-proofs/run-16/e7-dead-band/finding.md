# The Dead Band — HELD on survival, refusal proved on both screens

All four rides use the player-facing Tape Reel Record control once and receive `Recording refused: signal-suppressed.` The immediate latch and the independent terminal capture both show `objective=refusal, objectiveMet=true, uses=0`. This is intended county refusal, not a failed recording implementation.

The distinction is explicit: `uses` counts successful replays and remains zero. `Game.playbookObjectiveAllowsSecure` passes `SignalSuppression.diagnostics.refusals.playbooks` as `suppressedUses`; the refusal latch is true only when that count exceeds zero. The observed single Record attempt and refusal prove at least one counted suppression. The raw private suppression count is not published in the plain diagnostics, so it is not fabricated here. A completed recording/build/replay on this county is deliberately impossible.

| Strategy | Project | Death wave | Sim seconds | HP | Gold | Repairs | Standing |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| default | desktop-chrome | 19 | 577.333 | 0 | 0 | 0 | 8/8 |
| default | mobile-chrome | 12 | 371.333 | 0 | 5 | 0 | 7/7 |
| restore-ground | desktop-chrome | 17 | 526.667 | 0 | 40 | 0 | 7/7 |
| restore-ground | mobile-chrome | 14 | 431.867 | 0 | 40 | 0 | 7/7 |

Every ride has zero console/page errors. Both paired commands exit 1 at the existing secure assertion. No secure/bank/Book/reload is claimed. The two defaults qualify for exactly one restore-ground ride each because the refusal objective is already met before hero death. No third ride.

**No F-PPH2 map defect.** The source-defined refusal works. Follow-up owner: owner/F-PP-CAMPAIGN for the survival ceiling, QA/native route for a future authorized strategy proof. No balance or production change.

`default/` and `restore-ground/` retain commands, direct exits, compact rows and frozen objective captures. Final restore terminal JPEGs are in-tree; default terminal JPEGs moved to `~/.goldrush/play-proofs/run-16/default/e7-dead-band/`. Raw logs/samples remain external via each row's `rawEvidence`. Public plain Book launch, no debug/seed, desktop then 390×844 phone, one worker.
