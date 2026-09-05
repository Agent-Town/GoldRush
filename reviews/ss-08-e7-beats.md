# Review: ss-08-e7-beats — the Signal Era chapter as data (lane-a, Claude Opus 5 implementer, attended drain 2026-09-06 early)

**Slice/branch/tip:** `ss-08-e7-beats` · `lane/a` · commits `9420eb1b6 + e02d6a035` on base `eb7529a11` · merged to main at `1a259941f` (first-parent merge) with beats.ts and StoryRuntime.ts unioned in era order beside E8 (already on main) and E9 (lane/d, merged next at `53ad974d7`); era-5 pin `583c7743` measured on the final E7+E8+E9 tree.
**Verdict:** MERGED. E7 joins the human path: 15 attributed beats derived from `lore/STORYBOOK.md` Chapter E7 (lines 397-469, spine :448-:453): the relay-valley arrival under MORE VOICES, the Exchange's wrong number, Chalk's first filing (canon per `lore/characters.md:14`, owner ruling #13), the playbook library's tape 001, the Gazette's new hands, the mission-sent column, Echo Canyon's mirror, the Dead Band's quiet, Relay Rush's front, the Echo's arrival and its defeat ("only the moves that were on no tape at all"), the tavern that does not hang up, the recall COME HOME, the mispronounced Gazette, the starship countdown. Loaded only when `activeEpochId() === 'epoch-7-signal'`; presentation only.

## What it does
`E7_STORY_BEATS` in `src/story/beats.ts` (15 rows, each citing its storybook line in source; six `artKey`s, every one verified present under `assets/raw/`) plus one import name and one switch line in `src/story/StoryRuntime.ts`. The jack-board's own fragment strings (`src/systems/E7SignalSystem.ts:57-94`) are deliberately not restated: the beats are the town's voice around the same events and the HUD panel keeps its copy as the single source. `e2e/ss-08-e7-beats.spec.ts` boots plain (no `?debug`), selects the era through the profile keys a player's own town selection writes, walks to the tavern, opens the board, and asserts the arrival card over the "CHAPTER 7 · Signal Era" ledger page with the Prospector portrait; the implementer opened the PNG rather than trusting the assertion.

## Evidence
| Gate | Where | Result |
|---|---|---|
| `npx tsc --noEmit` | lane (re-run on the committed tree), then the merged tree | clean / see the drain commit |
| `npm run build` | lane | green, 8.89s; herald 1,158,214 B under the 1,500,000 B ceiling |
| `e2e/ss-08-e7-beats.spec.ts` | lane, own dev server on port 5301, both projects | 10/10 desktop-chrome + mobile-chrome 390px, 2.8m, zero console/page errors |
| Adjacent `ss-01..ss-07` + `story-loop` | lane, both projects | 60 passed / 6 failed, 14.4m; the six are F-2460-2's known set (`ss-01:103`, `ss-03:52`, `story-loop:185`, both projects), CONTROL-PROVEN by reverting only the two src files to main and reproducing the identical six at the identical lines |
| LEXICON `no-emdash-guard` + `no-emdash-scan-space-guard` | lane | 9/9 over 285 tracked src TS files |
| Engine era | lane hash `1ea7622fc395460768b65321d7da856a5aa33260e84116643bdf874abdef581c` (era 5, guard 4/5 by design) | superseded by the merged-tree hash: E7, E8 and E9 share one src re-hash pin appended by the drain, same era per F-1441-3 |
| Attended on the merged tree | `playwright.s-att-drain.config.ts --workers=1` | the E7 and E9 chapter specs together with the story suites, plus `test:node-guards`: numbers in the drain commit and the ledger row |

Screenshots: `reviews/shots-ss-08-e7-beats/{desktop,mobile}-chrome-{arrival,wrong-number,chalk,relay-valley-ride}.png` (8 files, 4.2 MB, scaled to 900px).

## Merge classification
Base `eb7529a11`. `src/story/beats.ts`: MAIN-MOVED (E8 landed at `642f0ae9e` after this lane's base) and LANE-TOUCHED (a pure append after E6). Resolved by rebuilding the file: main's content up to the `// Chapter E8` header, then the lane's E7 block (from its `// Chapter E7` header to before the trailing export), then main's E8 block, then the trailing `STORY_RUNTIME_BEATS` export: 175 added lines, 0 removed. `src/story/StoryRuntime.ts`: MAIN-MOVED + LANE-TOUCHED, resolved as the union of import names and one switch line per era. `e2e/ss-08-e7-beats.spec.ts`, `reviews/shots-ss-08-e7-beats/*`: NEW. `tasks/BACKLOG.md`: MAIN-MOVED, unioned (the lane's row prepended).

## Findings
- **F-SS08-1 (art, non-blocking, fire-authorable as one batch for E5–E9):** `lore/STORYBOOK.md:421-425` names six E7 cast members (Chalk, the switchboard chief, the playbook librarian, the drone keeper, the tape courier kid, the Combine defector); their raw portraits exist under `assets/raw/tf-*-e7.png` with no `assets/processed/` entry, and `src/story/speakers.ts:10-16` resolves portraits from the processed set. Voiced through registered speakers and named in the lines. Same class as F-SS07-2 and F-SS06-1.
- **F-SS08-2 (canon, non-blocking):** `lore/STORYBOOK.md:421` still prints CHALK as "(PROPOSAL, canon-shaped)" while `lore/characters.md:14` carries the owner's ruling #13 (2026-07-18) making it CANON. Treated as canon, both files cited in the beat's comment; a one-line supersession in the storybook closes the gap (lore edit, attended or fire).
- **No signal gap in this chapter:** all four triggers used are live emitters (`contract-unlocked` `src/town/TownScene.ts:2572`, `run-return-town` `:2583`, `boss-defeat` `src/game/Game.ts:6250`, `science-complete` `:9518`, `boss-arrival` `:5991`); the Echo's contract binding is `src/game/Game.ts:832`.
