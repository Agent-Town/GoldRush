---
source: codex
project: Gold Rush
date: 2026-09-29
type: solution
---
# Lane evidence trace guard — attempt 2

READY-FOR-GATES. The lane copy now withholds raw Playwright output and oversized artifacts at the auto-commit boundary, measures staged evidence, and trims eligible artifacts to the 25,000,000-byte task budget. Disk files are retained. The drain's default 40,000,000-byte gate is unchanged.

## Pre-flight and scope

- Branch: `art/portraits-e5-e10-generated`; predecessor `a444adb6b24999e02a22e2817e6bd391a054783b` contains only attempt 1's report. Preserved under the task's BUILD-ON-PREDECESSOR authorization; no reset or clean.
- Initial status: only untracked `node_modules`, the expected symlink to the primary checkout's dependencies. No evidence discarded and no foreign source changes.
- Skipped the contradictory generic install step because this task explicitly forbids `npm install` / `npm ci` in this symlinked lane. Pre-edit `npm run build`: exit 0.
- Read lane AGENTS, runner commit boundary/callers, evidence budget, retention law, and F-2742-1 in the primary BACKLOG (the stale lane copy lacks that incident row). The amended task expressly authorizes editing this inactive lane copy.
- Only the three implementation/test paths and this task's artifact directory changed. No primary runner, dispatch, pre-flight, lane-safety, law text, source, e2e, tasks, specs, reviews, logs, or STATUS edits.
- Read the shared vault's Gold Rush MOC and attempt-1 blocker note. Durable findings are recorded here; the task's TOUCH-ONLY firewall prevents writing a separate vault note.

## Root cause and resulting behavior

The existing delta filter excluded factory accounting and baseline-owned dirt, but accepted test-result trees, raw traces/videos and arbitrarily large artifacts. Later drain measurement cannot prevent those blobs from already entering commit history. Further, path-scoped `git commit` reads the working tree again: unstaging a file alone does not withhold it.

The guard excludes root-level and nested matches for:

- `**/test-results/**`
- `**/*-results/**`
- `**/trace.zip`
- `**/*.webm`
- `**/test-failed-*.png`
- Any regular file under `artifacts/**` whose `stat` size is greater than 50,000,000 bytes, regardless of extension (macOS and GNU stat forms).

Matched rename pairs are withheld together. Task-staged raw paths are restored in the index to HEAD before budget measurement; dispatch-baseline index entries are preserved. Withheld paths never enter the runner's add/commit path list. No withheld disk file is removed or rewritten.

Each path is logged in `withheld …` form and appended to `<run-log-stem>-withheld-paths.txt` beside its run log. The run-specific stem avoids collisions between concurrent lanes sharing `tasks/runs/`. Raw, budget and existing factory-accounting counts are logged separately; receipt lines provide a combined path count. Retries append receipts instead of truncating them.

Before committing, the runner invokes the staged budget CLI against `merge-base main HEAD` (HEAD fallback for a repository without main). `--staged` compares the actual index to that base, counting additions and positive growth without crediting deletions. Eligible staged artifacts are sorted by index blob size, largest first; each withheld path is reset in the index AND removed from the commit list. The budget is remeasured after each removal. Exactly 25,000,000 bytes is accepted.

Adaptation: the Node fixtures live in the task-named `scripts/evidence-budget.test.mjs`, using the runner's existing `LANE_RUNNER_COMMIT_PROBE`; the existing shell runner guard remains unmodified and was run separately. This keeps one edited test file and provides the requested `node --test` entry point.

## Diff by file and line

Full patch: `implementation.diff` in this directory.

| File | Lines in resulting file | Change | Diff |
| --- | --- | --- | --- |
| `scripts/lane-runner-v3.sh` | 41–65, 115–117, 136–152 | Run receipt, raw/size filter, factory receipt, paired rename exclusion and safe unstaging | +84 / -1 overall |
| `scripts/lane-runner-v3.sh` | 162–217 | Staged budget CLI, largest-first index trimming, commit-list filtering, measurement-error receipt and counts | Included above |
| `scripts/evidence-budget.mjs` | 14–15, 89–110, 145–180 | Optional index measurement, staged CLI/default HEAD and flag parsing | +16 / -11 |
| `scripts/evidence-budget.test.mjs` | 14, 207–315 | Seven added behavioral cases through real git repositories and the runner commit probe | +111 / -1 |
| `artifacts/lane-evidence-trace-guard-1/**` | This report and named evidence files | Replaced predecessor blocker report; added commands' output, fixture receipts and patch | Evidence only |

## Verification

| Check | Result | Evidence |
| --- | --- | --- |
| Pre-edit `npm run build` | Exit 0 | Observed before edits; completed asset diet |
| `bash -n scripts/lane-runner-v3.sh` | Exit 0 | Executed after implementation |
| `node --test scripts/evidence-budget.test.mjs` | Exit 0; **21/21**, zero skips/failures; 14 existing + 7 new | `guard-tests.txt` |
| `bash scripts/runner-commit-decoupling-guard.test.sh` | Exit 0; **13 checks**, zero failures, including four red/reverse controls | `adjacent-runner-tests.txt` |
| `node scripts/evidence-budget.mjs --staged` on clean index | Exit 0; 0 added bytes | `clean-index-budget.txt` |
| `npx tsc --noEmit` | Exit 0 | `tsc.txt` (empty success output) |
| Post-edit `npm run build` | Exit 0 | `build.txt` |
| `git diff --check` | Exit 0 | Executed after implementation |
| `git diff --exit-code -- src` | Exit 0 | Unchanged source tree hash below |

Measured fixture results:

- Both untracked and task-prestaged variants withhold **11 raw/oversized paths**, including a **51,000,000-byte** `artifacts/big.bin`; an additional factory-accounting path gives **12 receipt lines**. Only ordinary `artifacts/task/report.md` is committed. Every raw file's disk size is asserted unchanged. See `raw-fixture-run.log.txt` and `raw-fixture-withheld-paths.txt`.
- The **26,000,006-byte** budget fixture withholds its **17,000,000-byte** largest artifact and commits the 9,000,000-byte artifact plus six-byte report: **9,000,006 added bytes** remain. Withheld disk size is unchanged and index is clean. See `budget-fixture-run.log.txt` and `budget-fixture-withheld-paths.txt`.
- Exact **25,000,000-byte** evidence commits without withholding.
- A modified artifact of **26,000,000 bytes** stays intact on disk while its **1,000-byte** HEAD version remains committed; the report still commits.
- A staged rename into `artifacts/x-results/` withholds both sides and retains the moved disk file.
- Staged CLI fixture counts **101 bytes** against the specified base, **71 bytes** against default HEAD, and ignores the unstaged 9,000-byte overwrite. Limit 100 returns 1; limit 71 against HEAD returns 0; clean index returns zero added bytes.

The first fixture run exposed a task-prestaged raw-file defect in the draft: raw files stayed in the index and consumed the budget, withholding the report. Fixed before the final 21/21 run by unstaging task-owned raw entries. No unresolved test failures.

Build warnings were non-fatal: Vite's future native-config import warning, large chunks, Node experimental glob, GLB UV quantization, and the existing unrecognised atlas tier warning. No player/runtime changes; browser tests are not applicable to this script-only slice.

Source tree before and after: `0ad2e09525f941a4d5d5c2e5176306c0efbbd4c0`.

## Retention-law pointer shift

Net **+83 lines** above the untouched retention text:

- Old **565 → 648**: existing `.git` scratch sweep.
- Old **567 → 650**: `# It was: find ... -mtime +3 -delete` epitaph.
- The following CLAUDE.md retention-law comment moves **568 → 651**.

The lines themselves and CLAUDE.md were not edited. The drain owns rebasing any numeric pointers.

## Limits and handoff

The guard governs `commit_lane_delta` only, as authorized. Already committed lane history, baseline-owned staged evidence and `reviews/shots-*` cannot necessarily be brought below 25 MB by withholding task-owned artifacts. If those leave an unavoidable excess, the runner logs it without failing the run; the 40 MB drain gate remains the verdict. A budget measurement error withholds the auto-commit and retains disk/index data for diagnosis. Existing art-slot commit routes are outside this task's firewall and unchanged.

Predecessor: `a444adb6b24999e02a22e2817e6bd391a054783b`. The implementation commit is identified by `git log -1 --format='%H %s' -- scripts/lane-runner-v3.sh`; its full hash is also supplied in the final handoff.

REMAINING LIST IN ORDER:

1. Orchestrator gates and integration.
2. Drain re-bases law pointers using 565 → 648 and 567 → 650.

No implementation work remains in this slice.
