# reviews/run3d-11-sentry-beacon.md

**Slice:** run3d-11-sentry-beacon — RUN-3D sentry-beacon pilot (registry sibling `sentry_beacon`)
**Branch/tip:** lane/m4 @ `93d574af` (runner(lane-b))
**Base:** `87296920` (s448 palisade drain — registry {palisade,sluice,turret,stockpile} + refactored body)
**Merged to main:** s450 fire, drain 1/2
**Verdict:** PASS — merged.

## What it does
Adds a fifth `?run3dPilot`-gated 3D building pilot: `sentry_beacon` (444 tri GLB, base-center origin, teal core). Registry-only wiring in `src/game/Run3dPilot.ts` (fallback `SentryBeaconPool`, groundPad 0.4); the shared load/instance/dispose body is unchanged. Pilot loads real GLB when `?run3dPilot=sentry_beacon|all`; flag-off / LITE / invalid-bytes retain the sprite fallback and request zero beacon GLB. Instance lifecycle mirrors the sim's `Balance.beacon.maxCount` (4) and unmounts on demolish. Not in a plain boot — infra pilot, no player-visible surface, no gazette.

## Evidence (in-gate, s450, main worktree)
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | green — Game 524.42 kB / index 1171.31 kB (Run3dPilot stays lazy chunk) |
| run3d battery single-worker (palisade+sentry-beacon+sluice+stockpile+turret) | **40/40 passed** (2.8m), desktop-chrome + mobile-chrome |
| sentry-beacon own spec | 8/8 (flag-off no-GLB · all mirrors+demolish · lite/invalid fallback · p95 budget) |
| adjacent run3d siblings | unmodified-green (palisade/sluice/stockpile/turret 8/8 each) |
| console/page errors | zero (flag-off boot asserted in spec) |
| p95 desktop | ratio 0.972 @4 inst (max legal) |
| p95 mobile-390 | ratio 1.017 @4 inst (max legal) — both < 1.15 budget |

Perf note: recipe's 12-instance probe unreachable (sim caps beacons at 4 via `Balance.beacon.maxCount`); slice firewall forbids changing sim capacity, so max-capacity (4) is the legal ceiling probed.

## Merge classification
- `src/game/Run3dPilot.ts` — **MAIN-MOVED-ONLY / registry union**: main == lane base (no main-side edit since `87296920`), so the single additive registry line (`sentry_beacon` after `stockpile`) applied cleanly via Edit; merged file byte-identical to `lane/m4:src/game/Run3dPilot.ts` (verified `git diff --no-index`, empty).
- `assets/pilots/run3d/sentry-beacon.{glb,blend}`, `e2e/run3d-sentry-beacon.spec.ts`, `artifacts/run3d-sentry-beacon/*` — **LANE-TOUCHED / all-new**, cp'd from worktrees/lane-b, no main-side collision.

## Findings
None blocking. F-1 (non-blocking): `SentryBeaconPool` fallback object may not exist in the scene graph; the update loop guards `if (fallback)` so absence is safe (no crash, sprite simply not hidden) — same pattern as prior run3d siblings. Application/visibility deferred to the beacon's own render slice, per the run3d pilot contract.
