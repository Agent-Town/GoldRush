# Review: preview-unlock-all — "Open every claim" on the town board, preview builds only (scratch worktree, Claude Opus 5 implementer, attended drain 2026-09-06 early)

**Slice/branch/tip:** `preview-unlock-all` · `feat/preview-unlock-all` · commits `9113f8300`, `36d9be81b`, `c7392e313`, `7e38b4790` · merged to main: see the ledger row (first-parent merge; no `src/` collision).
**Verdict:** MERGED. In a plain boot of a preview build the owner can open all 42 contracts and all ten chapters from the town board ("Open every claim" / "Lock the board again"), each opened card tagged "Opened for testing"; the E1 release bundle carries not one byte of it, proven on the built text rather than assumed.

## What it does
`src/meta/ContractUnlock.ts` wraps the byte-identical unlock predicates (moved verbatim into `resolveContractUnlock`) with a per-profile flag `gr.previewUnlockAll.v1`; `src/town/TownScene.ts` renders the control on the board, the testing tag on opened cards, and makes the chapter curtain honour the flag (`:2216`), without which a fresh Frontier profile would see nothing open because the 26 gated contracts never reach the book. The release half: `if (RELEASE_E1) return status` (`ContractUnlock.ts:96`) and `!__GR_RELEASE_E1__ && unlock.preview` (`TownScene.ts:2356`), so the define folds the branch and the minifier drops the literals. `e2e/preview-unlock-all.spec.ts` asserts both arms on both projects: all-eras profile 10 chapters / 42 cards / 17 open → 42 open, 25 tagged → back to 17; fresh Frontier profile 1 chapter / 6 cards / 2 open → 42 open, 40 tagged → back to 6/2. Standings are untouched: `functions/api/standings.ts` never imports `contractUnlockStatus`; the only per-contract admission on submit is `knownContract(epochId, contractId)` (`:788`, defined `:1165`), and the assayer verifies tapes by replay.

## Evidence
| Gate | Where | Result |
|---|---|---|
| `npx tsc --noEmit` / `npm run build` / `GR_RELEASE=e1 npm run build` | worktree | 0 / green 4.07 s / green 3.01 s |
| `e2e/preview-unlock-all.spec.ts` | worktree, own dev server, both projects | 4/4 desktop-chrome (31.4 s) + 4/4 mobile-chrome 390px (5.0 m), zero console/page errors |
| Release proof, text half | `dist/` of the e1 build, 927 text files | all nine preview-only strings absent (`Open every claim`, `Lock the board again`, `preview-unlock-all`, `previewUnlockAll`, `gr.previewUnlockAll.v1`, `Opened for testing`, `contract-testing-tag`, `Testing build`, `Standings are unaffected`); the two control strings that must survive (`Tavern Ledger`, `Awaits the Steamworks era`) present, so the zero is over a readable corpus |
| Release proof, DOM half | `vite preview` on 5318, both projects | board opens, control absent |
| Adjacent `board-gating-and-profiles` + `board-era-chapters` | worktree, both projects | green; six other adjacent reds attributed to load by two matched arms (control with `src/` reverted 7/1 on `contract-briefings:326`; treatment 7/1 on `board-upcoming-surveys:38`, which passed alone in 11.7 s against a 30 s budget): same count, the red moved |
| Engine era | worktree hash `e386bddf6053af1e0287d4f5f5c60d2848fa6889a800c135d56a8ce38b44e8e4` on a pre-story-merge tree | re-measured on the merged tree by the drain and pinned there (presentation and unlock gating only; the sim and every replay byte-identical) |
| Attended on the merged tree | see the drain commit | tsc, build, the slice spec, `board-era-chapters`, the e1 build's text grep repeated, `engine-era-guard` |

Screenshots: `artifacts/preview-unlock-all/*.jpg` (10 frames, 776 KB total).

## Merge classification
`src/meta/ContractUnlock.ts`, `src/town/TownScene.ts`: LANE-TOUCHED (main did not move them since the base). `e2e/preview-unlock-all.spec.ts`, `artifacts/preview-unlock-all/*`: NEW. `tasks/BACKLOG.md`: MAIN-MOVED, unioned. `src/main.ts` and `town.css` untouched (the staged launch has no era gate at `ContractFamilies.ts:1342-1361`; the control rides existing board classes plus inline rules).

## Findings
- **F-UNLOCK-1 (measured, non-blocking):** the open count is 17, not 16: `e2-hill-mine`'s gate is the era predicate `epoch-2-steamworks` (`ContractUnlock.ts:149`), which a last-era profile satisfies without securing anything. Both arms assert the measured numbers.
- **F-UNLOCK-2 (raised, then refuted by its own check):** the worktree's registry looked stale against main's hash; main was already pinned (`ddbd978e0`). Corrected in the ledger row rather than left standing (Mistake #4).
- **F-UNLOCK-3 (lesson, cured here):** the first e1 build leaked two preview strings because the guard was a runtime test; a release-only flag is compiled out because a define folds its branch, not because it is unreachable. Every existing preview surface guarded the first way deserves the same grep: fire-authorable sweep.
- **F-UNLOCK-4 (disclosed, outside the firewall):** `src/assets/AdvanceStream.ts:124` follows board order rather than the player's real frontier while the flag is on; correct for a testing build, invisible in release.
