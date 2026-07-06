# Task: fix task-037 panGold setup flake (test-harness only) — FIRE-AUTHORED (attended review welcome)

You are Codex, implementer for Gold Rush (native Mac). READ FIRST: AGENTS.md; CLAUDE.md §5/§9.
This is a small, test-harness-only corrective. NO product-code changes.

## Problem (evidence: reviews/s75-main-pile-drain.md F-1, non-blocking-but-owed)
`e2e/task-037-assay-bench-ungate.spec.ts` — the test **"normal play shows the Assay Office prompt
and opens the bench without debug"** (starts at line ~115) fails deterministically at its gold
**setup** step, BEFORE any assay assertion runs. The flake is the `panGold(page, 80)` helper call
(line ~121): under the test's `?timescale=8` URL param, its inner
`await expect.poll(() => …harvest.channeling …, { timeout: 5_000 }).toBe(true)` times out — channeling
never latches within 5 s at 8× time. This is gold-panning **setup**, not the feature under test.

**Proof it is NOT a product regression** (from the review, re-verify if you touch anything product-side):
`m1-04-gold-panning-economy` passes 4/4 (real panning is covered there), and 037 touches no
harvest/panning code. The 037 FEATURE (assay bench opens via prompt+Enter with the debug-gate removed)
is already verified by the file's other passing assertions; only this test's gold *setup* is flaky.

## Fix (VERIFIED direction — reviewer-endorsed)
In the test at line ~115, replace the flaky real-panning **setup** with the existing debug gold seam
(the same `window.__GR_TEST__?.grantGold(...)` already used by `debugPlaceAssayOffice()` at line ~95,
and typed at `src/vite-env.d.ts:517` / implemented at `src/game/Game.ts:478`):

- Replace `await panGold(page, 80);` (line ~121) with a grant + assertion, e.g.:
  ```ts
  await page.evaluate(() => window.__GR_TEST__?.grantGold(80));
  await expect.poll(() => gold(page)).toBeGreaterThanOrEqual(80);
  ```
- The rest of the test is UNCHANGED: `buildAssayOfficeWithUi()` still uses the REAL UI build path,
  and the prompt/bench still open via real keyboard `Enter` — so "without debug" (= no debug-gate on
  the bench, 037's actual feature) stays honest. Using `grantGold` for *setup gold* only mirrors what
  `debugPlaceAssayOffice()` already does in this same file.
- The `panGold` helper (lines ~46–74) becomes unused after this change — **remove it** (dead code).
  Keep `gold()` and `walkTo()` (still used by the new assertion and the build path). Do NOT remove
  anything else.

Acceptable ALTERNATIVE if you prefer to preserve a real-panning path here: keep `panGold` but make its
setup deterministic (e.g. drop the 8× timescale for the panning phase, or lengthen only that inner
poll). grantGold is the simpler, endorsed fix — prefer it unless you have a concrete reason.

## Firewall
Touch ONLY: `e2e/task-037-assay-bench-ungate.spec.ts`. NO product-code changes. NO other specs.
Do NOT change the test's intent or its per-project skips (line ~116 skips non-desktop; the mobile
touch test at ~163 has its own project guard). If — against expectation — investigation proves a
genuine PRODUCT regression in panning/channeling, STOP and write findings to
`reviews/037-pangold-regression.md` instead of editing product code.

## Acceptance / self-check
- `npx tsc --noEmit` clean.
- `e2e/task-037-assay-bench-ungate.spec.ts` GREEN on BOTH `desktop-chrome` AND `mobile-chrome`
  projects (respecting the existing per-project `test.skip` guards — every test that RUNS for a
  project passes; none newly skipped).
- No new console/page errors (the spec already asserts `errors.consoleErrors/pageErrors` empty).
- NOTE: fixed dev port 5188 may be held by the lane runner — gate on a scratch port
  (`npm run dev -- --port 5233 --strictPort` + a temp `reuseExistingServer` config) if 5188 is busy.
End: READY-FOR-GATES + files touched + per-project results (which tests ran vs skipped per project) +
confirmation the change is test-harness-only (no product diff).
