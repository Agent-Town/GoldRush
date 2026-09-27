# Echo Canyon — HELD, both projects

| Project | Death wave | Sim seconds | HP | Gold | Repairs | Standing |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| desktop-chrome | 16 | 487.200 | 0 | 50 | 0 | 7/7 |
| mobile-chrome | 19 | 581.333 | 0 | 0 | 0 | 8/8 |

Both frozen terminals show `broadcastMirror.declared=true` but `recordedUses=0`, `squadsFielded=0`, `bodiesFielded=0`; own `playbookUse.objective=mirror`, `objectiveMet=false`. The default driver has no Tape Reel recording/replay demonstration, so this does not test the mirror consumer's response to actual use. No fielded mirror plus hero death is not proof of an impossible map or a consumer defect.

No restore-ground retry: the objective was never exercised; restoration alone cannot discharge the missing mirror latch. No F-PP9 defect ID. Follow-up owner QA/native objective driver — record and run a real movement/build demonstration, observe the next-wave mirror, stop replay when appropriate, then prove survival/bank/Book/reload. Existing historical status proofs are not substituted for this run. No balance or engine change justified here.

Both runs have zero console/page errors. Paired command exits 1 at unchanged secure assertion; no secure/bank/Book/reload. Desktop terminal directly inspected: wave 16, 50 gold, seven works/no losses/no repairs, Tape Reel visible.

Reproduce: `python3 artifacts/sol/play-proofs/run-13/run-map.py e7-echo-canyon`. One default ride/project, desktop then 390×844 phone, one worker, real Book launch, public plain seed, timescale 4. `default/` contains exact argv/env and direct exit, trimmed failure log, compact rows, objective captures and terminal JPEGs. Full samples/logs are external at each row's rawEvidence path. Shared driver unchanged.
