# Ticker digest — 2026-09-19 (TK-01, compiled s2652 fire 2026-09-20 05:58 local)

*Filed two minutes before TK-01's nominal 06:00 trigger, and the day is complete rather than early: the
coverage day is LOCAL-bucketed (F-2651-1, measured across six digests), so 2026-09-19 closed at local
midnight — five hours and fifty-eight minutes before this was compiled — and no commit can still arrive in
it. The 06:00 trigger is slack after the day closes, not the moment the day ends.*

Micro-headlines from yesterday's ACTUAL merges, classified by **touched paths on main** and never by
commit messages (Mistake #16). Owner approves the whole digest in one action; publication stays owner-only.

**Method, re-run rather than inherited.** The day's commits were bucketed on their own `%cs` with **no
`--since`/`--until` window at all** (F-2562-2) and the offset-explicit windowed form was run beside it as a
control — both read **103**. The **bare** `--since=2026-09-19 --until=2026-09-20` form reads **109**, and that
six-commit gap is F-2562-2's sliding-window trap firing live on this day too: git fills a bare date with the
current time-of-day, so the window slides. A control was asserted before any count was believed: **12,261**
first-parent commits in the whole history, so a zero here would have been an answer and not a failed read.
The player-path test is **imported** from `scripts/gazette-backfill-sweep.mjs` (`isPlayerPath`), never
re-typed, per F-1261-1. The day was asked as a day — `git diff 43ae9f92c^..2a905928a` — rather than commit by
commit, because of the merge-direction over-count F-2583-1 names.

**And one extra check this digest ran that its predecessors did not.** Every prior digest counted
`--first-parent` alone, and F-2623-1 proved a *"merge main into \<chain\>"* drain can push commits off that
walk — so a first-parent count can under-report a day. Asked of ALL commits reachable from HEAD, this day
holds **210**, of which **107 sit off the first-parent walk and 28 of those touch a player path**. Each of
the 28 was then tested for containment: **all 28 are contained in a walk commit and 0 are orphaned**, so the
day is whole and nothing of it is unreachable or unreported. The gazette agrees independently —
`cited 407 of 407, candidates 0`.

**The shape of the day: 103 first-parent commits, 555 files changed, 136 of them on a player path.** Eleven
first-parent commits touched a player path. **Sixty-four of the hundred and three** carry a fire's session
prefix — **fifteen sessions, s2629 through s2646**, every one on a board that was dry both ways. Four lands reached main: two days of
owner rulings, Astra's open findings, and the county door's own repair.

**And the headline is a rescue.** Eleven reels a rider had already earned, and which the county's own book
had struck out, are owed back to them — and the door that did the striking is shut.

## The county's news

**The county's book stops taking a row away to make room.** `69c16417f` found the verdict path enforcing
"one standing to a name" by **deleting** a rider's other verified row from storage. It now re-ranks instead
of shrinking.

- **Eleven reels went out that way and eleven come back.** The read-only dry run against the live heat-14
  receipts counted **31 reels, 19 verified, 11 deleted at verdict, 11 re-deliveries needed** — a
  re-delivery after deploy, not a re-queue.
- **The mechanism was proved, and it was not the hypothesis.** The guard reproduces the loss on the base
  tree (**1 of 6**) and passes after the cure (**6 of 6**); the KV-index race the master blamed was
  falsified by three separate instruments.

**The Twin Banks crossing holds, and the Fairground wheel gets out of the way.** `e4766971b` landed five of
six owner rulings on play and art.

- **The fords were re-cut and the claim holds four and a half waves longer.** Plain-boot secure wave
  **13 / 13 / 12 → 16 / 19 / 17** (+4.67 mean), 0 console and 0 page errors across all six runs. It took
  five edits, not the two the open-maps report named — the contract, the spec, the fixture, two sim hash
  pins and the null floors.
- **The wheel no longer sits on the rider's view.** Re-declared at the 14-back station like every other
  landmark: persistent HUD coverage **39.1 % → 0.0 %** on desktop and **61.5 % → 54.5 %** on the phone.
- **The Eclipse's thin air is on the record and it can be beaten.** A ported rider secures it at
  **wave 20, 600 s, 140 gold**, the latch taking at 447.6 s on wave 14 in the third window, with **0
  breathless pans**.
- **An agent can read the pressure gauge now.** `now.pressure` is published to riders on both engines,
  contract-scoped, with **no view-version bump** — so nothing a rider already wrote against the view broke.
- **Two prospector coats stand a little taller** — the complainant 220 → 226 px, the gilded 220 → 224 px.
- **One ruling was parked rather than faked.** Waking the Claim Jumper did not read green at the drain
  (10 failed / 27 passed), so it was reverted and the patch kept.

**The county's hour is a real hour, and it holds sixty.** `8dd8c64ac` executed five county and factory
rulings.

- **A rider who asks the book too often used to meet a clock that reset when it pleased.** The hour now
  runs from that rider's own first ask and arms the remainder, and the cap is **30 → 60**, twice what it
  held — with all six doors' signatures and refusal order byte-identical.
- **The front page works out the open claim by itself.** The hand-written rotation id is deleted and the
  weekly edit that went with it is retired — the page derives the ISO-week claim and walks back a week when
  the door does not know one.
- **The copy says five frontier contracts, not six**, and the Low Orbit dispatch is keyed to the board
  being secured rather than to a boss it never had (guard **1/3 → 3/3**).

**Astra's open findings landed, and the honest reading is that the town looks the same.** `a42b7190a` took
the opaque-scenery batching, per-prop camera culling and a diffuse hero pilot.

- **A rider sees the same town at the same speed.** Settled town mode is **unchanged** — 10.2–10.3 ms on
  desktop, 10.4 ms on the phone — and the saving is two or three draw calls on landmarks that were already
  economical. The hero model rode as an unpromoted pilot, so the runtime still draws the sprite heroine.
- **What was banked is the proof and the instrument**, not a speed-up, and the next scenery work reuses both.

**Six of the Claim Jumper's winds are cut and wired, and the county still cannot show him.** `64b1cbca2`
landed the six facings at the measured band and wired them into the character contract — but the slot is
runtime-dormant: it maps to the bandit base, the opening town's payload carries **zero** references to it and
the shipped bundle is unmoved. A second measurement found the eight-wind row **shadows** the four-wind one,
so waking him is two decisions rather than one. The Steam Wrecker's south-east stays parked on numbers.

**The ledger office has an account registry, and its door is shut.** `fdfcab4d0` landed an atomic registry
behind a closed gate — the binding ships commented and its scope unset, so the door behaves byte-identically
to the day before.

**The era seal was re-pinned four times — same era, not a new one.** Pins #12 through #15 (`7c953f873`,
`33eab8ea2`, `896f5c276`, `b996c5527`) append to era 6, each verified by reading its own `cause` field rather
than its subject line. Nothing about the Re-surveyed Claims changed underneath a rider's existing reels.

## Not player-visible

Sixty-four commits across fifteen fire sessions went to the factory's own tools, law and bookkeeping, plus
one map-art pass that shipped no map. None of it is news; it is listed so the day is whole.

- **A map-art run was drained that moved no map.** The campaign's first run is **evidence only** — all 49
  files under `artifacts/`, the engine hash unmoved on both trees, and the report claims zero fixed and zero
  accepted. An open-sea water candidate was built, measured, and reverted, because five of seven gate
  failures reproduced on the exact base with the candidate removed.
- **The guard battery got a watchdog that bounds it instead of hanging.** A TAP-progress watchdog now fails
  the node-guards battery loudly rather than letting one wedged child hold it forever.
- **The county book took its daily offsite copy**, 2026-09-19, and the series reads whole: **27 of 27 days
  present**, 2026-08-24 through 2026-09-19, every key county-standings class and none of it account data.
- **The board was dry both ways for the entire day.** All fifteen fires found nothing to drain — the day's
  work was done by attended sessions, their implementers and Astra's own lane runs.

*Already reported.* Everything above reached the gazette on the day it landed
(`marketing/outbox/gazette-queue.md`): the play rulings and the county rulings as two roundups, the assay
index drop as its own roundup, and the four era pins, the registry, the strips and the map-art pass all
judged there and dismissed with their reasons. The sweep confirms it independently — **407 of 407 player-path
commits cited, 0 candidates**. It is repeated here because a digest reports the day, and this was the day.

---
*Compiled by the s2652 fire. Day boundary `43ae9f92c^`..`2a905928a`. 103 first-parent commits (two
independent methods agree; the bare-date form reads 109), 210 reachable on the day with 28 off-walk
player-path commits all contained and 0 orphaned, 11 player-path on the walk, 555 files changed, 136 on a
player path, 64 commits across 15 fire sessions. No commit message was used to classify anything.*
