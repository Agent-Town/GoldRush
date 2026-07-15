# Review: lane/perf — e2-drip-03-incline + publish-e2-mask-tables (stall reports)

**Slice:** e2-drip-03-incline + publish-e2-mask-tables (lane/perf)  
**Branch:** lane/perf  
**Tip:** 0b04cf13 runner(lane-d): publish-e2-mask-tables.md  
**Merge commit:** 042c990b  
**Drained by:** s562 fire, 2026-07-15  

## Verdict: STALL-DRAIN (no player-visible change)

Both tasks LADDER-STALL'd at pre-flight. Content will be authored once pressure-garden drains.

## What happened

**e2-drip-03-incline** stalled waiting on `e2-pressure-garden`: no pressure-garden contract
exists in `assets/contracts/epoch-2-steamworks/contracts.json` and `e2e/e2-pressure-garden.spec.ts`
does not exist. The Incline task requires the Pressure Garden to be drained first (drip chain ordering).
`artifacts/e2-incline/report.md` updated.

**publish-e2-mask-tables** stalled because both pressure-garden and incline tileParams are absent
(neither was authored, per their own stall reports). No mask-table files, node test, or
authoring-law line were published.
`artifacts/publish-e2-mask-tables/report.md` updated.

## Stall conditions cleared?

| Condition | Status |
|-----------|--------|
| e2-pressure-garden contract in main | ✗ (awaiting pressure-garden run) |
| e2-incline contract in main | ✗ (awaiting incline run after pressure-garden) |

**Action:** re-queue e2-drip-03-incline AFTER pressure-garden drains; publish-e2-mask-tables
AFTER incline drains. Flagged in s562 handoff.

## Conflict note
`artifacts/e2-incline/report.md` had a content conflict (two stall reports from separate
overnight runs, same stall reason). Resolved by keeping the more recent lane/perf version.

## Merge classification
- `artifacts/e2-incline/report.md` — BOTH-MOVED (conflict resolved, lane/perf version kept)
- `artifacts/publish-e2-mask-tables/report.md` — LANE-TOUCHED (updated stall report)
- STATUS.md — lane runner update REJECTED (stale, overridden with fire's version)

## Findings
None. No code changes, no regressions.
