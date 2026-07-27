# Queue guard ancestry union

**Slice:** `lane-queue-guard-ancestry-union`  
**Verdict:** READY-FOR-GATES

## Change

`scripts/drain-block-check.mjs --queue` now refuses a matched leaf when either:

1. `status` is still in `TERMINAL_SHIPPED_STATUSES`; or
2. its recorded `mergeHash` exists as a commit and is an ancestor of `main`.

The ancestry helper uses argv-only `execFileSync` calls, verifies the commit with
`git cat-file -e -- <hash>^{commit}` before `git merge-base --is-ancestor -- <hash> main`,
times out each call after 2 seconds, and returns `false` on every failure. The status arm
short-circuits the ancestry probe. Both Git calls are inside the `--queue` branch; the
default path runs no Git subprocess.

The existing `⛔ ALREADY SHIPPED` and `mergeHash="..."` lines remain. A third line names
the arm: `status="<word>"` or `mergeHash is an ancestor of main (status="<word>")`.

## Mutation controls

The scratch directory held a copied `tasks/goals.json`; the tracked file was never edited.
`GIT_DIR`/`GIT_WORK_TREE` kept Git ancestry queries anchored to this worktree while the
guard read the scratch data.

| Direction | Exact command | Expected | Actual |
|---|---|---:|---:|
| Positive: unknown status with a real ancestor hash | `jq '(.. \| objects \| select(.id? == "e1-engine")).status = "banana"' tasks/goals.json > "$scratch/tasks/goals.json"` then `(cd "$scratch" && GIT_DIR="$git_dir" GIT_WORK_TREE="$repo" node "$repo/scripts/drain-block-check.mjs" 045-megaproject-site-mechanic.md --queue)` | exit 1, ancestry arm | **exit 1**, `refusal arm=mergeHash is an ancestor of main (status="banana")` |
| Negative: real unfinished leaf with a non-ancestor hash | `cp tasks/goals.json "$scratch/tasks/goals.json"` then `(cd "$scratch" && GIT_DIR="$git_dir" GIT_WORK_TREE="$repo" node "$repo/scripts/drain-block-check.mjs" lane-calibrate-suite-workers.md --queue)` | exit 0, CLEAR | **exit 0**, `status="diagnosed"` |

Defensive missing-object check: a scratch copy gave the non-terminal
`queue-guard-ancestry-union` leaf `mergeHash="deadbeefdeadbeefdeadbeefdeadbeefdeadbeef"`;
the guard returned **exit 0 CLEAR**, with no throw or hang.

## Default-contract sweep

A pristine `git show main:scripts/drain-block-check.mjs` copy and the modified script were
run against all **127** current leaf `taskFile`s plus `lane/m3`, `--all`, and an
`OWNER-GATED-...-do-not-drain-...` done-move filename. Every shape ran plain and with
`--strict`.

| Measure | Result |
|---|---:|
| Comparison cases | 260 |
| Process invocations (before + after) | 520 |
| stdout/stderr/exit-code diffs | **0** |

This exceeds the task's 126-leaf snapshot because `main` now also contains this slice's
`planned` goal leaf. The result is byte-identical default output, and the ancestry call
site is reachable only after `if (queue)`.

## Queue-mode sweep

All 127 current leaves were run with `--queue` against the pristine and modified scripts.

| Result | Before | After |
|---|---:|---:|
| Status-arm shipped refusals (`merged` 115 + `shipped` 8) | 123 | 123 |
| Ancestry-only shipped refusals in current data | 0 | 0 |
| Existing BLOCKED refusals | 1 | 1 |
| Total exit-1 refusals | **124** | **124** |
| Clear leaves (`diagnosed` 2 + `planned` 1) | 3 | 3 |
| Previously refused leaves cleared after | — | **0** |

`rf-34-hero-y-restore-roundtrip` remained on the existing **BLOCKED** path before and
after; it never reached the shipped notice. The ancestry arm adds no refusal in today's
data, matching the measured premise, while the positive mutation proves the next unknown
status word is refused.

## Build gates

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **exit 0, clean** |
| `npm run build` | **exit 0, green** (`vite` built in 1.44s; asset diet completed) |

Both gates are **vacuous for this scripts-only diff**: `tsconfig.json` includes
`src`, `e2e`, and `playwright.config.ts`, not `scripts/`; the build does not execute this
CLI's queue branch. The CLI sweeps and mutation controls above are the substantive gates.

## Scope

At this pre-auto-commit handoff, `git status --short` is exactly:

```text
 M scripts/drain-block-check.mjs
?? reviews/queue-guard-ancestry-union.md
```

`git diff --name-only main...HEAD` is necessarily empty before the runner performs its
automatic commit because this lane has no unique commit yet. (`main` advanced by two
bookkeeping-only commits during the run; the script, goals, and predecessor-review blobs
remain byte-identical.) After the runner commit, the required command must print exactly:

```text
reviews/queue-guard-ancestry-union.md
scripts/drain-block-check.mjs
```

No `src/`, `e2e/`, `tasks/goals.json`, `--all`, or BLOCKED-path edits were made.
