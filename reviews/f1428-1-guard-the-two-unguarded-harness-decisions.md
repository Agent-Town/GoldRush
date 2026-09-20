# f1428-1 — guard the two unguarded harness decisions

- **Slice:** `f1428-1-guard-the-two-unguarded-harness-decisions` (ladders F-1428-1)
- **Branch / tip:** `lane/m3` @ `61676832` (base `df6b346d`)
- **Drained by:** s1430 fire, 2026-08-03
- **Verdict:** ✅ **MERGE** — both manufactured red/green pairs reproduced independently, and the control run on clean main proves the arms are aimed at the right thing.

## What it does

F-1428-1 recorded that s1428 broke every load-bearing decision in the `f1426-2` diff and **two survived deletion green**: `exactCountMismatch` (the exactness guard on `file:line` subjects) and `labelFor` (the summary-table label renderer). Both were proved load-bearing by direct probe, and neither had a test.

This slice adds exactly two `--self-test` arms to `scripts/concurrency-class-rate.mjs`, both inside `selfTest()`:

1. a same-line `file:line` subject (`e2e/a.spec.ts:9`, two distinct tests sharing the line) asserting the `executions=4/2` throw — the case only `exactCountMismatch` catches;
2. a `writeSummary` render over a bare-file subject asserting `S1:4` / `S1:9` are present and the output contains no `undefined` — the case only `labelFor` prevents.

**Scope is coverage only.** The diff is `+22 / −0`, one file, entirely within `selfTest()`. The two decisions under test were firewalled by name in the master and are byte-unchanged — a task permitted to edit its own subject can always turn a red green the wrong way.

## Evidence

Gates run in a detached worktree `worktrees/gate-s1430` (§3.0b — no undecided content in main's working tree at any point).

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc 0 |
| `npm run build` | green, 1.74s |
| `npm run test:node-guards` | **rc 0** (all legs; blocker-panel / ruling-propagation / desk-declaration PASS) |
| `--self-test`, merged tree | rc 0, **6 arm lines** |
| `--self-test`, clean main | rc 0, **4 arm lines** |
| Adjacent suites | **none** — `grep -rln "concurrency-class-rate" src e2e scripts package.json` matches only the script itself and `tasks/goals.json`. Zero code consumers, no runtime surface, no player surface. |
| Firewall | three-dot diff = 1 file, 22 insertions, 0 deletions; `exactCountMismatch` and `labelFor` byte-unchanged |
| Merge classification | `scripts/concurrency-class-rate.mjs` **LANE-TOUCHED only** — `git log df6b346d..main -- <file>` is empty, main never moved it. Clean copy, no graft. |

### The acceptance: two manufactured red/green pairs

s1429 set the acceptance explicitly — *the two red/green pairs, not the self-test's green* — because a report of passing tests proves nothing about a guard whose defect is that it passes. The runner quoted both reds; **a quoted red is a claim**, so both arms were re-run here against the merged tree.

| Mutation | Merged tree | Signature | Restored |
|---|---|---|---|
| `exactCountMismatch` → `false` | 🔴 **rc 1** after 2 arms | `AssertionError [ERR_ASSERTION]: Missing expected exception.` | 🟢 rc 0, 6 arms |
| `labelFor` → `labels.get(row.subject)` | 🔴 **rc 1** after 3 arms | `AssertionError: The input was expected to not match the regular expression /undefined/` | 🟢 rc 0, 6 arms |

Each red lands on **exactly the new arm** that defends it (arm 3 and arm 4 respectively), file restored byte-identical after each probe.

### The control — what makes those reds mean anything

A guard that is red on the broken tree *and* on the fixed one certifies nothing. Both mutations were therefore replayed against **clean main's version of the file** in the same worktree:

```
main baseline:                      rc=0 arms=4
DELETE exactCountMismatch on MAIN:  rc=0 arms=4 -> STAYED GREEN (undefended)
DELETE labelFor        on MAIN:     rc=0 arms=4 -> STAYED GREEN (undefended)
```

Green on main, red on the merged tree, in both directions. That is the pair F-1428-1 asked for, and it independently re-confirms the finding's original claim.

### Arm count before and after

4 → 6 printed arm lines: **+2, not a replacement.** s1429 demanded the count be stated on both sides precisely so a ladder that silently swapped out an existing arm could not pass as a green; every pre-existing arm still prints and still passes.

ℹ️ The runner's report states "Arms: 5 → 7". That is not a discrepancy in the delta — it counts the worker-ceiling line (which exercises accept 1,2 / reject 3,6 in one printed line) differently than a raw count of `self-test … arm` lines does. **Both readings agree on +2 and on which arms are new.** The measurement recorded above is this fire's own, by line count, stated so the next reader can reproduce the number rather than choose between two.

## Findings

### 🟢 F-1430-1 (new, non-blocking, laddered) — the summary header renders `[object Object]`, and the arm added to defend summary rendering steps right over it

`writeSummary` builds its header at `scripts/concurrency-class-rate.mjs:260`:

```js
`- Schedule: ${state.runs} interleaved cycles × workers ${state.workers.join(' → ')}`
```

At the call site (`:92`) the state is `{ ...options, initialHead, baseURL, runs }` — the local `runs` **record array** shadows `options.runs`, the numeric cycle count the sentence is written for. Reported by the runner as an adjacent finding; **verified here rather than inherited**, by rendering the summary the new arm itself produces:

```
- Schedule: [object Object] interleaved cycles × workers 1
```

*(First attempt at this probe failed with `ReferenceError: summary is not defined` — my instrument's bug, not the subject's: `summary` is block-scoped inside the `try`. Re-anchored inside the block; subject verified byte-untouched afterwards.)*

Two things worth separating:

- **Pre-existing, not introduced.** Line 260 is unchanged by this diff and reads the same way on main. This slice is not the cause and merging it does not make it worse.
- **But the new arm is blind to it, which is the interesting half.** The `labelFor` arm renders the full summary and asserts `doesNotMatch(summary, /undefined/)` — and then passes over a visibly broken line two rows above the table it inspects. The arm defends the *cell* labels while the *header* of the same document is malformed. This is F-1426-2's shape at one more remove: a green certifies the narrow thing it was pointed at, not the artifact it rendered.

**Non-blocking:** a factory measurement instrument with zero player surface; the damage is a wrong sentence in a report header. **Cure:** carry the cycle count under a distinct key (`cycles: options.runs`) and assert `doesNotMatch(summary, /\[object Object\]/)` in the same arm — the assertion is one line and closes the class, not the instance.

🚫 **Do not "cure" F-1430-1 by deleting the `- Schedule:` line.** The header is how a reader of `rates.md` knows what schedule produced the table; a report that omits its own provenance is worse than one that prints it badly.

## Custody

Gate worktree `worktrees/gate-s1430` (detached at `d033d6e4`), `node_modules` symlinked. No undecided content entered main's working tree; main received only the decided file, path-scoped, after every gate was green. All probe mutations were applied to the worktree copy and reverted byte-identically (verified by string comparison, not by `git status`).
