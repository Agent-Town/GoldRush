# Ticker digest — 2026-09-27

TK-01, compiled by s2723 at 2026-09-27T23:00Z, September 28 after 06:00 local. Draft for one owner approval; publication remains owner-only. Bold micro-headlines are at most 140 characters.

## The day's news

- **County Standings opens on the current week's claims, with All time one tap away.** `40c1ee15b`, `e7fafe2a5`. A player's weekly standing appears in the in-game board. The public board's rotation parameter is documented by `2d4802c04`. Review: `reviews/county-board-open-week-1.md`.
- **The River's quiet pan can earn a verified county standing.** `712db42e2`, `9ce6ecba9`. Fresh reels with diagonal movement now follow the steps recorded on keyboard and phone. Historical reels carrying the old movement drift remain rejected. Review: `reviews/river-assay-1.md`.
- **A recorded pause no longer stops a replay forever.** `28272092e`, `df0f305b9`, `52cac1459`. Fresh paused River reels verify on desktop and phone. This later landing resolves the pause limitation recorded in the preceding River review; it does not repair old movement-drift reels. Review: `reviews/tape-pause-fix-1.md`.

## Landing dates and coverage

The local window is September 27 00:00 through September 28 00:00, UTC+07: `[2026-09-26T17:00Z, 2026-09-27T17:00Z)`. History is pinned at `870fa5eb0`. The saved main reflog records **143 updates**, all ancestor-preserving, from `b7602f6b3` to `cb82f79a4`; **four** updates touch the existing `isPlayerPath` corpus. The pinned first-parent walk contains **135** commits in this window. Every actual main update was compared with its preceding main tree, including introduced second-parent commits regardless of authoring date. The September 25 busy-day control reproduces **136** first-parent commits.

| Main landing, local | Main tip | Coverage |
| --- | --- | --- |
| 00:52 | `fc5157f6b` | Weekly County Standings; same-era pin 69 |
| 00:57 | `2d4802c04` | Public board rotation parameter documented |
| 06:31 | `dfa1ed17d` | River county assay and recorded axes; pin 70 |
| 09:37 | `df0f305b9` | Recorded pause replay; pin 71 |

All three pins remain in era 6. Later QA evidence and factory bookkeeping do not add player mechanics. The River and pause changes already have Gazette drafts; s2723 adds the missing weekly-board roundup. Nothing is published by this fire.

Evidence: `artifacts/s2723/day.mjs`, `day.json`, `main-reflog.txt`. The JSON lists every introduced commit and changed player path for each update.
