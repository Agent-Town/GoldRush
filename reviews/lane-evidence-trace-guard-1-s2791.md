# Lane evidence trace guard: implementation complete, primary runner must be quiescent

**Verdict: HELD before drain; gate-side readiness condition.** s2791, 2026-09-29T02:42Z. This is a custody and completion receipt, not source acceptance or a product landing.

Task: tasks/lane-evidence-trace-guard-1.md. Branch: art/portraits-e5-e10-generated. Tip: 00e7839bafc8da474cf33161ccd5cca7dcbd5dc9; predecessor a444adb6b24999e02a22e2817e6bd391a054783b. Merge base: a9fca769e256a99b08b192dd7656d2bb1cb59361. First drain command returned CLEAR (queued).

Attempt 2 implemented raw-output withholding and staged evidence budgeting in the inactive lane copy, as the attended correction expressly permitted. The lane reports that the guard retains disk files and excludes raw traces, videos, result folders, failure screenshots and oversized artifacts from auto-commits. This is factory tooling with no player-visible change.

A distinct primary integration constraint remains: ps confirms PID 25494, PPID 1, is executing the primary checkout's scripts/lane-runner-v3.sh. CLAUDE.md mistake 17 says “never write to a script that ps shows running”; AGENTS permits stopping only PIDs the actor started. This fire did not start that independent runner. The corrected lane-copy authorization does not authorize replacing the executing primary file or terminating its process.

| Evidence | Result |
| --- | --- |
| Commits ahead | 2: preserved report predecessor and real implementation |
| Source classification | Three LANE-TOUCHED-only paths; zero MAIN-MOVED paths |
| Diff | 14 paths, 3,967 insertions / 13 deletions, including evidence |
| Lane tokens | 77,722 |
| Lane guard / adjacent receipts | 21/21 tests; 13 shell checks; not rerun by this fire |
| Lane syntax / tsc / build | PASS reported; not drain acceptance |
| Retention pointers | Reported 565 to 648 and 567 to 650; unchanged on primary |
| Fire product gates | Not started: primary integration custody condition unmet |
| Primary writer | Independent live runner 25494, unchanged |

Per-file source classification: scripts/lane-runner-v3.sh, scripts/evidence-budget.mjs and scripts/evidence-budget.test.mjs are lane-touched only. All eleven task artifact paths are new relative to main. No conflicts resolved, no source merged, no mergeHash claimed. The original done-move remains intact; goal is blocked/gate-side to prevent a later fire from replacing the executing script.

This is follow-up to existing F-2742-1, not a new owner decision or implementation failure. The attended session can satisfy and lift this readiness hold without another owner word. Next: coordinate a quiescent runner window, complete detached drain gates, re-base the retention pointers, verify no process executes the primary file before integration, and restart with scripts/start-lane-runner.sh. No re-queue.

Evidence: artifacts/s2791/completed-custody.json, completed-run-tail.txt, trace-guard-policy.txt and lane-report.md.
