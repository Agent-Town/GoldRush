# Review — suite-red-inventory-guard-discriminator

- **Slice:** `lane-d-suite-red-inventory-guard-discriminator` (F-1200-3 + F-1200-2)
- **Branch / tip:** `lane/perf` @ `d3d5ce6c` (runner commit), base `c4aa5ad1`
- **Master:** `c4aa5ad1` (authored s1200) · **Run log:** `tasks/runs/20260729-064849-lane-d-lane-d-suite-red-inventory-guard-discriminator.md.log`
- **Drained by:** s1201 fire, 2026-07-29
- **§3.0 `drain-block-check`:** ✅ CLEAR — run FIRST, before classification and before I formed an opinion (`factory-suite-red-inventory-guard-discriminator`, status `queued`; 2 leaves matched, longest wins).

## Verdict

**MERGE.** The slice does exactly what its master demanded and nothing else. Its central claim — that the guard named for the absolute-path defect did not actually test that defect — **I re-derived myself before merging, and the cure I verified by mutation after merging.** Both halves of the finding are cured; only one of them is guarded (F-1201-2 below).

## What it does

`scripts/suite-red-inventory.test.mjs` gains **two assertions inside an existing `test()`** (no new `test()`, so the guard count is unchanged):

1. `assert.ok(markdown.includes(\`| ${SPEC_PATH}:3 |\`))` — pins the **"Failing file:line" column**, which is the column that actually travels through `relative()`'s `isAbsolute` branch. This is precisely the blind spot F-1200-3 named: the test previously asserted only on the **spec-file** column, and Playwright stores `spec.file` *relative* to `rootDir`, so that column never exercises the branch at all.
2. A blanket negative: no line except the `- Run tree:` provenance line may contain the absolute fixture path.

`scripts/suite-red-inventory.mjs` renames one caption, `resolved test bodies` → `resolved masking-row test bodies` (F-1200-2: a statistic must name its denominator — `222/270` counts the masking rows' executions, not the report's 303 reds).

## Evidence

| Gate | Result |
|---|---|
| `drain-block-check` (§3.0, first command) | ✅ CLEAR |
| `npx tsc --noEmit` | clean (no output); `scripts/**` remains outside tsconfig |
| `npx vite build` | exit 0, built in 1.48s |
| node-guard battery, 14 files (**clean main, pre-merge baseline**) | **72 tests / 72 pass / 0 fail, exit 0**; ticker exit 0 |
| node-guard battery, 14 files (**merged tree**) | **72 tests / 72 pass / 0 fail, exit 0**; ticker exit 0 |
| `node scripts/run-guards.mjs --only test:node-guards` (main) | `PASS rc=0 12s — guards: 1/1 passed` |
| Guard count | **72, unchanged** (2 assertions added inside an existing `test()`, no new `test()`) — as the master predicted |
| `logs/suite-red-inventory.md` | **untouched** (absent from `git status`), as the master forbade by name |
| Player surface | **zero `src/` and zero `e2e/` bytes** ⇒ no browser probe or screenshots required (m3-05e/m3-05f precedent) |

Baselines were **measured, not inherited** — the 72/72 on clean main was produced by running the battery before the merge, not read from s1200's handoff.

### Merge classification

Two-dot `main..lane/perf` shows 4 files, but the lane's **own commit** (`d3d5ce6c^..d3d5ce6c`) touches exactly **2**:

| File | Class |
|---|---|
| `scripts/suite-red-inventory.mjs` | **LANE-TOUCHED** — applied |
| `scripts/suite-red-inventory.test.mjs` | **LANE-TOUCHED** — applied |
| `STATUS.md` | **MAIN-MOVED-ONLY** — stale base (`c4aa5ad1`), not applied |
| `logs/session-scratch/s1200-handoff.mjs` | **MAIN-MOVED-ONLY** — stale base, not applied |

`git diff --name-only c4aa5ad1..main` = `STATUS.md`, `logs/session-scratch/s1200-handoff.mjs` — **zero overlap** with the lane's two files, so no 3-way graft was needed and no conflict existed. Firewall respected: exactly the two permitted files changed.

### The mutation controls — mine, not the run's

The master's gate was **observe-first**: the run had to *see* the weak guard pass under the defect before strengthening it. Reusing a run's own controls lets the work mark its own homework, so I rebuilt the mutation and aimed it at the **subject**, never at the guard.

**m-own-1** — revert `relative()`'s absolute branch to the F-1198-2 defect (`path.relative(runRoot, file)` → `path.relative(ROOT, file)`):

| Tree | `renders absolute raw paths relative to the recorded tree` | Battery |
|---|---|---|
| **main, pre-merge** | ✔ **PASSED** — the defect it is named for | 2 fail / 5 pass |
| **merged** | ✖ **FAILED** | 3 fail / 4 pass |

⇒ **F-1200-3's premise re-derived independently, and the cure verified.** The pre-merge pass is the finding; the post-merge fail is the fix.

**And it fails on the right assertion.** The failure message is `assert.ok(markdown.includes(\`| ${SPEC_PATH}:3 |\`))` at `:138` — the *file:line* column, i.e. the exact branch the defect lives in, not the broad negative. The discriminator is aimed at the defect's own branch, not merely correlated with it.

Subject restored after each control and hash-checked: pristine `58ec4538…c581b2` (an **independent match** to the master's stop-check, proving main had not moved under the run), final `310a97c0…488a9e` (an independent match to the run's reported restored SHA).

## Findings

### F-1201-1 — 🔻 the run's escalated "pre-existing master defect" does not exist in the source it cites

The run report escalates: *"The aggregate node-guard command is pre-existing red in `scripts/whole-suite-collection.test.mjs`: the regex literal uses `/Total: [1-9]\\d* tests/`, which matches a backslash rather than digits."*

✓ **Refuted at the source.** `scripts/whole-suite-collection.test.mjs:9` reads `assert.match(result.stdout, /Total: [1-9]\d* tests/)` — a single backslash, i.e. the correct digit class. The doubled `\\d` is an artifact of the run's **own report rendering**, not of the file. The sibling `scripts/town-spec-collection.test.mjs:17` carries the identical (correct) literal.

✓ **And refuted at the symptom, in both trees, quiet:** the guard passes on clean main (inside the 72/72 battery), passes standalone in the **lane-d worktree where the run executed**, and `run-guards --only test:node-guards` returns `PASS rc=0`.

The most likely explanation for the run's observed exit 1 is **contention** — this guard shells out to `npx playwright test --list` with no cwd override and takes ~1.5 s of a live collection, exactly the shape that goes red under a loaded box (the standing gate-contention pattern). A quiet green does not disprove a load-induced red, so the *symptom* stays open as environmental; the **mechanism is definitively false**.

⚠️ **Why this matters more than its size:** a fire that trusted this report would have queued a slice to "fix" a **correct** regex. The dangerous outcome was never a wasted lane — it was editing a working guard to cure a phantom. *An escalation is a testable claim; test it against the file, not the report.*

**Non-blocking.** No corrective needed beyond this record: there is nothing to repair.

### F-1201-2 — 🔻 the F-1200-2 half of this slice is unguarded and can silently regress

The caption fix is real and present, but **nothing pins it**. Control **m-own-2**: revert `resolved masking-row test bodies` → `resolved test bodies` (the exact F-1200-2 defect) ⇒ **7/7 pass, exit 0, zero failures**.

The nearest assertion is `markdown.includes(\`- Run tree: **${rootDir}**; status **present**;\`)`, which stops at the semicolon **immediately before** the denominator label — it pins the prefix and not the word under repair. So the very statement F-1200-2 was raised about is the one part of this slice a future edit can undo without any guard noticing.

**Non-blocking** — the cure shipped and is correct; only its durability is missing. One assertion extending the existing `- Run tree:` check to include the caption closes it. Recorded in `BACKLOG.md`; not authored as a slice this fire (a one-assertion lane task is worse than the finding).

## Merge

Path-scoped: `scripts/suite-red-inventory.mjs`, `scripts/suite-red-inventory.test.mjs`, this review, the done-move rename, `tasks/goals.json`, `tasks/BACKLOG.md`.
