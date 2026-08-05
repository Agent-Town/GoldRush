# THE e2-trestle BEAUTY SHIFT — review

**Slice:** `docs/beauty/e2-trestle-brief.md` (E2 beauty night, map 2 of 4)
**Branch:** `beauty2/e2-trestle` · **base:** `8f65062e` · **tip:** see `git log --oneline -1`
**Session:** dedicated Opus 5, solo writer, 2026-08-04
**VERDICT: SHIP — five upgrades landed, two of them partial, and two pre-existing defects found and reported (one P1).**

Owner mandate (2026-07-11, verbatim): *"The different maps should look beautiful."*
Style anchor: *"One long line over deep water: warm timber counting its bents across a gorge that finally holds a river, and a white plume crossing between two banks that both know who held them."*

---

## 1. WHAT IT DOES

The Trestle's postcard was a bridge over a rendering hole. The gorge under the map's
thesis object rendered as a near-black band — measured, 18.71 luma at 2.07 stddev
across **three** distinct colour buckets in a 420×190 sample — while the game's
tooltip said *"Ford — the only crossing bandits know"* over featureless black. The
south hero start read as a flat brown yard with pale platforms floating on
unprepared ground and two full-emissive crimson roofs shouting over everything.

Now: the gorge holds a slate-green river with a warm wading skim under the span and
a stained wet lip on both banks; the span casts a measurable shadow onto that water;
the two boiler roofs are oxide iron instead of crimson; the spur kit's boards are
worked timber standing on a compacted pad with a service track onto the line; cart
ruts converge on the crossing from all four build zones; murk rises off the water
and umber dust drifts through the light; and the escort cart trails white steam
across the bridge.

Everything is rendering-only. The sim is untouched: no byte of `TileHeight`, water
classification, ford declaration, spawn edges, rails data, harvest anchors or
escort/boss logic moved. The GLB's geometry is **bit-identical** to the shipped one
(the U2 re-export changes the embedded atlas and nothing else); the contract's
counts and bounds are byte-identical.

---

## 2. VERDICT TABLE

| # | Upgrade | Verdict | Rounds | The number that decided it |
|---|---|---|---|---|
| U1 | The gorge gets its river | **KEPT** | 3 (u1 / u1b / u1c) | gorge core 18.71 → 35.91 luma, stddev 2.07 → 9.40, buckets 3 → 9; both banks byte-identical |
| U2 | Walls + approaches earn the story | **KEPT, partial** | 4 (u2 / u2b / u2c / u2d) | untouched ground −0.1%; bank lips −42.3%/−39.3%; strata mostly submerged (§6) |
| U3 | Golden hour + the span's shadow | **KEPT** | 2 + a 1.3/1.5/1.6 A/B | roof 71.94 → 40.07 luma; ford strip east of the span 38.59 → 28.59 (the shadow) |
| U4 | The crossing breathes | **KEPT, partial** | 3 (u4 / u4b / u4c) | plume 12 + wisps 7 live in a **plain boot**; the cart cannot cross without F-BT-1 |
| U5 | Living air and the wide postcard | **KEPT** | 1 | wide-line gorge band 38.74 → 51.85 luma, buckets 11 → 23 |

Nothing was reverted. Two upgrades are marked partial and both reasons are in §6.

---

## 3. EVIDENCE

### 3.1 The perf law — both arms in one browser, same minute, same load

`?nobeauty` withholds every addition this shift mounts while the identical build
boots (F-1113-4: a control is only a control if it shares the treatment's
conditions). Measured on the crossing framing, load average **7.63**:

| Viewport | `?nobeauty` p95 | shipped p95 | ratio | law | draw calls | triangles |
|---|---|---|---|---|---|---|
| desktop 1280×800 | 10.1 ms | 9.9 ms | **0.98** | ≤ 1.15 | 93 → 99 | 115,574 → 116,144 |
| mobile 390×844 | 10.2 ms | 10.1 ms | **0.99** | ≤ 1.15 | 60 → 66 | 111,742 → 112,312 |

Game-clock p95 on the same pair: 9.9 → 9.7 ms. The whole shift is **+6 draw calls
and +570 triangles**: the water quad, the span-shadow band, the contact-pool
instance, the mote field, the gorge wisps, and the cart plume.

**Honest caveat, and it is larger than the effect:** this box ran at load average
33–50 during the U1 rounds and 6–8 by the end, and the same unchanged code measured
ratios of 1.034, 1.149 and 1.010 across three consecutive U1 boards. The ratio is
reported from the quiet run; the trustworthy signals are the counts, and they are
exact.

### 3.2 The contract-equality gate

| Field | shipped | after U2 re-export |
|---|---|---|
| vertices | 16641 | 16641 |
| triangles | 32768 | 32768 |
| meshCount / materialCount | 1 / 1 | 1 / 1 |
| boundsMeters | [-48,-48,-0.8765]..[48,48,1.2054] | identical |
| landmarkMounts with `asset` | 6 of 6 | 6 of 6 |
| `landmarkPack` | present | present |
| `terrainConformOffsetY` | 2 mounts | 2 mounts, same values |

**Control run first, unchanged recipe:** the GLB and the atlas came back
**byte-identical** — `glb 4080e8aa…`, `atlas 1ab60777…`, matching the shipped
contract's own recorded sha256s. Only the `.blend` moved, by the length of the
absolute path Blender stores inside it. This builder reproduces; the two E1 builders
did not (F-BTB-1/2), which is why U2 was safe to attempt here and was parked there.

Post-re-export mount probe, live in the browser:
`terrain3dPilotState=ready · RenderSource=glb · landmarks 6 · skipped 0`.

Doc-only contract drift, all of it the frozen dump catching up with a newer mask
table, none of it a count or a bound: `stakeMarkers.lossCondition` → `heroStart`;
`+coalSeams: []`; `+trestleDeck`; `deepBand -5.0` → `-5`; `waterAgreement.ruling`
moves out to a top-level `waterVisualRuling` and gains `sluiceSamples`.

### 3.3 The pilot dataset, plain boot, no `?debug` at all

Seeded profile with the Hill Mine secured → start menu → town → tavern → contract
board → launch. Mistake #10's question — *where does the PLAYER see this in a plain
boot?* — answered by the dataset of that boot:

```
state ready · renderSource glb · landmarks 6 · skipped 0 · landmarkEmissive 1.5
sculptWater living-water-quad · sculptWaterY -0.3260 · deepest 0.550 · halfWidth 10.000
spanShadow 29.01x3.65@3.92 · contactShadows 5 · motes 200 · gorgeWisps 7 · steam 12
```

Mobile 390 px plain boot: identical, motes 90 (the shipped 45% viewport cap).
`steam` reads 0 on the framings that boot with `nowaves` and no escort mode, which
is the point: the plume costs nothing when the cart is not on the map.

### 3.4 Pixel evidence, the crossing framing (1280×800, hero at 0,2)

| Region | before | after | note |
|---|---|---|---|
| gorge core west | 18.71 luma, sd 2.07, 3 buckets | **36.04, sd 9.38, 18 buckets** | the void becomes water |
| gorge east | 15.93, sd 1.60, 3 | 21.98, sd 7.24, 25 | the shoal end of the trough |
| ford west of span | 18.42 | **40.45** | the warm wading skim |
| ford east of span | 14.93 | 28.62 | skim minus the span's shadow |
| span timber | 69.47, sd 36.49 | 53.99, sd 20.38 | self-lit → sun-modelled |
| boiler roof | 65.82, rgb 137,49,19 | **39.17, rgb 89,27,11** | crimson → oxide |

Run camera (hero start 12,−12): boiler roof 71.94 → **40.07** (rgb 160,51,22 →
100,25,12); spur platform 83.75 → 61.19; spur crate 75.65 → 60.25.
South approach: spur platform 95.33 → 52.53; crane arm 62.39 → 49.43.
Wide 2:1: gorge band 38.74 → **51.85** luma at buckets 11 → 23.

### 3.5 The atlas, measured by WORLD rectangle

A screen rectangle over "dry bank" lied: both of this shift's bank samples turned
out to be lying on the new boiler pads and read −21%, which looked exactly like a
repaint that had spent a global value budget. Asked of the texture instead:

| World region | before | after | delta |
|---|---|---|---|
| open yard SE (untouched) | 108.91 | 108.77 | **−0.1%** |
| open yard NW (untouched) | 114.53 | 114.48 | **−0.0%** |
| approach S mid (untouched) | 112.19 | 112.12 | **−0.1%** |
| boiler pad S / N (U2 pad) | 101.44 / 106.38 | 94.14 / 90.02 | −7.2% / −15.4% |
| spur pad (U2 pad) | 111.33 | 100.82 | −9.4% |
| bank lip N / S (stain + silt) | 66.96 / 70.55 | 38.64 / 42.83 | −42.3% / −39.3% |
| gorge wall N (strata) | 23.92 | 27.17 | +13.6% |

Untouched ground is inside the twin-banks family ceiling of −1…−2.6%. The lifts and
the losses are all local and all deliberate.

### 3.6 Gates

Run with `GR_CAPTURE_EXTERNAL_SERVER=1` against this worktree's own vite on 5344,
`--workers=1`, both projects. **Every red was control-proven** against a detached
worktree at the base sha `8f65062e` with its own vite on 5345 — same command, same
flags, same box, minutes apart.

| Suite | project | result |
|---|---|---|
| `e2e/e2-trestle.spec.ts` | desktop-chrome | **PASS** |
| `e2e/e2-trestle.spec.ts` + `map-census` | **mobile-chrome** | **48/48 PASS** |
| `e2e/map-census.spec.ts` (`e2-trestle census`) | desktop-chrome | **PASS** |
| `e2e/map-census.spec.ts` (full sweep) | desktop-chrome | 46/47 — `e2-pressure-garden mobile spot` red |
| `e2e/shore-truth.spec.ts` | desktop-chrome | **PASS** |
| `e2e/landmark-brightness.spec.ts` | desktop-chrome | **PASS** |
| `e2e/e2-escort-mode.spec.ts` | desktop-chrome | **PASS** |
| `e2e/terrain3d-registry.spec.ts` | desktop-chrome | 6 pass / 5 red |
| `e2e/terrain3d-claim-pilot.spec.ts` | desktop-chrome | 10 pass / 1 red |
| `tsc --noEmit` | — | **clean** |
| `npm run build` | — | **green, 1.37 s**, asset diet 84% cut |
| console + page errors | all 12 boards | **zero, every framing** |

Red attribution, each one measured rather than argued:

- `terrain3d-registry` — **4 of the 5 reds fail identically on the base sha**
  (`all sixteen contracts mount…`, `rim and horizon probes…`, `all fifteen contracts
  stay painted in LITE…`, `each registered terrain… 115% p95 budget`). The 5th,
  `terrain2d and the 3D default keep bounds… byte-identical per map`, is a 180 s
  **timeout** that **passes in isolation on BOTH arms in 2.2 minutes** — worker
  contention, not this branch.
- `map-census` `e2-pressure-garden mobile spot` — **passes in isolation on both
  arms** (11.8 s control, 12.1 s branch). A map this shift never touched.
- `terrain3d-claim-pilot` `115% p95 budget` — **fails identically on the base sha**.

Net new reds attributable to this branch: **zero**.

---

## 4. SHOT LIST — all six framings, before and after

Root: `reviews/shots-beauty-trestle/`. Phases: `before` (base sha) and `after`
(shipped tip), plus every tuning round so each keep-or-revert is judged on renders.

| # | Brief framing | before | after |
|---|---|---|---|
| 1 | Plain boot, no `?debug` — board then south approach | `before-board.png`, `before-boot-desktop.png` | `after-board.png`, `after-boot-desktop.png` |
| 2 | Run camera at hero start (12,−12) | `before-run-camera.png` (+`-hud`) | `after-run-camera.png` (+`-hud`) |
| 3 | The crossing, hero on the span | `before-crossing-north.png` | `after-crossing-north.png` |
| 3b | The crossing mid-wave, toughs on the ford | `before-crossing-mid-wave.png` | `after-crossing-mid-wave.png` |
| 4 | The escort cart mid-span, steam trailing | `before-escort-cart-mid-span.png` | `after-escort-cart-mid-span.png` |
| 5 | South approach yard + the spur yard | `before-south-approach.png`, `before-spur-yard.png` | `after-south-approach.png`, `after-spur-yard.png` |
| 6 | Mobile 390 px boot + the 2:1 wide full-line frame | `before-boot-mobile.png`, `before-crossing-mobile.png`, `before-wide-line.png` | `after-boot-mobile.png`, `after-crossing-mobile.png`, `after-wide-line.png` |

Tuning rounds kept as evidence: `u1`, `u1b`, `u1c` (water), `u2`, `u2b`, `u2c`,
`u2d` (atlas), `u3`, `u3ab13`, `u3ab16`, `u3b` (landmarks + shadow), `u4`, `u4b`,
`u4c` (breath), `u5` (air). Metrics JSON per phase, each stamped with its own
`loadAverage`.

Framings 2, 3 and 5 reproduce the director's current-state boards exactly
(`logs/session-scratch/e2-director-probe.mjs`: hero (12,−12), (0,2), (0,−20)), so
this shift's "before" is comparable to the evidence the brief was written from.

Tools, all new and all committed: `scripts/beauty-trestle-board.mjs` (the shot list
and the perf A/B), `scripts/beauty-trestle-probe.mjs` (the sculpt bed, measured off
the shipped GLB), `scripts/beauty-trestle-stats.mjs` (frame regions and `--atlas`
world regions).

---

## 5. MERGE CLASSIFICATION

Base `8f65062e`, no rebase, no conflicts — this branch is the only writer to every
file it touches.

| File | change | class |
|---|---|---|
| `src/world/Terrain3dClaimPilot.ts` | water dressing table, gorge-floor water line, span shadow, crossing breath, mote table, landmark paint fix | LANE-TOUCHED |
| `src/world/SunMotes.ts` | optional `riseFade` (defaults to a multiply by 1.0) | LANE-TOUCHED |
| `assets/pilots/map-rebuild-spike/build_e2_contract_terrains.py` | `carry_forward_mount_records()` port + the Trestle's gorge paint | LANE-TOUCHED |
| `assets/pilots/map-rebuild-spike/trestle-terrain.{glb,blend}`, `-atlas.png`, `-contract.json` | regenerated same-commit | LANE-TOUCHED |
| `artifacts/map-rebuild-spike/trestle-*.png` | verdict renders, regenerated by the export | LANE-TOUCHED |
| `scripts/beauty-trestle-{board,probe,stats}.mjs` | new | LANE-TOUCHED |
| `reviews/shots-beauty-trestle/**` | new evidence | LANE-TOUCHED |
| `logs/session-scratch/tmp-*.mjs` | the F-BT-1 repro probes | LANE-TOUCHED |

Every commit is path-scoped. Nothing else on `main` was moved.

---

## 6. THE HONEST LINE

**What this shift did not manage, in the order it costs the player.**

1. **U1's water covered the very walls U2 was written to paint.** The brief asks for
   strata on the gorge walls; the gorge walls run at slope ~0.37 and the water line
   now sits above all of them. Dropping the cut-wall threshold to 0.022 to reach the
   *visible* shoulders (slope 0.05–0.09) instead laid banded corduroy across both
   approaches and cost the north bank 25% and the south 32% of their value — so the
   strata went back onto genuine cut faces, which is most of a metre under water.
   What carries the bank in the shipped frame is the stain ring, the silt lip and
   the post-grade skylight lift, not the strata. Doing U2 before U1 would have
   produced a different and probably better answer for both.

2. **The river stops at x ≈ +11, and at 2:1 you can see it stop.** The recipe floors
   the entire declared river band flat at −0.320 and lets the analytic bowl carve a
   41 m trough through it, so a water plane low enough to leave the flat flanks dry
   is also a plane the eastern flat rises above. The alternative — a plane above the
   floor — stands two centimetres of water and a full sheet of shore foam on the
   whole tile. The east half of the band reads as a dry wash, which is defensible
   for a desert river and is still a compromise the sculpt forced.

3. **Mid-channel is a flat sheet, because the bed is a flat trench.** The bed under
   the span is level to within a few centimetres across the whole 9 m of deep band,
   so the depth read saturates and the cross-channel gradient the shipped shader is
   built to draw has nothing to draw with. The frame's depth cue is the span's
   shadow and the wet lip, not the water's own value ramp.

4. **The water has no specular.** At a 42° camera over a horizontal plane the mirror
   direction never reaches the lens, so in stills the surface is a tinted sheet with
   a pattern on it. The claim's shift recorded the same residue; nothing here fixes
   it.

5. **The money shot needed `?timescale=24` to exist at all** — see F-BT-1. The
   escort cart cannot reach the span in a normal run, so shot 4 is honest about
   what it took: a shipped debug flag that runs the sim forward fast enough to clear
   the stall, then a freeze the instant the cart is over the water. It is a real
   crossing, not a posed one, but a player cannot see it today.

6. **The landmark emissive fix is scoped to one map.** F-BT-2 means the-claim,
   e1-baron and e1-dry-gulch are still rendering their landmarks at intensity 3 with
   their per-contract paint silently discarded. Fixing them needs their own boards
   and their own gate run; this shift only un-broke its own contract.

7. **`?nobeauty` does not withhold the landmark paint or the atlas.** The flag gates
   every *mounted* addition, which is what the perf law needs, but the emissive drop
   and the repaint are not reversible at runtime. A future A/B of those two has to
   be a build-to-build comparison, and this review's before/after boards are it.

8. **Two upgrades were tuned by eye against numbers, not by a playtest.** Nobody has
   played this map with the water in. The wisp count, the plume size and the mote
   tint are all first proposals with measurements behind them, not owner verdicts.

---

## 7. FINDINGS

### F-BT-1 — **P1: the E2 escort cart can never complete its objective, on all three of its maps**

**What happens.** `OreCart.update` advances along its path with
`this.group.position.distanceTo(next)`. `group.position` carries the render-side
`visualY` (`syncY()` → `visualY(x, z, 0.08)`), and every rail point is authored at
`y = 0`. Once the cart is horizontally on top of a waypoint, the residual distance
is the terrain height there — which `syncY` restores every single frame. So the
segment index never advances if that height exceeds one frame of travel
(2.4 m/s ÷ 60 fps = **0.040 m**), and the cart converges on the waypoint forever
while `travelled` keeps accumulating until `progress` reports a fully-delivered 1.

**Measured, on `main` at `8f65062e`, 45 s of real play per map:**

| map | stalls at | waypoint `visualY` | state after 45 s |
|---|---|---|---|
| `e2-trestle` | (0, −22) | **0.540** | `moving`, arrived 0 |
| `e2-hill-mine` | (−24, −1) | −0.100 | `moving`, arrived 0 |
| `e2-incline` | (12, −24) | −0.274 | `moving`, arrived 0 |

**The diagnosis, run forward.** At `?timescale=24` one frame of travel is 0.96 m,
which clears the 0.540 m residual — and the cart then crosses the whole line and
reports `state: 'arrived', arrived: 1`. Same build, same map, same code path.

**Impact.** The Trestle's mode is literally named *Trestle Crossing* and its
objective is *"See 1 ore cart safely across the trestle."* It cannot be completed.
Its 45-gold payout never fires. `e2e/e2-trestle.spec.ts` asserts the cart's start
(`z < -40`) and never its arrival, which is why the suite is green.

**Proposed fix (sim, NOT taken here — the brief names escort logic untouchable).**
Compare on the XZ plane in `OreCart.update`, i.e. measure `Math.hypot(next.x - p.x,
next.z - p.z)` and lerp x/z only, leaving `syncY` to own Y. One line each, no
gameplay tuning changed except that the cart now arrives. Needs a spec that asserts
arrival on all three maps.

**Repro:** `BEAUTY_BASE=… node logs/session-scratch/tmp-escort-blast-radius.mjs`
(all three maps) and `logs/session-scratch/tmp-trestle-escort-probe.mjs` (the
waypoint heights and the per-second trace).

### F-BT-2 — **P2: per-contract landmark paint has been silently discarded — and this is the THIRD independent discovery of it today**

> ⚠️ **DRAIN INSTRUCTION, verified before writing it.** `beauty2/e2-hill-mine` hit the identical wall
> as its own **F-BHM-1** and **already deletes the duplicate call outright** in
> **`bc14d54c`** (*"beauty(e2-hill-mine) U3+U4+U5a, and F-BHM-1: the per-contract landmark paint was
> dead on main"*, 2026-08-04 07:13) — ✓ verified by `git show`, the commit is on
> `origin/beauty2/e2-hill-mine`. `beauty2/e2-pressure-garden` filed the same defect as **F-PG-2**.
> Three shifts, one file, one day. **Whichever branch drains second must NOT re-delete the line:
> take the hill-mine deletion, then delete `LANDMARK_PAINT_IS_FINAL` from this branch entirely — the
> Set is only referenced by the guard on that call, so once the call is gone the Set is dead code.**
> `bc14d54c` is also strictly better than this branch's dataset: it publishes the MEASURED per-mount
> `emissiveIntensity` range inside `terrain3dPilotLandmarkMaterials[]`, so the attribute can no
> longer echo the table. Keep that. Root cause named there: the duplicate arrived in `10586b90`
> (the baron drain), whose merge resolution kept both the new per-contract block and the single-line
> call that block replaced.
>
> Everything below is what this shift measured independently, before knowing the above; it is kept
> because the corroboration is the evidence.


**What happens.** `loadMount` calls `keepLandmarkPaintReadable` twice: once with the
contract's paint, then again with no argument — which re-applies
`DEFAULT_LANDMARK_PAINT` (emissive **white** at intensity **3**) over it.
`material.color` survives, because the default's tint is white and the tint branch
is skipped. So a per-contract **hue** ships and a per-contract **intensity** never
does. The canvas keeps publishing `terrain3dPilotLandmarkEmissive` out of the
*table*, so the dataset reports 1.45 while the material carries 3: a silent fallback
with every gate green, the Mistake #10 shape exactly.

**Blast radius.** `LANDMARK_EMISSIVE` (`the-claim` 1.45), every
`LANDMARK_PAINT.intensity` (`e1-baron` 1.7 / 1.9 / 2.1 / 3.4), and
`DRY_GULCH_SPRING_EMISSIVE` (2.1). Three earlier beauty shifts' U3 has never reached
a pixel.

**Fixed here for `e2-trestle` only**, via `LANDMARK_PAINT_IS_FINAL`. Un-breaking the
E1 maps changes three shipped looks on the eve of the E1 release door, and
`e2e/landmark-brightness.spec.ts` gates the Claim on
`renderedLuminance / atlasLuminance > 0.25` measured with the intensity stuck at 3 —
so it is a corrective task with its own before/after boards, not a drive-by from a
one-contract shift.

**Corrective task — SUPERSEDED by `bc14d54c` above.** What remains owed is not the
code fix but its consequence: with the duplicate gone, the-claim, e1-baron and
e1-dry-gulch will start rendering the intensities their reviews claim they already
shipped. That is three shipped looks changing at once, and
`e2e/landmark-brightness.spec.ts` gates the Claim on
`renderedLuminance / atlasLuminance > 0.25` measured with the intensity stuck at 3.
**The drain that lands `bc14d54c` owns re-running `landmark-brightness` +
`map-census` + each map's own spec, and boarding those three before/afters.** The
intended looks are already written down in their reviews.

### F-BT-3 — non-blocking: the E2 builder's frozen mask dump lags its own mask table

`trestle-terrain-contract.json` froze an older `maskTruth` than
`assets/contracts/epoch-2-steamworks/mask-tables/e2-trestle.json` now holds
(`lossCondition` vs `heroStart`, missing `coalSeams` and `trestleDeck`, an older
`waterAgreement` shape). A re-export silently updates them, which is correct but
means the same drift is sitting in `hill-mine`, `pressure-garden` and `incline`
until each is next re-exported. Nothing reads these fields at runtime — the pilot
reads counts, bounds, `panoramaMount` and `landmarkMounts` — so this is a
bookkeeping note, not a defect.

### F-BT-4 — non-blocking: `e2e/e2-trestle.spec.ts` cannot see a stalled cart

The spec asserts the cart's *start* (`state: 'moving'`, `z < -40`) and never its
arrival, which is how F-BT-1 lived through every gate on three maps. The corrective
task for F-BT-1 should add an arrival assertion, driven either by `?timescale` or by
a sim-advance harness.

---

## 8. WHAT THE NEXT SHIFT INHERITS

- `SCULPT_WATER_DRESSING` is now a per-contract table with two shapes of water line
  (`channel-fill` for a meander, `below-gorge-floor` for a flat-floored cut), plus
  per-contract colour, opacity, ripple strength, texture blend and authored glints.
  A third sculpted map is a row.
- `SUN_MOTE_CONTRACTS` is a per-contract table (colour, size, box, seed).
- `SPAN_SHADOW_CONTRACTS` and `CROSSING_BREATH_CONTRACTS` are new tables of the same
  shape; the Incline's lower yard and the Hill Mine's gallery can both take a row.
- `SunMotes` has an optional `riseFade` for a rising field that must dissolve.
- **`build_e2_contract_terrains.py` is de-armed for all four E2 maps** — the
  carry-forward port is in the shared `make_contract`, not in the Trestle's branch,
  and it is proven by a run that fires the trap: with no prior contract to carry
  forward from, that builder writes six mounts with **zero** `asset` fields, no
  `landmarkPack` and both conformed Y values gone.
- The builder **reproduces byte-for-byte**. The Hill Mine, Pressure Garden and
  Incline shifts can repaint their atlases without the E1 shifts' pipeline dread —
  run the unchanged-recipe control first anyway.

---

## Re-land on moved world — 2026-08-05

Ported from `beauty2/e2-trestle` onto `origin/main` at `5a6e58c7`, preserving the landed Hill Mine, far-ground, and perf-r2 code. The Hill Mine row is now exactly:

```ts
'e2-hill-mine': { surface: { kind: 'channel-fill', fill: 0.42 }, color: '#8a8177', opacity: 0.72, fordSkim: 0.11, deepMeters: 0.12, shoreMeters: 0.05, visualHalfWidth: 5.9, glints: [{ x: -27, z: -5.1 }, { x: 13, z: 5.1 }, { x: 33, z: -5.1 }], rippleStrength: 1.15, textureBlend: 0, },
```

`fordSkim` and `visualHalfWidth` remain outer dressing fields; only `fill` moved into the `surface` union. Gates: tsc, app build, E1 release build, Trestle both projects, and night-mode both projects green. The unchanged Hill Mine suite is 10 passed / 2 skipped / 2 known reds at the pre-existing visual-vs-sim assertion (`-0.4572856426` vs `-0.5`), matching F-BHM-3 and the clean-main control recorded in the Hill Mine review; the combined focused battery is 16 passed / 2 skipped / 2 known reds. Desktop and 390px evidence is in `reviews/shots-e2-trestle-reland/`.
