# Review: ss-10-e9-beats — the Red Fields chapter as data (lane-d, Claude Opus 5 implementer, attended drain 2026-09-06 early)

**Slice/branch/tip:** `ss-10-e9-beats` · `lane/d` · commits `4919d0c79`, `e3a6c6ae2`, `ffb7ca256`, `197dbf249 (archive: pruned by the A3 rewrite)` on base `b9c4146cc` · merged to main at `650c40e2f` (first-parent merge) with beats.ts and StoryRuntime.ts unioned in era order after E7 (`9cbe45b2e`) and E8 (`9ba1c34b6`); era-5 pin `583c7743` measured on the final E7+E8+E9 tree.
**Verdict:** MERGED. E9 joins the human path: 15 attributed beats derived from `lore/STORYBOOK.md` Chapter E9 (lines 529-577): the Dome Basin arrival with the Pan Monument set at the basin rim, the water ledger ("a law about a promise"), the grass square, the greenkeeper, the yearly-number Gazette, Seed Run's planting, Devil's Alley's wind, the Old Canal's verdicts, the first water panned ("the same verb we opened with, nine eras back"), the Digger's correction and its keeping, the obedient-world tavern joke, the crossed-pickaxes Gazette, the first swim, the Generation Ark on the horizon. The swatch law is honoured by silence (`STORYBOOK:532`). Loaded only when `activeEpochId() === 'epoch-9-redfields'`; presentation only.

## What it does
`E9_STORY_BEATS` in `src/story/beats.ts` (15 rows, each citing its storybook line; `artKey` on the five beats whose plates exist, with a spec test asserting each resolves to `assets/raw/<key>.png`) plus one import name and one switch line in `src/story/StoryRuntime.ts`. The Ark hook names the Elder's Tree, the canon spelling (`e3a6c6ae2`). `e2e/ss-10-e9-beats.spec.ts` boots plain (no `?debug`); the alley door is opened the player's way with two secured scoreboard rows through the app's own profile-scoped storage; both negative arms are green.

## Evidence
| Gate | Where | Result |
|---|---|---|
| `npx tsc --noEmit` / `npm run build` | lane | clean / green |
| `e2e/ss-10-e9-beats.spec.ts` | lane, own dev server on port 5304, both projects | 10/10 desktop-chrome + mobile-chrome 390px, run twice (2.4m, then 4.4m on the final tree after the canon fix), zero console/page errors |
| Adjacent `ss-01..ss-07` + `story-loop` | lane, both projects | 59 passed / 7 failed, 15.5m: six are F-2460-2's known set at the identical fingerprint; the seventh (`ss-05:127` mobile) was self-inflicted, vite reloaded `src/story/beats.ts` mid-run at 23:29:51 (Mistake #12, owned by the implementer), re-run alone 2/2 green both projects |
| LEXICON `no-emdash-guard` + `no-emdash-scan-space-guard` | lane | 13/13 over 285 tracked src TS files |
| Engine era | lane hash `af56dbbc462ab7d683c5841380874e33f566886f1128ca1ecbf76c3925694042` (era 5, guard 4/5 by design) | superseded by the merged-tree hash: E7, E8 and E9 share one src re-hash pin appended by the drain (F-SS06-3: measured on the merged tree, never the lane's) |
| Attended on the merged tree | `playwright.s-att-drain.config.ts --workers=1` | the E7 and E9 chapter specs together with the story suites, plus `test:node-guards`: numbers in the drain commit and the ledger row |

Screenshots: `reviews/shots-ss-10-e9-beats/{desktop,mobile}-chrome-{arrival,water-ledger,grass-square,devils-alley-beat,devils-alley-ride}.png` (10 files, 6.3 MB, scaled).

## Merge classification
Base `b9c4146cc`. `src/story/beats.ts`: MAIN-MOVED (E8 at `9ba1c34b6`, then E7 in the same drain pass) and LANE-TOUCHED (a pure append after E6). Resolved by rebuilding the file in era order: main's content through the E8 block, then the lane's E9 block (from its `// Chapter E9` header to before the trailing export), then the trailing `STORY_RUNTIME_BEATS` export: 176 added lines, 0 removed. `src/story/StoryRuntime.ts`: union of import names plus one switch line. `e2e/ss-10-e9-beats.spec.ts`, `reviews/shots-ss-10-e9-beats/*`: NEW. `tasks/BACKLOG.md`: MAIN-MOVED, unioned (the lane's three rows prepended).

## Findings
- **F-SS10-1 (engine gap, non-blocking):** `e9-dome-basin`'s twist declares only `clockTicks` and an `enemyRoster`, no `twist.baron` (`assets/contracts/epoch-9-redfields/contracts.json:179-181`), while `boss-arrival`/`boss-defeat` are emitted from the baron path alone (`src/game/Game.ts:5991`, `:6250`); the Old Digger's four-act reprogramming (`src/systems/OldDiggerBossSystem.ts`) can reach no beat, so the Digger beats ride `run-return-town` gated on an earlier beat (F-SS06-2's construction). Folded into `story-signal-emitters` (in flight tonight).
- **F-SS10-2 (art, non-blocking, same batch as F-SS06-1/F-SS08-1/F-SS09-1):** E9's five named townsfolk (the moon-born child grown, the canal reeve, the greenkeeper, the ice quarry chief, the weather warden) have raw portraits and no processed entry.
- **F-SS10-3 (host, resolved in-run, recorded for the disk ledger):** the data volume hit zero free during the lane's gate and an `ENOSPC` truncated `tasks/BACKLOG.md` to 0 bytes mid-write; the implementer freed its own regenerable `dist/` (372 MB), restored the file from HEAD byte-for-byte (7,903,211 B) and rewrote it atomically. No factory artifact was deleted. The attended session then freed ~75 GB of regenerable build output, traces and its own detached control worktrees; the structural cause (a 14 GB full checkout per parallel worktree, nine worktrees tonight) is on the owner's desk.
