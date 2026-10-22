# s3302 — Dry board and canonical standings mismatch persists

READY-FOR-GATES for bookkeeping, subject to ledger-result.json. WHY no product landing: board DRY, 95 subjects, zero eligible/unknown; four lane branches have zero unmerged commits. F-3293-1 reproduced: canonical week-43 standings returns 400 bad_rotation versus direct Pages 200; public build 299b1db5 carries weeks 37–44. October 22 private coverage verified 60/60; week 44 and October 21 ticker current. Next: existing attended Node-switch word and runtime synchronization with ASSAYER SYNCED. Evidence artifacts/s3302/report.md and ledger-result.json.

## Board and custody

The dry-board probe classified 95 subjects: 82 merged, 13 closed/blocked, zero eligible or unknown. All four main..lane logs are empty. Six queues, running tasks and pending crafting orders are empty; no newer failures among 118 entries. The newest run is 20261022-151639-lane-d-assay-node-26-12-1.md.log, ending at 357cf6e77, already on main. It establishes service for that completed run; future subscription capacity is unverified. No drain is available, so no product build, strict drain gate or browser acceptance is claimed.

The fleet probe covers four of 68 registered worktrees. Seven ahead scratch trees retain attended custody: wt-holds1-candidate (1), wt-holds2 (1), wt-tape (1), wt-audio (1), wt-holds1 (2), wt-control (43), wt-aif1 (51). Exact paths are in unreported.txt. Generated dashboard refreshes were preserved in bookkeeping commit 85cea9d3a; source goals were unchanged.

## Existing finding and heartbeat duties

Bounded HTTP reads at 20:47 UTC reproduce F-3293-1: canonical week-43 transfer standings returns 400 bad_rotation; direct Pages week 43 and canonical week 42 return 200 JSON. Public build 299b1db5 carries weeks 37–44. Both stats endpoints return 200 JSON with ok:true and a stats object. These samples establish the symptom, not sustained health or the failed sync substep. Prior runtime-tree divergence remains an inherited diagnosis; server metadata was not re-probed. Existing F-SRV-1 attended custody and the recorded Node-switch gate apply.

LB-01/FM-01 remain discharged for October 22: live private archive heads match the completed s3287 receipts, ledger-backups 591a9d8dd55d8ed318fae4b8fa6d7f03decf899a and fire-memory 53d87470fb2670626fb4605d4dc0eb5bffd899fb. Mirror coverage is 60/60 days, August 24–October 22. No redundant pull or public copy of private data. RT-01 is discharged: r2026w44 opens October 26; the whole eight-rotation skill fence matches, 19/19 checks pass. October 21 ticker and completion row exist. October 22 ticker becomes due at October 23 06:00 local; October 23 private coverage is not due before 02:10 UTC. No player-visible merge, Gazette item, art landing, crafting verdict or deployment was required.

## Verification and adaptation

Lock commit 1626930c6; dashboard bookkeeping 85cea9d3a. The launcher chain 64654 → 64701 → 64703 matches the directory lock mtime and FIRE START at 20:45:41 UTC. Actual engine is Codex, despite the supplied protocol's Claude edition. No child implementer was launched. Runner 31360 is alive under parent 1. The main semaphore is scripts/lane-runner-v3.sh:322, ACTIVE without lock CLEARED. Shell and process probes used the prescribed Node wrappers.

Fresh checks: runner 31360 alive under parent 1; six queues, running tasks and crafting pending empty; none of 118 failures newer than s3301. Latest runner log ends at 357cf6e77, verified on main with attended merge 2bbc6df06, pin 5d6e46fb2, public build commit 299b1db58 and maintenance record 314d074bd. Four lane logs main..branch empty; seven ahead scratch trees remain attended-owned (unreported.txt). Both stats endpoints return 200 JSON with ok:true and a stats object. Canonical week-43 400 bad_rotation versus direct Pages and canonical week-42 200 confirms the existing symptom; server metadata was not re-probed. Archive visibility PRIVATE, live heads match completed s3287 receipts, mirror coverage 60/60. Whole eight-rotation fence matches, skillmd guard 19/19; October 21 ticker exists and its completion row was read through the 19-file ledger corpus. CODEX-WALL observed, no dispatch or requeue; future subscription capacity unverified. Exact predecessor and ACTIVE line archived; Owner’s Desk tail retained verbatim. Final ledger battery precedes the clearing commit and origin backup.

## Validation and remaining work

The unmodified npm run test:ledger-guards runs under .nvmrc Node 26.4.0 with process-local DEVELOPER_DIR=/Library/Developer/CommandLineTools. ledger-manifest.json pins HEAD and handoff inputs; ledger-result.json records the actual exit, test counts and unchanged-input checks. Acceptance requires code 0, unchanged true and headUnchanged true. Only the STATUS lock/stamp envelope changes after green; its clearing commit is the last main write, followed by origin backup. No new runtime root cause was diagnosed.

1. Existing attended F-SRV-1 Node-switch word, then runtime synchronization: require ASSAYER SYNCED, matching pins/rotations, canonical week-43 200 and fresh replay acceptance for F-3293-1.
2. Existing historical replay-drift and device/release follow-ups; retain the three Owner’s Desk obligations.
3. October 22 ticker after October 23 06:00 local; October 23 LB-01/FM-01 after 02:10 UTC.
