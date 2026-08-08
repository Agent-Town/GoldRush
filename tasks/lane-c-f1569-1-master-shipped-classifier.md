# Task f1569-1: shipped-ness is answered by a PROBE, never by a filename (LANE-C, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s1569, from **F-1568-1** (filed s1568) and **F-1569-1** (filed s1569, this fire, below). I did not inherit either number: I re-ran the never-ran measurement myself before authoring, got a different answer than the finding did, and traced the difference to the exact defect the classifier is being built to end.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c`.

READ FIRST: `AGENTS.md`; `scripts/tmp-s1046-unshipped.mjs` — **the whole file, it is 23 lines and it is the instrument this task supersedes**; `scripts/stale-open-candidates.mjs` — **its header comment `:1-27` and its exit discipline, because it is the house model for an ADVISORY reporter and you are writing a sibling of it**; `tasks/BACKLOG.md` rows **F-1568-1** and **F-1569-1**; `CLAUDE.md` Mistake #8 (the 824k flail) and Mistake #16 (the announced drain); `scripts/fire.md` §2E (refill law — the consumer of your output).

**Pre-flight (LANE-SAFETY, runner-auto-commit aware):** the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/c main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to `artifacts/**`, `reviews/shots-*` and any `.png` are NEVER "work" and NEVER a STOP** — discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-c status --short` → must be clean, with the **FACTORY-CHURN EXCEPTION (F-1407-1), always expected and never a STOP: (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*`, any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

**SEQUENCING / CITATION CHECK (F-1424-3 — run BOTH before any edit).** Each key is a single line, verified to print `1` on main at dispatch (s1569):

```
grep -Fc "  const bare = stem.replace(/^lane-[a-d]?-?/, '');" scripts/tmp-s1046-unshipped.mjs
grep -Fc "  process.exit(0); // advisory: never block a drain on our own absence" scripts/stale-open-candidates.mjs
```

Both MUST print `1`. If either prints `0`, **STOP and report "lane-c stale: <which key> missing"**. Do NOT read a `0` as "the file changed shape" and improvise — the first key proves the exact filename transform you are here to retire is still present to be measured against, the second proves the advisory-exit model you are here to copy still exists.

---

## Why (F-1568-1 re-measured s1569, and F-1569-1 filed as a result)

Three consecutive fires (s1565, s1566, s1567) carried a standing desk item reading *"125 never-ran masters sit in `tasks/`, ~120 from the 2026-07-27 bulk; a stale-check sweep of that pile is still unclaimed and unpriced."* s1568 tried to price it and found the figure does not survive contact: no 2026-07-27 bulk exists, and of the 74 "candidate real masters" it identified, **33 already had a review file on main** — i.e. they were gated and merged. Its conclusion is binding and is the premise of this task: **shipped-ness cannot be read off a filename.**

✓ **I RE-RAN THE MEASUREMENT MYSELF (s1569) AND GOT A DIFFERENT NUMBER, WHICH IS THE POINT.** Same repo, same minute, same definition of "never-ran" (no trace of the master in `done/ failed/ running/ runs/ queue-paused/ stopped/` or any queue directory), 968 masters in `tasks/*.md` both times:

| method | never-ran |
|---|---|
| match the master's **full stem** only | **107** |
| also match its **slot-stripped** name (`lane-c-foo` → `foo`) | **66** |

🔑 **THE TWO NUMBERS DIFFER BY 41 MASTERS — 38% OF THE HEADLINE — AND NOTHING ABOUT THE REPOSITORY CHANGED BETWEEN THEM.** The only difference is whether you strip the `lane-<x>-` prefix before matching. **F-1569-1 (s1569):** s1568's own 107 is the stem-only count, while s1568's own prose correctly observes that *"the review and done-move names systematically differ from the master's (the slot prefix is dropped)"* — so its headline figure was produced by the one transform its own analysis says is wrong, and 41 of its 107 are masters that DO have traces under their slot-stripped name. This is not a criticism of that fire; it is the strongest available evidence for its thesis. **An "upper bound" that moves by 38% depending on an undeclared string transform is not a bound. It is a symptom.**

⚠️ **AND THE DEFECTIVE INSTRUMENT IS STILL ON DISK AND STILL RUNNABLE: `scripts/tmp-s1046-unshipped.mjs`.** It is 23 lines, it hardcodes an absolute path to Robin's home directory, and its entire theory of shipped-ness is the comment on its own line 12: *"a master counts as landed if any done-move mentions its stem (with or without the lane- prefix)"*. It looks only at `tasks/done`, so it cannot see `failed/`, `stopped/`, the queues, review files, or goal leaves. **Any fire that runs it and believes it will re-queue merged work — Mistake #8, the 824k flail, at a scale of dozens.**

➡️ **SO THE DELIVERABLE IS AN INSTRUMENT THAT ANSWERS THE QUESTION WITH EVIDENCE INSTEAD OF WITH A STRING TRANSFORM**, and whose output a refilling fire (§2E) can act on without re-deriving anything.

## Scope

1. **Write `scripts/master-shipped-classifier.mjs`.** For every `tasks/*.md` (excluding `BACKLOG.md`), emit exactly one verdict with the evidence that produced it:
   - **SHIPPED** — a merged goal leaf in `tasks/goals.json` whose `taskFile` is this master, **or** a review file on main whose stem matches the master's slot-stripped stem, **or** a `drained-<hash>-` done-move naming it. Record WHICH of these fired and the hash where there is one.
   - **RAN-UNMERGED** — a trace exists in `done/ failed/ running/ runs/ stopped/ queue-paused/` or a queue, but no SHIPPED evidence. **This is the bucket that may be real work; it is also the bucket where a stale re-queue is most dangerous, so it must name its trace.**
   - **TRULY-BANKED** — no trace of any kind. Only this bucket is candidate work.
2. **Every verdict carries its evidence, and "no evidence" is itself printed.** A verdict with an empty evidence list is a bug in the classifier, not a TRULY-BANKED master — except for TRULY-BANKED, whose evidence is by definition the empty set and which must say so in those words.
3. **Resolve names by BOTH transforms and report when they disagree.** Match on the full stem AND the slot-stripped stem; when the two transforms yield different verdicts for the same master, print it in a **`DISAGREES`** column. That column is the direct instrumentation of F-1569-1 and its count is a number this task must report.
4. **Advisory by default; exit 0 always.** Copy the discipline of `stale-open-candidates.mjs` verbatim in spirit — a reporter that reds on a large fraction of a legacy pile is excused into uselessness within two fires (the `cross-engine` label's fate, F-1460-1). `--strict` may exit 1 **only** when the TRULY-BANKED bucket is non-empty; `--json` prints the machine shape. **Do not make it a gate and do not add it to any npm test script.**
5. **Read the master's FIRST LINE for its prose name and print it.** F-1568-1's own examples (`lane-a-m5-01-crafting-contract`, `lane-b-m4-01-agent-scaffold`) are shipped work whose filenames say nothing; the human reading your table needs the title to judge. Truncate to a sensible width.
6. **Tests in `scripts/master-shipped-classifier.test.mjs` that MANUFACTURE the defect.** A passing reporter never executes its violation path. Against a temp fixture tree you build (never against the live repo — the live corpus changes under you and a test pinned to it rots by next fire):
   - a master named `lane-c-foo.md` with a done-move `drained-abc1234-<date>-lane-c-foo.md` → **SHIPPED**, and the evidence names the hash;
   - the same master with a review file `reviews/foo.md` and no done-move → **SHIPPED** via the review path (this is the 33-master case s1568 measured, and the case the stem-only transform gets wrong);
   - a master with a `failed/` trace only → **RAN-UNMERGED**, evidence naming the trace;
   - a master with nothing → **TRULY-BANKED** with an explicitly empty evidence set;
   - a master whose two name transforms disagree → counted in `DISAGREES`;
   - **the RED arm: assert that a stem-only classifier would call the review-file case TRULY-BANKED** — i.e. write the assertion that fails if someone later "simplifies" the two-transform resolution back into one. State this test's intent in a comment naming F-1569-1.
7. **Run it on the live corpus and report the three bucket counts, the `DISAGREES` count, and how they compare to 107 / 66.** ⚠️ **If your TRULY-BANKED count disagrees with both, that is the correct and expected outcome — REPORT it, do not tune the classifier until it reproduces either number.** Neither 107 nor 66 is a target; both are filename artefacts and this task exists because they are.
8. **Retire the superseded instrument by NAMING it, not by deleting it.** Add a header comment to `scripts/tmp-s1046-unshipped.mjs` — **comment only, do not change one line of its executable code** — stating that it is superseded by the classifier, that its filename-only method is F-1568-1/F-1569-1, and that its output must not be used to re-queue anything. **Do not delete the file** (the RETENTION LAW's spirit: supersede, don't erase — and its 23 lines are the historical evidence for the finding).

## Firewall

**TOUCH-ONLY:** `scripts/master-shipped-classifier.mjs` (new) · `scripts/master-shipped-classifier.test.mjs` (new) · `scripts/tmp-s1046-unshipped.mjs` (**comment header ONLY**) · `reviews/f1569-1-master-shipped-classifier.md` (your report) · `artifacts/f1569-1-*` (captured output).

**NO — these are task failures even if every suite is green:**
- **Do not queue, re-queue, move, rename or delete a single master.** This task builds the instrument that would inform such a sweep. **It does not perform the sweep.** Any master file changed under `tasks/` is a firewall breach.
- **`package.json` is untouched.** This is not a gate and must not join `test:ledger-guards` or `test:node-guards`; run your test file directly with `node --test`.
- **`tasks/goals.json`, `tasks/BACKLOG.md`, `STATUS.md`** — untouched. The fire does that bookkeeping.
- **Do not change `scripts/tmp-s1046-unshipped.mjs`'s executable code**, including its hardcoded path. Comment only. If you think the path is a bug, that is a finding in your report.
- **Do not "fix" the corpus.** If you find masters that look duplicated, misnamed, or shipped-but-banked, that is REPORT material — the whole point is that acting on filename evidence is what went wrong.

## Self-check (run all; paste real numbers, not adjectives)

- `npx tsc --noEmit` → rc 0
- `npm run build` → green (record vite time + asset-diet bytes)
- `node --test scripts/master-shipped-classifier.test.mjs` → all pass; record the test count
- the RED proof of scope 6 → with the two-transform resolution collapsed to stem-only, record rc and which tests fail with their assertion text; then restore and record the green
- `npm run test:ledger-guards` → record files / tests / pass / fail and the chained-leaf count (you add no gate, so this is a no-regression check; the total should be unchanged)
- the live-corpus run of scope 7 → SHIPPED / RAN-UNMERGED / TRULY-BANKED / DISAGREES counts, beside 107 and 66
- No Playwright and no `test:node-guards` are owed: this slice touches no `src/**`, `e2e/**`, `src/sim/`, `src/systems/` or `src/entities/`. **Say so explicitly rather than claiming a green you did not take.**

**READY-FOR-GATES** + report: the four counts from scope 7 and your reading of what they mean · the RED proof verbatim · every evidence path your classifier consults, and any you considered and rejected · whether TRULY-BANKED is small enough that a follow-up sweep is now cheap (a number, plus the list if it is under ~20) · anything in `tmp-s1046-unshipped.mjs` you would change but did not.
