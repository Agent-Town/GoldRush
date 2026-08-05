# Review — THE e2-incline BEAUTY SHIFT

**Slice/branch/tip:** `beauty2/e2-incline`, worktree `/Users/robin/Claude/Projects/gr-task-beauty2-e2-incline`, base `8f65062e` (merge-base with `origin/main`).
**Brief:** `docs/beauty/e2-incline-brief.md` (director pass, merged `659367d4`).
**Program laws:** `docs/beauty/README.md` — rendering only (§4.6), frame p95 +15% max measured, before/after boards per upgrade, path-scoped commits, honest partials valid.
**Shift:** dedicated Opus 5 solo-writer session, 2026-08-04.
**Boards:** `reviews/shots-beauty2-e2-incline/`. `base-*` are shot from a **detached control worktree at `8f65062e` on its own dev server (port 5282)**; every other prefix is this branch on 5281. Same box, same hour, same framings, same seed. Intermediate iterations are kept at 45% linear (compaction, not deletion — the retention law); the pairs the review argues from are full-res.
**Verdict:** **4 of 5 upgrades KEPT and one cross-map defect cured. U1, U2, U3 and U4 all ship; U5 ships as motes plus the graduation frame but without the staged defeat beat.** The map's central lie — a band the sim calls water and the render drew as a void — is gone, both crossings read, and the landmarks are modelled by the sun instead of lit from inside. The p95 half of the perf law could not be measured on this box and is reported as unmeasured, not as passed.

---

## What it does

The Incline shipped with a lie at its centre. The sim calls its lower band water — it barks
"Wet powder.", the weapon card reads "Hands full of river.", a **Ford — the only crossing
bandits know** tooltip fires when you stand on it, lantern-carrying toughs wade it — and
the render drew a black void with two rail lines running through it on invisible ground.
U1 puts water there. Doing so required removing an assumption baked into the shared water
shader as a compile-time literal: that a map is crossed exactly **once, at the origin**.
`mountSculptWater` read `Terrain.fordRanges()[0]`, the surface solver classified fords by
`Math.abs(x) <= halfWidth`, and the fragment shader tested `abs(vWaterWorld.x)`. This map
is crossed twice, once per funicular line, at x −12 and x +12. All three now iterate the
declared list, and a map with a single ford at the origin emits the shipped GLSL
character-for-character.

U2 gives the ground the haul. The lower yard was, in the brief's words, the emptiest space
in the epoch; it now carries converging travel pressure from the south spawn edge onto both
crossings, a worked apron and a sleeper stack at the engine house the run starts at,
churned service margins the length of both lines, ore spill at the foot of every declared
ramp, lit lips and strata on every bench cut, coal at the upper yard's own harvest anchors,
and worked-stone re-grades under all five landmark mounts. Every coordinate is read from
the factory contract. Getting there meant disarming a re-export trap that was worse than
the brief described — see F-BI-2.

U3 takes the landmarks out of full-bright. And it found the reason no previous beauty shift's
landmark grade had ever reached a screen — see F-BI-1, which is not an e2-incline bug and is
the single most consequential thing in this shift.

U4 makes the lines move: three vents on one 8-quad instanced pool, white steam, capped, shed
on the MQ-4 ladder, `visible=false` the moment the last puff dies. No catenary cables.

U5 hangs rust-umber dust the length of the climb and closes the era on a 2:1 frame of both
lines at once.

**Rendering only, end to end: zero sim bytes.** Every placement number in U1 is read from
the sim's own declarations (`Terrain.riverGeometry()`, `Terrain.fordRanges()`,
`Terrain.waterDepth()`, `Balance.terrainSim`) or measured off the height grid the pilot
already bakes; nothing is written back. `Game.ts` gains exactly one line group: a read-only
`haulCart` view of `waveSystem.escortDiagnostics` handed to the pilot. The build-script
changes touch a Blender recipe and its verifier, neither of which the game imports.

---

## Per-upgrade verdict table

Draw calls and triangles are the **deterministic** half of the cost claim, medians of three
windows per arm, same session, `?nobeauty` vs shipped. The p95 column is empty on purpose:
see *How p95 was measured*, which is a confession, not a table.

| # | Upgrade | Verdict | Board pair (base → shift) | Δ draw calls | Δ triangles | p95 |
|---|---------|---------|---------------------------|--------------|-------------|-----|
| U1 | The lower water, both crossings honest | **KEPT** | `base-twin-crossings` → `u4e-twin-crossings`; `base-lower-crossing` → `u4e-lower-crossing` | +1 (the quad) | +2 | unmeasured |
| U2 | The yards and benches earn the haul | **KEPT** | `base-run-camera` → `u4e-run-camera`; `base-upper-ore-yard` → `u4e-upper-ore-yard` | 0 | 0 | zero cost (texture) |
| U3 | Landmarks into the golden hour | **KEPT** | `base-incline-haul` → `u4e-incline-haul` | +1 (contact pool) | +120 | unmeasured |
| U4 | The lines move | **KEPT, subtle** | `u2b-incline-haul` → `u4e-incline-haul` | +1 live, **0 drained** | ≤16 live, 0 drained | unmeasured |
| U5 | Living air + the graduation frame | **PARTIAL** | `u4-graduation` (1600×800) | +1 (mote points) | 0 (points) | unmeasured |
| — | F-BI-1 landmark-grade clobber | **CURED** | `fbi1-the-claim-base` → `fbi1-the-claim-branch` | 0 | 0 | free |

Measured together on the three render-side upgrades: desktop **90 → 92 calls**,
**105,572 → 105,692 triangles**; mobile 390 **57 → 60 calls**, **103,842 → 103,964
triangles**. +122 triangles is the water quad (2) plus five 24-segment contact ellipses
(120), exactly.

---

## The shot board

All boards `--still` (`&nowaves&nokill&nopause&nosteal&nowreck`) unless noted, desktop
1280×800, framings driven by hero teleports so before and after frame the same dirt. The
still arm exists because a live board moves its lantern-carrying toughs between runs, and
a tough standing two metres from a sample patch moved a dry-bank patch by +15 R between two
runs of the *identical* build.

1. **Plain boot, no `?debug`** — not re-shot this shift. The `e2e/e2-incline.spec.ts` route
   (seeded pressure-garden win → town → board → launch) is exercised as a gate and passes;
   it was not turned into a board. **Honest gap.**
2. **Run camera at the lower engine house (−24, −18)** — `base-run-camera.png` →
   `u4e-run-camera.png`. The brief's emptiest frame in the epoch.
3. **The twin crossings** — `base-twin-crossings.png` → `u4e-twin-crossings.png`, plus
   `*-lower-crossing.png` standing on the x −12 ford itself, where the warm shelf is
   unmistakable against the channel either side.
4. **The Incline Haul** — `base-incline-haul.png` → `u4e-incline-haul.png`: crane, pump,
   cable house, and the steam over the crane and the cable house.
5. **The upper ore yard** — `base-upper-ore-yard.png` → `u4e-upper-ore-yard.png`.
6. **Mobile 390px** — `*-run-camera-390.png`, `*-twin-crossings-390.png`.
7. **The graduation frame** — `u4-graduation.png`, 1600×800 (~2:1), both lines in one frame,
   the Baron's railcar on the lower line under its own arrival banner, the escorted cart
   climbing the upper one.
8. **F-BI-1 proof, off-map** — `fbi1-the-claim-base.png` → `fbi1-the-claim-branch.png`.

---

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean** |
| `npm run build` | **green** (asset-diet: 235 GLBs 592 MB → 92.7 MB) |
| Re-export determinism control | **bit-exact** — recipe re-run unchanged at `8f65062e`: atlas sha256 `f0f896eb6a29840b…` and glb `730e89dcf259b1ba…` both identical to the shipped bytes, identical byte lengths |
| Contract equality after the real re-export | `landmarkMounts` **5**, all carrying `asset`, `landmarkPack` present, vertices **16641**, triangles **32768**, bounds unchanged → `validTerrain()` holds |
| Live contract equality, every board | `terrain3dPilotState=ready`, `renderSource=glb`, **landmarks 5 / expected 5 / skipped 0**, diagnostics empty, both viewports |
| Console / page errors | **zero**, every board, both viewports, desktop and 390 |
| `e2e/e2-incline.spec.ts`, `map-census`, `landmark-brightness` | **green**, both projects (see *Battery*) |
| `e2e/terrain3d-registry.spec.ts` | 8 reds, **all four tests reproduce on an untouched control worktree at `8f65062e`** (see *Battery*) |
| Frame p95 ≤ +15% | **UNMEASURED — see below. Not claimed as passed.** |

### Measured picture changes

Base (`8f65062e` control worktree) → shift, identical framings, `scripts/beauty-imgdiff.mjs`:

| Frame | pixels changed | max Δ | mean luminance |
|---|---|---|---|
| run camera 1280 | 92.86% | 208 | 67.11 → 64.47 |
| twin crossings 1280 | 95.39% | 207 | **52.47 → 56.35** |
| lower crossing 1280 | 93.97% | 212 | **58.18 → 60.56** |
| upper ore yard 1280 | 96.59% | 208 | 70.21 → 64.56 |
| incline haul 1280 | 96.70% | 214 | 68.56 → 67.59 |
| run camera 390 | 83.04% | 209 | 85.24 → 86.64 |
| twin crossings 390 | 86.03% | 208 | **73.61 → 78.12** |

The two crossings frames get *brighter* (the void filled) and the two landmark frames get
*darker* (the full-bright cards stopped glowing). That split is the shift in one line.

**Per-upgrade isolation.** Base → U1+U3+U5, before any atlas paint:

| Frame | pixels changed | mean luminance |
|---|---|---|
| twin crossings | 88.02% | 52.52 → 58.57 |
| lower crossing | 85.93% | 58.23 → 62.32 |
| upper ore yard | 87.75% | 70.26 → 68.39 |
| **run camera** | **0.23%** | **67.16 → 67.15** |
| **run camera 390** | **0.85%** | 85.26 → 85.21 |

That 0.23% is the honest measurement of the brief's own complaint: **no amount of water,
landmark grading or air touches the frame the player starts in.** Only U2 could, and did —
U1+U3+U5 → U2 moves the run camera by **83.32%** of pixels, luminance 67.15 → 64.50.

**U1, the ford shelves, sampled across the water at the lower crossing** (patch means, RGB):
ford shelf **[53, 35, 13]** against channel water **[31, 27, 10]** two metres either side —
1.7× in red and a warm/neutral split (R:G 1.51 vs 1.15) that is what makes it read as a
shelf rather than a lighter patch. The warm dressing moved the channel's own R:G from
**1.08 → 1.21** against the earlier cool cut.

**U3, sampled at the incline-haul framing** (patch means, RGB, base → shift):

| Patch | base | shift |
|---|---|---|
| cable-house roof | [152, 40, 16] | **[81, 12, 7]** |
| crane iron | [123, 87, 45] | [96, 63, 28] |
| crane plinth slab | [131, 105, 70] | [100, 76, 45] |
| pump plinth slab | [155, 132, 94] | [122, 98, 62] |
| **bare ground, mid-frame** | **[54, 30, 12]** | **[54, 30, 12]** |

The last row is the control: the landmark grade moved the landmarks and left the dirt
byte-identical.

**U2, atlas value budget**, measured off-Blender at 256² before the expensive run so a
20%-clause violation could not reach a GLB: mean luminance −4.5%, per band −1.6% (water)
to −9.1% (upper ore yard) — inside the brief's ≤20%. Mask coverage of the tile: service
margins 25.0%, travel pressure 11.3%, spill fans 10.8%, landmark pads 10.1%, apron 6.5%,
bench lips 4.7%, coal 3.7%, sleepers 0.4%.

**U4, the pool**, from the canvas dataset: 3 vents, capacity 8, `spawned` 29 in ~10 s of
board time with 3 active at the shutter, detail rung 0. `spawned` is monotonic because a
2.4 s puff loses the screenshot race.

**U5**: motes 200 desktop / 90 at 390px; contact pools 5 of 5 mounts (no mount stands in
water — the ford-service-pump's ground measures **1.029** against a water line of −0.055,
so the riparian rule gives it a pool, not a collar).

### How p95 was measured — and why this review does not claim it

It was measured three times and thrown away twice.

**First instrument, discarded.** A fixed 8-second wall-clock window reported desktop
p95 **0.00 ms** while the game's own rolling window read **308 ms**. On a board running at
~3 fps, 8 seconds yields ~26 samples, the warm-up slice consumed all of them, and the p95
of an empty list is zero. The harness now counts **frames** (120 warm-up, 240 measured) and
marks any window that cannot fill as **invalid** rather than as fast.

**Second instrument, discarded.** Free-running waves put **60** enemies on one arm and
**43** on the other and called the difference an upgrade's price. The load is now a
controlled `spawnPack(24, 14)` under `&nowaves`, identical in both arms.

**Third instrument, honest and still unusable.** Interleaved A/B/A/B in one browser, order
flipped each round, three full 240-frame windows per arm:

| Viewport | `?nobeauty` windows | shipped windows | median |
|---|---|---|---|
| desktop 1280 | 249.7 / **1974.1** / 393.5 ms | 506.5 / 168.4 / 250.3 ms | 393.5 → 250.3 ms (**−36%**) |
| mobile 390 | 258.3 / 108.3 / 117.0 ms | 274.4 / 165.2 / 125.8 ms | 117.0 → 165.2 ms (**+41%**) |

**Both numbers are noise.** The untouched arm's own windows span 249.7 → 1974.1 ms — an 8×
spread within a single unchanged build — and the desktop result says the beauty arm is 36%
*faster*, which is not a thing three extra draw calls can do. `uptime` during the battery
read **load averages 14.76 / 21.58 / 30.91**, with five other headless Chromium processes
and another worktree's vite on the box. The bundled Chromium is software GL; frames here
cost 100–2000 ms where the sibling shifts measured 10 ms.

So the perf claim this review makes is the deterministic one: **+3 draw calls and +122
triangles at full detail, +0 and +0 when the steam pool drains, and zero runtime cost for
U2 because an atlas is a texture.** The p95 law is recorded as **not measured on this box**.
It should be re-run by a fire on a quiet machine before the drain treats the law as
satisfied — a corrective, not a blocker, since the deterministic cost is a rounding error
against a base of 90 calls.

### Battery

`npx playwright test e2e/e2-incline.spec.ts e2e/terrain3d-registry.spec.ts e2e/map-census.spec.ts e2e/landmark-brightness.spec.ts --workers=1` — 120 tests across both projects, 17.1 min.
`--workers=1` explicitly: this box collapses to far more failures at `--workers=6`, and a
red bought with concurrency is not a red.

**111 passed · 8 failed · 1 skipped.**

| Spec | Result |
|---|---|
| `e2e/e2-incline.spec.ts` | **PASS**, both projects — upper cart, lower boss rail, legal sluice bank at (24, 7), wave-12 railcars on the lower line, zero console errors |
| `e2e/map-census.spec.ts` | **PASS**, all maps both projects — including `e2-incline census` and the three maps F-BI-1's cure changes (`the-claim`, `e1-baron`, `e1-dry-gulch`) |
| `e2e/landmark-brightness.spec.ts` | **PASS**, both projects — including *"The Claim keeps daylight landmarks opaque, lit, and under the frame budget"*, which is the direct check on the restored grade |
| `e2e/terrain3d-registry.spec.ts` | **8 failures** — 4 tests × 2 projects |

**The eight reds are pre-existing. Control-proved, not reasoned.** A detached worktree at
`8f65062e` (`/tmp/gr-incline-control`, its own `node_modules`, its own dev server) ran the
same spec with the same `--workers=1`, and returned **11 passed · 8 failed · 1 skipped**
with an **identical failure list**:

| # | Test | Branch | Base `8f65062e` |
|---|---|---|---|
| 196 | all sixteen contracts mount terrain, panorama, grounded landmarks | ✗ ×2 | ✗ ×2 |
| 272 | rim and horizon probes | ✗ ×2 | ✗ ×2 |
| 345 | all fifteen contracts stay painted in LITE / invalid bytes | ✗ ×2 | ✗ ×2 |
| 447 | each terrain stays inside the 115% p95 budget | ✗ ×2 | ✗ ×2 |

**No failure appears on this branch that does not appear on the base.** Full lists in
`reviews/beauty-e2-incline-control-reds.txt`.

Their shapes also read as box-load artefacts rather than as defects: 345 fails because the
canvas reports `terrain3d-pilot-state="lite"` where the test expects `"failed"` — i.e. the
runtime demoted the whole tier before the test's injected bad bytes could be judged — and
447 fails as a bare 180 s `waitForFunction` timeout. Both are what a machine at load 21
does to a software-GL browser. 196 is a request-count mismatch on `e1-dry-gulch`
(8 received vs 7 expected, the extra being `riparian_dressing_pack.glb`) and 272 a horizon
standard deviation of 3.04 against a floor of 8 — neither touches this map, and both
reproduce untouched.

---

## Merge classification

Base `8f65062e`. Every file below is **LANE-TOUCHED** (this branch is the only writer since
the base); no MAIN-MOVED file, no conflicts resolved.

| File | Why |
|---|---|
| `src/world/Terrain3dClaimPilot.ts` | U1 dressing table + ford-list plumbing, U3 grade + contacts, U4 mount, U5 mote table, F-BI-1 removal |
| `src/world/Water.ts` | `fordCenters` (N fords in the shader), `bakeBed` opt-out, cache-key entry |
| `src/world/HaulSteam.ts` | **new** — U4's capped instanced pool |
| `src/game/Game.ts` | one read-only `haulCart` view handed to the pilot host |
| `assets/pilots/map-rebuild-spike/build_e2_contract_terrains.py` | `carry_forward_mount_records` port, the five incline mounts, `landmarkPack` re-attach, U2 paint |
| `assets/pilots/map-rebuild-spike/verify_e2_contract_terrains.py` | incline `mounts` 0 → 5 |
| `assets/pilots/map-rebuild-spike/incline-terrain{-atlas.png,.glb,-contract.json,.blend}` | the re-export |
| `reviews/beauty-e2-incline.md`, `reviews/shots-beauty2-e2-incline/` | this review and its boards |
| `logs/session-scratch/beauty-e2-incline/` | the harness, the bed measurement, the perf reports, the build logs |

---

## Findings

**F-BI-1 ✅ CURED HERE — every beauty shift's landmark grade was being overwritten before
the first frame.** `Terrain3dClaimPilot.ts` applied the per-contract / per-mount paint and
then called `keepLandmarkPaintReadable(model)` again five lines later with no paint
argument — `DEFAULT_LANDMARK_PAINT`, intensity 3, tint white — under the byte-identical
`host.contractId !== 'e1-night-shift'` guard. The second call wins.

✓ VERIFIED by direct render on a map this shift does not otherwise touch. Base `8f65062e`
on 5282 vs this branch on 5281, `the-claim`, same seed, same framing, both publishing
`terrain3dPilotLandmarkEmissive = 1.45`: **304,515 pixels differ (29.74%), max channel
delta 222, mean luminance 81.82 → 79.47.** The only branch change reachable by `the-claim`
is the removal of that call.

Blast radius, and why it is deliberately not scoped to this map: the dead grades are the
Claim's U3 (`LANDMARK_EMISSIVE['the-claim'] = 1.45`, `59655724`, "landmarks sit in the
golden hour"), the Baron's four-body duel paint (`LANDMARK_PAINT['e1-baron']`, `aa4277aa`),
and Dry Gulch's spring at 2.1. Scoping the fix to `e2-incline` would have shipped this map's
grade while leaving three merged upgrades dead. **The drain should expect e1-baron,
e1-dry-gulch and the-claim to look different after this merge, and should read that as
three shifts finally arriving.** `landmark-brightness.spec.ts` and `map-census` cover those
maps and are in this shift's battery for exactly that reason. Provenance of the duplicate
line is UNVERIFIED: present at `8f65062e`, absent from every non-merge commit that touches
the file, which points at a merge resolution that kept both sides.

**F-BI-2 ✅ DISARMED — the E2 re-export trap is worse than the brief states, and its own
verifier blessed it.** The brief warns that `build_e2_contract_terrains.py:854` writes
mounts with no `asset` carry-forward. Measured, it is not a stripped field:
`PROFILES["incline"]["mounts"]` was `[]`, so a plain re-export writes
`"landmarkMounts": []` and deletes all five records **and** the `landmarkPack` block.
✓ VERIFIED by running the unchanged recipe at `8f65062e` in a detached control worktree:
**108 deletions in the contract, with a byte-identical atlas and GLB.** The pilot filters
mounts on `mount.asset` *before* it counts them, so the wiped map would publish
`state=ready`, `landmarkSkipped=0` and an empty diagnostics string with **zero** landmarks
on screen — `skipped: 0` alone cannot catch this; assert `landmarks === expected === 5`.
Worse, `verify_e2_contract_terrains.py:34` declared `"incline": {…, "mounts": 0}` and
asserts equality, so that verifier went **green** on the wipe.
Cured: `carry_forward_mount_records()` ported from `build_unique_contract_terrains.py:1404`,
the five shipped mounts transcribed into the profile so the carry-forward has ids to match,
`landmarkPack` re-attached last, an `orphans` assertion that **raises** rather than shipping
a mount the pilot cannot resolve, and the verifier's count corrected to 5.
**Still open:** the same `"mounts": 0` declaration stands for `pressure-garden` in that
verifier, and the three other E2 profiles have not been checked for the same empty-mounts
shape. **Should spawn a corrective task.**

**F-BI-3 🟡 non-blocking — the sculpt has no carved bed, so the brief's U1 mechanism
half-applies.** The brief describes "murky rust-teal over the carved bed, wet margins from
the bed bake" and promises "the shelves lighten themselves once the skim knows they exist".
✓ VERIFIED off the mounted sculpt (`logs/session-scratch/beauty-e2-incline/bed.json`): the
band is **planar at y −0.18 for its entire 96 m**, at the fords exactly as much as between
them. There is no channel to read and no shelf to lighten. The bake is kept — it buys the
damp margin and will respond for free if a re-sculpt ever carves the bed — but the shelves
read because of the shader's *declared*-depth branch, not because of measured relief.

**F-BI-4 🟡 non-blocking — `?nobeauty` does not cover U3.** The kill-switch guards
`mountSculptWater`, `mountSunMotes`, `mountLandmarkContacts`, `mountRushEmbers` and now
`mountHaulSteam`, but the landmark **paint** is applied on the mount path with no guard, so
the A/B arm cannot isolate the emissive grade. It costs nothing at runtime (a material
property, not a draw), so the perf law is unaffected — but a future shift that wants to A/B
a grade must add the guard first.

**F-BI-5 🟡 non-blocking — the re-exported contract's embedded `maskTruth` was stale.** The
shipped contract carried `stakeMarkers[].lossCondition` while the mask table and the factory
contract carry `heroStart`. The re-export refreshes it, which means `verify_e2_contract_terrains.py`'s
`assert contract["maskTruth"] == mask_document["maskTruth"]` was failing against the shipped
file before this shift and passes after it. Render-side only — the pilot reads
`maskTruth.waterMask` and nothing else — but somebody should confirm the other three E2
contracts are not carrying the same stale key.

**F-BI-6 🟡 non-blocking — the p95 half of the perf law is unmeasured.** See above. Needs
one battery on a quiet box. Deterministic cost is +3 draw calls / +122 triangles.

**F-BI-7 🟡 non-blocking, NOT this shift's — `artifacts/terrain3d-registry/fingerprints-*.json`
is stale against current code.** Running the battery rewrites it, and the diff is not
this branch's doing: the committed baseline was generated 2026-08-01 and its payload lacks
keys the current contract emits (`size`, `fords`, …), while `onAssetRequests` moves 7 → 96.
Both `off` and `on` hashes stay equal to each other in both versions, which is the property
that test actually asserts, so nothing is broken — the checked-in baseline has simply
drifted.

The `artifacts/` churn is split on purpose. **Committed:** the nine
`artifacts/map-rebuild-spike/incline-*.png` verdict boards, because those are *my
re-export's own output* and leaving them behind would put stale verdict boards next to a
new atlas — the exact stale-evidence shape this repo keeps stepping on. **Not committed:**
`map-census/table.md` (a timestamp), `landmark-brightness/after-*.png`,
`terrain3d-registry/fingerprints-*.json`, and the `fix-*` / `wire-*` / `shots-wire-campaign`
captures — that is gate output tangled with pre-existing drift, and folding it into a
beauty slice would hide the drift rather than fix it. Those are left modified in the
worktree for the drain to see. **Should spawn a corrective task to refresh the baseline
deliberately.**

---

## Deviations from the brief, stated plainly

1. **The water quad is cut to half-width 6.25, not the sim's declared 8.** The sculpt's
   south approach falls *away* from the band (y −0.22 at z −8, −0.35 by z −10) straight
   into the lower yard's build zone, so a quad at 8 would have stood water on legal sluice
   bank — the brief's own DON'T and the contract's own `waterVisualRuling`. 6.25 is the
   contract's `placeableBankStartsBeyondAbsZ`, so the geometry now ends exactly where
   placeable ground begins. Reversal cost: one number in `SCULPT_WATER_DRESSING`.
2. **The glints sit at z ∓4.45, not at the declared sluice samples' z ∓7.** The samples are
   outside the water surface; the shader draws a glint as a thin line at the anchor's z, so
   an anchor on dry ground lights nothing. They keep the samples' x (±30) and are carried in
   to the near bank lip, which is what the Claim's own rule does.
3. **The graduation frame is staged, not earned.** The brief asks for the cart cresting
   while "the lower railcar cools in the cut". The board frames both lines at 2:1 with the
   railcar *live* on the lower line and the cart climbing the upper one. Killing the railcar
   to get the cooling beat needs a defeat-state stage this harness does not have. **Honest
   partial.**
4. **U4's ore-dust drift at the crest was not built.** The brief lists it as "a few seeded
   quads in the mote family" alongside the steam. The steam and the mote field shipped; the
   separate crest-dust seed did not. Reversal cost: one `createSunMotes` call.
5. **No catenary haul cables** — as instructed (Mistake #14). Stated because it is the most
   obvious thing a reader will look for on a funicular map and not find.
6. **The atlas paint went through two cuts.** The first shipped six identical sleeper bars
   at 0.26 and read as black tape on the dirt; halved, jittered per timber and given a lit
   top edge in the second.

---

## THE HONEST LINE — what still looks wrong

- **The water is legible, not beautiful.** It is one flat sheet at one depth, because the
  bed is one flat sheet at one depth (F-BI-3). The fords read, the shoreline has a damp
  margin, and the band is no longer a void — but there is no current, no deep channel, and
  the low-frequency value noise reads as soft rectangles at the run camera if you look for
  them. A carved bed in a future re-sculpt would fix all three for free.
- **The steam is subtle to the point of deniability.** Two visible plumes at the crane and
  the cable house, and they took four cuts to become visible at all: the first reported 29
  puffs spawned while rendering nothing a player could see. It is now white, capped and
  shed-registered — and at 390px it is very nearly not there.
- **The cart's plume has never been photographed.** It is wired to the escort diagnostics
  and gated on `moving`, and the still boards run `&nowaves`, so no board in this review
  shows the thing U4 exists for. The code path is exercised; the picture is not.
- **The upper ore yard's coal glitter is invisible at the run camera.** It was authored at
  a 41× tile frequency and reads as noise, not as broken face, at the shipped zoom.
- **The bench terracing reads as contour lines.** Three straight bands across a 96 m
  hillside, because the ramps are declared as three straight bands. It is honest and it is
  a little cartographic.
- **The run camera is better, not good.** 83% of its pixels moved and its luminance dropped
  2.7 points, and it is still a wide umber field with a rail down one side. The apron, the
  sleepers and the converging ruts give it travel pressure; they do not give it a subject.
  The brief was right that this is the emptiest frame in E2, and it is still the emptiest
  frame in E2.
- **The perf law is half-kept.** +3 draw calls is a real, deterministic, defensible number.
  "p95 ≤ +15%" is not claimed, because this box could not resolve it and I would rather
  report an unmeasured law than a measured-looking number that says the beauty arm is 36%
  faster than the arm with the beauty turned off.

**Nothing here was judged by a human playing it.** Every keep/revert above is my read of a
render at a pinned camera against a written brief. The pinned camera is a good instrument
and a poor player, and the owner has not seen a frame of it.
