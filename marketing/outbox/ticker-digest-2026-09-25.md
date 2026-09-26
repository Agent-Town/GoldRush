# Ticker digest — 2026-09-25 (TK-01, compiled s2688 fire 2026-09-26 08:10–08:30 local)

*Filed on time: the first fire after 06:00 local on the 26th. Micro-headlines from the day's ACTUAL merges,
classified by **touched paths on main**, never by commit messages (Mistake #16). Owner approves the whole
digest in one action; publication stays owner-only.*

**Method, re-run rather than inherited.** s2678's script (`artifacts/s2678/day.mjs`), copied to
`artifacts/s2688/day.mjs` and run for 2026-09-25: commits bucketed on their own `%cs` with no
`--since`/`--until` window (F-2562-2); the player-path test imported from `scripts/gazette-backfill-sweep.mjs`
(`isPlayerPath`, F-1261-1). **Control: 11,981 first-parent commits in the whole history**, so a zero would
have been an answer. The day holds **136** first-parent commits (**314** reachable from HEAD, per F-2623-1),
**1,198** files changed on the walk, **16** distinct player-path files, touched by **9** walk commits
(listed by `artifacts/s2688/walk-player.mjs`). CONTAINMENT: see the last section.

**Dates, as on the 24th:** the machine runs at UTC+07 and these buckets are local. Several reviews stamp their
drains in Z (`sec-headers-and-data-hygiene-1` says "2026-09-24 19:07Z" for a merge at 01:47 on the 25th local).
The `ux-entry-robustness-1` merge `3f5bc0456` was reported on the 24th; its cure and pin land here.

## The county's news

- **Twin Banks' water follows the braid.** `1920cfbbe` (+ pin `961f07fe2`): two channels, a dry walkable plait
  between them, a spring that shows as a pool — the production water mask drives both draw paths.
  `reviews/hm-06-twin-banks-braid-water.md`
- **Runs with a reel bank their county standing again.** `c582dda25` (P0 hotfix): since 2026-09-05 the door
  refused any standing whose reel carried playbook uses or motor actions; now `[200, true]` where it was
  `[400, bad_payload]`. `reviews/door-tape-grammar-1.md`
- **…and so do runs where you dispatched the Prospector.** `dd5c74b97`: the door accepts `prospector_dispatch`,
  `context_action recover` and a seated rider's orders — three refusals become three banked, ranked reels.
  `reviews/door-tape-grammar-2.md`
- **A plain-words privacy notice, linked from the account card and the complaints desk.** `0bfb168ea`
  (+ pin `aa4ccf975`), with five security headers and a report-only CSP (zero CSP lines over six boots); bug
  reports now expire after 90 days. `reviews/sec-headers-and-data-hygiene-1.md`
- **One visitor can no longer take co-op, bug reports and prizes down.** `647337be2`: a telemetry beacon costs
  zero edge KV writes with the ledger bound (up to fifteen before); a busy store answers 429 "The wire is
  busy." instead of throwing. Not deployed with the merge. `reviews/kv-counters-to-ledger-1.md`
- **A bare `?contract=` link still launches once you have onboarded.** `960cbb249` (+ pin `1b977e055`), the
  drain cure F-UX1-6 of `ux-entry-robustness-1`. `reviews/ux-entry-robustness-1.md`

## Hashes (the 9 player-path walk commits)

`960cbb249` 00:28 · `1b977e055` 01:18 · `0bfb168ea` 01:47 · `aa4ccf975` 02:07 · `1920cfbbe` 09:59 ·
`961f07fe2` 10:23 · `647337be2` 19:01 · `c582dda25` 22:10 · `dd5c74b97` 23:24

## Gazette coverage (a note for the landers, not a fire act)

The gazette queue cites `1920cfbbe`, `0bfb168ea`, `960cbb249` and `3f5bc0456`; it cites **neither
`c582dda25` nor `dd5c74b97`** (both reviews name a player-visible change: "a secured run with dispatches banks
its county standing again") nor `647337be2`. GZ-01 belongs to whoever landed them (attended); this digest
records the gap and does not append for them.

## Containment (F-2623-1)

**NOT MEASURED.** The day holds 178 off-walk commits (314 − 136); the containment half of `day.mjs`
(`merge-base --is-ancestor` against each walk commit) had not finished after ~16 minutes on a host at 1-min
load 150 to 275 shared with a live attended landing queue, and this fire's runtime holds `tasks/.fire.lock`,
which those landings wait on. Stopped by the fire, not failed. OWED: re-run `node artifacts/s2688/day.mjs
2026-09-25` on a quiet host and append its two containment lines here.

**MEASURED (s2689, 2026-09-26 ~07:05Z, 1-min load 3.7):** the owed re-run AS WRITTEN is no longer a valid
instrument. `day.mjs` walks `--first-parent` from HEAD, and main was re-rooted on 2026-09-26 by "drain: merge
main into the <x> chain" commits (first parent = the chain; `887c0b9df`, `725a0a422`, `93034b973`), so from
HEAD it sees 125 walk and 321 reachable commits and calls `c582dda25` and `dd5c74b97` "orphaned", although both
are walk commits of this digest. Pinned to `9fee4bc02` (s2688's handoff, main as s2688 measured it) with
`artifacts/s2689/day-pinned.mjs`, the counts match s2688 exactly (136 walk, 314 reachable, 9 player-path walk
commits) and the two lines are:

- off-walk on the day: 178, of which player-path: 28
- contained in a walk commit of the day: 15; not contained: 13

**All 13 are on main; none is lost.** Each was traced to the first first-parent commit from `9fee4bc02` that
contains it: 3 via `70cf2362f` (small-fixes-1, landed 2026-09-26 01:29 local), 7 via `e75e5d98c` and 3 via
`cfb45c7d8` (the sf1 chain merges, 2026-09-26 07:33 local). main's reflog agrees on the landing day: the live
weekly seed landed at pin #62 (handover 13z-39, 03:45), week 40 shipped by 04:20 (13z-40) and Canyon Works at pin
#63 (13z-47, 07:34), all on 2026-09-26. They were authored on the 25th and **landed on the 26th, so they belong in
the 2026-09-26 digest, not this one.** Nothing here changes.

**For the 2026-09-26 digest (the next TK-01 fire):** these landings enter main's first-parent line only through
chain-merge commits whose own `%cs` is the 26th, while the commits themselves carry the 25th, so a `%cs` bucket of
off-walk commits files them under the wrong day. Bucket the 26th by WALK commit and credit each walk commit's
second-parent content: canyon-works-traversal-1 (`752d624e8`, the creek bank blends over 8 m, creekBlendStart -8 to -14), live-seed-rotation-1
(`9c05f0c43`, `9cd109f64`, `621f64ffa`: humans ride the open week's seed; the Ride Together card names the week),
r2026w40 (`4975c9f43`, `73553e691`), small-fixes-1 (`558a5c0e8`, `dd2c87433`: the account card links the privacy
notice). GZ-01 note for the landers: `marketing/outbox/gazette-queue.md` cites none of these four (grep
`canyon-works-traversal`, `live-seed`, `r2026w40` and `small-fixes` all return nothing).
