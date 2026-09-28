# Task run-guards-node-watchdog-1: let the full Node battery finish inside a measured outer budget (SCRATCH, commit prefix "fix:")

**FIRE-AUTHORED s2737, 2026-09-28. AUTHORED ONLY; no fire dispatch under tasks/CODEX-WALL.**

You are the implementer for Gold Rush in a fresh scratch worktree beside the primary checkout, `/Users/robin/Claude/Projects/gr-task-run-guards-node-watchdog-1`, branch `fix/run-guards-node-watchdog-1`, cut from main. The attended session owns dispatch and landing.

READ FIRST: AGENTS.md; CLAUDE.md; `tasks/CODEX-WALL`; `reviews/audio-music-toggle-1-s2736.md`; `artifacts/s2736/tape-main-failure.txt`; `artifacts/s2724/report.md`; `scripts/run-guards.mjs`; `scripts/run-guards.test.mjs`; `scripts/run-node-guards.mjs`; `tasks/lane-d-f1713-1-run-guards-outer-budget.md` (historical shipped predecessor, not work to repeat).

Pre-flight: `git status --short` must show no staged or modified TRACKED file outside the two factory-churn classes; if any exist, STOP and report (a live drain or another task owns the tree). Untracked `??` host debris is EXPECTED; list briefly, proceed. FACTORY-CHURN EXCEPTION (F-1407-1): (a) `logs/**` (the fire and runner accounting, rewritten every cycle); (b) `artifacts/**`, `reviews/shots-*` and any `.png` (regenerated evidence, the F-1266-1 class). What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`. A scratch worktree adds: `git log main..HEAD --oneline` empty (a fresh cut).

Prepare with `npm ci`, prove `git status --short` clean, then typecheck and build before editing. If this checkout already has a different measured wrapper policy, STOP and report its commit rather than overwriting it. Do not edit a script while a process is executing it.

## Why (F-2737-1, measured 2026-09-28)

The audio toggle's source and browser gates are complete, but its required integration wrapper cannot finish a healthy full Node battery. `scripts/run-guards.mjs:257` gives every child the same 900-second total budget. The existing test at `scripts/run-guards.test.mjs:275` pins that literal. This is the F-1713-1 outer-budget class, not a slow individual test: its shipped predecessor raised 600 to 900 seconds when a healthy run took 637.6 seconds.

Current evidence is larger: the s2724 main receipt records the full npm battery at 2566.773 seconds with rc 0 (1032 passes, 8 skips, chained tail 87/87). The s2736 Tape receipt preserves a completed Node phase at 1490.597 seconds, with one separately controlled agent-reel red; it is completion evidence, not green evidence. The existing Node harness keeps a 300-second per-test bound and a 2700-second TAP-progress watchdog. A 900-second total wrapper preempts that watchdog and has already stopped the s2733 drain. Repeating the unchanged capped command is not a new premise.

## Scope

1. Give only `test:node-guards` a bounded 60-minute outer child allowance in `run-guards.mjs`; keep the current 15-minute allowance for every other guard. This is total-battery headroom over the measured 42.8-minute healthy run and the existing 45-minute quiet watchdog. Do not change per-test bounds, the progress watchdog, retries, concurrency, selected guards, or exit-code semantics. Keep the choice local to the existing spawn; no configuration surface or new runner.
2. Replace the obsolete all-guards-have-15-minutes assertion in the existing test file with coverage of both classes. Verify the actual spawn options with an isolated test fixture or equivalent bounded mechanism; do not sleep for 15 or 60 minutes and do not recurse into the real npm battery from its own tests. Reuse the current fixture patterns. Preserve and run the failing-child and signal-child checks: neither may become green.
3. Run the literal `node scripts/run-guards.mjs --changed-since <pre-task-main-hash>` once, on the merged candidate, to completion. Retain its exit code and per-guard timing, with any red attributed to the same test on the unchanged base. No green claim from partial TAP. If it still cannot complete, stop with the full evidence; do not raise another bound.
4. Write `artifacts/run-guards-node-watchdog-1/report.md`: old/new policy, measured full-wrapper duration and each rc, focused counts, unchanged per-test/watchdog proof, base/candidate hashes, and any remaining work. If exiting without changes, write WHY first.

## Firewall

Touch ONLY: `scripts/run-guards.mjs`, `scripts/run-guards.test.mjs`, `artifacts/run-guards-node-watchdog-1/**`.

NO changes to: `scripts/run-node-guards.mjs`, other scripts, `package.json`, dependencies, any test timeout outside the wrapper's one node-battery outer budget, existing e2e assertions, `src/**`, `functions/**`, assets, engine registry, `tasks/**`, `specs/**`, `reviews/**`, STATUS.md, CLAUDE.md, AGENTS.md, logs, other lanes or their work. No environment-variable escape hatch, no skipped guards, no constant green, no deployment.

## Self-check

- `node --test scripts/run-guards.test.mjs` and the literal diff-selected wrapper above; exit codes, not printed totals.
- `npx tsc --noEmit`, `npm run build`, `git diff --check`.
- This is a guard-runner change with no player surface. Browser proof at drain time remains unchanged: `e2e/task-025-bandits-dont-swim.spec.ts`, `e2e/m1-01-claim-jumpers-death.spec.ts`, `e2e/m2-01-build-menu.spec.ts`, both projects, `--workers=1`, plus plain desktop/390px boots with zero console/page errors. Do not create a browser test for a Node spawn policy.
- Every server and browser batch takes the existing drain lock through the attended protocol. Stop only PIDs you started, never `pkill -f`. Commit with `fix:` and path-scoped adds.

End: READY-FOR-GATES + root cause + per-guard budgets, times and exit codes + focused counts + what was adapted + commit hashes + REMAINING LIST IN ORDER.
