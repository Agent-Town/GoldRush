# Week 43 rotation prepared on schedule

**Verdict: READY-FOR-GATES for the RT-01 standing duty; deployment pending.** Fire s3094, 2026-10-14. Base main `552fc8fb88539d7a0f53008f204d66f3a5eeaa66`. Lock `d887b98e5`; inherited bookkeeping `f8ceb8ebf`. This is the prescribed weekly data mint, not a lane drain.

The registry carries `r2026w43`, opening October 19 at 00:00 UTC and closing October 26 at 00:00 UTC. After an authorized deployment, the existing selector will use its six seeds when the window opens. All six previous rotations remain unchanged, and `public/skill.md` contains the whole seven-rotation registry.

| Check | Measured result |
| --- | --- |
| Salt continuity control | Week 42 re-derived exactly: six seeds, id and window match; salt never printed or copied |
| Append invariants | Six historical rotations unchanged; exactly one new rotation with six seeds and the October 19–26 UTC window |
| Skill, landing rotation, live seed and bench-seed guards | 36 passed, zero failures or skips |
| TypeScript / normal build / E1 build | Exit 0 / 0 / 0 |
| E1 first-town payload | 34,355,296 B; 17,644,704 B below the 52,000,000 B limit |
| Source scope | Registry and documentation fence, 13 added lines each; neither is in ENGINE_SOURCE_INPUTS |
| Live check at 00:21 UTC | Build 62403b1d, served weeks 37–42; canonical and direct Pages stats return 200 JSON |

Evidence: `artifacts/s3094/rotation-invariants.json`, `rotation-guards.txt`, `build-receipts.jsonl`, `first-town-payload.json`, and `live-probe.json`. Merge classification: direct standing-duty data update on main; no lane integration, conflicts, render change, engine pin or era bump. Browser gates are not applicable to this registry-only increment; no browser acceptance is claimed. The existing build reports asset-diet warnings but both builds exit zero; no source cure was needed.

**Remaining:** carry week 43 with the next authorized attended runtime landing before October 19 00:00 UTC, then verify ASSAYER SYNCED and the served registry. The October 9 deployment already carried weeks 41 and 42; their older deployment debt is not repeated. Release acceptance and production publishing remain attended/owner work under the current handover. No deployment was attempted and no live mutation is claimed.
