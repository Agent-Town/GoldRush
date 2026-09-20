# Night Shift accelerated restore — controlled repeat

Date: 2026-07-10

Test: `e2e/e1-night-shift.spec.ts:348`

Project: `desktop-chrome`, one worker, `--repeat-each=2`

## Branch

- Source: `sol/fixed-step-unification`
- Server: branch worktree on non-reserved port 5292
- Result: **0/2 passed**
- Both runs timed out after the death overlay intercepted `contract-briefing-dismiss` in `dismissBriefing` (`e2e/e1-night-shift.spec.ts:61-64`) while opening the restored page at line 370.

## Clean base

- Source: detached `2cdcf210b51bb265661c7a232d49e43c54948bba`
- Server: baseline worktree on non-reserved port 5293
- Result: **2/2 passed** in 17.8 seconds total (individual cases 7.9 and 8.6 seconds).

## Interpretation

The fixed-step branch consistently exposes a setup race hidden by the old render-driven accelerated cadence. The product cadence remains 30 Hz; correcting the fixture requires orchestrator authorization because the exact full-regression gate currently treats the old cadence as its timing contract.
