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
