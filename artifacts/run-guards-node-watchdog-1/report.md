# Node watchdog wrapper — implementation and verification

**READY-FOR-GATES — wrapper change verified; full wrapper completed rc 1 with a reproduced base failure. Not an all-green battery or a completed drain.**

## Policy and root cause

The old wrapper gave every npm guard 900 seconds, preempting the unchanged Node harness's 2700-second TAP-progress watchdog and the measured healthy 2566.773-second battery (s2724). Only `test:node-guards` now receives 3600 seconds; every other guard retains 900 seconds. The choice is local to the existing spawn call. Selection, exit semantics, retries, concurrency and the inner harness are unchanged.

## Revisions and preflight

- Pre-task main: `87a88f983e40bb4a28da5f4ad7dc0c5acebe57c5`.
- Initial lane: `1f0b5a342ba77dcdb5ed815ea80d68dd41c5b3f1`; its only ahead content was the explicitly permitted attempt-1 report.
- Main merged without conflicts into the lane as `a66f81f0cf8bacf33756a5b979c86dd2ccc18f5a`, preserving the predecessor. Its tree differed from pinned main only by that report.
- Implementation candidate: `ef16c955b10adcf34c74e4c8db68c899f2547deb`.
- Expected untracked node_modules symlink preserved; no npm install/ci, reset, cleanup, or other-lane write. No evidence discarded. No running subject script found before editing. The primary fire lock was present later; main's working tree was untouched.
- Initial ambient Node 23.11.1 typecheck/build both rc 0; repeated before editing with pinned `/opt/homebrew/bin/node` 26.4.0, both rc 0. Candidate typecheck/build on Node 26.4.0 also rc 0. Logs retained separately.

## Focused evidence

`node --test scripts/run-guards.test.mjs`: rc 0, 12/12 tests, zero skips/failures, 9.410 seconds. The new bounded fixture preloads a spawn observer into the real wrapper and forwards calls to the fixture's no-op npm scripts. It checks all ten actual spawn argument/timeout pairs, with a 60-second fixture bound and no battery recursion. Existing failing-child (rc 3 -> wrapper rc 1) and signal-child checks remain unchanged and pass.

`git diff --check`: rc 0. `scripts/run-node-guards.mjs` is identical to pinned main; SHA-256 `e8f81c914abb32fd1d0b788dfaf52b9b9696b9c63e0dcc1c6cff3a0deac0f679`. Its per-test bound remains 300000 ms and TAP-progress watchdog 45 * 60000 ms. No timeout elsewhere changed.

## Full wrapper

Launched once under the existing attended drain lock, Node 26.4.0, on the merged candidate:

```sh
node scripts/run-guards.mjs --changed-since 87a88f983e40bb4a28da5f4ad7dc0c5acebe57c5
```

The existing stats-path variable redirects receipts into this artifact directory to avoid writing logs. `wrapper-start.json` identifies the candidate and start; `wrapper.log`, `wrapper-result.json` and `guard-stats.jsonl` retain final results. The five selected guards are Node, power budget, task guards, citations and gate callers. No guard is skipped or substituted.

### Completed result

Started 2026-09-28 08:56:46 UTC; finished 09:16:28 UTC. **1181.895 seconds (19m 41.895s), wrapper rc 1.** This is the sole full-wrapper invocation. The Node phase ran beyond the obsolete 900-second cap and exited normally with a test failure, not a timeout or signal.

| Guard | Outer budget, seconds | Measured seconds (wrapper rounds) | rc |
|---|---:|---:|---:|
| test:node-guards | 3600 | 1178 | 1 |
| test:power-budget | 900 | 0 | 0 |
| test:task-guards | 900 | 0 | 0 |
| test:citations | 900 | 3 | 0 |
| test:gate-callers | 900 | 0 | 0 |

Power p95: 0.401 ms. The other five registered guards also retain 900 seconds, verified by the focused spawn fixture; they were not selected by this diff.

The preserved complete `node-battery.tap` ends with **1040 tests, 1034 pass, 1 fail, 5 skips, 0 cancelled**, duration **1177.655 seconds**. The wrapper transcript records maximum TAP quiet **950.4 / 2700 seconds**. Fixture cleanup covered **162 owners, zero survivors**, taking **1121.695 seconds**. Its child diagnostics name desk-declaration and guard-stats-persistence; those are attributed below. A read-only open file descriptor retained the final TAP through the harness's normal unlink; `node-battery-partial.tap` is explicitly only a monitoring snapshot.

**The npm command's chained tail did not execute**, because its existing `&&` semantics correctly stop after the failed Node test phase. No 87/87 chained-tail claim is made. All five outer guards nevertheless ran, and the wrapper correctly remained red.

### Base attribution and evidence limitation

After the wrapper and its children finished, the two scoped scripts were temporarily restored from the pinned pre-task main hash. `git diff --name-only <base> -- . ':(exclude)artifacts/**'` was empty: all non-artifact tracked contents matched the unchanged base. No main-tree edits, branch reset or history rewrite occurred. The control ran in this same linked lane and runtime with the same stats-path environment arrangement; a finally block restored both candidate files byte-for-byte. `base-control-result.json` and the empty `base-control-source-diff.txt` record this content-based control (Git HEAD remained the candidate, not a new base checkout).

`node --test scripts/desk-declaration-guard.test.mjs scripts/guard-stats-persistence.test.mjs`: **rc 1; 39 tests, 37 pass, the same 2 failures; 3.582 seconds**.

1. **Outer Node red:** `desk-declaration-guard.test.mjs:163`, “the live board is green under this guard (baseline is honest)”. Both candidate and base print the same linked-worktree refusal: lane STATUS line 1 differs from the current main handoff, guard rc 2 instead of expected 0. This is the pre-existing stale-board safety check, not a timeout regression. Nothing in STATUS or the test was altered to bypass it.
2. **Reported cleanup child red:** `guard-stats-persistence.test.mjs:97`, “default path is anchored to the script tree, not cwd”. The evidence-only `GR_GUARD_STATS_PATH` override is inherited by its default-path fixture. The fixture then fails ENOENT when reading the default file it never wrote. This test/environment interaction reproduces on unchanged base. The override was used to respect the task's no-logs-write firewall; it changed no timeout or selection policy. A candidate control with this variable absent passes **11/11, rc 0, 3.475 seconds**, retained in `candidate-stats-clean-env*`. No out-of-scope test fix was made.

The raw `guard-stats.jsonl` therefore includes one incidental fixture record (`head: unknown`, `roster: --only`, 09:12:42 UTC) before the five real wrapper rows. It is retained transparently, not counted as a sixth guard. The real rows share runId `2026-09-28T08:56:46.444Z`, head `ef16c955b`, roster `GATE_GUARDS`.

## Final scope check

Candidate scripts restored exactly to commit `ef16c955b`; final `git diff --check` rc 0. Against pinned main, the only non-artifact differences are the two authorized scripts. The existing inner Node harness, package scripts, dependencies, product files, tests outside the assigned file, ledgers and main worktree were not edited. No full-wrapper retry, raised second bound, skipped guard, deployment or browser-suite substitution occurred.

## Remaining work, in order

1. Orchestrator drain on its accepted current-main candidate: resolve/attribute the linked-worktree board refusal through the normal drain procedure and obtain any required all-green Node/npm chained-tail receipt. This run proves completion and base attribution, not full integration green.
2. Preserve the stats evidence without leaking a global stats-path override into the default-path fixture; the existing test's inherited-environment sensitivity is an adjacent finding outside this task's firewall.
3. Run the task's unchanged browser drain gates: `e2e/task-025-bandits-dont-swim.spec.ts`, `e2e/m1-01-claim-jumpers-death.spec.ts`, `e2e/m2-01-build-menu.spec.ts`, both projects with `--workers=1`, plus plain desktop and 390px boots with zero console/page errors, under the drain lock. No browser test was added for a Node spawn policy.
