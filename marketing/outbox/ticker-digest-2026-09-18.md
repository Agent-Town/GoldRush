# Ticker digest — 2026-09-18 (TK-01, compiled s2633 fire 2026-09-19 07:12 local)

Micro-headlines from yesterday's ACTUAL merges, classified by **touched paths on main** and never by
commit messages (Mistake #16). Owner approves the whole digest in one action; publication stays owner-only.

**Method, re-run rather than inherited.** The day's commits were bucketed on their own `%cs` with **no
`--since`/`--until` window at all** (F-2562-2) and the offset-explicit windowed form was run beside it as a
control — both read **108**. The **bare** `--since=2026-09-18 --until=2026-09-19` form reads **98**, and that
ten-commit gap is F-2562-2's sliding-window trap firing live on this very day: git fills a bare date with the
current time-of-day, so the window slides. A second control was asserted before any count was believed:
**12,154** first-parent commits in the whole history, so a zero here would have been an answer and not a
failed read. The player-path test is **imported** from `scripts/gazette-backfill-sweep.mjs` (`isPlayerPath`),
never re-typed, per F-1261-1. The day was asked as a day — `git diff ba4623d64 (archive: pruned by the A3 rewrite)^..7df174b69` — rather than
commit by commit, because of the merge-direction over-count F-2583-1 names.

**The shape of the day: 108 first-parent commits, and it is the biggest day the county has had.** Twelve
commits touched a player path; across the day main gained **1,631 player-visible files** and 3,196 files in
all. Thirty-seven of the hundred and eight carry a fire's session prefix — thirteen sessions, s2612 through
s2628, every one of them on a board that was dry both ways. Five separate lands reached main: the town cast,
a hygiene battery, two open maps, a sprite batch and six correctives — plus a heat of 37 rides.

**And the headline is a subtraction.** `assets/processed` went from **226.76 MB to 181.31 MB — down 45.44 MB,
a fifth of itself — while gaining 79 new files.** The county got bigger and the download got smaller on the
same day.

## The county's news

**The pictures lost a quarter of their weight and not one pixel.** `fa48ea7e3` re-encoded the sprite sheets
losslessly: 1,816 encoded, 1,505 shrank, **211,149,764 → 159,700,493 B (−24.4 %)**, every output verified
identical on all four channels with the halo check PASS 395/0/680/2059.

- **The opening town was carrying 86 files it never showed.** A static `new URL()` in `src/story/speakers.ts`
  was pulling 85 later-era portraits and an E5 sea tile into the first release — **27,355,070 B** a new player
  downloaded to look at nothing. Two redirect rows closed it.
- **The release now weighs 34,509,068 B against a 52,000,000 B budget** — down 14,459,031 B (−29.5 %), back
  under even the old 35 MB rule, with 17,490,932 B of headroom.

**The Elder walks her round, and the Picnic stops being a dead end.** `4a6caaa63` landed four of the owner's
town rulings.

- **A21 — the Picnic reaches wave 2.** A twenty-second claim stand-down after a claim is taken: the map now
  runs to **wave 2 in 60.3–61.7 s, 6 of 6 across three runs on both viewports**, where before it died at
  29.7 s and 37.9 s. The card's "inside ten seconds" promise still measures true, unmodified.
- **A13 — the Elder leaves her post.** She walks a two-point round on the tavernkeeper's timing and is 1.59 u
  from her post by 5.23 s on a plain boot, on her own walk cell, clearing the monument by 7.02.
- **A17 — Pip and Juniper are called by name** on five story cards; the lore line was extended in the same
  commit.

**Two of Astra's six unfinished maps measurably improved, and four were held with their reasons written
down.** `1c47ba975` landed a plain-boot instrument that asks one question: can a player secure, bank, reload
and return?

- **The Hill Mine went from dead at wave 3 to wave 9.** Its missing wave-cadence multiplier was set to 0.75.
- **The Long Road's way-stations can be worked.** Two harvest anchors per ground; the old "could not fund
  turret (cost 50, purse 25)" complaint is gone. The map is still **held** — its win is gated on a convoy
  errand its own card never names.
- **The Baron, Twin Banks, Night Shift and Dry Gulch were held, not faked.** The honest finding is the
  uncomfortable one: on **unchanged** Dry Gulch data the same instrument secured at wave 20 once and then died
  at waves 16–19 — *how the map is played spreads wider than anything the map data was changed to do.*

**Blackout Ridge came out of the dark.** `220fbe472 (archive: pruned by the A3 rewrite)` and `219c2d7b9` re-baked its atlas and then fixed what
the re-bake exposed.

- **The pale plates are gone** — pad luma 37.2 → 27.8 (−25 %), all five down 14–30 % — and **the machinery is
  lit**: p90 65.2 → 93.2 on the receiver, up on 10 of 10 stations.
- **The off-map receiver no longer hangs off the top of the screen.** Scaled to 0.8, its apex moves from
  −37.7 to **+21.0** on desktop and −39.6 to **+22.0** at 390 px — inside the frame on both.
- **The Fairground wheel was rebuilt to its concept plate** — three rings, 20 paired spokes, 20 lantern cars
  outside the rim, 100 bulbs, a lit brass hub — and it draws **fewer** calls than the old one: 110 → 90 on
  desktop, 91 → 72 on mobile.
- **A proposed trim was refused by its own measurement.** Two 390 px HUD trims would have *raised* the
  covered fraction 54.7 → 68.8 % on a control arm, so they did not land.

**Sixty-four new cells for the county's cast.** `1b9dbc234` brought 44 across ten stems plus the
schoolteacher's second row for 70 of the owner's 600 credits; `4550c3ae9` added 20 more from seven Codex
strips — five of seven facings at the jumper family's measured band. **Two rows were parked with numbers
rather than shipped thin:** the Steam Wrecker's south-east after four takes, and the jumper's south-east on
spread.

**The county board has honest receipts for the first time.** `ea367da9d (archive: pruned by the A3 rewrite)` landed heat 14 — **37 boards ridden,
31 secured, none unridden** — including the first-ever secures of **Ember Shore** (wave 12, 60 gold, the hero
untouched) and **the Archive World** (wave 12, 200 gold). Five boards fell that heat 13 could not. **Ranked
rows on the live board went from 0 to 18.** Every one of the six not-secured named *the rider's own budget*,
never the map: no era-6 board was reported unwinnable.

**The era seal was re-pinned four times — same era, not a new one.** Pins #8 through #11 (`a57f0934e`,
`1d05615c6`, `ab657f206`, `a8c01f78a`) append to era 6, verified by reading each pin's own `cause` field
rather than its subject line. Nothing about the Re-surveyed Claims changed underneath a rider's existing reels.

## Not player-visible

Thirty-seven commits across thirteen fire sessions went to the factory's own tools, law and bookkeeping. None
of it is news; it is listed so the day is whole.

- **A battery had been running a hidden nested copy of itself since 2026-09-14** — the first stage listed the
  test runner as one of its own subjects, so every battery for four days carried a full second discovery
  inside a single test. That is where the fifteen-minute durations came from. The duplicate was dropped; the
  first fully green battery in a linked worktree followed (920 tests, 915 pass, 0 fail).
- **The recurring subject was again the law's own accuracy**, every correction made against a measurement: a
  `/tmp` reaper census keyed on a naming convention that had expired, leaving two thirds of its own subject
  set invisible; a refusal bucket that turned out to hold 19 reaped corpses *and* 5 trees carrying 1,874
  unread evidence files; an arena announced as riding that never rode (Mistake #16 on a heat launch).
- **The county book took its daily offsite copy**, 2026-09-18, and the series reads whole: 26 of 26 days
  present, 2026-08-24 through 2026-09-18, every key county-standings class and none of it account data.
- **The board was dry both ways for the entire day.** All thirteen fires found nothing to drain — the day's
  work was done by attended sessions and their implementers.

*Already reported.* Everything above reached the gazette on the day it landed
(`marketing/outbox/gazette-queue.md`): phase B as a roundup, the hygiene payload cut as its own item, the
attended burst and the correctives as two further roundups, and all four era pins judged there and dismissed
as same-era appends. It is repeated here because a digest reports the day, and this was the day.

---
*Compiled by the s2633 fire. Day boundary `ba4623d64 (archive: pruned by the A3 rewrite)^`..`7df174b69`. 108 first-parent commits (two independent
methods agree; the bare-date form reads 98), 12 player-path, 1,631 player-visible files net, 3,196 files in
all, 13 fire sessions. `assets/processed` −45.44 MB (−20.0 %) while gaining 79 files. No commit message was
used to classify anything.*
