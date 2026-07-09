# Night drain 2026-07-10 — six owner-evening tasks, three lanes, one battery
Drained by the attended night shift (owner order ~00:13: "make sure the pipe is ready and filled for the night"). Merges: `02f715a` (lane/m4) · `a0bdc48` (lane/polish) · `353730c` (lane/m3) · reconciliation `6894d82`.

## Slices shipped
| Task | Lane | What the player gets |
|---|---|---|
| 059 contract-catalog | m4 | Board = one page per contract, art-keyed, page nav + swipe, dup-description bug dead, MYSTERY LAW (locked pages tease, never spec) |
| 061 first-claim-onboarding | m4 | First-run greeting bark + glowing trail to the tavern + launch pulse; self-erases after first launch |
| 064 river-continues | polish | The Claim's river flows past both edges + recedes into the distance (render-only, zones asserted identical) |
| 065 shots-follow-terrain | polish | Weapon fire originates/travels/impacts at terrain height like actors do (render-only, hash-identical) |
| 060 research-chart-visual | m3 | Survey Chart: node icons (game-connected registry), air, survey-line grammar, SURVEYED stamps + UNLOCK REVEAL cards |
| 063 claim-ledger-voice | m3 | In-world facts only (no citations/batch numbers — asserted by e2e), every character has a QUOTE in voice |

## Evidence
- Merged-tree `tsc --noEmit` CLEAN · `vite build` green (302ms).
- Battery: **46/46 PASSED** desktop-chrome + mobile-chrome, `--workers=1`, 3.6m — specs: 061 + 064 + 065 + research-chart + town-t3-board (059's home incl. catalog nav/swipe/mystery) + en-01 + en-02 (063 regression) + m1-01 + m2-01.
- Screenshots: `artifacts/059|060|061|064|065/` (landed with the lane merges).

## Merge classification + conflicts
- Base: runner branches cut from recent main; auto-merge except: artifacts/ both-added screenshots ×3 lanes (resolved --theirs = lane's evidence) and **src/main.ts + src/town/TownScene.ts (lane/m4 vs main's 062)**: additive-both — kept both sides (PerformanceTier import, ledger discovery call), deduped a double `markFirstClaimDone`, dropped lane's vestigial `runReturnTarget` conditional (062's unconditional always-return-to-town subsumes it; town-t3-board:246 "post-run overrun returns straight to the town board" is the proof it holds).
- F-nightdrain-1 (non-blocking): the three lane branches are now content-merged safe-dupes — next refill resets are loss-free.

## Deploy
Per DEPLOY LAW (user-facing merges): deployed after this review — see commit trailer.
