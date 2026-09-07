# MAIN beat citation refresh — s2533 / s2534 drain

## Slice / branch / tip

`tasks/main-beat-citation-refresh.md`, MAIN-slot uncommitted output from runner base `c0fc424a0e89e07674e0d8e2451c093188f18c38`. Gate base `047c1e6e61db2928501b3f15b6ee4708a3fcc24d`; isolated full worktree `/private/tmp/gr-s2533-citation-gate`. Source after-blob `95f2d0675aed69f97748c239d64a965cd395d503`.

## Verdict

HOLD, continued in s2534. No source or registry change was merged. The MAIN done-move and working-tree correction remain available; the candidate patch and registry are retained in the fire evidence. The accepted native node battery remains owed; the s2534 run selected Node 23.11.1 instead of the repository's pinned 26.4.0.

## What it does

Corrects exactly nine current numeric comment ranges in `src/story/beats.ts`. Historical rebasing accounts remain intact. All 9,182 TypeScript token kind/text pairs and the 2,280-line count are unchanged, so no runtime behavior, story copy, or simulation semantics change. The source-byte identity moves; era 5 appends pin 80 (`64d634d4aaf285f04f0fead86724213cbded79e28cec6544d18efcd136485229`) without an era bump or removal of earlier pins.

## Evidence

The runner's before-red/after-green measurements and comparison script are in `artifacts/beat-citation-refresh/REPORT.md`. Independent drain results are retained in `artifacts/s2533-fire/citation-gates.txt`: nine exact subjects, token and line invariance, typecheck, build, and engine registry guard (5/5) all exit 0. The diff-selected battery returned 3/5 guard jobs: task guards, citation checks and gate callers passed; node guards were terminated at the wrapper's 900-second limit (incomplete), and power p95 was 2.566 ms against 0.500 ms. A separate candidate power run measured 3.272 ms; the unchanged-base control also failed at 0.744 ms. These are not green results. Full transcripts: `artifacts/s2533-fire/drain-guards.txt`, `artifacts/s2533-fire/power-control.txt`, `artifacts/s2533-fire/base-controls.txt`.

Plain boot passed 2/2, desktop and 390px, with zero console/page errors after assigning Vite its own cache. The initial shared dependency cache returned HTTP 504 Outdated Optimize Dep; both initial failures and the corrected run remain in `artifacts/s2533-fire/browser-gates.txt`. Minimum adjacent suites passed 30/32. Both failures are the M1 debug-spawn test at its `enemiesAlive > 0` assertion; unchanged base reproduces 2/2 identical failures. Boot screenshots are in `artifacts/s2533-fire/boot/`. Failure screenshots, error contexts, and complete trace/network/stack records are in `artifacts/s2533-fire/browser-evidence/`; `artifacts/s2533-fire/trace-retention.json` records the original archives and omitted response/frame resources. Raw trace archives remain in the gate worktree, not in the offsite commit.

## Merge classification

| Path | Classification | Resolution |
| --- | --- | --- |
| `src/story/beats.ts` | MAIN runner output matched to the completed task | Nine comment-digit replacements; no conflict and no line movement. |
| `assets/engine-era.json` | Drain-owned identity bookkeeping | Append same-era pin derived from the gated tree; keep all prior pins. |

The gate contains only those two tracked edits before tests. Factory log churn, the attended production probe, and every other worktree stay outside this drain. The lane-c evidence-writer done-move remains undrained for the next fire.

## Findings

F-AGE2-2's candidate is correct but not yet landed: the attended description said ten, but its live-line inventory and the authoring checker both enumerate nine, and all nine were verified. F-AGE2-3 and F-AGE2-5 belong to the separate lane-c task. **F-2533-1 (pre-existing test defect; fire-authorable corrective):** `e2e/m1-01-claim-jumpers-death.spec.ts` opens `/?nowaves&nolevel`, presses T, and expects a pack. F-RPA-4 correctly requires `isDebugEnabled()` before that key spawns (`src/game/Game.ts`). The stale test fails identically on candidate and unchanged base, both projects. Keep the runtime gate; make the positive test opt into debug and add a plain-boot negative control. Corrective master: `tasks/lane-a-m1-debug-spawn-contract.md`.

The full node battery timeout is an incomplete measurement, not a discovered game regression and not permission to raise limits or skip tests. The pending MAIN drain still owes a complete accepted battery. Do not reimplement or re-queue its completed citation task.

## s2534 continuation

Gate base `354c62b643824432f0b7fe3c1df95893165045e2`, candidate `/private/tmp/gr-s2534-citation-gate`. The source blob and proposed pin are identical to s2533's candidate. `artifacts/s2534-fire/inherited-gate-equivalence.txt` verifies no intervening committed changes across source, scripts, tests, functions, package files or the registry. No conflict resolution or new implementation was needed.

The direct node run exited 1 after 1,142.455 seconds: 724 tests, 718 passed, 2 failed, 1 cancelled, 3 skipped. Its shell-chained later legs did not execute. `artifacts/s2534-fire/node-guards.txt` preserves the complete output: the fixture teardown file timed out at 300,000 ms, `gr-sim.test.mjs` failed at file level, and the declared-timeout override arm failed. This run used the login shell's Node 23.11.1. `.nvmrc` requires 26.4.0, available at `/opt/homebrew/bin/node`; the F-2076-1/F-2166-2 interpreter distinction is therefore relevant, and this is not an accepted drain battery. The unchanged-base control is recorded in `artifacts/s2534-fire/base-controls.txt`.

The standalone power measurement was green at 0.392 ms against 0.500 ms, on Node 23.11.1. An accidentally duplicated selector probe is explicitly aborted and excluded; `artifacts/s2534-fire/selector-probe-abort.json` and `artifacts/s2534-fire/selected-guards.txt` preserve that operator error. Its brief overlap preceded the fixture guard and is another reason not to treat the first run's red count as a clean regression measurement.

Resume with the pinned interpreter and the existing append-only battery driver, which has no additional 900-second wrapper timeout. Preserve all tests and all declared budgets:

```sh
/opt/homebrew/bin/node scripts/gate-battery.mjs --label "citation native node gate" --transcript artifacts/s2534-fire/node-guards.txt --cwd /private/tmp/gr-s2534-citation-gate --env PATH=/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin --env CLAUDE_CONFIG_DIR=/Users/robin/.claude '[["native node guards","npm","run","test:node-guards"]]'
```

Re-check the committed executable diff against the named base before reusing this worktree. A complete accepted result is still required. Do not raise limits, re-pin to excuse a red, or dispatch the citation implementer again.

The final unchanged-base control returned 13 passed / 1 failed / 2 cancelled (16 tests, 610.6 s). The fixture timeout and override refusal reproduce. The simulation result does not match exactly: 86.9 s file failure on the candidate versus 300.3 s file timeout on base. Under Node 26.4.0 the timeout guard passes 2/2 (5.0 s). This isolates the interpreter defect for that arm without claiming a full native gate or exonerating the unmatched simulation fingerprint. No corrective code is authored from this invalid arrangement; the next owed act is the properly arranged measurement.
