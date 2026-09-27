# s2694 — Pause replay full Node gate completed

READY-FOR-GATES — candidate preserved, NOT LANDED. WHY no runtime change on main: this increment completed the inherited interrupted full Node gate; remaining acceptance gates are still owed.

Lock commit: `0fd459d06`. Candidate: `7875d9a8a772df1848c10246e82b58d5c2ae2774` at `/Users/robin/.goldrush/fire-s2693/wt-tpf1`; source lane tip `19dc0195fbf72f69d24334dede5538c709b977a5`. Current main was merged into the preserved candidate without conflicts; only bookkeeping/evidence moved. No source edits or dispatch occurred.

## Measured outcome

Direct full `npm run test:node-guards` through gate-battery, Node 26.4.0 with file concurrency 1: **1030 passed, 2 failed, 8 skipped, 0 cancelled, 1040 total**, rc 1, **2349.6 seconds**. Both failures are the expected pre-pin hash class (`2d180e6b…` against `f6084527…`); the same specs on clean main under Node 26.4.0 passed **9/9**. No other failure was reported. The cleanup sweep passed **162 fixture owners** in **940.8 seconds**. Maximum TAP silence was 935.2 s of the unchanged 2700 s watchdog bound; no watchdog fired.

The pre-pin rc 1 short-circuited npm's chained tail, so the exact tail extracted from package.json was run separately: **rc 0, 31.3 s**, final test leg **87/87**. This is a completed pre-pin result, not an all-green final battery. `full-node.txt`, `full-node-summary.txt`, `identity-control.txt`, `node-tail.txt`. The intermediate `node-progress.tap` is explicitly partial; the complete transcript is authoritative.

F-2693-1 is resolved: the 900-second wrapper cap was avoided using the established direct command, without changing a limit, test or pipeline. The runtime root cause remains the recorded one-way pause action; the candidate skips it only during replay. No new product defect was found. No same-era pin, landing, deployment, publication or Gazette item was made.

## Verified inherited claims

- This fire is Codex PID 87214, descended from fire-runner PID 87167. The fresh fire lock belongs to this process. Its mtime was refreshed during the long in-flight gate to prevent a live run being reaped; evidence `process-lock-renewal.txt`. The launcher retains responsibility for removing it at exit.
- The current primary policy check is CLEAR. Attended handover 13z-79 releases this drain to fires; the CODEX-WALL still bars autonomous refill/redispatch. The latest implementer run ended READY-FOR-GATES (143608 tokens), not a credit-wall interruption.
- Lane-c holds three undrained commits and its done-move remains intact; other named lanes were ahead=0 at preflight. The goal leaf stays queued. No save/archive transition is owed. This is NOT DRY.
- The runner PID 25494 is alive and independent; its main-slot semaphore is the ACTIVE-without-lock-CLEARED predicate at scripts/lane-runner-v3.sh:239. Final board and health are in `board-final.json` and `health-final.txt`.
- No pending assay orders or art raws were present. The scratch art store is clean on landed main `5793a967da46e8f00c0ba16f92f17dc10d36558d`.
- RT-01 discharged: r2026w40 opens 2026-09-28 00:00 UTC, and the skillmd guard passed 19/19. September 26 ticker exists. LB/FM September 27 are not due before 02:10 UTC; no private mirror entered the public repo.
- The full inherited s2693 line 1 is archived, and the three-item OWNER'S DESK tail remains byte-identical. No owner decision is added.

## Remaining list, in order

1. Recheck primary policy and ownership; merge newer main bookkeeping into the preserved candidate after classifying it. Do not re-run the capped wrapper or redispatch the implementation. Reuse this complete pre-pin result if executable inputs have not changed.
2. Run `remaining-node-jobs.json` (null floors and halo), `release-jobs.json` (owning release config), then warm and run `browser-jobs.json` on port 5404 with one owned server. They include tape/river, task-025, m1-01, m2-01, live-seed-rotation and a plain Claim boot on both projects. All browser jobs use workers=1. Attribute any actual new reds on clean main.
3. Measure the same-era pin LAST, verify both identity specs after the pin, update review/goal/BACKLOG together, rename the done-move, fast-forward main and push. Run the full Node command on main after landing; this measured fire runtime requires a full window.
4. Deploy only via the prescribed unwrapped `bash scripts/deploy.sh`; report assayer SYNCED when it runs. Append player-visible Gazette news on landing. F-RVA1-6 closes with the landed cure, not this held handoff.
5. Perform September 27 LB/FM after 02:10 UTC.

## Closeout

The long existing battery exceeded the nominal drain window; it was allowed to finish rather than manufacturing another interrupted result. No second drain or browser batch was started. Ledger verification is pending before the final clearing commit.
