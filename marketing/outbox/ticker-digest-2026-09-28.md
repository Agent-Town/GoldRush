# Ticker digest — 2026-09-28

TK-01, compiled by s2777 at 2026-09-28T23:06Z, September 29 after 06:00 local. Draft for one owner approval; publication remains owner-only. Bold micro-headlines are at most 140 characters.

## The day's news

- **Keep the Tape Reel when returning to earlier maps after reaching the Signal Era.** `f6b61e4c5`, `ab573c67a`. The drawer follows campaign progress on a contract visit; explicit epoch previews keep the previewed map's state. Review: `reviews/e7-tape-drawer-inheritance-1.md`.
- **Turn music off with one tap in a run, in town, or on the opening screens.** `cdf30c09e`, `3cc0c92e7`. Sound effects stay on, the music volume is preserved, and the choice is remembered per profile. Review: `reviews/audio-music-toggle-1.md`.
- **Quieter sharp effects and smoother music fades arrive in the sound mix.** `a214c82d7`, `ade1f4120`. The measured re-balance lowers bright effects and distant building shots; music crossfades through loop seams. The owner's before/after listen still decides keep or revert. Review: `reviews/audio-harshness-1.md`.

## Landing dates and coverage

The local window is September 28 00:00 through September 29 00:00, UTC+07: `[2026-09-27T17:00Z, 2026-09-28T17:00Z)`. History is pinned at `985c83d5f`. The saved main reflog records **201 updates**, all ancestor-preserving, from `cb82f79a4` to `abe0127ea`; **3** updates touch the existing `isPlayerPath` corpus. The pinned first-parent walk contains **187** commits in this window. Every actual main update was compared with its preceding main tree, including introduced second-parent commits regardless of authoring date. The September 25 busy-day control reproduces **136** first-parent commits.

| Main landing, local | Main tip | Coverage |
| --- | --- | --- |
| 18:38 | `5b868b11f` | Tape Reel inheritance; same-era pin 72 |
| 19:39 | `80ba31fd1` | One-tap music toggle; pin 73 |
| 20:57 | `954bb2cde` | Sound re-balance and music transitions; pin 74 |

All three pins remain in era 6 and already have Gazette drafts. The guard-wrapper correction, later audio persistence test repair and factory bookkeeping add no player mechanics. No additional Gazette item or publication is needed from this fire.

Evidence: `artifacts/s2777/day.mjs`, `day.json`, `main-reflog.txt`. The JSON lists every introduced commit and changed player path for each update. The probe reuses s2723's verified local-day method with this day's bounds and pinned head.
