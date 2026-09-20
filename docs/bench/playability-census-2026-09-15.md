# Playability census — 2026-09-15 (owner: "how do we go from epoch1 to all epochs?")

**Method:** `npm run test:playability` (`e2e/playability-smoke.spec.ts`: every board contract booted the way a human boots it — no `?debug`, no test seam — and asked six questions: boots, briefing, HUD, moves, reaches wave 2, no console/page errors) on a detached worktree at main `b957a966a` (the tree the all-epochs preview alias serves), both projects, one worker, 27.9 min wall, fires dry. Transcript: `artifacts/playability-census-2026-09-15/census-desktop-and-mobile.log`.

**Result: 76 of 84 runs pass; 4 contracts fail on both projects, all at the same question ("reaches wave 2").** The other 38 contracts boot plainly, brief, show their HUD, move and reach wave 2 on desktop and at 390 px.

| contract | epoch | desktop | mobile | what the run reported |
|---|---|---|---|---|
| e1-drill-yard | 1 | ✗ | ✗ | reached wave 0 after 374 s sim (runState `playing`, HUD wave "0"): the Drill Yard has no waves to reach — a by-design exemption the smoke does not declare (F-PLAY-E1-1) |
| e2-trestle | 2 | ✗ | ✗ | dead at wave 1 after 59 s sim (`runState=dead`) — an unassisted plain-boot hero dies before wave 2 (F-PLAY-E2-1) |
| e2-incline | 2 | ✗ | ✗ | dead at wave 1 after 71 s sim (F-PLAY-E2-2) |
| e6-picnic | 6 | ✗ | ✗ | dead at wave 1 after 38 s sim (F-PLAY-E6-1) |
| the other 38 | 1–10 | ✓ | ✓ | |

**Reading it.** The smoke plays each map the way a first-time human might for its first two waves (boot, read, move). Three maps kill that player before wave 2 — the two E2 pressure maps that were given the pressure line on 2026-08-21 and are still exempt from the agent door, and the E6 Picnic. That is the playability gap Astra's campaign was closing map by map; these three are the first three rows of the all-epochs ladder. The Drill Yard row is a census defect, not a map defect.

**What the fires do with it (standing duty, BACKLOG):** re-run at most once a day on a dry board, file new rows as F-PLAY-<epoch>-<n>, never fix in the same fire. Per-epoch passes are Opus implementers on the Anthropic subscription (owner 2026-09-15).
