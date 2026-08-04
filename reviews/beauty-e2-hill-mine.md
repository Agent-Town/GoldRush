# THE HILL MINE BEAUTY SHIFT — review

**Slice** `docs/beauty/e2-hill-mine-brief.md` (E2 map 1 of 4, the Steamworks poster)
**Branch** `beauty2/e2-hill-mine` · **base** `8f65062e` · **tip** see the ledger line at the bottom
**Session** dedicated Opus 5 solo-writer, 2026-08-04 · **Owner mandate** "The different maps should look beautiful." (2026-07-11)

**VERDICT: SHIP U1, U3, U4, U5 and F-BHM-1. U2 SHIPS PARTIAL — its paint lands and is measurable, its central promise (bench faces that read as cut stone) does not survive this camera, and F-BHM-2 files that where it can actually be fixed.**

---

## 1. Verdict table

| # | Upgrade | Verdict | What actually changed, measured |
|---|---------|---------|--------------------------------|
| **U1** | The flooded gallery becomes murky working water | **KEEP** | The map's central band stopped being a rendering hole. Run-camera band window (y 180–350, x 0–600): luma **18.83 → 37.38**, i.e. the void is now twice as bright as itself and moving. Water occupies exactly the sim's declared river band and nothing else. |
| **U2** | The terraces read as cut ground | **KEEP, PARTIAL** | The atlas gained strata, lit lips with dark lines under them, cribbing, ruts, scree, a tailings fan and worked-stone rings — all keyed to the tile's own analytic elevation table. Ruts and rings read in game; the bench FACES still read as gradients (see §5). Whole-frame luma moved 67.49 → 67.19 and 74.98 → 75.29, so the grit grade's global normalisation robbed nothing. |
| **U3** | Landmarks sit in the golden hour, the red roof stops shouting | **KEEP** | Roof window: rgb **139,38,15 → 60,17,8**, warmth (R−B) **123.91 → 52.74**, luma **58.15 → 25.87**. Emissive 3 → 1.45 across all five bodies; 4 contact pools written, the flooded-gallery mount skipped by the riparian rule. |
| **U4** | The era breathes: steam on the steam anchors | **KEEP** | A white column off the boiler stack and a slow seep at the mine mouth. One draw call, one material, 48 puffs, FULL tier, MQ-4 shed-registered. Nothing on this map moved before; the era's name is now in its air. |
| **U5a** | Coal dust in the light | **KEEP** | The mote field became a per-contract dressing; the hill mine's is umber soot over its own working ground, at the claim's cap. |
| **U5b** | The escort cart earns a lantern | **KEEP** | The cart carries an unlit iron-amber lamp (`#f1b56f` glass, `#d9975b` glow) that banks while it is stopped for repair and goes out when it is wrecked. Added to the SHARED body, not forked per map, per the brief's own rule for program-level geometry. Board `u5b-escort-cart.png` is the shift's plainest evidence: the same build, same seed, same second — `?nobeauty` left, live right. |
| **F-BHM-1** | Every per-contract landmark paint on main was dead | **FIXED HERE** | Not in the brief. Found while implementing U3, because U3 could not take effect. Three signed-off upgrades on three other maps were being silently overwritten. §3. |

---

## 2. What it does, in a paragraph

The Hill Mine's own briefing card promises terraced high ground above a flooded rail cut, and until
this shift the render said neither. The gallery — the map's named story, the escort route, the thing
the run camera is pointed at — rendered as a pitch-black band the full width of every frame, because
the 3D pilot hides every painted water surface and the baked bed underneath is near-black. The
boiler-house roof, self-lit at emissive 3, was the loudest field of pixels on the map. Nothing moved.
This shift lays a murky working-water surface into the cut (contained by the cut's own lips, measured
off the baked sculpt, narrowed to the band the atlas actually paints dark), drops the landmarks out
of their own light and into the sun's with contact pools under them, pulls the crimson roof toward
oxide iron, repaints the terrace ramps as worked ground with ruts only where the sim forces traffic,
and puts a white plume on the boiler stack so the era is named in the air rather than only on the
card. Nothing here is simulation: `TileHeight`, the water classification, the ford, the spawns, the
rails data, the harvest anchors and every pressure/escort/boss rule are byte-untouched.

---

## 3. F-BHM-1 — the finding this shift did not go looking for

**`Terrain3dClaimPilot.ts` called `keepLandmarkPaintReadable` twice per body, the second time with the
default paint, silently resetting every per-contract landmark intensity on main to 3.**

Introduced by `10586b90` ("drain: beauty/baron"), whose merge resolution kept both the new
per-contract block and the single-line call that block replaced. Measured live on 2026-08-04, before
the fix, by reading the material rather than the table:

| contract | the table asks for | the material actually had |
|---|---|---|
| `the-claim` | 1.45 on all five (shipped `59655724`) | **3, 3, 3, 3, 3** |
| `e1-baron` | 1.7 / 1.9 / 2.1 / 3.4 by mount, plus an emissive grade | **3 on all four**, grade gone |
| `e1-dry-gulch` | `isolated_spring` 2.1 | **3** |

Three merged, reviewed, signed-off beauty upgrades were being defeated on main, and **every gate
stayed green** — because the published diagnostic (`terrain3dPilotLandmarkEmissive`) reported the
TABLE's number while the map rendered the other one. That is the Stale Belief (Mistake #4) wearing a
dataset as a disguise.

Fixed by deleting the duplicate call. The dataset now publishes the **material's** measured
`emissiveIntensity` range per mount in `terrain3dPilotLandmarkMaterials[]`, so the next one of these
cannot hide behind a lookup. Evidence:

* `logs/session-scratch/landmark-emissive-audit.mjs` — the probe, before and after
* `reviews/shots-beauty2-e2-hill-mine/fbhm1-the-claim.png`, `fbhm1-e1-baron.png`, `fbhm1-e1-dry-gulch.png`
  — same framing, control (base main) left, fixed right. The baron's fort roofs go from signal-red
  circus tents back to the oxide his own review asked for.

**This changes the render of three maps outside this brief.** It changes them *back* to what their
own reviews specified, and no new intent is introduced. Reversible with one word.

---

## 4. Evidence

### 4.1 The armed trap, disarmed (F-BEAUTY-BARON-2, live here)

Before any paint was touched, the **unchanged** recipe was control-run in a detached worktree at base
main. Its output would have shipped:

```
landmarkMounts   asset dropped from ALL FIVE mounts   -> the pilot filters on mount.asset, so the map
                                                         mounts ZERO landmarks and falls back to painted
tailings mount   terrainConformOffsetY + conformed Y dropped
contract         top-level landmarkPack block dropped
```

with `rc=0` and every gate green. Mistake #10 exactly. `carry_forward_mount_records()` is now ported
into `build_e2_contract_terrains.py` from `build_unique_contract_terrains.py:1404`, and the builder
**raises rather than writing** a contract whose mounts lost their asset paths.

Proven by dataset, not by rc: `landmarks 5`, `skipped 0`, `landmarkMounts` byte-identical to HEAD,
`landmarkPack` present.

**Determinism.** The control's regenerated atlas reproduced the shipped one to **±1 of 255 on 12.33%
of samples and 0 beyond that** — the known cross-Blender-version LSB signature, not a nondeterminism
bug. The mesh is bit-identical: **0 of 16641 vertices moved** between the shipped GLB and the rebuilt
one (`logs/session-scratch/glb-height-diff.mjs`).

### 4.2 Contract-equality gate (per GLB change)

| field | HEAD | after re-export | |
|---|---|---|---|
| `meshCount` | 1 | 1 | same |
| `triangles` | 32768 | 32768 | same |
| `materialCount` | 1 | 1 | same |
| `vertices` | 16641 | 16641 | same |
| `boundsMeters` | min −48,−48,−0.557 / max 48,48,4.7443 | identical | same |

`validTerrain()` therefore cannot demote the map to painted. Two **pre-existing** builder drifts also
move and are worth naming: `maskTruth.stakeMarkers[0]` gains `heroStart` and loses `lossCondition`
(the factory contract was renamed by `9eaa1ed5` and this mirror had never been re-baked — the
regenerated contract now *agrees* with the sim's source), and `waterAgreement.ruling` moves to a
top-level `waterVisualRuling` key.

### 4.3 Where the water goes, and why it stops there

`logs/session-scratch/e2-hill-mine-band-scan.mjs` projects world points into the run-camera frame and
reads the pixel under each. At x −24, unobstructed:

```
z      -9   -8   -7   -6  | -5.5  -5   -3    0    3    5  | 5.5   6    7    8
luma   231* 59   65   49  | 34   16   19    18   20   19  | 26    64   77   64
                          ^ the painted dark band starts   ^ and ends
```
(*a lit rock). The atlas paints the bed near-black across **exactly** the sim's declared river band,
z ∈ [−5.5, +5.5]. Three consequences drove the dressing:

1. the tile declares a visual water half width of **10**, and a quad that wide would flood lit ochre
   ground either side, so the quad is narrowed to **5.9** — never wider than the sim declares, which
   is the law `e2e/shore-truth.spec.ts` enforces;
2. the gallery floor is dead flat at y −0.18 with lips at |z| ≈ 6 (−0.062 south, +0.057 north), and
   the fill/skim pair lands the surface at **−0.070** — *under* both lips, so the cut contains the
   water instead of spilling it onto the lower south bench, which is 0.4 m BELOW the gallery floor
   and painted dry;
3. a flat bed cannot supply depth from a bake the way the claim's carved channel does, so depth here
   comes from the near-black paint reading through a deliberately un-opaque surface. That is what
   "murky working water" is.

After-scan at x −18 / +18 confirms the containment: dry lit ground **52–74** either side is
untouched, water occupies z ∈ [−5.5, +5.5] only, and the north lip carries a foam lift (luma 45 at
z = 5).

### 4.4 Frame numbers

| framing | draw calls before → after | p95 before → after |
|---|---|---|
| run camera | 84 → 88 | 9.6 → 9.8 ms |
| gallery trestle | 82 → 87 | 9.6 → 9.9 ms |
| upper terraces | 85 → 87 | 10.5 → 10.2 ms |
| boiler approach | 84 → 88 | 10.7 → 10.1 ms |
| rail cut east | 76 → 77 | 10.4 → 10.2 ms |

Four new draw calls at the busiest framing: the water quad, the contact-shadow pool, the mote field
and the steam field. See §4.5 for the arm-against-arm p95, which is the number that actually counts.

### 4.5 Perf law — same-session A/B against `?nobeauty`

Two arms of the SAME build, opened in ONE browser and sampled alternately three times each, because
this box's load average moved between **41 and 108** during this shift and a before/after taken from
two separate runs measures the machine rather than the change.

| viewport | `?nobeauty` p95 (median of 3) | live p95 (median of 3) | ratio | verdict |
|---|---|---|---|---|
| desktop 1280×800 | 10.0 ms | 9.9 ms | **0.9900** | WITHIN +15% |
| mobile 390×844 | 10.1 ms | 10.0 ms | **0.9901** | WITHIN +15% |

Draw calls, same arms: desktop 83–92 → 88–94 (**+5**); mobile 64–66 → 68–72 (**+4..6**). The five are
the water quad, the contact-shadow pool, the mote field, the steam field and the cart's lantern pair.
Triangles: desktop 116 624 → 116 724 (**+100**). `loadavg` at capture: 84.8 / 63.0. Zero console and
page errors on **both** arms, both viewports.

The withheld arm is verified withheld, by dataset rather than by belief — `?nobeauty` publishes no
`sculptWater`, no `motes`, no `steam`, no `contactShadows`. It does NOT withhold the landmark
emissive change, which is a material property and costs nothing; that is stated rather than implied.

Mobile also honours the mote cap: **200 → 90** at 390px, unchanged from the claim's rule.

### 4.6 Suites

Everything below ran `--workers=1`. **Every red is control-proven against a detached worktree at base
main `8f65062e`, running the identical command against its own vite on a second port** — because the
first sweep of these suites returned 22 reds on this branch and **16 reds on untouched main**, which
is the box, not the change.

| suite | this branch | control at base main | verdict |
|---|---|---|---|
| `e2e/e2-hill-mine.spec.ts` (the named suite, both projects) | 10 passed, 2 skipped, **2 failed** | the same 2 fail, `Received: -0.45728564262390137` **byte-identical** | KNOWN RED — see below |
| `e2e/map-census.spec.ts` — the four maps this branch touches (`e2-hill-mine`, `the-claim`, `e1-baron`, `e1-dry-gulch`) | **4 passed** | — | GREEN |
| `e2e/shore-truth.spec.ts` | **passed** | passed | GREEN |
| `e2e/landmark-brightness.spec.ts` | **2 passed** | 2 passed | GREEN (and this is the suite most at risk from F-BHM-1's fix) |
| `e2e/e2-escort-mode.spec.ts` + `fix-e2-railcar-read.spec.ts` + `e2-trestle.spec.ts` | 5 passed, **1 failed** | the same 1 fails, `x: -24, z: -1` **byte-identical** | KNOWN RED |
| `e2e/terrain3d-registry.spec.ts` :88 :124 :253 :328 :392 | **passed** | — | GREEN |
| `e2e/terrain3d-registry.spec.ts` :196 :272 :345 :447 | **4 failed** | **the same 4 fail, run in isolation, serialized** | KNOWN RED |
| `tsc --noEmit` | clean | | |
| `npm run build` | green | | |

**The two `e2-hill-mine.spec.ts` reds are a pre-existing race, and worth naming.** The spec asserts
`terrainVisualY === terrainSim` to five decimals at five points, but `openHillMine` waits only for
`frame > 16` — it does not wait for the pilot. The recipe adds sub-decimetre erosion grain on top of
the analytic sim height, so once the pilot installs its baked visual-height source the two differ by
exactly that grain (at (0, −18): sim −0.5, visual −0.457286). The test therefore passes when the box
is fast enough that frame 16 beats the GLB, and fails when it is not. The shipped GLB already carried
−0.457286 before this branch existed, and this branch's re-export moved **0 of 16641 vertices**, so
the value is not ours and cannot be. **F-BHM-3** below proposes the fix.

---

## 5. THE HONEST LINE

**The map's biggest problem was never a lack of beauty — it was that the render disagreed with the
briefing card, and four of the five upgrades are really one repair: making the picture say what the
rules already say.** The card promises "the flooded gallery is deep except at the trestle and wet
edge" over a band that rendered as a hole; it promises terraces that block bolts over ground that
rendered as a smear. U1 and U3 close most of that gap and they are the shift's real work. U4 is the
one addition that is purely new pleasure, and it is also the cheapest thing here.

**U2 is a partial and I am not going to dress it up.** The paint lands — the atlas board shows
strata, lips, cribbing, ruts, scree, a tailings fan and worked-stone rings where there were three
soft dark bands, the ruts and the rings genuinely read in game (they are the clearest thing in the
zoomed-out plain-boot frame), and the value discipline held to within 0.4 of a luma point across the
whole frame. But **the brief's headline for U2 was "a face that blocks bolts should look like cut
rock", and it still does not.** A t2 bench rises 1.5 m over a 9 m ramp and the shipped camera sees it
at a very shallow angle: the face is a handful of screen rows, and no amount of texture on a handful
of rows becomes stone. The lip lines help because a value step reads at any angle; the strata
underneath them are nearly invisible where it matters. Making those faces read as cut ground needs
the SCULPT to carry a bench lip — a short, steep riser instead of a smooth analytic ramp — and that
is a change to the terrain mesh, which is exactly what this brief's rendering-only law forbids and
what `gameplay-terrain` exists to own. **F-BHM-2 files it there rather than pretending the texture
did it.**

**Two things in the brief I did not attempt, and one I found instead.** The panorama is untouched, as
instructed. The optional pressure-coupled plume rate is not wired: the `PressureSystem` tracks
*player-built* boiler houses, and scaling the landmark stack's plume by an unrelated building's heat
would be a lie dressed as reactivity — the plume is constant and says only "the boilers are lit",
which is true. And the rails are still `procedural-placeholder` boxes: **F-BHM-4** flags it as the
program-level slice all four E2 maps share, per the brief's own instruction not to fork it here.

**What I found instead was worse than anything in the brief.** F-BHM-1 — three signed-off beauty
upgrades on three *other* maps had been silently overwritten on main for a day, and every gate stayed
green because the diagnostic reported the intent rather than the material. I only found it because
U3 refused to take effect and I measured the material instead of believing the dataset. That is the
Stale Belief with a receipt attached, and the lesson is narrow and worth keeping: **a diagnostic that
publishes a table lookup proves nothing about what got rendered.** The dataset now publishes the
measured value, which is the only version of that line worth writing.

**On the instrument.** This box ran at load average 41–108 all shift. The first suite sweep returned
22 reds on this branch and 16 on untouched main; every red reported above was re-run serialized and
then reproduced on a detached worktree at the base commit, twice for the ones that mattered. I also
contaminated my own control once — I ran the Blender rebuild inside the control worktree while its
gate was still running (Mistake #12, committed by me, mid-shift). The affected window was E7–E9
census tests plus `terrain3d-registry:328`; the files were restored inside the minute, and the four
reds I lean on were all re-proven afterwards in isolation. It is in here because it happened.

---

## 6. Findings

| F-ID | Severity | What | Disposition |
|---|---|---|---|
| **F-BHM-1** | HIGH | `Terrain3dClaimPilot` called `keepLandmarkPaintReadable` twice per body, the second time with the default paint, resetting every per-contract landmark intensity on main to 3 and defeating three signed-off upgrades (`the-claim` 1.45, `e1-baron` 1.7/1.9/2.1/3.4 + its emissive grade, `e1-dry-gulch` 2.1). Introduced by `10586b90`'s merge resolution. Every gate stayed green because the dataset published the table's number, not the material's. | **FIXED IN THIS BRANCH.** The duplicate call is gone and `terrain3dPilotLandmarkMaterials[].emissiveIntensity` now publishes the measured value per mount. Changes the render of three maps outside this brief, back to what their own reviews specified. Boards: `fbhm1-*.png`. **Owner veto window: reverse with one word.** |
| **F-BHM-2** | MED | The bench faces still read as gradients, not cut rock — the brief's headline for U2. A 1.5 m rise over a 9 m ramp at this camera is a handful of screen rows; texture cannot carry it. Needs the sculpt to carry a short steep riser at each bench lip. | **NOT FIXABLE UNDER THIS BRIEF** (rendering-only law, §4.6). Belongs to `specs/gameplay-terrain` as a GT slice: "the E2 benches earn a riser". Filed here; no corrective task authored, because the fix is a sim-adjacent design decision, not a defect. |
| **F-BHM-3** | LOW | `e2e/e2-hill-mine.spec.ts:131` is racy: it asserts `terrainVisualY === terrainSim` to five decimals while waiting only for `frame > 16`, so it passes or fails depending on whether the 3D pilot's baked height source beat the frame counter. It fails deterministically on a loaded box, on untouched main. | **PRE-EXISTING, NOT FIXED HERE.** The fix is one line — wait for `terrain3dPilotState !== 'loading'` before sampling, and then assert the visual height against the *recipe's* height (analytic + grain), not the analytic alone. Left alone deliberately: changing a named suite's assertions inside a beauty shift is how a real regression gets hidden. |
| **F-BHM-4** | MED | `RailPath` still renders `asset: 'procedural-placeholder'` boxes, and its `steamworks` and `mine-spur` styles render identically — on the map whose signature line is its rails (442 instances, 2 draw calls). | **FLAGGED, NOT FORKED**, per the brief's §3. A real rail body is a program-level slice all four E2 maps share. |
| **F-BHM-5** | LOW | Two pre-existing drifts in `hill-mine-terrain-contract.json` were corrected as a side effect of the re-export: `maskTruth.stakeMarkers[0]` now says `heroStart` (matching the factory contract since `9eaa1ed5`) instead of the stale `lossCondition`, and `waterAgreement.ruling` moved to a top-level `waterVisualRuling`. | **CARRIED, NOT AUTHORED.** Both bring the contract's mirror back into agreement with its own source. Named here so a reader of the diff does not mistake them for this shift's opinion. |
| **F-BHM-6** | LOW | The e2 terrain builder had no `carry_forward_mount_records()`; a faithful re-export dropped `asset` from all five mounts, the conformed Y, and the `landmarkPack` block — proven by control-running the unchanged recipe at base main. | **FIXED IN THIS BRANCH** for `build_e2_contract_terrains.py`, and the builder now raises rather than shipping such a contract. **The other four builders that write `landmarkMounts` still have the trap.** |

---

## 7. Boards

All pairs are **before | after**, halved, in `reviews/shots-beauty2-e2-hill-mine/`.
Full-resolution captures and their dataset reports are in `artifacts/beauty-e2-hill-mine/`.

| board | shows |
|---|---|
| **`shift-run-camera.png`** | **the whole shift at the run camera: base main → tip** |
| `u1-desktop-chrome-*.png` | before → U1: the void becomes water (5 framings) |
| `u345-desktop-chrome-*.png` | U1 → U1+U3+U4+U5a: the roof, the pools, the steam, the soot |
| `u2-desktop-chrome-upper-terraces.png` | U2's own before/after at the terraces |
| `u2-atlas-pair.png` | the terrain atlas itself, before → after |
| `u5b-escort-cart.png` | the escort cart mid-crossing: `?nobeauty` → live, same build, same second |
| `fbhm1-the-claim.png`, `fbhm1-e1-baron.png`, `fbhm1-e1-dry-gulch.png` | F-BHM-1's blast radius, control (base main) → fixed |
| `plain-boot-desktop.png` | **no `?debug` anywhere** — launched from the town board, contract card over the terraces → max zoom-out (MQ-2: no backplate band) |
| `mobile-390.png` | 390px plain boot, run frame → max zoom-out |

### Where does the PLAYER see this, in a plain boot? (Mistake #10)

Driven through the town board with no debug flag — `__GR_TEST__` verified **absent**, URL
`?contract=e2-hill-mine&mode=escort` staged by the board itself:

```
state ready · renderSource glb · landmarks 5 · skipped 0
sculptWater living-water-quad · halfWidth 5.900 (sim declares 10.000)
contactShadows 4 · motes 200 (90 at 390px) · steam 2x48
steamAnchors [{x:-2.5, y:9.04, z:10.43}, {x:-6, y:5.69, z:41.66}]   <- the stack top and the adit
landmark emissiveIntensity  boiler-house-site [2,2] · every other mount [1.45,1.45]
consoleErrors []
```

Every upgrade in this shift is visible in a plain boot, at both viewports, with no flags.

---

## 8. Ledger

Branch `beauty2/e2-hill-mine` off `8f65062e`. Commits:

| commit | what |
|---|---|
| `86ed0db9` | U1 — the flooded gallery becomes murky working water |
| `bc14d54c` | U3 + U4 + U5a, and F-BHM-1 |
| `fb43408e` | U2 — the terraces read as cut ground, carry-forward ported first |
| `8e202d06` | U5b, the review, and the shift's boards |
| *this one* | the whole-shift board and this ledger |

**The one number that answers the brief.** The gallery — the map's named story, its central band, and
the thing the run camera is pointed at — measured over the same window in the same framing:

```
base main   luma 18.82   greenExcess 0.68    colLumaSd 2.07    a painted hole
tip         luma 37.30   greenExcess 6.21    colLumaSd 10.11   working water, moving
```

**Note on `fb43408e`'s message:** it was committed through a shell that ate three backtick-quoted
words (`files`, `heroStart`, `lossCondition`) as command substitutions. The commit's content is
correct and unaffected; the three gaps in its prose are recorded here rather than repaired, because
the branch is pushed and rewriting published history is not a hygiene fix. §4.2 above carries the
full statement.
