# Ticker digest — 2026-09-20 (TK-01, compiled s2669 fire 2026-09-24 18:00 local)

*Filed FOUR DAYS LATE, and the lateness leads the file — this is the day the fires died on. TK-01 wants the
first fire after 06:00 local; the last fire of this day handed off at 19:29 local and then **478 consecutive
ticks died on the macOS argument limit** (F-FIRE-1, `logs/fire-2026092*.log`, rc=126) until the cure landed at
2026-09-24 15:35. s2668 filed 2026-09-23 first, as the freshest day, and recorded the three older ones as
owed (F-2668-1). This is the oldest of the three, and the last of them.*

Micro-headlines from the day's ACTUAL merges, classified by **touched paths on main** and never by commit
messages (Mistake #16). Owner approves the whole digest in one action; publication stays owner-only.

**Method, re-run rather than inherited.** The day's commits were bucketed on their own `%cs` with **no
`--since`/`--until` window at all** (F-2562-2). A control was asserted before any count was believed:
**11,788** first-parent commits in the whole history. The player-path test is **imported** from
`scripts/gazette-backfill-sweep.mjs` (`isPlayerPath`), never re-typed (F-1261-1). The script is s2668's,
re-run from a copy of its own at `artifacts/s2669/day.mjs`, not trusted from its output.

**The day was asked twice, per F-2623-1.** On the first-parent walk it holds **137** commits; asked of ALL
commits reachable from HEAD it holds **252**, so **115 sit off the walk, 24 of those touch a player path** —
and every one of the 24 is contained in a walk commit of this day: **0 orphaned.** The day is whole.

**This digest compiles; it does not re-judge.** Unlike its two siblings, **this day owes the GZ-01 sweep
nothing: it counts ZERO standing candidates here.** Every one of the day's 17 player-path merges was already
cited in `marketing/outbox/gazette-queue.md` when it landed — because the fires were alive to do it, right up
until they weren't. The queue's items for this day were written by sixteen different fire sessions on the day
itself; TK-01's job is to compile them into one morning read, and that is what follows. Each item below names
the merge its queue entry already cited.

**The shape of the day: 137 first-parent commits, 25,382 files changed, 37 distinct player-path files.**
Seventeen of the 137 touched one of them — the other 120 are the factory's paper and two repository-wide
moves that account for nearly all of those 25,382 files (see below). **Sixteen fire sessions signed commits
here** — s2648, s2649, s2650, s2651, s2652, s2653, s2655, s2656, s2657, s2658, s2661, s2662, s2664, s2665,
s2666, s2667 — which is the highest fire count of the four days and, read from the other end, the last
full day the factory ran itself.

## The county's news

**The Claim-Boat sails, and the Regatta's table says so.** `e417e71df` lands A14 slice 1 on the owner's word
(verbatim, 2026-09-20: *"A14 - do it"*): walk onto the Claim-Boat at her port rail and the keys sail the hull;
a rider's order to a water point sails the same boat to the same place. **She comes about in 2.001 s, runs the
98 m line in 59.394 s, and fast water carries her half again.** `f9426ece1` follows so the Regatta's published
mask table mirrors the contract's own `claimBoat.physics` block rather than drifting from it.
`reviews/e5-regatta-boat-01.md`.

**A rider can watch the boat race now, and hears by name why it cannot board.** `53f9b9436` lands A14 slice 3:
the door tells a rider where the boat sits, which buoy is next and which are already passed, and a step for
the water from dry land comes back as **`NOT_ABOARD`** or **`UNREACHABLE_WATER`** instead of silence. Rider
parity on both engines, view schema 3. `reviews/e5-regatta-boat-03.md`.

**Four maps corrected, and the Last Claim judged in Astra's own words.** `b25de763d` lands corrections run 1:
ride Night Shift, Twin Banks, the Baron or the Trestle and the ground reads as itself again — the river parted
from the scorched bank, the clearings quieted, the stored rails set apart. **The run did not finish on its own
terms: it stopped on the ChatGPT usage limit after 1,922,565 tokens**, with 19 maps left for the continuation,
and the queue item says so rather than presenting the stop as a completion. `e7375be47` rides with it, and it
is a small thing that would have broken a big one — the Trestle's paint entry is re-flattened to ONE line,
because the E1 release strip removes every line that starts an e2–e10 entry and would otherwise behead a
multi-line entry and kill the release build. `reviews/sol-map-art-corrections-1.md`.

**The sea reads clear, and the hulls sit in the water at last.** `532a7ffb5` lands the second campaign run:
the four sea claims stop shimmering with one repeated swell, a hull meets the water where a boat should, and
masts stand in front of the shore rather than behind it; the Relay Valley lamps brighter and the Mare and the
Eclipse gain their dome drums. This run ended in a stream disconnect at its closeout (rc1, 1,078,804 tokens) —
also recorded as it happened. `reviews/sol-map-art-campaign-2b.md`.

**Three more maps corrected, and a seam in the Canyon closed.** `d409d0728` carries corrections run 2 into the
chain: the Pressure Garden, the Incline and the Canyon Works read as worked land again, and **where the Canyon
Works once showed daylight through a gap in its own rim, the rim is whole.**
`reviews/sol-map-art-corrections-2.md`.

**The Dust Flats, the Long Road and Gusher County come clear.** `74083ce0d` lands corrections run 3 on the
owner's word (verbatim: *"ok, then lets continue with the next batch of maps but don't let it run through all
of them"*): the desert carries the wheel cuts and paint it was surveyed with, the tall cabin at Gusher stops
hiding what is behind it, and the charting posts no longer cover the phone.
`reviews/sol-map-art-corrections-3.md`.

**The week's headline budget was honest about itself.** Every one of the five items above was filed
**ROUNDUP-CLASS**: 2026-W38's three standalone slots were spent before this day began, so five landings that
each could have carried a headline batched instead. That is the budget working, not a shortage of news.

## Not player-visible

NOT PLAYER-VISIBLE — the day's two largest commits by file count, and neither is a thing a rider can meet.
`04d88f868` re-points every cited commit id at the rewritten history (the A3 shrink), composed from
git-filter-repo's two commit maps and kept as `docs/ops/a3-commit-map.tsv`; sampled in
`assets/contracts/null-floors.json`, the ONLY change is the `eraStamp` citation hash `24dad56f0` → `05232a3a0`
while **every floor value holds**. `2ad3ab1ee` turns four art directories into relative symlinks at
`../../GoldRush-assets/*` for the public-repo split, and ships README, CONTRIBUTING, SECURITY and LICENSE —
**the same bytes, reached by a different path.** Between them they account for most of the day's 25,382 changed
files.

NOT PLAYER-VISIBLE — the day's seven same-era engine pins, each judged by READING its own `cause` field rather
than inferring from a subject line (F-2612-1): `78e5c109b` (#21), `7b3ababf2` (#17), `6da9cefc7` (#16),
`cfb0c6fa5` (#18), `902cb58da` (#19), `8fb118452` (#22). Every one says "same era" with `"era": 6` unmoved and
no contract, sim table or null-floor value changed. **An era BUMP is news by definition; a same-era pin is
not** — no rider's existing reel was re-hashed.

NOT PLAYER-VISIBLE — `322cc122e` merges main into the corrections chain, and its ten player paths are exactly
the A14 slice-2 Regatta files already reported above: content arriving, not content changing.

The rest of the day's 137 commits are the factory's own paper: reviews, ledger rows, goal leaves, lock lines,
law-pointer re-bases and sixteen fires' handoffs. None of it is news; it is named so the day is whole.

## What this digest does NOT cover

Nothing on this day is unreported. With this file and its two siblings (2026-09-21 and 2026-09-22, filed by
the same fire), **F-2668-1 is discharged**: the four dead days of F-FIRE-1 all have their digests, and the
GZ-01 sweep's remaining standing candidates are the **17 that sit on 2026-09-24**, whose own digest is not due
until the first fire after 06:00 local on the 25th.

---
*Compiled by the s2669 fire. Day boundary `573b3d579^..4f00cb451`. 137 first-parent commits (bucketed on their
own `%cs`, no window), 252 reachable on the day with 115 off-walk — 24 player-path, all 24 contained, 0
orphaned — 25,382 files changed, 37 distinct player-path files, 17 walk commits touching one of them, 16 fire
sessions signing commits. The GZ-01 sweep counted 0 candidates on this day: every player-path merge was
already cited in `gazette-queue.md` on the day it landed, and this file compiles those citations rather than
re-judging them. No commit message was used to classify anything.*
