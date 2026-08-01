# lane-c — F-1324-3: address charter fuzz arms by LABEL, and widen the totality sweep past a constant rng

**FIRE-AUTHORED s1325 (attended review welcome).**

**Role:** Codex implementer, one task only.
**Workdir:** `worktrees/lane-c` (branch `lane/e2-arsenal`).

## READ-FIRST (paths, in this order)
1. `reviews/f1324-1-charter-fuzz-composition-totality.md` — §Findings, **F-1324-3** is this task's entire WHY. Read it verbatim; it names both limits and it already tells you neither blocks.
2. `e2e/charter-press-totality.spec.ts` — the guard you are hardening (33 lines, two tests).
3. `e2e/charter-press.rig.ts:54-121` — `charterMutationArmsForTest`: **13 arms**, each returning a distinct label string; four of them (`:63`, `:70`, `:77`, `:92`) return `'noop'` when their precondition is absent. That `noop` idiom is CORRECT and is not to be removed — s1324 already overruled a blanket ban on it.
4. `tasks/BACKLOG.md` — grep `F-1324-3` for the ledger row.

## PRE-FLIGHT (safe-dupe, run before any edit)
```
cd worktrees/lane-c
git fetch origin 2>/dev/null || true
git status --short                     # MUST be empty
git log main..HEAD --oneline           # MUST be empty
git merge-base --is-ancestor d640dc31 HEAD && echo SUBJECT-PRESENT
```
If `git log main..HEAD` is NON-EMPTY, **STOP** and report — the lane holds undrained content and a reset would destroy it.
If `SUBJECT-PRESENT` does not print, **STOP** and report — `d640dc31` is the commit that created the file you are editing; without it you are measuring a tree where the subject does not exist (this is F-1324-2's trap, which has now caught two fires).

## WHY (quoted evidence, dated)
`reviews/f1324-1-charter-fuzz-composition-totality.md:57` (s1324 drain, 2026-08-01), **F-1324-3, 🟡 OPEN, NON-BLOCKING**, verbatim:

> 1. The bidirectional test uses `arms[3]` and `arms[9]` as literals. **If anyone reorders the menu, those literals silently re-point at different arms** and the test keeps passing while asserting nothing about the composition it was written for. The 169-pair test is immune (it derives `armCount`), but the assertion that proves the arm still *fires* is not. A label-based lookup would fix it.
> 2. `fixedRng = () => 0` means every arm runs with all its internal selections pinned to index 0, and only the **first** Frontier template is used. So the guard proves *structural* totality, not value-space totality — a throw that needs a non-zero draw or a differently-shaped template would still slip through.

> **GATE: none owed; fold into the next touch of this rig.**

This task is that fold. Verified at source by the authoring fire, not inherited: `e2e/charter-press-totality.spec.ts:26,31,32` do hold the literals `arms[3]`, `arms[9]`, `arms[3]`.

**Context you must not undo:** this guard is what restored whole-suite collection from `Total: 0 tests in 0 files` to `2476 tests in 350 files`. Its 169-ordered-pair test is the thing that caught a real outage. **You are strengthening its addressing, not rewriting its purpose.**

## SCOPE (numbered, each testable)

1. **Derive a label→index map instead of hardcoding indices.** On a *fresh* charter, build the map by invoking each arm on its own fresh charter and recording the returned label. Then address arms as `armIndex('blank:briefing.goal')` / `armIndex('illegal:missing-briefing')` rather than `3` / `9`.
2. **Assert the map is unambiguous, and fail loudly if it is not.** Every label must map to exactly one index, and the two labels this test needs must both be present. If a future edit makes a label ambiguous, absent, or `noop`-on-a-fresh-charter, **this test must go RED with a message naming the label** — not silently skip. This is the whole point: the failure mode being cured is a test that keeps passing while asserting nothing.
3. **Keep the bidirectional assertion exactly as strong as it is today.** After the rewrite it must still prove BOTH directions: the arm FIRES (returns `blank:briefing.goal` and blanks `briefing.goals[0]`) when a briefing exists, AND returns `noop` after `illegal:missing-briefing` has run. Do not weaken either half.
4. **Widen the 169-pair sweep past the constant rng.** Run the ordered-pair totality sweep over a small, explicit set of rng draws — at minimum `() => 0`, `() => 0.5`, `() => 0.999` — and over **every** `listContracts('epoch-1-frontier')` template, not just `[0]`. Derive the template list; do not hardcode a count.
5. **Report the measured runtime of the widened sweep in your run report.** If the widened sweep exceeds ~20 s, keep the rng set at the three draws above and say so — do not silently trim coverage, and do not raise any timeout to make it fit. If it cannot be made to fit, **STOP and report** rather than thinning the sweep.
6. **If widening the sweep uncovers a genuine throw** (an arm pair that fails at a non-zero draw or on a later template), **STOP immediately and report it with the exact pair, draw, and template.** Do NOT fix it in this task — that is a new finding and a separate slice. A discovered throw is a SUCCESS for this task, not a failure.

## FIREWALL

**TOUCH-ONLY:**
- `e2e/charter-press-totality.spec.ts`

**NO (do not touch, for any reason):**
- `e2e/charter-press.rig.ts` — the rig is the *subject under test*. Editing it to make the test easier is the one move that would invalidate the whole exercise. If you believe the rig must expose static labels to do this cleanly, **STOP and report that as a finding** — do not implement it.
- Any file under `src/`.
- Any other `e2e/**` spec, `playwright.config.ts`, `package.json`, `tasks/**`, `reviews/**`, `STATUS.md`.
- Do not add, remove, or reorder arms; do not remove any `return 'noop'` guard.

## SELF-CHECK (exact commands, both projects, before you report READY)
```
npx tsc --noEmit
npm run build
npx playwright test e2e/charter-press-totality.spec.ts --workers=1
npx playwright test e2e/charter-press-boot.spec.ts e2e/charter-press-stamp.spec.ts --workers=1
npx playwright test --list --workers=1 | tail -3
```
- `--workers=1` is MANDATORY on every playwright command (fire.md §3.1: at default workers the fire shell manufactures drift reds; a red seen at default workers is not evidence until it reproduces at `--workers=1`).
- **`--list` MUST report `Total:` in the thousands (baseline on main at authoring time: `2476 tests in 350 files`).** If it reports 0, you have re-broken collection — STOP and report.
- Zero console/page errors.
- Report the arm indices your map derived for both labels, so the next reader can see whether they were still 3 and 9.

## REPORT
End with **READY-FOR-GATES** and state:
- the derived label→index map (all 13 entries),
- whether indices 3 and 9 were still correct (i.e. whether the old literals were currently right — they are expected to be, since this is a hardening, not a bug fix),
- the widened sweep's pair count, rng draws, template count, and measured runtime,
- `--list` totals before and after,
- anything you refused to do and why.
