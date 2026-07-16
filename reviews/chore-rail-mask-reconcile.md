# reviews/chore-rail-mask-reconcile.md

- **Slice:** chore-rail-mask-reconcile (lane-d two small debts)
- **Branch/tip:** lane/perf @ 3d820074 (runner(lane-d) commit)
- **Base:** 270a96af (= main pre-s636 lock; lock commit 396a5714 touched STATUS.md only → disjoint)
- **Merge commit:** de9cbcc2
- **Verdict:** ✅ SHIPPED — clean additive data/test drain, no runtime src.

## What it does
Reconciles three E3-mask-table debts. (1) **Canyon Works (F-3DD-rail):** the published `e3-canyon-works.json` mask table carried only the depot loop; the shipped `tileParams`/`contracts.json` has TWO rails. The missing west-rim line (steamworks style, 5 points) is now copied verbatim from the contract — the TABLE was wrong, not the contract. (2) **Dust Flats relocate:** no-op — stale premise. `e4-dust-flats.json` is already under `epoch-4-motor/mask-tables/`; no E3 copy exists; git history shows it was born at the E4 path. (3) **Blackout Ridge:** publishes `e3-blackout-ridge.json` mask table extracted from its shipped `tileParams` + authored spawn/day-night data; riverless → empty-water contract.

## Evidence
| Gate | Result |
|------|--------|
| `node --test scripts/e3-mask-tables.test.mjs` | **5/5 pass** (bounds + water-agreement for published set, Moth Season, canyon-works, blackout-ridge, dust-flats) |
| `npx tsc --noEmit` | clean (exit 0) |
| `npm run build` | ✓ built in 816ms |
| src/*.ts touched | **none** — data/config/test only; no runtime, no render, no adjacent playwright suite affected |
| Player visibility | none — mask tables are contract data, unwired until their terrain slice (display-safe) |

## Merge classification (base 270a96af)
| File | Class | Resolution |
|------|-------|-----------|
| `artifacts/chore-rail-mask-reconcile/report.md` | NEW | free |
| `assets/contracts/epoch-3-voltage/mask-tables/e3-blackout-ridge.json` | NEW | free |
| `assets/contracts/epoch-3-voltage/mask-tables/e3-canyon-works.json` | LANE-TOUCHED | clean (main did not move it; +2nd rail hunk only) |
| `scripts/e3-mask-tables.test.mjs` | LANE-TOUCHED | clean (main did not move it) |

No conflicts; STATUS.md (main's only post-base change) is disjoint from all four files.

## Findings
- **F-3DD-rail: RESOLVED** — canyon 2nd rail reconciled from truth (tileParams), not invented. Firewall honored: NO tileParams/runtime source changed (report + empty src diff both confirm).
- No blocking findings.
