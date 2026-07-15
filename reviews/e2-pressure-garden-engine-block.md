# Review: lane/e2-arsenal — e2-drip-02-pressure-garden (engine block report)

**Slice:** e2-drip-02-pressure-garden (lane/e2-arsenal)  
**Branch:** lane/e2-arsenal  
**Tip:** 1fa33b67 runner(lane-c): 20260715-054828-e2-drip-02-pressure-garden.md  
**Merge commit:** (pending)  
**Drained by:** s562 fire, 2026-07-15

## Verdict: ENGINE-BLOCK-DRAIN (no player-visible change)

Lane safety cleared (cw-03 now on main), but the runner correctly identified a genuine
engine dependency: the PressureSystem, boiler_house buildable, and PRESSURIZE objective
are all hardcoded to `e2-hill-mine` only. No contract data seam exists to opt a second
contract into pressure play.

## Engine block root cause

| Call site | Issue |
|-----------|-------|
| `Game.ts:897` | `PressureSystem` enabled only for `e2-hill-mine` |
| `Game.ts:3786` | `boiler_house` buildable enabled only for `e2-hill-mine` |
| `Game.ts:3878` | PRESSURIZE objective published only for `e2-hill-mine` |
| `ContractFamilies.ts` | accepts escort modes only; contract JSON cannot opt in |

The task firewall forbids mechanics changes, so it cannot generalize these call sites
itself. The runner authored no contract, tile masks, board row, spec, or screenshots.

## What lands on main

`artifacts/e2-pressure-garden/report.md` updated with the engine block diagnosis
(re-verification at `main` `4c7dcf05`, lane clean, build green).

## Stall chain status

| Task | Status |
|------|--------|
| e2-drip-02-pressure-garden | ✗ ENGINE-BLOCKED — needs `pressure-generalize-engine` slice |
| e2-drip-03-incline | ✗ BLOCKED — needs pressure-garden to drain first |
| publish-e2-mask-tables | ✗ BLOCKED — needs both drips to drain |

**Action:** OWNER'S DESK entry added to BACKLOG. E2 drip chain PIPELINE-DRY.
e3-blackout-ridge re-queued on lane-c (its STORAGE extension is IN-scope, not blocked).

## Merge classification
- `artifacts/e2-pressure-garden/report.md` — LANE-TOUCHED (engine block diagnosis)
- STATUS.md — lane runner update REJECTED

## Findings
None. No code changes, no regressions.
