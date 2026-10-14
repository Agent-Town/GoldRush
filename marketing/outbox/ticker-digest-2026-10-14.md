# Ticker digest — 2026-10-14

TK-01, compiled by s3113 on October 15 after 06:00 local (UTC+07). Draft for owner approval; publication remains owner-only.

## The day's news

- Week 43 seeds are prepared for October 19–26 UTC; deployment is pending. (`62e61679a`)

The registry now includes `r2026w43`, opening October 19 at 00:00 UTC and closing October 26 at 00:00 UTC, with six seeds. All six earlier rotations remain, and `public/skill.md` contains the whole seven-rotation registry. The standing-duty review records 36 passing guards, TypeScript and both builds green, and an E1 first-town payload of 34,355,296 B against the 52,000,000 B limit. Source: `reviews/rotation-r2026w43.md`. This digest reports that preparation; it does not claim deployment.

The existing Gazette draft already covers this merge under “Week 43 seeds are prepared ahead of opening.” No duplicate news item was added.

## Landing dates and coverage

The local October 14 window is `[2026-10-13T17:00Z, 2026-10-14T17:00Z)`. History is pinned at `e6d60e8077e674fa88cdb1d52471e32faabdc27b`. Main's reflog records **61 updates**, from predecessor `a2c2d880e` through `5edf95757`; the pinned first-parent walk also contains **61 commits**. The September 25 busy-day control reproduces **136 commits**. There are no non-ancestral replacements.

Every update was compared with its preceding tree using `isPlayerPath` from `scripts/gazette-backfill-sweep.mjs`. The one player-path event is the rotation registry and skill fence in `62e61679a`. All first-parent subjects and changed paths were reviewed; the remaining paths are evidence, generated logs, status, handover, ledger, the prior ticker and this rotation's review/Gazette entry. No additional runtime, ops or engine-pin change supplies a headline. Evidence: `artifacts/s3113/day.mjs`, `day.json`, `day-commits.txt` and `day-paths.json`.

## Current limits

At October 14 23:15 UTC, outside the day window, game/version/skill return HTTP 200 at build `62403b1d`, serving weeks 37–42. Week 43 is still absent from the served skill registry. The next authorized attended deployment must carry it before October 19 00:00 UTC and verify ASSAYER SYNCED. Canonical and direct Pages stats return 200 JSON, 747 bytes, `ok:true`, a stats object and `empty:false`. These samples do not establish recovery cause or sustained API health. F-CUT-1 recurrence follow-up, droplet probe installation and release acceptance remain attended-owned. Evidence: `artifacts/s3113/live-probe.json` and `health.txt`.
