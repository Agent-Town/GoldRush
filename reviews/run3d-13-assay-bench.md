# reviews/run3d-13-assay-bench.md

**Slice:** run3d-13-assay-bench — RUN-3D assay-bench pilot (registry sibling `assay_office`) — RUN-3D ladder rung 13
**Branch/tip:** lane/m4 @ `8a275b97` (runner(lane-b): run3d-13-assay-bench.md, committed 05:16)
**Base:** main @ s450 registry state (6-entry {boiler_house,palisade,sluice,turret,stockpile,sentry_beacon}); grafted onto s451 post-lantern main (7-entry)
**Merged to main:** s451 fire, drain 2/2
**Verdict:** PASS — merged (tip-graft: cp additive files + Edit registry union + fallback-helper refactor union).

## What it does
Adds the `assay_office` `?run3dPilot`-gated 3D building pilot (292 tri GLB, one mesh/primitive/material, one embedded 512×512 image, base-center origin, 1.84×1.24 footprint inside the 2×1.5 placement footprint, 1.23m tall). Source painting `assets/processed/bld-claim-office.png` (matches the existing Assay Office fallback). Registry entry in `src/game/Run3dPilot.ts` (fallback `AssayOfficeTimberShell`, groundPad 1). Because the Assay Office sprite shell is a **nested** object (the fallback name resolves to a child), the slice adds a small shared helper `fallback(host, id)` that special-cases `assay_office` to hide/show `object.parent` and rewrites the 3 shared visibility call sites (ready / update / dispose) to use it — behavior-identical for all 6 siblings (helper returns the same object for every non-`assay_office` id; the 64/64 battery confirms no sibling regression). The 3D swap is visual-only: the existing **Enter interaction still opens the Assay Bench** (asserted in the spec). Flag-off / LITE / invalid-bytes retain the sprite shell and request zero assay GLB. Infra pilot, not in plain boot, no gazette.

## Evidence (in-gate, s451, main worktree)
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | green — Game 524.42 kB / index 1171.31 kB (Run3dPilot stays lazy chunk; boot bytes unchanged) |
| run3d battery single-worker (assay-bench + lantern-post + boiler-house + palisade + sentry-beacon + sluice + stockpile + turret) | **64/64 passed** (4.5m), desktop-chrome + mobile-chrome |
| assay-bench own spec | 8/8 (flag-off no-GLB · loads-once/mirror/demolish-unmount · lite+invalid fallback · Enter-opens-interaction · p95 budget), both projects |
| adjacent run3d siblings | unmodified-green (lantern-post + 6 originals 8/8 each — shared `fallback()` refactor caused zero sibling regression) |
| console/page errors | zero (asserted inside every run3d spec) |
| p95 desktop | ratio 1.0119 @1 inst (max legal — `maxCount` 1) |
| p95 mobile-390 | ratio 1.0237 @1 inst (max legal) — both < 1.15 budget |

Perf note: the RUN-RECIPE R8 12-instance probe is unreachable — the sim permits exactly one Assay Office (`maxCount: 1`), and the slice firewall forbids sim-capacity writes, so the max-legal ceiling (1 instance) is the honest probe (same class of note as run3d-12 boiler-house's 3-cap). Re-export SHA-256 `08ff6640…d29647` byte-matches the shipped GLB.

## Merge classification
- `src/game/Run3dPilot.ts` — **MAIN-MOVED / registry union + shared refactor**: lane base (6-entry registry, inline `getObjectByName` at 3 sites) vs s451 main (7-entry incl. `lantern_post` + a lantern rotation line). Lane added `assay_office` at registry top + a `fallback()` helper + rewrote the 3 visibility call sites. Grafted onto current main via 5 Edits: (1) assay_office registry line; (2) `fallback()` helper after `publish()`; (3-5) the 3 call sites → helper. **My lantern_post entry + rotation line are preserved** (different regions — registry union is disjoint; the rotation line sits after `instance.position.set`, untouched by the fallback-visibility refactor). Final 8-entry registry {assay_office, boiler_house, lantern_post, palisade, sluice, turret, stockpile, sentry_beacon}; only 1 residual `getObjectByName(registry` (inside the helper) — all sites refactored. Verified: 8 entries, lantern rotation present, 64/64 green.
- `assets/pilots/run3d/assay-bench.{glb,blend}`, `e2e/run3d-assay-bench.spec.ts`, `artifacts/run3d-assay-bench/*` (12 files) — **LANE-TOUCHED / all-new**, cp'd from worktrees/lane-b; glb + spec byte-identical (`cmp`), no main-side collision.
- Lane-behind noise NOT carried: lane/m4 branched before the lantern drain, so its diff vs current main falsely shows lantern-post files + reviews/run3d-14 as "deletions" — ignored; only the runner-commit `8a275b97` additive content was grafted.

## Findings
None blocking. F-1 (non-blocking): the `fallback()` helper widens a shared code path to special-case one sibling; kept minimal and proven regression-free by the full-battery green. F-2 (non-blocking): assay application/visibility beyond the sprite-hide follows the run3d pilot contract (flag-gated infra; the crafting interaction is preserved, asserted in-spec).

## Ladder note
run3d-13 + run3d-14 (s451) close the **RUN-3D ladder (07..14)** — all 8 building pilots {sluice, palisade, turret, stockpile, boiler_house, sentry_beacon, lantern_post, assay_office} now on main, `?run3dPilot`-gated. Next owner-ordered work is the town3d building arm ("do all the houses") — verify which town3d-0X masters are unbuilt-on-main before queueing (town3d-05+15 are the undrained lane/perf attended untangle — leave).
