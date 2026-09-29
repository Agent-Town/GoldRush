# Tape drawer inheritance — contract progress with explicit preview isolation

READY-FOR-GATES — all assigned checks pass.

## Root cause and change

The map-content epoch intentionally belongs to the selected contract. The original Tape Reel mount consulted only that epoch, so an E7 profile lost its drawer on earlier contracts. Attempt 1's unconditional campaign fallback then incorrectly armed the drawer in an explicit E6 debug preview. These are different boot modes, not contradictory acceptance criteria.

`src/meta/ContractFamilies.ts:1138` now exports `tapeReelEpochOrder()`. It mirrors the existing valid debug-preview predicate (including editor, fullbase, release and replay handling); a valid preview keeps its active epoch order. A `?contract=` boot outside that preview branch takes the maximum of the active order and the saved campaign order. Other boots retain their active order. `src/game/Game.ts:22` imports the helper and `:1926` uses its order to mount the drawer. The existing `activeEpochId()` body, capacity, playbook behavior, and simulation are unchanged.

Attempt 1 already added exactly one visibility assertion following a plain E1 navigation in the hit-target audit. It is retained without further e2e changes. The protected acceptance spec is byte-identical to the pre-task baseline. Full landing diff: `implementation.diff`.

**Engine-pinned landing:** `src/**` changed at the Game import/mount and ContractFamilies helper above. Integration must use the engine-pinned landing path. This task does not update the engine pin or deploy.

## Preflight and scope

Start: `3614d705a`, branch `sol/open-findings-astra`, clean worktree. The only ahead commits were authorized predecessor commits `0d7949951` and `3614d705a`; both retained with no reset or history rewrite. Landing baseline: `0ffd300fc4f9f614825a051f1e9ed881899ff85c` (merge base with main).

Fetched origin/main successfully. Prerequisite merge `00e12579e` is present in both local main and freshly fetched origin/main. Local main was `9a809c631`; fetched origin/main was `32c93f42e`. Main was inspected, not moved. `npm install --no-audit --no-fund` and preflight `npm run build` both exited 0. Restored only install-generated package-lock libc metadata churn; worktree was then clean before edits. Logs: `attempt-2-install.log`, `attempt-2-preflight-build.log`.

No unrelated source, protected assertions, specs, scripts, tasks, reviews, or other lanes changed. The vault was readable and searched; the task's explicit TOUCH-ONLY firewall prevents a vault write. This report is the durable handoff.

## Acceptance evidence

All Playwright runs use the config-owned dev server at 127.0.0.1:5188 and `--workers=1`. Direct subprocess return codes are captured in `.exit` files, without a pipeline.

| Project | Original baseline | Attempt 1 | Attempt 2 |
| --- | --- | --- | --- |
| desktop-chrome | exit 1; 1 passed, 1 failed at final plain E1 visibility | exit 1; 1 passed, 1 failed at E6 preview absence | exit 0; 2/2 passed (16.3s) |
| mobile-chrome | exit 1; 1 passed, 1 failed at final plain E1 visibility | exit 1; 1 passed, 1 failed at E6 preview absence | exit 0; 2/2 passed (16.0s) |

Historical before/after logs and exit files from attempt 1 remain in-tree. Their complete original records are also retained outside the tree. Attempt 2 runs are `npx playwright test e2e/e7-playbook-surface.spec.ts --project=<project> --workers=1 --output=<retention-root>/attempt-2/<device>-results`, logged as `attempt-2-after-<device>.log/.exit`.

## Compiler, plain boots, and adjacency

- `npx tsc --noEmit`: exit 0 (`attempt-2-typecheck.log/.exit`).
- `npm run build`: exit 0 (`attempt-2-build.log/.exit`). Existing build warnings retained in the log.
- Plain boot probes: exit 0, **2/2 passed** (19.2s). Command: `npx playwright test --config=artifacts/e7-tape-drawer-inheritance-1/plain-boots.config.ts --project=desktop-chrome --project=mobile-chrome --workers=1 --output=<retention-root>/attempt-2/plain-boots-results`. On both projects the new E6 profile has zero toggles; E7 campaign profiles have one visible toggle on both plain E1 and E6 maps. Diagnostics confirm the actual map epochs remain E1/E6, no `__GR_TEST__`, and zero console/page errors in all six boots. See `plain-boots-<project>.json` and `attempt-2-plain-boots.log/.exit`. Acceptance tests also assert zero console/page errors.
- Adjacent suites: exit 0, **26/26 passed** (4.6m), **13/13 per project**: hit-target audit 1, build menu 7, river/bandits 5. Command: `npx playwright test e2e/e7-tape-toggle-phone-hit-target.spec.ts e2e/m2-01-build-menu.spec.ts e2e/task-025-bandits-dont-swim.spec.ts --project=desktop-chrome --project=mobile-chrome --workers=1 --output=<retention-root>/attempt-2/adjacent-results`. See `attempt-2-adjacent.log/.exit`. Both audit JSON records have zero console/page errors; their error collectors span all board launches and the final inherited plain E1 boot.

The adjacent tests regenerated seven tracked evidence files outside the task directory. Moved the generated copies into `<retention-root>/attempt-2/regenerated/`, copied only the audit JSON records into this task’s `adjacent-evidence/`, and restored the seven original paths. No unrelated edits remain.

## Evidence retention

Complete attempt-1 snapshot: `/Users/robin/.goldrush/evidence/e7-tape-drawer-inheritance-1/attempt-1/`. All 30 tracked trace/screenshot/result files were moved out of the task tree and removed from the index using path-scoped `git rm --cached`. No retained files were deleted. The original committed history remains unchanged.

`retention-manifest.json` records each moved path, destination, byte size and SHA-256: 576,780,762 bytes moved. New Playwright result folders write directly to the same retention root under `attempt-2/`. In-tree evidence retains reports, JSON measurements, probe source/config, and command logs; no screenshots are required in-tree (zero is within the two-JPEG cap).

Source fix: `39f42724e` (`fix: inherit the Tape Reel on contract boots while isolating epoch previews`). Authorized predecessor commits: `0d7949951`, `3614d705a`. Evidence commit is the commit containing this final report; resolve with `git log -1 -- artifacts/e7-tape-drawer-inheritance-1/report.md`. Final evidence budget: **1,156,332 bytes added** against baseline `0ffd300fc4f9f614825a051f1e9ed881899ff85c`; below the task's 25,000,000-byte cap. Verified with `node scripts/evidence-budget.mjs 0ffd300fc4f9f614825a051f1e9ed881899ff85c HEAD --limit 25000000` after committing.

## REMAINING LIST IN ORDER

1. Orchestrator: run the engine-pinned integration gates and land the slice. No implementation or verification items remain for this task.
