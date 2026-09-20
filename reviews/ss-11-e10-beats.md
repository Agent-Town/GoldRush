# Review: ss-11-e10-beats — the Deep Sky chapter as data (lane-c, Claude Opus 5 implementer, attended drain 2026-09-06 early)

**Slice/branch/tip:** `ss-11-e10-beats` · `lane/c` · commits `f94479e43`, `af093d272`, `3f50ec021` on base `65549309e` · merged to main: see the ledger row (first-parent merge; beats.ts and StoryRuntime.ts unioned in era order after E9, the E10 block's three E8 coordinates re-based by +175 in the landing commit as the lane's pointer note predicted).
**Verdict:** MERGED. E10 closes the human path: 19 attributed beats derived from `lore/STORYBOOK.md` Chapter E10 (:584-:622): the Ark boarding ("ten generations of rivalry retired in one boarding queue"), the Elder's Tree seed in the Long Table hall, the one-question intake form, the Baron who stays, the Quack freed, the Ember Shore arrival and its Gazette, the Archive World's empty shelf, the Last Claim's decks, the River's charter ("Go on. It is your claim now."), Chalk's manifest, what you hand on, the portrait that fades, the unraveled board, the three preserves, the starlight pan, the mote in the jar, the wound watch, the Charter Press. **E2–E10 are now all as data beside E1: one runtime switch line per era, the whole saga readable in play.** Loaded only when `activeEpochId() === 'epoch-10-deepsky'`; presentation only.

## What it does
`E10_STORY_BEATS` in `src/story/beats.ts` (19 rows, each with a `// lore/STORYBOOK.md:NNN` citation that a spec arm reads back from the file; 8 `artKey`s verified present under `assets/raw/`) plus one import name and one switch line in `src/story/StoryRuntime.ts`. Copy scanned clean for em-dashes, smart quotes and the cure-arms/ADR-001 vocabulary. `e2e/ss-11-e10-beats.spec.ts` boots plain, selects the era through the player's own profile keys, reaches `e10-last-claim` by seeding the two secured ledger rows its unlock chain requires, and takes one `page.evaluate` snapshot per assertion (hardened against the card auto-dismiss window under load, F-SS11-6). Beats whose play depends on the four Deep Sky engine consumers the contracts still declare missing (F-SS11-3) are marked PROPOSED at their own row; the fiction is cited canon throughout.

## Evidence
| Gate | Where | Result |
|---|---|---|
| `e2e/ss-11-e10-beats.spec.ts` | lane, own dev server on 5303, both projects | 7/7 desktop-chrome + 7/7 mobile-chrome 390px on the final committed tree, zero console/page errors |
| Adjacent `ss-01..ss-07` + `ss-09` + `story-loop` | lane, both projects, in batches | 72 passed / 6 failed; the six are F-2460-2's known set (`ss-01:103`, `ss-03:52`, `story-loop:185`, both projects), CONTROL-PROVEN by reverting the two src files to main; `ss-03:52`'s diff byte-identical to F-2460-1's record (six ceremony ids, zero `e10-` ids) |
| Load reds, attributed | lane | at load average 163, `ss-02:233`, `ss-06:123`, `ss-07:123` failed on the 6 s card auto-dismiss window (`CARD_MS`, `src/story/StoryRuntime.ts:10`); all green at lower load (3/3, then 15/15 in the batch) |
| LEXICON guards / tsc / build | lane | 9/9 / clean / green (herald 1,158,214 B under ceiling) |
| Engine era | lane hash `45b677333d8ae2c02e8e4875a976b52162c669ec1510fe170e9b31d20a0fcbb7` on the pre-E7/E9 tree | superseded by the merged-tree hash, pinned by the drain (same era per F-1441-3) |
| Attended on the merged tree | see the drain commit and the ledger row | tsc (before and after the coordinate re-base), era pin, build, `ss-11` + `ss-10` + `story-loop` at one worker on both projects |

Screenshots: `reviews/shots-ss-11-e10-beats/{desktop,mobile}-chrome-{boarding,baron-stays,last-claim-decks,last-claim-ride}.png` (8, 3.5 MB).

## Merge classification
Base `65549309e` (E8 on main, E7/E9 not yet). `src/story/beats.ts`: MAIN-MOVED (E7 at `9cbe45b2e`, E9 at `650c40e2f`) and LANE-TOUCHED (a pure append after E8). Resolved by rebuilding the file: main's content up to the trailing `STORY_RUNTIME_BEATS` export + the lane's E10 block (240 lines, from its `// Chapter E10` header) + the export; every `export const E[2-9|10]_STORY_BEATS` exactly once and ascending. The block header's E8 coordinates re-based (+175) and its pointer note retired into a landed note in the same commit. `src/story/StoryRuntime.ts`: union of import names (E3..E10) plus one switch line after E9 (8 switch lines). `e2e/ss-11-e10-beats.spec.ts`, `reviews/shots-ss-11-e10-beats/*`: NEW. `tasks/BACKLOG.md`: MAIN-MOVED, unioned.

## Findings
- **F-SS11-1 (engine gap, non-blocking):** THE QUIET is a boss in `lore/STORYBOOK.md:609-613`, but no `epoch-10-deepsky` contract carries a `twist.baron`, and `boss-arrival`/`boss-defeat` are emitted only when one does (`src/game/Game.ts:5987-5991`, `:6250`). Its acts ride `contract-unlocked` and a `hasStoryBeatSeen` chain on `run-return-town`; a spec arm asserts a `boss-arrival` for `e10-last-claim` yields zero E10 beats. Same cure as F-SS09-3/F-SS10-1: the `boss-act-signals` slice.
- **F-SS11-2 (superseded the same night):** `wave-complete` was a dead trigger when this lane measured it; `story-signal-emitters` (`ac8656080`) landed its emitter before this merge, so the E1 beat at `src/story/beats.ts:70` now fires.
- **F-SS11-3 (non-blocking, pre-existing):** all four Deep Sky contracts still declare a missing engine consumer (`ember-shore-preserve-consumers`, `archive-world-consumers`, `last-claim-finale-metadata-consumer`, `credits-river-consumer`); the E10S ladder owns them.
- **F-SS11-4 (art, same batch as F-SS06-1..F-SS10-2):** the chapter names the heir, the Baron, the Old Digger, the Quack, Chalk, the Charter-Keeper and the child; `assets/processed/` holds no E10 portrait. Voiced through registered speakers.
- **F-SS11-5 / F-SS11-6:** the three standing story reds and the load class, both attributed above.
- **F-SS11-7 (pointer rot, cured in the landing commit as predicted):** the lane's block header cited E8 at its own coordinates; re-based by exactly +175, measured by grep on the merged file.
