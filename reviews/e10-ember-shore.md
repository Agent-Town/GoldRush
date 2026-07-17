# Review — e10-ember-shore contract + mask (drain)

**Slice:** lane-b-e10-ember-shore-contract · **Source branch/tip:** lane/m4 `5e86441518175e7d03bb585dcac130046f2bd411` (`runner(lane-b): lane-b-e10-ember-shore-contract.md`) · **Drained-onto:** main `9b421c85` (s708) · **Fire:** s708 2026-07-17

## Verdict
**MERGE — clean additive future-epoch data slice.** Surgical 4-file re-land (lane base `4180433c` was stale; lane touched only these 4 files, main had not touched any → 3-way is a no-conflict additive graft, done as a path-scoped checkout of the lane tip's version of each file).

## What it does
Populates the final run-tile contract for Epoch 10 (Deepsky), "The Ember Shore" — a preserve/hold tile (keep the last warm vent alight beneath a cooled titan machine; no river/ford/water). Adds the authored contract entry, its published mask-truth table (cooling lava-vein hazard bands + fixture zone + water-agreement), and extends the mask-table conformance test + the board-gating spec to cover e10. **Zero player surface:** E10 is a locked future era — the board gates it (asserts the card renders count 0), and there is no `e10-ember-shore` reference anywhere in `src/`, so no card is ever built in normal play. Same class as e9-dome-basin (drained s705): inert data feeding future-epoch mask/build work, display-safe now.

## Merge classification (per file, vs main `9b421c85`)
| File | Class | Resolution |
|------|-------|-----------|
| `assets/contracts/epoch-10-deepsky/contracts.json` | LANE-TOUCHED | main was `contracts: []`; lane adds the single `e10-ember-shore` entry → additive, no conflict |
| `assets/contracts/epoch-10-deepsky/mask-tables/e10-ember-shore.json` | LANE-TOUCHED (new) | absent on main → clean add |
| `e2e/board-gating-and-profiles.spec.ts` | LANE-TOUCHED | two-dot diff vs main = exactly `+1` line (e10 count-0 assertion after e9's) → additive |
| `scripts/e3-mask-tables.test.mjs` | LANE-TOUCHED | two-dot diff vs main = e10-only hunks (import, era map, contract spread, keys, bounds loop, e10 assertions) → additive |

All other files in the two-dot `main lane/m4` diff (STATUS, logs, artifacts/wire-landmark-mounts, assets/LEDGER, boss raws, tasks/queue/lane-c/*) are MAIN-MOVED-ONLY stale-base noise — the lane commit `5e864415` did not touch them (`git show --stat` = 4 files); NOT grafted.

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean (no output) |
| `npm run build` | ✓ built in 858ms |
| `node --test scripts/e3-mask-tables.test.mjs` | **11/11 pass** incl new `e10-ember-shore mask stays inside bounds and agrees with authored water` + the e10 keys/lavaVeinBands/fixtureZones/harvestAnchors assertions in "published mask tables exactly track authored contract data" |
| board-gating (`contract-card-e10-ember-shore` count 0) | proven **BY CONSTRUCTION** — `grep -rn e10-ember-shore src/` = empty → no card renders in a plain boot. Not run visually (Mistake #12: avoid contaminating attended's live board-gating/shot PNGs). |
| boot probe | N/A — inert data, nothing renders; no player surface to probe |
| `node --test scripts/goal-tracker.test.mjs` | 1 red = **pre-existing F-1** (`:17` category-count, actual 11 vs expected 5 categories) — orthogonal to this leaf; hash-format for the flipped leaf validated clean (test parsed goals.json past the leaf) |

## Goal registration
`tasks/goals.json` leaf `e10-ember-shore-contract` flipped `queued → merged`, `mergeHash: 5e86441518175e7d03bb585dcac130046f2bd411` (full 40-char, e9-convention = the re-landed source-lane commit) — same commit as the drain.

## Findings
None blocking. The E10 contract now completes the ten-era run-tile contract set at the data layer; wiring/rendering waits on its own future slice (unchanged).
