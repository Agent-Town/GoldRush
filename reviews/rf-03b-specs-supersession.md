# reviews/rf-03b-specs-supersession.md

**Slice:** RF-03b-specs supersession corrective (test-only — realign the two specs that still asserted the pre-RF-03b bench-in-normal-play).
**Branch/tip:** `lane/perf` (worktrees/lane-d), runner commit `3d1243f5` `runner(lane-d): lane-d-rf-03b-specs-supersession.md`.
**Base:** `b94c2f67` (the s930 author commit — already an ancestor of main; only the runner's spec edits were ahead).
**Drained onto main:** tip `0bd1f0a7` (s931 lock), path-scoped graft of 2 e2e files.

## Verdict
**PASS — MERGED.** tsc clean · build green · the rewritten `task-037:142` GREEN · full `town-assay-office-blender` 10/10 both projects · canonical `bug-office-desk` 4/4 both projects · the excluded `task-037:171/192` reds fingerprint-match F-902-2 EXACTLY (fail at `debugPlaceAssayOffice` placement, in code this diff never touches).

## What it does
RF-03b (SHIPPED s902) reversed the Assay Office door: normal play now opens the **Complaints Desk**, and the crafting **bench** retreats behind `?debug` (`src/crafting/AssayBench.ts:281-285` → `AssayBenchPanel` only under `?debug`, else `ComplaintDeskPanel`; `src/town/TownScene.ts:1190-1193` door-text toggle). Two specs still asserted the OLD reality (F-902-1, INTENDED SUPERSESSION). This corrective realigns them to the shipped desk reality — test-only, zero `src/`:
- `task-037-assay-bench-ungate.spec.ts:142` — the "normal play opens the bench" test now runs under `?debug` (title → *"debug play builds the Assay Office and posts an order at the bench"*), preserving its unique overworld build + order-post coverage instead of deleting it.
- `town-assay-office-blender.spec.ts:186/218` — the two door-open assertions swap `assay-bench`→`complaint-desk` (and `assay-close`→`complaint-close`), mirroring the canonical GREEN `bug-office-desk.spec.ts`.

## Evidence (real numbers, gated on the MERGED tree)
| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean (exit 0) |
| `npm run build` | green — built in 1.79s |
| `town-assay-office-blender` + `bug-office-desk`, both projects (`playwright.s931-scratch.config.ts`, port 5266, workers=1) | **14 passed (43.1s)** — blender 10 (5 tests × 2 projects) + desk 4 (2 × 2), zero console/page errors |
| `task-037-assay-bench-ungate`, both projects | **1 passed** (`:142` desktop) · 2 skipped (`:142` mobile `test.skip` by design + one) · **3 failed** (`:171` desktop+mobile, `:192` mobile) — all at `debugPlaceAssayOffice` |

## Merge classification
Base `b94c2f67` is already an ancestor of main; main advanced (STATUS/BACKLOG/goals/logs/`tasks/lane-roster-wiring-e7.md`) but **never touched the two spec files** (`git diff --name-only b94c2f67 main -- <the 2 specs>` = empty). Given the stale-base drift on the lane, grafted the two LANE-TOUCHED files surgically path-scoped (`git checkout lane/perf -- <2 specs>`) rather than a `--no-ff` merge that would have dragged in the lane's stale copies of STATUS/BACKLOG/goals. No 3-way needed.

| File | Class | Resolution |
|---|---|---|
| `e2e/task-037-assay-bench-ungate.spec.ts` | LANE-TOUCHED only | clean graft (main untouched since base) |
| `e2e/town-assay-office-blender.spec.ts` | LANE-TOUCHED only | clean graft (main untouched since base) |

## Findings
- **F-931-1 (RESOLVES F-902-1, INTENDED SUPERSESSION):** the two normal-play bench assertions are now aligned to the shipped desk reality. Closed by this merge.
- **F-902-2 (PRE-EXISTING RED — merge-independent, EXCLUDED by design, per attended "investigate-don't-blind-fix"):** `task-037:171` (desktop+mobile) + `task-037:192` (mobile) fail deterministically at `debugPlaceAssayOffice` (line 129: `window.__THREE_GAME_DIAGNOSTICS__?.build.assayOffices` polls to `0`, expected `1`) — a debug **building-placement** step that runs BEFORE any bench/desk branch. This diff is byte-identical to main for `:171`/`:192` (`git diff main -- task-037...spec.ts` = the single `:142`-region hunk only), so the failures are structurally pre-existing, not introduced. Matches the documented fingerprint in `reviews/bug-office-desk.md:42` EXACTLY. `lane-c-activations-assay-office:80` (enemy-rotation red) is untouched by this drain and not in its file set. A separate follow-up may investigate the placement/rotation reds; NOT this drain's concern.
