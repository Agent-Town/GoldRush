# Task run-guards-node-watchdog-1: let the full Node battery finish inside a measured outer budget (LANE-D, Astra, commit prefix "fix:")

CODEX: model=gpt-6-astra
LANE-SAFETY-OPT-IN: BUILD-ON-PREDECESSOR
EXPECTED-HOLDS: artifacts/run-guards-node-watchdog-1/report.md

ATTEMPT 2 (2026-09-28T08:52Z): attempt 1 (46,458 tokens, 08:48Z to 08:50Z) stopped at pre-flight because lane-d's `node_modules` is a SYMLINK to the primary checkout's (`/Users/robin/Claude/Projects/Gold Rush/node_modules`), and you rightly refused to run `npm install` through a dependency link that would write outside the lane. EXEMPTION, explicit: that symlink is expected on lane-d and is NOT dirt; do NOT run `npm install` or `npm ci` in this lane at all (the primary's dependencies are the same lockfile; this task edits two scripts and runs node tests, no install is needed); `npx tsc --noEmit` and `npm run build` may read through the link. The lane's ahead commit is your own attempt-1 blocker report (declared above); do not reset the lane, build on it. Everything else in the pre-flight still holds. If anything ELSE in `git status --short` is a modified tracked file you did not make, STOP as before.

**FIRE-AUTHORED s2737, 2026-09-28; assigned 2026-09-28 by the attended session to Astra on lane-d (owner 2026-09-26: tasks run as Codex lane masters for Astra). CODEX-WALL still forbids FIRE dispatch; this copy was dispatched attended.**

You are Codex (gpt-6-astra), implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-d` (branch `art/portraits-e5-e10-generated`; the branch name is history, your commits are path-scoped to the two scripts and your evidence). You do not touch STATUS.md, reviews, tasks or other lanes.

READ FIRST: AGENTS.md; CLAUDE.md; `tasks/CODEX-WALL`; `reviews/audio-music-toggle-1-s2736.md`; `artifacts/s2736/tape-main-failure.txt`; `artifacts/s2724/report.md`; `scripts/run-guards.mjs`; `scripts/run-guards.test.mjs`; `scripts/run-node-guards.mjs`; `tasks/lane-d-f1713-1-run-guards-outer-budget.md` (historical shipped predecessor, not work to repeat).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL; the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B art/portraits-e5-e10-generated main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work; resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence (`artifacts/**`, `reviews/shots-*`, any `.png`) are NEVER work and NEVER a STOP; discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-d status --short` must be clean, with the FACTORY-CHURN EXCEPTION (F-1407-1): `logs/**`, `artifacts/**`, `reviews/shots-*` and any `.png` are always expected, never a STOP; what still STOPs is modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

Prepare with `npm install --no-audit --no-fund` in the lane worktree (the LANE pre-flight above already covers cleanliness), then typecheck and build before editing. If this checkout already has a different measured wrapper policy, STOP and report its commit rather than overwriting it. Do not edit a script while a process is executing it (check `tasks/running/` and the fire lock; wait or report).

## Why (F-2737-1, measured 2026-09-28)

The audio toggle's source and browser gates are complete, but its required integration wrapper cannot finish a healthy full Node battery. `scripts/run-guards.mjs:257` gives every child the same 900-second total budget. The existing test at `scripts/run-guards.test.mjs:275` pins that literal. This is the F-1713-1 outer-budget class, not a slow individual test: its shipped predecessor raised 600 to 900 seconds when a healthy run took 637.6 seconds.

Current evidence is larger: the s2724 main receipt records the full npm battery at 2566.773 seconds with rc 0 (1032 passes, 8 skips, chained tail 87/87). The s2736 Tape receipt preserves a completed Node phase at 1490.597 seconds, with one separately controlled agent-reel red; it is completion evidence, not green evidence. The existing Node harness keeps a 300-second per-test bound and a 2700-second TAP-progress watchdog. A 900-second total wrapper preempts that watchdog and has already stopped the s2733 drain. Repeating the unchanged capped command is not a new premise.

## Scope

1. Give only `test:node-guards` a bounded 60-minute outer child allowance in `scripts/run-guards.mjs`; keep the current 15-minute allowance for every other guard. This is total-battery headroom over the measured 42.8-minute healthy run and the existing 45-minute quiet watchdog. Do not change per-test bounds, the progress watchdog, retries, concurrency, selected guards, or exit-code semantics. Keep the choice local to the existing spawn; no configuration surface or new runner.
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
