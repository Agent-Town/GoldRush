# Task gr-campaign-fixture-cleanup-1: preserve campaign fixture failure evidence and clean up on failure (MAIN, commit prefix "test:")

AUTHORED ONLY. CODEX-WALL remains in force; no fire queues or dispatches this master. The attended session assigns an authorized implementer.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `/Users/robin/Claude/Projects/Gold Rush` (main slot). READ FIRST: AGENTS.md; CLAUDE.md; `artifacts/s2717/report.md`; `artifacts/s2717/fixture-failure.txt`; `reviews/sol-play-proofs-9.md`; `scripts/gr-sim-campaign.test.mjs`; `scripts/fixture-teardown.test.mjs`; `scripts/gr-sim-campaign.mjs`.

Pre-flight: `git status --short` must show no staged or modified TRACKED file outside the two factory-churn classes; if any exist, STOP and report (a live drain or another task owns the tree). Untracked `??` host debris is EXPECTED; list briefly, proceed. FACTORY-CHURN EXCEPTION (F-1407-1): (a) `logs/**` (the fire and runner accounting, rewritten every cycle); (b) `artifacts/**`, `reviews/shots-*` and any `.png` (regenerated evidence, the F-1266-1 class). What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`. A scratch worktree adds: `git log main..HEAD --oneline` empty (a fresh cut).

## Why (F-2717-1, measured 2026-09-27 UTC)
The post-landing Node 26.4 battery for the QA-only run-9 landing failed its fixture sweep after 1017.127 seconds: all 162 owners ran, but `scripts/gr-sim-campaign.test.mjs` left one `gr-campaign-resume-TH7ZuT` directory. That child also failed its own assertions. The same resume test passed later in the same full battery; the candidate's complete prior battery passed. The exact nested assertion is UNVERIFIED because the sweep stores only the child's name, not its failing output.

The cleanup defect is directly visible: `scripts/gr-sim-campaign.test.mjs` lines 82 through 125 create the resume fixture before any try/finally, then remove it only after every await and assertion succeeds. `runCampaign()` and the two-campaign test also allocate before their cleanup guarantee. A failed assertion therefore bypasses cleanup. The new run-9 files do not change these scripts. A clean-base control of the same failing fixture suite is still owed; do not call this attributed on source equality alone.

## Scope
1. Before edits, run a same-runtime control of `scripts/fixture-teardown.test.mjs` on clean pre-landing main `1d34e71fcc33c3a83cd02b2f9bee41cd749a9482` in a detached arena prepared with `npm ci`. Preserve the full command, exit, child outputs and survivor counts. Compare the failing fingerprint with the landed tree; an intermittent result is recorded as intermittent, not a reproduced failure.
2. Give every fixture allocated by `scripts/gr-sim-campaign.test.mjs` a cleanup guarantee on success, assertion failure and child startup/exit failure. Preserve every existing semantic assertion, expected hash, timeout and campaign command. Ensure a child started by the test is reaped before its directory is cleaned. Use the simplest local try/finally or test teardown; no framework or new dependency.
3. Preserve enough nested-child failure output in the fixture sweep to identify an assertion next time, while keeping the sweep's existing verdict semantics: surviving fixtures fail; a child assertion failure that cleans up is reported only. Never make a failing assertion a pass.
4. Prove the cleanup guarantee with a controlled failure on a scratch copy: force an assertion after fixture allocation to fail, require nonzero exit and zero survivors, then restore the source byte-for-byte. Run the unmodified campaign spec and all 162 fixture owners; no source or timeout relaxation. Write exact before/after results to `artifacts/gr-campaign-fixture-cleanup-1/report.md`.
If you find yourself about to exit without changes, WRITE WHY into your report first.

## Firewall
Touch ONLY: `scripts/gr-sim-campaign.test.mjs`, `scripts/fixture-teardown.test.mjs`, `artifacts/gr-campaign-fixture-cleanup-1/**`.
NO changes to: campaign runtime `scripts/gr-sim-campaign.mjs`, `src/**`, `assets/**`, `functions/**`, `package.json`, lockfiles, engine-era pins, existing e2e assertions, timeouts, watchdog limits, tasks, ledgers, reviews or other implementers' work. A runtime defect is a finding, not permission to expand this task.

## Self-check (evidence, not vibes)
Use `/opt/homebrew/bin/node` 26.4.0 with `/opt/homebrew/bin` first in the child PATH; record the actual binary and version. tsc and `npm run build` green. The campaign test and full fixture sweep green; controlled failure remains red while leaving zero fixtures. Complete `npm run test:node-guards`. Adjacent `e2e/task-025.spec.ts`, `e2e/m1-01.spec.ts`, `e2e/m2-01.spec.ts` unmodified-green on both projects via the permanent gate battery with `--workers=1`; plain desktop and 390 px boots with zero console/page errors. One server at a time under the drain lock, scratch port 5317. Stop only PIDs you started, never `pkill -f`; path-scoped commits with prefix `test:`. Evidence under `artifacts/gr-campaign-fixture-cleanup-1/`; no performance change is expected from test cleanup.

End: READY-FOR-GATES + exact failing child assertion if recovered, clean-base control result, cleanup failure-injection result, gate counts and exits, runtime, commit hashes, and REMAINING LIST IN ORDER.
