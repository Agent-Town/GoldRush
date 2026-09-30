# Week 41 rotation prepared on schedule

**Verdict: READY-FOR-GATES for the RT-01 standing duty; deployment deferred.** Fire s2810, 2026-09-30. Base main `a26cdfe38`. This is the prescribed weekly data mint, not a lane drain.

The registry now carries `r2026w41`, opening October 5 at 00:00 UTC and closing October 12 at 00:00 UTC. Six seeds were derived with the existing owner-held salt. After deployment, the existing live-week selector can use these seeds when the window opens. All four historical rotations remain unchanged; the guarded block in `public/skill.md` contains the whole five-rotation registry.

| Check | Measured result |
| --- | --- |
| Salt continuity control | Re-deriving week 40 matches all six seeds, id and window; salt contents never printed or copied |
| Append invariants | Four prior rotations unchanged; exactly one new rotation, six seeds, October 5–12 UTC |
| Skill, landing rotation, live seed and bench-seed guards | 36 passed, zero failures or skips |
| TypeScript / normal build / E1 build | Exit 0 / 0 / 0 |
| E1 first-town payload | 34,355,296 B, below 52,000,000 B by 17,644,704 B |
| Source scope | Registry and its documentation fence, 13 added lines each; no engine-source input changed |

Evidence is in `artifacts/s2810/rotation-mint.txt`, `rotation-guards.txt`, `build-receipts.jsonl` and `first-town-payload.json`. The initial `e1-size.json` counts the entire 97,736,147 B distribution and is not the deployment budget quantity. The authoritative payload calculation is `scripts/first-town-payload.mjs`, which `scripts/deploy.sh` uses.

No browser or lane-drain gate is claimed. No engine pin or era change is needed: neither changed path is in `ENGINE_SOURCE_INPUTS` in `scripts/assay-replay-agent.mjs`.

**Remaining:** deploy the registry with the next authorized runtime landing, before October 5 00:00 UTC, and verify ASSAYER SYNCED. The current owner release verdict on build `954bb2cd` remains pending; this fire does not publish or deploy.
