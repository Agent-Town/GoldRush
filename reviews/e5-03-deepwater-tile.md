# reviews/e5-03-deepwater-tile.md

- **Slice:** e5-03-deepwater-tile (lane-c; "feat:") — the Claim-Boat sails
- **Branch/tip:** lane/e2-arsenal @ fb1da42d (runner(lane-c) commit)
- **Base:** 270a96af; **Merge commit:** bb3b60b1
- **Verdict:** ✅ SHIPPED — future-era (E5) content, inert in plain boot, full gate green + regression-proven.

## What it does
Lands the E5 Deepwater claim: a new `e5-deepwater-claim` contract + `DeepwaterClaimTile` (`src/world/DeepwaterClaimTile.ts`). Water regions with depth classes, the Claim-Boat as the base (anchor pads, not land pads), storms ARE the wave scheduler (`StormWaveScheduler`), and corsair-skiff waves = vehicle-class enemies reusing the e4-hauler chassis with placeholder art. Game.ts wires it: when the Deepwater claim is active, building placement routes through boat pads (`placeBoatBuilding`/`reanchorClaimBoat`) and land placement / free-place / beacon / confirm are suppressed; corsair waves spawn from storm cycles and recycle at the water's far edge; snapshot feeds diagnostics; reset clears it.

## Why it's safe in the current game
`createDeepwaterClaimTile(contract)` returns a tile **only** when `contract.id === 'e5-deepwater-claim'`, else `null`. Every Game.ts gate is `if (this.deepwaterClaim) …` / `!this.deepwaterClaim && …`, so in E1–E4 (`deepwaterClaim === null`) all normal building/placement behaves exactly as before. E5 is a future board-gated era, absent from a plain boot → this slice is **inert until Deepwater arms** (same posture as e6/e7 chart registrations). Hence **no gazette item** (not yet player-reachable).

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean (exit 0) |
| `npm run build` | ✓ built in 615ms |
| `e5-deepwater-claim.spec.ts` (new) | pass ×2 projects — deck pads + depth gates + storm-scheduled corsair wave; deterministic replay of boat placement + two storm cycles |
| `task-025-bandits-dont-swim` (**build/placement regression guard**) | green ×2 — normal placement, sluice, waves-not-in-deep-water all intact |
| `m2-01-build-menu` (**build menu regression guard**) | green ×2 — menu places palisade, footprint reject, beacon curve, 390px visible, <200 draw calls |
| `m1-01-claim-jumpers-death` | green ×2 — spawn/death/restart, pool budget |
| Combined | **36/36 passed (3.3m)**, desktop-chrome + mobile-chrome |
| Determinism | runner artifacts `desktop/mobile-chrome-determinism.json` + tile-state |

The regression guards are the key evidence: building still works in E1 despite the gates — no Mistake #10 (invisible-in-normal-play) regression.

## Merge classification (base 270a96af)
| File | Class | Resolution |
|------|-------|-----------|
| `src/world/DeepwaterClaimTile.ts` | NEW | free |
| `e2e/e5-deepwater-claim.spec.ts` | NEW | free |
| `assets/contracts/epoch-5-deepwater/mask-tables/e5-deepwater-claim.json` | NEW | free (masks-first law) |
| `artifacts/e5-deepwater-claim/*` (4 json) | NEW | free |
| `assets/contracts/epoch-5-deepwater/contracts.json` | LANE-TOUCHED | clean (main untouched since base) |
| `src/game/Game.ts` | LANE-TOUCHED | clean (main untouched since base; all hunks gated behind deepwaterClaim) |
| `src/vite-env.d.ts` | ADDITIVE | clean — +deepwaterClaim diagnostics type + 2 window methods, deepwater-only, no stray hunks |

## Findings
- No blocking findings. Firewall honored: no engine internals beyond the spike's API (reuses `enemies.spawn/recycle`, `waveSystem` gate, `activeContract.twist.enemyRoster`).
- Corsair art is placeholder per scope (vehicle chassis reuse); real skiff art rides a later art batch.
- e5-maps goal leaf flipped building→merged (`bb3b60b1`) per the registration law.
