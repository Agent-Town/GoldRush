# Review: ss-07-e6-beats — the Atomic Homestead chapter as data (lane-d, Claude Opus 5 implementer, attended drain 2026-09-05)

**Slice/branch/tip:** `ss-07-e6-beats` · `lane/d` · commits `0b6e3f5d9` + `ffdd75aad` over `ae5332094` · merge `8788bc5f5` (no-ff; the E6 merge repaired beats.ts by hand: both chapters had appended before the same trailing export and git aligned their identical structural lines as context — base + E4 block + E6 block + one trailing export).
**Verdict:** MERGED. E6, the lore keystone where agents begin (ADR-003), joins the human path: 12 beats loaded when the active epoch is `epoch-6-atomic`, each citing `lore/STORYBOOK.md` (lines 324–379 and ADR-003), tavern tales and Gazette headlines in the single-table shape, three `artKey`s verified on disk, the cast named inside the lines because the chapter's five new townsfolk have no processed portraits (F-SS07-2).

## Evidence
| Gate | Result |
|---|---|
| `e2e/ss-07-e6-beats.spec.ts` (runner, own port 5304, plain boot) | 10/10 desktop + 390px, zero console/page errors; negative arms: E1's Claim and an E3 town load no `e6-` beat; the boss/return chain fires only on its own triggers |
| Adjacent `ss-01`..`ss-04` + `story-loop` | 32/38 — the same six reds reproduce on a reverted-src control (F-2460-2), none caused here |
| tsc / build / emdash guards | 0 / green / 9/9; a relevant-guard batch 54/55 (the one red is the era pin) |
| `npm run test:node-guards` | NOT run by the runner: the whole-process abort signature (`Promise resolution is still pending…`) at host load 40 while the survey's memory probe, several Chromium instances and an assay replay were live; the drain owes it (F-SS07-1) |
| Attended on the merged tree | see the drain commit message |
Screenshots: `reviews/shots-ss-07-e6-beats/{desktop,mobile}-chrome-{arrival,steward,mesa-ride}.png` (3.1 MB).

## Findings
- **F-SS07-2 (art, fire-authorable):** `lore/STORYBOOK.md:341-345` names five E6 townsfolk; `assets/raw/tf-*-e6.png` exist but `assets/processed/` has no `tf-*-e6` entry and `src/story/speakers.ts:9-15` resolves portraits from `assets/processed/`, so a chapter speaker id would render broken art. An art-processing slice (extract + wire) unlocks real speaker ids for the steward, the wrangler and the defector.
- **Method:** the runner's first spec run failed its own trigger-chain arm because its helper read the empty `active()` inside the 3 s `GAP_MS` window (`StoryRuntime.ts:123`); fixed by polling across the gap. Worth a helper in the story spec toolkit.
