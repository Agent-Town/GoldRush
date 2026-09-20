# s2538 gate scope and wrapper timeout

The final patch contains six additions under e2e only. It touches no runtime, simulation, entity, system, fixture, gate harness or configuration path.

The governing FIRE protocol section 3 says: "For a drain: npx tsc --noEmit + npm run build + the slice's own spec + affected adjacent suites + a boot probe" and makes the Node battery mandatory when the slice touches src/sim/, src/systems/ or src/entities/ (F-1460-1). The generic drain skill still calls Node an always-run guard. The explicit FIRE task governs this increment. The same scope decision is recorded by the prior f1630-1-m1-06-weighting-timeout drain in BACKLOG: an e2e-only corrective did not require Node.

This fire initially followed the generic skill and invoked run-guards --changed-since. Its parent wrapper uses spawnSync timeout: 15 * 60 * 1000 for each guard. It terminated test:node-guards at 900 seconds with SIGTERM, before the battery produced a complete result. This is an INCOMPLETE optional measurement, not a green Node gate or an identified test regression. Typecheck/build and the other four selected legs passed. The process census immediately afterward found no surviving test launcher or child from this attempt. No timeout was raised or code changed to obtain a passing result.

The full timeout receipt is retained in core-gates.log. It does not discharge any future slice's mandatory Node gate. Such a slice must use the existing gate-battery driver with a direct npm run test:node-guards job, which leaves its existing per-test bounds intact; the previous s2537 resume note already gives that command. The fire's mistake was choosing the broader skill default before checking this task's explicit scope.
