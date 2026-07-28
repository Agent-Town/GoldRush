# Task lane-d-suite-red-inventory-run-tree-invariance: make `scripts/suite-red-inventory.mjs` resolve every path and every body statistic against the tree the RAW names — so the report is byte-reproducible from any checkout, and says what it could not measure instead of silently ranking it safest (LANE-D, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s1199, 2026-07-29.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-d`.

READ FIRST: `AGENTS.md`; `scripts/suite-red-inventory.mjs` (all 325 lines — but the four sites you will touch are `relative()` at `:57-63`, `testBody()`'s source read at `:111`, the `masking` build+sort at `:208-218`, and the report header block at `:229-247`); `scripts/suite-red-inventory.test.mjs` (all 94 lines — **the house pattern you extend, not replace**: black-box `spawnSync` of the real script, `node:test` + `node:assert/strict`, fixtures under `os.tmpdir()`, one `test()` per claim. ⚠️ Its fixture at `:15-34` builds errors as `error: { message: 'fixture failure' }` — **no `location`, no `stack`, so no file path ever reaches `relative()`'s absolute branch. That is the blind spot this task exists to close; scope 5a fixes the fixture.**); `tasks/BACKLOG.md:86` (F-1198-2, the finding this task supersedes in part — read it, then read §"What the authoring fire measured" below, which CORRECTS it); `logs/suite-red-inventory.md` (the canonical artifact — **read it, do NOT regenerate or edit it**, see the Firewall for why); `package.json` (`test:node-guards` — an EXPLICIT ENUMERATED LIST of **14** files; you are not adding a file to it).

CODEX: gpt-5.6-sol effort=medium

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main OR is preserved on another ref (verify via git log/diff/for-each-ref), it is a SAFE DUPE → `git checkout -B lane/perf main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main and NOT on any other ref (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

> ✅ **THE AUTHORING FIRE MEASURED `lane/perf`'s STATE AND IT IS A PLAIN SAFE DUPE — RESET AND PROCEED.** `lane/perf` is **1 ahead** of main at `57fc65ed` "runner(lane-d): lane-d-suite-red-inventory-harness-provenance.md" — that is s1198's work, **already merged to main** as `e23a40ae`. Verified by **two-dot** diff, not by the commit count (a commit count is not a drain signal): `git diff --stat main lane/perf` reports **5 files changed, 4 insertions, 158 deletions** — i.e. the lane is *behind* main, holding no unique bytes; **no `scripts/` path appears**, so both files you are about to touch are already byte-identical between the lane and main. **Nothing is lost by resetting.** ⚠️ **The 171 MB special case that once froze this lane is HISTORY — do not re-apply it.** The raw also lives on `refs/heads/archive/suite-red-inventory-raw-171mb`, and s1197 + s1198 both reset this lane without loss. Confirm in one command before resetting (`git diff --stat main lane/perf` must show **no `scripts/` path**); if a `scripts/` path DOES appear, STOP and report — the premise of this paragraph has changed.

## Why (F-1198-2, `tasks/BACKLOG.md:86`, raised s1198)

Verbatim from the ledger:

> 🔺 **F-1198-2 … THE RED INVENTORY IS STILL NOT REPRODUCIBLE ACROSS CHECKOUTS** … the differing column is **"Failing file:line"** on **409** rows — `relative()` … and error locations in the raw **are absolute** … ➡️ **NOT cured here: the cure is a judgement, not a mechanism** — those absolute paths are genuine provenance, so normalising them destroys information while keeping them makes cross-checkout byte-comparison impossible.

### 🔑 WHAT THE AUTHORING FIRE MEASURED — INCLUDING TWO THINGS THAT CORRECT THE FINDING. DO NOT RE-DERIVE THEM; DO VERIFY THEM IN SCOPE 1.

Everything below was measured this fire against the tracked raw `logs/suite-red-inventory-compact.json`, by running the real script from two different repo roots.

1. **The finding's core claim reproduces exactly.** Same input, same script, only the reducer's own repo root differs: main root → **128,904 B**, lane-d root → **117,408 B**, **409 differing lines**, delta **11,496 B**. The mechanism is real: the raw carries **1,623 absolute `.spec.ts` strings, every one of them under `.../worktrees/lane-d/`**, and `relative()`'s `path.isAbsolute` branch renders them against whatever root the *reducer* happens to sit in.

2. 🚨 **THE FINDING UNDERSTATES THE DAMAGE BY A CATEGORY, AND THIS IS THE REASON THIS SLICE IS WORTH SHIPPING.** Path rendering accounts for only **506 prefix occurrences × 17 chars = 8,602 B** of the 11,496 B delta. The residual **2,894 B across 135 further lines is the entire "Masking candidates" section changing its CONTENT AND ITS ORDER.** `testBody()` at `:111` reads the spec **source** from the reducer's `ROOT`, so from the wrong tree the recorded line numbers do not land inside the parsed test bodies. Measured:

   | Reducer root | Masking rows | Rows with a real `%` | Order is pure-alphabetical? |
   |---|---:|---:|---|
   | main repo root | 135 | **0** | **YES** |
   | `worktrees/lane-d` (the tree the run used) | 135 | **95** | no |

   From main's root **every one of the 135 rows fails to resolve**, each falls to `?? 100` at `:216`, they all tie, and the sort collapses to `localeCompare` on the title — so the section renders **an alphabetical list underneath a header that reads "Ranked by the earliest failing line within the test body. Lower ratios leave more of the test unexercised."** No warning, no count, no marker. **`?? 100` is a "could not measure" value wearing the costume of a "measured, lowest risk" value** — the same class of defect as a probe that executes nothing and reports zero.

3. ✅ **THE FINDING'S DILEMMA IS FALSE, AND THE AUTHORING FIRE PROVED THE THIRD OPTION BY BUILDING IT.** F-1198-2 says the cure is a judgement between *normalise (comparable but lossy)* and *preserve (faithful but incomparable)*. **It is neither: the raw records its own tree.** `report.config.rootDir` = `/Users/robin/Claude/Projects/Gold Rush/worktrees/lane-d/e2e`. Render every absolute path against **that** root instead of the reducer's, state the root **once** in the provenance block s1198 added, and **not one byte of provenance is lost — it is stated precisely once instead of 506 times, and the report becomes byte-identical from anywhere.**

   **This was not reasoned, it was run.** A patched copy of the script placed at two unrelated roots (`/tmp/s1199-proto/A` and `/tmp/s1199-proto/A/B`) produced **117,408 B from both, byte-identical, and byte-identical to the reference output of the run's own tree** — with **188 real-percentage cells restored** and **zero** absolute prefixes.

4. ⚠️ **THE PROTOTYPE ALSO FOUND THE TRAP YOU WILL OTHERWISE FALL INTO — PATCHING THE ABSOLUTE BRANCH ALONE IS NOT ENOUGH.** The first prototype changed only `:59` and produced byte-identical output across roots that was **byte-identical and WRONG**: 0 bodies resolved. Cause: `relative()`'s *relative* branches at `:60-62` decide the `e2e/` prefix with `fs.existsSync(path.join(ROOT, …))`, so from a root with no `e2e/` directory `execution.file` degrades to a **bare filename**, and every later `path.join(runRoot, execution.file)` then misses. **All four sites move together or the change is a decorative no-op.**

5. ⚠️ **AND THE RUN TREE CAN BE GONE.** With `rootDir` pointed at a vanished path, the prototype still produced **byte-identical output across both roots (120,190 B)** with **all 270 body cells honestly `body unavailable`** and **zero fabricated percentages** — correct behaviour. **But its spec paths regressed to bare filenames**, because the naming branches were still asking the *disk*. ➡️ **Binding consequence, scope 2c: no disk probe may decide a rendered path.** The `e2e/` prefix is knowable from the raw alone (`path.basename(config.rootDir) === 'e2e'`), and deriving it from metadata rather than `existsSync` is what makes the output depend on the *input* only.

6. ✅ **THE COMMITTED ARTIFACT IS ALREADY UNREPRODUCIBLE, WHICH IS WHY SCOPE 6 FORBIDS REGENERATING IT.** `logs/suite-red-inventory.md` (119,852 B, blob `dc4c4cbe`) contains **0** `body unavailable` and **38** `callsite outside body`; **every** regeneration possible on this disk today yields **48** `body unavailable`. It was produced against a tree state that no longer exists. **Regenerating it would not refresh it — it would destroy the record and replace it with a worse one.**

## Scope

### 1. Observe-first gate — reproduce the premise before changing anything (MANDATORY; a STOP here is a SUCCESS)

Run the **unmodified** reducer twice, changing only the script's own root:

```
node scripts/suite-red-inventory.mjs logs/suite-red-inventory-compact.json /tmp/before-main.md
node worktrees/lane-d/scripts/suite-red-inventory.mjs logs/suite-red-inventory-compact.json /tmp/before-lane.md
```

(Run both from the same cwd — cwd-invariance is already settled by s1197, so cwd must not be a variable here. `ROOT` derives from the *script's* location, which is what you are varying.)

Record: both byte sizes; the number of differing lines; the count of rows in the "Masking candidates" section carrying a real `(N.N%)` in each; and `report.config.rootDir` read straight out of the JSON.

**Classify and act:**
- **(a) PREMISE HOLDS** — the two outputs differ, and `config.rootDir` is present → proceed to scope 2.
- **(b) ALREADY INVARIANT** — the two outputs are byte-identical → **STOP**, report, change nothing.
- **(c) NO RECORDED ROOT** — `config.rootDir` is absent/undefined → **STOP** and report. Do **not** infer the tree from the absolute paths in the error strings, and do **not** read `playwright.config.ts`; a root derived from anywhere but the raw's own metadata is a fabrication, and reporting *what produced this report* is the entire point.

Keep both files — scope 7 diffs against them.

### 2. Resolve every path against the tree the RAW names

- **2a.** Derive, once, near the top (the `report` parse at `:11` is already above everything that needs it): the raw's recorded root, and whether that tree is readable on this disk. `config.rootDir` points at the **e2e directory**, so the run's repo root is its parent when `path.basename(rootDir) === 'e2e'` — verify that against the tracked raw rather than assuming it, and handle the non-`e2e` case by using `rootDir` itself.
- **2b.** `relative()`'s absolute branch (`:59`) renders against the **run's** root, not the reducer's `ROOT`.
- **2c.** `relative()`'s relative branches (`:60-62`) must **stop asking the disk**. Decide the `e2e/` prefix from the raw's recorded `rootDir` basename. **No `fs.existsSync` may influence a rendered path** — that is the property that makes the output a function of the input alone (measured reason in §5 above).
- **2d.** When the raw records **no** root at all, fall back to today's behaviour exactly, so the existing `reducer output is cwd-invariant` test keeps passing unmodified.

### 3. Compute body statistics ONLY against the tree the run used

`testBody()` at `:111` reads from `path.join(ROOT, execution.file)`. Change it to read from the **run's** root, and when that tree is not readable **return no body** rather than falling back to the local checkout.

⚠️ **The local fallback is not a graceful degradation — it is the bug.** Reading a *different* tree's sources at the recorded line numbers does not produce approximate statistics; it produces the 222 bogus `callsite outside body` cells measured in §2. **Refusing to measure is correct; substituting another tree is not.**

**No `try`/`catch` anywhere in this script** — s1197's F-1197-2 ruling stands (a `try`/`catch` here converts a loud crash into a silently degraded report). Use `existsSync` guards and plain optional access.

### 4. Make the masking section state what it could not measure

- **4a.** A row with **no** measured percentage must **never** be ordered above a row that has one. Today `?? 100` at `:216` ties them all together and lets `localeCompare` masquerade as a risk ranking.
- **4b.** The section must **say** how many of its rows are ranked and how many are unresolved, and **when zero rows resolved it must say so explicitly** instead of presenting an alphabetical list under a "Ranked by…" header. The unresolved rows stay visible — segregate or mark them; do not silently drop them, and do not number them into the same rank sequence as measured rows.
- **4c.** Extend the provenance block s1198 added at `:237` with the run tree and its status (`present`/`unavailable`) and the resolved/total body count. **Additive to that block; every other header line survives byte-identical.**

### 5. Extend the guard — `scripts/suite-red-inventory.test.mjs`

Add tests to the **existing** file (do not create a new one; do not edit `package.json`). At minimum:

- **5a. FIX THE FIXTURE'S BLIND SPOT FIRST — without this every other assertion here is vacuous.** The fixture's errors carry no paths, so `relative()`'s absolute branch never executes under test. Give the fixture an error with an **absolute** `location.file` *and* an absolute path in its `stack` (both routes reach `relative()`; `errorLocation()` at `:90` and `stackLocations()` at `:84`), plus a `config.rootDir` naming that same synthetic tree. **Keep the existing tests passing unmodified.**
- **5b. Root-invariance.** Copy the real script to **two different temporary roots** and assert the two outputs are **byte-identical** for the same input. (Varying cwd is NOT sufficient and does not test this — `ROOT` comes from the script's own location.)
- **5c. Faithfulness, so 5b cannot be satisfied by emitting garbage equally everywhere.** Assert the rendered path is the expected `e2e/<spec>` form and carries **no** absolute prefix and **no** bare-filename degradation.
- **5d. Honest refusal.** Fixture whose `config.rootDir` names a tree that does not exist → the script exits **0**, reports the tree as unavailable, emits **no** invented percentage, and its output is still byte-identical across two roots.
- **5e. An unresolved row never outranks a resolved one** (scope 4a), using a fixture containing one of each.

**The existing three tests must remain green and unmodified.** If your change makes one fail, your change is wrong — fix the subject, never the test.

### 6. Do NOT regenerate or edit `logs/suite-red-inventory.md`

It is a **measurement artifact from a tree state that no longer exists** (§6 above: 0 vs 48 `body unavailable`). Regenerating it destroys the record. If you want to note the new capability, **append** a short dated section at the end — the s1196/s1198 precedent — and touch nothing above it. Appending is optional; regenerating is forbidden.

### 7. Mutation control — refute your own guard (MANDATORY; mutate the SUBJECT, never the test)

A green test proves nothing until you have watched it go red. Perform each, record the exact observed failure, then restore:

- **m1.** Point `relative()`'s absolute branch back at the reducer's `ROOT` → **5b** must FAIL on a byte difference.
- **m2.** Let `testBody()` fall back to the local checkout when the run tree is missing → **5d** must FAIL (an invented percentage appears).
- **m3.** Restore `?? 100` into the ranking comparator → **5e** must FAIL.

After all three, restore the subject and prove it byte-identical (`git diff` empty, or report the blob hash before and after). **If a mutation does NOT turn the guard red, the guard is decorative — say so plainly and do not claim the finding is discharged.**

## Firewall

**TOUCH-ONLY:**
- `scripts/suite-red-inventory.mjs`
- `scripts/suite-red-inventory.test.mjs`
- `logs/suite-red-inventory.md` (**append-only and optional**, per scope 6)

**NO — do not touch, for any reason:**
- **Anything under `src/` or `e2e/`.** This task ships zero runtime bytes.
- `package.json` (the guard file is already enumerated; you add tests to an existing file, so the list does not change).
- `logs/suite-red-inventory-compact.json` — tracked evidence and an input; read-only.
- The measured table, the header numbers, or anything above the appended sections in `logs/suite-red-inventory.md`.
- Any other `scripts/*.mjs`, `tasks/`, `reviews/`, `STATUS.md`, `tasks/goals.json`.
- Do not add `try`/`catch`; do not add a dependency; do not run Playwright; do not shell out to git.

## Self-check before you report READY-FOR-GATES

1. `npx tsc --noEmit` → clean. ⚠️ **State honestly in your report that `scripts/**` is OUTSIDE `tsconfig`'s `include`, so tsc does NOT cover this subject** — the node guard is the only gate on it.
2. `npm run build` → green; record the vite time.
3. **The full guard battery, as an EXIT CODE, not a printed counter** (F-1125-1): run the 14-file `node --test …` list from `package.json`'s `test:node-guards`. 🚨 **The authoring fire measured the pre-change baseline at exactly `tests 68 / pass 68 / fail 0`, by running it, not inheriting it.** Your run must be green at **68 + the number of tests you added**. **Report the new total explicitly** — the drain must broadcast it, because an unannounced change to an expected value becomes the next fire's phantom red.
4. Re-run scope 1's two commands to `/tmp/after-main.md` and `/tmp/after-lane.md`. Report: (a) the two are now **byte-identical to each other**; (b) how each compares to its scope-1 `before` file; (c) the masking section's resolved-row count in each. **The authoring fire's prototype landed on 117,408 B for both, matching the run tree's own output with 188 real-percentage cells — if your numbers differ, say so and explain rather than forcing agreement.**
5. Report all three mutation results verbatim, with the observed failure and the restore proof.
6. **No screenshots, no Playwright, no boot probe — and say why rather than leaving it implied:** this merge moves **zero `src/` and zero `e2e/` bytes**, so Mistake #10's question ("where does the PLAYER see this, in a plain boot?") answers *nowhere, by construction*. Proportionate, not thinned.
7. `git status` in the lane shows **only** the TOUCH-ONLY paths.

READY-FOR-GATES. Report: the scope-1 classification with both byte sizes and `config.rootDir`; the four changed sites; the before→after byte-identity result; the masking section's resolved/unresolved counts and how it now renders when nothing resolves; all three mutation results with restore proof; the new node-guard total (and confirmation the count of guard FILES is still 14); the tsc/build numbers; and any finding you raise — **including against this master, if a premise in it did not survive contact. The authoring fire measured every number above on this disk today; if one disagrees with you, that disagreement is the most valuable thing in your report.**
