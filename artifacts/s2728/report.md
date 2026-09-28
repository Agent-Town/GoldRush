# s2728 — live Holds-2 lane preserved; Holds-1 main test receipt checked

**READY-FOR-GATES — bookkeeping and heartbeat; no product drain.** WHY: the done-board resolves every subject as merged or closed, while the only unabsorbed lane content belongs to the live, attended-owned Holds-2 run. No source change, dispatch, requeue, branch mutation, deploy or new scope was needed.

## Verified state and ownership

- This fire owns its launcher directory: launcher PID 75297 → wrapper 83601 → Codex 85130. Directory stamp 2026-09-28T02:26:38Z matches that launcher. STATUS was s2727 lock CLEARED. s2728 took the lock with a command-derived UTC stamp at 02:28Z in **8ee9a48bd**. The main-slot semaphore is the ACTIVE-and-not-lock-CLEARED predicate in `scripts/lane-runner-v3.sh:239`.
- Holds-1 goal is merged as **a69534fe9ae6a6f35971f977f9f3d4249a86584b**, verified ancestor of main. Holds-2 remains running on lane-c; the latest runner log shows native rides and fresh committed driver work. This is active implementation, not a credit-wall failure. Holds-3's dispatch remains attended-owned after Holds-2 lands. Leaves and runtime inventory are in `state.json`.
- Done-board: **0 real drains, 0 unknown, 13 closed/blocked, 63 merged ghosts** (`dry-board.txt`). The board is dry; the factory is active. `lane-usable.txt` records lane-c BUSY with unabsorbed content; a/b/d have zero ahead commits. The 57 non-lane registered worktrees remain attended-owned.
- Runner **25494**, PPID 1, alive. Edge landing/game/API **200/200/200**. All queues empty, one run in flight, pending crafting orders **0**, staged art **0**. No assayer order or art-staging landing is due. No failed move newer than the previous handoff. The runner is neither missing nor this fire's child, so no process action was needed.
- Inherited generated dashboard/task statistics were preserved in **aa1f26407** before triage. Historical artifacts, run logs, attended landing files and scratch worktrees were left intact. No file was deleted.

## Holds-1 main receipt supersedes the pending claim

The attended main receipt `~/.goldrush/land/sph1-battery-main.log`, last updated **2026-09-28T02:25:00.144Z**, now contains completed totals: **1040 tests, 1035 passed, 0 failed, 5 skipped, 0 cancelled**, **1273.685 s**, followed by the chained final group **87/87**, zero fail/skip/cancel, **30.414 s**. Its intervening npm guard legs reached the final group. The exact totals are preserved in `attended-main-node-summary.txt`.

This is a read of the attended owner's receipt, not a new fire-side battery. The file does not contain a wrapper exit code; the attended owner retains the final exit/disposition. The earlier candidate's contention-fixture failure (1034 pass / 1 fail / 5 skips; expected two concurrent batteries and counted three) remains in its original record. This heartbeat makes no claim to have cured or attributed that failure. The prior handoff's claim that the main test groups were still pending is now superseded by these observed completed groups.

## Standing duties

- **LB-01 already discharged for September 28 by s2727 at 02:19Z** (`artifacts/s2727/backup-final.json`, rc 0). Rechecked the actual private corpus: **36/36 days**, August 24 through September 28, today's file present. Remote private archive head is **409ffd397abde6b0d465fb8a79be145112f9e9f6**, matching the recorded push. No second pull or public mirror commit is needed. `ledger-freshness.txt`, `private-remote-heads.txt`.
- **FM-01 already discharged today**: s2727's rc-0 receipt says unchanged; live private remote head **53d87470fb2670626fb4605d4dc0eb5bffd899fb** matches. Next LB/FM duty is September 29 after 02:10 UTC.
- **TK-01 already discharged**: the September 27 digest exists with its UTC+07 local-midnight window, landing hashes and control count. No player-visible merge or era bump occurred in this fire, so no new Gazette item. Publication stays owner-only.
- **RT-01 current**: r2026w40 opens September 28 and closes October 5. Next weekly mint is Wednesday September 30 for the coming Monday. Fresh skillmd check **19/19**, rc 0 (`skillmd.txt`).
- The inherited three-item Owner's Desk is carried byte-for-byte. No new owner decision or production action.

## Remaining list in order

1. Attended records the Holds-1 main wrapper exit/disposition; the completed passing groups above replace the pending-groups claim.
2. Holds-2 finishes, then its output is policy-checked and gated under the recorded ownership; Holds-3 dispatch stays attended-owned after that landing.
3. Retain the attended native-ride attribution law follow-up and campaign proof limits; no duplicate fire retry or task.
4. September 29 LB/FM after 02:10 UTC; Wednesday September 30 rotation mint.

The final ledger receipt and clearing stamp will be appended before the last main commit. No new product finding, goal leaf or BACKLOG row was invented from this heartbeat.

## Final verification and handoff

Final ledger **PASS, npm rc 0**, **1263/1263**, zero failures, skips or cancellations; all chained legs completed, kit **83/83**. Total **326.078 s**, Node **26.4.0**, checkpoint **b686086a37fdb78da07ad86509a8fd17a5ae5e25**. Receipts: `ledger-final.txt` and `ledger-result.json`. Archive audit: zero permanently absent and zero abridged handoffs; predecessor and three-item Owner's Desk checked byte-for-byte. Final read still finds Holds-2 running.

Project knowledge and a session digest are retained in the shared Obsidian vault (`vault-notes.json`). Inherited factory log churn is included in the final bookkeeping set. No product source, tests, law, goal or BACKLOG row changed.

Lock clearance **2026-09-28T02:38Z** is this fire's last write/commit on main; the normal origin/main backup push and read-only remote verification follow. The launcher retains its own fire directory until process exit.
