# lane-f1501-5-citation-quote-pairing — FIRE-AUTHORED (attended review welcome)

**Role:** Codex runner, lane-a. **Workdir:** `worktrees/lane-a` (branch `lane/a`).

## PRE-FLIGHT (STOP conditions — run these before you touch anything)

1. The lane must carry this fire's bookkeeping, which is the freshness proof:
   `git merge-base --is-ancestor 9845bb3e892170e3b7d7f80a56a8e6027d728587 HEAD`
   → **non-zero = STOP.** Report `LANE STALE — missing 9845bb3e` and do nothing else.
2. Prove the subject region is present and unmoved, scoped to the one file so this master's own
   prose cannot rot the key (F-1310-1 / F-1425-2):
   `grep -c "const TITLE_DECL = " scripts/citation-title-guard.mjs`
   → must print exactly **1**. **0 = the lane drifted → STOP** and report `SUBJECT ABSENT`.
   (Measured **1 on main** by s1514 at authoring time; the `QUOTED` line you are changing is the
   next line after it.)
3. `git status --porcelain` must be clean of tracked dirt outside `logs/**`
   (`logs/**` churn is the standing FACTORY-CHURN EXCEPTION, F-1407-1). Tracked dirt elsewhere = STOP.

## READ FIRST (paths, not memory)

- `scripts/citation-title-guard.mjs` — **the only script this task may change.** Read `const QUOTED`
  (immediately below `TITLE_DECL`) and **both** of the scan loops that drive it: the titles loop and
  the `CARRIES-LINE` fallback loop that follows it (F-1252-3). There are **two** call sites and they
  must stay in agreement — changing one is a defect, not a partial fix.
- `scripts/citation-title-guard.test.mjs` — the existing guard test. You extend this; do not add a file.
- `tasks/BACKLOG.md`, the **F-1501-5** row — the finding, its mechanism, and its REC.
  ⚠️ **Read the REC, then read the CORRECTION below before acting on it.**

## WHY (evidence, quoted and dated)

`tasks/BACKLOG.md` F-1501-5 (s1501), measured by instrumenting the guard rather than guessing:
`QUOTED` walks a 400-char window with a **global `lastIndex`**, so quote delimiters pair strictly in
scan order and any quote character consumed is unavailable to later matches. An inline code span
shorter than the 12-char minimum — a hash, a flag — sitting between an old quoted title and a new one
makes the scanner pair the *closing* delimiter of the code span with the *opening* delimiter of the
next title, so **the real title never appears as a capture at all**. The guard then reports
*"no recoverable test title"* about a title that is visibly present in the line it prints.

It fails **CLOSED**, so it costs cycles rather than shipping defects — but s1501 lost a cycle to it
writing the prescribed cure and watching the count not move.

**GATE, verbatim: "fire-authorable — `scripts/citation-title-guard.mjs` only, with a unit test that
manufactures the defect (a short code span between two quoted titles) and proves it is seen, per the
s1299/s1301 standard that a green never exercises a violation path."**

## 🔍 A CORRECTION TO THE FINDING'S OWN REC, MEASURED s1514 — DO NOT IMPLEMENT THE REC LITERALLY

F-1501-5 recommends: *"the real fix is to pair quotes by KIND (backtick-with-backtick,
double-with-double) rather than by any-quote-with-any-quote."*

**That fix works in isolation and REGRESSES THE LIVE CORPUS. Both halves were measured before this
master was written**, by copying the guard, swapping only the `QUOTED` line, and running `--report`
against this repo:

| Arm | NUMBER-ONLY | CARRIES-TITLE | CARRIES-LINE |
|---|---|---|---|
| **baseline (main)** | 263 | **205** | 43 |
| **by-kind — the REC as written** | 304 | **167** ⛔ | 40 |
| **union — loose ∪ by-kind** | 262 | **206** ✅ | 43 |

(citations scanned: **511** in all three arms, so the denominator is stable and these are real
verdict movements, not a different corpus.)

Pairing by kind is **stricter**, and it silently drops **38 citations whose titles the loose scanner
currently does recover**. Those become `NUMBER-ONLY` — i.e. the cure for a guard that falsely reports
a missing title would have made it falsely report **38 more**. In isolation the by-kind regex is
correct: replayed on the exact window F-1501-5 describes, the loose scanner captures
`" and is now titled "` and never the real title, while by-kind captures both titles — **and the same
holds for the sibling apostrophe case the row predicts.** The row's mechanism is right. Its
prescription is not.

➡️ **The union arm — accept a title if EITHER scanner finds it — fixes the described case while being
a strict superset of today's behaviour** (+1 CARRIES-TITLE, −1 NUMBER-ONLY, nothing lost). That +1 is
small *because the corpus has been hand-massaged around this bug for 13 fires* (s1501 itself fixed its
red by deleting backticks); the value is that the workaround stops being necessary, not the +1.

⚖️ **The union is offered as a PROVEN-SAFE FLOOR, not as the required implementation.** If you find a
cleaner formulation — a non-destructive scan that enumerates all candidate spans instead of
consuming them greedily is the obvious one, and is arguably what the code meant to do all along —
take it, provided it clears the acceptance bar in scope 3.

💡 **Why this correction exists at all:** see **F-1514-1**, filed the same fire. A gate sentence is a
predicate about the world and can simply be false; this ledger has no step that tests one. Two
consecutive gates picked up by s1514 prescribed cures that do not work. The probe that catches it is
cheap — run the proposed cure against the live corpus *before* authoring — and it is now this
master's scope 3.

## SCOPE (each item testable)

1. **Fix the pairing so the described case is seen.** Change `QUOTED` and/or how it is scanned in
   `scripts/citation-title-guard.mjs` so that a window containing a quoted title, then a
   shorter-than-12-char inline code span, then a second quoted title, yields **both titles** as
   candidate captures.
   - **Both scan loops must go through the same mechanism.** If you introduce a helper, both the
     titles loop and the `CARRIES-LINE` fallback call it.
   - The sibling case must also be fixed: a bare **apostrophe in prose** between two quoted titles
     currently shifts the pairing identically. Measured s1514 — the loose scanner captures
     `"s own scanner) now titled "` and misses the title.

2. **Do not regress the corpus. This is a hard acceptance bar, not advice.**
   Run `node scripts/citation-title-guard.mjs --report` before and after your change and quote both.
   - `CARRIES-TITLE` **must be ≥ 205** and `NUMBER-ONLY` **must be ≤ 263**.
   - `citations scanned` must stay **511** — if it moves, you changed what gets scanned, not how it
     is paired, and that is out of scope.
   - **If your first attempt lands below the bar, say so with the numbers and try again** — that is
     the measurement working, not a failure. If nothing you try clears it, STOP and report the arms
     you measured; a documented dead end is a real deliverable here (see the negative result at
     `e47354c6`).

3. **Guard it by MANUFACTURING THE DEFECT, in the existing test file.**
   Extend `scripts/citation-title-guard.test.mjs` with a case that builds the offending window
   — quoted title · short code span · quoted title — and asserts the second title IS recovered.
   - ⚠️ **A green on the fixed code is not evidence.** Per the s1299/s1301 standard, prove the arm can
     actually go red: run it against the OLD regex (inline in the test, or by temporarily reverting)
     and quote the failure. **Say how you proved it, not merely that you did.**
   - Add the apostrophe sibling as a second case.
   - `scripts/citation-title-guard.test.mjs` is **already rooted** in `test:node-guards` — verify by
     reading the roster in `package.json` and say so. **You should not need to touch `package.json`;
     if you think you do, STOP and report why.**

## FIREWALL

**TOUCH-ONLY:** `scripts/citation-title-guard.mjs` · `scripts/citation-title-guard.test.mjs` ·
your report under `docs/bench/`.

**NO:**
- ❌ **Do NOT run `--update-baseline`, and do NOT edit `scripts/citation-title-baseline.json`.**
  The baseline is the grandfathered-offender set; regenerating it to absorb your change would hide
  exactly the regression scope 2 exists to detect. This is the F-1506-2 laundering class.
- ❌ **Do NOT reword any citation in `tasks/**` to make a count move.** The corpus is the measurement
  subject. Editing it is measuring your own edit.
- ❌ Do NOT change `CITE`, `TITLE_DECL`, `WINDOW` or `MIN_PREFIX` — a different denominator makes the
  before/after table meaningless. Scope 2's "citations must stay 511" is the tripwire for this.
- ❌ Do NOT raise the 12-char lower bound as the primary fix. The row offers it as a fallback
  (*"raise the lower bound only if you must"*); it narrows what counts as a title and would move the
  numbers for an unrelated reason. If you use it at all, it must be *in addition* and justified.
- ❌ Do NOT re-pin `scripts/gr-sim.test.mjs` (F-1441-3). Do NOT touch `src/` or any e2e spec.

## SELF-CHECK before you report

- [ ] Both pre-flight probes quoted with raw output (`is-ancestor` rc, `grep -c` = 1).
- [ ] The `--report` table **before and after**, with all four numbers each time, pasted not retyped
      (F-1513-1: a transcribed tally is a wrong tally).
- [ ] Scope 2's bar stated explicitly as met or not met, with the arithmetic.
- [ ] The manufactured-defect arm quoted RED against the old behaviour and GREEN against the new,
      with the method named.
- [ ] Both scan loops confirmed to use the same mechanism — say which lines.
- [ ] `scripts/citation-title-baseline.json` unchanged — prove it with `git status --porcelain scripts/`.
- [ ] `npm run test:node-guards` — **full raw tally** (`tests/pass/fail/cancelled/skipped`), and say
      how you verified your new arm actually RAN, not merely that the suite passed.
      ⓘ **Expect `rc=1` with exactly 2 reds if your shell is Node 23.11.1** — the standing F-1507-1
      timeout-semantics split, not your change. `.nvmrc` pins **26.4.0**, where the suite is
      **rc=0, 346 tests / 343 pass / 0 fail / 3 skipped** (measured s1514 on the merged tree).
      **Report the tally you got and name your Node version.** Do not bend a test to go green, and do
      not claim a green you did not see. A supervisor reruns this on 26.4.0.
- [ ] `npx tsc --noEmit` rc quoted.
- [ ] **`npm run build` and a browser battery are NOT owed** — this task touches no run surface under
      `src/`. Say so explicitly rather than skipping silently.
- [ ] Any Playwright command, if you run one at all, passes `--workers=1` (§3.1).

**READY-FOR-GATES + report:** the before/after `--report` tables · which formulation you chose and
why · how you proved the new arm can go red · confirmation both scan loops share the mechanism ·
proof the baseline JSON and `tasks/**` are untouched · the `test:node-guards` raw tally **with your
Node version**.

⚠️ **A NEGATIVE RESULT IS LICENSED.** If no formulation clears scope 2's bar — for instance if the
loose scanner's extra 38 recoveries turn out to depend on precisely the mis-pairing that causes the
bug, so that fixing one necessarily costs the other — **say so with the arms you measured and STOP.**
That is a real finding about the guard's design (it would mean the window scan, not the regex, is the
wrong abstraction) and it is worth more than a cure that trades 38 false negatives for one fix.
