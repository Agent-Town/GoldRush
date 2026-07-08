# Task perf-04-readrace: de-race the determinism e2e report read (LANE-D, commit prefix "test:")

**FIRE-AUTHORED s218 (attended review welcome).** This closes **F-perf04-6** named in `reviews/perf-04.md` — a TEST-WRAPPER flake only, NOT a determinism divergence and NOT a product/harness defect. Test-only; zero `src/**`.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-d` (branch `lane/perf`).
READ FIRST: `AGENTS.md`; `reviews/perf-04.md` (the finding F-perf04-6 you are closing — read it verbatim); `e2e/perf-04-determinism.spec.ts` (the only file you edit).

## PRE-FLIGHT — safe-dupe reset (RESET AUTHORIZED — loss-free)
The lane-d worktree branch `lane/perf` currently sits at `f01e9f2` ("perf: defer startup asset loads" = **perf-05**). perf-05's CONTENT is already SHIPPED on main as `8bd9eca` (VERIFIED s218: `git merge-base --is-ancestor 8bd9eca main` = true) — so `f01e9f2` is a drained-content **safe-dupe**, and resetting `lane/perf` to main is **LOSS-FREE**. This is the RESET AUTHORIZATION.
1. `git rev-parse HEAD` — expect `f01e9f2...` (perf-05 safe-dupe) or already-`main`. If HEAD holds any commit whose content is NOT on main (check `git log --oneline main..HEAD` — every line must be a known safe-dupe: `f01e9f2` perf-05 only), **STOP and report** "lane/perf holds undrained content — do not reset".
2. Reset onto fresh main: `git fetch` not needed (local); run `git checkout -B lane/perf main` (loss-free per the authorization above), then `git status --short` must be clean (untracked scratch fine).
3. `npm install --no-audit --no-fund` if needed; `npm run build` green before you touch anything.

## Why (reviews/perf-04.md F-perf04-6, s212)
`runDeterminism()` in `e2e/perf-04-determinism.spec.ts` (helper ~line 34) polls for `report.status !== 'running'` with a `waitForFunction` (lines ~42–48), then does a **SEPARATE** `page.evaluate` to read `window.__GR_DETERMINISM__` (line ~49). At session end the game navigates to the contract/level screen; that navigation destroys the execution context between the poll returning `true` and the line-49 read → intermittent `"Execution context was destroyed, most likely because of a navigation"`. It hit once on the 2nd session of the desktop run and passed clean on re-run. The report is computed correctly (test 1 + the clean re-run + the runner's independent GREEN all confirm the same hash `fnv1a32:598dff4d`); ONLY the two-step read is racy.

## Scope (single mechanical fix — must end GREEN, run it, don't guess)
1. **Make the report read atomic (poll-for-value).** Replace the poll-then-separate-read in `runDeterminism()` so the report object is captured in ONE `page.evaluate`, eliminating the window between "status settled" and "read the value". Use the idiom `waitForFunction` returning the settled report, then `.jsonValue()` — e.g.
   ```ts
   const handle = await page.waitForFunction(() => {
     const r = (window as DeterminismWindow).__GR_DETERMINISM__;
     return r && r.status !== 'running' ? r : null;
   }, undefined, { timeout: <keep the existing timeout> });
   const report = (await handle.jsonValue()) as DeterminismReport;
   ```
   (`waitForFunction` resolves to a JSHandle of the truthy return; `.jsonValue()` serializes it in the SAME step that proved it settled — no second navigation-exposed read.) Keep the existing timeout value and the `ErrorBucket`/console-error capture exactly as they are. Do NOT change what the test asserts (both sessions still `status === 'pass'`, identical hash, timeline equal).
2. **No-op guard:** if you would exit without editing the file, WRITE WHY into your report first (e.g. "helper already atomic" with git evidence). A silent no-op wastes the slot.

## Firewall
Touch ONLY: `e2e/perf-04-determinism.spec.ts` (and any `artifacts/perf-04/*` the spec itself writes, if any).
NO changes to: any `src/**` (the harness `DeterminismHarness`/`__GR_DETERMINISM__` producer is CORRECT — do not touch), any other e2e spec, `Rng.ts`/`Economy.ts`/Balance/any sim, the `?debug&determinism` gate. Do NOT weaken assertions to force green — the two-session pass + identical-hash + equal-timeline checks must remain intact and meaningful.

## Self-check (evidence, not vibes)
- `npx tsc --noEmit` clean · `npm run build` green.
- `e2e/perf-04-determinism.spec.ts` **green desktop + mobile** (both playwright projects) — run it **3× consecutively single-worker** to prove the race is gone (all 3 green, no "context was destroyed"). Report the 3-run tally.
- Report the two sessions' Economy hashes (must be identical to each other; the pre-fix reference on main is `fnv1a32:598dff4d` — note if it differs and why, but it should match since you changed no sim).
- Zero console/page errors.
End: **READY-FOR-GATES** + report: the exact before/after of the `runDeterminism` read, the 3×-run green tally, and the two identical session hashes. This output is a normal LANE-TOUCHED lane/perf commit — a future fire drains it path-scoped (`e2e/perf-04-determinism.spec.ts` only) onto main.
