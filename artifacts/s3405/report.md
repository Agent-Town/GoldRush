# s3405 fire — October 28 private coverage complete

WHY no product landing: the board is DRY, with no eligible or unknown drain and no unabsorbed lane content. No product defect required a repair. CODEX-WALL remains in force.

READY-FOR-GATES for daily-duty and bookkeeping closeout.

| Check | Measured result | Evidence |
| --- | --- | --- |
| Board | 95 subjects: 82 merged, 13 closed/blocked; 0 eligible/unknown | dry-board.txt |
| Lanes | Four empty main..branch logs; zero tracked dirt; five registered worktrees, zero unreported ahead | lane-usable.txt, duties.json |
| Queues and failures | Six empty queues; no running task or pending order; 118 historical failures, none newer than s3404 | queue-state.json |
| Processes | Runner 26518 alive under parent 1; launcher 7742 → 7800 → 7802 owns this fire lock | launcher.json, health.txt |
| Private coverage | 66/66 days through October 28; one new snapshot pushed to verified PRIVATE archive; FM-01 unchanged | private-duty-results.json, ledger-push.txt, mirror-freshness.txt, private-heads.txt |
| Exposure | 4,682 keys, 66 readable mirrors, zero unreadable, account-class or unrecognised rows | mirror-exposure-node26.txt |
| Public heartbeat | Nine HTTP 200 responses; five API bodies ok:true; both stats objects empty:false; build 299b1db5 | live-probe.json |
| Rotation and news | Week 45 minted, opens November 2; whole nine-entry skill fence matches; 19/19 checks. October 27 ticker already complete | duties.json, skillmd-guard.txt, ledger-selection.json |
| Closing ledger battery | Required acceptance: exit 0 with unchanged inputs and HEAD; actual totals and shell-kit verdicts are recorded by the harness | ledger-result.json, ledger-guards.txt, ledger-manifest.json |

## Verification and limits

2026-10-28T02:42Z. October 28 private duties complete: coverage 66/66 days, strict exposure clean. WHY no product landing: board DRY, 95 subjects, zero eligible/unknown; four absorbed lanes. Runner 26518 alive; nine public checks healthy. Week 45 awaits deployment before November 2. Next private duties October 29 after 02:10 UTC. Evidence artifacts/s3405/report.md and ledger-result.json.

Verification: dry-board-probe resolves 95 subjects: 82 merged, 13 closed or blocked, zero eligible or unknown. Four main..lane histories are empty with zero tracked lane dirt; five registered worktrees, zero unreported ahead. Six queues, running tasks and pending crafting orders are empty; none of 118 historical failures is newer than s3404. The newest run's index-lock obstruction is historical: delivery 4fe2becb8, drain b5d6d3c32 and record 614f84ca5 are main ancestors; assayer-sync-visibility-1 is merged with that drain hash. CODEX-WALL and attended custody remain. Subscription capacity is unverified; a later authorized dispatch needs a dependency-aware lane refresh.

Launcher 7742 → 7800 → 7802 owns the directory lock created 02:40:01 UTC, matching 09:40:01 local FIRE START; runner 26518 is alive under parent 1. No predecessor lock was displaced. The main semaphore checks ACTIVE and not lock CLEARED at scripts/lane-runner-v3.sh:322. The actual launcher uses Codex under the owner switch at scripts/fire-runner.sh:119.

LB-01/FM-01: all five duty commands exited 0. Today's snapshot was pulled to ~/.goldrush/ledger-backups; the private archive push added one file. Strict freshness proves 66/66 days August 24–October 28. A direct-file strict exposure run under .nvmrc Node 26.4.0 inspected 4,682 keys, 66 readable mirrors, zero unreadable mirrors and zero account-class or unrecognised rows. The first pipe-captured exposure outputs ended inside the long table inventory despite exit 0, so the complete direct-file rerun is the evidence of counts. Archive visibility PRIVATE. Live ledger-backups eb74b13da3da715dc6553d4aea2e23fe48edcbed and unchanged fire-memory 53d87470fb2670626fb4605d4dc0eb5bffd899fb verified. No private data enters the public tree. Next coverage day October 29 after 02:10 UTC.

At 02:40 UTC, nine public GETs returned HTTP 200; five API bodies ok:true, both stats bodies contain an object with empty:false. Public build 299b1db5 serves weeks 37–44. The local nine-rotation registry matches the whole skill fence; skill documentation checks passed 19/19. RT-01 is discharged by r2026w45 opening November 2 and closing November 9 at 00:00 UTC; 685bd41d9 is a main ancestor. Deployment remains due before opening, with ASSAYER SYNCED and served-registry verification. These HTTP samples do not establish fresh replay acceptance, server runtime metadata or browser gameplay.

The 19-file ledger corpus was accessed through ledger-corpus.mjs, including duty and custody rows. October 27 ticker and completion row read; 49db2f8b5 is a main ancestor, historical census not repeated. Latest attended handover §13z-116 and relevant Owner's Desk entries read; F-STO-1 stays attended-owned, 7b619795b a main ancestor, storage not remeasured. No player-visible landing or new Gazette item. Publication remains owner-only.

Lock 08352db6d; inherited bookkeeping 66d5d0a74. Evidence and ordered remainder: artifacts/s3405/report.md. Closing acceptance requires ledger-result.json code 0, unchanged true and headUnchanged true. Ledger checks precede the clearing commit, which is the last main write; origin backup follows. Exact predecessor and initial lock archived, desk tail and acknowledgements preserved.

## Adaptations and scope

The prior fire's read-only probe and ledger harness were adapted to s3405 and this launcher. An initial display read preceded completion of the live probe; it reported two evidence files absent, then the completed probe supplied both. The first pipe-captured exposure text was incomplete at its long table inventory; a direct-file strict rerun under Node 26.4.0 completed and supplied all counts. No root cause for the output truncation is claimed, and maintained code was not changed.

The ledger harness uses .nvmrc Node 26.4.0, process-local DEVELOPER_DIR=/Library/Developer/CommandLineTools, a system PATH including /usr/sbin/lsof, and the evidence-local serial scheduling adapter. The maintained npm command, test roster, assertions and timeouts remain unchanged. This report and ACTIVE handoff are frozen before npm run test:ledger-guards. Only the line-1 lock/stamp envelope changes after green; the final commit and backup verification are recorded in the external vault digest and final response.

No simulation, renderer, engine identity or art changed; build and browser drain gates are inapplicable to this maintenance increment. No dispatch, production deployment, live submission, retry or attended scratch intervention occurred. The raw newest run tail remains disk-local under retention policy. Generated dashboard churn stays with its writer. Subscription quota, stored token revocation and historical storage figures were not re-probed.

## Remaining list in order

1. Deploy the already-minted week 45 before November 2 00:00 UTC with the next authorized landing; require ASSAYER SYNCED and served registry/standings verification. Include the landed assayer diagnostics.
2. October 28 ticker after October 29 06:00 local; October 29 LB-01/FM-01 after 02:10 UTC. No daily duty is overdue.
3. Existing Owner's Desk: account-registry deploy evening, B1 phone verdict rows, token-revocation support follow-up; owner publication of news drafts.
4. Attended F-STO-1 and F-CUT-1 follow-up.
