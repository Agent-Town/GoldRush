# Ticker digest — 2026-10-09

TK-01, compiled by s3013 on October 10 after 06:00 local (UTC+07). Draft for owner approval; publication remains owner-only.

## The day's news

- Browsers can reuse unchanged game files between visits and map changes. — `c7ad5dc24`
- The game keeps its address as static traffic leaves the capped Worker. — `b3cb110c6`, `a3b8a8216`

The cache fix and routing change were deployed in build `62403b1d` during the attended Option B cutover. The existing Gazette roundups already cover both; this digest adds no duplicate Gazette item. Reviews: `reviews/headers-asset-cache-1.md` and `reviews/goldrush-static-route-1.md`; cutover record: `docs/HANDOVER-2026-09-06-attended.md` §13z-110.

## Landing dates and coverage

The local October 9 window is `[2026-10-08T17:00Z, 2026-10-09T17:00Z)`. History is pinned at `56f5afcc4a95fc97d56729c5c95fc08290a99972`. The main reflog records **78 updates**, from predecessor `e282c2e57` through `dcdd3b69b`; the pinned first-parent walk contains **72 commits**. These are different counts: the reflog follows actual main updates, while landing chains can carry earlier main commits through a second parent. The September 25 busy-day control reproduces **136 commits**. There are no non-ancestral replacements.

The existing `isPlayerPath` selector finds **one player-path update**, the cache fix arriving on main at `11a46dbab` (October 9 14:18 local). The ops-only routing landing arrived at `62403b1d4` (14:57 local); its player-visible result is included from its review and the attended cutover record `a3b8a8216` (15:30 local). Evidence: `artifacts/s3013/day.mjs`, `day.json`, `day-summary.txt` and `supplemental-events.json`. Both micro-headlines remain below 140 characters including their hashes (`headline-check.json`).

The API monitoring correction `e0c536dcc`, arriving on main at `0a36cfcfe`, is operational work, not a player headline: the Mac monitor now rejects an HTML response masquerading as a healthy API. Its droplet copy still awaits authorized installation. No engine pin changed that day.

## Current limits

Bounded GETs at 2026-10-09T23:28Z return HTTP 200 for the canonical game, version and skill, at build `62403b1d` with weeks 37–42. The stats endpoint still returns HTML with HTTP 200; sampled week-41/week-42 standings return valid JSON. This digest does not claim stats recovery, browser/save/account acceptance or release approval. Evidence: `artifacts/s3013/live-probe.json`.
