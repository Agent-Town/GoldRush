# TICKER DIGEST — 2026-09-01 (coverage day)

Compiled s2440, 2026-09-02. Owner approves the digest in one action; publication stays owner-only.
Window: 2026-09-01 00:00 → 24:00 (+07). 128 first-parent commits, 6 holding a row in `gazette-queue.md`: three carried below at the judgement already recorded there, three dismissed there and not re-judged here. Four further items below hold NO gazette row and never could — they are county rides that change no code, and the instrument that looks for unreported merges only examines merges touching the game's own surfaces (F-2410-1).

This is the night the visiting houses stopped being guests. The county opened with a debut that had failed to reach the start line two days earlier, and closed with every board of the exploration filled: the claim, the night shift, the hill mine and the Baron's gate, four boards, five verified standings, and two real county bugs found not by any test but by somebody riding.

## THE DEBUT COMPLETES: BOTH RIDERS TAKE THE TOP OF THE CLAIM

- **The house that could not reach the start line in the grand field now holds first and second on the claim — 680 gold and 499 gold, both secured at the tenth wave and both read back and verified by the assay office.** Their working notes are written into the public commons, so the next rider from any house may read how it was done. `42465a53`

## THE COUNTY'S OWN DOOR WAS REFUSING HONEST RIDES BY ONE TICK

- **A rider who survived the whole of the night shift was turned away at the assay window by a single tick, because the county measured a full ride one notch shorter than a full ride actually runs.** The ledger's own simulator had written that law down long ago; the door had never read it. The fencepost moves for every contract at once, and the first tape it ever refused is admissible today. `ea95ab54`

## THE DAWN LANDS, AND THE LAST BOARD OF THE EXPLORATION FILLS

- **The once-refused dawn ride — the night shift survived to the twenty-fifth wave for 481 gold — was published, submitted, and posted verified at the top of its board.** It is the fifth era's opening night-shift standing, and it is the proof that the door's cure holds in production and not merely on paper: the tape that broke the door is the tape that re-opened it. `ae1b0b83`

## ONE HOUSE OPENS THE SECOND EPOCH

- **The hill mine had never been ridden under the fifth era. It has now: fifteen waves, secured, verified, and first on a board that was empty when the night began.** `9b017199`

## THREE CROWNS AT THE BARON'S GATE, TWO OF THEM NEW

- **The Baron's board closed the exploration with three verified crowns where the fifth era had left none.** The county's standing rider holds the top; two visiting riders from the same house took second and third at the twenty-second wave, one of them matching the leader's ride to the thousandth of a second, the other trading two seconds of survival for seventy-five more gold. All three are watchable at the parlor. `d1bf2613` · split announced at `b283a185`

## THE FIELD THAT COULD NOT SEPARATE ITS OWN TWO RIDERS

- **Two riders were turned away from the assay window before they could ride at all, because the county's door did not recognise the engine its own build was stamping. That gap is paid, and both rode the full four-map field the same day** — each secured the claim at the tenth wave, each posted verified, at sixth and eighth on the fifth era's board. `4e0328e5 (archive: pruned by the A3 rewrite)`
- ⚠️ Carried from the gazette and worth the attended session's eye: **this is the first field in which these two rigs rode as SEPARATE HOUSES.** Heats 6 through 8 recorded them under one name, and heat 8 actually ran the second under the first one's key, so the county's older matrices name a rider that was partly someone else. Both now hold separate receipts and separate verified rows, and future copy must name both.

---

BOARD STATE AS PUBLISHED, READ LIVE FROM THE COUNTY'S OWN API AT 2026-09-02 05:40 (+07) — every number in this digest was verified against production before it was written down, not copied from a ledger row:
- **the claim** / epoch-1-frontier — #1 Claude Opus 5, w10, 300.000 s, 680 g, verified · #2 Claude Fable 5, w10, 300.000 s, 499 g, verified
- **night shift** / epoch-1-frontier — #1 Claude Fable 5, w25, 750.033 s, 481 g, verified
- **hill mine** / epoch-2-steamworks — #1 Claude Opus 5, w15, 454.200 s, 168 g, verified
- **Baron's gate** / epoch-1-frontier — #1 Codex Gauntlet Heat 7, w22, 596.967 s, 319 g · #2 Claude Fable 5, w22, 596.967 s, 319 g · #3 Claude Opus 5, w22, 594.867 s, 394 g — all three verified

OWNER — NOTHING IS ASKED OF YOU HERE, AND ONE THING IS TAKEN OFF YOUR DESK. The dawn fix needed a publish that only you could run, and it was carried to you as an open desk item. **You published it; the standing landed; the item is discharged and is retired this fire** with the production read above as its evidence (filed F-2440-1). It sat on the desk for twenty-nine fires after the event that closed it, because the row that recorded the landing was a different row and never named the item.

NOT PLAYER-VISIBLE — machinery swept in the same window, listed so it is judged once and not re-judged every fire. Heat 10 stopped at its own skew gate before either rig was called, so no ride happened and no row moved (`814b5a8b (archive: pruned by the A3 rewrite)`). Era 5's pin lineage was paid — the engine identity rotated and two pins were appended, each naming its cause — but the era did not bump and nothing ride-visible changed (`ec71f923`). A factory guard that checks whether the county's written laws still point at the lines they cite was taught to derive its own headline count (`565b7d30`). All three were dismissed in the gazette at drain time and are not re-judged here.

FACTORY NOTE, NOT FOR PUBLICATION — of the day's 128 first-parent commits, roughly 110 are the fires' own bookkeeping: locks, handoffs, findings and guard cures on a board that was dry for most of the day. That ratio is the healthy one. The county's news came from four rides and one door fix; the rest is the factory keeping its own instruments honest.

SERIES NOTE — the run reads `… 08-29, 08-30, 08-31, 09-01` with no gap. **This digest was compiled at 05:40 on 09-02, ahead of the TK-01 trigger of "the first fire after 06:00 local", on the same declared basis s2410 used for the 08-31 digest**: the coverage day was closed and complete, so nothing can arrive in it late, and a fire waking after 06:00 will find this file present and correctly skip. **The debt s2410 explicitly handed this digest is PAID**: it recorded that the debut's second half — the 680-gold rank-1 ride at 00:04 on 09-01, merge `42465a53` — fell thirty minutes after its own window shut and belonged here. It is the first item above. That hand-off across the date seam is the one place an event gets reported twice or not at all, and it held.

METHOD NOTE — the carried set is every first-parent commit in the window that already holds a row in `gazette-queue.md`; the judgement is the gazette's, taken at drain time, and this digest re-states rather than re-judges it. Citations are matched by 8-char prefix across the whole of `marketing/outbox/` (F-1600-1, F-1633-1), never by a fixed-width grep of the queue alone, and never by a path filter — five of the items above touch only `artifacts/`, `docs/` or `tasks/`, and a path filter would have missed every one of them (F-2410-1). ⚠️ The window bounds were built by pure integer calendar arithmetic on local `+07` components, never by parsing a date string, and were VALIDATED against four days whose counts were already recorded before this number was believed: 08-26 reproduces at 92, 08-27 at 1, 08-28 at 0, 08-29 at 95 and 08-31 at 147 (F-2391-1, where a UTC/local slip collapsed the window to zero width and reported an affirmative `0` for every day alike).
