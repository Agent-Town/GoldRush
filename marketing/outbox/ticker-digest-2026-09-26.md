# Ticker digest — 2026-09-26

TK-01, compiled by s2691 on September 27 after 06:00 local. Draft for one owner approval; publication remains owner-only. The bold micro-headlines are each at most 140 characters.

## The day's news

- **The county retires reels with invalid orders instead of ranking them.** `8eca6385e`, `df691d8b1`. The two door-grammar slices close the sampled client-refused action shapes; previously stored rows remain available as retired reels. Reviews: `reviews/door-tape-grammar-3.md`, `reviews/door-tape-grammar-4.md`.
- **New runs and Ride Together rooms use the open week's seed.** `da13ea750`. The room card names the week; explicit replay and development seeds keep their precedence. Review: `reviews/live-seed-rotation-1.md`.
- **Week 40's six claims are ready for their September 28 opening.** `73553e691`. The registry opens the rotation at 00:00 UTC on Monday. Review: `reviews/rotation-r2026w40.md`.
- **The Canyon's creek bank and upper ramp can be walked; its two arc turrets stand.** `752d624e8`, `309b938eb`. The second landing removes the higher-ramp blocker left by the first. Traversal is proved; a secured run is not claimed. Reviews: `reviews/canyon-works-traversal-1.md`, `reviews/canyon-works-traversal-2.md`.
- **The account card now links directly to the privacy notice.** `70cf2362f`. This is the player-visible part of small-fixes-1; its initial localhost protection did not complete the production fix. Review: `reviews/small-fixes-1.md`.
- **Co-op's fallback connection allowance resets after a real hour.** `f68542f50`. Accepted connections no longer keep extending that hour. The separate Pages standings redirect still requires its ops-evening setting. Review: `reviews/kv-counters-to-ledger-2.md`.
- **The county's production doors refuse localhost browser origins.** `80854592d`. The shared development switch closes the earlier partial fix; the review records post-deploy checks on both production hosts. Review: `reviews/localhost-cors-2.md`.
- **The front page gains an illustrated share card and a lighter HTML page.** `b79e80acf`. Its three illustrations become byte-identical external files; HTML falls from 938,556 to 17,735 bytes. The footer's token-chart link is removed. At day end, stale cached HTML still affected the live image URLs (F-SVF1-10); this landing does not prove working live previews. Review: `reviews/site-vibe-fixes-1.md`.
- **The River's first successful quiet pan records one completed score in the Book.** `98c0c0505`. A second pan, reload or lever pull adds no duplicate. County posting was held at this day's landing; the later River assay belongs to September 27's digest. Review: `reviews/river-ending-score-1.md`.
- **The Charter Press offers unlocked lands and opens the land you choose.** `f9f4c0d23`. Fresh profiles see the Claim; securing it also exposes the Dry Gulch and Twin Banks. Review: `reviews/charter-press-locked-lands-1.md`.

## Landing dates and complete coverage

The window is **September 26 00:00 through September 27 00:00, UTC+07**, equivalently `[2026-09-25T17:00Z, 2026-09-26T17:00Z)`. History is pinned at `3c35d5bed`. Its current first-parent walk contains **50** commits in the window, but landing chains change first-parent ancestry. Therefore each actual main update was also checked through the saved main reflog, comparing its tree with the preceding main tree and crediting every introduced commit regardless of its authoring day. This includes the second-parent content s2689 explicitly owed to this digest.

Measured: **109 main updates, 13 with player-path changes**, using the existing `isPlayerPath` predicate from `scripts/gazette-backfill-sweep.mjs`. Every update is an ancestor-preserving advance; the day starts from `320797e15` and ends at `b7602f6b3`. The busy-day control, September 25 pinned at `9fee4bc02`, reproduces **136** first-parent commits. No zero-result assumption or unbounded containment search is used.

| Actual main landing, local | Main tip | Coverage |
| --- | --- | --- |
| 02:34 | `a4c006a1a` | Door grammar 3 |
| 03:32 | `10227e387` | Live weekly seeds, pin 62 |
| 03:56 | `a35756be1` | Week 40 |
| 04:40 | `c13eda295` | Door grammar 4 |
| 07:31 | `07d199701` | Canyon creek crossing, pin 63 |
| 07:55 | `3caf7ab66` | Account privacy link, pin 64 |
| 10:21 | `84ec86ae6` | Co-op connection hour |
| 11:20 | `725a0a422` | Canyon upper ramp, pin 65 |
| 12:21 | `93034b973` | Tool entry-point repair, pin 66; maintenance only |
| 17:57 | `c5763d86d` | Localhost origin policy |
| 20:45 | `387f79cd4` | Front page and share card |
| 22:16 | `13be4798c` | River score, pin 67 |
| 22:40 | `a3371932a` | Charter Press, pin 68 |

Pin 66 (`27e59383d`, `reviews/is-main-2.md`) records the assay tool's corrected entry-point detection. It introduces no player mechanic. Pins 62–68 all remain in era 6; their identity changes are credited with the associated landings above. The later River proof is evidence for the score change, not an additional feature. September 27's landings are outside this window.

Reproducible evidence: `artifacts/s2691/day.mjs`, `artifacts/s2691/day.json`, `artifacts/s2691/main-reflog-september26.txt`. The JSON retains the introduced commits and changed player paths for every landing. GZ-01: s2690's four-item roundup is retained; s2691 appends one roundup for the remaining eight behavior changes plus the maintenance pin. Nothing is published by this fire.
