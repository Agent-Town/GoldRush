# Review: board-tape-gold — one gold number per standing (lane-b worktree, Claude Opus 5 implementer, attended drain 2026-09-06 morning)

**Slice/branch/tip:** `board-tape-gold` · `fix/board-tape-gold` · commit `cfc5a79a5` on base `0a120edd3` · merged to main: see the ledger row (first-parent merge; the collisions were the ledger, `functions/api/standings.ts` and `scripts/test-standings.mjs` beside the lineage slice, resolved by the drain).
**Verdict:** MERGED. The board's gold and the tape's gold were never the same quantity: the tape declares the purse HELD at the secure tick (`HeadlessContractSim.ts:2016`, inside the event-log hash), the assayer's snapshot reported lifetime PANNED at the secure tick (`summarizeLog(...).panned`, never decremented), and the door assigned the snapshot over the row (`standings.ts:306`). Cured at both ends: the snapshot is the held purse at the secure tick, rounded to the same ms grain as the declared score, and the verdict path can no longer overwrite a rider's score silently: when the secure tick is the terminal tick the golds must agree, else `assay: rejected` with `assayReason: score_mismatch`.

## The diagnosis, by replay
| reel | declared | held @ secure | panned @ secure | snapshot before → after |
|---|---|---|---|---|
| `e8-mare-claim` | 60 | 60 | 1180 | 1180 → 60 |
| `e3-moth-season` | 200 | 200 | 530 | 530 → 200 |
| `e7-relay-rush` | 200 | 200 | 870 | 870 → 200 (its live row is `pending`, never assayed: F-HEAT12-4) |
| `e7-echo-canyon` | 200 | 200 | 870 | 870 → 200 |
Every reel banks at the secure tick, so the secure tick is the terminal tick and "end of run" / "end of overtime" are not separate columns; all four replays reproduce their own hash before and after (hash-neutral). One mechanism, one direction. The meaning is forced, not chosen: `outcome().gold` is inside the hash, so a tape could never be taught to declare panning without moving every pinned hash; held can be the agreed number.

## Evidence
| Gate | Where | Result |
|---|---|---|
| `scripts/test-standings.mjs` | worktree, both arms | 264/264 (was 249; +15 arms), proven to bite (with the comparator stubbed it fails expecting `rejected` / `score_mismatch`) |
| New guard `scripts/board-tape-gold.test.mjs` | worktree, in `test:node-guards` | 3/3 (94 s), carrying the pre-cure panned figure per fixture as a non-vacuity control |
| `assay-replay.test.mjs` + `assay-worker.test.mjs` | worktree | 16/16 (one overtime pin moved from the old meaning, 290 panned, to the held purse, 6, with a dated note) |
| Guards | worktree | `view-schema-guard`, `law-pointer-guard`, `same-game-audit`, `skillmd-guard` 44/44 |
| tsc / build | worktree | clean / green |
| Standings e2e, 16 specs × 2 projects | worktree, own dev server on 5302 | 114 passed / 26 failed, the 26 byte-identically red with every change reverted (a control run on the same server): pre-existing; the red inventory's snapshot is 25 days stale, so the control is the evidence |
| Engine era | worktree hash `fa66513d…` (src/sim moved) | re-measured on the merged tree by the drain and pinned there |
| Attended on the merged tree | see the drain commit and the ledger row | `test-standings` both arms, `test:stats`, `test:accounts`, `test:mp`, the new guard, tsc, build |

## Merge classification
Base `0a120edd3`. `src/sim/HeadlessContractSim.ts`, `functions/api/standings.ts`, `functions/api/refusals.ts`, `scripts/test-standings.mjs`, `scripts/assay-replay.test.mjs`, `package.json`, `docs/assay-worker-runbook.md`: LANE-TOUCHED (the door file and the test file also touched by the lineage slice merged just before: unioned by the drain, both slices' checks kept). `scripts/board-tape-gold.test.mjs`, `artifacts/board-tape-gold/*`: NEW. `tasks/BACKLOG.md`: MAIN-MOVED, unioned.

## Findings
- **F-2464-4 (OPEN, the next slice):** the two doors still mean different things by `score.gold`: the browser submits `economySummary.panned` (`src/game/Game.ts:7133`, also `:7527`, `:1825`, `RunManager.ts:312`) and its instrument verifies panned (`scripts/assay-replay.mjs:93`), while the headless door submits and verifies the held purse. Each door is internally consistent, so the comparator is green for both, but after this cure agent rows publish held and human rows publish panned: unfair on a mixed board. `tasks/browser-door-held-gold.md` authored by the drain.
- **F-2464-1 (reported, left):** `public/skill.md`'s standings prose has no generator; the sentence it wants is "the board's gold is the purse held at the secure tick; a run that rides past the secure publishes the secure-tick purse, not the end-of-overtime one". Added by the drain as prose (it is not inside the generated block).
- **F-2464-5:** `artifacts/gauntlet-heat12-20260905/matrix.md` cites relay-rush where echo-canyon was the assayed 870 row, and cites `fnv1a32:ed5dc794` for relay-rush where the reel hashes `d381ebe2`; both reels pan 870 and hold 200. Left as history with this note.
- **What a re-assay would print:** mare-claim 1180 → 60, moth-season 530 → 200, echo-canyon 870 → 200 (the lineage sweep after deploy re-assays Moth Season; the other two rows keep their old snapshot until re-assayed; the desk row says so).
