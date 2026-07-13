# Review — e2-clarity-and-wreckers (lane-d #2)

- **Slice:** e2-clarity-and-wreckers (E2 Steamworks teaching + enemy identity + wrecker threat)
- **Branch/tip:** `lane/perf` @ `269f47ac` (runner auto-commit), base `cf006883` (STALE — pre `96d49eb4` run-cast-scale-up)
- **Drained by:** s458 fire, 2026-07-13, via TIP-GRAFT onto main `a0f04241`
- **Verdict:** ✅ MERGE — own spec 6/6 green both projects; adjacent reds fingerprint-matched identically to pre-existing main.

## What it does
Answers the owner's first E2 playtest ("I don't know what the boiler room is for" / "I don't know what these monsters are but they did not really do too much"). Adds: (1) a one-shot Boiler House teaching beat (`e2-boiler-house-teaching`, prospector, once-per-profile) fired on the boiler ledger page; (2) an enemy-name beat (`e2-enemy-name`, clerk, seen-keyed per entry) plus three Claim-Ledger entries — Rail Tough, Steam Wrecker, Coal Thief — each with a fiction line and a tactics line; (3) enemy-identity routing in `ledgerEnemyEntryId` via a new `variantId` field so the three E2 variants map to their own ledger pages instead of collapsing to `wrecker`/`outlaw`/`baron`; (4) wrecker threat tuning — the E2 hill-mine wrecker's `buildingDamageScale` 1.35 → 2.5 so ignoring one costs a building segment. Trio separation (scope item 3a) was verified ALREADY PRESENT on base enemies and applies to the E2 trio — no code change needed; the passing separation probe proves it.

## Merge classification — TIP-GRAFT (stale base)
`main..lane/perf` is NOT mergeable directly: lane/perf branches from `cf006883` (before run-cast-scale-up landed as `96d49eb4`), so a blind merge would REVERT run-cast (pools/Hero/GoldPickup/XpMote/Embodiment/runCastScale). Grafted the REAL `269f47ac^..269f47ac` delta only. Per-file:
| File | Class | Method |
|------|-------|--------|
| `src/encyclopedia/registry.ts` | LANE-TOUCHED (+23) | whole-file cp (main untouched vs cf006883 — verified empty `git diff cf006883..HEAD`) |
| `src/encyclopedia/state.ts` | LANE-TOUCHED (+2) | whole-file cp |
| `src/story/beats.ts` | LANE-TOUCHED (+17) | whole-file cp |
| `assets/contracts/epoch-2-steamworks/contracts.json` | LANE-TOUCHED (1 line) | whole-file cp |
| `e2e/e2-clarity-and-wreckers.spec.ts` | NEW (+82) | cp |
| `artifacts/e2-clarity-and-wreckers/{boiler-card,enemy-name-plate,separated-wreckers}.png` | NEW | cp |
Incidental stale-base screenshot regens (063/074/en-02 byte-diffs) were NOT grafted (out of scope, unrelated re-renders).

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | green (Game 527.00 kB / index 1177.31 kB, built 766ms) |
| own spec `e2-clarity-and-wreckers` | **6/6 PASS** (desktop-chrome 3/3 + mobile-chrome 3/3) — boiler teaches once/persists, E2 name plates + ledger pages, trio separates + tuned Wrecker damages a segment |
| boot / console | zero console/page errors (exercised by the 6 passing full-boot scenarios) |
| adjacent `en-02-e1-coverage` | green (in battery) |
| adjacent battery (ss/story/contract/tl) | 5 reds — **all fingerprint-matched to CLEAN main** |

## Findings
- **F-1 (non-blocking, PRE-EXISTING on main):** 5 adjacent specs fail identically with AND without the clarity graft — proven by reverting the 4 tracked files to `a0f04241` and re-running: same 5 fail, same errors. They are unrelated content/test drift on main, NOT introduced by clarity:
  - `contract-briefings:259` — briefing goals list carries an extra "Railhead Escort" line the fixture doesn't expect.
  - `contract-briefings:310` — `e2-hill-mine` board card `data-contract-locked` state mismatch (expected true, is false).
  - `ss-01-beats:103` — founding/first-contract/XP beat authoring drift.
  - `ss-03-beats:52` — SS-03 registered-speaker/once-per-profile table drift.
  - `tl-03b-ledger-stats-window:108` — assay-office "Busiest trail" expects "Steady Hands (30 assays)" but wire returns "E1 Dry Gulch (30 assays)".
  These are owed corrective tasks (separate from clarity); flagged to the pile — NOT a clarity regression, do not block this merge.
