# Review — e3-fairground mask table (publish the last unmasked map)

**Slice:** publish-e3-fairground-mask-table (lane-d, data extraction)
**Branch/tip:** lane/perf @ `cb6331bc` (runner auto-commit) → merged to main `fc04c21b8354bc139494f231917cf37cf8be3f82`
**Base:** `84b1c15f` (clean; only my s658 STATUS lock `540f7b71` moved main since)
**Drained:** s658 fire, 2026-07-16
**Verdict:** ✅ SHIPPED — clean merge, gates green, slice test 6/6.

## What it does (one paragraph)
Publishes `assets/contracts/epoch-3-voltage/mask-tables/e3-fairground.json` — the sculptor's manifest for e3-fairground, the ONE remaining unmasked playable contract (map-coverage audit: 15 playable / 14 masked before this). The table extracts from the SHIPPED e3-fairground `tileParams` (88×88, no river/ford, south-midway + west-pavilion build zones, spawn lanes, water truth = dry) into the exact key-for-key schema of its e3 siblings (moth-season / canyon-works), so Sol's 3D-D verifier can gate the pre-granted fairground sculpt on mask equality. Also extends `scripts/e3-mask-tables.test.mjs` with an e3-fairground case asserting every coordinate falls inside the 88×88 tile bounds and the water truth matches the contract (no water). No src, no e2e, no runtime rendering touched — application stays unwired until the sculpt slice; this is display-safe data. **15/15 contracts now masked; 3D-D fairground sculpt UNBLOCKED.**

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean (TSC_CLEAN) |
| `npm run build` | ✓ built in 913ms, no errors |
| `node --test scripts/e3-mask-tables.test.mjs` | **6/6 pass, 0 fail** (incl. new `e3-fairground mask stays inside bounds and agrees with authored water`) |
| Adjacent playwright suites | UNAFFECTED — diff is json + node-test + BACKLOG only; no src/e2e/render change, no boot-visible change (masks feed Sol's verifier, application unwired) |
| Boot probe / perf | N/A — nothing renders from this data at runtime |

## Merge classification (base `84b1c15f`)
| File | Class | Resolution |
|------|-------|-----------|
| `assets/contracts/epoch-3-voltage/mask-tables/e3-fairground.json` | NEW | free (create) |
| `scripts/e3-mask-tables.test.mjs` | LANE-TOUCHED only | clean — main untouched since base (my lock touched only STATUS.md) |
| `tasks/BACKLOG.md` | LANE-TOUCHED only | clean — additive ledger line |

`git merge --no-ff lane/perf` → ort strategy, zero conflicts. 3 files, +116/-2.

## Findings
- **F-1 (non-blocking, PRE-EXISTING on main — NOT this slice):** `scripts/goal-tracker.test.mjs:17-18` hardcodes an expected top-level category list of 5 titles, but `tasks/goals.json` carries **11** categories as of `84b1c15f` (attended expanded the goal tree in `0778b6f1`/`84b1c15f` — added Art / Laws / Story / Multiplayer / Charter Press / Foundry). Proven pre-existing: `git show 84b1c15f:tasks/goals.json` → 11 categories, so the test was already red on main *before* this drain. This slice neither caused nor worsened it (no top-level category touched; my `world-e3-fairground-mask` leaf carries a valid 40-char `mergeHash`, and it is not in the test's hash-sample set at :56-60). **Fix owed (attended or a fire, <10 lines):** update the expected-titles array at `goal-tracker.test.mjs:18` from the 5-title list to the current 11. Flagged on OWNER'S DESK / next-fire.
- **F-2 (informational):** GOAL REGISTRATION LAW satisfied — `tasks/goals.json` leaf `world-e3-fairground-mask` flipped `queued → merged` with full hash `fc04c21b8354bc139494f231917cf37cf8be3f82` in the drain commit.
- **GZ filter:** no player-visible change (mask data feeds the sculpt pipeline, application unwired) → **no gazette item.**
