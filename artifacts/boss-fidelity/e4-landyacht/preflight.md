# Epoch 4 Land Yacht — read-only preflight

2026-09-08. Scope: the `land_yacht` final boss on `e4-dust-flats`. No production source, assets, existing tests, or historical screenshots changed. The existing scratch Vite server at port 5246 remains running.

**The largest immediate improvement is to replace the overlapping raw-plate crops with the existing GLB, then improve its hull and machinery. A proxy-layout defect must be resolved before accepting a rigid 3D mount.**

## Current presentation and measured constraint

`src/systems/LandYachtBossSystem.ts:11–18,70–96,313–350` builds six component sprites from the intact/damaged 1672×941 RGB plates, plus a full damaged-plate wreck. These are opaque rectangles with crop UVs, not extracted game sprites. The group is explicitly named `LandYacht.PlaceholderPlateCrops`. Each live component independently positions its crop; half HP switches to its damage crop, death hides it, and the final act shows the full wreck. There is no GLB loader, mesh/morph guard, tier policy, or async-load lifecycle in this system.

Fresh desktop 1280×800 and mobile 390×844 evidence is in `before/`: both full screenshots show the overlapping parchment rectangles clearly, with unobscured bosses. Both contexts recorded **zero console/page errors and zero Land Yacht GLB requests**. The `*-props.png` files are exact extractions from their full PNGs; JSON records crop coordinates, hashes, pixel equality, camera, sprites, simulation samples, and source hashes. These are fresh captures, unlike the historical `artifacts/e4-landyacht-boss/` shots.

The live targets cannot currently support distinct zones over the 9.4-unit hull:

| XZ distance after 0.6 seconds on the installed orbit | Desktop and mobile |
|---|---:|
| Wheels → crane | 0.837758 |
| Wheels → wheelhouse | 0.418879 |
| Crane → wheelhouse | 1.256637 |
| Each component hit radius | 0.9 |

All three target disks overlap. The same distances remain at the 3- and 6-second samples. The contract declares offsets 0/3.5/7 (`assets/contracts/epoch-4-motor/contracts.json:115–119`), but `LandYachtBossSystem.ts:257–270` creates same-radius routes from each component's start angle. The default collinear west-side spawn gives identical angles. `Enemy.ts:867–882` starts at waypoint 1, so the actors merge onto nearly the same path; `Enemy.ts:1237–1247` reverses the route at its endpoint. The problem is observable before any new asset is mounted.

Do not conceal this by shrinking the hull, stretching parts, or moving only the visible components away from their hit targets. A coordinated decision on component formation is needed. The existing mechanics vocabulary explicitly describes the current route: `src/agent/MechanicsManifest.ts:328–339` and the exact assertion in `e2e/er01-e4-census.spec.ts:72–86`. Any movement repair must keep that manifest truthful and receive gameplay regression coverage; it is beyond this read-only pass.

### Existing route-offset option: bounded candidate, with limits

**Yes, the existing `Enemy.scriptMoveRoute` `offsetX`/`offsetZ` options can retain the intended relative spawn offsets on this contract without changing the 25 generated points, the per-component `atan2` expression, or `radius*angularSpeed`.** `WaveSystem.ts:937–941` already uses those options for the initial route. At first installation, take the spawn centroid and each component's delta from it: `(-3.5,0)`, `(0,0)`, `(+3.5,0)`. Generate each route exactly as now, then supply those constant world-space deltas to the existing route API. All three start angles are π; the saved baseline confirms their complete 25-point arrays are identical. Thus every target displacement becomes the same vector and the actors retain 3.5/3.5/7 spacing. The formation centroid follows the radius-24 ring; each component follows a translated copy of it. This is a static assessment, not an implemented or browser-tested correction.

That preserves the currently asserted calculations; it changes the actual component paths and must be described as an intentional formation repair. The source rule's center/radius then describe the formation's nominal orbit, not three coincident proxy circles. Do not rewrite the existing census assertion merely to make it pass.

The visual implication is **fixed world orientation while translating around the ring**. The relative target vector stays on world X, so turning the GLB tangent to velocity—or flipping it at reversal—would exchange the visible zones relative to their proxies. Current authored prow is local −X and wheelhouse is +X (`build_land_yacht.py:65–70,138–153`); yaw must be chosen from the accepted component fit and held fixed. This will visibly travel sideways through parts of the circle. A vehicle that continuously steers around the ring needs rotating formation offsets and synchronized motion, a larger gameplay change. Even the fixed-orientation option needs actual geometry-to-proxy calibration: preserving 3.5 spacing does not automatically align this existing model's pivot locations.

Limits: the proof depends on this contract's collinear spawn and common start angle. A full reload mid-orbit would supply different per-component angles. `RunSuspend.ts:92–95,597–599,786–809` has no Land Yacht system snapshot/reset/restore, although it restores individual enemy routes; a fresh system can reinstall them on its first live tick. The formation proposal must therefore test fresh-load resume and avoid assuming the initial spawn geometry can always be recovered from current positions. Same-page fixture restoration retains the current Land Yacht system and does not exercise that fresh-load case. No save or route code was changed here.

## Reusable asset and fidelity priorities

`assets/pilots/land-yacht-3d/land-yacht.glb` matches its saved receipt: SHA-256 `902191310b8cf604a1196902696ff14de78811f81bb30dd4bb5a3011f5ce7a01`.

| Node | Triangles | Existing single morph |
|---|---:|---|
| `wheels` | 6,520 | `Damage_BeachedWheels` |
| `crane` | 1,584 | `Damage_SlackCrane` |
| `wheelhouse` | 2,528 | `Damage_CrackedWheelhouse` |

Total **10,632 triangles**, one embedded 1024² atlas/material, no animations/lights/cameras. Base-center origin; Three.js XYZ dimensions **9.4 × 6.76943 × 4.732414**. Material is double-sided, metallic 0, roughness 0.9, without emission. The verifier requires exact names/morphs/identity transforms and one material/image, but allows up to 12,000 triangles (`verify_land_yacht.py:94–119`). Preserve the normalized-space morph-pivot calculations when changing proportions.

The accepted intact art is `assets/raw/boss-land-yacht.png` (identical to `plate-e4-boss-land-yacht.png`); the damage pair is a modeling reference, not a pixel-swap texture (`assets/LEDGER.md:223,349`). Priorities identified from those plates and the saved model renders:

1. Deep barge hull, curved prow, and raised deck: current shallow keel is the largest silhouette mismatch (`build_land_yacht.py:62–70`).
2. Layered cabin decks, glazing frames, roof rail, and wheel emblem: current boxes/drumhouse flatten the ship architecture (`:138–177`).
3. Broader segmented armor wheels while retaining six wheels in two banks (`:39–54,76–80`).
4. A clearly suspended cargo claw with curved fingers and cable separation (`:118–128`).
5. Local damage—buckled wheels/hull, slack cable, cracked glazing—rather than whole-assembly tilts and rectangular debris (`:199–249`).

Canon is explicit: six-wheel fortress, barge hull, amidships stack, cargo crane, captain's wheelhouse; wheels must read as the first target (`specs/epoch-saga/e4-motor-bundle.md:35`). Keep warm hazy ochres, riveted metal/brass, restrained teal, pale exhaust, and legibility through 20% haze. The crew walks away; the machine becomes salvage.

The saved “run camera” render is not reliable gameplay-camera proof: `render_land_yacht.py:107–109` uses Blender `(0,26.2,18.3)` while claiming Y-up→Z-up conversion. Fresh runtime evidence confirms the Three camera offset is `(0,26.2,18.3)` (`Balance.ts:926`, `CameraRig.ts:96–100`), so the Blender view must actually convert axes before comparison.

## Smallest implementation route and invariants

- Keep presentation owned by `LandYachtBossSystem`, using `createGltfLoader` (`src/assets/AssetLoading.ts:9`) and the existing `disposeObject3D` utility. Reuse the local lazy-load/serial/guard/fallback pattern already established for component bosses; no new abstraction or dynamic lights are needed. Existing crops can remain the load-failure/lite fallback initially.
- Settle the formation/proxy contract, then calibrate one body anchor, yaw, terrain height, scale, and component locations through entry, a full orbit, route reversal, beached act, and last-component deaths. Adding the asset alone does not solve the measured overlap. The current generic HP bar uses height `1.5*visualScale+0.95`, only 3.2 units here (`pools.ts:52,1195–1214`); the 6.77-high model needs a verified head clearance seam.
- Preserve half-HP damage switching and all death latches, keeping a recognizable damaged machine through the salvage act. Preserve delayed-load/reset/dispose behavior and wreck restoration. `Game.ts:3015–3019` reconstructs the wreck from `baronStandardPosition`; no saved wreck yaw is supplied. Choose and test a stable restoration pose rather than assuming orientation is persisted.
- Keep the four derrick markers and dread cue. Wheels alone beach the boss; crane alone controls grabs; all three deaths permit salvage (`LandYachtBossSystem.ts:118–165,234–252,280–311`). The callbacks at `Game.ts:1087–1106` preserve escort spawning and route turret destruction through CombatSystem. Do not move damage ownership into the renderer.
- Preserve the watchtower-gated warning two waves early, four stolen heads funding escorts, six-unit crane reach, crew/bell departure, and persistent wreck. The Hauler must reach the railhead before this boss falls (`contracts.json:76`). The dread/freed-hands/Gazette story signals and art-key binding remain unchanged (`src/story/beats.ts:703–741`).

## Verification entry points

The read-only evidence command just executed is:

```sh
node artifacts/boss-fidelity/e4-landyacht/probe-runtime.mjs
```

It uses the existing debug fixture in isolated browser contexts and writes only this artifact directory. The actual Game-module URL is observed before navigation; the temporary instance probe exists only inside those pages. It does not add production debug hooks.

Existing gates to run after an authorized implementation (not run in this preflight):

```sh
GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5246 npx playwright test e2e/e4-landyacht-boss.spec.ts e2e/er01-e4-census.spec.ts --workers=1
GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5246 npx playwright test e2e/ss-05-e4-beats.spec.ts --grep 'Land-Yacht dread' --workers=1
```

The existing two boss tests cover acts, warning/no-warning, loot, crane reach, and alternate death order; they do **not** cover GLB mounting, proxy fit, morph bindings, lite/failure, disposal, or draw costs. Add a focused check for those gaps and both viewports, plus exact full-shot crops for intact, beached, crane/wheelhouse damage, and restored wreck. If movement changes, broaden gameplay testing rather than treating this as an asset-only patch. Bank and restore historical screenshot outputs written by existing tests.

The documented Blender build/verify/render commands are in `assets/pilots/land-yacht-3d/README.md:13–15`. They overwrite the served asset or saved evidence, so use an isolated candidate and bank receipts first; none were run during this preflight.

## Turning formation — bounded design conclusion

This supersedes the fixed-orientation candidate above as the preferred final presentation. **Use synchronized, rotated copies of the existing 25-point route, with formation established before the first enemy movement.** Retain the wheels' nominal ring and speed; convert the declared 0/3.5/7 longitudinal offsets to angular offsets `delta = -offset/radius`, so the other zones trail the wheels. Rotate both each initial position and its entire route around the declared center. All entry vectors and subsequent edge lengths then match under rotation, including automatic reversal. No new movement abstraction is required.

Entry is essential: merely shifting the route phases while retaining the collinear spawn positions fails. Independent replay of the exact `moveScripted` snap/discard/reverse rules produced different arrival and reversal times and more than 12 units of separation. With rotated entry, an 80,000-step replay at 60 Hz instead held all route indices and 111 reversals synchronized, maximum rotational-position error `4e-14`; ordinary 30/120 Hz and shared variable steps also passed. These are mathematical replays, not game implementation tests.

For the cleanest entry, form at the radius-24 route start before the first `Enemy.update`; this explicitly moves the wheels' initial center two units inward from the generic radius-26 spawn. Keeping the original wheels' radius-26 entry is also rotationally synchronized, but temporarily stretches the 7-unit zone span to 7.556. On the polygonal orbit it is 6.916–6.975, with approximately 0.255 radial deviation of the middle zone from a straight body axis. The offsets become distances along the nominal ring; they are not exactly Euclidean distances between rigid slots. The existing 0.9 hit radius leaves room for a rigid visual hull to fit those differences, but actual mesh-zone overlap must prove that fit. Do not scale the body each tick to chase them.

Derive visual fore/aft from the ordered zone positions or the unwrapped radial phase plus the known component offset. Do not derive it from signed velocity: the existing route reverses, and a 180° visual flip would swap the hull ends. The hull naturally turns around the ring and backs around it after reversal. Pin that same pose when wheels die; infer it from a surviving zone and its known phase if earlier components are gone.

The alternative of one wheels-led route plus `scriptMoveTo` followers needs more correction logic: this system updates before enemy integration (`Game.ts:3019,3087`), followers lag a tick, and tangent-offset followers need different speeds while turning. Velocity-based orientation also demands a special reversal rule. It is larger than synchronized rotated routes and should not be the first implementation.

**Existing census changes required: none, if entry formation precedes the existing per-component angle calculation.** Each start angle remains exactly `atan2(component.z-centerZ,component.x-centerX)` at installation, and the same 25 points, center, radius, angular speed, speed formula, first-live-tick trigger, and terrain policy remain true. `e2e/er01-e4-census.spec.ts:72–86` and its current manifest object can remain unchanged. The 0/3.5/7 contract values also remain unchanged. If implementation instead folds the phase into a wheels-based start-angle expression, only then must that expression's manifest description and corresponding exact assertion change. Add focused formation assertions; do not weaken the existing ones.

Fresh-load formation can reuse already serialized enemy positions, routes, route indices, and speeds (`Enemy.ts:112–120,516–523,574–580`). Adopt compatible restored routes instead of regenerating them from current positions. Distinguish initial two-point spawn routes from the installed 25-point formation, and validate the saved relative phases; old overlapping 25-point routes are not a valid new formation. Never respawn or reposition missing/dead zones while restoring. **Complete encounter resume additionally needs the irrecoverable Land Yacht counters/timers and wreck pose in the existing RunSuspend envelope**: stolen heads, pending loot/crane deadlines, destroyed positions, and final pose cannot all be reconstructed from actors. Reuse the existing boss capture/reset/restore pattern; this is a bounded payload, not a new save system. Old saves without those values cannot promise exact historical loot-state recovery.

Acceptance before calling this coherent:

- Capture entry, each quadrant, two complete reversals, and wheels-first/wheels-last defeat on both viewports. Prove visible zones overlap their own hit disks, remain distinct, and do not exchange ends. Keep the hull rigid and its bar clear.
- Verify all active routes share progression and multiplier through the actual fixed step, E4 clear/storm transitions, supported timescales, and fresh-page JSON resume immediately before/after a corner and reversal. The current movement callback's E4 storm factor is shared (`Game.ts:3115–3120`, `MotorSocket.ts:263–265`).
- Include an exact waypoint-boundary case. A synthetic step traversing a chord in exactly 30 steps exposed floating-point branch divergence in the existing independent arrival comparisons. Normal 60 Hz takes 29.9144 steps per chord and passed, but do not claim arbitrary-step synchronization without resolving or bounding that case in the actual runtime. Per-component slowdowns would also invalidate the equal-clock premise.
- Fresh-page resume during orbit, after a stolen head, during crane cooldown, with one remaining component, and after salvage must preserve routes, counts, deadlines, damage state, and wreck pose; it must not fund duplicate escorts or repeat a crane grab early.
- Run the unchanged boss/census/story gates plus focused load/fallback/morph/disposal checks. Any shared `Enemy` movement change requires broader simulation regression; the preferred route construction itself does not require one.

Additional independent numeric check: 80,000 steps at 60 Hz with the actual E4 weather schedule (factor 0.7 during seconds 10–22 of each 30-second cycle, otherwise 1) remained synchronized through 97 reversals, maximum rotational error `6.33e-14`. JSON serialize/parse before step 40,001 produced a byte-identical resumed final state. This supports the route construction; it does not substitute for the production fresh-load tests above.

## Final multiplier check and production-step correction

**Correction: the production simulation step is 1/30 second, not 1/60** (`src/core/Loop.ts:1`). The earlier 60 Hz results remain supplemental numerical checks. The repeated preferred-formation replay at the actual **30 Hz** plus E4's actual 1/0.7 weather schedule passed 80,000 steps and **193 synchronized reversals**, with zero route-index mismatches and maximum rotational-position error `4.05e-14`. JSON save/resume halfway produced a byte-identical final state. This remains a numeric replay of the current movement rules, not a production loader test.

The separate **actual browser** probe (`probe-multipliers.mjs`, evidence `movement-multipliers.json`) observed **10,074 calls to the current Enemy.update**, with live `delta = 1/30`. It covered 60 seconds before the HP fixture, 30 seconds below half wheels HP, 30 seconds after crane death, and wheels death/beaching. Every same-tick multiplier spread was **zero**; only the shared storm multiplier changed, between 1 and 0.7. Scripted speed remained `12.5663706144` through damage/crane death and became zero when wheels died. No browser console/page errors occurred. This probe left the existing overlapping formation unchanged.

Why different positions do not create unequal clocks on the actual E4 contract:

- `Game.ts:3115–3120` applies the full multiplier product. Live E4 has no light ramp, day/night cycle, or moth-season configuration, so `nightSpeedMultiplier` returns 1 before sampling spatial light (`:6472–6479,7006–7007`). Active epoch is 4; E6/E9 arsenal slowdown gates require epochs 6/9 (`:1691–1718`). Wrangle is E6-only (`:902–904`). All returned 1 in the probe.
- Scripted `ignoreTerrain` movement bypasses terrain slope/speed, blockers, separation, and formation steering (`Enemy.ts:683–702,736–743`). Terrain only updates Y (`:1401–1402`); waypoint arrival uses X/Z. Measured differing terrain heights therefore did not change speed.
- Damage below half HP affects presentation, not movement (`Enemy.ts:774–788`). Group degradation applies equally to survivors, and the E4 factor is 1 (`pools.ts:872–879`; contract `:115`). Spawn delays are zero; scripted targeting cannot newly enter wrecker/gnaw pauses. Wheels death pins every survivor synchronously before recycling.
- Land Yacht runs before enemy integration (`Game.ts:3019,3087`). Render interpolation restores simulation transforms afterward (`pools.ts:1033–1055`). The only identified ordering exception is **terminal lethal hero contact**: the pool breaks after the contacting actor, leaving later actors one final tick behind (`pools.ts:968`). This is bounded to the ending run; it does not justify a pool-loop repair in E4's scope.

**Final recommendation:** initial formation plus synchronized rotated routes remains viable for actual E4, without changing shared Enemy movement. Fixed world orientation is unnecessary and would retain sideways travel; it also would not cure unequal clocks if such modifiers were introduced later. Keep the earlier fresh-load/phase-fit acceptance checks and numerical edge-case caveat. No source, asset, existing-test, or shared movement changes were made during this preflight; stop here until E4 implementation is dispatched.
