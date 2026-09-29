---
source: codex
project: Gold Rush
date: 2026-09-29
type: solution
---
# Agent door first-secure ledger refresh

**READY-FOR-GATES — HELD for the out-of-scope contract-guard fixture correction.** Data repair and requested verification are complete; this is not an all-green gate claim.

## Scope and root cause

The writer is `scripts/render-skillmd-contracts.mjs`; its first-secure input is `assets/rotations/winnability-receipts.json`. The upstream updater is `scripts/winnability-receipts.mjs`: its existing F-RECEIPTS-1 / F-LINEAGE-6 rules preserve stored historical claims when the current board is empty or later. No generator code change is needed. An offline empty-board refresh on a copy preserved all 38 rows, including the five repairs. The generator also reads bench seeds and contract manifests, which were not changed. The ledger retained five `unclaimed` statuses despite dated secure records. Updated only those five ledger entries, then ran the unchanged generator. Only five human-readable block rows changed; the 38-ID JSON reader contract and all other document text stayed byte-identical.

No live-county requests. All evidence came from local reviews, the backlog, and retained heat artifacts. The dated review/backlog evidence takes precedence over the stale ledger. This is historical first-secure attribution, not a claim that all old reels still rank in the current engine era.

## Pre-flight

Base: `d40d657b998d93a9cb13b6b3a3fc8ed6b2cb66b7` on `sol/map-art-campaign-2`. Worktree clean, no ahead commits, no reset needed, no discarded evidence. Baseline `npm run build` exited 0; post-build status clean. The task contradicts itself about installation: honored its explicit “do NOT run npm install/npm ci” and used existing dependencies. `node_modules` was a directory, not the task's expected symlink; left untouched. Status was checked from lane-c itself, equivalent to the primary-root `git -C worktrees/lane-c` command.

## Complete unclaimed-row audit

Every initially unclaimed row was searched by exact ID across `reviews/` and `tasks/BACKLOG.md`; raw hits are in the five `*-audit.txt` files here. All five now carry `claude-opus-5 (Claude Opus 5)`. There are **zero remaining unclaimed rows**, **37 claimed**, and **one training ground**.

| Contract | Before | First secure date | Dated record and corroboration | After |
|---|---|---|---|---|
| e10-archive-world | unclaimed | 2026-09-18 | `reviews/heat-14-era6-reride.md:11`, rider identified in title/line 3; heat-14 matrix row 37 and retained verified slip | claimed |
| e10-ember-shore | unclaimed | 2026-09-18 | Same review, heat-14 matrix row 24 and verified slip | claimed |
| e3-canyon-works | unclaimed | 2026-09-07 | `tasks/BACKLOG.md:777` explicitly records heat-13 first-ever county secures and the September 7 ride date; heat-13 matrix row 20, verified slip | claimed |
| e7-relay-valley | unclaimed | 2026-09-07 | Same backlog record; heat-13 matrix row 18, verified slip | claimed |
| e9-dome-basin | unclaimed | 2026-09-07 | Same backlog record; heat-13 matrix row 19, verified slip | claimed |

September 12 is the heat-13 **drain** date, not its ride date. September 6 Relay Valley and Dome Basin developer proofs (`reviews/relay-valley-winnable.md`, `reviews/dome-basin-winnable.md`) establish local winnability; the September 7 record explicitly identifies the first-ever county secures and is supported by verified slips. Heat-14 Archive World was initially rate-limited (the review says so), but its retained final slip is verified. The earlier receipts-after snapshot therefore does not override the dated review/final slip.

The receipt's `species` is the model rider ID `claude-opus-5`, `profileName` is `Claude Opus 5`; reel IDs and engine pins were copied from the actual submissions/slips, not inferred. Dates use day precision because the dated evidence supplies the secure day, rather than inventing a secure timestamp from the later assay timestamp. Selected local fields and source paths are in `receipt-evidence.json`.

## Before and after rows

```diff
diff --git a/public/skill.md b/public/skill.md
index d0d9db6be..2cd0ddd36 100644
--- a/public/skill.md
+++ b/public/skill.md
@@ -451,2 +451,2 @@ Standing marker: `unclaimed` means no verified rider has secured the contract; `
-- `e10-archive-world` | bench seeds: `e10-archive-world-01`, `e10-archive-world-02` | unclaimed
-- `e10-ember-shore` | bench seeds: `e10-ember-shore-01`, `e10-ember-shore-02` | unclaimed
+- `e10-archive-world` | bench seeds: `e10-archive-world-01`, `e10-archive-world-02` | first secured by claude-opus-5 (Claude Opus 5) on 2026-09-18
+- `e10-ember-shore` | bench seeds: `e10-ember-shore-01`, `e10-ember-shore-02` | first secured by claude-opus-5 (Claude Opus 5) on 2026-09-18
@@ -459 +459 @@ Standing marker: `unclaimed` means no verified rider has secured the contract; `
-- `e3-canyon-works` | bench seeds: `e3-canyon-works-01`, `e3-canyon-works-02` | unclaimed
+- `e3-canyon-works` | bench seeds: `e3-canyon-works-01`, `e3-canyon-works-02` | first secured by claude-opus-5 (Claude Opus 5) on 2026-09-07
@@ -476 +476 @@ Standing marker: `unclaimed` means no verified rider has secured the contract; `
-- `e7-relay-valley` | bench seeds: `e7-relay-valley-01`, `e7-relay-valley-02` | unclaimed
+- `e7-relay-valley` | bench seeds: `e7-relay-valley-01`, `e7-relay-valley-02` | first secured by claude-opus-5 (Claude Opus 5) on 2026-09-07
@@ -482 +482 @@ Standing marker: `unclaimed` means no verified rider has secured the contract; `
-- `e9-dome-basin` | bench seeds: `e9-dome-basin-01`, `e9-dome-basin-02` | unclaimed
+- `e9-dome-basin` | bench seeds: `e9-dome-basin-01`, `e9-dome-basin-02` | first secured by claude-opus-5 (Claude Opus 5) on 2026-09-07
```

## Verification

| Check | Result |
|---|---|
| Preflight `npm run build` | PASS, exit 0 |
| `npx tsc --noEmit` | PASS, exit 0 (`tsc.log`) |
| Final `npm run build` | PASS, exit 0 (`build.log`); existing Vite size/config and asset quantization warnings |
| `node scripts/render-skillmd-contracts.mjs --check` | PASS; exact regeneration |
| `node artifacts/skill-door-unclaimed-refresh-1/lineage-local.mjs` | PASS; executes unchanged `scripts/assay-lineage-sweep.mjs --base http://127.0.0.1:<ephemeral>`; 38 IDs parse, five composition-pin targets read from local empty boards, zero reassays, no live requests |
| `node --test scripts/skillmd-contracts-guard.test.mjs` | 3 PASS / 1 FAIL: fixture assumes an unclaimed row. Baseline control 4/4 PASS. Out-of-scope follow-up below |
| `node artifacts/skill-door-unclaimed-refresh-1/marker-mutation.mjs` | PASS: renderer rejects corrupted claimed marker; generator guard remains effective |
| Offline updater on copy, empty boards | PASS: all 38 ledger entries preserved (`receipts-refresh.log`, `receipts-refresh-copy.json`) |
| Requested browser batch, both projects, one worker | 53 PASS / 1 SKIP / 2 FAIL in 6.7 min (`playwright.log`); both failures reproduced on the pre-task source |
| `task-025-bandits-dont-swim` | 10/10 PASS across both projects |
| `m2-01-build-menu` | 14/14 PASS across both projects |
| `skillmd-door` | 2/2 PASS |
| `agent-view`, `er01-e4-census` | 12/12 and 8/8 PASS respectively |
| `agent-seat` | 1 PASS / 1 SKIP (the existing mobile skip) |
| `field-book` | 6 PASS / 2 FAIL; `:147` expects fixture POST 200 but receives 400, both projects |
| Baseline control | Temporarily restored both changed production files from HEAD, asserted no diff in public skill, ledger, src, e2e, scripts or functions; guard 4/4 PASS; Field Book targeted rerun reproduces the identical two 400-vs-200 failures. Restored repaired bytes in a `finally` block (`baseline-control.json`, `baseline-field-book.log`) |
| Plain boots | Both Field Book plain-boot scenarios pass on both projects and assert empty console/page error arrays |
| Source/scope | `src/**`, existing e2e, scripts, tasks, specs, reviews and STATUS unchanged; only five skill block rows changed (`scope-check.txt`) |
| Engine hash | Before = after = `2d180e6bad6933ef15db2a006aaa0a1a3be8a97efdf9416cbc4646be71be4f6d`. `ENGINE_SOURCE_INPUTS` excludes both `public/` and `assets/rotations/`; no re-pin needed |

Browser command:
```sh
npx playwright test e2e/task-025-bandits-dont-swim.spec.ts e2e/m2-01-build-menu.spec.ts e2e/agent-seat.spec.ts e2e/agent-view.spec.ts e2e/er01-e4-census.spec.ts e2e/field-book.spec.ts e2e/skillmd-door.spec.ts --workers=1 --project=desktop-chrome --project=mobile-chrome --output=artifacts/skill-door-unclaimed-refresh-1/playwright
```

The baseline control repeats `field-book.spec.ts --grep 'minds and rigs aggregate'` with the same worker/project flags. No assertions were edited. Test-produced files outside this task's evidence directory were copied/moved into `generated/artifacts/**`, then tracked originals restored; exact paths in `relocated-evidence.json`. Nothing pre-existing was discarded. The task's TOUCH-ONLY firewall also takes precedence over general vault-writing instructions; this report is the durable handoff.

Commit: see the final lane commit containing this report (recorded in the final response).

## Remaining list in order

1. Orchestrator authorizes a separate correction to `scripts/skillmd-contracts-guard.test.mjs:60`: mutate an existing marker without assuming there is an unclaimed row. This file is outside this task's firewall; left unchanged. The current test reports 3 passed / 1 failed, specifically `no unclaimed marker available for the mutation proof`. The generator still rejects a corrupted claimed marker (`marker-mutation.mjs`, PASS). This is a newly exposed fixture defect, not a baseline-green assertion that can remain green after all legitimate claims are recorded.
2. Orchestrator records the baseline-confirmed Field Book fixture failure (`e2e/field-book.spec.ts:147`, 400 vs 200 on both projects) for a separate scope.
3. Re-run the corrected guard, review and integrate the lane commit. No production deploy in this task.
