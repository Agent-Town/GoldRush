# Week 48 rotation prepared before its opening

**Verdict: READY-FOR-GATES for RT-01; deployment remains overdue.** Fire s3540, November 18. This is the prescribed standing-duty data update on main, with no lane drain.

Six seeds cover November 23–30 UTC. All eleven historical rotations remain unchanged, and the public skill guide mirrors the entire twelve-rotation registry. The existing selector will use this rotation when its week opens after deployment.

| Check | Result |
| --- | --- |
| Salt continuity | Week 47 reproduced exactly, six seeds and window; salt never printed or copied |
| Append invariants | Eleven old rotations unchanged; one new rotation with six seeds |
| Skill, landing rotation, live seed and bench-seed guards | 36 passed, zero failures |
| TypeScript / normal build / E1 build | Exit 0 / 0 / 0 |
| E1 first-town payload | 34355296 B, below 52,000,000 B |
| Live sample at 00:00 UTC | Build 299b1db5 serves weeks 37–44; week-47 standings return 400 bad_rotation on both hosts; week-44 controls return 200 |

Evidence: artifacts/s3540/rotation-control.json, rotation-invariants.json, rotation-guards.txt, rotation-guard-result.json, build-receipts.jsonl, first-town-payload.json and live-probe.json.

Merge classification: direct standing-duty update from 50f24b2c4614653b3ecd5fb74f795afe4e48891a; registry and documentation fence only, 13 added lines each, no conflicts. No simulation or rendering rule, engine pin or era changes. Browser drain gates do not apply to this data-only duty; no browser acceptance is claimed. Assertions and timeouts are unchanged.

Remaining: the attended deployment must carry the complete registry, then verify ASSAYER SYNCED and served-registry/standings parity. Deployment retains attended custody under the FIRE publication gate; none attempted here. Next RT-01 mint is week 49, due November 25 at 00:00 UTC.
