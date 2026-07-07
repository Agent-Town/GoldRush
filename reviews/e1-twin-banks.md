# Review — E1 Twin Banks contract (drain)

- **Slice:** E1 Twin Banks contract (`e1-twin-banks`)
- **Branch/tip:** lane/perf `607fbe3` "feat: add E1 Twin Banks contract"
- **Landed on main:** s138 merge commit (3-way onto clean main; parent 718aa00 = gt-02, content-merged)
- **Verdict:** ✅ SHIPPED — gated GREEN, tsc-before-trust clean.

## What it does
Adds the E1 **Twin Banks** roster contract: a split-homestead river claim with **two fords** (west `x=-16`, east `x=16`, halfWidth 3), **two build zones** (south/north banks), **one loss stake** (`south-claim-stake`, `lossCondition:true`) plus a non-loss **north expansion marker**, a single shared gold pool, and four spawn edges. New `ContractFord` / `ContractBuildZone` / `ContractStakeMarker` types in ContractFamilies; Terrain/Enemy/Water/props/Game/BuildSystem wiring so both banks are buildable and enemies route through both fords. Unlock: `firstSecuredClaim`.

## Evidence
| Gate | Result |
|------|--------|
| `tsc --noEmit` (post-merge, before trust) | clean |
| `npm run build` | green |
| `e2e/e1-twin-banks.spec.ts` | **10/10** desktop+mobile (46.7s) |
| adjacent: night-shift + dry-gulch + gt-02 + sci-04-contract-registry | **32/32** desktop+mobile (2.5m) |
| page/console errors | none |
| contracts.json parse | OK — ids `[the-claim, e1-dry-gulch, e1-night-shift, e1-twin-banks]` |

Twin-banks specs assert: two fords / two build zones / one loss stake load correctly; both banks build against one gold pool; enemies route both west & east fords; north marker is NOT the loss stake while south overrun still ends the run + four-edge waves; seeded diagnostics stable.

## Merge classification
- **Base:** `607fbe3`, parent `718aa00` (gt-02 slope, content-merged into main via 6e0bd8f) → merge-base is a clean main ancestor.
- **Auto-merged clean:** Enemy.ts, Balance.ts, Game.ts, BuildSystem.ts, vite-env.d.ts, Water.ts, props.ts.
- **Conflicts resolved:**
  - `assets/contracts/epoch-1-frontier/contracts.json` — HEAD had `e1-night-shift` in the last array slot, lane had `e1-twin-banks` (lane branched before night-shift landed). Kept **BOTH** as separate array entries.
  - `src/meta/ContractFamilies.ts` — kept HEAD's `ContractLightRamp` (night-shift) **and** added lane's `ContractFord`/`ContractBuildZone`/`ContractStakeMarker` (twin-banks).
  - `src/world/Terrain.ts` — kept lane's superset import (adds `ContractStakeMarker`).
  - gt-02 / e1-dry-gulch artifact add/add — kept `--ours` (already drained on main).
- **F-S137-1 discipline applied:** ran `tsc` BEFORE trusting the textually-clean 3-way — clean, no semantic break.

## Findings
- **F-S138-1 (context, non-blocking):** main's `371aba8` ("051 + gt-02b + gt-03") committed **only task-master files + a review doc, zero src** — a Mistake #16 message/completion mismatch. None of 051/gt-02b/gt-03/twin-banks code was on main before this fire; all were genuinely unmerged. Recorded so no future fire treats `371aba8` as a code drain.
