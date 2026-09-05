# Review: ss-09-e8-beats — the Orbital Frontier chapter as data (lane-c, Claude Opus 5 implementer, attended drain 2026-09-05 night)

**Slice/branch/tip:** `ss-09-e8-beats` · `lane/c` · commits `d09e7bf94 + 5d0df1bf2` on base `eb7529a11` · merged to main at `642f0ae9e` (first-parent merge; beats.ts and StoryRuntime.ts a pure union at the E6/trailing-export seam, no line of any table contested).
**Verdict:** MERGED. E8 joins the human path: 17 attributed beats derived from `lore/STORYBOOK.md` Chapter E8 (lines 470-528, spine :510-:515): the Mare Claim arrival with the dive meter reused as the air meter, the breach drill, LEAVE-LAST, the Pan Monument's first reclaimed water, the pan in regolith, the claw-tag Gazette, the Far Side probe, the Low Orbit yard, the Eclipse, the Baron at the pad, the Claw's descent, the crew's warm-law walk, the mass-driver's first load, the moon-born child's tavern tale, the era's turn, the window-seat Gazette, the Riverward leaving. Loaded only when `activeEpochId() === 'epoch-8-orbital'`; presentation only (the sim, the contracts and every replay byte-identical: the pin below is a src re-hash, same era).

## What it does
`E8_STORY_BEATS` in `src/story/beats.ts` (17 rows, every one with a `lore/STORYBOOK.md:NNN` citation in source; `artKey` on the six beats whose plates exist on disk) plus one import name and one switch line in `src/story/StoryRuntime.ts`. Tavern tales and Gazette headlines ride the same table as ordinary attributed beats, the shape ss-04 set. No speaker added (F-SS09-1). `e2e/ss-09-e8-beats.spec.ts` boots plain (no `?debug`), selects the era through the player's own profile keys, and asserts the six-beat arrival cluster in exact order plus three negative arms (E1's Claim, E3 and the three locked maps load no `e8-` beat before their own card unlocks).

## Evidence
| Gate | Where | Result |
|---|---|---|
| `npx tsc --noEmit` | lane, then the merged tree | clean / clean (empty output) |
| `npm run build` | lane, then the merged tree | green (herald 1,158,214 B under the 1,500,000 B ceiling) / green, asset-diet manifest 412 GLBs 846.1 MB → 122.6 MB |
| `e2e/ss-09-e8-beats.spec.ts` | lane, own port, both projects | 6/6 desktop-chrome (2.4m) + 6/6 mobile-chrome 390px (2.4m), zero console/page errors |
| Adjacent `ss-01..ss-07` + `story-loop` | lane, both projects | 30 passed / 3 failed per project; the three are F-2460-2's known reds (`ss-01:103`, `ss-03:52`, `story-loop:185`), CONTROL-PROVEN by reverting the two src files to the base and reproducing the identical three on both projects |
| Chapter specs together on the merged tree | attended, `playwright.s-att-drain.config.ts --workers=1`, host load ~25 with five implementers riding | 50 cases: 45 passed / 5 failed (19.1m). `ss-09` 12/12, `ss-06` and `ss-07` green; the five reds are `story-loop:185` on both projects (F-2460-2) plus `ss-05:127` desktop, `story-loop:228` mobile and `story-loop:248` mobile, re-run alone at one worker: see the drain commit for the verdict |
| LEXICON `no-emdash-guard` + `no-emdash-scan-space-guard` | lane | 9/9 over 285 tracked src TS files |
| `npm run test:node-guards` | attended, merged tree, `/opt/homebrew/bin/node` v26 | rc=1 with four distinct reds, all previously catalogued as environmental or bookkeeping: the 122-file fixture-teardown budget, the meta-guard's positive control, the contention advisory (five concurrent implementers) and "the live ledger carries no stale READY-FOR-GATES claim", which this drain's ledger flip cures |
| Engine era | lane hash, re-measured on the merged tree | `1052ba1ab016c53d1b6cceff3db4d0859b38ade38f7e07a95a51112ba3c51b81` both times (main's `src/story/**` had not moved since the lane base), pinned as era-5 pin 43 in `assets/engine-era.json` with the top-level `engineHash` updated (F-2460-1) |

Screenshots: `reviews/shots-ss-09-e8-beats/` (8 files, scaled).

## Merge classification
Base `eb7529a11`. `src/story/beats.ts`: LANE-TOUCHED (a pure append after `E6_STORY_BEATS`, before the trailing `STORY_RUNTIME_BEATS` export). `src/story/StoryRuntime.ts`: LANE-TOUCHED (one import name, one switch line after the E5 line). `e2e/ss-09-e8-beats.spec.ts`, `reviews/shots-ss-09-e8-beats/*`: NEW. `tasks/BACKLOG.md`: MAIN-MOVED, unioned (the lane's rows prepended over main's). Nothing else. The E7 (lane/a) and E9 (lane/d) chapters that landed the same night were unioned in era order at the same seam by the attended drain, so the final table order is E2..E9 and the runtime switch carries one line per era.

## Findings
- **F-SS09-1 (art, non-blocking, fire-authorable as one batch for E5–E9):** Chapter E8 names five cast members (the moon-born child, the dome gardener, the launch master, the suit fitter, the He-3 assayer) with raw `assets/raw/tf-*-e8.png` portraits and no `assets/processed/` entry; `src/story/speakers.ts:9-15` requires a processed portrait per speaker id. Voiced through registered speakers and named in the lines, as ss-06/ss-07 did. The Household Law is honoured (the child is never alone).
- **F-SS09-2 (drain instruction, satisfied):** the merged tree was re-hashed rather than trusting the lane's number; both agreed.
- **F-SS09-3 (engine gap, non-blocking):** `src/game/Game.ts:5991` emits one `boss-arrival` per contract with no act discriminator and `SalvageClawBossSystem.ts` emits no story signal, so the Claw's four-act choreography rides two beats on the single arrival plus one on defeat, and a suit-air breach cannot fire a beat. Folded into `story-signal-emitters` (in flight tonight) as the boss-act and breach-signal gap alongside F-SS10-1.
