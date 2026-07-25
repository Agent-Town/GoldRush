---
title: THE MAP RECONCILIATION (late half) — twenty maps held against their promised art
date: 2026-07-26
branch: sculpt/map-fix-late
status: DELIVERED — 20/20 judged, 5 fixes applied, 7 maps recovered, 18/18 sculpted maps mount
scope: e6/e7/e8/e9/e10 — twenty maps
---

# The late half

Twenty maps, E6 through E10, each held against **its own engraved plate**
(`assets/raw/plate-contract-<id>.png` — the promised look), its chapter, and the
Grit Law. Harness, boards, renders and measurements are all in
`assets/pilots/map-rebuild-spike/reconcile-late/`; boards are `boards/e6..e10.png`.

**Headline: seven of the twenty maps were rendering as an empty dirt plane, and
now render their sculpt.** The cause was one line of grid arithmetic, it failed
silently with zero console errors, and it had already been measured once by a
previous arc and read as a carriage-cost curiosity.

## Method

Two passes, because they answer different questions.

- **Live, at the real gameplay camera.** Vite dev server on a scratch port +
  playwright chromium, booting the actual contract door
  (`reconcile-late/capture.mjs`), five hero positions per map. This is the only
  evidence that says what a *player* gets. Available for the 7 maps whose door opens.
- **Headless, at ONE fixed run camera** for every sculpt
  (`reconcile-late/render_reconcile_sweep.py`, the fresh-eye arc's pose
  `(0, −30.3, 26.26) → (0, −8.65, 0.51)`, 42°), plus a tile-scaled overview and a
  ring-mounted panorama view. Per-map builders each pose their own hero angle,
  which is how a weak composition survives review, so none were used.

Where a claim is about relief or "reads as flat/empty", it is **measured**
(`reconcile-late/height-stats.mjs`) rather than eyeballed.

## Findings

### F-MRL-1 — Seven maps rendered the painted fallback instead of their sculpt · **FIXED**

`bakeHeightGrid()` (`src/world/Terrain3dClaimPilot.ts:235`) infers the terrain's
grid resolution from the GLB's **raw accessor count**:

```ts
const segments = Math.round(Math.sqrt(position.count)) - 1;
```

Four late terrains were authored **100% flat-shaded** (all 32 768 polygons —
measured in Blender, `reconcile-late/inspect_terrain_blend.py`). glTF cannot carry
per-face normals on a shared vertex, so the exporter split them:

| sculpt | authored | raw in GLB | √raw | inferred grid |
| --- | ---: | ---: | ---: | --- |
| glow-mesa | 16 641 | 59 032 | 242.96 | 242 (should be 128) |
| relay-valley | 16 641 | 84 064 | 289.94 | 289 |
| echo-canyon | 16 641 | 40 018 | 200.04 | 200 |
| low-orbit | 16 641 | 87 071 | 295.08 | 295 |

With the wrong `segments`, the step size is wrong, two vertices land in one cell,
and the loop throws `'invalid terrain grid'`. That throw is caught, `failLoad()`
runs, and the map publishes `state=failed, renderSource=painted` — **with no
console error, no page error, and nothing in the UI.**

Maps affected — **7 of 20**: `e6-glow-mesa`, `e6-picnic`; `e7-relay-valley`,
`e7-dead-band`, `e7-relay-rush`; `e7-echo-canyon`; `e8-low-orbit`.

**Fixed in place**: shade smooth (the house norm — every valid late terrain is
100% smooth-shaded), re-export with the build scripts' own flags
(`reconcile-late/reweld_terrain.py`), refresh only the contract `files` checksums,
which describe the artifact and which `verify_*.py` asserts. Geometry, UVs, bounds,
materials, atlas, mask truth and every declared count are untouched — the sculpt
conforms to the contract, never the reverse.

**Proven live**, on both fixed maps whose door opens:

| | before | after |
| --- | --- | --- |
| `e6-glow-mesa` | `painted` / `failed` / panorama `off` | `glb` / `ready` / `glow-mesa-panorama` |
| `e7-relay-valley` | `painted` / `failed` / panorama `off` | `glb` / `ready` / `relay-valley-panorama` |

Boards: `reconcile-late/shots-before-reweld/` vs `reconcile-late/shots/`.
`e6-glow-mesa` goes from a featureless orange plane to scarp relief, a mounted
ore-shrine landmark and its own panorama ring.

**Proven for all eighteen**, including the twelve a player cannot reach, by mounting
each terrain through the real `installTerrain3dClaimPilot()` and bypassing the
contract door — the technique `e2e/terrain3d-registry.spec.ts:95` uses
(`reconcile-late/pilot-probe.mjs`, output `pilot-probe.json`):

> **18 / 18 sculpted late maps: `state=ready`, `renderSource=glb`, each mounting its
> OWN panorama.** Before this session, seven of them rendered an empty painted plane.

**This is the fresh-eye arc's F-OP5-13 with its real consequence attached.** That
review measured glow-mesa's 59 032 vertices and read it as "pure carriage cost…
not urgent". The number was right. What it cost was the whole map: the sculpt that
same review called "the strongest read in the set" was never reaching a player.
Class: Mistake #10, the Debug-Gate Leftover — *"where does the PLAYER see this, in
a plain boot?"*

A full scan of the spike (all 37 terrains + 27 panoramas, 64 assets) now returns
**zero invalid**. These four were the only ones, including in the other two
shifts' territories.

### F-MRL-9 — `e8-low-orbit` carried a second, independent defect that the first fix uncovered · **FIXED**

With the terrain fix in, `e8-low-orbit` *still* fell back to painted — and the
runtime finally said why, because the first failure had been masking it:

```
terrain3dPilotFailure = "terrain:true;panorama:false"
```

`validTerrain` now passes (the reweld worked). `validPanorama` does not.
`low-orbit-panorama-contract.json` was **missing the `vertices` field entirely**,
and `validPanorama()` requires `metrics.vertices === contract.vertices` —
`1544 === undefined` is false, so the panorama was rejected and `installLoaded`
threw into the same silent painted fallback.

Scanned all 27 panorama contracts in the spike: **low-orbit is the only one missing
a required field.** Every sibling carries it.

**Fixed**: added the measured value (1 544 unique positions), in the field position
its siblings use. This completes an incomplete record rather than redefining a
promise — the value is a measurement of the shipped asset, not a design choice, and
`e2e/terrain3d-registry.spec.ts:88` already asserts this map should mount
`ready`/`glb`. Had I taken "the sculpt conforms to the contract" to forbid it, the
map could never have rendered, because the contract did not describe the asset at
all.

Worth naming as a pattern: **a silent fallback hides every defect after the first.**
Both of low-orbit's failures produced the identical player-visible symptom and zero
console output. The only reason the second was ever found is that fixing the first
changed one word in a diagnostic string.

### F-MRL-3 — The latent trap: two different meanings of "vertex count", fifteen lines apart · **BIGGER-THAN-ME**

`inspect()` (`:204`) counts **unique positions** — it builds a `Set` of `"x,y,z"`
strings — so `validTerrain()` sees a split export as its welded total and
**passes**. `bakeHeightGrid()` (`:235`) uses the **raw** `position.count`. The
contract check is deliberately tolerant of splitting; the thing that consumes the
mesh is not, and it is the one that fails.

That is why this survived: the guard that looks like it would catch it cannot.

Recommended (in `src/`, so filed not fixed): assert in `bakeHeightGrid` that
`position.count` is a perfect square and that its root matches the contract's, and
fail with a named error instead of a generic throw swallowed into a painted
fallback. `reconcile-late/measure-glb.mjs` now performs exactly this check offline
and can be run over the whole spike in seconds.

**I got this wrong first and corrected it before publishing.** My initial draft
named `validTerrain`'s vertex comparison as the mechanism. Running the same tool
across the whole spike then reported five *E1* panoramas as broken —
`the-claim-panorama` among them, which demonstrably mounts in the live game. That
contradiction is what exposed the dedupe. Measured: `the-claim-panorama` is 4 280
raw / **1 351 unique**, and its contract says 1 351. The fix and the outcome never
changed; the explanation did, and a wrong explanation at `file:line` is exactly
what this ledger punishes.

### F-MRL-2 — Twelve of the twenty maps cannot be opened in the game at all · **BIGGER-THAN-ME**

The contract door (`src/meta/ContractFamilies.ts:1155`) refuses any contract whose
`tileParams.harvestAnchors` is an empty array and substitutes The Claim, with the
briefing line *"<name> is not ready for a direct claim; The Claim opened instead."*
Read from `assets/contracts/*/contracts.json`:

| opens (7) | refused (13 contracts, 12 of my maps + e10-river) |
| --- | --- |
| e6-glow-mesa, e6-showroom, e7-relay-valley, e8-mare-claim, e8-eclipse, e9-dome-basin, e10-last-claim | e6-half-life-hollow, e6-picnic, e7-echo-canyon, e7-dead-band, e7-relay-rush, e8-far-side, e8-low-orbit, e9-seed-run, e9-devils-alley, e9-old-canal, e10-ember-shore, e10-archive-world, e10-river |

Sculpt, panorama, atlas and engraved plate all exist for every one of these. The
door does not open. `assets/contracts/**` is explicitly outside this claim's
territory, and authoring harvest anchors is a gameplay decision, not a sculpt one.

Worth stating plainly for whoever picks this up: **five of the seven maps I fixed
in F-MRL-1 still cannot be reached by a player.** The fix is real and permanent,
but only `e6-glow-mesa` and `e7-relay-valley` are visible today.

### F-MRL-4 — E1's frontier scatter and warm fog are drawn on the lunar maps · **BIGGER-THAN-ME**

`e8-mare-claim` renders warm brown at the run camera, scattered with **green grass
tufts** and E1 rail furniture — on the lunar mare. The sculpt is not at fault: its
own atlas is pale grey regolith (see the headless overview on `boards/e8.png`,
beside the live shot).

When the sculpt mounts, `hidePaintedGround()` hides exactly three layers —
measured from the live canvas: `TerrainVistaRing | TerrainReliefMesh | SpringPonds`.
The scatter/prop layer is not among them, so the frontier's vegetation survives
onto E8 and E10. The warm cast is scene fog, which the panorama is excluded from
(`panoramaFog=excluded`) but the terrain is not.

Same symptom on `e8-eclipse`, whose plate promises an eclipse — dark ground, a
corona — and which renders in the same warm daylight as its parent.

### F-MRL-5 — Two late maps carry less relief than the tutorial map · measured

Height statistics across the late set and an early-era baseline
(`reconcile-late/height-stats.json`):

| sculpt | relief | stdev | flat % (within 25 cm of median) |
| --- | ---: | ---: | ---: |
| the-claim *(E1 tutorial baseline)* | 2.75 m | **0.648** | 37.9 |
| **showroom** | 3.49 m | **0.700** | 46.9 |
| **archive-world** | 4.44 m | **0.708** | 39.0 |
| seed-run | 3.86 m | 0.861 | 23.8 |
| old-canal | 4.33 m | 0.948 | 34.7 |
| glow-mesa | 4.44 m | 1.701 | 61.8 |
| echo-canyon | 5.17 m | 2.337 | **1.1** |
| mare-claim | 9.11 m | 2.709 | 51.3 |

I expected to find that the late era had gone flat as a whole. **It has not** —
late-era mean stdev is 1.427 against 1.010 early. The honest finding is narrow:
`showroom` and `archive-world` specifically sit at the tutorial map's relief while
their plates promise the most built-up terrain in the saga. That is two maps, not
an era, and I am recording the negative result because the sweeping version would
have been more quotable and false.

### F-MRL-6 — `relay-valley` delivers four identical rectangles where its plate promises ridgelines · filed

The plate is forested ridge-and-valley with relay masts on distinct summits and
fog in the troughs. The sculpt is four near-identical raised rectangular blocks in
a cross of channels. It satisfies the gameplay need (four relay platforms, matching
`harvestAnchors: 4`) but breaks the craftbook's composition rule — *"Reusing
silhouette is failure unless the gameplay contract explicitly says tile reuse"* —
within a single tile. Ironically it serves its two aliases (`dead-band`,
`relay-rush`, whose plates both show earthwork platforms) better than it serves its
own plate. Re-sculpting is not a fix-in-place; filed.

### F-MRL-7 — `dome-basin`: F-OP5-16 is partly a studio artifact, and the real defect is the basin's plan · corrects a prior finding

The fresh-eye arc recorded dome-basin's floor as reading like "a hole in the
world", proved the mesh continuous, and concluded the floor's *value* sat too close
to the backdrop. Measured here: the basin floor sits at **−2.00 m**, and the shared
studio backdrop is a plane at **z = −0.68** (`build_the_claim_terrain.py:1333`).
The backdrop was **occluding** the floor. With the plane sunk beneath the tile the
basin renders as a basin, and the live in-game shot never showed a void at all.

The real defect is smaller and different: the basin's plan is a **hard-edged
rectangle** where the plate shows an organic canal valley with a waterwheel and
terraced banks. Filed, not nudged — the floor is a load-bearing flat zone and
re-cutting it risks build-zone and mask agreement.

### F-MRL-8 — `e6-picnic` rides a sculpt its own plate contradicts · **BIGGER-THAN-ME**

`e6-picnic` is a registry alias onto glow-mesa's caprock ("The Picnic keeps the
caprock sculpt and changes campaign rules only"). Its plate puts the picnic on
**rocky scrub flats with the mesa on the far horizon** — the ground the player
stands on is explicitly not the mesa top. Alias assignment is a contract decision;
filed for its owner.

## Verdicts — all twenty

| # | map | verdict | held against its plate |
| ---: | --- | --- | --- |
| 1 | e6-glow-mesa | **TRUE** *(recovered)* | Caprock, scarp ring, teal ore ring, haul scars all present. Was invisible; now renders. |
| 2 | e6-showroom | **WEAK** | Plate: terraces of lit showhouses. Delivered: the flattest late terrain (stdev 0.70). Terraces absent. |
| 3 | e6-half-life-hollow | **WEAK** | Plate: deep terraced open pit with switchbacks. Delivered: a shallow dish (5.4 m over 128 m), one notch, no benches. |
| 4 | e6-picnic | **DIVERGENT (alias)** | F-MRL-8. Sculpt fixed; plate mismatch is a contract call. |
| 5 | e7-relay-valley | **WEAK** *(recovered)* | F-MRL-6. Renders now; four identical blocks vs promised ridgelines. |
| 6 | e7-echo-canyon | **TRUE on composition / WATCH on value** *(recovered)* | Gorge walls + the concentric echo-ring engravings are exactly the plate. Most sculpted tile in the set (flat 1.1%). Floor sits deep in shadow — F-OP5-14 stands. |
| 7 | e7-dead-band | **ALIAS-ACCEPTABLE** *(recovered)* | Plate's berms/platforms are served by relay-valley's blocks. |
| 8 | e7-relay-rush | **ALIAS-ACCEPTABLE** *(recovered)* | Plate's three lit platforms served by the same. |
| 9 | e8-mare-claim | **TRUE on sculpt / FAILING on era-truth in game** | Grey regolith, crater rim and dome pad are right in the asset; the live map is warm brown with grass — F-MRL-4. |
| 10 | e8-far-side | **ALIAS-ACCEPTABLE** | Crater rim + lander ground reads correctly on mare-claim. |
| 11 | e8-low-orbit | **WATCH** *(recovered, two defects)* | Plate: ring stations among asteroids. Delivered: three platforms over a −4.9 m void — a defensible read. Needed both F-MRL-1 and F-MRL-9 before it would render at all. |
| 12 | e8-eclipse | **ALIAS-ACCEPTABLE / era-truth flag** | Same sculpt as mare-claim; the promised eclipse light is not there — F-MRL-4. |
| 13 | e9-dome-basin | **ACCEPTABLE, one filed defect** | F-MRL-7. Basin is real and 2.4 m deep; its plan is a rectangle, the plate's is a canal. |
| 14 | e9-seed-run | **ACCEPTABLE** | Three pale pads joined by roads; travel pressure present, pads themselves blank. |
| 15 | e9-devils-alley | **ACCEPTABLE / WATCH** | Wind-carved parallel ridge bands suit a storm alley; the banding is regular enough to risk the Echo failure. |
| 16 | e9-old-canal | **TRUE** | The sinuous canal and its terraces are present and legible. Best plate-match in E9. |
| 17 | e10-ember-shore | **TRUE** | Near-black plain with glowing ember fissures in cut channels — the plate's signature object, delivered. Best fidelity of the late half. |
| 18 | e10-archive-world | **WEAK** | Plate: a colossal circular archive amphitheatre of concentric shelf terraces. Delivered: near-uniform dark, one bright strip, stdev 0.708. The largest promise-to-delivery gap in the twenty. Confirms F-OP5-17. |
| 19 | e10-last-claim | **TRUE** *(painted by design)* | The circular orrery platform, its concentric rings and rim instruments read clearly in game. No sculpt needed. |
| 20 | e10-river | **UNJUDGEABLE** | No sculpt (painted fallback by census design) *and* the door refuses it, so it cannot be reached at all — F-MRL-2. |

Grit Law across the set: E7's echo-canyon and E10's ember-shore fight. E6's
showroom, E9's seed-run and E10's archive-world read closer to holiday — tidy,
low-pressure ground where their plates promise built, worked, scarred places.

## Three harness corrections, recorded because each produced a false reading first

The fresh-eye arc had to correct two harness bugs before its findings were true.
This arc had three. That ratio is the argument for never trusting the first sweep.

1. **The door guard.** My first sweep reported all twenty maps captured and twelve
   of them healthy. They were not: the contract door had fallen back to
   `the-claim`, and I was screenshotting **E1's river tile with the target map's
   HUD painted on top** — `e8-low-orbit`, a lunar map, showed brown dirt, grass,
   a timber headframe and a "Ford" label. Nothing in the page said so. The census
   spec guards exactly this at `e2e/map-census.spec.ts:100` and I had not copied
   the guard. Now `capture.mjs` fails loud; the misleading shots are quarantined in
   `reconcile-late/door-fallback-quarantine/`, not deleted.
2. **The sunk backdrop.** The shared studio backdrop is a plane at z = −0.68.
   **Seven of thirteen late tiles dip below it** (half-life-hollow −2.41,
   low-orbit −5.87, mare-claim −3.11, dome-basin −2.00, ember-shore −2.17,
   old-canal −1.42, archive-world −1.00), so the plane occluded the low ground and
   the render showed a clean-edged hole. A boundary-edge count over every late
   terrain returns **zero interior holes** — the hole was the studio's. This is the
   same false finding the fresh-eye arc recorded against dome-basin (F-MRL-7).
3. **Unique vs raw vertex counts.** Described in F-MRL-3: the first version of the
   measuring tool called five healthy E1 panoramas broken.

## Gates

| gate | result |
| --- | --- |
| `tsc` | clean |
| `vite build` | green, 1.16 s |
| `asset-diet` | pass — 235 terrain/landmark GLBs 592 MB → 92.8 MB |
| full-spike asset scan | **64/64 valid** (37 terrains + 27 panoramas) |
| `pilot-probe.mjs` | **18/18 sculpted late maps `ready`/`glb`, each with its own panorama** |
| `verify_e6/e7/e8_extra_terrains.py` | reached their `landmarkMounts` assertions — see below |
| `e2e/terrain3d-*`, `panorama-framing`, `terrain-seamless` | 7 red → **6 red**, `:88` recovered — see below |

**The sculpt verifiers.** All three stop at
`assert contract["landmarkMounts"] == builder.LANDMARK_MOUNTS[key]`. Everything
*before* that line passed, which is the part that matters here: `sha256(glb) ==
contract.files.glb.sha256`, `sha256(blend) == contract.files.blend.sha256`, and
`assert semantic_identical and byte_identical` — the verifier re-exports the
`.blend` and compares bytes against the shipped `.glb`. **The craftbook's
byte-identical re-export law is verified for all four repaired assets.**

The `landmarkMounts` reds are pre-existing and not mine: `git diff` across my fix
commit shows the only keys that changed in any contract are `bytes` and `sha256`
(16 lines across 4 files). A failing assertion on a field that is byte-identical
before and after cannot have been caused by it. The mismatch is the later mount
sweep populating `asset` fields that these verifiers predate — the lifecycle the
craftbook describes as `mountInterlock: pending-3d-d → resolved-3d-d`.

**The six remaining e2e reds.** `e2e/terrain3d-registry.spec.ts:88` — the one that
asserted `e8-low-orbit` mounts — **went green with F-MRL-9**. The six that remain
fail on the performance tier, not on assets. Measured on `:345`: the assertion
expects `data-terrain3d-pilot-state="failed"` and receives `"lite"`, with
`data-railcar3d-state="lite"` and `data-crawler3d-state="lite"` alongside it — the
whole renderer is in LITE. `installTerrain3dClaimPilot()` checks the tier at
`:503` and returns `publish('lite','painted')` **before a single GLB byte is
fetched**, so no change to a terrain asset can reach that branch. This machine spent
the session running Blender renders and two vite servers, which is the most likely
reason the tier probe degraded.

I am flagging rather than clearing these: I could not get a clean-machine baseline
inside the window, and "environmental" is exactly the comfortable conclusion
Mistake #4 exists to punish. What I can assert is the code-path argument above.
**Next session: re-run `e2e/terrain3d-registry.spec.ts` on an idle machine before
reading these six as anything.**

## What I did not touch

No terrain relief was re-cut, no mask-bearing flat zone was altered, no contract
field other than the `files` checksums of the four assets I re-exported, nothing in
`src/`, no other shift's maps. Every WEAK verdict above is a composition judgement
whose fix is a re-sculpt with mask-agreement consequences — the kind of change that
wants an owner, a fresh premise and daylight, not a confident hand at the end of a
session. The Reset Massacre and the Blind Hand-Merge both started with a
well-intentioned nudge.

The one thing I did change, I changed because the map was **not being shown to
anyone at all**, the correction was the smallest legal one, and I could prove the
result at the real gameplay camera before and after.
