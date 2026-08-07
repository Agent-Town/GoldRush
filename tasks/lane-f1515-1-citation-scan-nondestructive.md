# lane-f1515-1-citation-scan-nondestructive — FIRE-AUTHORED (attended review welcome)

**Role:** Codex runner, lane-a. **Workdir:** `worktrees/lane-a` (branch `lane/a`).

## PRE-FLIGHT (STOP conditions — run these before you touch anything)

1. The lane must carry this fire's evidence commit, which is the freshness proof:
   `git merge-base --is-ancestor 62312c365 HEAD`
   → **non-zero = STOP.** Report `LANE STALE — missing 62312c365` and do nothing else.
2. Prove the subject region is present and unmoved, scoped to the one file so this master's own
   prose cannot rot the key (F-1310-1 / F-1425-2):
   `grep -c "const QUOTED_BY_KIND = " scripts/citation-title-guard.mjs`
   → must print exactly **1**. **0 = the lane drifted → STOP** and report `SUBJECT ABSENT`.
   (Measured **1 on main** and **0 in `tasks/BACKLOG.md`** by s1515 at authoring time. The grep is
   file-scoped, so nothing written in `tasks/**` — including this master — can move it.)
3. `git status --porcelain` must be clean of tracked dirt outside `logs/**`
   (`logs/**` churn is the standing FACTORY-CHURN EXCEPTION, F-1407-1). Tracked dirt elsewhere = STOP.

## READ FIRST (paths, not memory)

- `scripts/citation-title-guard.mjs` — **the only script this task may change.** Read, in order:
  `TITLE_DECL` (`:65`-ish), `QUOTED` and `QUOTED_BY_KIND` below it, `matchesATitle()`, and
  `matchingQuote()` — the helper merged at `790a66f5` that **both** scan loops now call.
- `scripts/citation-title-guard.test.mjs` — you extend this; do not add a file. Read the two arms
  added at `790a66f5` (`a short code span cannot consume…`, `a bare apostrophe cannot consume…`) —
  they are the shape your new arms must follow.
- `reviews/f1501-5-citation-quote-pairing.md` — the drain that filed both findings, with the measured
  three-window table.
- `tasks/BACKLOG.md`, the **F-1515-1** and **F-1515-2** rows — both were priced against the live
  corpus before this master was written; **read the numbers, they are your acceptance bars.**

## WHY (evidence, quoted and dated)

Two findings, **same file, interacting cures**, which is why they are one task.

**F-1515-1 (s1515)** — `790a66f5` fixed the reported mis-pairing with a **union** (loose ∪ by-kind),
which the f1501-5 master itself offered as *"a PROVEN-SAFE FLOOR, not the required implementation"*.
It is a **backstop, not a cure**: both scanners still walk the window with a **global `lastIndex`** and
consume delimiters, so an **odd count of same-kind quotes before the title defeats BOTH arms**.
Measured s1515 by replaying both regexes from the merged guard:

| Window shape | loose | by-kind | union |
|---|---|---|---|
| title · short code span · title | ✗ | ✓ | recovers |
| title · bare apostrophe · title | ✗ | ✓ | recovers |
| **odd count of same-kind quotes before the title** | ✗ | ✗ | **does NOT recover** |

`he said "foo and then some prose "<title>".` yields `"foo and then some prose "` from **both** arms.
**Priced against the live corpus: 2 genuine citations**, both verified by reading the spec —
`e2e/tl-01-run-telemetry.spec.ts:229` and `e2e/asset-diet.spec.ts:73`. That is a **lower bound**: the
probe's matcher was stricter than the shipped `matchesATitle`.

**F-1515-2 (s1515)** — `TITLE_DECL`'s `(?:\.\w+)*` matches **any** dotted helper, not just the real
modifiers, so `test.setBalance('e10Static.arrivalZ', 20)` is parsed as a test declaration and its first
string argument is **harvested as a title**. Across all 393 specs: **1270 genuine titles and 87
non-title strings** via `test.setBalance` (84), `test.placeBoatBuilding` (2), `test.repair` (1).
**0 of the 206 live `CARRIES-TITLE` rows are carried by one** — so it is **latent, not live** — but
**67 of the 87 clear the 12-char floor**, so the fail-open is reachable.

⚠️ **The two interact, and that is the point of doing them together:** 2 of the 4 raw hits the
all-pairs probe returned for F-1515-1 were `e10Static.arrivalZ` — i.e. **F-1515-1's apparent price is
inflated by F-1515-2's pollution.** Curing F-1515-2 first makes F-1515-1's measurement honest.

## SCOPE (each item testable)

1. **Replace the destructive scan with a non-destructive one.** Rework `matchingQuote()` so it
   enumerates **all** candidate spans in the window — every same-kind delimiter *pair*, not only the
   ones a greedy left-to-right walk happens to reach — and returns the first that resolves via
   `matchesATitle`. Keep the loose scanner as one of the sources if it still earns its place; the
   requirement is the **result**, not the shape.
   - **Both call sites must keep going through the one helper** (the titles scan and the
     `CARRIES-LINE` fallback, F-1252-3). Changing one is a defect, not a partial fix.
   - ⓘ *Complexity note, so it is a decision and not a surprise:* all-pairs is O(k²) in the delimiter
     count of a 400-char window. That is small, but if you find it measurably slow, **say so with a
     number** rather than silently reverting to a greedy scan.

2. **Restrict `TITLE_DECL` to real modifiers.** Replace `(?:\.\w+)*` with an allowlist covering at
   least `skip`, `only`, `fixme`, `slow`, `fail`, `describe` and the `describe.*` forms
   (`skip`/`only`/`serial`/`parallel`/`configure`). A `test.<anything-else>(…)` call must **not**
   contribute a title.

3. **Do not regress the corpus. Hard acceptance bar, not advice.**
   Run `node scripts/citation-title-guard.mjs --report` before and after, and quote both.
   - `citations scanned` must stay **511**.
   - `CARRIES-TITLE` **must be ≥ 206** and `NUMBER-ONLY` **must be ≤ 262** (the post-`790a66f5` floor).
   - ⚠️ **Scope 2 predicts it moves NOTHING.** The 0-live measurement says no citation is carried by a
     polluted string, so removing the pollution must change no verdict. **If a count moves, that
     measurement was wrong — STOP and report which citation moved and why**, rather than adjusting a
     bar to fit. That is the whole value of having predicted it in advance.

4. **Guard both by MANUFACTURING THE DEFECT, in the existing test file.**
   - An arm for the **odd-same-kind-delimiter** window, asserting the title IS recovered.
   - An arm proving a `test.setBalance('…')` line is **NOT** harvested as a title.
   - ⚠️ **A green on the fixed code is not evidence.** Per the s1299/s1301 standard, prove each arm can
     go red: run it against the OLD behaviour (inline, or by temporarily reverting) and **quote the
     failure**. **Say how you proved it, not merely that you did.**
   - `scripts/citation-title-guard.test.mjs` is **already rooted** in `test:node-guards` — verify by
     reading the roster in `package.json` and say so. You should not need to touch `package.json`.

## FIREWALL

**TOUCH-ONLY:** `scripts/citation-title-guard.mjs` · `scripts/citation-title-guard.test.mjs` ·
your report under `docs/bench/`.

**NO:**
- ❌ **Do NOT run `--update-baseline`, and do NOT edit `scripts/citation-title-baseline.json`.**
  Regenerating the grandfathered-offender set to absorb your change hides exactly the regression
  scope 3 exists to detect. This is the F-1506-2 laundering class.
- ❌ **Do NOT reword any citation in `tasks/**` to move a count.** The corpus is the measurement
  subject; editing it is measuring your own edit.
- ❌ Do NOT change `CITE`, `WINDOW` or `MIN_PREFIX` — a different denominator makes the before/after
  table meaningless. `citations == 511` is the tripwire.
- ❌ Do NOT edit any `e2e/*.spec.ts`. Scope 2 changes how titles are *parsed*, never what the specs
  *say* — renaming a `test.setBalance` helper to dodge the regex would be laundering.
- ❌ Do NOT re-pin `scripts/gr-sim.test.mjs` (F-1441-3). Do NOT touch `src/`.

## SELF-CHECK before you report

- [ ] Both pre-flight probes quoted with raw output (`is-ancestor` rc, `grep -c` = 1).
- [ ] The `--report` table **before and after**, all four numbers each time, **pasted not retyped**
      (F-1513-1: a transcribed tally is a wrong tally).
- [ ] Scope 3's bar stated explicitly as met or not met, **with the arithmetic**, and scope 3's
      **prediction that nothing moves** confirmed or refuted by name.
- [ ] Each of the two new arms quoted **RED against the old behaviour and GREEN against the new**,
      with the method named.
- [ ] Both scan loops confirmed to use the same mechanism — say which lines.
- [ ] `scripts/citation-title-baseline.json` unchanged — prove it with `git status --porcelain scripts/`.
- [ ] `npm run test:node-guards` — **full raw tally** (`tests/pass/fail/cancelled/skipped`), and say
      how you verified your new arms actually RAN, not merely that the suite passed.
      ⓘ **Expect `rc=1` with exactly 2 reds if your shell is Node 23.11.1** — the standing F-1507-1
      timeout-semantics split, not your change. `.nvmrc` pins **26.4.0**, where the suite was
      **rc=0, 348 tests / 345 pass / 0 fail / 3 skipped** (measured s1515 on the merged tree).
      **Report the tally you got and name your Node version.** Do not bend a test to go green, and do
      not claim a green you did not see. A supervisor reruns this on 26.4.0.
- [ ] `npx tsc --noEmit` rc quoted.
- [ ] **`npm run build` and a browser battery are NOT owed** — this task touches no run surface under
      `src/`. Say so explicitly rather than skipping silently.
- [ ] Any Playwright command, if you run one at all, passes `--workers=1` (§3.1).

**READY-FOR-GATES + report:** the before/after `--report` tables · the formulation you chose for the
non-destructive scan and why · the `TITLE_DECL` allowlist you landed · how you proved each new arm can
go red · confirmation both scan loops share the mechanism · proof the baseline JSON and `tasks/**` are
untouched · the `test:node-guards` raw tally **with your Node version**.

⚠️ **A NEGATIVE RESULT IS LICENSED.** If the non-destructive scan cannot hold `CARRIES-TITLE ≥ 206` —
for instance if the loose scanner's recoveries turn out to depend on precisely the mis-pairing that
causes the bug — **say so with the arms you measured and STOP.** That is a real finding about the
guard's design (it would mean the 400-char window, not the regex, is the wrong abstraction) and it is
worth more than a cure that trades recoveries for a fix. The precedent is `8134ec30`.
