# Drain review: `charter-press-locked-lands-1`, the Charter Press lever offers only unlocked lands (Opus 5.5 implementer at max effort; F-1179-4 (a))

**Branch** `feat/charter-press-locked-lands-1` at `867cd8f6a` · **merge** `f9f4c0d23` · engine hash #68 `af0e2d88` · drained attended 2026-09-26 15:40Z in a detached chain worktree with the scratch store at `5793a96`; deployed (scripts/attended/land.sh, config `cpl1`).

**Verdict: LANDED.**

## What it does
The Charter Press lever used to render all five land cards regardless of what the player had unlocked, and a press on a locked land (Twin Banks on a fresh profile) opened a URL naming that land while the boot cleared the launch as staged-contract-locked and briefed the Claim instead (F-1179-4). Now the lever builds its cards when the player opens it and keeps only the lands whose contract `contractUnlockStatus` reports unlocked: a fresh profile sees the Claim alone, preselected, and it opens "The Claim: Defend the Camp"; a profile with a secured Claim sees the Claim, the Dry Gulch and Twin Banks, and Twin Banks opens "Twin Banks: Defend the Camp" with the launch kept; the preview seam still offers all five. Boot renders no cards and fetches no land images. `LeverTemplates.ts` and the unlock predicate are untouched; the copy is unchanged.

## Evidence (the implementer's runs on `867cd8f6a`, base `6cf158c4a`; the drain's own gates are appended below)
| Check | Result |
| --- | --- |
| the probe, both arms, both projects | base: 5 cards on a fresh profile, Twin Banks briefs the Claim; branch: 1 card fresh, 3 with a secured Claim, Twin Banks opens Twin Banks; 0 console/page errors in every row |
| boot | 0 cards in the DOM and 0 land images fetched before the lever opens (base 5 and 5) |
| tsc, build, E1 release build, assert-release-build | all rc 0 (no lever strings in the E1 dist) |
| the three named specs with the new rows | ap16-7 2/2, charter-press-totality 10/10, cp01 20/20; the three new rows and the reworked cp04 assertion fail on base (they catch the defect) |
| adjacents | task-025 10/10, m2-01 14/14 |
| e2e across 13 files | 136 of 158; every red matched row for row on a detached base worktree: cp04's seven seeded boots x2 (F-1179-3, F-CPL1-3), wd04 `:33` x2, cp03 `:64` x2 and press-edit-visibility `:75` x2 (F-CPL1-2), ed-01 `:52` x2 |
| node-guards | 1026 of 1037; the two pre-pin registry rows (cured by the pin), ledger-backup-pull x2 and desk-declaration (scratch worktree without `.env.local`, linked worktree), the sweep's one survivor (identical on both arms) |
| engine hash | `642edcf6` (pin #66) -> `f8b1c19a…`; exactly one of 662 inputs differs, `src/charter/PressPanel.ts`; the heat-15 probe tape replays byte-identical on both arms (`fnv1a32:b131e18e`, secured, 10 waves, 335 gold, 300 s) |

## Merge classification
Base `6cf158c4a`; the branch touches `src/charter/PressPanel.ts`, `e2e/charter-press-totality.spec.ts`, `e2e/charter-press.rig.ts`, `e2e/cp04-lever.spec.ts` (the named lift, its own commit), `artifacts/charter-press-locked-lands-1/**`; main moved on none of them. LANE-TOUCHED only. Pinned same-era.

## Findings
- **F-CPL1-1 (lift, resolved):** none of the three named specs rendered the lever; the five-card assertion lived at `e2e/cp04-lever.spec.ts:73` and asserted the defect; re-expressed (one card fresh, five through the preview seam) under a named lift, its own commit.
- **F-CPL1-2 (OWNER'S DESK, by the cure):** the Full Press shelf's Launch of a locked charter also opens the Claim; the same fork on another surface; recommended: refuse with an honest line.
- **F-CPL1-3 (DEFERRED, F-1179-3's successor):** cp04's seven hand-staged locked-land boots need their unlocks seeded per row; red on main today.
- **F-CPL1-4 (inferred, not run):** a debug `epoch=` editor URL can make the offer and the boot's check read different eras; for whoever next touches the unlock predicate.

### E2E attribution (drain, 2026-09-26 14:50Z)
The landing's e2e gate (six specs, both projects) ran 82 rows: 68 passed, 14 failed, all fourteen `e2e/cp04-lever.spec.ts:173:3 › seeded boot <land>/<story>/<visitors> starts clean` (seven hand-staged locked-land boots x two projects). The implementer's detached base control (`6cf158c4a`) showed the same fourteen rows red with the same values (F-1179-3: the specs hand-stage a locked land's charter and the boot's re-check clears it; F-CPL1-3 records the successor task). Not the lever's path and not this slice's. The config's allowance named line 92 by a misread of the report; corrected to `:173:` and the verdict recomputed by the lib.

### Evidence (this drain's gates on the merged tree)
| Check | Result |
| --- | --- |
| tsc / build / e1 | `0 / 0 / 0` |
| strict release build (the assertion) | `(strict, the assertion): rc=0 [release-build] E1-only: 1127 files, 97717484 bytes, zero later manifest ids or plate/GLB assets (checked against 283 later-asset stems)` |
| first-town payload | `34352207 bytes` |
| halo | `rc=0 halo re-extraction PASS: 315 cured, 0 held, 760 regenerated-and-cured, 2127 scanned; alpha and opaqu` |
| null floors | `rc=0 83 of 83 null floors match assets/contracts/null-floors.json (289.5s).` |
| law-pointer | `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 137 ℹ fail 0` |
| the ledger battery | `rc=0 ℹ tests 1263 ℹ pass 1260 ℹ fail 0 ℹ skipped 3` |
| the release suite under its own config | `(own config): rc=0   30 passed (2.2m)` |
| e2e both projects, --workers=1 | `rc=1   14 failed   68 passed (5.7m)  14:25Z` |
| full npm run test:node-guards (before the pin) | `rc=1 ℹ tests 1037 ℹ pass 1030 ℹ fail 2 ℹ skipped 5  14:42Z` |
| engine hash | `merged: f8b1c19ab5864e48f695ed5885cc9eb627d9ed890a846c90aa6c112b1929f049 (pinned 642edcf65fcab2089164c6f33cfabf4a1a9805735a3b6df6f33dfa947cb6a32a)` |
