# Task lane-d-collection-guards-root-invariance: the two collection guards in the node battery are not root-invariant — they pass only when invoked from the repo root (LANE-D, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s1201, 2026-07-29.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-d`.

READ FIRST: `AGENTS.md`; `scripts/whole-suite-collection.test.mjs` (all 12 lines — the whole subject fits on one screen); `scripts/town-spec-collection.test.mjs` (all 20 lines — **the sibling carrying the identical defect; fix the CLASS, not the instance**); `scripts/suite-red-inventory.test.mjs` (the house pattern you extend: black-box `spawnSync` of the real thing, `node:test` + `node:assert/strict`, fixtures under `os.tmpdir()`, one `test()` per claim — and at `:130-141` the guard whose `- Run tree:` assertion you extend in scope 5); `package.json` (`test:node-guards` — an EXPLICIT ENUMERATED LIST of **14** files; scope 4 makes it 15, and that is the ONLY line of this file you may touch); `reviews/suite-red-inventory-guard-discriminator.md` (the s1201 drain that raised F-1201-1 and F-1201-2, with every measurement below); `tasks/BACKLOG.md` (F-1201-1 and F-1201-2 verbatim).

CODEX: gpt-5.6-sol effort=medium

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main OR is preserved on another ref (verify via git log/diff/for-each-ref), it is a SAFE DUPE → `git checkout -B lane/perf main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main and NOT on any other ref (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

> ✅ **THE AUTHORING FIRE MEASURED `lane/perf`'s STATE AND IT IS A PLAIN SAFE DUPE — RESET AND PROCEED.** `lane/perf` is **1 ahead** at `d3d5ce6c` "runner(lane-d): lane-d-suite-red-inventory-guard-discriminator.md" — that is the work this fire just **merged to main** as `b7cace2e`. Verified by **two-dot** diff, not by the commit count (a commit count is not a drain signal): `git diff --stat main..lane/perf` reports **7 files changed, 109 insertions, 161 deletions**, and **no `scripts/` path appears** — so every file you are about to touch is already byte-identical between the lane and main. The lane worktree was **clean** when measured. **Nothing is lost by resetting.** ⚠️ **The 171 MB special case that once froze this lane is HISTORY — do not re-apply it**; the raw also lives on `refs/heads/archive/suite-red-inventory-raw-171mb`. Confirm in one command before resetting (`git diff --stat main..lane/perf` must show **no `scripts/` path**); if a `scripts/` path DOES appear, STOP and report — the premise of this paragraph has changed.

## Why (F-1201-1 and F-1201-2, raised by the s1201 drain of the slice that shipped one commit earlier)

The factory has just spent **four consecutive lane-d slices** making `scripts/suite-red-inventory.mjs` invariant to where it is run from — cwd-invariance (`ea0cabc4`), harness provenance (`e23a40ae`), run-tree invariance (`e968557a`), and the guard discriminator (`b7cace2e`). While doing that, nobody checked the **battery's own guards**. Two of them silently depend on being launched from the repo root, and when that assumption breaks they fail with an **unreadable binary dump** instead of a diagnosis.

### 🔑 WHAT THE AUTHORING FIRE MEASURED. DO NOT RE-DERIVE FROM MEMORY; DO REPRODUCE IN SCOPE 1.

1. 🚨 **THE DEFECT — BOTH COLLECTION GUARDS FAIL FROM ANY NON-ROOT CWD.** Both spawn Playwright with **no `cwd` option**, so the child inherits whatever directory the parent happened to be in:
   - `scripts/whole-suite-collection.test.mjs:6` — `spawnSync('npx', ['playwright', 'test', '--list'], { encoding: 'utf8' })`
   - `scripts/town-spec-collection.test.mjs:6-14` — same shape, with four `e2e/…` spec paths that are **themselves relative to the repo root**.

   | Invocation | `whole-suite-collection` | `town-spec-collection` |
   |---|---|---|
   | from repo root (`npm run test:node-guards`) | **pass** — inside `72 tests / 72 pass / 0 fail, exit 0` | **pass** |
   | `cd scripts && node --test <file>` | **FAIL** (`result.status` 1, ~13.9 s) | **FAIL** (~0.35 s) |

   **Cause, verified at source and by running it:** from `scripts/`, Playwright finds no repo config, falls back to defaults, and matches the `*.test.mjs` files sitting in that directory — so it *executes node-test files as if they were Playwright specs* and streams the **node test-runner binary protocol** into stdout. Because the assertion message is `result.stdout + result.stderr`, the failure renders as pages of unreadable binary. ➡️ *A guard that only works from one directory is a guard with an unstated precondition, and this one hides its own diagnosis when the precondition breaks.*

2. ⛔ **F-1201-1 — DO NOT "FIX" THE REGEX. IT IS ALREADY CORRECT.** The previous run's report escalated this same guard as *"pre-existing red … the regex literal uses `/Total: [1-9]\\d* tests/`, which matches a backslash rather than digits."* **That claim is false at its stated mechanism.** `scripts/whole-suite-collection.test.mjs:9` reads `/Total: [1-9]\d* tests/` with **one** backslash — the correct digit class — and `scripts/town-spec-collection.test.mjs:17` carries the identical correct literal. The doubling was an artifact of that run's own report rendering. **Both regexes are to be left exactly as they are.** If you find yourself editing a `\d`, stop: you are curing a phantom. (Measured against the true red above, the report's *symptom* was real and its *diagnosis* was not.)

3. 🔻 **F-1201-2 — THE CAPTION CURE THAT SHIPPED ONE COMMIT AGO IS UNGUARDED.** `b7cace2e` renamed the report caption to `resolved masking-row test bodies` (F-1200-2). Control **m-own-2** — revert that caption to `resolved test bodies`, i.e. the exact defect just cured — and `node --test scripts/suite-red-inventory.test.mjs` returns **7/7 pass, exit 0: nothing fails.** The nearest assertion (`:139`) pins `- Run tree: **<root>**; status **present**;` and stops at the semicolon **immediately before** the denominator label. 🔁 *A cure without a guard is a coincidence waiting to be reverted.*

## Scope

### 1. Observe-first gate — reproduce the defect before changing anything (MANDATORY; a STOP here is a SUCCESS)

**1a.** From the repo root, run the full battery exactly as `package.json` defines it and record the numbers. Expect **72 tests / 72 pass / 0 fail, exit 0**. If it is already red from the root, **STOP and report** — that is a different problem than this task's and the premise below is not what you are looking at.

**1b.** Reproduce the real defect, both files, from a non-root cwd:

```
cd scripts && node --test whole-suite-collection.test.mjs
cd scripts && node --test town-spec-collection.test.mjs
```

Both must **FAIL**. Record each exit code and the first assertion line. **If either PASSES, the premise is gone — STOP and report that, and change nothing.** Do not proceed on the strength of this document; proceed on the strength of what you just saw.

### 2. Make both guards root-invariant (the actual fix)

In **both** `scripts/whole-suite-collection.test.mjs` and `scripts/town-spec-collection.test.mjs`, resolve the repo root from the module's own location and pass it to `spawnSync` as an explicit `cwd`. The spec paths in `town-spec-collection` then resolve against that root rather than against the caller's directory.

⚠️ **THE ONE TRAP THAT WILL BITE YOU, AND IT BIT THE AUTHORING FIRE THIS SESSION:** this repository's absolute path **contains a space** (`/Users/robin/Claude/Projects/Gold Rush`). `new URL('../', import.meta.url).pathname` percent-encodes it to `Gold%20Rush`, which is a directory that does not exist — and the resulting failure looks like a broken test, not a broken path. **Use `fileURLToPath(new URL('../', import.meta.url))` from `node:url`.** Nothing else is acceptable here.

Do not change either regex (see Why §2). Do not change what the guards assert. This scope item changes *where the child runs*, nothing else.

### 3. Make the failure legible

The assertion message on the `result.status` check is currently `result.stdout + result.stderr`, which is what produced pages of binary. Bound it to something a fire can read in a handoff — e.g. the **last ~20 lines** of `stderr`, then `stdout`, with the child's exit code stated first. Apply to both files. Keep it small; this is a diagnostic, not a framework.

### 4. Guard the invariance itself (a new guard file, and the 15th entry in the battery)

Add `scripts/collection-guards-cwd-invariance.test.mjs` following the house pattern. It must **execute the two guard files from a directory that is not the repo root** (`os.tmpdir()` is the house choice) via `spawnSync(process.execPath, ['--test', <absolute path to the guard file>], { cwd: <tmpdir> })` and assert **exit 0** for each.

This is a real end-to-end guard, so it is slow (the whole-suite collection alone is ~14 s). That is acceptable and expected — state the battery's new wall-time in your report. Register the new file in `package.json`'s `test:node-guards` list; that list is explicitly enumerated, so an unregistered guard would never run (*an unrun guard is an unread verdict*).

### 5. Close F-1201-2 — one assertion

In `scripts/suite-red-inventory.test.mjs`, extend the existing `- Run tree:` assertion (`:139`, inside `reducer renders absolute raw paths relative to the recorded tree`) so it also pins the denominator label `resolved masking-row test bodies`. One assertion, inside the existing `test()`. Do **not** add a new `test()` for this and do **not** touch `scripts/suite-red-inventory.mjs`.

### 6. Mutation controls — prove each new guard can fail on its own subject

Run each control, record the verdict, then **restore the subject and confirm it is byte-identical** to what you started from:

- **m1** — delete the explicit `cwd` you added in scope 2 from `whole-suite-collection.test.mjs`. The scope-4 guard must **FAIL**. If it passes, your guard is decoration; fix it before continuing.
- **m2** — same deletion in `town-spec-collection.test.mjs`. The scope-4 guard must **FAIL**.
- **m3** — in `scripts/suite-red-inventory.mjs`, revert the caption `resolved masking-row test bodies` → `resolved test bodies`. Scope 5's assertion must **FAIL**. ⚠️ **Restore this file exactly — it is otherwise NOT yours to touch in this task.** Its pristine SHA-256 is `310a97c080b6b7c8dd32999d1adaed810dd3263a0e64aa0752e27a33c0488a9e`; verify it before you finish. **If it differs at the START of this task, STOP and report** — main has moved and the line numbers above are suspect.

### 7. Report the guard count explicitly

The battery is **72** today. Scope 4 adds a file with N `test()` calls, so the new total is **72 + N**. **State N and the new total in your report, in words, whether or not you think it obvious** — an unannounced change to an expected value becomes the next fire's phantom red.

## Firewall

**TOUCH-ONLY:**
- `scripts/whole-suite-collection.test.mjs`
- `scripts/town-spec-collection.test.mjs`
- `scripts/collection-guards-cwd-invariance.test.mjs` (new)
- `scripts/suite-red-inventory.test.mjs` (**scope 5 only — one assertion**)
- `package.json` (**the `test:node-guards` list ONLY** — no dependency, no other script)

**NO:**
- ❌ `src/**` and `e2e/**` — this task changes no player-facing byte and no spec.
- ❌ `playwright.config.*` — the guards adapt to the config, never the reverse.
- ❌ `scripts/suite-red-inventory.mjs` — except transiently for control **m3**, restored to the SHA above.
- ❌ `logs/suite-red-inventory.md` — **do not regenerate it.** The committed artifact was produced against a tree state that no longer exists; regenerating would not refresh it, it would destroy the record and replace it with a worse one.
- ❌ Either `/Total: [1-9]\d* tests/` regex (Why §2).
- ❌ Any other file under `scripts/`.

Report adjacent problems; do not fix them.

## Self-check before READY-FOR-GATES

1. `npx tsc --noEmit` clean; `npm run build` green.
2. `npm run test:node-guards` from the repo root: **exit 0**, and state `tests / pass / fail` plus the new total per scope 7.
3. **The same battery from a non-root cwd** — the whole point of this task: `cd scripts && node --test whole-suite-collection.test.mjs` and `… town-spec-collection.test.mjs` must both now **pass**. Quote both.
4. `node scripts/run-guards.mjs --only test:node-guards` → `PASS rc=0`.
5. Controls m1, m2, m3 each recorded with their verdict, and every subject restored + hash-confirmed.
6. `git status` shows **only** the five permitted paths.
7. Zero `src/` and zero `e2e/` bytes ⇒ no browser run and no screenshots are required; say so explicitly rather than silently omitting them.

**READY-FOR-GATES** + report: the scope-1 observation (both failures, verbatim), the new guard count and battery wall-time, the three control verdicts, and anything you found that this master got wrong.
