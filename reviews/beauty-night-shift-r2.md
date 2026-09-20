# Review — BEAUTY SHIFT: Night Shift, ROUND 2 (`e1-night-shift`)

**Slice/branch/tip:** `beauty2/ns-r2` · worktree `gr-task-beauty2-ns-r2` · solo-writer Opus 5 shift, 2026-08-03
**Brief:** `docs/beauty/e1-night-shift-brief.md` · **Round 1:** `reviews/beauty-night-shift.md` (U1–U3 shipped; U4/U5 blocked)
**Task:** finish what the pipeline defect blocked — fix or lawfully route around it, then U4 and U5.
**Verdict:** ✅ **the pipeline defect is FIXED, not routed around** · ✅ **U5 SHIPPED** · ⚠️ **U4 SHIPPED AS ART, NOT AS AN EXPERIENCE** — the panorama is provably not on camera, measured three ways. One owner question.

## What it does

Round 1 stopped at "the builder no longer reproduces the shipped art" and left the sky and the ground alone. Round 2 found that the pipeline was never broken — it had **drifted**, in a way that is exactly reproducible and therefore exactly fixable — pinned the Epoch 1 panorama generation with a guard that reproduces all ten shipped E1 artefacts byte for byte, and then used it to paint the sky the brief asked for. It also re-engraved the night-shift ground: a compacted road ribbon with hatched shoulders along the *whole* mounted road, boot-trampled pads under all seven lantern posts, and oil and coal at the lampworks.

And it answered a question round 1 could not: **where does the player see the sky?** Nowhere. That is the honest headline, it is measured three independent ways — and it is not mine: the *baron* beauty shift filed the same finding the same night (`F-BEAUTY-BARON-3`, in `tasks/BACKLOG.md`) and I did not read it before measuring. What this round adds is confirmation from two directions the baron shift did not use, and sharper numbers. It is why U4 ships labelled as art rather than as a beauty upgrade.

Two more of the baron shift's findings turn out to be load-bearing here: its `landmarkMount` cure (`c4ab1b49`) is the only reason U5's re-export kept its five landmarks, and its `F-BEAUTY-BARON-4` — *the shipped baron panorama predates its own builder* — is **cured by this shift's fix**, along with the-claim, dry-gulch and twin-banks.

## Verdict table

| # | Upgrade | Verdict | Measured effect | p95 (night moments) | Draw calls |
|---|---------|---------|-----------------|---------------------|------------|
| **PD** | The art-pipeline defect (round 1 F-2/F-3; also `F-BEAUTY-BARON-4`) | ✅ **FIXED for all five E1 maps** | E1 panoramas reproduce **10/10 byte-for-byte** from the pinned builder; terrain reproduces geometry exactly and its atlas to ±1/255 | — | — |
| **U4** | A night sky that exists | ⚠️ **SHIPPED AS ART** | star field + moon + furnace in the atlas; **0 of 216 ring vertices on canvas**, 0 probe pixels in 18 camera samples | unchanged | unchanged |
| **U5** | Worked ground under the lanterns | ✅ **KEPT** | road core **54 → 96** against 54 off-road; pads **74 → 97**; 32.4 % of the day frame changed | dark −5.2 %, approach 0.0 %, dawn +1.1 % | 112 → 112 |

**A/B'd and rejected, each by measurement:**

| Tried | Result | Rejected because |
|-------|--------|------------------|
| U5 road core lifted to **119** (compacted ×1.95, mix 0.52) | road read as chalk, a bone-white diagram | this is the map whose standing complaint is that its pools already wash out to cream; a chalk road makes it worse. Re-cut to ×1.34 / 0.45 → core 96 |
| U5 pad rim at 0.22 | pads read as **rings**, not as ground | the mark wanted is trodden earth; weight moved from value into scuff (0.55 + scuff × 0.45) and the rim dropped to 0.13 |
| U4 moon disc measured against the ridge line | sheared into an ellipse — a smudge with a bright middle | the glow band should follow the ridge, the disc must not; anchored to a fixed `v` instead |
| U5 coal at 240 chips × 0.14–0.44 m, mix 0.72 | the lampworks read as an ink blot | cut to 150 × 0.10–0.30 m at 0.55 — scatter, not spill |
| Repainting the E1 panorama with today's shared builder | 324 KB → 739 KB of **visibly different art** | that is the round-1 defect itself; it would have silently replaced five approved panoramas |

---

## 1. THE PIPELINE DEFECT — diagnosis, and the fix

### It was never nondeterminism. It was unversioned drift of a shared generator. ✓ VERIFIED

`build_contract_panoramas.py` began life as the five-map **E1 panorama builder** — its own first line said so: *"Build separate render-only panorama rings for the five Epoch 1 maps."* The five shipped E1 panoramas were built from it at **`af51c78e`** (2026-07-14, "art: correct E1 panorama projection"). It was then generalised **in place** into the all-epoch generator for E2–E10: **+1107 / −27 lines**, and **6 of its 13 functions rewritten** —

| function | af51c78e | today |
|---|---|---|
| `make_atlas` | 140 lines | **415** |
| `make_ring` | 64 lines | **439** |
| `ridge_height` | 19 | 119 |
| `distant_ridge_height` | 14 | 72 |
| `contract_for` | 51 | 82 |
| `make_material` | 18 | 36 |

Several of those edits retuned code the E1 keys flow through: the haze mix **0.52 → 0.78**, the near-band base `paper*0.43 + dark*0.27` → `paper*0.51 + dark*0.22`, the near erosion `clip(0.96 + d*0.14, 0.91, 1.03)` → `clip(0.91 + d*0.72, 0.78, 1.07)`, a brand-new terrain-atlas seam-continuity block, and new sky/ridge ring geometry. **E1 was never re-run, and nothing in the repo guarded it.** From 2026-07-14 onward, `build_contract_panoramas.py -- night-shift` produced a *newer generation* of art, not the shipped art.

### The decisive experiment

The af51c78e builder was checked out into a mirror tree at the same depth (so `ROOT = parents[3]` and `OUT` resolve as they did), given **today's** `build_the_claim_terrain.py` helper and **today's** source plates, and run on Blender 5.1.2:

| artefact | shipped | rebuilt from af51c78e |
|---|---|---|
| `night-shift-panorama-atlas.png` | `e1e0b583240a7d04…` | **identical** |
| `night-shift-panorama.glb` | `f59a156aec2001a4…` | **identical** |
| the other four E1 maps (atlas + GLB) | 8 files | **8 identical** |
| `*-panorama.blend` | — | differs by the length of the absolute path Blender stores inside it |

**10 of 10 art artefacts byte for byte.** The only contract field that moves is `files.blend.{bytes,sha256}`, which is that path artefact and nothing else — verified by diffing the contract, which shows exactly those two lines.

The three helper functions the E1 builder uses (`reset_scene`, `image_pixels`, `luminance`) are unchanged since af51c78e, which is why re-homing the generation onto today's helper is safe — proven, not assumed: the byte-exact run above used it.

*(A side finding, recorded because it will bite the next person: the current builder reads `OUT/{key}-terrain-atlas.png` and `OUT/{key}-terrain-contract.json`. Rebuild it into a scratch directory without those and you silently get different art — that is the 738,940 B vs round 1's 739,170 B discrepancy, not a determinism failure.)*

### The fix

- **`assets/pilots/map-rebuild-spike/build_e1_contract_panoramas.py`** — the pinned E1 generation, with the whole provenance in its docstring. This is not a fork: it is the file restored to what it was before it was repurposed.
- **`assets/pilots/map-rebuild-spike/verify_e1_panoramas.py`** — rebuilds into a `TemporaryDirectory` (the shipped tree is never written) and asserts every shipped sha256. Run now: **`all 10 E1 panorama artefacts reproduce byte for byte`**, including the new night sky.
- **`build_contract_panoramas.py`** — `main()` now refuses the five E1 keys with a message that points at the E1 builder. Verified non-vacuous: `-- night-shift` raises. The E1 profiles **stay** in `PROFILES`, because `map_index = list(PROFILES).index(key)` places every later map's cloud edits off that ordering; removing them would silently repaint E2–E10.

### Round 1's F-3 (the terrain half) is resolved, and it was fixed by a sibling shift

F-3 reported that rebuilding the terrain drops the `landmarkPack` key (5,480 B → 4,715 B). Measured today on main: **it does not.** The carry-over lives at `build_unique_contract_terrains.py:1434`, and `git log -S` dates it to **`c4ab1b49`** — the *baron* beauty shift's U1, committed **2026-08-03 00:36:49**. Round 1's tip `cd5ba9ed (archive: pruned by the A3 rewrite)` is 00:56:20 and `c4ab1b49` is **not an ancestor of it**: the two beauty shifts were running concurrently, and the baron shift fixed the defect twenty minutes before the night-shift shift wrote it down, on a branch round 1 could not see. F-3 was true and is now moot.

What is left of it is cosmetic and worth knowing: the regenerated contract emits `landmarkPack` *before* `files` instead of after, so the key appears to move in a diff. Nothing reads it positionally.

Terrain reproduction, measured the same way (current builder, mirror tree, HEAD art):

| check | result |
|---|---|
| GLB geometry | **identical** — 16641 vertices, 32768 triangles, bounds `[-32,-0.47,-32]…[32,3.18,32]` |
| terrain contract | identical apart from `files` and the `landmarkPack` position |
| atlas pixels | 17.9 % of samples differ **by exactly ±1/255**, max delta 1, mean delta 1.00 — encoder-level, not art |
| path independence | the in-repo build and the out-of-tree build produce the **same GLB sha** |

---

## 2. U4 — the sky, and the measurement that changes what it means

### The art ✓ SHIPPED

`night_sky()` in the pinned E1 builder adds three authored features, all above the far-ridge line, all pure paint:

1. **A pin-dot star field** — a fixed-seed scatter (900 accepted dots) stamped as small patches, not a noise field. Density rises toward the ridge and thins to a plain zenith (the **Ceiling law**), and the top 6 % of the ring stays bare parchment.
2. **A moon** — a cool disc at `u = 0.185` with a glow band lying along the eastern ridge line, sitting behind a ridge silhouette exactly as the brief asks.
3. **The far furnace** — the shipped rust smudge at `u = 0.58` grown into a hot core on the ridge line, a lifted heat fan, and a lopsided smoke lean, so it cannot read as a symmetric sunset (the **Echo law**: the warm event and the cool event are on opposite sides of the ring).

Geometry untouched: **vertices 1351, triangles 1920**, every `projection` and `mount` field byte-identical; the contract was regenerated in the same commit and moves only its `files` block.

### F-7 — THE PANORAMA HAS NO PIXELS. ✓ VERIFIED THREE WAYS

Round 1's F-1 established that the panorama is `KHR_materials_unlit` and never dims. This shift found the harder half of the same truth: **on the shipped gameplay camera, no part of any panorama is ever on screen.**

**(a) Paint it and look.** The night-shift panorama atlas was rebuilt as eight loud `v`-bands and screenshotted at day, dusk, dark and dawn: not one probe hue appeared (`reviews/shots-beauty-night-r2/bandprobe`, compare it against any shipped shot — they are the same picture). Because a white band can be faked by lit ground, the probe was rebuilt as **pure green at eight brightnesses** — nothing in this warm palette can counterfeit it — and scanned from **9 hero positions × 2 phases**:

```
wave  1 / wave 10   hero 0,0 · ±30,±30 · 0,±31 · ±31,0
panorama mounted: 1920 triangles, 1351 vertices, 1 material
panorama pixels:  0        (all eighteen samples)
```

**(b) Project the ring through the real camera.** `scripts/beauty-sky-visibility.mjs` raises a probe 50 m ahead until it leaves the top of the frame:

| measurement | value |
|---|---|
| a point 50 m ahead leaves the frame at | **y = −0.25 m** |
| ⇒ the highest thing on screen is | **27.9° BELOW the horizon** |
| the ring's lowest vertex is | **10.8° below the horizon** — 17.1° above the frame top |
| ring vertices on canvas | **0 / 216** |

**(c) The arithmetic agrees.** `Balance.camera.offset` is `(0, 26.2, 18.3)` and `CameraRig` looks at `target.y + 0.45, target.z − 3.35`: a **49.9° down-pitch**, and half of the 42° fov leaves the frame top **28.9° below the horizon**. Neither zoom stop escapes it (0.7× → 26.9° down; 1.6× → 30.8°, *worse*), and neither does the debug rig at its extreme (`cameraOffsetY 12`, `cameraOffsetZ 24` → 1.9° below the horizon, still below it).

`screenPoint`'s own `inView` is worse than useless here and cost an hour: the ring is past the camera's **100 m far plane** while `preparePanorama` pins `gl_Position.z = w * 0.999999` so it renders anyway, and `inView` tests NDC z ∈ [−1, 1]. It reports "off screen" for geometry you are looking straight at, and reports points **behind** the camera as on screen because projection flips their sign. Both scripts now say so in their heads.

**What fills the sky's screen real estate instead** is the continuation skirt (`createContinuation`), an apron of terrain-atlas paint stretched from the tile edge out to the ring's foot — which is why the top third of the dusk frame carries U3's oxblood and the top third of the dark frame is black. That is lit ground, not sky.

### Consequence, stated plainly

U4 is correct art that no player can currently see, and it is not free: the panorama atlas grows **324 KB → 531 KB** (+63.6 %) and the GLB **474 KB → 681 KB**, for a star field behind the camera. It costs **zero draw calls and zero triangles** at runtime, and every gate is unmoved by it. It is kept because it is now reproducible forever, because the brief asked for it, and because the moment the camera question is answered it lights up with no further work. **It is one word from being reverted if the owner would rather not carry the bytes.**

---

## 3. U5 — worked ground under the lanterns ✅ KEPT

The brief's read was "landmarks on a smear". Measured, it was worse than it sounded: the mounted `night_work_road` body spans **z −29.7 … 29.7** (its GLB bounds), and the shipped atlas painted a soft brown wash over **z 8 … 27** of it. **Four fifths of the mounted road lay on unprepared mud**, and the seven posts — whose positions are read straight off the landmark pack's `authoredFixturePositions`, not guessed — had nothing under them at all.

`worked_ground()` adds, in atlas paint only:

- **The ribbon.** The full mounted road, the two shipped southern diagonals, and four spurs, as a **compacted core** with a softer verge and short perpendicular hatch ticks on the shoulders. The ticks drift in spacing and weight along the road (`sin(along·0.21)`) so they read as a hand rather than a ruler.
- **Seven boot-trampled pads**, radius 2.45–3.0 m, weighted toward their scuff rather than their value, with a light kicked rim.
- **The lampworks at (8, 18)**: three unmatched oil slicks and 150 coal chips blown south-west in a thinning fan.

Two shipped things are protected by construction: every mark is attenuated by the `slate` mask, so **`dark_rock_shoulders` stay the map's value anchors**, and marks fade across the water band so the shipped ford keeps the crossing.

| sample (atlas, sRGB) | before | after |
|---|---|---|
| road core (0, 20) | 82, 65, 47 | **96, 77, 57** |
| off-road (6, 20) | 54, 43, 31 | **54, 42, 30** (unchanged) |
| pad under the post at (−16, 18) | 74, 58, 41 | **97, 79, 58** |
| dark rock shoulder (26, 10) | — | **44, 35, 26** — still the darkest ground on the map |

**Where it lands in the frame**, by pixel diff of the before/after boards:

| moment | pixels changed | max delta |
|---|---|---|
| 01-day | **32.44 %** | 158 |
| 02-dusk | 1.11 % | 141 |
| 03-dark-pool | 0.46 % | 63 |

That is the honest shape of it: **U5 is a day and dawn upgrade.** At dusk and full dark this map is too dark for ground paint to read, which is the map working as designed — the brief's own DON'T is "don't brighten the darkness itself". `reviews/shots-beauty-night-r2/proof/diff-desktop-01-day.png` shows the ribbon, its hatch ticks and a trodden pad picked out cleanly against unchanged ground; the dusk and dark diffs beside it show how little of a black frame any paint can reach.

The atlas itself: `…/proof/u5-terrain-atlas-900.png`.

Geometry untouched: **16641 vertices, 32768 triangles**, `boundsMeters`, `meshCount`, `materialCount`, `texture`, `landmarkMounts`, `panoramaMount` and `waterTruth` all byte-identical in the regenerated contract. Only `files` moved.

---

## Evidence

| Gate | Result |
|------|--------|
| `tsc --noEmit` | **clean** (exit 0) |
| `npm run build` | **green**, asset diet within ceilings |
| `night-mode-truth.spec.ts` | **4/4 green**, desktop + mobile |
| `e3-day-night.spec.ts` | **2/2 green**, desktop + mobile |
| `e1-night-shift.spec.ts` | 12 green / 6 red — **all six control-proven pre-existing**, below |
| `night3d-perf.spec.ts` `:67` | **RED on both arms** — control tree fails it too, both projects |
| `night3d-perf.spec.ts` `:98` | green, both projects |
| `verify_e1_panoramas.py` | **10/10 byte for byte**, including the new sky |
| `npm run test:ledger-guards` | **42 tests / 42 pass / 0 fail** (run after the BACKLOG edit) |
| Console / page errors | **zero** across every board capture (the rig asserts `errors == []`) |
| Draw calls | 112 → 112 at the dark pool; ±1 elsewhere, i.e. the enemy count |
| Boot health on the new art | `terrain3dPilotState=ready` · `renderSource=glb` · **landmarks 5** · 32768 triangles / 16641 vertices · zero errors |

**Mistake #10, and a trap I walked into answering it.** *Where does the player see this in a plain boot?* U5 is the ground the player stands on at day, dusk and dawn — the boards are that answer. But my first attempt at the check booted `/?contract=e1-night-shift` **without `?debug`** and cheerfully reported `ready / glb / landmarks 5` for **the-claim**: `?contract=` is debug-gated, so a no-debug URL silently falls back to the default contract, and the terrain counts happen to be identical (both are 128×128 grids). The screenshot is kept, honestly named, at `…/proof/plain-boot-falls-back-to-the-claim.png`. Anyone writing a plain-boot probe for a *specific* contract has to drive the contract UI; a query parameter will lie to them.

### The reds are pre-existing, and one of them was worth the trouble to prove

A detached control worktree at `34a4aaad (archive: pruned by the A3 rewrite)` (this branch's pipeline-fix commit, art byte-identical to main) with its own dev server on a second port, same specs, `--workers=1` both arms:

| test | control | this branch |
|---|---|---|
| `night3d-perf:67` desktop + mobile | ✘ ✘ | ✘ ✘ |
| `e1-night-shift:271` desktop + mobile | ✘ ✘ | ✘ ✘ |
| `e1-night-shift:372` desktop + mobile | ✘ ✘ | ✘ ✘ |
| `e1-night-shift:435` **mobile** | ✘ | ✘ |
| `e1-night-shift:435` **desktop** | ✓ *in the batch* | ✘ |

That last row is the one that mattered. `:435` samples ground luminance inside a lantern pool and 11 m outside it, and asserts `inside/outside ≥ 3` and `outside ≤ 0.06`. **U5 paints a road spur within 1.5 m of the desktop "outside" sample**, so the obvious reading is that I brightened the dark and the guard caught me. The numbers say otherwise:

```
this branch   {"inside":0.10553176470588235,"outside":0.0481443137254902}
this branch   {"inside":0.10219…          ,"outside":0.0481443137254902}
control run 1 {"inside":0.10219215686274509,"outside":0.0481443137254902}
control run 2 {"inside":0.10219215686274509,"outside":0.0481443137254902}
control run 3 {"inside":0.10528…          ,"outside":0.0481443137254902}
```

`outside` is **bit-identical between the branch and the unmodified tree** — the same `0.0481443137254902` round 1's F-5b recorded as invariant across every observation it made. The failure is entirely `inside`, sitting at the bottom of the 0.096–0.237 flicker range F-5b documented, and the control fails it **3 of 3 when run alone** while passing inside a larger batch, i.e. it depends on which phase of the lantern flicker the fixed `waitForTimeout` lands on. Round 1's four-run control on pristine `origin/main` found the same value (`inside ≈ 0.102`). **F-5b's recommendation stands and is now twice-evidenced: that assert wants to sample over N frames, or pin the flicker, before anyone treats it as a gate.**

### Perf, measured honestly (the +15 % law)

Same board run twice on identical code gives the real noise floor:

| moment | before | after | repeat | after vs before | **repeat vs after (identical code)** |
|---|---|---|---|---|---|
| 03-dark-pool | 9.6 | 9.1 | 9.2 | **−5.2 %** | 1.1 % |
| 03b-dark-approach | 9.5 | 9.5 | 9.4 | **0.0 %** | −1.1 % |
| 04-dawn | 9.4 | 9.5 | 9.3 | **+1.1 %** | −2.1 % |
| 01-day | 17.4 | 22.0 | 20.1 | +26.4 % | −8.6 % |
| 02-dusk | 15.4 | 9.2 | 19.4 | −40.3 % | **+110.9 %** |

The **night** moments — the ones this map is about — repeat to ≤ 2.1 % and show no regression against the +15 % law. The day and dusk moments are dominated by asset-streaming settle: 02-dusk swings **111 % between two runs of byte-identical code**, so the apparent +26.4 % on 01-day sits inside a band where nothing can be claimed in either direction. Mobile agrees: dark 0.0 %, approach −4.2 %, dawn −1.1 %, day/dusk −22 % and −28 % (noise, in the flattering direction).

**One methodological trap, recorded:** the first board rig launched Playwright's bundled headless Chromium, which falls back to software GL and reports p95 of **270–600 ms**. Those numbers are meaningless and were thrown out; both scripts now launch `channel: 'chromium'`. The discarded board is kept at `reviews/shots-beauty-night-r2/before` rather than deleted (Retention Law) — it is a real measurement of the wrong thing.

## Shot pairs

Contact sheet (top row before, bottom row after; day · dusk · dark · dawn):
`reviews/shots-beauty-night/contact-sheet-r2-before-after.png`

| Brief's shot | Before | After |
|---|---|---|
| 1. Plain day boot | `shots-beauty-night/r2-before/desktop-chrome-01-day.png` | `…/r2-after/desktop-chrome-01-day.png` |
| 2. Dusk over the terraces | `…/r2-before/desktop-chrome-02-dusk.png` | `…/r2-after/…` |
| 3. Full dark at a pool edge | `…/r2-before/desktop-chrome-03-dark-pool.png` | `…/r2-after/…` |
| 3b. Wrecker approach | `…/r2-before/desktop-chrome-03b-dark-approach.png` | `…/r2-after/…` |
| 4. Dawn at wave 25 | `…/r2-before/desktop-chrome-04-dawn.png` | `…/r2-after/…` |
| 5. Mobile 390 px full dark | `…/r2-before/mobile-chrome-03-dark-pool.png` | `…/r2-after/…` |
| 6. **The night panorama at dusk** | — | **see F-7: it is not on camera.** The art is `…/proof/u4-panorama-atlas-1024.png` and `…/proof/u4-moon-and-furnace-crop.png`; the proof that it is unseen is `shots-beauty-night-r2/bandprobe` |

`r2-after-repeat` is the identical-code repeat that produced the noise floor. `shots-beauty-night-r2/bandprobe` is the eight-band panorama probe. Both kept whole.

## Findings

**F-7 — the panorama is never on camera, on any map. NOT NEW: this independently confirms `F-BEAUTY-BARON-3`.** ✓ VERIFIED (three ways, §2). The *baron* beauty shift filed it first, the same night, in `tasks/BACKLOG.md`: *"the U5 'repaint the panorama' upgrade is UNREACHABLE at the shipped run camera on EVERY map using this rig (fov 42, offset y26.2/z18.3 → frame top ~25° BELOW horizontal, sky ring spans −9°..+30°); the other four E1 briefs carry the same U5, so retarget them at the ring FOOT before those shifts spend a batch on sky."* **I did not read that before measuring, and should have — it is in the ledger, which is exactly where the Completeness Law says to look first.** What this round adds is independent confirmation from a different direction and sharper numbers: frame top **27.9°** below the horizon (baron estimated ~25°), ring **−10.8° … +28.6°** (baron: −9° … +30°), plus the two empirical proofs the baron shift did not run — **0 probe pixels** from a repainted atlas across 18 camera samples, and **0/216** ring vertices on canvas. Two shifts, two methods, same answer. **This applies to all 34 panorama GLBs in `assets/pilots/map-rebuild-spike/`** — roughly 30 MB of authored horizon art with no viewer. **OWNER QUESTION**, with a recommendation below.

**F-7b — this shift CURES `F-BEAUTY-BARON-4`.** ✓ VERIFIED. The baron shift filed *"the shipped baron panorama predates its own builder (re-export = 1351→1836 verts; the added county ground skirt renders as a pale halo behind the fort, unjudged on this contract)"*. That is the same drift diagnosed in §1, and the pinned E1 builder fixes it for baron as well as for night-shift: `verify_e1_panoramas.py` reproduces `baron-panorama-atlas.png` (`1a3eb50e320015ce…`) and `baron-panorama.glb` (`82753d0923986d72…`) **byte for byte**, at the shipped 1351 vertices. The same is true for the-claim, dry-gulch and twin-banks. **Four other maps' panoramas were quietly un-rebuildable and now are not.**

**F-7c — `F-BEAUTY-BARON-2`'s cure is what let U5 keep its landmarks.** ✓ VERIFIED. The baron shift found that a plain terrain re-export drops `asset`/`terrainConformOffsetY` from every `landmarkMount` — a silent zero-landmark fallback, Mistake #10 — and cured it in `build_unique_contract_terrains.py` (`c4ab1b49`), which is the builder night-shift also uses. Because that cure was already on main, U5's re-export kept `landmarkMounts` **byte-identical** and the five mounted landmarks still load. Had this shift run one night earlier it would have shipped a map with no landmarks on it. Recorded so the value of that fix is on the record, and because the *other five* terrain builders the baron shift named still carry the defect.

**F-8 — the E1 panorama generation had no owner, no pin and no guard.** ✓ VERIFIED (§1). Fixed here for E1. The same shape of hazard is still live for every other family that rides `build_contract_panoramas.py`: nothing asserts that any shipped panorama still reproduces. `verify_e1_panoramas.py` is the pattern; generalising it to the other families is a small, obviously-worth-it task and is **not** done here (out of this shift's scope, and it needs a rebuild of ~29 more panoramas to establish the baseline).

**F-9 — `screenPoint().inView` is actively misleading for far geometry.** ✓ VERIFIED (§2b). It answers "is this inside the view frustum", which for anything past the 100 m far plane is "no" even when the pixel is on screen, and for anything behind the camera can be "yes". Any future beauty or e2e work that asks "is X visible" with `inView` will get a wrong answer. Non-blocking; both r2 scripts document it at the top.

**F-10 — `e1-night-shift:435` is a flicker-phase coin flip, now twice-evidenced.** ✓ VERIFIED (§Evidence). Fails 3/3 alone on an unmodified tree, passes in a batch, with `outside` bit-identical throughout. Round 1 filed this as F-5b; this round independently reproduced it while trying to blame itself. The corrective is a sampled or pinned assert, and it is **not** done here — it is a change to a gating spec, which a beauty shift should not make on its own authority.

**F-11 — U4 costs 206 KB for art with no viewer.** ✓ VERIFIED. `night-shift-panorama-atlas.png` 324,251 → 530,580 B; the GLB 474,332 → 680,660 B. Zero runtime cost (no new draw calls, no new triangles, no new material), but a real download. Reversible with one word — the paint is one gated block in `build_e1_contract_panoramas.py` and one rebuild.

## THE HONEST LINE — what still looks wrong

**The biggest gap between this map and its style anchor is no longer the sky — it is that the sky does not exist as a thing the player can look at.** "A black parchment page where light is ink" wants a horizon to hold the dark against; this map's camera never lifts above 27.9° below the horizon, so the dark it holds against is the far ground under fog. Painting stars was the brief's answer and it was the wrong shape of answer, through no fault of the brief: it assumed the panorama was standard-lit and on camera, and it is neither.

**U5 is real and it is a daylight upgrade.** A third of the day frame changed, the road reads as compacted and hatched, the posts stand on trodden pads. At dusk it touches 1 % of the frame and at full dark 0.5 %, because the map goes properly black — which is the map being right, not the paint being wrong. Anyone hoping U5 would make the *night* prettier should read that number before hoping again.

**The pools still wash to cream in their middles.** Round 1's honest line named this and it is unchanged: ACES plus `lanternRenderIntensity: 34` drives the pool centres past the point where hue survives. U5 deliberately did *not* chase it — a paler road under a blown pool makes the wash worse, which is exactly why the first cut at road core 119 was reverted. **The fix is still a tone-mapping or exposure treatment for the night pools, and it is still outside a rendering pass's authority.**

**Two gating specs on this map cannot currently be trusted.** `night3d-perf:67` fails on an untouched tree and `e1-night-shift:435` is a flicker coin flip. Neither is this shift's to fix, and both are now documented twice. Until they are repaired, every future night-shift slice will spend an hour of control runs re-proving what F-5b/F-10 already knows.

**And on method, twice over.** First: I spent real time convinced U5 had brightened the dark and tripped a physics guard, because a road spur genuinely does pass 1.5 m from the sample point. The only thing that settled it was running the unmodified tree three times and finding `outside` bit-identical. Reasoning about it would have produced a confident wrong answer in either direction.

Second, and worse: **I measured F-7 from scratch when the answer was already in `tasks/BACKLOG.md`.** The baron shift had filed `F-BEAUTY-BARON-3` — same conclusion, same camera constants, and an explicit instruction to *"retarget them at the ring FOOT before those shifts spend a batch on sky"* — the night before. The Completeness Law says the ledger is the complete work ledger; I read the brief and the round-1 review and went straight to the code. The redundancy bought sharper numbers and two extra proofs, so it was not wasted, but it was not planned either, and the same hour spent reading line 2758 first would have re-aimed U4 before it was painted rather than after.

## OWNER'S DESK — one question

**Should the player ever see the sky?** Today no map's panorama reaches a pixel (F-7). Three ways to answer, in order of my preference:

1. **Leave it.** Accept that panoramas are unreachable, stop briefing them, and treat the ~30 MB of horizon art as retired scenery. Cheapest, and honest. If chosen, U4 should be reverted for its 206 KB (F-11) and the panorama line struck from the remaining beauty briefs.
2. **Give the sky a moment.** Keep the gameplay camera exactly as it is and let something else see the horizon — a contract-briefing establishing shot, a ceremony beat, a dawn-survived flourish. This is the option where U4's art pays for itself immediately, and it costs no gameplay feel. **My recommendation.**
3. **Change the gameplay camera.** Raising the frame top above the horizon needs roughly a 20° pitch change, which alters how much ground the player reads at once. That is a feel and balance decision, not a rendering one, and it is not mine to take.

Meanwhile the panorama art is pinned, guarded and reproducible, so whichever way this goes, no one has to rediscover the pipeline defect again.

## Merge classification

Branch-only; nothing merged to main. Base `cbaad8bb` (origin/main at session start, fast-forwarded before any work). Per-milestone path-scoped commits, each pushed and verified against `git ls-remote`:

- `34a4aaad (archive: pruned by the A3 rewrite)` — the pipeline fix: `build_e1_contract_panoramas.py` (new), `verify_e1_panoramas.py` (new), `build_contract_panoramas.py` (docstring + `E1_PANORAMAS` + `main()` refusal)
- `6fc55a65` — U4: `build_e1_contract_panoramas.py`, the four `night-shift-panorama.*` files, `scripts/beauty-sky-visibility.mjs` (new), `scripts/beauty-night-sky-board.mjs` (new)
- `adb47069 (archive: pruned by the A3 rewrite)` — U5: `build_unique_contract_terrains.py`, the four `night-shift-terrain.*` files, the regenerated `artifacts/map-rebuild-spike/night-shift-*` verdict boards and `artifacts/e3-day-night/*`
- `3d979899 (archive: pruned by the A3 rewrite)` — the evidence boards
- this review

`artifacts/night-bite/*` and `artifacts/night3d-perf/*` were touched by gate runs and **restored to HEAD**: they are single samples of a flicker-dominated scene, and round 1 set that precedent for exactly this reason. The other four E1 panoramas, every other map's terrain and panorama, `src/`, and LITE are untouched — `verify_e1_panoramas.py` proves the first of those by rebuilding them.
