# Task homemaker-readiness-error-diagnostic: show the runtime error when the Homemaker readiness gate fails (LANE-A, prefix "test:")

CODEX: model=gpt-5.6-sol effort=medium
FIRE-AUTHORED s2522 from the attended F-HKS-2 review; attended review welcome. BANKED, NOT QUEUED: the 2026-09-05 OPUS WAVE 2 ruling parks Codex queues and reserves dispatch/drains to the attended session. No new owner decision is needed for this test-only corrective.

You are the Gold Rush implementer, native Mac, assigned `worktrees/lane-a` / `lane/a`. Implement only this diagnostic delta.

## Read first and verify the premise
Read `CLAUDE.md`, `AGENTS.md`, `STATUS.md` verification lessons; `reviews/homemaker-kept-state-init-order.md` F-HKS-2; `specs/epoch-saga/e6-atomic-bundle.md` (the existing boss contract); and all of `e2e/e6-boss-homemaker.spec.ts`.
The exact existing test is `e2e/e6-boss-homemaker.spec.ts:126` — "unbuilds, tidies, makes one chair, and remains kept without ever hurting the player". On main measured 2026-09-05, both `open()` and the post-kept reload wait for the same contract readiness. Console/page errors accumulate in `errors`, but the assertion sits after the reload wait and gameplay checks. A failed boot therefore reports a readiness timeout instead of the captured exception. The gameplay crash itself is already fixed by `d571f474811b8ba26518e2196c362b13b2aba626`; do not reimplement that fix.
Read `e2e/e10-finale-staging.spec.ts` for the existing bounded readiness failure pattern that includes captured errors. Reuse that idea locally; no shared test framework is needed.
Before dispatch, verify the prerequisite with `git merge-base --is-ancestor d571f474811b8ba26518e2196c362b13b2aba626 main` and read both readiness sites on current main. Re-read them on the assigned lane after preparation. Do not use a fixed-size git-log window as an absence test; stop if another change has already supplied this diagnostic.

## Pre-flight and retention
Run `node scripts/drain-block-check.mjs tasks/homemaker-readiness-error-diagnostic.md --queue --strict` and `node scripts/lane-usable.mjs lane-a` before dispatch. Any undrained done-move, ahead commit, or somebody else's tracked source/test/task edits means STOP and report. Preparation belongs to the dispatcher; do not reset a branch holding unmerged work. FACTORY-CHURN EXCEPTION (F-1407-1): `logs/**`, regenerated `artifacts/**`, `reviews/shots-*`, and PNG output are expected; list them separately. They are not permission to discard evidence: do not clean, reset, delete or overwrite another writer's bytes. Use `npm ci` if dependencies need installation; verify the committed lockfile remains unchanged. Use an available private test port; never 5188/5199/8788/8799.

## Scope and acceptance
1. Both initial boot and kept-state reload report any captured console/page errors before entering their readiness wait. If an error arrives during the wait, the failure diagnostic must also include it. Factor only the duplicated readiness operation locally if that is the shortest way to cover both callers.
2. Preserve the readiness predicate, ordinary timeout bounds, final zero-error assertion, and every gameplay assertion. A readiness timeout with no page error must retain its original cause. Do not replace missing readiness with success, swallow failures, increase timeouts, or change the boss/engine.
3. Show a failing control with a deliberate page-error sentinel and absent readiness, once for fresh boot and once for reload. Assert that the failure output names the sentinel rather than only a timeout. Use a temporary test copy/init-script hook and a short control timeout; retain the exact runnable control and result under the evidence directory, with production/test source restored afterwards. Also check the no-error/missing-readiness case still rejects.
4. Run the unmodified gameplay expectations through the healthy initial-boot and kept-reload path on desktop-chrome and mobile-chrome. The existing test stays green, with zero console/page errors.

## Firewall
Touch ONLY `e2e/e6-boss-homemaker.spec.ts` (readiness diagnostics/local helper only) and `artifacts/homemaker-readiness-error-diagnostic/**` (control, run output, brief report). No src, scripts, dependencies, other e2e files, runtime assets, engine pins, STATUS, specs, or ledger changes. Temporary mutation fixtures live outside the tracked source tree. The orchestrator records the drain.

## Self-check and handoff
Run `npx tsc --noEmit`, `npm run build`, and `npx playwright test e2e/e6-boss-homemaker.spec.ts --project=desktop-chrome --project=mobile-chrome --workers=1` with a private port configured per `playwright.config.ts`. Retain the three diagnostic controls and the healthy two-project result. No sim semantics change, so no null-floor regeneration or engine-era pin is owed.
If this is already fixed or the firewall cannot express the correction, report the exact evidence; no false no-op success and no scope expansion. End READY-FOR-GATES with changed paths, commands, results and any remaining failure.
