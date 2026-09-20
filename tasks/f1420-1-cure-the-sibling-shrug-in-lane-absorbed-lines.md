# f1420-1 — cure the same shrug in the sibling script, and prove the parity reference did NOT move

**FIRE-AUTHORED (attended review welcome)** — s1420, from **F-1420-2**, reported by the `f1419-1` runner in its own report and confirmed by the s1420 drain (`reviews/f1419-1.md`).

**Role / workdir:** lane-a — `worktrees/lane-a` (branch `lane/m3`). NOT the repo root.

**Pre-flight (SAFE-DUPE, runner-auto-commit aware):** confirm the lane is clean vs main BEFORE any reset.
Run `node scripts/lane-usable.mjs lane-a`. It must print **USABLE**.
If it prints **HOLDS** or **BUSY** — **STOP and report the word it printed.** Do not reset, do not `--cure`, do not proceed.
> ⓘ At authoring time (s1420) lane-a measured **USABLE**, `main..lane/m3` empty — cured by `--cure` this fire (tip archived to `archive/lane-m3-s1420-absorbed-785f9c83` and **pushed to origin before the reset**), then reset onto main at `d8e4b51b`.
> ⚠️ **EXPECT THE LANE TO BE MANY COMMITS BEHIND MAIN, AND DO NOT TREAT THAT AS A PROBLEM.** An attended session began a rapid `beauty/*` drain campaign into main at 06:18 local on 2026-08-03 (`454cb933`, `4fd023d5`, `5b68b180`, `5c1d8053`, and likely more after this master was written). `behind=N` for a large N is expected and healthy — your pre-flight resets onto current main. What matters is the **word** `lane-usable.mjs` prints, not the distance.
> ⓘ The **F-1418-1** cure (`0b55cfa2`) is in your base: `isSlotBusy()` discounts a pidfile whose pid is one of your own ancestors and anchors the path via `--git-common-dir`, so the check no longer refuses on its own dispatch. **If you still get BUSY, a genuinely foreign runner holds the slot — STOP as written.**
> **FACTORY-CHURN EXCEPTION — these tracked classes are ALWAYS EXPECTED and are NEVER a STOP; list them, discard them, and PROCEED (F-1407-1, s1407):** (a) `logs/**` — the fire/runner accounting (`factory-usage.json`, `usage-history.jsonl`, `task-stats.jsonl`, `dashboard.html`, `.goal-tree.html`, `.blocked-seen`), rewritten every cycle by the factory itself; (b) `artifacts/**`, `reviews/shots-*` and any `.png` — regenerated evidence (the **F-1266-1** exception, since s1266). So a **DIRTY** verdict caused *only* by these classes is **not** a STOP: discard them (`git checkout -- <paths>`) and proceed, listing what you discarded.
> ⓘ `scripts/lane-usable.mjs` already ignores exactly two of these by name (its `CHURN` constant) and will say so — *"N churn-only path(s) ignored"*. **The other logs files are NOT in that constant and will read as tracked dirt.** 🚫 **Do not "fix" that by widening `CHURN`** — it mirrors the runner's own exclusion pathspec and widening it unilaterally desyncs them (see the NO list).
> ⓘ What still STOPs, unchanged and load-bearing: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## READ-FIRST (paths, in this order)
1. `scripts/lane-absorbed-lines.mjs` (whole file, 81 lines) — **the subject.** The defect is the `catch` on the `git diff` (search for `UNDECIDABLE (path absent at base or lane tip)`). Cite the CODE; the coordinate rots.
2. `scripts/lane-usable.mjs` — `residueForHeld()` (search for the name, do not trust a line number). **This is the cure, already shipped and already guarded at `ee766d05`.** Read how it splits the two reads and what it falls back to. Also read the `isMain` guard near the bottom: importing this module does **not** run its CLI, so importing from it is safe (s1416).
3. `scripts/lane-residue.test.mjs` (12 cases) — the guard you extend. Cases `a lane-only new file reports every added line absent from main`, `a lane-only new binary file remains binary and uncounted` and `an unreadable lane-tip path remains undecidable` are the shapes you are mirroring for the sibling.
4. `reviews/f1419-1.md` — findings **F-1420-2** (your WHY) and **F-1420-1** (the stderr caveat, which applies to your change too).
5. `tasks/BACKLOG.md` — rows **F-1420-2** and **F-1420-1**, and the `f1419-1 SHIPPED` row above them.

## WHY (quoted evidence, dated)

The `f1419-1` runner wrote, in its own report (2026-08-03, `tasks/runs/20260803-054956-lane-a-f1419-1-…log`):

> *"Report-only adjacent finding: `scripts/lane-absorbed-lines.mjs` still converts an absent-at-base path into `UNDECIDABLE`. It was not changed because the task explicitly firewalls that sibling."*

That was the correct call — the firewall was real — and it leaves the factory with the cure in one script and the defect in its twin. This is the standing class named in the drain duties: **a cured defect survives in the sibling script.** It is the second rung of this same ladder to hit it (`f1417-3` scope 2 existed precisely so the *method* would not live in two places; the *read-splitting* now does).

The operational cost is not cosmetic. `lane-absorbed-lines.mjs` is the tool a fire reaches for when ruling on a frozen lane's held paths — and a lane-created file is exactly the shape that holds content main has never seen. On that shape the tool currently answers `UNDECIDABLE`, which reads as *"I cannot tell you"* when the true answer is *"the lane holds all N of these lines and main has never seen one of them"* — the strongest statement it could make. `scripts/fire.md` §2E already carries the class in law: *"a conservative verdict at the wrong resolution is not safety, it is a different way of being wrong."*

⚠️ **AND THE AUTHORING FIRE OVER-PRICED THIS SLICE'S OWN HAZARD, WHICH IS WHY SCOPE 4 READS THE WAY IT DOES.** The F-1420-2 row as first written said the corrective *"must land a FRESH parity reference in the same commit, or the ladder loses its instrument."* s1420 then **measured** that claim instead of inheriting it, by re-running the reference command:

```
$ node scripts/lane-absorbed-lines.mjs archive/lane-m3-s1417-superseded-e1bff1e8 \
    assets/contracts/bench-seeds.json scripts/gr-sim.test.mjs src/sim/HeadlessContractSim.ts
rc=1
assets/contracts/bench-seeds.json: ABSORBED — all 3 added line(s) present in main
scripts/gr-sim.test.mjs: NOT ABSORBED — 5/88 added line(s) absent from main:
    "  assert.match(unsupported.stderr, /AP-07 supports only e1-dry-gulch, the-claim, e1-night-shift, e1-twin-banks/);"
    "    const probe = new HeadlessContractSim('e1-twin-banks', 'e1-twin-banks-01');"
    "      const sim = new HeadlessContractSim('e1-twin-banks', 'e1-twin-banks-01');"
    "      kills: 189,"
    "      eventLogHash: 'fnv1a32:5f57f7be',"
src/sim/HeadlessContractSim.ts: ABSORBED (token-level) — 1 line(s) differ whole-line, but every token they add appears in a single main line (main is a superset)
```

**None of those three paths takes the `absent at base` branch** — all three flow through the normal path — so the cure **cannot** change this output. The reference therefore does not need re-recording; it needs **defending**. Scope 4 is a byte-identical regression control, not a bookkeeping chore, and it is *cheaper and stricter* than the instruction it replaces. **Do not re-record it. Prove it did not move.**

## SCOPE (numbered; each item testable)

1. **Split the two failure modes in `lane-absorbed-lines.mjs`, exactly as `residueForHeld()` already does.** When `git diff <base>:<path> <branch>:<path>` throws, ask whether the path exists at the **lane tip** (`git cat-file -e <branch>:<path>`):
   - **exists at the lane tip** → the lane CREATED it. Diff against the empty tree (`4b825dc642cb6eb9a060e54bf8d69288fbee4904`) for that path and continue into the normal flow, so it reaches the existing `MISSING IN MAIN` branch or a real residue count.
   - **does not exist at the lane tip** → genuinely unreadable input. Keep `UNDECIDABLE`, and **narrow its message to say so** — the current wording (`path absent at base or lane tip`) names two causes for what will then be one.
   - Either way `unresolved++` still applies for a path main has not absorbed; **the exit code contract is unchanged** (0 only when every path is absorbed).
2. **Reuse, do not re-implement.** The cured read-splitting is exported: `import { residueForHeld } from './lane-usable.mjs'`. Its CLI does not run on import (the `isMain` guard). Prefer importing it over copying the fallback a second time — copying is how this finding exists.
   > ⓘ **One honest wrinkle, named so you do not paper over it:** `residueForHeld()` returns a residue object, and a path main has never held comes back as `NOT_ABSORBED` with `missing === added` — which is *also* what a path main holds but shares no lines with returns. The sibling prints two different sentences for those. **Resolve it with the sibling's own `git cat-file -e main:<path>` probe to choose the message, and use `residueForHeld()` only for the counting.** 🚫 Do **not** add a field to the shared function's return to disambiguate — that changes shipped behaviour guarded at `ee766d05` and is out of scope. If you conclude the import cannot be made to fit without doing so, **say that plainly in your report and implement the split locally instead** — a clear duplication you have named beats a shared contract you have bent.
3. **Suppress stderr on both reads**, as `residueForHeld()` does (`stdio: ['ignore','pipe','ignore']`). The `fatal: path '…' exists on disk, but not in <base>` line currently leaks. ⓘ Per **F-1420-1** this half may be provable only by construction unless you can make a live case; a unit assertion on the passed options is acceptable and expected — **say which you achieved.**
4. 🔒 **THE PARITY REFERENCE MUST BE BYTE-IDENTICAL, AND PROVING THAT IS THE DELIVERABLE.** Run the exact command block quoted in WHY, before and after your change, and diff the two outputs. **Any difference at all is a STOP** — report it, do not accept it, do not re-record the reference. This output has gated the last three slices in this ladder and its value is entirely in its stability.
5. **Guard the new branch.** Extend `scripts/lane-residue.test.mjs` (or add a sibling test file if you prefer; say which and why) with cases mirroring the three that guard `residueForHeld()`: a lane-created text file, a lane-created binary file, and an unreadable lane tip. If the sibling's structure makes it untestable without a repo, **say so plainly rather than faking it** — and then make the smallest refactor that makes it reachable, since that is the F-1416-1 lesson this ladder exists to apply.
6. **Report-don't-fix:** if you find a third site with the same collapsed `catch`, write it in your report. Do not widen this slice.

## TOUCH-ONLY
- `scripts/lane-absorbed-lines.mjs`
- `scripts/lane-residue.test.mjs` (or one new `scripts/*.test.mjs` you name, plus its `package.json` roster entry — **count the roster yourself and report the number**, per F-1411-3; at authoring time it was **45** `*.test.mjs` / **46** leaves / **47** including the runner)

## NO (firewall — violations are a STOP, report and halt)
- ❌ `scripts/lane-residue.mjs` — including **the value of `RICH`**, which `f1419-1` just pinned from both sides. Do not change it, do not make it configurable.
- ❌ `residueForHeld()`, `inspect()`, the `RC` map, `cure()`, `classifyDirt`/`CHURN` in `scripts/lane-usable.mjs` — **read-only**. You may import from that module; you may not edit it.
- ❌ `scripts/lane-freeze-classify.mjs`, `scripts/lane-runner-v3.sh`, all `src/**`, all `e2e/**`
- ❌ `tasks/goals.json` — the leaf flip is the draining fire's paired act (F-1384-1)
- ❌ Re-recording, deleting or "updating" the parity reference in `reviews/f1417-3.md` or `reviews/f1419-1.md`

## SELF-CHECK (run these exact commands; paste real output)
1. `npx tsc --noEmit` → rc 0. `npm run build` → green, report the Vite time.
2. ⭐ **The parity control (scope 4), BEFORE and AFTER.** Paste both outputs in full and state whether they are byte-identical. **A difference is a STOP.**
3. ⭐ **RED PROVEN BY MANUFACTURING THE DEFECT (the s1299/s1300 standard).** In a **scratch copy outside the repo** (`scripts/fire.md` §3.0b — never in main's working tree), revert your scope-1 split back to the single collapsed `catch` and run your new guard. **It must FAIL.** Paste the failing assertion verbatim. ⚠️ **If it stays green, scope 5 is not done.** Restore and re-run green.
4. `node --test scripts/lane-residue.test.mjs` (and your new file, if any) → all pass; paste **tests / pass / fail / skipped** as four separate numbers.
5. **A live demonstration of the cure**, since this slice is about what a fire actually reads: construct a throwaway branch off main that ADDS one new text file, then run `node scripts/lane-absorbed-lines.mjs <that-branch> <that-new-file>`. Paste the before/after lines. **Before:** `UNDECIDABLE (path absent at base or lane tip)`. **After:** a real count. Delete the throwaway branch afterwards and say you did.
6. Full battery: `npm run test:node-guards`. Report **tests / pass / fail / skipped** as four separate numbers, and **say which shell you were in** — in a lane shell the 3 F-1408-2 cross-engine cases DO run, so you may legitimately see 0 skipped where a fire sees 3 (F-1417-1). Also report the **guard-roster count** and **which denominator you used** (see TOUCH-ONLY — there are three defensible ones and they differ by two).
7. No Playwright is required: this slice ships no rendering or player-facing surface. **State that explicitly rather than silently omitting it**, and confirm `src/` is untouched with `git diff --stat -- src` (must be empty).

## REPORT
State plainly:
- the before/after parity outputs (self-check 2) and whether they were byte-identical;
- the manufactured RED (self-check 3), verbatim;
- the live before/after demonstration (self-check 5) — **this is the headline**, because it is the only evidence that a fire ruling on a frozen lane now gets an answer instead of a shrug;
- whether you imported `residueForHeld()` or implemented the split locally, and **why** — scope 2 permits either, but not silently;
- whether the stderr suppression is proven live or by construction (F-1420-1);
- any third site with the same collapsed `catch` (scope 6), reported and not fixed.

**READY-FOR-GATES** — report the parity verdict, the manufactured RED, the live demonstration, the four test numbers, the roster count with its denominator, and anything you were forced to leave undone.
