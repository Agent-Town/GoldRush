# Task findings-state-vocabulary-triage: classify the 25 double-state candidates the new guard cannot see, and MEASURE what widening its vocabulary would cost (LANE SLOT)
FIRE-AUTHORED s1259 (attended review welcome)
You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b` (branch `lane/m4`, commit prefix `test:`).
CODEX: model=gpt-5.6-sol effort=high

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)

The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/m4 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

> ℹ️ Authoring-time safety measurement (s1259 — **verify it yourself anyway**): `lane/m4`'s only ahead commit was `1b769c44`, which I drained this fire as `82f0b394`. All three of its files (`scripts/findings-state-guard.mjs`, `scripts/findings-state-guard.test.mjs`, `package.json`) are **byte-identical to main by blob hash**, checked individually. The branch will still *look* ahead: `main..lane/m4` lists 15 paths, but 12 are `logs/` churn, `STATUS.md` and `tasks/` that MAIN moved after the lane forked, and one — `reviews/findings-state-guard.md` — appears with status letter **`D`**, i.e. main has it and the branch does not. **That `D` is not lane content; reading it as "the branch holds something" is the F-1257-5 direction trap, and I nearly fell into it myself while authoring this.** Safe dupe.

## READ FIRST (paths, in this order)

1. `scripts/findings-state-guard.mjs` — the guard merged this fire (`82f0b394`). Its header states its own limit; that limit is this task's subject.
2. `reviews/findings-state-guard.md` — the drain review, especially **F-1259-1** and **F-1259-2**.
3. `logs/session-scratch/s1259/findings-double-state.mjs` — **the instrument that produced the numbers below.** It is a scratch probe, not a guard: written from the master's stated discriminator without reading the guard's implementation, so the two can disagree. Read its header comment; it records all three parse rules it tried and what each cost.
4. `tasks/BACKLOG.md` — the subject. **You will not edit it.**

## Why

The guard now on main answers *"is a finding declared closed and open at once?"* — but only for lines led by `🟡` or `✅`. s1259 measured that vocabulary: **`🟡` is 22 of 424 declaration rows (5%)**. The dominant open glyphs are `🔴`×47, `(none)`×39, `⚠️`×38, `🔻`×28, `🟠`×24, `🔬`×22, then ~30 more. Under a full-vocabulary reading, main carries **33** double-state findings, **25** of which carry no self-locating marker (not `(original`, not `SUPERSEDED`, not `CLAIMED sNNNN`, not `retained per the RETENTION LAW`).

The guard ships honest because it says so in its header. **But 25 candidates is exactly the size where the answer matters and guessing is fatal:** widen the vocabulary naively and the guard reds on lawful Retention-Law history, and the next fire learns to ignore it — which is worse than the narrow guard. s1259 refused to widen inside a drain for that reason and wrote this rung instead.

**And the reason this must be a code probe rather than a careful read: s1259 struck three stale findings, and only two of them were double-state at all.** `F-1179-1` was invisible to *any* vocabulary — no line declared it closed, so the ledger was perfectly self-consistent while being wrong, and it was the one advertising itself `FIRE-AUTHORABLE`. **The ledger's own words are not evidence about the ledger. Only the code and the goal leaves are.**

## Scope (numbered; each independently checkable)

1. **Re-derive s1259's four numbers before trusting any of them** — 424 declaration rows, `🟡` = 22, broad double-state = 33, unmarked = 25 — by running the READ-FIRST probe on current `main`. Report what you get. **If a number differs by more than ±2, STOP AND REPORT rather than proceeding**: it means the file moved under the measurement or the probe disagrees with itself, and which of those it is decides whether this task is even well-posed.
2. **Classify every unmarked candidate BY CODE OR LEAF PROBE, never by what the ledger says about itself.** For each, the verdict is one of:
   - **(a) STALE** — the closure is real and the open line is dead. Proof required: a merge hash, a `tasks/goals.json` leaf at `merged`/`shipped`, or a file probe showing the cited defect is gone.
   - **(b) LAWFUL** — the open line is Retention-Law retained history, a `CLAIMED/AUTHORED/QUEUED` workflow row, or an explicitly superseded framing. A widened guard **must not** red on these.
   - **(c) GENUINELY OPEN** — the closure is partial and the open line still describes live work. Proof required: the cited defect still reproduces in the code.
   - **(d) UNDETERMINED** — you could not settle it in reasonable time. **This is an ACCEPTABLE verdict and saying so is a success.** A confident guess is a FAILURE.
3. **From the classification, MEASURE the widening rather than recommend it in the abstract.** Report: how many of the 25 are (a)+(c) — the true positives a widened guard would catch — and how many are (b) — the false positives it would inflict. Then state the vocabulary rule that maximises the first while zeroing the second, **or report that no such rule exists in this file's conventions**, which is itself a complete and useful answer (it would mean the widening needs a ledger-convention change, i.e. an owner/attended decision, not a parser change).
4. **Deliverable is a report, not a fix:** `artifacts/findings-state-vocabulary-triage.md` — a table with one row per candidate (F-ID, closed line, open line, glyph, verdict a/b/c/d, and the *evidence* for that verdict: hash, leaf id, or file:symbol). Plus a short section answering scope 3. **No BACKLOG strikes:** the ledger belongs to the fires (one writer per surface), and a lane task editing it is a law violation. Your table is what lets the next fire strike them safely in one pass.
5. **Do not touch `scripts/findings-state-guard.mjs`.** Its widening is the *next* rung and is decided by your report. If you find the guard has an outright BUG (as opposed to a documented narrowness), that is a finding to report, not to fix here.

## Firewall

**TOUCH-ONLY:** `artifacts/findings-state-vocabulary-triage.md` (new) · optionally ONE new scratch instrument under `logs/session-scratch/s1259-triage/` if you need to extend the probe (temporary instrumentation is allowed; a committed instrument must be honest about being a scratch probe, not a guard).

**NO:** ⛔ **zero `src/` bytes** · ⛔ **zero `e2e/` bytes** · ⛔ **do not edit `tasks/BACKLOG.md`, `tasks/goals.json`, or `STATUS.md`** — those are the fires' ledgers · ⛔ do not edit `scripts/findings-state-guard.mjs` or its test · ⛔ do not add a baseline file for anything · ⛔ no `package.json` changes (this rung wires nothing).

## Self-check before you report

- `npx tsc --noEmit` rc=0 · `npm run build` green (both, even though you changed no code — they prove you left the tree clean).
- `node scripts/findings-state-guard.mjs` still **PASS** with `double-state : 0` — you must not have perturbed its subject.
- `node --test scripts/findings-state-guard.test.mjs` 2/2.
- `node scripts/citation-title-guard.mjs` **PASS** — ⚠️ if your report cites any `spec:line`, quote a real test title or a real source line beside it, or you will red this ratchet (and note it only sees TRACKED files, so commit before believing a green: F-1256-3).
- `git diff --name-only main...HEAD` lists **only** the paths in TOUCH-ONLY. Zero `src/`, zero `e2e/`, zero `tasks/`.
- State your verdict counts explicitly: `(a) N · (b) N · (c) N · (d) N`, summing to the count from scope 1.

**READY-FOR-GATES** + report: the four re-derived numbers from scope 1 (and whether any tripped the STOP), the verdict counts, the scope-3 answer (the vocabulary rule, or the finding that none exists), and anything you could not determine and why.
