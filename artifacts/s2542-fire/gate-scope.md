# s2542 M1 debug-consent drain scope

The task changes one Playwright file and retains six runner transcripts. The task explicitly excludes full simulation replay for this test-only correction; FIRE protocol §3 keys full node guards on src/sim, src/systems or src/entities changes, none present. TypeScript, production build, both M1 projects, task-025 and M2 adjacency, plain desktop/390px boot, power/task guards and closing ledger guards supply the acceptance evidence. Runtime and engine pins are unchanged.

The first policy recheck was incorrectly scheduled inside the detached gate tree. Its corpus guard correctly refused with rc=2 before reading a stale board. Re-running from main returned CLEAR; that refusal is tooling context, not a product test result. The initial battery retains it honestly; individual acceptance jobs are read by their own exit codes.

Source whitespace is clean. Three trailing whitespace lines in original lane transcripts are preserved verbatim. They are not code changes and are not silently rewritten evidence.

Gate tree: /private/tmp/gr-s2542-m1; candidate b9dd606ac910754a26b6e7381f42665bbab5810d, based on main 588ceab0b. Node 26.4.0; private Vite cache /private/tmp/s2542-vite-cache; server process cwd is the gate tree, port 5234; all browser jobs workers=1.

The initial browser run is INVALIDATED by fire-side server replacement: the battery began at 2026-09-07T13:25:34.831Z; its policy/typecheck/build legs consumed approximately 30 seconds, so browsers started about 20:26:05 local. `ps -p 86866 -o pid,lstart` records the replacement Vite start at 20:26:28, inside that browser run. The first run ended 33/34 with an unchanged desktop double-restart timeout. This is not a proven runtime defect or a claimed contention excuse: the fire changed its observation environment mid-run. Its exact causal role in that particular timeout is unproven. The original main restart test subsequently passed 1+3 runs, and the candidate complete M1 passed 10/10. A fresh complete 34-case acceptance run under the uninterrupted server is required and recorded separately. No timeout or assertion changed.
