# reviews/run3d-12-boiler-house.md

**Slice:** run3d-12-boiler-house — RUN-3D boiler-house pilot (registry sibling `boiler_house`)
**Branch/tip:** lane/e2-arsenal @ `15573f12` (runner(lane-c))
**Base:** `83d541db` (s448 handoff — registry {palisade,sluice,turret,stockpile})
**Merged to main:** s450 fire, drain 2/2
**Verdict:** PASS — merged.

## What it does
Adds a sixth `?run3dPilot`-gated 3D building pilot: `boiler_house` (508 tri GLB, base-centered inside the existing 2×2 footprint, 2.26m tall — 7.8% below the established 2.45m steam-plume silhouette). Registry-only wiring in `src/game/Run3dPilot.ts` (fallback `BoilerHousePool`, groundPad 1.1); shared body unchanged. Loads real GLB on `?run3dPilot=boiler_house|all`; flag-off / LITE / invalid-bytes retain the sprite fallback and request zero boiler GLB. Lifecycle mirrors `Balance.boilerHouse.maxCount` (3) and unmounts on demolish. Infra pilot, not in plain boot, no gazette.

## Evidence (in-gate, s450, main worktree)
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | green — Game 524.42 kB / index 1171.31 kB (Run3dPilot stays lazy chunk) |
| run3d battery single-worker (palisade+boiler-house+sentry-beacon+sluice+stockpile+turret) | **48/48 passed** (3.1m), desktop-chrome + mobile-chrome |
| boiler-house own spec | 8/8 (flag-off no-GLB · all mirrors+demolish · lite/invalid fallback · p95 budget) |
| adjacent run3d siblings | unmodified-green (palisade/sentry-beacon/sluice/stockpile/turret 8/8 each) |
| console/page errors | zero (flag-off boot asserted in spec) |
| p95 desktop | ratio 0.957 @3 inst (max legal) |
| p95 mobile-390 | ratio 0.968 @3 inst (max legal) — both < 1.15 budget |

Perf note: recipe's 12-instance probe unreachable (`Balance.boilerHouse.maxCount` = 3); slice firewall forbids changing sim capacity, so max-capacity (3) is the legal ceiling probed. Re-export SHA-256 `b253cf0e…413a2` byte-matches shipped GLB.

## Merge classification
- `src/game/Run3dPilot.ts` — **MAIN-MOVED / registry union**: lane base (83d541db, 4 entries) vs main (post-drain-1, 5 entries incl. `sentry_beacon`). Both sides added a distinct registry line at different positions (boiler at top; sentry after stockpile). Resolved by adding boiler's single line via Edit onto main's current 5-entry registry ⇒ final 6-entry union {boiler_house, palisade, sluice, turret, stockpile, sentry_beacon}. No content overlap, no logic change.
- `assets/pilots/run3d/boiler-house.{glb,blend}`, `e2e/run3d-boiler-house.spec.ts`, `artifacts/run3d-boiler-house/*` — **LANE-TOUCHED / all-new**, cp'd from worktrees/lane-c, no main-side collision.

## Findings
None blocking. F-1 (non-blocking): `BoilerHousePool` fallback object may not exist in the scene graph; `if (fallback)` guard makes absence safe (no crash). Application/visibility deferred to the boiler's own render slice per run3d pilot contract.
