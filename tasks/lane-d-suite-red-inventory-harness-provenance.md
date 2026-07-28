# Task lane-d-suite-red-inventory-harness-provenance: make `scripts/suite-red-inventory.mjs` record the harness config that produced the report, so a comparison against the red inventory can tell whether it is comparing two different instruments (LANE-D, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s1198, 2026-07-29.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-d`.

READ FIRST: `AGENTS.md`; `scripts/suite-red-inventory.mjs` (all 324 lines — read the argv/parse head at `:1-14`, and the `lines` array that builds the report header at `:230-250`, which is the ONLY place you will add output); `scripts/suite-red-inventory.test.mjs` (all 67 lines — **the house pattern you will extend, not replace**: black-box `spawnSync` of the real script, `node:test` + `node:assert/strict`, fixtures under `os.tmpdir()`, one `test()` per claim — and note its fixture at `:19` passes **`config: {}`**, which is the trap described in §2 below); `tasks/BACKLOG.md:85` (the finding, verbatim below); `logs/suite-red-inventory.md` (the canonical artifact — read its first 16 lines only; **you will not edit its measured table**); `package.json` (the `test:node-guards` line — an EXPLICIT ENUMERATED LIST of **14** files, not a glob; you are not adding a file to it).

CODEX: gpt-5.6-sol effort=medium

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main OR is preserved on another ref (verify via git log/diff/for-each-ref), it is a SAFE DUPE → `git checkout -B lane/perf main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main and NOT on any other ref (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

> ✅ **THE AUTHORING FIRE MEASURED `lane/perf`'s STATE AND IT IS A PLAIN SAFE DUPE — RESET AND PROCEED.** `lane/perf` is **1 ahead** of main (`3f377d83` "runner(lane-d): lane-d-suite-red-inventory-cwd-invariance.md"), and that is s1197's work, **already merged to main** as `ea0cabc4`. Verified by **two-dot** diff, not by the commit count (a commit count is not a drain signal): `git diff --stat main lane/perf` lists **eight files and NOT ONE of them is under `scripts/`** — so both files you are about to touch are already **byte-identical** between the lane and main. The eight differing paths are main-side bookkeeping the lane never received (`STATUS.md`, `reviews/suite-red-inventory-cwd-invariance.md`, `tasks/BACKLOG.md`, `tasks/goals.json`, three `logs/session-scratch/s1197-*.mjs` probes) plus the lane's own copy of the now-drained task file. **Nothing is lost by resetting.** ⚠️ **The 171 MB special case that froze this lane is HISTORY — do not re-apply it.** `BACKLOG:30` once froze lane-d because `lane/perf` "uniquely" held `logs/suite-red-inventory-raw.json` (171,333,533 B); that raw now also lives on `refs/heads/archive/suite-red-inventory-raw-171mb`, and s1197's run already reset this lane without loss. Confirm in one command before resetting (`git diff --stat main lane/perf` must show **no `scripts/` path**); if a `scripts/` path DOES appear, STOP and report — the premise of this paragraph has changed.

## Why (F-1173-5, `tasks/BACKLOG.md:85`, raised s1173, unactioned since)

Verbatim from the ledger:

> 🔻 **F-1173-5 (s1173) — THE DEFAULT PLAYWRIGHT WORKER COUNT MANUFACTURES REDS IN THIS SPEC SET, AND IT NEARLY COST ME THE DRAIN ABOVE.** I measured **17** reds where the runner measured **13** and had to decide whether that was a regression. **It was my instrument: I ran default parallel workers, the runner ran `--workers=1`.** ✓ **Re-run at `--workers=1`, three rows flip red→green** […] 🔁 *Reusable shape: **a red inherits its harness config.** Any comparison against the suite-red inventory must state its worker count, or it is comparing two different instruments and calling the difference a regression.*

The finding ends by naming the duty — *"any comparison against the suite-red inventory must state its worker count"* — but the inventory itself makes that duty impossible to discharge, because **it does not record the worker count it ran at.** Every fire comparing a fresh run against `logs/suite-red-inventory.md` is therefore guessing at one of the two numbers it needs.

### 🔑 THE AUTHORING FIRE MEASURED THE THREE FACTS THIS TASK RESTS ON. DO NOT RE-DERIVE THEM; DO VERIFY THEM IN SCOPE 1.

1. **The header records no harness config at all.** `scripts/suite-red-inventory.mjs:230-250` builds the report head from totals, bucket counts, a reduction check and a positive-control line. `grep -in "worker" logs/suite-red-inventory.md` returns **nothing**, and `grep -n "workers\|config" scripts/suite-red-inventory.mjs` matches only the `JSON.parse` at `:11`. The parsed `report.config` object is **read into memory and then never used.**

2. **The data is already present in the input — this is a reporting gap, not a plumbing problem.** The tracked, in-git raw `logs/suite-red-inventory-compact.json` (2.3 MB, merged at `7a457025`) carries a top-level `config` whose keys include `workers`, `fullyParallel`, `shard`, `version`, `rootDir` and `metadata`. Measured values for the run that produced the canonical inventory: **`config.workers = 2`**, **`config.metadata.actualWorkers = 2`**, `fullyParallel = false`, `shard = null`, `version = "1.61.1"`, `rootDir = ".../worktrees/lane-d/e2e"`.

3. 🚨 **THE MEASURED ANSWER IS SURPRISING, AND IT IS THE REASON THIS IS WORTH SHIPPING.** F-1173-5's narrative is about a runner at `--workers=1`, and fires have carried that number forward as though it described the inventory. **It does not: the canonical 303-red inventory is a `workers=2` artifact.** So a fire that dutifully re-runs at `--workers=1` to "match the inventory" is doing exactly what F-1173-5 warns against — comparing two instruments — while believing it has controlled for the variable. **The label is not merely missing; its absence has been filled in wrongly.**

⚠️ **THERE ARE TWO WORKER NUMBERS AND THEY ARE NOT THE SAME CLAIM.** `config.workers` is the resolved *configured* count; `config.metadata.actualWorkers` is what the run *actually* used. They agree at 2 here, but Playwright can lower the real count (machine capacity, sharding), and a report that prints only one of them re-creates this finding one level down. **Record both.**

## Scope

### 1. Observe-first gate — reproduce the premise before changing anything (MANDATORY; a STOP here is a SUCCESS)

Run the **unmodified** reducer against the tracked raw and confirm all three facts:

```
node scripts/suite-red-inventory.mjs logs/suite-red-inventory-compact.json /tmp/harness-before.md
```

Record in your report: (a) the exit code and byte size of the output — the authoring fire measured **exit 0, 128,781 bytes**; (b) that its first 16 lines contain **no** worker/harness line; (c) the values of `config.workers`, `config.metadata.actualWorkers`, `config.fullyParallel`, `config.shard` and `config.version` read directly out of that JSON.

**Classify and act:**
- **(a) PREMISE HOLDS** — no harness line in the output, and `config.workers` present in the input → proceed to scope 2.
- **(b) ALREADY RECORDED** — the output already names a worker count → **STOP**, report where, change nothing. The finding is already discharged.
- **(c) DATA ABSENT** — `config.workers` is missing/undefined in that raw → **STOP** and report. Do not invent a source (do not shell out to Playwright, do not read `playwright.config.ts`); the whole point is to report *what produced this report*, and a value derived from anywhere else would be a fabrication.

Keep `/tmp/harness-before.md` — scope 4 diffs against it.

### 2. Emit a harness provenance block into the report header — ADDITIVE ONLY

In the `lines` array at `scripts/suite-red-inventory.mjs:230-250`, add a short provenance block recording, from `report.config`: **`workers`**, **`metadata.actualWorkers`**, **`fullyParallel`**, **`shard`**, and the Playwright **`version`**. Ledger voice, one bullet per fact or one compact line — match the surrounding `- Total …: **N**` style.

**Binding constraints:**
- **Every existing header line, table row and trailing section must survive byte-identical.** This is an insertion, not a rewrite. Scope 4 proves it.
- **Degrade honestly when the data is absent — this is the trap that will break the existing guard if you get it wrong.** `scripts/suite-red-inventory.test.mjs:19` builds its fixture with **`config: {}`**. Your code must not throw, and must not print a confident `0` or `1`, when `config.workers`/`config.metadata` are undefined: print an explicit **`unrecorded`** (or equivalent) so a reader can distinguish *"ran at 1 worker"* from *"we do not know"*. A silent default is the same class of defect this task exists to fix.
- **No `try`/`catch` anywhere in this script.** (s1197's F-1197-2 ruling stands: a `try`/`catch` here converts a loud crash into a silently degraded report.) Use plain optional access.
- Do **not** touch argv parsing, the `walk`/`relative`/`testBody` functions, the bucket logic, the reduction check, or the `masking` loop.

### 3. Extend the guard — `scripts/suite-red-inventory.test.mjs`

Add tests to the **existing** file (do not create a new one; do not edit `package.json`). At minimum, one `test()` per claim:

- **a. The harness block reports the input's real numbers.** Fixture with a populated `config` using values that are **not** the defaults and **not** equal to each other — e.g. `workers: 7`, `metadata: { actualWorkers: 3 }`, `fullyParallel: true` — and assert the output names **7** *and* **3** distinctly. (Distinct values are load-bearing: equal ones cannot catch a copy-paste that prints the same field twice.)
- **b. Absent config degrades honestly.** Fixture with `config: {}` → the script exits **0** and the output says `unrecorded` rather than a number.
- **c. The existing report body is unchanged by the addition** — assert the failure-table row assertion from the existing test still holds alongside the new block.

**The existing `reducer output is cwd-invariant` test must remain green and unmodified.** If your change makes it fail, your change is wrong — fix the subject, never the existing test.

### 4. Mutation control — refute your own guard (MANDATORY; mutate the SUBJECT, never the test)

A green test proves nothing until you have watched it go red. Perform each, record the exact observed failure, then restore:

- **m1.** Make the block print `config.workers` for **both** numbers (the copy-paste defect) → test **(a)** must FAIL on the `3`.
- **m2.** Make absent config print `1` instead of `unrecorded` → test **(b)** must FAIL.

After both, restore the subject and prove it byte-identical (`git diff` empty, or report the blob hash before and after). **If a mutation does NOT turn the guard red, the guard is decorative — say so plainly in your report and do not claim the finding is discharged.**

### 5. Record the canonical artifact's measured harness config — as an APPENDED note, not an edit

`logs/suite-red-inventory.md` is a **measurement artifact, not a living document**, and its 303-row table was produced by a run you cannot reproduce here (the 171 MB raw is not on disk). **Do NOT regenerate it and do NOT edit the measured table or its header numbers.**

Instead **append** a short dated section at the end of the file — following the s1196 precedent (F-1180-2 was recorded as an appended section for exactly this reason) — recording: the harness config measured from `logs/suite-red-inventory-compact.json` (`workers=2`, `actualWorkers=2`, `fullyParallel=false`, `shard=null`, Playwright `1.61.1`), the fact that this is the run that produced the table above (the six headline numbers match: 2388 run / 2006 passed / 303 failed / BOTH 135 / MOBILE-ONLY 17 / DESKTOP-ONLY 11), and one sentence warning that a comparison run at a different worker count is a different instrument.

## Firewall

**TOUCH-ONLY:**
- `scripts/suite-red-inventory.mjs`
- `scripts/suite-red-inventory.test.mjs`
- `logs/suite-red-inventory.md` (**append only**, per scope 5)

**NO — do not touch, for any reason:**
- **Anything under `src/` or `e2e/`.** This task ships zero runtime bytes.
- `package.json` (the guard file is already enumerated — you are adding tests to an existing file, so the list does not change).
- `logs/suite-red-inventory-compact.json` — it is tracked evidence and an input; treat it as read-only.
- The measured table or header numbers in `logs/suite-red-inventory.md`.
- Any other `scripts/*.mjs`, `tasks/`, `reviews/`, `STATUS.md`, `tasks/goals.json`.
- Do not add `try`/`catch`; do not add a dependency; do not run Playwright.

## Self-check before you report READY-FOR-GATES

1. `npx tsc --noEmit` → clean. ⚠️ **Note honestly in your report that `scripts/**` is OUTSIDE `tsconfig`'s `include`, so tsc does NOT cover this subject** (F-1197-F). The node guard is the only gate on it.
2. `npm run build` → green; record the vite time.
3. **The full guard battery, as an EXIT CODE, not a printed counter** (F-1125-1): run the 14-file `node --test …` list from `package.json`'s `test:node-guards`. 🚨 **The authoring fire measured the pre-change baseline at exactly `tests 66 / pass 66 / fail 0` — verified by running it, not inherited.** Your run must be **green with a count of 66 + the number of tests you added**. **Report the new total explicitly**, because the drain must broadcast it: an unannounced change to an expected value becomes the next fire's phantom red.
4. Re-run the scope-1 command to `/tmp/harness-after.md` and **diff it against `/tmp/harness-before.md`**. The diff must be **purely additive** — your new block and nothing else. Paste the diff (or its stat) into the report. A single changed pre-existing line is a REJECT.
5. Report the mutation-control results from scope 4 verbatim, including the restore proof.
6. **No screenshots, no Playwright, no boot probe — and say why in your report rather than leaving it implied:** this merge moves **zero `src/` and zero `e2e/` bytes**, so Mistake #10's question ("where does the PLAYER see this, in a plain boot?") answers *nowhere, by construction*. Proportionate, not thinned.
7. `git status` in the lane shows **only** the three TOUCH-ONLY paths.

READY-FOR-GATES. Report: the scope-1 classification and the five measured config values; the exact new report block as it renders; the additive-only diff of before→after; both mutation results with the observed failures and the restore proof; the new node-guard total (and confirmation the count of guard FILES is still 14); the tsc/build numbers; and any finding you raise — including against this master, if a premise in it did not survive contact.
