# Drain review: `county-board-open-week-1`, the in-game county board reads the open week (Opus 5.5 implementer at max effort; F-LSR1-1)

**Branch** `feat/county-board-open-week-1` at `97ec5b5dd` · **merge** `40c1ee15b` · engine hash #69 `7bfbed8b` · drained attended 2026-09-26 17:52Z in a detached chain worktree with the scratch store at `5793a96`; deployed (scripts/attended/land.sh, config `cbw1`).

**Verdict: LANDED.**

## What it does
Human standings on the weekly seed appeared on no in-game board (F-LSR1-1): the public board kept only rows without a `rotationId` and the transfer board was site-only and verified-solo. Now the public board GET accepts `?rotation=<id>` or `?rotation=open` (shape (a), resolved through `currentOrLatestRotation`, inside the strict parameter arithmetic) and serves that week's rows with party sizes, difficulty, `heldOutFor` and the three counts unchanged; an unknown, unopened or non-carrying week answers 400 `bad_rotation`; the unfiltered all-time board is byte-identical. In the game, County Standings opens a rotation contract on the week a live run rides, labelled from `liveSeedLabel` ("Week 39 claim"), with "All time" one tap away, so a player who secures the week's claim sees their standing where they play. Boot writes nothing; the fetch happens where the board is opened.

## Evidence (the implementer's runs on `97ec5b5dd`, base `be37d83cf`; the drain's own gates are appended below)
| Check | Result |
| --- | --- |
| door table | 15 requests through the old and the new door on one ledger and one clock: 8 byte-identical (the unfiltered board among them), 7 changed, each one the old door refused |
| the in-game board | a secured live run posted to the in-process door (rank 1, `rotationId` r2026w39); the player's own row showed on the board they opened |
| the new spec | 10 of 10 on both projects |
| adjacents | live-seed-rotation, tl-02, task-025, m2-01: 52 of 52 |
| `test:stats` | rc 0, 13 new checks |
| mutants | three planted defects (the door ignores the week; the door admits an unopened week; the reader never names the week) each caught by the right test, files restored byte for byte |
| the door half alone | tsc and the door spec pass at `2a26070e4`; hash unchanged there |
| engine hash | `642edcf6` (pin #66) -> `cc0b2288` on the branch from the board commit on; the landing measures the merged tree; an existing era-6 tape replays identical on base and branch (`fnv1a32:a45ba9ac`, 2 waves, 0 gold, 81.767 s, 2453 ticks); null floors 83 of 83 |
| reds | e2e: 12 board reds (assay-season-roll x2 = F-LC2-13, lb-01 x2, milk x1, transfer-board x1, both projects) and 6 agent-reels town-board rows, every one failing the same assertion on the clean base; node-guards 6 of 1037: the two pre-pin registry rows, the linked-worktree desk guard, ledger-backup-pull x2 and the sweep survivor (no `.env.local` in a worktree) |

## Merge classification
Base `be37d83cf`; the branch touches `functions/api/standings.ts` (the GET partition and its query parsing), `src/encyclopedia/reader.ts` (the board), `src/game/liveSeed.ts` (one export), `scripts/test-stats.mjs`, the new spec, `e2e/assay-season-roll.spec.ts` (one line, the named lift F-CBW1-1), `artifacts/county-board-open-week-1/**`; `git merge-tree` onto main clean. LANE-TOUCHED only. Pinned same-era.

## Findings
- **F-CBW1-1 (lift, resolved):** the default view is now the week, so `assay-season-roll` opens the all-time board before its constant-seed assertion.
- **F-CBW1-4 (by the cure):** the public door document names the `?rotation=` parameter outside the guarded rotations block.
- **F-CBW1-6, F-CBW1-7 (DEFERRED):** regenerate the same-game audit; a week view in the Field Book.
- The master's pointers were wrong about the client (`main.ts:578` is the WATCH reel lookup; the board fetch is `reader.ts:914`) and about the hash ("unchanged": every file under `src/` is an engine input); both corrected during the run.

### Evidence (this drain's gates on the merged tree)
| Check | Result |
| --- | --- |
| tsc / build / e1 | `0 / 0 / 0` |
| strict release build (the assertion) | `(strict, the assertion): rc=0 [release-build] E1-only: 1128 files, 97722583 bytes, zero later manifest ids or plate/GLB assets (checked against 283 later-asset stems)` |
| first-town payload | `34350209 bytes` |
| halo | `rc=0 halo re-extraction PASS: 315 cured, 0 held, 760 regenerated-and-cured, 2127 scanned; alpha and opaqu` |
| null floors | `rc=0 83 of 83 null floors match assets/contracts/null-floors.json (311.2s).` |
| law-pointer | `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 140 ℹ fail 0` |
| the ledger battery | `rc=0 ℹ tests 1263 ℹ pass 1260 ℹ fail 0 ℹ skipped 3` |
| the three functions gates | `accounts rc=0 / mp rc=0 / stats rc=0` |
| the release suite under its own config | `(own config): rc=0   30 passed (2.2m)` |
| e2e both projects, --workers=1 | `rc=0   62 passed (3.8m)  17:35Z` |
| full npm run test:node-guards (before the pin) | `rc=1 ℹ tests 1037 ℹ pass 1030 ℹ fail 2 ℹ skipped 5  17:51Z` |
| engine hash | `merged: 7bfbed8b0c6ecfff4ec3aa9457f74866bcc49c119a242631f2ac9b783a246551 (pinned af0e2d889eb353cef53fc6b4eaa695d4460961d4aea894ee22b544f396041e45)` |
