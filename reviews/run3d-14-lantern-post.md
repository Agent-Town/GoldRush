# reviews/run3d-14-lantern-post.md

**Slice:** run3d-14-lantern-post — RUN-3D lantern-post pilot (registry sibling `lantern_post`) — RUN-3D ladder rung 14 (final)
**Branch/tip:** lane/m3 @ `347f30fc` (runner(lane-a): run3d-14-lantern-post.md, committed 05:13)
**Base:** main @ `a5f17b33`-descendant (s450 handoff — registry 6-entry {boiler_house,palisade,sluice,turret,stockpile,sentry_beacon})
**Merged to main:** s451 fire, drain 1/1
**Verdict:** PASS — merged (tip-graft: cp additive files + Edit registry+rotation union).

## What it does
Adds a seventh `?run3dPilot`-gated 3D building pilot: `lantern_post` (284 tri GLB, one primitive/material, one embedded 512×512 image, base-center origin, 0.82w × 0.36d × 1.38h — the night-shift build item). Registry entry in `src/game/Run3dPilot.ts` (fallback `LanternPostPool`, groundPad 0.4) **plus** one rotation line: `lantern_post` instances read authored quarter-turn rotations from `diagnostics.lanternPostRotations[entry.index]` (field already present on main's `BuildDiagnostics`, populated from `this.lanternPosts.activeRotations` in BuildSystem — no sim/type write on the lane). Loads real GLB on `?run3dPilot=lantern_post|all`; flag-off / LITE / invalid-bytes retain the existing lantern sprite renderer and request zero lantern GLB. Lifecycle mirrors instances and unmounts a demolished post. No emissive channel / lights / cameras baked (light-pool behavior belongs to the light rig per RUN-RECIPE, not the model). Infra pilot, not in plain boot, no gazette.

## Evidence (in-gate, s451, main worktree)
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | green — Game 524.42 kB / index 1171.31 kB (Run3dPilot stays lazy 3.70 kB chunk; boot bytes unchanged) |
| run3d battery single-worker (lantern-post + boiler-house + palisade + sentry-beacon + sluice + stockpile + turret) | **56/56 passed** (3.9m), desktop-chrome + mobile-chrome |
| lantern-post own spec | 8/8 (flag-off no-GLB · all loads-once/mirrors/demolish-unmount · lite+invalid fallback · 15-instance p95 budget), both projects |
| adjacent run3d siblings | unmodified-green (boiler-house/palisade/sentry-beacon/sluice/stockpile/turret 8/8 each) |
| console/page errors | zero (asserted inside every run3d spec, flag-off + flagged) |
| p95 desktop | ratio 1.1469 @15 inst (< 1.15 budget) |
| p95 mobile-390 | ratio 1.1256 @15 inst (< 1.15 budget) |

Perf note: p95 ratios sit tighter to the 1.15 ceiling than the earlier siblings (1.147 desk / 1.126 mob) but both pass single-worker; the 15-instance probe exceeds the RUN-RECIPE R8 12+ floor. Re-export byte-identical + semantic-identical per `model-contract.json`.

## Merge classification
- `src/game/Run3dPilot.ts` — **MAIN-MOVED / registry+rotation union**: lane base (post-SAFE-DUPE reset to main's 6-entry registry) added `lantern_post` after `boiler_house` and one rotation-application line before the `palisade` branch. Main unchanged since s450. Applied both hunks via Edit onto main ⇒ final 7-entry union {boiler_house, **lantern_post**, palisade, sluice, turret, stockpile, sentry_beacon}. Working tree confirmed byte-identical to `lane/m3:src/game/Run3dPilot.ts` (empty `git diff`). No content overlap with siblings, no logic change beyond the additive lantern rotation.
- `assets/pilots/run3d/lantern-post.{glb,blend}`, `e2e/run3d-lantern-post.spec.ts`, `artifacts/run3d-lantern-post/*` (12 files) — **LANE-TOUCHED / all-new**, cp'd from worktrees/lane-a; glb byte-identical (`cmp`), no main-side collision.
- STATUS.md lane diff (lane's stale copy vs main's newer line-1) — **NOT carried**; STATUS belongs to the lock holder.

## Findings
None blocking. F-1 (non-blocking): `LanternPostPool` fallback and lantern application/visibility remain deferred to the lantern's own render slice per the run3d pilot contract (flag-gated infra; safe in plain boot). F-2 (non-blocking, art note): `assets/processed/` had no lantern-post plate and `assets/LEDGER.md` marks its processing pending, so the approved raw painting was resized in-memory to 512px and packed into the GLB directly — no out-of-firewall processed asset added; a later processed-plate pass can re-bake if desired.

## Ladder note
run3d-14 is the FINAL rung of the RUN-3D ladder (07..14). With this merge all 8 run3d building pilots are on main (7 siblings here + this). run3d-13-assay-bench (lane-b, lane/m4) was still running at s451 drain time — the next fire drains it as it lands a lane commit; that closes the ladder.
