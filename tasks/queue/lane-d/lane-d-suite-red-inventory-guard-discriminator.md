# Task lane-d-suite-red-inventory-guard-discriminator: make the guard named for the absolute-path defect actually fail on it, and make the report's body-count statistic name its denominator (LANE-D, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s1200, 2026-07-29.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-d`.

READ FIRST: `AGENTS.md`; `scripts/suite-red-inventory.test.mjs` (all 188 lines — **the house pattern you extend, not replace**: black-box `spawnSync` of the real script, `node:test` + `node:assert/strict`, fixtures under `os.tmpdir()`, one `test()` per claim. The two functions you will lean on already exist: `fixture(t)` at `:14` now builds errors WITH `location.file` + `stack`, and `scriptCopies(t)` at `:96` plants byte-identical copies of the real script at two unrelated roots); `scripts/suite-red-inventory.mjs` (`relative()` at `:63-72` — the absolute branch is the single line `if (path.isAbsolute(file)) return path.relative(runRoot, file)…`; and the header block's `- Run tree:` line at `:263`); `reviews/suite-red-inventory-run-tree-invariance.md` (the s1200 drain that raised both findings, with the measurements below); `tasks/BACKLOG.md` (F-1200-2 and F-1200-3 verbatim); `logs/suite-red-inventory.md` (the canonical artifact — **read it, do NOT regenerate or edit it**, see the Firewall for why); `package.json` (`test:node-guards` — an EXPLICIT ENUMERATED LIST of **14** files; you are not adding a file to it).

CODEX: gpt-5.6-sol effort=medium

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main OR is preserved on another ref (verify via git log/diff/for-each-ref), it is a SAFE DUPE → `git checkout -B lane/perf main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main and NOT on any other ref (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

> ✅ **THE AUTHORING FIRE MEASURED `lane/perf`'s STATE AND IT IS A PLAIN SAFE DUPE — RESET AND PROCEED.** `lane/perf` is **1 ahead** at `b1d42540` "runner(lane-d): lane-d-suite-red-inventory-run-tree-invariance.md" — that is the work this fire just **merged to main** as `e968557a`. Verified by **two-dot** diff, not by the commit count (a commit count is not a drain signal): `git diff --stat main lane/perf` reports **8 files changed, 3 insertions, 306 deletions** — the lane is *behind* main, holding no unique bytes, and **no `scripts/` path appears**, so both files you are about to touch are already byte-identical between the lane and main. **Nothing is lost by resetting.** ⚠️ **The 171 MB special case that once froze this lane is HISTORY — do not re-apply it**; the raw also lives on `refs/heads/archive/suite-red-inventory-raw-171mb`, and s1197/s1198/s1199 all reset this lane without loss. Confirm in one command before resetting (`git diff --stat main lane/perf` must show **no `scripts/` path**); if a `scripts/` path DOES appear, STOP and report — the premise of this paragraph has changed.

## Why (F-1200-3 and F-1200-2, raised by the s1200 drain of the slice that shipped one commit earlier)

The predecessor slice (`e968557a`, F-1198-2) is **correct and it stays**. Its cure was verified on the real 171 MB raw: 117,626 B from two unrelated script roots, byte-identical, while still carrying 188 percentage cells and 95 ranked masking rows. This task does **not** revisit that. It fixes two things the drain's own mutation controls exposed *in the guards and the caption*, not in the cure.

### 🔑 WHAT THE AUTHORING FIRE MEASURED. DO NOT RE-DERIVE FROM MEMORY; DO REPRODUCE IN SCOPE 1.

1. 🚨 **F-1200-3 — A GUARD PASSED UNDER THE EXACT MUTATION IT IS NAMED FOR.** The drain mutated the **subject** (never the guard), reverting `relative()`'s absolute branch from `path.relative(runRoot, file)` back to `path.relative(ROOT, file)` — *precisely the F-1198-2 defect*. Measured result across the four new guards:

   | Guard | Verdict under the m-own-1 mutation |
   |---|---|
   | `reducer output is script-root-invariant` | **FAIL** ✅ (catches it) |
   | `reducer refuses body statistics when the recorded tree is unavailable` | **FAIL** ✅ |
   | `an unresolved masking row never outranks a resolved row` | pass (not its subject) |
   | **`reducer renders absolute raw paths relative to the recorded tree`** | **PASS** ❌ **— under the defect it is named for** |

   **Cause, verified at source:** that test's discriminating assertions read the **spec-file** column — `markdown.includes(\`| ${SPEC_PATH} | cwd invariant failure |\`)` and `!markdown.includes(\`| ${specFile} |\`)`. Playwright stores `spec.file` **relative** to `rootDir`, so that column never travels through `relative()`'s `path.isAbsolute` branch at all. The absolute error locations the test's own name refers to are rendered in the **"Failing file:line"** column, which the test never asserts on. ➡️ *A guard's name is a claim. This one's discriminator does not test what its title says*, and a future fire reading the guard list will believe the absolute-path branch is directly covered when only `script-root-invariant` covers it — **as a side effect of byte-identity, not by assertion.**

2. 🔻 **F-1200-2 — A STATISTIC THAT DOES NOT NAME ITS DENOMINATOR.** The header line the predecessor added reads `- Run tree: **<rootDir>**; status **present**; resolved test bodies **222/270**`. Measured against the real raw: the report covers **303** failing tests, but `resolvedBodyCount`/`totalBodyCount` are built by flattening **`masking[].ratios` only** (`:236-241`), so `270` is the execution count of the **135 masking-candidate rows** — not of the report. The number is honest and the label is not false, but it reads as a whole-report statistic and is not one. 🔁 This is the same shape as F-1198-3 and F-1199-1 one turn further out: *a byte count must name which file it counted; a ratio must name what it ranged over.*

## Scope

### 1. Observe-first gate — reproduce BOTH premises before changing anything (MANDATORY; a STOP here is a SUCCESS)

**1a.** Copy the pristine subject somewhere safe and record its SHA-256. It must be `58ec4538aba91e6e7f2815500cd558f84271bd79d8db7de546f22b71e1c581b2`. **If it differs, STOP and report** — main has moved under this task and every line number above is suspect.

**1b.** Apply the m-own-1 mutation to `scripts/suite-red-inventory.mjs` — change the single absolute branch in `relative()` from `path.relative(runRoot, file)` to `path.relative(ROOT, file)`, changing nothing else. Run `node --test scripts/suite-red-inventory.test.mjs`.

**EXPECTED:** exactly **2** failures (`script-root-invariant`, `refuses body statistics…`), and `reducer renders absolute raw paths relative to the recorded tree` **PASSES**. That passing row IS the defect.

⛔ **If that guard already FAILS, the premise is gone — restore the subject, STOP, and report it.** Do not "fix" a guard that already works.

**1c.** Restore the subject and confirm the SHA-256 matches 1a **byte for byte** before continuing. State both hashes in your report.

**1d.** Run the reducer once against the tracked raw and quote the `- Run tree:` line verbatim, plus the report's total failing-test count, so the F-1200-2 mismatch is on the record in your own numbers:
```
node scripts/suite-red-inventory.mjs logs/suite-red-inventory-compact.json /tmp/before.md
```

### 2. Give the guard a discriminator that matches its name

Strengthen `reducer renders absolute raw paths relative to the recorded tree` in `scripts/suite-red-inventory.test.mjs` so it asserts on the column fed by `relative()`'s **absolute** branch — the failing-location cell — and not only on the spec-file column.

- The fixture at `:14` already writes `error.location.file` and `error.stack` as **absolute** paths under the fixture's own `rootDir`; that is the input you need, so no new fixture is required.
- Assert **positively** that the rendered failing location is the tree-relative form (`e2e/<spec>:<line>`), and **negatively** that the absolute fixture path does **not** appear anywhere in the report body outside the `- Run tree:` provenance line.
- Keep the existing spec-file assertions — they are not wrong, only insufficient. **Add**, do not replace.
- ⚠️ Do **not** weaken the test into asserting a bare substring that the `- Run tree:` line itself satisfies. The provenance line legitimately contains the absolute root; your negative assertion must exclude that one line and still hold. (Measured on the real raw: absolute `worktrees/lane-d/` occurrences in the whole 117,626 B report = **1**, and that one is the provenance line.)

### 3. Make the body-count statistic name its denominator

In `scripts/suite-red-inventory.mjs`, change the `- Run tree:` line's trailing label from `resolved test bodies` to wording that states the scope — **`resolved masking-row test bodies`** is the authoring fire's recommendation, but any wording that makes the denominator unambiguous is acceptable if you justify it in the report.

- **This is a caption change only.** Do **not** change how `resolvedBodyCount`/`totalBodyCount` are computed, and do **not** widen them to the whole report — that is a different, larger decision and is explicitly **out of scope**.
- ✅ **Safe by construction, verified by the authoring fire:** the existing guards assert the provenance line as `- Run tree: **${rootDir}**; status **present**;` — they stop at that semicolon, so changing the tail does not break them. Confirm that yourself rather than trusting this sentence.

### 4. Refute your own work (MANDATORY — mutate the SUBJECT, never the guard)

Re-apply the m-own-1 mutation from 1b and re-run the guard suite. **The strengthened guard from scope 2 MUST now FAIL.** If it still passes, scope 2 is not done — a guard that cannot fail on its own subject is decoration, and shipping it would close F-1200-3 on paper while the gap lives.

Then restore the subject and confirm the SHA-256 again. Report: the mutated hash, the failure list under mutation, and the restored hash.

### 5. State the guard count explicitly

The count is **72** as of `e968557a` (14 files). If your change moves it, **say so in one sentence with the new number** — an unannounced change to an expected value becomes the next fire's phantom red. If you add no `test()`, say that it remains 72.

### 6. Do NOT regenerate the canonical artifact

`logs/suite-red-inventory.md` (119,852 B, blob `dc4c4cbe`) was produced against a tree state that no longer exists: it holds **0** `body unavailable` where every regeneration possible on this disk today yields **48**. **Regenerating it would not refresh it — it would destroy the record and replace it with a worse one.** Leave the file untouched. Write your scratch output to `/tmp`.

## Firewall

**TOUCH-ONLY:**
- `scripts/suite-red-inventory.test.mjs` (scopes 2, 4)
- `scripts/suite-red-inventory.mjs` (**scope 3 only — the one caption string on the `- Run tree:` line**; plus the temporary mutation in 1b/4, which MUST be reverted byte-identically)

**NO — do not touch, for any reason:**
- `logs/suite-red-inventory.md` (scope 6)
- `package.json` (you extend an enumerated guard file; you do not add one)
- Any `src/` or `e2e/` path — this slice moves **zero** player-visible bytes
- `tasks/goals.json`, `tasks/BACKLOG.md`, `STATUS.md`, `reviews/` — the draining fire owns those
- The predecessor's cure itself: `runRoot` derivation, `testBody()`'s guard, the masking `risk`/sort logic, the `?? 100` removal. **All of that is correct and gated. Report anything you believe is wrong there; do not change it.**

## Self-check before you report

- `npx tsc --noEmit` clean. ⚠️ Note in your report that `scripts/**` is **outside** `tsconfig`'s `include`, so tsc does **not** cover this subject — the node guard is the only gate on it.
- `npm run build` green; state the Vite time.
- `node scripts/run-guards.mjs --only test:node-guards` — report the **exit code**, not a printed counter (F-1125-1). Then `node --test scripts/suite-red-inventory.test.mjs` for the per-test detail.
- The scope-4 mutation control, with all three hashes and the failure list.
- `git diff --check` clean; `git diff --stat` shows **exactly the two permitted files**.
- Confirm `logs/suite-red-inventory.md` is absent from `git status`.
- **Mistake #10 — "where does the PLAYER see this, in a plain boot?"** Answer it explicitly. The expected answer is *nowhere, by construction* (zero `src/`, zero `e2e/` bytes), which is why **no Playwright run and no screenshots are required** — proportionate, not thinned. If your diff touches `src/` or `e2e/`, you have left the firewall.

**READY-FOR-GATES** + report: the 1b observation table (which guards failed, which passed), all three SHA-256 hashes, the before/after `- Run tree:` line, the scope-4 refutation result, the guard count, and any finding you have against **this master** — the predecessor run raised a correct one against its own master's after-check commands, and that was the most useful sentence in its report.
