CODEX: model=gpt-5.6-sol effort=high
# f1440-2 — re-land the E1 perf gate without a frozen foreign baseline
**FIRE-AUTHORED (attended review welcome)** — s1440, 2026-08-03

ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.

## READ FIRST (paths, not memory)
- `reviews/lane-e1-perf-pass.md` — the drain that withheld this spec; F-1440-2 is the finding you are curing, and its "Recommended cure" paragraph is the shape asked for here.
- `artifacts/e1-perf-pass/REPORT.md` — the runner's own perf census, already on main.
- `artifacts/e1-perf-pass/census-before-*.json` and `census-after-*.json` — the committed baselines, already on main.
- The withheld spec itself: `git show 452eb747:e2e/e1-perf-pass.spec.ts` (also reachable at `archive/lane-perf-s1440-452eb747`). **It is NOT on main — you are re-landing it, not editing it in place.**
- `playwright.config.ts` — read `claimedByAnotherConfig`, `testDir`, `testIgnore`. This is why the defect matters.

## WHY (drain finding F-1440-2, s1440, measured)
The E1 perf pass merged as `d60adf88` with its own spec **withheld**. The spec does not measure its
`before` arm in-run: it reads it from a committed artifact (`census-before-<project>.json`, `:239`)
and `STAGE` defaults to `'after'` (`:8`). So every ordinary run, on every machine, compares its own
wall-clock and draw calls against numbers one lane shell recorded on an M4 Max on 2026-08-03.

Measured on a fire shell against the merged tree, both failures were that design and not the
optimization:
- desktop — `e1-dry-gulch draw calls`, received **137**, expected `<= 136` (off-by-one vs a frozen baseline)
- mobile — `the-claim p95 regression`, received **28.5 ms**, expected `<= 25.05 ms` — while the spec's
  own **absolute** assert against the real 33.4 ms shed line **passed**.

The spec is not in `claimedByAnotherConfig`, and `testDir: './e2e'` sweeps everything, so landing it
unchanged puts a permanently-red suite into the shared default battery.

## THE LAW THIS SERVES
A gate must fail because the code got worse, never because the machine got slower. Absolute budgets
are machine-independent and belong in the shared battery; cross-run wall-clock comparisons are an A/B
instrument and belong behind an explicit opt-in — the way `artifacts/*/perf-ab-*.json` already works
in this repo.

## SCOPE
1. Re-land `e2e/e1-perf-pass.spec.ts` from `452eb747` with the cross-run comparison made **opt-in**.
   In the default run the spec must still assert, and these must stay exactly as written:
   - the 200 draw-call budget (`:224`)
   - the absolute shed-line p95 cap, `frameBudgetMs * collapseRatio` (`:225`)
   - the census publication to `artifacts/e1-perf-pass/census-<stage>-<project>.json`
   - zero console/page errors on both the census page and the snapshot page
2. Put the baseline-relative block (`:238`–`:246`) and the pixel comparisons (`:137`, `:145`) behind a
   single explicit opt-in env flag. Name it and document it in a header comment that says **why**:
   a reader six fires from now must learn from the file itself that the baseline is machine-specific.
   When the flag is off, the spec must not read `census-before-*.json` or `before/*.png` at all.
3. **Prove the default path is green on a machine that is NOT the one that recorded the baseline.**
   Run the spec, both projects, `--workers=1`. A green obtained by skipping the whole test is not a
   pass: state how many assertions still execute in the default path, and name them.
4. **Prove the opt-in path still catches a real regression** — this is the load-bearing proof, and a
   passing test is not evidence about the failing path (a green never executes its violation branch).
   Manufacture the defect: with the flag ON, hand-edit one committed baseline number so the tree is
   "slower than baseline", show the spec goes **rc=1** naming that contract, then revert the edit and
   show the baseline file is byte-identical again (hash it before and after).
5. Report whether the `e1-dry-gulch` desktop draw count is genuinely 136 or 137 on your host. If it
   varies run to run, say so with the samples — a draw-call count that is not reproducible cannot be
   an equality gate for anyone, and that should be recorded even though it is out of scope to fix.

## TOUCH-ONLY
- `e2e/e1-perf-pass.spec.ts` (re-landed)
- `artifacts/f1440-2/` for your evidence

## NO
- **NO** changes to `src/**`. The optimization already merged as `d60adf88` and is not under review here.
- **NO** regenerating `artifacts/e1-perf-pass/census-*.json` or `before/`/`after/` screenshots. They are
  retained history (RETENTION LAW) and the corrective's own proof depends on them being untouched.
- **NO** adding this spec to `claimedByAnotherConfig` — hiding it from the battery is not the cure, and
  it is adjacent to the F-1296-3 standing order about `release-build.spec.ts`.
- **NO** raising the 25.05 lean line, the 33.4 shed line, the 200-call budget, or any Balance threshold
  to make a red go away. Same shape as the F-1438-1 and F-1431-3 standing orders.
- **NO** touching `playwright.config.ts` `workers` (F-1270-3).

## PRE-FLIGHT (LANE-SAFETY invariant)
Verify this worktree is clean vs main before resetting; if any tracked blob here is unreachable in git,
**STOP and report** rather than resetting.

> **FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1):**
> (a) `logs/**` — the fire/runner accounting (`factory-usage.json`, `usage-history.jsonl`,
> `task-stats.jsonl`, `dashboard.html`), rewritten every cycle by the factory itself;
> (b) `artifacts/**`, `reviews/shots-*` and any `.png` — regenerated evidence, rewritten by every
> drain gate that runs playwright. **What still STOPs, unchanged:** modified tracked `src/**`,
> `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md` — anything a live drain or a
> concurrent task could actually own.
>
> ⓘ Retro-fitted s1450 by `scripts/banked-master-preflight-guard.test.mjs`, which reddened the
> moment this leaf was flipped to `queued`. The dispatch itself survived only because the lane had
> been reset to a clean main seconds earlier — i.e. by luck, not by the master being correct.

## SELF-CHECK
- `npx tsc --noEmit` clean · `npm run build` green
- `e2e/e1-perf-pass.spec.ts` green in the **default** path, both projects, `--workers=1`
- the manufactured-regression proof of scope 4, with the before/after hash of the edited baseline file
- adjacent: the spec is new-to-main, so name by grep any suite that reads `artifacts/e1-perf-pass/`
- zero console/page errors

READY-FOR-GATES + report: which assertions run in the default path, the manufactured-regression rc=1
transcript, and the draw-call reproducibility samples from scope 5.
