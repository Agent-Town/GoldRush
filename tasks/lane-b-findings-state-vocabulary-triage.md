# Task findings-state-vocabulary-triage: classify the 18 confirmed-unmarked double-state candidates, confirm the 5 the instrument itself invented, and MEASURE what widening the guard's vocabulary would cost (LANE SLOT)
FIRE-AUTHORED s1259, **REFRESHED s1260 after a lawful STOP — attempt 2 with a CHANGED PREMISE** (attended review welcome)
You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b` (branch `lane/m4`, commit prefix `test:`).
CODEX: model=gpt-5.6-sol effort=high

> ⛔ **ATTEMPT 1 STOPPED, CORRECTLY, AND IT WAS THE MASTER'S FAULT — NOT YOURS AND NOT THE TREE'S.** s1259 authored this task with a baseline it had measured *before its own edits landed*, then struck three findings and wrote two new ones four minutes later; the run dutifully re-derived, found `427` where the master said `424`, and stopped on the +3 as instructed (run log `tasks/runs/20260730-150612-lane-b-lane-b-findings-state-vocabulary-triage.md.log`, ~3 min, 85,129 tokens, no artifact, lane left clean). **That STOP was right and cost a slot.** s1260 re-derived the drift at six revisions and traced all four number changes to s1259's own commit `7acdaf07` — see **F-1260-1**. ➡️ **So scope 1 below no longer gates on four global scalars that any unrelated ledger edit perturbs. It gates on a NAMED population you can locate individually.** Per the changed-premise law (`CLAUDE.md` §7.5) this is a legitimate second attempt: refreshed baseline, restated population, redesigned gate.

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)

The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/m4 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

> ℹ️ Authoring-time safety measurement (s1260 — **verify it yourself anyway, per VERIFY-DON'T-INHERIT**): this is now the strongest form of safe, and it needs no per-blob argument. `git rev-list --count main..lane/m4` = **0** · `lane/m4..main` = **3** · `git merge-base --is-ancestor lane/m4 main` **succeeds**. **`lane/m4` is a strict ANCESTOR of main: the branch holds nothing main lacks, so the reset cannot destroy anything.** (Attempt 1's pre-flight had to reason blob-by-blob and warned about a `D` status letter in `main..lane/m4` — the F-1257-5 direction trap. That ambiguity is gone: an ancestor check is direction-proof.)

## READ FIRST (paths, in this order)

1. `scripts/findings-state-guard.mjs` — the guard merged s1259 (`82f0b394`). Its header states its own limit; **that limit is this task's subject.**
2. `reviews/findings-state-guard.md` — the drain review, especially **F-1259-1** and **F-1259-2**.
3. `tasks/BACKLOG.md` — **F-1260-1** (why attempt 1 stopped) and **F-1260-2** (the instrument's own blind spot, which is scope 1b). **You will not edit this file.**
4. `logs/session-scratch/s1259/findings-double-state.mjs` — **the instrument that produced every number below.** It is a scratch probe, not a guard: written from the master's stated discriminator without reading the guard's implementation, so the two can disagree. Read its header comment, and read **line 29** (`CLOSED_RE`) with F-1260-2 in hand.
5. `logs/session-scratch/s1260/baseline-drift.txt` — the six-revision drift table behind F-1260-1.

## Why

The guard now on main answers *"is a finding declared closed and open at once?"* — but only for lines led by `🟡` or `✅`. s1259 measured that vocabulary: **`🟡` is 22 of 429 declaration rows (5%)**. The dominant open glyphs are `🔴`×47, `(none)`×39, `⚠️`×38, `🔻`×28, `🟠`×24, `🔬`×22, then ~30 more. Under a full-vocabulary reading, main carries **34** double-state findings, **23** of which carry no self-locating marker (not `(original`, not `SUPERSEDED`, not `CLAIMED sNNNN`, not `retained per the RETENTION LAW`).

The guard ships honest because it says so in its header. **But two dozen candidates is exactly the size where the answer matters and guessing is fatal:** widen the vocabulary naively and the guard reds on lawful Retention-Law history, the next fire learns to ignore it, and that is worse than the narrow guard. s1259 refused to widen inside a drain for that reason and wrote this rung instead.

**And the reason this must be a code probe rather than a careful read: s1259 struck three stale findings, and only two of them were double-state at all.** `F-1179-1` was invisible to *any* vocabulary — no line declared it closed, so the ledger was perfectly self-consistent while being wrong, and it was the one advertising itself `FIRE-AUTHORABLE`. **The ledger's own words are not evidence about the ledger. Only the code and the goal leaves are.**

**s1260 adds the mirror-image warning, and it is why scope 1b exists.** F-1259-1 caught the *guard* using too narrow an **open** vocabulary. The probe that caught it uses too narrow a **closed** vocabulary: `CLOSED_RE` at `findings-double-state.mjs:29` does not admit **`DRAINED`**, nor the `🟢` glyph, nor "LAWFUL STOP". So 5 of its 23 accusations are its own artefact — `F-1104-1`'s "open" line literally reads *"IS DRAINED (`5ec26bce`)"*. **Neither instrument is trustworthy about its own denominator. You are the third reading, so do not inherit either.**

## Scope (numbered; each independently checkable)

1. **Locate the NAMED population — this replaces attempt 1's four-scalar ±2 gate (F-1260-1).** Run the READ-FIRST probe on current `main` and confirm it still reports these **23** unmarked candidates, which s1260 derived at the commit that queued this task:

   `F-1026-1` · `F-1026-5` · `F-1032-1` · `F-1039-2` · `F-1045-1` · `F-1047-1` · `F-1068-5` · `F-1104-1` · `F-1126-1` · `F-1126-2` · `F-1167-4` · `F-1168-1` · `F-1170-2` · `F-1173-3` · `F-1173-7` · `F-1179-3` · `F-1198-2` · `F-1200-3` · `F-1201-1` · `F-1202-1` · `F-1210-5` · `F-1252-1` · `F-1256-2`

   Also report the headline counts for the record (**s1260 measured: 429 declarations · `🟡` 22 · broad 34 · unmarked 23**). ⚠️ **A count that has drifted is NOT a STOP — note it and carry on.** The ledger is edited by every fire, and a drifting total is normal. **STOP only if a NAMED F-ID above cannot be found in `tasks/BACKLOG.md` at all**, which would mean the file moved under you in a way that invalidates the population itself. If new unmarked candidates have appeared since, add them to your table and say so.

2. **(scope 1b) Confirm or REFUTE F-1260-2's prediction, before you classify anything.** s1260 predicts these **5** are artefacts of the probe's closure vocabulary rather than ledger defects: `F-1032-1` · `F-1068-5` · `F-1104-1` · `F-1179-3` · `F-1252-1`. For each, check whether its "open" line in fact declares its own closure in words `CLOSED_RE` cannot read (`DRAINED`, `🟢`, "LAWFUL STOP", "opened sNN by the drain above", …). **Refuting any of the 5 is a valuable result, not a failure** — say so plainly with the line quoted. The remaining **18** are the genuinely-unmarked set and the real work of scope 3.

3. **Classify every candidate BY CODE OR LEAF PROBE, never by what the ledger says about itself.** For each, the verdict is one of:
   - **(a) STALE** — the closure is real and the open line is dead. Proof required: a merge hash, a `tasks/goals.json` leaf at `merged`/`shipped`, or a file probe showing the cited defect is gone.
   - **(b) LAWFUL** — the open line is Retention-Law retained history, a `CLAIMED/AUTHORED/QUEUED` workflow row, or an explicitly superseded framing. A widened guard **must not** red on these.
   - **(c) GENUINELY OPEN** — the closure is partial and the open line still describes live work. Proof required: the cited defect still reproduces in the code.
   - **(d) UNDETERMINED** — you could not settle it in reasonable time. **This is an ACCEPTABLE verdict and saying so is a success.** A confident guess is a FAILURE.
   - **(e) INSTRUMENT ARTEFACT** — scope 1b confirmed it; the ledger is fine and the probe is wrong.

4. **From the classification, MEASURE the widening rather than recommend it in the abstract.** Report: how many are (a)+(c) — the true positives a widened guard would catch — and how many are (b) — the false positives it would inflict. **Widening has TWO dials now, and F-1260-2 is the evidence that the second matters as much as the first:** the **open-glyph** vocabulary (which glyphs mean "still open") and the **closure-verb** vocabulary (which words mean "closed"; `DRAINED` is the conspicuous omission). State the rule over both that maximises true positives while zeroing false positives, **or report that no such rule exists in this file's conventions** — itself a complete and useful answer, meaning the widening needs a ledger-convention change, i.e. an owner/attended decision rather than a parser change.

5. **Deliverable is a report, not a fix:** `artifacts/findings-state-vocabulary-triage.md` — a table with one row per candidate (F-ID, closed line, open line, glyph, verdict a/b/c/d/e, and the *evidence* for that verdict: hash, leaf id, or file:symbol). Plus a short section answering scope 4. **No BACKLOG strikes:** the ledger belongs to the fires (one writer per surface), and a lane task editing it is a law violation. Your table is what lets the next fire strike the (a)-verdicts safely in one pass. **A report with no BACKLOG diff is COMPLIANCE, not an omission.**

6. **Do not touch `scripts/findings-state-guard.mjs`, and do not "fix" the probe in place.** The guard's widening is the *next* rung and is decided by your report. The probe is s1259's committed instrument and its flaw is now a documented finding; if you need a corrected copy, make a NEW scratch instrument under `logs/session-scratch/s1260-triage/` and say what you changed and why. If you find either has an outright BUG (as opposed to a documented narrowness), that is a finding to report, not to fix here.

## Firewall

**TOUCH-ONLY:** `artifacts/findings-state-vocabulary-triage.md` (new) · optionally ONE new scratch instrument under `logs/session-scratch/s1260-triage/` if you need to extend or correct the probe (temporary instrumentation is allowed; a committed instrument must be honest about being a scratch probe, not a guard).

**NO:** ⛔ **zero `src/` bytes** · ⛔ **zero `e2e/` bytes** · ⛔ **do not edit `tasks/BACKLOG.md`, `tasks/goals.json`, or `STATUS.md`** — those are the fires' ledgers · ⛔ do not edit `scripts/findings-state-guard.mjs` or its test · ⛔ do not edit `logs/session-scratch/s1259/findings-double-state.mjs` (it is the cited instrument of two findings; copy it instead) · ⛔ do not add a baseline file for anything · ⛔ no `package.json` changes (this rung wires nothing).

## Self-check before you report

- `npx tsc --noEmit` rc=0 · `npm run build` green (both, even though you changed no code — they prove you left the tree clean).
- `node scripts/findings-state-guard.mjs` still **PASS** with `double-state : 0` — you must not have perturbed its subject.
- `node --test scripts/findings-state-guard.test.mjs` 2/2.
- `node scripts/citation-title-guard.mjs` **PASS** — ⚠️ if your report cites any `spec:line`, quote a real test title or a real source line beside it, or you will red this ratchet (and note it only sees TRACKED files, so commit before believing a green: F-1256-3).
- `git diff --name-only main...HEAD` lists **only** the paths in TOUCH-ONLY. Zero `src/`, zero `e2e/`, zero `tasks/`.
- State your verdict counts explicitly: `(a) N · (b) N · (c) N · (d) N · (e) N`, summing to the population from scope 1.

**READY-FOR-GATES** + report: which of the 23 named candidates you located (and any you could not — the only STOP condition), the scope-1b verdict on the 5 predicted artefacts *including any you refuted*, the verdict counts, the scope-4 answer over both vocabularies (or the finding that no clean rule exists), and anything you could not determine and why.
