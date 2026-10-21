# Week 44 rotation prepared on schedule

**Verdict: READY-FOR-GATES for the RT-01 standing duty; deployment pending.** Fire s3263, 2026-10-21. Base main `c665e712efb2c95d9fda91b20473845478ade9a2`. Lock `d7f1879ae`; inherited bookkeeping `0d9c74dde`; October 20 ticker `6d26abc8f`. This is the prescribed weekly data mint, not a lane drain.

The registry carries `r2026w44`, opening October 26 at 00:00 UTC and closing November 2 at 00:00 UTC. After an authorized deployment, the existing selector will use its six seeds when the window opens. All seven previous rotations remain unchanged, and `public/skill.md` contains the whole eight-rotation registry.

| Check | Measured result |
| --- | --- |
| Salt continuity control | Week 43 re-derived exactly: six seeds, id and window match; salt never printed or copied |
| Append invariants | Seven historical rotations unchanged; exactly one new rotation with six seeds and the October 26–November 2 UTC window |
| Skill, landing rotation, live seed and bench-seed guards | 36 passed, zero failures or skips |
| TypeScript / normal build / E1 build | Exit 0 / 0 / 0 |
| E1 first-town payload | 34,355,296 B; 17,644,704 B below the 52,000,000 B limit |
| Source scope | Registry and documentation fence, 13 added lines each; neither is in ENGINE_SOURCE_INPUTS |
| Live check at October 20 23:58 UTC | Build 62403b1d, served weeks 37–42; week 43 canonical/direct reads return 400 bad_rotation, week-42 control 200; stats valid JSON |

Evidence: `artifacts/s3263/rotation-control.json`, `rotation-invariants.json`, `rotation-guards.txt`, `build-receipts.jsonl`, `first-town-payload.json`, and `live-probe.json`. Merge classification: direct standing-duty data update on main; no lane integration, conflicts, render change, engine pin or era bump. Browser gates are not applicable to this registry-only increment; no browser acceptance is claimed. The existing build reports asset-diet/quantization warnings but both builds exit zero; no source cure was needed.

**Remaining:** the next authorized attended deployment must carry weeks 43 and 44, then verify ASSAYER SYNCED and served standings. Week 43 is already overdue; week 44 must reach production before October 26 00:00 UTC. The missing live week-43 registry is the existing deployment gap, not a new mint failure. Release acceptance and production publishing retain attended/owner custody under the current handover. No deployment was attempted.
