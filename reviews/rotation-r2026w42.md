# Week 42 rotation prepared on schedule

**Verdict: READY-FOR-GATES for the RT-01 standing duty; deployment deferred.** Fire s2951, 2026-10-07. Base main fbf6c5c5b; lock commit 44fb6a0b3. This is the prescribed weekly data mint, not a lane drain.

The registry now carries r2026w42, opening October 12 at 00:00 UTC and closing October 19 at 00:00 UTC. After authorized deployment, the existing live-week selector will use its six seeds when the window opens. All five historical rotations remain unchanged; public/skill.md contains the whole six-rotation registry. Current selection stays on week 41 for all six contracts.

| Check | Measured result |
| --- | --- |
| Salt continuity control | Re-derived week 41 matches all six seeds, id and window; salt contents never printed or copied |
| Append invariants | Five previous rotations unchanged; exactly one new rotation, six seeds, October 12–19 UTC |
| Skill, landing rotation, live seed and bench-seed guards | 36 passed, zero failures or skips |
| TypeScript / normal build / E1 build | Exit 0 / 0 / 0 |
| E1 first-town payload | 34,355,296 B; 17,644,704 B below the 52,000,000 B limit |
| Source scope | Registry and documentation fence, 13 added lines each; no engine-source input changed |
| Live release check | Build 954bb2cd; served registry ends at week 40; week-41 GET 400 bad_rotation, week-40 control 200 |

Evidence: artifacts/s2951/rotation-invariants.json, rotation-guards.txt, build-receipts.jsonl, first-town-payload.json and rotation-probe.json. No conflicts, branch integration, browser gate, engine pin or era change applies. Neither changed path is in ENGINE_SOURCE_INPUTS in scripts/assay-replay-agent.mjs.

**Remaining:** the owner release hold in docs/HANDOVER-2026-09-06-attended.md sections 13z-106/107 remains binding, and docs/release/verdict-954bb2cd.md is unsigned. The next authorized attended deployment must carry weeks 41 and 42 and verify ASSAYER SYNCED. Week 41 is already overdue; week 42 opens October 12 00:00 UTC. No new finding or deploy is claimed by this mint.
