# Task f1655-1: the red-inventory reducer must PRESERVE the hand-appended sections it does not generate (LANE-A, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s1655, 2026-08-11.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a`.

READ FIRST: `AGENTS.md`; `scripts/suite-red-inventory.mjs` (the reducer you are fixing — 356 lines, read the whole `lines` array construction from its start to the final `fs.writeFileSync`); `scripts/suite-red-inventory.test.mjs` (226 lines — the EXISTING test file your new tests go into, and its `fixture(t, config)` harness which you will reuse rather than reinvent); `scripts/red-inventory-lookup.mjs` lines 155–175 (the CONSUMER — read the comment block, it states the doctrine this task is defending in its own words); `logs/suite-red-inventory.md` (the live report — **READ ONLY, NEVER WRITE**; read its `## Corrections since the snapshot` preamble at line 17 and its ten `## ` sections).

SEQUENCING LAW — three greps, run them in the lane BEFORE you touch anything:

1. `grep -c "const \[input = 'logs/suite-red-inventory-raw.json', output = 'logs/suite-red-inventory.md'\] =" scripts/suite-red-inventory.mjs` → must print `1`. If `0`: **STOP and report "reducer signature moved"** — this master is written against that exact signature.
2. `grep -c "Corrections" scripts/suite-red-inventory.mjs` → must print `0`. This is the DEFECT SIGNATURE. If it prints anything else, **STOP and report "the defect appears already cured"** — do not improvise a second cure on top of someone else's.
3. `grep -c "const CORRECTIONS_HEADER = " scripts/red-inventory-lookup.mjs` → must print `1`. If `0`: **STOP and report "consumer key moved"** — the contract below is anchored to that consumer.

(All three were proved `1 / 0 / 1` against `main` at authoring time, s1655.)

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/a main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP. Discard them and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-a status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why — a lawful STOP found it, and the drain-side re-measurement found it is TEN TIMES bigger

The f1643-2 run of 2026-08-11 11:42:59 (`tasks/runs/20260811-114259-lane-a-lane-a-f1643-2-suite-red-inventory-refresh.md.log`) ended in ~4 minutes without launching its day-scale suite. That was **its own master's STOP condition firing correctly**, not a failure. Its report, verbatim:

```
STOP — reducer defect confirmed.

- suite-red-inventory.mjs:355 overwrites the report without preserving `## Corrections since the snapshot`.
- Scratch reduction confirmed both `F-1587-1` and the corrections heading disappear.
- Pre-flight install/build passed; repository remains clean.
- The full day-scale suite was intentionally not started, as required by the task's STOP condition.

Not `READY-FOR-GATES`; the reducer must be fixed in a separate authorized task first.
```

**s1655 verified that claim independently rather than inheriting it (Mistake #4):** `scripts/suite-red-inventory.mjs` contains **zero** occurrences of `Corrections`, of `readFileSync(output`, and of `existsSync(output`. There is no code path that reads the existing report. The `lines` array is built fresh and written at `:355`.

⚠️ **AND THE BLAST RADIUS IS TEN SECTIONS, NOT ONE — measured s1655 by classifying every `## ` heading in the live report against the set the reducer actually emits.** The reducer generates exactly six body headings (`## Failing tests`, `## Other configured projects`, `## Incomplete comparisons`, `## Mobile-only failures`, `## Masking candidates`, `## Crashes and timeouts`). The live `logs/suite-red-inventory.md` carries **sixteen**. The other ten are hand-authored durable findings accumulated across ~14 fires, and the next legitimate reduce erases **all** of them:

| Lines | Size | Section |
|---|---:|---|
| 17–26 | 10 | `## Corrections since the snapshot` |
| 564–586 | 23 | `## Post-snapshot known reds (APPENDED s1196 — NOT part of the measured run above)` |
| 587–594 | 8 | `## Harness provenance (APPENDED 2026-07-29 — measured snapshot metadata)` |
| 595–626 | 32 | `## F-1212-2 — m4-06-embodiment.spec.ts:395 is a ~45% FLAKE ON MAIN…` |
| 627–659 | 33 | `## F-1216-1 follow-up — measured concurrency rates (APPENDED s1216)` |
| 660–703 | 44 | `## SUPERSEDED — ap-standing-orders.spec.ts:80 is CURED… (APPENDED s1223)` |
| 704–733 | 30 | `## ADDENDUM (s1224, 2026-07-29) — F-1224-3: a baseline red that is in NO table above` |
| 734–794 | 61 | `## Addendum — s1304 (2026-07-31): agent-view.spec.ts:268 … MOBILE-ONLY and ORDER-DEPENDENT` |
| 795–822 | 28 | `## F-1424-4 — STOP: the harness rejects the required whole-spec subject (APPENDED s1425)` |
| 823–844 | 22 | `## Refresh attempt — 2026-08-11 (ABORTED; snapshot unchanged)` |

**291 of 844 lines — 34.5% of the file.** The STOP found 10 of those 291 lines; the rest were still unnamed when this master was written.

**Why this is load-bearing and not merely tidy — VERIFIED, not assumed.** `scripts/red-inventory-lookup.mjs:170` parses the corrections table by its exact header `| Spec file | Test title | Measured | Finding | Correction |`, and the comment above it at `:161–167` states the doctrine in the codebase's own words: *"The snapshot is NOT rewritten (that would launder a real drift); corrections are additive and printed FIRST, where the misreading happens"* — and it is **deliberately fail-closed**, because *"a guard that fails OPEN reports a clean board"*. The report's own preamble says the same: *"ADDITIVE ONLY… overwriting an observation that was true when taken launders history and hides the drift itself."*

So the file states a law, a live instrument depends on it, and the only tool that writes the file violates it. That is the whole finding (**F-1655-1**).

ⓘ **Scope note for the runner: the sibling `scripts/suite-red-inventory-compact.mjs` was checked and is NOT affected** — it compacts the raw JSON (`writeFileSync(output, JSON.stringify(report))` at `:51`), a different subject. Do not "fix the class" into it.

## The preservation contract — RULED here, not left to your judgement

Implement exactly this. Where you think it is wrong, **report the disagreement, do not redesign**.

1. **Generated set.** The reducer knows the six `## ` headings it emits (listed above). Derive that set from the code you are editing — do **not** hardcode a second copy that can drift from the first.
2. **Parse the pre-existing output.** If `output` exists and is readable, split it into a preamble (everything before its first `## ` line) and a list of sections (each `## ` line plus everything up to the next `## ` line or EOF).
3. **Discard, regenerate, preserve.** The old preamble is DISCARDED (it is regenerated fresh). Any section whose heading line is in the generated set is DISCARDED (regenerated fresh). **Every other section is PRESERVED BYTE-FOR-BYTE**, including its blank lines and trailing whitespace.
4. **Placement.** Preserved sections that appeared **before** `## Failing tests` in the old file are re-emitted, in their original relative order, immediately **before** `## Failing tests` in the new file. All other preserved sections are re-emitted, in their original relative order, **after** the last generated section. (This reproduces today's live layout exactly: corrections at the top, the nine addenda at the tail.)
5. **Duplicates and unknowns.** Preserve every non-generated section, even if two share a heading. Never deduplicate, never reorder within a group, never rewrite a preserved byte.
6. **Absent output = today's behaviour.** If `output` does not exist, behave exactly as the reducer does now: no preservation, no warning, no error. Scratch reductions to fresh paths must keep working unchanged.
7. **A LOSS GUARD, and it must fail CLOSED.** After assembling the new file and **before writing it**, assert that every preserved section's exact text is present in the assembled output. If any is missing, **write nothing** and exit non-zero, naming the section that would have been lost. A reducer that silently drops history is the defect; a reducer that half-drops it is worse.
8. **Say what it did.** The reducer prints one line to stdout naming how many sections it preserved and how many it regenerated, so a future run's log carries the evidence.

## Scope

1. Implement the contract above in `scripts/suite-red-inventory.mjs`.
2. Add tests to the **existing** `scripts/suite-red-inventory.test.mjs`, reusing its `fixture(t, config)` harness. ⚠️ **Do NOT create a new test file** — that file is already rooted in `test:node-guards`, so no gate wiring is needed, and a new one would red `gate-caller-audit` as a gate with no caller. Cover, each as its own test:
   a. an appended tail section survives a re-reduce byte-for-byte;
   b. a corrections-style section placed before `## Failing tests` survives **and stays before it**;
   c. a generated section's stale content is REPLACED, not duplicated (reduce twice, assert exactly one `## Failing tests`);
   d. absent output file → unchanged behaviour (scope 6);
   e. **the loss guard bites** — force the failure path and assert non-zero exit AND that the output file was left untouched.
3. **PROVE THE RED BEFORE THE GREEN.** For each of 2a and 2b, first run the new test against the **unfixed** reducer (`git stash` the fix, or a copy) and record that it FAILS, then against the fixed one and record that it PASSES. A passing test never executes its violation path, so its green is not evidence about the red. Quote both outputs in your report.
4. **The acceptance proof, on the REAL file, in SCRATCH.** Copy `logs/suite-red-inventory.md` to a scratch path; reduce `logs/suite-red-inventory-compact.json` **to that same scratch path** (so the output pre-exists); then assert on the result: all **ten** non-generated headings present, the literal `F-1587-1` present, and the corrections table header `| Spec file | Test title | Measured | Finding | Correction |` present. Quote the counts. Then run `node scripts/red-inventory-lookup.mjs` against a scratch inventory built the same way and show it still finds the correction.
5. Report the reducer's new stdout line from the scope-4 run.

## Firewall

**TOUCH-ONLY:** `scripts/suite-red-inventory.mjs` · `scripts/suite-red-inventory.test.mjs`.

**NO — these are hard STOPs, not judgement calls:**
- 🚫 **NEVER write `logs/suite-red-inventory.md`.** Not to test, not to demonstrate, not to "refresh it while I'm here". Every demonstration goes to a scratch path under `mktemp -d`. **Writing the live report is the exact harm this task exists to prevent, and doing it would destroy the 291 lines before the fix that protects them has ever been reviewed.** If your work leaves that file modified, you have failed the task regardless of what else passed.
- 🚫 Do not run the full e2e suite. That is f1643-2's job, it is gated on an owner throttle ruling, and it is not yours.
- 🚫 Do not touch `scripts/red-inventory-lookup.mjs`, `scripts/suite-red-inventory-compact.mjs`, `package.json`, or any `logs/**` tracked file.
- 🚫 Do not edit, reorder or "tidy" any content inside the live report even in scratch copies you then diff — preserved text is preserved verbatim.

## Self-check before you report

- `npx tsc --noEmit` clean.
- `npm run build` green.
- `node --test scripts/suite-red-inventory.test.mjs` — all tests, pass count quoted, and the RED-then-GREEN evidence from scope 3 quoted.
- `node --test scripts/red-inventory-lookup.test.mjs` — the consumer's own suite, unmodified, still green.
- `git status --short` shows **exactly** the two TOUCH-ONLY files modified, and **`logs/suite-red-inventory.md` is NOT among them** — state this explicitly, by name.
- Scope 4's ten headings + `F-1587-1` + the table header, with counts quoted.

READY-FOR-GATES when all of the above is quoted in your report. Report: the two RED-then-GREEN transcripts, the scope-4 acceptance counts, the reducer's new stdout line, and anything you found that this master got wrong — a disagreement reported is worth more than a fix improvised.
