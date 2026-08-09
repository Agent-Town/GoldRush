# team-and-training — "Team of N" replaces "Posse", and the Drill Yard leaves the ladder

- **Slice:** `tasks/lane-team-and-training.md` (attended-authored 2026-08-09 11:39, `7a564d8ad`)
- **Branch / tip:** `lane/a` @ `8c50f9245` (runner auto-commit, 11:50:36)
- **Base (merge-base):** `7a564d8ad` — the authoring commit itself; the lane was dispatched off a fresh main
- **Merged to main:** `f18879c9ee1bbc1f79439d48cec9b45b4798152d` (s1596 fire)
- **Gated in:** detached worktree `worktrees/gate-s1596` (§3.0b — undecided content never entered main's tree)

## VERDICT: MERGED — green on every gate, firewall respected exactly, one non-blocking finding.

## What it does

Two owner rulings of 2026-08-09, landed together because they touch the same board.

**"Team", not "Posse".** Every player-visible party string in the encyclopedia reader becomes team
language: the size chips read `Team of 2/3/4`, the field-book view filter reads `By team`, the
ranking hint reads "A team is ranked only against teams its own size.", and the empty state reads
"No teams in the field book yet — the door is open." The party-book table caption and its column
header follow. Internal identifiers and the wire format keep `posse`/`party` untouched, which is
what the master allowed and what keeps this churn-free — the only `posse` left anywhere in `src/`
or `functions/` is in comments (plus the substring in "re**posse**ssion" in `worldOutside.ts:78`).

**The Drill Yard is the training ground, so it never ranks.** `functions/api/standings.ts` now
refuses a drill-yard POST with `400 training_ground` and the house-voice message "The Drill Yard is
the training ground — practice is its own reward.", and closes the read paths too: `knownContract`
rejects the id outright and `epochContracts` filters it out of the epoch listing. Reader-side,
`renderStandingsLedger` drops it from the contract chips. The claim stays **fully playable** — only
unranked.

Scope 3 (the board card) correctly landed as **no change, with a citation**: `TownScene.ts:2326`
`renderTrainingGround` already gives the Drill Yard its own "THE TRAINING GROUND" section with
`data-training-ground="true"`, shipped by pc-01c. Verified by reading the file, not by trusting the
report.

## Evidence (merged tree, `worktrees/gate-s1596`, `--workers=1` per §3.1)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean, no output |
| `npm run build` | green, built in 1.16s |
| `test:stats` (functions/ → F-1229-1) | **87** checks passed |
| `test:accounts` (F-1229-1) | **43** checks passed |
| `test:mp` (F-1229-1) | **462** checks passed |
| Own specs — `field-book` + `milk-county-board` | **22/22** passed (20.4s), desktop-chrome + mobile-chrome (390px) |
| Adjacent — `lb-01-county-standings`, `drill-yard`, `drill-yard-manifest` | **24/24** passed (1.1m), both projects |
| Console/page errors | zero in all plain-boot probes (specs collect both via `collectErrors`) |
| Screenshots | 6 in `reviews/shots-team-and-training/` (board + field-book + watch-this-run, desktop & mobile) |

Adjacent suites were **re-derived from the fix's call sites**, not inherited from the master's list:
`grep -rln "county-standings\|field-book\|renderStandings\|partyBook" e2e` gave the reader surfaces,
`grep -rln "drill-yard" e2e` gave the playability surfaces. `lb-01-county-standings` is the one that
would have caught a regression in the chip filter; the drill-yard pair is what proves the claim is
still visible, launchable, resettable and ledger-free after being taken off the ladder.

The refusal itself is covered honestly: `e2e/field-book.spec.ts:67` asserts the `400`, the exact
`training_ground` error and message, that **KV is not written** (`standings:epoch-1-frontier:e1-drill-yard`
is null), and that the **GET path also refuses**. Both halves of scope 2, not just the POST.

## Merge classification

Base `7a564d8ad`; main had moved one commit (`13efef0d4`, this fire's own lock + `logs` churn).

- **LANE-TOUCHED (10 files, all merged):** `src/encyclopedia/reader.ts`, `functions/api/standings.ts`,
  `e2e/field-book.spec.ts`, `e2e/milk-county-board.spec.ts`, and 6 PNGs under
  `reviews/shots-team-and-training/`.
- **MAIN-MOVED-ONLY (3 files, correctly untouched):** `STATUS.md`, `logs/dashboard.html`,
  `logs/task-stats.jsonl`. These appear in the two-dot `main..lane/a` diff as *reversions* of this
  fire's own lock commit — the classic false signal. The three-way `merge --ort` left them at main's
  version; a two-dot copy would have reverted the lock. **Conflicts: none.**

`git show --stat 8c50f9245` confirms the runner touched exactly the firewall's TOUCH-ONLY set and
nothing else — no out-of-scope file, no ranking/scoring logic, no contract JSON, no wire-format
change.

## Findings

**F-1596-1 — NON-BLOCKING (discoverability, not correctness).** The drill-yard refusal coverage is
appended to an existing test whose title is about something else entirely:
`e2e/field-book.spec.ts:67` reads *"optional cost fields group the best score by model and never
change county ranking"*. The assertions are real, thorough and green — but the coverage of an
**owner ruling** is now housed under a title that does not name it, so it is invisible to anyone
grepping test names for "drill yard" and would be deleted silently along with the cost-field test if
that test is ever retired. No corrective task authored: the fix is a one-line `test(...)` split, it
touches nothing but a spec file, and it is cheaper folded into the next task that opens this file
than dispatched as a lane run of its own. Recorded here so the next editor of `field-book.spec.ts`
does the split.

No blocking findings. Nothing owed to the owner.
