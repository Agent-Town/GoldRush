# M1 debug-spawn consent — s2542 drain review

## Slice / branch / tip

`tasks/lane-a-m1-debug-spawn-contract.md`; lane-a branch `feat/e10s-4-door`, tip `e5de72e8d9b8c90db52e35ef1ab4fbd9670d5247`. Merged as `fa135c9bcceb81469dce39d5d6dc14da2efb9c52`.

## Verdict

PASS. F-2533-1 closed. All seven scoped paths on main match the lane tip. The production runtime, assertions and timeout budgets are unchanged.

## What it does

The positive spawn test explicitly opens debug mode. A new plain-mode negative test advances frames after T and proves that no enemies spawn, with zero console/page errors. The other M1 assertions remain intact.

## Evidence

Native Node 26.4.0; detached current-main candidate `b9dd606ac910754a26b6e7381f42665bbab5810d`; private cache and port 5234; one Playwright worker. Typecheck PASS (5.8 s); production build PASS (24.2 s); stable-server M1 + task-025 + M2 acceptance **34/34** (166.6 s), both desktop/mobile; complete M1 alone **10/10** (51.6 s); plain desktop/390px boot **2/2**, zero console errors, warnings or page errors (9.1 s); power p95 **0.348 ms** below 0.500 ms; task guard **1,326 masters, zero invisible**. Source diff whitespace check passes; three original transcript trailing spaces are retained verbatim.

`artifacts/s2542-fire/gates.txt` retains every command and exit. The first combined run was invalidated by fire-side server replacement and is not acceptance evidence. `artifacts/s2542-fire/initial-browser-results/` retains its timeout screenshot/context. `artifacts/s2542-fire/gate-scope.md` records why full simulation replay is not required for this test-only master; closing ledger battery is recorded separately in the same evidence directory.

## Merge classification

Lane base `cec0e113c5bc3a84b33b62d84656b40824940cc9`; gate main `cb7204853`. Main changed none of these paths since lane base. No conflicts; ordinary no-ff merge. Live main runner edits to board-gold fixtures stayed outside this commit.

| Path | Classification |
| --- | --- |
| `artifacts/m1-debug-spawn-contract/after-browser-gates.txt` | LANE-ONLY; main unchanged since lane base |
| `artifacts/m1-debug-spawn-contract/before-desktop.txt` | LANE-ONLY; main unchanged since lane base |
| `artifacts/m1-debug-spawn-contract/build.txt` | LANE-ONLY; main unchanged since lane base |
| `artifacts/m1-debug-spawn-contract/report.md` | LANE-ONLY; main unchanged since lane base |
| `artifacts/m1-debug-spawn-contract/scope-checks.txt` | LANE-ONLY; main unchanged since lane base |
| `artifacts/m1-debug-spawn-contract/tsc.txt` | LANE-ONLY; main unchanged since lane base |
| `e2e/m1-01-claim-jumpers-death.spec.ts` | LANE-ONLY; main unchanged since lane base |

## Findings

F-2533-1: CLOSED by explicit positive consent and the plain negative control.

F-2542-1: CLOSED, fire-side observation setup. The first browser run began about 20:26:05 local, but the replacement Vite process started at 20:26:28. It returned 33/34 with an unchanged desktop restart timeout. The individual cause of the timeout is unproven; the run is invalid because its environment was changed mid-observation. Original main passed four bounded restart controls; the candidate passed a complete M1 run and a fresh complete 34-case battery without changing assertions or budgets. No unresolved product finding is inferred from that invalid run. Policy also correctly refused the first detached-tree lookup; the authoritative main-tree lookup returned CLEAR.
