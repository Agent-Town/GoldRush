# Drain review: `lane-evidence-trace-guard-1`, the lane runner never commits Playwright traces or oversized evidence again (the cause of F-2742-1, cured at the auto-commit)

**Branch** `art/portraits-e5-e10-generated` at `cf56d87c8` · **merge** `f19e79de3` · engine hash unchanged (`99920310`, no pin) · drained attended 2026-09-29 03:46Z in a detached chain worktree with the scratch store at `5793a96`; no deploy (scripts/attended/land.sh, config `teg1`).

**Verdict: LANDED.**

**Slice / branch / tip:** `lane-evidence-trace-guard-1`, lane-d `art/portraits-e5-e10-generated` (the branch name is history; the commits are path-scoped to two scripts, one test file and the task's evidence directory), three commits: `a444adb6b` (attempt 1's report-only stop, preserved as the declared predecessor), `00e7839ba` (the implementation) and an attended 5-line review fix (the runner fixture's teardown, see F-TEG1-3), Astra gpt-6-astra, 40,431 + 77,722 tokens, 2026-09-29 02:07Z to 02:35Z. Attended landing under `land-held.sh`; scripts only, engine hash unchanged.

**What it does.** From F-2742-1 (2026-09-28): the runner's auto-commit swept six Playwright `trace.zip` files of 76 to 108 MB into a lane commit, GitHub's pre-receive limit then refused every push of `main` for eleven hours, and the 25 MB task budget and 40 MB drain ceiling could only measure the damage afterwards. `commit_lane_delta` in `scripts/lane-runner-v3.sh` now refuses, at the moment of the commit, every path matching `**/test-results/**`, `**/*-results/**`, `**/trace.zip`, `**/*.webm` or `**/test-failed-*.png`, and any regular file under `artifacts/**` larger than 50,000,000 bytes by `stat` (macOS and GNU forms); rename pairs are withheld together; each withheld path is logged in the existing `withheld …` form and appended to `<run-log-stem>-withheld-paths.txt` beside the run log (append-only, so a retry keeps the earlier receipt); task-staged raw files are unstaged so they cannot inflate the budget, while index entries that belonged to the dispatch baseline are never touched; nothing is deleted from disk (Retention Law). Before committing, the runner measures the index against `merge-base main HEAD` with the new `--staged` mode of `scripts/evidence-budget.mjs` and withholds the largest staged `artifacts/**` blobs, one at a time, until the 25,000,000-byte task budget fits, printing each. A measurement error withholds the auto-commit itself with an explicit receipt line rather than committing blind (fail-closed; disk and index retained). The drain's 40 MB ceiling remains the verdict.

**Evidence (real numbers, from the run's report, re-run by the landing where marked).**

| Check | Result |
|---|---|
| `node --test scripts/evidence-budget.test.mjs` | 21 of 21 (14 existing + 7 new fixtures through real git repositories and the runner's `LANE_RUNNER_COMMIT_PROBE`); re-run attended on the lane tree, and by this landing's named guard |
| `bash scripts/runner-commit-decoupling-guard.test.sh` | 13 checks, 0 failures, four red/reverse controls (`adjacent-runner-tests.txt`) |
| Raw/oversized fixture | 11 paths withheld in both the untracked and the task-prestaged variants, including a 51,000,000-byte `artifacts/big.bin`; the factory-accounting path makes 12 receipt lines; an ordinary `artifacts/<task>/report.md` commits |
| Budget fixture | 26,000,006 bytes staged: the 17,000,000-byte largest artifact withheld, the 9,000,000-byte artifact and the six-byte report committed (9,000,006 added bytes remain); exactly 25,000,000 bytes commits untouched; a 26,000,000-byte modified artifact stays intact on disk while its 1,000-byte HEAD version remains committed |
| Rename fixture | a staged rename into `artifacts/x-results/` withheld on both sides, the moved disk file retained |
| `--staged` CLI | 101 bytes against the given base, 71 against default HEAD, the unstaged 9,000-byte overwrite ignored; limit 100 returns 1, limit 71 returns 0; clean index 0 added bytes, rc 0 (re-run attended) |
| `bash -n scripts/lane-runner-v3.sh` / `npx tsc --noEmit` / `npm run build` | rc 0 / rc 0 / rc 0 (`build.txt`); `git diff --check` clean; `src/**` tree hash unchanged before and after (`0ad2e09525f9…`) |
| Evidence budget of the two commits | 0.4 MB added, inside the 40 MB ceiling |
| Runner pointer shift | +83 lines above the untouched Retention epitaph: old `:565` → `:648` (the `.git` scratch sweep), old `:567` → `:650` (the `find … -mtime +3 -delete` epitaph); the epitaph text itself unchanged. CLAUDE.md has carried no runner coordinates since its 2026-09-25 compaction; `node scripts/law-pointer-guard.mjs` green on the lane tree (attended) and measured again by this landing |
| Merge | `git merge-tree` clean against main (0 conflicts) |
| First landing battery (02:57Z to 03:18Z) | 1,047 Node tests, 1,041 pass, 3 skipped, 1 fail: `fixture-teardown.test.mjs` (1,139 s) found six surviving `lane-evidence-receipt-*` temp directories, all from the new `runnerFixture` helper, whose comment claimed `landing()` owned its cleanup (it owned only `root`). Fixed on the lane with `t.after(() => rmSync(scratch …))`; the single file under a scratch `TMPDIR` then ran 21/21 with 0 survivors; the second landing battery is the verdict |

**Merge classification.** Base: main at the chain cut. Lane-touched: `scripts/lane-runner-v3.sh` (the auto-commit's withhold logic only, inside `commit_lane_delta`), `scripts/evidence-budget.mjs` (the `--staged` mode and flag parsing), `scripts/evidence-budget.test.mjs`. New: `artifacts/lane-evidence-trace-guard-1/**` (report, `implementation.diff`, fixture receipts, `build.txt`, `tsc.txt`). No `src/**`, `e2e/**`, `functions/**`: `hash: unchanged`. Conflicts: none.

**Findings.**
- **F-TEG1-1 (non-blocking, by design):** a failed budget measurement (the CLI's rc 2, or the trim step throwing) withholds the runner's auto-commit entirely, with the receipt line `withheld auto-commit: evidence budget could not be measured; disk and index retained`. The master asked for "never fail the run"; the run's rc is indeed unaffected, but Codex work left uncommitted would then wait in the worktree for the drain. Watch run logs for that line; if it ever fires on a healthy tree, a fail-open arm (commit with a receipt) is a one-line follow-up.
- **F-TEG1-2 (attended duty):** the live runner process (pid of `bash scripts/lane-runner-v3.sh`, started 2026-09-20) keeps executing the old inode until restarted, so the guard protects nothing until the restart. Done attended after this landing, in a lane-idle window, by the repo's restart recipe; recorded in the handover with the new pid.
- **F-TEG1-3 (fixed on the lane before landing):** the new runner fixture left its receipt scratch directory behind on every use (six per battery); the fixture-teardown guard caught it in the landing battery exactly as designed. Five lines, attended, inside the review-fix remit.
- **F-ATT-12 (recorded on the task row):** attempt 1 self-blocked on my firewall clause; the corrected wording is in the master and in memory.

### Evidence (this drain's gates on the merged tree)
| Check | Result |
| --- | --- |
| tsc / build / e1 | `0 / 0 / 0` |
| law-pointer | `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 158 ℹ fail 0` |
| the ledger battery | `rc=0 ℹ tests 1263 ℹ pass 1260 ℹ fail 0 ℹ skipped 3` |
| e2e both projects, --workers=1 | `rc=0   24 passed (1.9m)  03:27Z` |
| full npm run test:node-guards (before the pin) | `rc=0 ℹ tests 1047 ℹ pass 1042 ℹ fail 0 ℹ skipped 5 ℹ tests 87 ℹ pass 87 ℹ fail 0 ℹ skipped 0  03:46Z` |
| engine hash | `merged: 999203109481b7906b00e957ee739ca015b05a692201f039b4a3062a2f344bd4 (pinned 999203109481b7906b00e957ee739ca015b05a692201f039b4a3062a2f344bd4)` |
