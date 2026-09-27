# s2718 — stopped corrective retired, attended retry preserved

WHY NO PRODUCT MERGE: the only available done-move was a report-only preflight stop. Run 10 remained live on lane-c. This fire's increment closes that stopped attempt, preserves its evidence and leaves the implementation to the corrected attended master.

The launcher process ancestry identifies PID 23178 as this fire's parent, started at 18:42 UTC; its fresh `tasks/.fire.lock` belongs to this run. The inherited line was s2717 lock CLEARED, archived verbatim by the supported STATUS helper when s2718 acquired ACTIVE. The runner's main semaphore is the condition in `scripts/lane-runner-v3.sh:239`: ACTIVE anywhere in line 1 and no `lock CLEARED`. Runner PID 25494 is alive, parent 1, and is not this fire's child. No restart or process termination was needed.

## Completed increment

- Lock commit `4b11d0557`; inherited attended bookkeeping preserved in `fb9031099` before triage continued.
- Strict drain policy CLEAR. Attempt 1 tip `36d3905f6d8c3d1cabe373b83ce9ca27f229e5ae` contains four evidence paths only; the full report is retained as `stopped-report.md`. Local and origin salvage refs match exactly (`salvage-remote.txt`). No implementation merge or mergeHash is claimed.
- Done-move renamed `stopped-s2718-20260928-013750-gr-campaign-fixture-cleanup-1.md`. Review: `reviews/gr-campaign-fixture-cleanup-1-attempt-1.md`. Goal stays queued with its stop disposition recorded. The corrected attempt-2 master and its dispatcher belong to the attended session.
- No fire refill, re-queue, lane reset, deploy, era pin or news item. No art raws landed; pending assay orders were zero.

## Verification of inherited claims

- CODEX-WALL read in full; the runner's lane probe and newest run log confirm it serves. Lane-c is BUSY with run 10; this is not a dry-factory claim. Lane-a's one unmerged commit is the preserved stopped report, not hidden implementation. Lane-b and lane-d have no ahead commits. Detached/scratch worktrees remain attended-owned.
- The attended F-2717-1 lift is present in the run-10 goal and commit `59733b98d`; the newly running lane-c log verifies dispatch. The control counts recorded there remain attended evidence, not a control rerun by s2718. Main's historical full Node failure remains an open corrective obligation.
- LB-01: current private destination is outside the public repo; strict freshness returns exit 0, 35/35 days from August 24 through September 27. Private `ledger-backups` and `fire-memory` refs match s2717's measurements (`private-duty-refs.txt`). Next coverage duty is not before September 28 02:10 UTC.
- TK-01: September 26 digest exists; September 27 digest is due after September 28 06:00 local, later than this run. RT-01: registry already contains `r2026w40`, opening September 28 00:00 UTC; the next Wednesday mint is not yet due.
- Health probe returned landing/game/API 200, runner ALIVE, fire RUNNING. Owner's Desk retains the same three items verbatim.

## Remaining list in order

1. Attended dispatcher starts corrected fixture-cleanup attempt 2 after this fire releases custody; implementer proves failure-path cleanup and retained nested diagnostics, then the next drain gates the actual diff.
2. Run 10 finishes the final four-map evidence and 42-map table. Drain when complete, with every HELD verdict preserved.
3. Attended continuation chain: holds-1 after run 10 lands, then holds-2. Follow existing goal gates and subscription ownership.
4. Scheduled ticker and private backup/memory duties at their next due windows; the unchanged three-item Owner's Desk remains visible.

## Final verification

Pending: ledger battery, bounded STATUS archive audit, final board snapshot and lock-clearing backup. Results will be appended before the final main write.
