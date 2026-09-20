# BEAUTY SHIFT — DRY GULCH (`e1-dry-gulch`)

Shift: dedicated Opus 5 session, worktree `gr-task-beauty-dry-gulch`, branch `beauty/dry-gulch`.
Brief: `docs/beauty/e1-dry-gulch-brief.md` (law). Program: `docs/beauty/README.md`.
Base: `551a1e73` (origin/main at pre-flight, fast-forwarded 2026-08-02).
Verdict: **4 of 5 upgrades KEPT, 1 PARKED with evidence.** Rendering-only, zero sim bytes.

---

## 1. THE INSTRUMENT

`e2e/beauty-dry-gulch.rig.ts` renders the brief's §4 shot list on both projects and writes every
number it measures to `artifacts/beauty-dry-gulch/<label>/board.json`. The same rig ran on both
sides of every upgrade; the pairs below are its output, not a description of one. It lives as a
`*.rig.ts` so a capture harness can never become a tree red (`playwright.config.ts` `testIgnore`).

**The fresh-eye run camera is the shipped run camera.** `render_fresh_eye_sweep.py` poses Blender at
`((0,-30.3,26.26) → (0,-8.65,0.51), 42°)` in Z-up. Converted to three.js Y-up that is position
`(0, 26.26, 30.3)` looking at `(0, 0.51, 8.65)` — exactly what `CameraRig.snapTo` produces for a hero
standing at `(0, 12)` on ground `y≈0.06`, given `Balance.camera.offset (0, 26.2, 18.3)`,
`downScreenLookOffset 3.35` and fov 42. Measured in-page: `distanceScale 1.0`,
`baseDistance === actualDistance === 31.958`. No separate beauty camera exists or is needed; every
framing in the rig is expressed as the hero position that produces it.

**Two instrument defects were found and fixed before any verdict was trusted:**

1. *The creeping camera.* `CameraRig` lerps at `lag` 0.15 (~5.4% of the remaining distance per frame),
   so the original 45-frame settle left ~8% of a 30 m teleport unconsumed and photographed a moving
   camera. A u2→u3 pixel diff came back **40.76% of pixels changed** for an upgrade that adds 54
   small ellipses — the frames were shot from marginally different places. At 240 frames the residual
   is ~1e-6 and the same diff reads **0.20%**. Every board in this review is post-fix.
2. *Warm-up counted as cost.* Sampling p95 30 frames after a pack spawn measured shader compilation:
   two runs of the **same build** returned 16.8 ms and 10.2 ms, a 39% swing that would have been read
   as an upgrade's price. The rig now warms 120 frames before it measures.

---

## 2. VERDICT TABLE

Median of **three** timed runs per arm (single p95 samples on this box catch compositor hitches —
see §6). Draw calls and triangles are the sensitive numbers; p95 sits at the display cadence.

| # | Upgrade | Verdict | p95 before → after (median n=3) | Δp95 | avg ms | draw calls | pixels changed (run-cam) |
|---|---------|---------|-------------------------------|------|--------|-----------|--------------------------|
| U1 | The spring becomes the jewel | **KEPT** | 10.0 → 10.0 (spring shot) | **0.0%** | 8.33 → 8.34 | 48 → 54 | 2.27% (its own shot) |
| U2 | High-noon desert light | **KEPT** | 10.1 → 10.3 | **+2.0%** | 9.21 → 8.75 | +1 | **64.74%** |
| U3 | Scrub that stands in the light | **KEPT (weakened claim)** | within noise | ~0% | — | +0–1 | 4.59% |
| U4 | The two signature skeletons | **PARKED — see §5** | — | — | — | — | — |
| U5 | Heat you can see | **KEPT** | 10.1 → 10.3 | **+2.0%** | — | +3 | 2.47% |
| — | Whole shift, mid-wave | — | 10.1 → 10.3 | **+2.0%** | 8.33 → 9.03 (+8.4%) | 88 → 114 | — |
| — | **LITE** | **untouched** | 10.1 → 10.1 | **0.0%** | 8.33 → 8.34 | 58 → 58 | triangles byte-identical 67730 |

Budget: **+15% allowed, +2.0% measured.** Zero console errors and zero page errors on every board,
desktop 1280×800 and mobile 390×844.

Shot pairs (before | after, half scale): `reviews/shots-beauty-dry-gulch/<u1|u2|u3|u5|u4-parked|whole-shift>/`.
Full-resolution boards: `artifacts/beauty-dry-gulch/<before|u1|u2|u3|u5|u4|after>/`.

---

## 3. WHAT EACH UPGRADE DID

### U1 — The spring becomes the jewel · KEPT
`src/world/Water.ts` (`createSpringPondSurface`) + `src/world/Terrain3dClaimPilot.ts` mount path.

The 3D pilot hides `SpringPonds` along with every other painted ground layer, so the map's only
water was baked atlas paint — a flat cyan disc, full-bright at `emissiveIntensity 3`, the one cool
colour in a terracotta world. It now carries a live surface: radial depth ramp, two drifting noise
fields for chop, ring wavelets from an off-centre spring eye, six quality-gated sun glints, a lit
shallow collar, and a damp margin that reads as wet sand.

Three things the brief could not have known, found by rendering:

- **The brief's signature is stale.** It asks for `createLivingWaterMaterial(true, …)`; the real
  signature takes a config object, and that shader measures everything in **world-z bands** with a
  ford-strip UV fade. On a disc those become a hard line across the pool and an alpha that depends on
  how far the pond happens to sit from `z=0`. Reject-don't-stretch: the pond got its own radial
  surface sharing the river's noise/glint field verbatim (`WATER_FIELD_GLSL`), so the two waters can
  never drift apart.
- **The pond must be mounted to the paint, not to the ground.** `isolated_spring.glb` draws its pool
  as a flat cap at local y **0.0875**, not at the basin floor. Mounted at floor+ε the live surface sat
  0.049 m *under* the landmark's own depth write and was invisible — while its reeds showed, so it
  looked mounted. `scripts/beauty-spring-pool.mjs` now measures that cap from any landmark body and
  independently reproduces the shipped constants (`surfaceY 0.0875`, suggested `radius 2.352` vs the
  hand-tuned 2.35).
- **The baked cap has to be covered, not tinted.** The pack law is one mesh / one material, so the
  cyan pool bed cannot be hidden separately from its stones. Anything translucent just tints cyan.
  The surface therefore runs at alpha 0.88–0.985 and the damp margin holds near-full alpha past the
  cap's r 2.80 — with the landmark's emissive dropped to **2.1**, which is the value where the cyan
  dies but the pale stone ring survives (the stones stand above the water plane and are never covered).

### U2 — High-noon desert light · KEPT
`src/world/LightRig.ts` (`DAY_PALETTES`) + one argument at `Game.ts:3642`.

A per-contract daytime palette consumed by contract id: sun toward `#ffe0a0` at ×1.06 intensity,
raised to y 27, background `#f3cd92`, fog near/far ×1.15. Measured in-page: `fogNear 48.3`,
`fogFar 101.2`, `sun #ffe0a0 @ 2.49`, `background #f3cd92` — exactly the brief's numbers.

**Every field is a multiplier or an absence, never a snapshot.** `Balance.world.fogNear/fogFar` are
live tuning-panel values read each frame; a palette storing `48.3` would silently disconnect this
map's fog slider. A map with no entry takes the `?? today` branch at every use site, so "all other
maps keep byte-identical current values" is visible in the diff rather than asserted.

This is the shift's biggest single change: **64.74% of run-camera pixels**, mean ground colour
`rgb(114.9, 80.6, 48.6) → rgb(122.9, 87.8, 52.5)`. The map stops sharing golden hour with its four
siblings and starts reading as noon.

### U3 — Scrub that stands in the light · KEPT, with the claim weakened
`src/world/Scatter.ts`.

Per-instance warm/cool + value tint on an instance-colour attribute, and one shared contact-shadow
mesh (54 ellipses, **one draw call**) under rocks, cactus, stumps, dry grass and claim posts. Tint is
hashed from world position, **not drawn from the placement RNG** — pulling numbers out of
`placeDetail`'s stream would shift every subsequent position and silently re-scatter all five maps.

Two honest corrections to the brief:

- **The brief's 0.14 opacity is invisible in play.** At it, U3 moved **0.20%** of the run-camera
  frame. Widened ellipses, `dry_grass` added to the shadowed classes, and opacity 0.19 bring it to
  **4.59%** — present without turning the ground into polka dots. Numbers, not vibes.
- **The `antiTile` 0.86 → 0.92 clause cannot work and was rejected.** ✓ VERIFIED: `antiTile` is a
  uniform on the painted ground material built by `createGroundMesh()` (`Terrain.ts:902`), and under
  the 3D pilot that mesh is hidden — the live probe reports
  `terrain3dPilotHiddenGroundLayers = TerrainVistaRing|TerrainContinuousGroundMesh|SpringPonds`. So
  raising it would do **nothing** on the FULL path the brief wants fixed, and would change only the
  LITE/painted path the same brief protects. Not cargo-culted, not shipped.

### U5 — Heat you can see · KEPT
`src/world/LightRig.ts` (`HEAT_PROFILES`, `HeatShimmerBand`, `DustDevils`).

A shimmer band across the top of the frame and two wandering dust devils (22 additive quads, one
draw call, cap 60). Both gated on **this contract, FULL tier, and an unstressed auto-tier ladder**.

- The shimmer re-reads the frame the game just drew via `copyFramebufferToTexture` and redraws the
  top through a two-rate horizontal wobble. **No render-target rewiring**: `LedgerPostPass` composites
  after the scene render, so the effect needed no change to how the scene is drawn, and when it is
  off there is not one extra GL call.
- **Shed first, as instructed, with no new watchdog.** `setStressFallback` is already the earliest
  rung of the MQ-4 ladder (it fires at runtime verdict ≥1, before the dynamic-light cap at 2 and the
  LITE fallback at 3), so gating on it registers the heat ahead of everything else.
- Dust devils billboard **without a camera**: `CameraRig` only translates and calls `lookAt` — it
  never yaws or rolls — so the view heading is constant for the whole run and a quad pitched to the
  fixed camera tilt faces it from anywhere. That is what lets them be instances instead of N sprites.

Measured live: `heatShimmer true`, `dustDevilQuads 22`, and a dust column is visible in frame at
t=4.2 s (`artifacts/_devil-strip.png`).

---

## 4. THE FIVE DOORS, AND WHAT DID NOT MOVE

- **Contract equality:** no GLB, terrain contract or panorama contract was modified. `contracts.json`
  is untouched — the `antiTile` clause was the only thing that would have edited it, and it was
  rejected (§3, U3). `terrain3dPilotState = ready`, `RenderSource = glb` on every board.
- **LITE:** median p95 10.1 → 10.1, draw calls 58 → 58, triangles **byte-identical** (67730 → 67730).
  U2's atmosphere does reach LITE by design (a LITE player should still see the noon desert); it costs
  nothing measurable.
- **Other maps:** `DAY_PALETTES` and `HEAT_PROFILES` contain one entry each, keyed `e1-dry-gulch`.
  `LIVE_SPRING_POND_CONTRACTS` likewise. U3 is deliberately global — the brief scopes "all other maps
  byte-identical" to U2 only, and better-lit scrub is owed to every map.
- **Sim:** zero bytes. Spawns, lanes, heightfield, the spring's declared position/radius/zone, and the
  `fix-dry-gulch-frozen-waves` coupling surface are untouched.

---

## 5. U4 — PARKED, AND WHY (the finding that cost the most to get)

The brief asks for a two-body replace-in-place: better `bison_skeleton` and `ruined_mining_operation`
at the same mount ids. **The pipeline cannot express that request**, and proving it required building
it.

The bodies were written and they work: `build_landmark_packs.py` now grows the skeleton arcing
two-segment ribs, nine countable vertebrae sinking under a sand drift, a pelvis and two fallen long
bones (364 → **892 tris**, budget 3000), and gives the ruin wind-tattered canvas panels, a leaning
headframe brace and rust streaks down the timber (1452 → **1572 tris**). One mesh, one material, one
texture each — pack law held. Rendered, the new skeleton is unambiguously better: a carcass in sand
instead of a white line drawing (`reviews/shots-beauty-dry-gulch/u4-parked/desktop-chrome-4-bison.png`).

It is parked anyway, on three measurements:

1. **The builder has no per-asset mode.** `build_landmark_packs.py -- dry-gulch` regenerates the
   shared atlas and **all five** bodies. There is no way to land two bodies without landing five.
2. **The rebuilt atlas is different art.** Old vs new: **74.3% of subpixels differ, max delta 200.**
   Landing U4 would silently re-skin the farmhouse, the cactus thicket and the spring inside a commit
   whose stated purpose is two skeletons.
3. **The shipped pack is stale, and the rebuild regresses the map's postcard.** The committed
   `isolated_spring.glb` spans local y **−0.128 … 1.063**; the current builder produces **0 … 0.600**,
   which is also what the body's own contract entry claims — so the shipped body has not matched its
   contract for some time. The consequence is visible: the rebuilt spring renders as a flat pale disc
   with no depth, no collar and no glints, inside an oversized dark ring, and it rots U1's measured
   pool mount (cap moves 0.0875 → 0.13, r 2.80 → 2.67). See the pair board above — right is worse.

A rebuild that quietly re-skins three landmarks and regresses the one this shift spent its effort on
is not a beauty upgrade; it is a pack migration wearing one. **Nothing was left half-landed**: the
five GLBs, the atlas, the blend, the pack contract and the builder are all restored byte-for-byte from
`HEAD`, and the work is preserved as `reviews/beauty-dry-gulch-u4-parked.patch` (93 lines) so the next
shift can re-apply it deliberately, alongside a decision about the stale pack.

**Owner's desk / next shift:** landing U4 needs one of — (a) a per-asset build mode in
`build_landmark_packs.py`, or (b) a deliberate whole-pack refresh for Dry Gulch that re-judges all
five bodies and re-measures the spring pool. Either is a task, not a clause.

---

## 6. HONEST NOTES ON THE MEASUREMENTS

- **p95 is a blunt instrument here.** Headless chromium renders this scene at ~120 fps with avg
  8.3–9.2 ms, so p95 mostly reports the display cadence plus the occasional compositor hitch. Single
  samples in this session produced 10.1, 15.6 and 25.0 ms for *unchanged* builds. Every number in §2
  is a median of three; draw calls and triangles are the trustworthy signals.
- **`5-secured` is not a clean diff surface.** It places buildings and spawns a pack, so HUD state and
  enemy count differ between runs; its pixel percentages are not attributable. `2-run-camera`,
  `3-spring` and `6-horizon` are deterministic and carry the visual claims.
- **A dead dev server manufactures reds that look like yours.** The first full gate run lost its vite
  mid-sweep and produced a burst of 175 ms `e1-night-shift` failures that read exactly like a boot
  crash in `LightRig`. `(cmd &)` from a tool shell does not survive; `nohup … &` does. Every result
  quoted here is from a run whose server was verified up afterwards.

---

---

## 6b. THE GATE — control-proven, zero new reds

Both arms ran `--workers=1` explicitly (the config's fire-shell heuristic keys on
`CLAUDE_CONFIG_DIR`, which is set in this session). The control is a **detached worktree at the base
commit `551a1e73`** (`/tmp/gr-control`) with its own vite on port 5242 — the treatment never shares a
server with it. Full lists: `reviews/beauty-dry-gulch-control-reds.txt`.

| Suite | Base (`551a1e73`) | This branch | Verdict |
|-------|-------------------|-------------|---------|
| `map-beauty-dry-gulch.spec.ts` *(named by brief)* | green | **green** | ✅ untouched |
| `fix-dry-gulch-frozen-waves.spec.ts` *(named by brief)* | green | **green** | ✅ untouched |
| `w1-02-living-water.spec.ts` | green | **green** | ✅ the river/ford shader survived the GLSL extraction |
| `w1-03-light.spec.ts` | green | **green** | ✅ LightRig adjacent |
| `e1-night-shift.spec.ts` | 271, 372, 435 fail ×2 projects | same 3 ×2 | pre-existing, byte-for-byte the same set |
| `e1-dry-gulch.spec.ts` | `:79` fails ×2 projects | `:79` mobile only | pre-existing (treatment is a **subset**) |
| `tile-identity-pass.spec.ts` | 71, 121 fail | same | pre-existing |
| Sweep A, 10 specs | **23 failed / 55 passed** | — | the standing environmental red set |

**No failure appears on this branch that does not appear on the base.** The `e1-night-shift` reds
were the one real scare — `LightRig` is exactly the file U2 and U5 touch — and the control settles it:
the base fails the identical three tests on both projects.

Direct containment probe, all five E1 doors booted on the branch, zero console/page errors:

| contract | sun | intensity | fogNear | heat | devils |
|----------|-----|-----------|---------|------|--------|
| `the-claim` | `#ffd28a` | 2.35 | 42 | false | 0 |
| `e1-twin-banks` | `#ffd28a` | 2.35 | 42 | false | 0 |
| `e1-baron` | `#ffd28a` | 2.35 | 42 | false | 0 |
| `e1-night-shift` | `#ffd28a` | 2.35 | 34 *(its own night rig)* | false | 0 |
| **`e1-dry-gulch`** | **`#ffe0a0`** | **2.49** | **48.3** | **true** | **22** |

`--workers=6` is not usable on this box: the untouched base failed **38** of sweep A under it
(1-minute timeouts) versus 23 at `--workers=1`.

---

## 7. THE HONEST LINE — what still looks wrong

- **The spring is fixed; the run camera barely sees it.** U1 is the shift's best work and it lands on
  a pool that occupies the top-left *corner* of the boot framing. The map's postcard is only a
  postcard once the player walks to it — which the contract does force ("sluices work only beside the
  spring"), but the first ten seconds of Dry Gulch still open on the same wide brown field.
- **U3 is honest but small.** Contact shadows and tint variance move 4.6% of the run-camera frame. The
  reason the field reads flat is not mainly the scatter: at the shipped zoom the ground is the GLB's
  baked atlas, and DetailScatter contributes ~85 visible instances across a 64×64 m map — pebbles at
  that distance. Making the field read as ground *needs the atlas or the density*, and both are
  contract surfaces this shift is not allowed to touch. The brief's own U3 diagnosis is half right.
- **The bison skeleton is still a white line drawing.** §5 explains why; it remains the weakest thing
  in the run camera, and it is exactly what the brief said it was.
- **The heat shimmer is subtle to the point of deniability.** At 2.2 px it reads as a slightly
  restless far edge, not as heat. It is also fighting the framing: the run camera pitches ~50° down,
  so there is **no sky and no horizon line** in any shot — the effect distorts distant ground instead
  of a skyline, which is the weaker version of the idea. A stronger amplitude looked like a wet lens.
- **The landmarks still ignore the sun.** `keepLandmarkPaintReadable` full-brights every body at
  `emissiveIntensity 3`; U1 dropped only the spring to 2.1 because it had to. The farmhouse and the
  cactus thicket still glow at noon and cast nothing. That is U4's other half and it is still owed.
- **The dust devils are rare.** They wander ±24 m and fade near the hero, so a given 30-second stretch
  may show none. That is the design, but "1–2 dust devils" oversells what a player will actually see.
- **Two shipped inconsistencies were found and left alone**, both outside this brief: the tile-identity
  pass screenshots at frame 18 and boards the *painted fallback* rather than the sculpt (which is why
  `artifacts/tile-identity/desktop-chrome-e1-dry-gulch.png` looks like a different, flatter map), and
  `isolated_spring.glb` does not match its own pack contract bounds (§5).
