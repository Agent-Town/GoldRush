# Week 46 rotation recovered after its opening

**Verdict: READY-FOR-GATES for RT-01; deployment remains overdue.** Fire s3511, November 10. This is the prescribed standing-duty data update on main, with no lane drain.

The missed week-46 rotation now carries six seeds for November 9–16 UTC. The existing ranked-contract selector can select this open week after deployment. All nine historical rotations are unchanged, and the public skill guide includes the entire ten-rotation registry. No new interface, naming or canon is introduced.

| Check | Result |
| --- | --- |
| Salt continuity | Week 45 exactly reproduced, all six seeds and its window; salt never printed or copied |
| Append invariants | Nine historical rotations unchanged; one new rotation, six seeds, November 9–16 UTC |
| Skill, landing rotation, live seed and bench-seed guards | 36 passed; zero failures |
| TypeScript / normal build / E1 build | Exit 0 / 0 / 0 |
| E1 first-town payload | 34355296 B, below 52,000,000 B |
| Public sample at 03:08 UTC | Build 299b1db5 still serves weeks 37–44; both week-46 standings GETs return 400 bad_rotation, week-44 controls return 200 |

Evidence: artifacts/s3511/rotation-control.json, rotation-invariants.json, rotation-guards-canonical.txt, rotation-guard-result.json, build-receipts.jsonl, first-town-payload.json and live-probe.json.

Merge classification: direct standing-duty update from 4aeca4edda0a03bac78d0383ff1819fa2d1588e1; registry and documentation fence only, 13 added lines each, no conflicts. No simulation or rendering rule, engine pin or era changes. Browser drain gates do not apply to this data-only standing duty; no browser acceptance is claimed. The initial command named an absent mint test and reported 19 skill tests passing; the canonical 36-test RT-01 set above is the accepted guard set. Assertions and timeouts were unchanged.

**Remaining:** the authorized attended deployment must carry the complete registry, followed by ASSAYER SYNCED and served-registry/standings verification. The FIRE publication gate and inherited attended custody leave deployment to that session. No deployment was attempted. RT-01 week 47 becomes due Wednesday November 11 at 00:00 UTC.
