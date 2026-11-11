# Week 47 rotation prepared before its opening

**Verdict: READY-FOR-GATES for RT-01; deployment remains overdue.** Fire s3519, November 11. This is the prescribed standing-duty data update on main, with no lane drain.

The coming week-47 rotation now carries six seeds for November 16–23 UTC. The existing ranked-contract selector can select this week when it opens after deployment. All ten historical rotations are unchanged, and the public skill guide includes the entire eleven-rotation registry. No new interface, naming or canon is introduced.

| Check | Result |
| --- | --- |
| Salt continuity | Week 46 exactly reproduced, all six seeds and its window; salt never printed or copied |
| Append invariants | Ten historical rotations unchanged; one new rotation, six seeds, November 16–23 UTC |
| Skill, landing rotation, live seed and bench-seed guards | 36 passed; zero failures |
| TypeScript / normal build / E1 build | Exit 0 / 0 / 0 |
| E1 first-town payload | 34355296 B, below 52,000,000 B |
| Public sample at 00:13 UTC | Build 299b1db5 still serves weeks 37–44; both week-46 standings GETs return 400 bad_rotation, week-44 controls return 200 |

Evidence: artifacts/s3519/rotation-control.json, rotation-invariants.json, rotation-guards.txt, rotation-guard-result.json, build-receipts.jsonl, first-town-payload.json and live-probe.json.

Merge classification: direct standing-duty update from 47bd81a68717a626d229724f5defa9af9ed8c2b7; registry and documentation fence only, 13 added lines each, no conflicts. No simulation or rendering rule, engine pin or era changes. Browser drain gates do not apply to this data-only standing duty; no browser acceptance is claimed. Assertions and timeouts were unchanged.

**Remaining:** the authorized attended deployment must carry the complete registry, followed by ASSAYER SYNCED and served-registry/standings verification. The FIRE publication gate and inherited attended custody leave deployment to that session. No deployment was attempted. RT-01 week 48 becomes due Wednesday November 18 at 00:00 UTC.
