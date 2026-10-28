# s3407 fire — dry board and current heartbeat duties

WHY no product landing: no eligible or unknown drain, no unabsorbed lane content, no new failure or pending crafting order. CODEX-WALL remains in force. No product finding was created.

READY-FOR-GATES for bookkeeping closeout.

| Check | Measured result | Evidence |
| --- | --- | --- |
| Board | 95 subjects: 82 merged, 13 closed/blocked, 0 eligible/unknown | dry-board.txt |
| Lanes | Four empty main..branch histories; zero tracked dirt; five registered worktrees, zero unreported ahead | lane-usable.txt, duties.json |
| Queue and failures | Six empty queues; no running task or pending order; 118 historical failures, none newer than s3406 | queue-state.json |
| Processes | Runner 26518 alive; own launcher 17165 → 17213 → 17214 | launcher.json, health.txt |
| Public heartbeat | Nine HTTP 200 responses; five API bodies ok:true; build 299b1db5 | live-probe.json |
| Private duties | 66/66 days through October 28; both live private heads match today's receipts | mirror-freshness.txt, private-heads.txt, private-visibility.json |
| Rotation | Week 45 opens November 2; nine-entry registry/fence match | duties.json, skillmd-guard.txt |
| Final ledger battery | Acceptance: code 0, unchanged inputs and HEAD; actual counts in receipt | ledger-result.json, ledger-guards.txt, ledger-manifest.json |

## Verification

Verification at 2026-10-28T05:00Z: dry-board-probe resolves 95 subjects: 82 merged, 13 closed or blocked, zero eligible or unknown. Four main..lane histories are empty and all four lanes have zero tracked dirt. Five registered worktrees, zero unreported ahead. Six queues, running tasks and pending crafting orders are empty; none of 118 historical failures is newer than s3406. The latest run's index-lock obstruction is historical: delivery 4fe2becb8, drain b5d6d3c32 and record 614f84ca5 are main ancestors, and assayer-sync-visibility-1 is merged with the matching drain hash. CODEX-WALL and attended custody remain. Future subscription capacity is unverified; later authorized dispatch requires a dependency-aware lane refresh.

Launcher 17165 → 17213 → 17214 owns this process lock, created at 04:58:12 UTC with matching 11:58:12 local FIRE START. The preceding fire ended at 10:58:10 local. Runner 26518 is alive under parent 1; no restart was needed. No predecessor lock was displaced. The main-slot semaphore checks ACTIVE and not lock CLEARED at scripts/lane-runner-v3.sh:322. The actual launcher uses Codex; launcher cleanup owns tasks/.fire.lock.

At 04:59 UTC, nine public GETs returned HTTP 200; five API bodies parsed as ok:true, and both stats bodies contain a stats object with empty:false. Public build 299b1db5 advertises weeks 37–44. RT-01 is discharged by local r2026w45, opening November 2 and closing November 9 at 00:00 UTC; 685bd41d9 is a main ancestor. The whole nine-rotation skill fence matches the registry. Skill documentation results are retained in skillmd-guard.txt. Carry week 45 with the next authorized deployment before opening, then require ASSAYER SYNCED and served-registry verification. Browser gameplay, server runtime metadata and fresh replay acceptance were not tested.

October 28 private-duty receipts and the completion row were read. Fresh strict mirror census is whole and current: 66/66 days August 24–October 28. Live ledger-backups eb74b13da3da715dc6553d4aea2e23fe48edcbed and fire-memory 53d87470fb2670626fb4605d4dc0eb5bffd899fb match the receipts; archive visibility PRIVATE. No duplicate pull or push is due. The closing ledger battery rechecks exposure. Private data stays outside this public tree. Next private coverage day October 29 after 02:10 UTC.

The 19-file ledger corpus was accessed through ledger-corpus.mjs, including current duty and custody rows. October 27 ticker and completion row were read; 49db2f8b5 is a main ancestor, historical census not repeated. Latest attended handover §13z-116 and relevant Owner's Desk entries were read. F-STO-1 remains attended-owned; 7b619795b is a main ancestor, storage not remeasured. No player-visible landing or new Gazette item; publication remains owner-only.

## Adaptation and commits

Reused the preceding fire's read-only probe and ledger harness, updated for s3407 and this launcher. The final battery uses .nvmrc Node 26.4.0 and the evidence-local adapter that supplies --test-concurrency=1 only to the ledger's node --test entry. Assertions, roster and timeouts are unchanged; DEVELOPER_DIR is process-local. No maintained code, runtime, deployment, test assertion or queue changed.

Lock commit 27f8f984c; inherited dashboard bookkeeping 3f863d4e6. The generated logs/.goal-tree.html was sampled empty while refreshing, excluded from that commit, and subsequently returned to 487,287 bytes; no restore or deletion was performed. The final clearing commit contains this report and gate receipts; its hash is recorded in the final reply and vault digest. The tested ACTIVE line carries the final summary, inherited desk tail and acknowledgements. Only the lock/stamp envelope changes after the green battery. The clearing commit is the last main write; origin backup follows.

## REMAINING LIST IN ORDER

1. Attended: deploy week 45 before November 2 00:00 UTC with ASSAYER SYNCED and served-registry verification.
2. Next fire after October 29 06:00 local: compile the October 28 ticker; owner approves publication.
3. October 29 after 02:10 UTC: LB-01/FM-01 private duties.
4. Preserve existing Owner's Desk items and attended F-STO-1/F-CUT-1 follow-up; no new owner decision was created.

## Execution note

The first explicit archive audit omitted its bounded regression flags. Its startup explained that the full 7,455-commit walk targets known excused legacy drops; the fire verified process ancestry and stopped only its own audit PID, retaining output, then ran the prescribed --limit 40 --quiet regression check. This was command-scope correction, not a product failure. Skill documentation checks passed 19/19.
