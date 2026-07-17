# Review — e5/e6/e7 extra-maps contracts (coordinated 3-lane combine)

**Slices/branches:** lane/m4 `3ea683e7` (e5) · lane/perf `850ad643` (e6) · lane/m3 `37cb762a` (e7) — all forked from base `cb7fc3cd`
**Merge commit:** `33ab650d` (single coordinated combine onto clean main `946c8c6a`)
**Drained by:** s719 fire, 2026-07-17
**Verdict:** ✅ MERGED — clean 3-lane combine, all gates green desktop+mobile.

## What it does
Adds **9 new "extra" maps** to the epoch contract catalog — 3 per epoch for E5 (deepwater), E6 (atomic), E7 (signal):
- **E5:** e5-regatta, e5-stillwater, e5-flotilla (deepwater-claim tile reuse for stillwater/flotilla; regatta its own tile). Each carries `twist.enemyRoster` with spawnGates + weather.
- **E6:** e6-showroom, e6-half-life-hollow, e6-picnic (picnic reuses glow-mesa tile). Showroom houses / glow-bridges / countdown-ground / picnic-blanket fixtures; no enemy roster.
- **E7:** e7-echo-canyon, e7-dead-band, e7-relay-rush (dead-band/relay-rush reuse relay-valley tile). Echo-canyon-bands / broadcast-mirror / signal-null / interference-front zones; no enemy roster.

Each map ships an authored contract entry + a published mask-table JSON. Extra maps are **gated/locked** in the current board (future-era), so this is display-only content — no gameplay wiring until each epoch's play slice. On the board carousel, E5/E6 extra maps appear as **locked-visible** cards (page-dot navigable, `data-contract-locked=true`, launch disabled); E7 extra maps assert absent from the current page (`toHaveCount(0)`) — both coherent on the paginated board (RUN-confirmed both viewports).

## Merge classification
All three lanes forked from the SAME base `cb7fc3cd` (17+ behind main). Two-dot `git diff main lane/X` showed ~11k phantom deletions = pure stale-base noise (main's 3D-C capstone art/pilots/goals.json that the lanes never touched); a 3-way combine preserves them (Mistake #15 mechanics — `git diff cb7fc3cd main` was EMPTY for all 3 epoch contracts.json and both shared test files, so lane changes are clean 3-way with no divergence).

- **Disjoint per-epoch files (12) — LANE-TOUCHED, taken as-is** via `git checkout <lane> -- <path>`: `assets/contracts/epoch-{5-deepwater,6-atomic,7-signal}/contracts.json` (each += 3 maps) + 9 new `mask-tables/*.json`. No cross-lane overlap.
- **2 shared test files — MAIN==BASE, hand-combined** (all 3 lanes edit these at overlapping regions):
  - `scripts/e3-mask-tables.test.mjs` — union of every lane's additions to: header contract imports (e5), `table()` era ternary (e5), `contract()` spread (e5), the two `assertBoundsAndWater` zone/point spread arrays (all 3), the `directKeys` object (all 3, disjoint anchors), the `source` ternary (all 3), the three per-map assertion blocks (e5/e6), and the final bounds `for` loop id list (all 3).
  - `e2e/board-gating-and-profiles.spec.ts` — 3 disjoint insertions at sequential anchors (after activeEpochId / after glow-mesa count-0 / after relay-valley count-0).

## Findings
- **F-1 (RESOLVED in-merge): `authoredSpawnGates` real conflict.** e6 rewrote it to the general optional-chain form `authored.twist.enemyRoster?.flatMap(e => e.spawnGates ?? []) ?? []`; e7 kept the explicit exclusion list but changed `id === 'e7-relay-valley'` → `id.startsWith('e7-')`. These edit the same lines differently. **Resolved to the general form** after verifying the actual data: e5 maps' rosters flatMap exactly to their published `spawnGates`; e6/e7 extra maps have NO roster → `?? []` yields `[]` which matches their published `spawnGates=[]`; `twist` is present on all 9 maps so the chain never throws. The explicit-list form would CRASH on the roster-less e5/e6/e7 maps (`undefined.flatMap`), so the general form is strictly correct. Confirmed by the RUN (20/20).
- **No goal-tree leaf:** the three extra-maps masters were authored without a `tasks/goals.json` leaf, so there is nothing to flip at drain (GOAL REGISTRATION LAW has no target here). Noted, not fabricated.

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | green (built in ~1.05s) |
| `node --test scripts/e3-mask-tables.test.mjs` | **20/20 pass** (all e3–e10 incl. 9 new maps) |
| `board-gating-and-profiles.spec.ts` desktop-chrome + mobile-chrome | **2/2 pass** (13.3s); `expect(errors).toEqual([])` boot probe green both viewports |
| Screenshots | `artifacts/board-gating/{desktop,mobile}-chrome-*.png` (refreshed this run) |

## Aftermath
- lane/m3, lane/m4, lane/perf are now **false-ahead orphans** (content on main; `main..lane` non-empty because content was grafted, not branch-merged). They need a reset-to-main before any refill (LANE-SAFETY). Left for the next fire / attended (these lanes are attended-managed).
