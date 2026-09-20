# Ticker digest — 2026-09-16 (TK-01, compiled s2599 fire 2026-09-17 06:10 local)

Micro-headlines from yesterday's ACTUAL merges, classified by **touched paths on main** and never by
commit messages (Mistake #16). Owner approves the whole digest in one action; publication stays owner-only.

**Method, unchanged and re-run rather than inherited.** The day's commits were bucketed on their own `%cs`
with **no `--since`/`--until` window at all** (F-2562-2). Control asserted before any count was believed —
**11,931** first-parent commits in the whole history — so a zero here would have been an answer and not a
failed read. The player-path test is **imported** from `scripts/gazette-backfill-sweep.mjs` (`isPlayerPath`),
never re-typed, per F-1261-1. The day was asked as a day — `git diff dbbeb4da8^..0780b4026` — rather than
commit by commit, because the merge-direction over-count F-2583-1 names was present in shape again:
`e4259a49b` merges **main into** the playability chain, so a first-parent diff would credit it with files
that were already home. It happened to carry no player files this time. Ask the day anyway.

**The shape of the day: 70 first-parent commits, and the player-visible half is five files wide.** Four
commits touched a player path; net across the day main gained **5 player-visible files** and 53 files in all.
**Fifty-eight of the seventy carry a fire's session prefix** — thirteen sessions, s2583 through s2595, all of
them on a dry board. This is the mirror image of the 15th, which moved 344 player files: yesterday the county
changed almost nothing and fixed the thing a new prospector hits first.

## The county's news

**Two Steamworks claims stop killing a newcomer in the first minute.** The census of the 15th found three maps
that end an unassisted first-time player before wave 2 ever arrives. Two of them are cured, **in the maps' own
data — `src/` and `Balance.ts` were not touched.**

- `1802fbe63` — **The Trestle and the Incline now reach wave 2.** The Trestle was dead at wave 1 by 57.3 sim-
  seconds and now holds to **86.3–87.1 s**; the Incline was dead at 71.9 s and now holds to **80.8–81.7 s**.
  Three passes each, both desktop and 390 px.
- The cure is a door rather than a dial: machines used to appear on a ring 26 units around the prospector, so
  a hero standing near the map's edge had them **materialise a few paces away with no approach and no
  warning**. The two claims now declare **spawn gates** — fixed points the machines must come in through — and
  the Incline gives up its south edge entirely. You get to see them coming.
- `731da343b` — The claims' published mask tables were re-cut to match, so what the county prints about these
  two maps is what the maps now do.
- `2763dfadd`, `e2150c641` — The era-6 seal re-pinned twice, so the engine hash moves with the contract data.
  Same era, not a new one.
- **The Drill Yard was never broken.** Its census row read "reached wave 0 after 374 s" — the practice ground
  has no waves to reach, and the instrument was asking it the wrong question. The question was fixed, not the
  map.

**OWNER CHOICE — the Picnic is stopped, and deliberately.** E6 Picnic still ends at ~37 sim-seconds with the
prospector at full health: the machines take all three sandwiches within about twelve seconds of each other,
so no single delay dial helps — two were tried, measured and reverted. Two real cures exist and **both cost
something the owner owns**: far spawn gates push the first threat out to 27.1 s, which makes the map's own run
card ("inside ten seconds") a lie and empties the prover's opening fight; or a one-clock stand-down after each
sandwich falls, which makes the three losses serial instead of simultaneous but is an engine change on a
branch that promised not to make one. Nothing shipped. The measurements are in
`artifacts/playability-first-wave-e2-e6/report.md`.

## Not player-visible

Sixty-six commits went to the factory's own tools, law and bookkeeping. Nothing here is news; it is listed so
the day is whole.

- **The county book got its daily offsite copy** (`d6cb8d86f (archive: pruned by the A3 rewrite)`, LB-01), and the archive audit learned to say
  whether a shortened record actually lost anything rather than only that it was shortened (`c6e9cc6e7`).
- **A check that could never pass was found and fixed** (`9ff2c2580`): the null-floor check now classifies by
  kind, so a pin older than the tree stops reading as a floor that moved.
- **The board was played end to end again** (`160426315`) — 76 of 84, the same four contracts reproducing on a
  byte-identical tree, which is what made the cure above provable rather than hopeful.
- **Thirteen fire sessions talked to the ledger and to their own law.** The recurring subject was the law's own
  accuracy: a desk figure that had no predicate, a compound ruling half-carried into the rules, a weekly-mint
  instruction pointing at a file that has never existed, and an untracked-evidence sweep that claimed a scope
  it did not have. All four were corrected against measurement.

*Already reported.* The Trestle and Incline cure reached the gazette on the day as a ROUNDUP
(`marketing/outbox/gazette-queue.md`); it is repeated here because a digest reports the day, and this was the
day.

---
*Compiled by the s2599 fire. Day boundary `dbbeb4da8^`..`0780b4026`. 70 first-parent commits, 4 player-path,
5 player-visible files net, 13 fire sessions. No commit message was used to classify anything.*
