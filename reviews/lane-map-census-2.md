# Review — map-census referee (lane-map-census-2)

**Slice/branch/tip:** `lane/e2-arsenal` `5bb8a1fb` ("feat: add 41-map quality census referee")
**Merge:** `77ab5d8f62f874bca404b7a42a9c9d4311cf8406` — `git merge --no-ff lane/e2-arsenal` onto clean main `c4868128`, merge-base `574458e3` (disjoint 3-way, main touched none of the tip files).
**Verdict:** MERGED — clean, test-only, firewall-honoured.

## What it does
Lands **THE CENSUS — the map-quality register's referee**: a parameterized Playwright spec (`e2e/map-census.spec.ts`, +254) that walks all 41 contract doors (per epoch via `&debug&era=N`) and, per map, checks the FIXED classes — boot cleanliness, renderSource truth (3d for registry maps / legal painted fallback), MQ-1 preview probe, MQ-2 no-band flat-row pixel scan, MQ-3 one-blocker depenetration, and daylight landmark-brightness luminance floor — plus a mobile spot-set. It emits `artifacts/map-census/table.md` (map × class) and adds the `census` npm script. Findings are recorded in the table, never fixed inline (firewall).

## Evidence
| Gate | Result |
|---|---|
| `npx tsc --noEmit` | ✓ clean |
| `npm run build` | ✓ 1.05s |
| census spec smoke (post-merge, desktop-chrome, workers=1) | ✓ 3/3 — `the-claim` 5.5s · `e1-baron` 4.9s · `e2-hill-mine` 2.1s (all ≤10s budget) |
| Shipped table | real, 41 maps, generated 2026-07-20T08:11:57Z, census-closed: none |

The committed table captures genuine referee findings (surfaced, not blockers — spec is a referee): E3 flat-row deviations (blackout-ridge/moth-season/canyon-works), E3 luminance floors, E5 `regatta`/`flotilla` doors opening `the-claim` (real content bug worth an owner note), E5 unmounted landmarks, E6 `glow-mesa` painted-instead-of-glb + 12.5s over-budget. These are the register's job to report.

## Merge classification
- `e2e/map-census.spec.ts` (new), `artifacts/map-census/table.md` (new), `package.json` (+1 `census` script) — all LANE-TOUCHED, main-untouched since base → clean additive graft, zero conflicts.
- Main's newer FULL-BOOK art drain / goals reconciliation (the two-dot phantom deletions) correctly preserved by the 3-way (lane never touched them).

## Findings
- **F-1 (non-blocking, owner note):** the census surfaces two content bugs worth a look — `e5-regatta` and `e5-flotilla` doors both open `the-claim` (wrong-map routing), and E6 `glow-mesa` renders painted instead of its glb + runs 12.5s (over the 10s budget). These are register findings, not gate failures; carry to the OWNER DESK / a future map-quality slice. The referee doing exactly what it was built to do is the point.

Goal `map-quality-register` (was queued) → **merged** `77ab5d8f62f874bca404b7a42a9c9d4311cf8406` in this drain commit.
