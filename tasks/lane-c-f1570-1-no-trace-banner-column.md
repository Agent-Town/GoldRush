# Task f1570-1: the residual bucket is named for what was CHECKED, and it declares the masters that forbid their own queueing (LANE-C, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s1570, from **F-1570-1**, which I filed at this fire's own drain of the very slice you are amending. I did not inherit the number: I ran the shipped classifier on the merged tree, read the first lines of the masters it called `TRULY-BANKED`, and found a fifth of them telling me not to queue them.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c`.

READ FIRST: `AGENTS.md`; `scripts/master-shipped-classifier.mjs` — **the whole file, it is 150 lines and it is the subject**; `scripts/master-shipped-classifier.test.mjs` — **its fixture style, because you are adding to it and it deliberately builds a temp tree rather than pinning to the live corpus**; `reviews/f1569-1-master-shipped-classifier.md` — **both the runner's "Evidence model" section and the `# DRAIN — s1570` section at the foot, which is where F-1570-1 is stated with its measurements**; `tasks/BACKLOG.md` row **F-1570-1**; `scripts/tmp-s1046-unshipped.mjs` — **all 23 lines, and specifically the banner line, because the instrument you are amending dropped a signal this superseded one had**; `CLAUDE.md` Mistake #8 (the 824k flail).

**Pre-flight (LANE-SAFETY, runner-auto-commit aware):** the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/c main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP**, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-c status --short` → must be clean, with the **FACTORY-CHURN EXCEPTION (F-1407-1), always expected and never a STOP; list them and proceed: (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

**SEQUENCING / CITATION CHECK (F-1424-3 — run BOTH before any edit).** Each key is a single line, verified to print `1` on main at dispatch (s1570):

```sh
grep -c "evidenceSummary: winning === 'TRULY-BANKED' ? 'empty set'" scripts/master-shipped-classifier.mjs
grep -c "const banner = /DO-NOT-QUEUE|SHIPPED|" scripts/tmp-s1046-unshipped.mjs
```

Both must print `1`. **If either prints `0`, STOP and report "lane drifted or predecessor absent" — do NOT improvise.** The first proves f1569-1 (merge `924e59711cf1ee1d1f38310644ce7b6a31c7b96b`) is present in this lane; the second proves the superseded instrument is present for you to read.

## Why (F-1570-1, filed s1570 at the drain of f1569-1, measured on the merged tree)

`scripts/master-shipped-classifier.mjs` shipped at `924e59711` and answers shipped-ness by evidence rather than filename — a real advance. But its third verdict is the word **`TRULY-BANKED`** and its evidence column prints **`empty set`**, and both assert far more than the probe establishes.

The evidence model deliberately rejects, per the slice's own review, "BACKLOG banners, task prose, and source/e2e/spec content probes" as shipped evidence. **That exclusion is right for the SHIPPED verdict** — a declaration is not a merge — **and wrong in the NAME of the residual bucket**, which in truth means only "no trace in the named evidence directories".

✓ **MEASURED s1570 on the merged tree, over the live corpus of 969 masters (the run is banked at `artifacts/f1569-1-live-corpus.json`):**

- **67 of 335 `TRULY-BANKED` masters (20.0%)** contain an explicit **"DO NOT QUEUE"** in their own first six lines. Widening to the `SHIPPED|SUPERSEDED|RETIRED|⛔` banner class: **101 of 335 (30.1%)**.
- **95 masters board-wide carry a DO-NOT-QUEUE banner, and 67 of them — 70.5% — land in `TRULY-BANKED`.** The one bucket the tool designates as candidate work is exactly where the forbidden masters pool.
- Named, each classified `TRULY-BANKED / empty set`: `001-m2-01-buildable-registry-and-menu.md`, `002-m2-03-wave-scheduler-v2.md`, `003-vp-03-terrain-variety.md`, `004-vp-02-sprite-animation.md`, `005-m2-02-sluice-and-stockpile.md` — each opening `⛔ **SHIPPED — DO NOT QUEUE (Mistake #8 guard, content-probed s1132 2026-07-27)**`, several adding *"No done-move exists"* in the same sentence.

⚖️ **The point is not that the classifier miscomputed anything — it computed exactly what it claims.** It is that s1132 did the expensive content-probe, established shipped-ness, and wrote the verdict into the master's own first line, and the new instrument declines to read that record and then labels the master with the strongest available word for its opposite. ⓘ **The superseded script was better on this one axis:** `scripts/tmp-s1046-unshipped.mjs:20`, the line reading `const banner = /DO-NOT-QUEUE|SHIPPED|⛔/.test(head) ?`, flags `<<< HAS DO-NOT-QUEUE/SHIPPED BANNER` on every hit. **The replacement dropped the single signal that guards Mistake #8.**

## Scope

1. **Rename the residual verdict from `TRULY-BANKED` to `NO-TRACE`, everywhere, including the JSON shape.** The string appears at 7 sites in `scripts/master-shipped-classifier.mjs` (grep it; do not work from this count, re-derive it). The `counts` key, the per-verdict `verdict` field, the table column and the `--strict` predicate all move together. **The name must state what was checked**: no trace in the evidence directories named in the review's evidence model.
2. **Add a `banner` field to every verdict record**, derived from the master's **own first six lines** (the same window the measurement above used — do not widen it without saying so in your report). Record the matched marker text, not just a boolean, so a reader can see *why*. Use the marker class `/DO NOT QUEUE|DO-NOT-QUEUE/i` for the strict field; if you also want the wider `SHIPPED|SUPERSEDED|RETIRED|⛔` class, put it in a **separate** field with a distinct name — **do not merge the two into one number**, because their counts differ by a factor the report must keep visible (67 vs 101).
3. **Print the split in the table's summary line.** The current line ends `· TRULY-BANKED N · DISAGREES M`. It must instead make the contamination unmissable, in the shape: `NO-TRACE 335, of which 67 self-declare DO NOT QUEUE → 268 candidates`. The exact wording is yours; the requirement is that **a reader cannot see the residual count without also seeing how much of it is forbidden.**
4. **Add a `BANNER` column to the per-row table output** so the individual `001-m2-01-*`-class rows carry their own warning at the point of reading, not only in the summary.
5. **Keep the tool ADVISORY and exit-0 by default. Do not change the `--strict` contract's direction** — it may now key on the *candidate* count rather than the raw residual (that is an improvement, since the banner-flagged masters are not candidates), but it must still be the only path that can return non-zero, and the default path must still return 0 on every input including its own error path.
6. **Tests, in `scripts/master-shipped-classifier.test.mjs`, built in a temp tree exactly as the existing five are** (never pinned to the live corpus — it changes under you): (a) a master with no trace and no banner is `NO-TRACE` with `banner` empty and counts as a candidate; (b) a master with no trace but carrying `⛔ SHIPPED — DO NOT QUEUE` in its first lines is `NO-TRACE` with the marker recorded and is **excluded from the candidate count**; (c) the banner window is six lines — a DO-NOT-QUEUE on line 9 is NOT picked up (assert the boundary, so nobody silently widens it later).
7. **MANUFACTURE THE RED and report its exact output.** With the cure in place, delete the banner detection (or force it to return empty) and show that test (b) fails, naming the assertion and the actual-vs-expected values. A passing test never executes its violation path, so a green alone is not evidence about the red. Restore, and confirm the restore.
8. **Re-run the tool over the LIVE corpus and report the new headline**, plus a regenerated `artifacts/f1570-1-live-corpus.txt`. ⚠️ **Expect the residual total to remain 335** — you are renaming and annotating, not reclassifying — **and the candidate count to be 268.** If either differs, that is a finding: report it, do not tune toward these numbers.

## Firewall

**Touch ONLY:** `scripts/master-shipped-classifier.mjs` · `scripts/master-shipped-classifier.test.mjs` · `artifacts/f1570-1-live-corpus.txt` (new) · `reviews/f1570-1-no-trace-banner-column.md` (new, your report).

**NO changes to:** `scripts/tmp-s1046-unshipped.mjs` — **it is a historical artefact retired by comment under the RETENTION LAW; read it, cite it, never edit or delete it** · `artifacts/f1569-1-live-corpus.{json,txt}` — the banked s1569 run, evidence for F-1570-1; leave it byte-identical · the classifier's **evidence model** — do not add banners or content-probes as SHIPPED evidence, that is the very stretch F-1570-1 declines to make; banners annotate the residual bucket and nothing else · `tasks/**` — ⛔ **absolutely no master may be queued, re-queued, moved, renamed, edited or deleted; this task INFORMS a sweep and FORBIDS performing one** · `tasks/goals.json` · `tasks/BACKLOG.md` · `STATUS.md` · any `src/**`, `e2e/**`, `specs/**` · any other `reviews/*.md`.

🔓 **No firewall lift is granted.** If you find an adjacent defect, **report it in your review file — do not fix it** (CLAUDE.md §4.5).

## Self-check (evidence, not vibes)

`npx tsc --noEmit` rc=0. `npm run build` green — quote the Vite time and the asset-diet line. `node --test scripts/master-shipped-classifier.test.mjs` — all tests, old and new, pass; quote the counts. `npm run test:ledger-guards` green — quote files/tests/pass/fail and note which chained leaves ran. Live CLI: default rc=0, `--strict` rc as designed; quote the new summary line verbatim. **No Playwright and no `test:node-guards` are owed or claimed** — this slice touches no `src/**`, `e2e/**`, `src/sim/`, `src/systems/` or `src/entities/`; say so explicitly rather than silently skipping.

**No-op guard:** if you find yourself about to exit without changes, **WRITE WHY into your report first** — a silent no-op wastes a queue slot and a gate.

**READY-FOR-GATES** + report: the re-derived count of `TRULY-BANKED` sites you renamed · the new summary line verbatim · the manufactured RED's exact assertion output and the confirmed restore · the live residual/candidate split and whether it matched the predicted 335/268 · anything adjacent you found and deliberately did not fix.
