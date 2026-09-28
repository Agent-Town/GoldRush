# Tape drawer inheritance — implementation complete, acceptance conflict blocks landing

READY-FOR-GATES — **not green for landing**. The requested map-or-campaign rule is implemented. The protected acceptance test contradicts that rule at its first assertion: it seeds Robin's campaign to E7 before opening E6, then requires no toggle. The task describes that boot as a fresh profile, but it is already an E7 profile. No acceptance assertions were changed or bypassed.

## Root cause and diff

`activeEpochId()` intentionally reads the selected contract's content epoch. The old Tape Reel mount used only that epoch, hiding the player's inherited drawer on earlier contracts. `src/game/Game.ts` now imports the existing `epochIsActive()` helper and mounts when `this.activeEpoch.order >= 7 || epochIsActive('epoch-7-signal')`. The helper compares the saved campaign manifest order to E7. No new helper, map-content epoch change, capacity change, simulation change, or playbook behavior change was needed.

The phone hit-target audit did not cover plain E1 inheritance. Its existing test now ends with a plain E1 navigation and exactly one added visibility assertion, under its existing console/page-error collectors. The protected `e7-playbook-surface.spec.ts` is byte-unchanged.

**Engine-pinned landing:** `src/**` changed: `src/game/Game.ts:23` imports the helper and `:1926` changes the mount condition. Integration must use the engine-pinned landing path. This lane does not update pins, release, deploy, or modify orchestrator-owned files.

## Pre-flight

Starting HEAD `97903ef7b51c508ab363b5b759fe90b2c00a7972`; main baseline `0ffd300fc4f9f614825a051f1e9ed881899ff85c`. Initial tracked worktree clean; `git log main..HEAD` empty (no undrained commits). Main contained the prerequisite `e7-tape-toggle-phone-hit-target-1` merge `00e12579e`. Reset the lane to local main with the prescribed checkout/clean command. No remote pull was performed: main is the locally attended integration branch.

`git clean -fd` removed regenerated untracked evidence directories only: `artifacts/gr-campaign-fixture-cleanup-1/{injection-contract-helper,injection-early-exit,injection-first-helper,injection-live-child,injection-resume-assertion,injection-second-helper,injection-startup,playwright-results/*,same-assertion-after,same-assertion-before}` and `artifacts/play-proofs-evidence-retention-1/{desktop-chrome-results,mobile-chrome-results}/*` (six build-menu result directories in each family). `npm install --no-audit --no-fund` exited 0. Its sole tracked churn was removal of 30 lockfile libc metadata lines; restored that generated churn. Pre-flight build exited 0, and the lane was clean before implementation apart from newly collected task evidence.

The vault was readable and searched. The task's explicit TOUCH-ONLY firewall prevents writing a vault digest during this slice; this report is the durable handoff.

## Unchanged acceptance before and after

Each command used `npx playwright test e2e/e7-playbook-surface.spec.ts --project=<project> --workers=1 --output=artifacts/e7-tape-drawer-inheritance-1/<phase>-<device>-results`. stdout/stderr and the command's direct exit status are retained in matching `.log` and `.exit` files.

| Project | Before | After | Record/replay test |
| --- | --- | --- | --- |
| desktop-chrome | exit 1; 1 failed, 1 passed; line 49, missing plain E1 toggle | exit 1; 1 failed, 1 passed; line 40, seeded E7 profile has E6 toggle | passed before and after |
| mobile-chrome | exit 1; 1 failed, 1 passed; line 49, missing plain E1 toggle | exit 1; 1 failed, 1 passed; line 40, seeded E7 profile has E6 toggle | passed before and after |

Before: desktop 1.4m, mobile 54.5s. After: desktop 52.8s, mobile 32.7s. Failure screenshots, traces, and error context are retained. The post-fix acceptance cannot reach its final E1 assertion because it stops at the contradictory E6 assertion. The added audit assertion and separate plain-boot probe provide direct coverage of that behavior without weakening the protected test.

## Remaining list in order

1. Orchestrator must resolve the acceptance contradiction: seed E7 only after checking genuinely fresh-profile E6, or revise the task's map-or-campaign rule. Editing the protected acceptance is outside this lane's firewall.
2. Re-run the unchanged-or-authorized-corrected acceptance on desktop and mobile, then perform the engine-pinned integration gates.

## Adjacent gates and compiler checks

- `npx tsc --noEmit`: exit **0** (`typecheck.log`, `typecheck.exit`).
- `npm run build`: exit **0** (`build.log`, `build.exit`). Existing Vite native-loader/chunk-size and asset-diet warnings remain.
- `npx playwright test e2e/e7-tape-toggle-phone-hit-target.spec.ts e2e/m2-01-build-menu.spec.ts e2e/task-025-bandits-dont-swim.spec.ts --project=desktop-chrome --project=mobile-chrome --workers=1 --output=artifacts/e7-tape-drawer-inheritance-1/adjacent-results`: exit **0**, **26/26 passed**, 5.0m (`adjacent.log`, `adjacent.exit`). Per project: Tape toggle **1/1**, build menu **7/7**, river/bandits **5/5**. Both Tape-toggle runs include the new inherited plain E1 assertion; all prior adjacent assertions remain unchanged.
- Audit console/page errors: **0/0 on both projects**; each audit's error collection spans its board launches and final plain E1 boot. Record/replay errors also remain zero on both projects.
- The adjacent specs regenerated seven tracked files outside this slice's evidence directory. Copied these into `adjacent-evidence/artifacts/{056,e7-tape-toggle-phone-hit-target-1}/`, then restored only those generated originals. No out-of-scope source or assertion changes.

Implementation commit: `0d7949951` (`fix: inherit the Tape Reel from campaign progress`). Evidence is committed separately with the task's `fix:` prefix; resolve the report's containing commit for its final hash.

## Plain-boot probe

`npx playwright test --config=artifacts/e7-tape-drawer-inheritance-1/plain-boots.config.ts --project=desktop-chrome --project=mobile-chrome --workers=1`: exit **0**, **2/2 passed**, 17.6s. Artifact-only config/spec and per-project JSON are retained. Both projects verified all three boots with **zero console and page errors** and no `__GR_TEST__`:

| Campaign progress | Actual map | Actual content epoch | Tape toggle count |
| --- | --- | --- | ---: |
| E6 (new profile; only E6 access and staged Showroom launch seeded) | e6-showroom | epoch-6-atomic | 0 |
| E7 | the-claim | epoch-1-frontier | 1, visible |
| E7 | e6-showroom | epoch-6-atomic | 1, visible |

Probe adaptation: an entirely unseeded profile cannot directly launch the locked E6 map; its URL fell back to The Claim. That initial instrument run exited 1 on both projects, with zero errors, and is preserved in `probe-setup-control/`. The corrected probe uses the E6 access and staged-launch prerequisites already used by `e2e/e6-showroom-capture-quota.spec.ts`; it does not mutate simulation state. One intermediate collection attempt exited 1 because the archived probe retained a `.spec.ts` suffix and its relative imports moved; renamed the archive to `.ts.txt`, preserving the attempt's log/status. Neither probe setup finding warranted a production change.

The requested inheritance rule and pre-Signal absence now have direct plain-boot evidence. The sole unresolved gate remains the protected acceptance test's E7-seeded E6 absence assertion.

Evidence payload: **577,200,597 bytes** across **60 files**, excluding this report and its manifest; exact per-file counts are in `evidence-manifest.json`.
