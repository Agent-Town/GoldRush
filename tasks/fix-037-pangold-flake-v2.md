# Task: fix-037 task-037 flake — v2 (CORRECTED brief; v1 premise was wrong)

**FIRE-AUTHORED (s101, attended review welcome).** Supersedes `tasks/fix-037-pangold-flake.md` (v1), whose reviewer-endorsed `grantGold` direction is IMPOSSIBLE for this test — see the drain forensics in `reviews/s101-fix-037-drain.md`. Read that file first; it has the reproduced evidence.

You are Codex, implementer for Gold Rush (native Mac). Firewall: **`e2e/task-037-assay-bench-ungate.spec.ts` ONLY. NO product-code changes.** If you find a genuine PRODUCT regression, STOP and write findings to `reviews/037-pangold-regression.md` instead of editing product code.

## Pre-flight
Main slot; `git checkout -B <slot-branch> main` per your runner's normal main-slot pre-flight. `npm run build` green first. The target test is the FIRST test in the file: `'normal play shows the Assay Office prompt and opens the bench without debug'` (desktop-chrome only via its `test.skip`).

## The real situation (VERIFIED this drain — do NOT re-derive from v1)
The test is currently FULLY BROKEN on main (0/4), for TWO reasons, only one of which v1 diagnosed:
1. **Product now requires order text before posting.** Line ~134 `assay-pending-status` `toHaveText(/Posted|JSON ready/)` fails with **Received "Write an order first"** — the assay post is rejected unless `assay-text` is non-empty. The current test fills only `assay-profile`, never `assay-text`. The old final assertion (`assay-log li … /arrived/`) is also stale.
2. **Residual build/prompt positioning race** under fast timescale — line ~126 `assay-office-prompt` `toBeVisible` intermittently hidden, and `buildAssayOfficeWithUi` line ~88 `build.assayOffices … .toBe(1)` intermittently 0. This is the flake v1 was chasing, but its cause is NOT gold: the assay office costs **60 gold** (`Balance.ts:203`), and `panGold(80)` supplies ample. It is placement/positioning timing (`ghostValid`→`Enter`→`assayOffices==1`, plus hero-position precision after `panGold`'s walk-to-node loop, plus reaching the (0,7) prompt range).

## HARD CONSTRAINT — do NOT use grantGold here
`window.__GR_TEST__` (incl. `grantGold`) is assigned **only** `if (URLSearchParams.has('debug'))` — `src/game/Game.ts:454`. This test deliberately opens WITHOUT `?debug` ("normal play … without debug" — that is the whole point of the test). So `__GR_TEST__` is `undefined` and `grantGold` is a silent no-op (gold stays 0). Claude reproduced this: grantGold version failed 6/6. **Gold MUST be acquired by real panning.** (grantGold is legitimate only in the OTHER two tests in this file, which do pass `?debug`.)

## Fix (test-only)
1. **Adopt the assertion fix** (a prior Codex run got this part right): before the post, `await page.getByTestId('assay-text').fill('<some order text>')`; keep the `assay-profile` fill; assert the posted order lands in `assay-queue-pending` (`… .locator('li').first()` contains your order text) rather than the stale `assay-log/arrived`. (All three testids are real product elements — `AssayBench.ts:72/87/91`.)
2. **De-flake the build + prompt approach with real panning.** Keep `panGold` (or an equivalent real-panning helper). Make the run deterministic — options, pick what proves stable:
   - Lower the panning/interaction timescale (e.g. `?timescale=4`) for precision without slowing the suite unduly.
   - Before pressing `Enter` in `buildAssayOfficeWithUi`, re-assert `ghostValid===true` immediately (bounded `expect.poll`), and ensure the hero is fully stopped (release move keys) so a drifting ghost can't invalidate placement between check and confirm.
   - Tighten the `walkTo` tolerance / add a settle-poll for the (0,7) prompt approach so `assay-office-prompt` is reliably in range.
   - Do NOT weaken assertions to force green; the test must still prove the real non-debug flow (pan → build via UI → prompt → open bench → post an order).

## Acceptance / self-check (gate = evidence)
- `npx tsc --noEmit` clean.
- Target test **GREEN under `--repeat-each=8 --project=desktop-chrome --workers=1`** (the flake is intermittent — a single pass is NOT sufficient evidence; prove stability).
- Full file GREEN on BOTH projects (`desktop-chrome` + `mobile-chrome`), per-project `test.skip` guards unchanged (the mobile-touch test at ~163 and the desktop-only skip at ~116 keep their guards; no test newly skipped).
- Zero new console/page errors (the spec already asserts empty buckets).
- Confirm test-harness-only: `git diff --name-only` shows `e2e/task-037-assay-bench-ungate.spec.ts` and nothing else.
- NOTE: fixed dev port 5188 may be held by the lane runner — gate on a scratch port if 5188 is busy.

End with: READY-FOR-GATES + the repeat-each=8 result + per-project results (which tests ran vs skipped) + which de-flake levers you used + confirmation no product diff.
