# Review — THE e1-twin-banks BEAUTY SHIFT

**Slice/branch:** `beauty/twin-banks` (dedicated Opus-5 shift, worktree `gr-task-beauty-twin-banks`, solo writer)
**Brief:** `docs/beauty/e1-twin-banks-brief.md` · **Program laws:** `docs/beauty/README.md`
**Base:** `c708f27d` (origin/main at pre-flight, 2026-08-02) · **Date:** 2026-08-02 → 08-03
**Boards:** `artifacts/beauty-twin-banks/<stage>/` — stages `before`, `u1`, `u2`, `u3`, `u4`
**Verdict:** ✅ **THREE UPGRADES KEPT, ONE PARTIAL, ONE NOT ATTEMPTED — and the two that did not land
name a pipeline defect that no beauty shift on this map can route around.**

---

## The one-line result

The braid runs. The map's thesis — a living braided river — was the stillest thing on screen (its
two channels measured **33,21,10** and **17,13,8** at their centrelines, near-black ink slots); it now
carries two depth-tested water ribbons cut from the sculpt's own mask polylines, a wet-margin and
skylight repaint that lifts the channel walls the sun cannot reach by up to **+66%**, and a reed bed
that is damp, jittered, grounded and moving. Cost: **+4 draw calls, +566 triangles, p95 within
run-to-run noise** against a +15% law.

---

## Per-upgrade verdict

| # | Upgrade | Verdict | Before → After board | p95 (desktop, run camera) | Draw calls |
|---|---------|---------|----------------------|---------------------------|-----------|
| U1 | Water moves in the braid | ✅ **KEPT** | `before/desktop-chrome-2-braid-run-camera.png` → `u1/…` | A/B same session: **15.1 → 15.4 ms (+2.0%)**, avg 8.81 → 8.97 | 89 → 91 (+2) |
| U2 | Wet margins, banked foam, gold north | ✅ **KEPT** | `u1/…-2-braid-run-camera.png` → `u2/…` | 10.2 → 10.3 (atlas-only; A/B unchanged) | 91 (unchanged) |
| U3 | Damp reeds | ✅ **KEPT** | `u2/…-2-braid-run-camera.png` → `u3/…` (+ 3× tuft crops in this review) | inside noise | 91 → 92 (+1) |
| U4 | Two homesteads, two lives | ⚠️ **PARTIAL — mount dressing kept, new bodies REVERTED** | `u3/…-5-both-banks-overview.png` → `u4/…` | inside noise | 92 → 93 (+1) |
| U5 | The braid continues to the horizon | ❌ **NOT ATTEMPTED — asset pipeline refused** | — (the standing MQ-2 check ran: `u4/desktop-chrome-6-wide-aspect-join.png`) | — | — |

**Totals, before → final:** 89 → 93 draw calls, 127,888 → 128,454 triangles (+0.44%), mobile 61 → 64
calls. Frame p95 across five identical-code runs of the same stage ranged **10.2–24.1 ms**, which is
larger than any effect measured here — so the honest perf statement is the A/B below, not a
before-commit/after-commit p95 pair.

---

## How the p95 law was actually measured

A before-commit/after-commit p95 comparison on this machine measures the machine. So the shift
shipped `?nochannelwater`, a URL flag that boots the **identical build** with only the dressing
withheld, and the spec measures both arms in one session at one camera
(`e2e/beauty-twin-banks.spec.ts`, "the beauty pass pays its frame budget, measured against its own
build"). Median of three, desktop 1280×800 at the fresh-eye run camera:

| Arm | p95 | avg | calls | triangles |
|-----|-----|-----|-------|-----------|
| `?nochannelwater` (dressing withheld) | 15.1 ms | 8.81 | 89 | 127,888 |
| shipped | 15.4 ms | 8.97 | 91 | 128,040 |

**+2.0% p95, +1.8% avg, exactly +2 draw calls.** Mobile 390px, median of two: 20.3 → 20.7 ms (+2%),
61 → 63 calls. The law is +15%.

The same flag is the shift's honesty instrument: every suite behaves identically with it on, because
the water is decoration.

---

## The shot list

Desktop 1280×800 unless noted; every board exists at each stage, so any pair in the table can be
re-cut. `artifacts/beauty-twin-banks/<stage>/`:

| # | Board | What it judges |
|---|-------|----------------|
| 1 | `desktop-chrome-1-boot-south-bank.png` | plain boot, HUD and all — what the player meets |
| 2 | `desktop-chrome-2-braid-run-camera.png` | **the fresh eye's fixed run camera, reproduced live** |
| 3 | `desktop-chrome-3-west-ford-pressure.png` | six enemies crossing both channels at the west ford |
| 4 | `desktop-chrome-4-plait.png` | the plait: dry gravel island between two moving channels |
| 5 | `desktop-chrome-5-both-banks-overview.png` | composition judge, zoom + fog held off (see caveat) |
| 6 | `u4/desktop-chrome-6-wide-aspect-join.png` | U5's standing MQ-2 check at 2:1 |
| — | `mobile-chrome-*` | boot + braid run camera + plait + overview at 390px |

**The run camera is the shipped rig, not a Blender pose.** The fresh eye's fixed camera
(`(0,−30.3,26.26) → (0,−8.65,0.51)`, `reviews/opus5-3d-findings.md`) is exactly this game's camera
standing at game **(0, 12)**: `Balance.camera.offset (0,26.2,18.3)` puts the eye at z=30.3 and
`downScreenLookOffset 3.35` puts the look point at z=8.65. Same frame, real engine, live water.

**Board caveat, recorded rather than hidden:** the overview board pushes the player zoom past its
shipped 1.6× ceiling to 2.6× and holds the distance fog off (near 42→400, far 88→900), because at
68 m the shipped fog erases the tile into a cream sheet and judges nothing. Above that ceiling the
panorama ring — authored fog-exempt on purpose — reads as a flat cream band across the far edge, so
the board is cropped to the tile. Not a defect a player can reach; it is this harness leaving the
shipped envelope, and it is the same trap the fresh eye's own sweep hit and corrected for.

---

## U1 — Water moves in the braid ✅ KEPT

Two mitre-joined ribbons follow the **contract's own mask polylines** — `maskTruth.waterMask`
`north-channel` / `south-channel`, the same table `build_twin_banks_braid.py` cut the relief from —
carrying the shipped `LivingWaterShader`. Read as data, never retyped: the pilot builds nothing the
sculpt does not already declare.

Measured at the channel centrelines on the run-camera board:

| Point | before | after (U1) |
|-------|--------|-----------|
| shallow (south) channel | 20,15,7 | 70,80,57 |
| deep (north) channel | 17,13,6 | 51,76,54 |
| row-luminance across the corridor | two troughs at **15–19** | **58–84** |

**Sim untouched, and asserted.** F-OP5-1 stays owner-gated: band classification, both fords and the
gravel-bar crossings remain engine truth. The spec re-asserts `terrainSample` zones at (0,0),
(±16,0), (0,−12) plus `fordStones=14` and `gravelBars=2` in the same test that asserts the water.

Three things the first cut got wrong, each caught by a board and each worth carrying to the other
map shifts:

1. **The shared river shader is sized for a 64 m band.** On a 3 m channel its cross-section profile
   (a 0.95-unit alpha ramp in from the visual edge; banked foam ±0.72 units around the river
   half-width) turned the outer half of every ribbon into foam and the water read as a plastic
   plank. The ribbon now feeds the shader a **stretched half-width** so both features land where a
   3 m channel wants them — no fork of a shader four other maps use.
2. **A ribbon that stops at its mask band leaves a rim floating in the cut.** It now over-reaches by
   0.22 m and the **sculpt clips the waterline** through the depth test. That is also the safety
   law: water can never be painted onto ground the mask calls dry, at any camera, because the
   terrain occludes it — a structural guarantee, not a tuning value.
3. **The sun is `#ffd28a` and dragged the teal straight to olive** (measured 92,92,59 before the
   fix). A cool multiplier and a flow map re-tiled to the channel's real length answer it.

Also fixed here, and it is a latent bug for anyone else mounting two of these materials:
`createLivingWaterMaterial` baked its config into the shader source but returned a
**config-blind program cache key**, so two ribbons that differ in depth and gold-glint anchors would
have silently shared the first one's braid. The key now carries the constants.

**Ribbon geometry defect that shipped for one board and is worth naming:** the first cut dropped the
`side` factor from the vertex loop, so both edges of every ribbon landed on the same line — two
zero-width sheets that still counted 2 draw calls, 152 triangles and a mounted mesh. Every count
passed; only the pixels failed. The spec now probes **six world points inside the two channels and
asserts the rendered pixel is cool** (green-led, blue uncrushed) rather than counting meshes.

## U2 — Wet margins, banked foam, gold in the north ✅ KEPT

Atlas re-derived through `build_twin_banks_braid.py` — never hand-painted — and the GLB re-exported
with the contract re-pinned in the same commit.

**The pipeline was verified before it was used.** Running the sculpt build UNCHANGED reproduced the
shipped `glb sha256 9042c2a9…` and `atlas sha256 aed2915b…` **byte for byte**. That is what made an
atlas edit reviewable: the only lines that moved in `twin-banks-terrain-contract.json` are the three
file hashes — `vertices 25,921`, `triangles 51,200`, bounds, mask agreement and every mount are
byte-identical, and the script's own gate still measured **0 dry-ground-inside-mask / 0
water-outside-mask**.

Row luminance at the run camera, U1 → U2 (480 px sample):

| Feature | U1 | U2 | Δ |
|---------|----|----|---|
| plait's shaded shoulder | 42.7 | **70.9** | **+66%** |
| south channel's lip | 29.2 | 31.7 | +9% |
| plait crown | 89.4 | 91.6 | +2% |
| dry banks (cost) | — | — | **−1 to −2.6 luminance** |

**The finding that shaped this upgrade — and it applies to every tile in this family.**
`claim.apply_grit_grade` closes each of these atlases by re-normalising on the atlas's OWN 4th/96th
luminance percentiles. A channel bed is in the darkest 4% of this tile, so **paint aimed at the dark
end spends a GLOBAL budget**: a 0.52 gravel-bed blend bought +2 luminance under a 73%-opaque water
sheet and cost the dry banks 5–8% of their value. Two consequences, both landed: the bed lift is cut
to 0.20, and the skylight lift is applied **after** the grade, where it is local — the banks' cost
fell from −5…−8% to −1…−2.6% while the shoulder gain went **up** (42.7→64.0 became 42.7→70.9).

The skylight lift itself is the upgrade's real content: the rig's key is one low warm directional
from the north-west (`LightRig` sun `(-28,18,-22)` → `(4,0,8)`), so every south-facing cut wall takes
a negative Lambert term and crushes to black no matter what is painted on it. **Those walls are the
"two dry ink slots".** The paint now lifts them, cool, from the sculpt's own height gradient.

Gold glints: four anchors on the **north channel only**, re-seated onto the mask centreline — the
shader draws each glint as a thin line at the anchor's z, so an anchor 1 m off-centre lights the bank
instead of the current. Desktop only by the shipped `waterQuality ≥ 0.75` gate; mobile keeps its
quality budget.

## U3 — Damp reeds ✅ KEPT

The class was `grassGeometry` scaled thinner: two crossed quads of equal height in one flat colour,
which at 3× magnification read as four identical bright matchsticks in dry dirt — on a map whose
briefing card sells "damp reeds". Now three unequal tapered blades leaning off their own axes, a
per-instance tint, a vertex sway, and a ground contact patch under the bigger half (scatter never
casts a shadow — `castShadow` is off for every class by budget — so an untufted reed floats).

**Placement is byte-identical on purpose.** The tint draws from a separate rng stream (`<id>:tint`),
so not one instance moved and the seeded scatter signature that `tile-identity-pass` fingerprints is
unchanged.

**The tint bug worth carrying to the other shifts:** `dampTint` in a tile contract is a *splat
multiplier* around 0.5, and three.js reads a numeric `Color` as working-space **linear**. Feeding it
straight in made every reed five times the value the silhouette was authored at — bleached dead
straw, paler than the dry grass beside it. It now modulates the class's own linear base
`(0.095, 0.15, 0.052)` by the tint's **hue** and keeps its value, with a squared-random dry minority.

**A sway cannot be photographed, so it is measured:** two frames 600 ms apart, counted over the near
bank only with hero and companion boxed out — **235 pixels in motion**, asserted > 60
(`u3/reed-motion.json`, and the test is permanent).

## U4 — Two homesteads, two lives ⚠️ PARTIAL

**Shipped (render side):** a contract-scoped landmark dressing in the pilot. The south roof — the
stake side, the loss condition — is graded warm and carries an opaque lamplit pane on its
camera-facing wall; the north outpost across the braid is graded cool. Measured on the overview
board: **south (129,65,28) against north (106,53,26)** — 22% brighter and warmer (R/B 4.61 vs 4.08) —
and at the run camera the lit pane names the south roof outright. Same mount ids, same bodies, same
footprints. The lamp is opaque and depth-writing because `landmark-brightness.spec.ts` and the census
both assert no landmark material is transparent or skips depth write.

**Not shipped: the new bodies.** They were built — maintained south (lit window, sill, washing line,
stacked firewood) and outpost north (props, winch-served crates, tarpaulin), inside the shipped
bounds, **2,704 and 2,588 triangles against a 3,000 budget**, with the winch pair dressed to match
and the tarp deliberately pulled in to 1.35 after the first build grew the body's AABB to 2.8825 and
would have re-authored the sim footprint. Then the boards refused them — see F-BTB-1.

**Honest scoreboard for U4:** at the run camera the pair now reads apart. At the overview, from
directly above where the roof dominates and the lit wall is invisible, **they still read as
duplicates**. That half of the brief is unmet.

## U5 — The braid continues to the horizon ❌ NOT ATTEMPTED

Same wall as U4: rebuilding `twin-banks-panorama.glb` with today's `build_contract_panoramas.py` —
before any edit — produces an atlas differing on **12.0% of samples (max channel-sum delta 166)** and
a contract that gains fields the shipped one never had (`farRidgeRadiusMeters`,
`groundSkirtInnerBoundaryMeters`, a rewritten `style` line). Any repaint would have shipped that
drift underneath it, unreviewed, on the night the E1 release door is being measured. Reverted to the
shipped bytes; nothing of U5 is in this branch.

**What did run: U5's standing check.** `u4/desktop-chrome-6-wide-aspect-join.png` renders the
gameplay camera at **1600×800 (2:1, above the MQ-2 threshold of 1.8:1)**. At the play camera the
braid fills the frame and **no panorama join band is visible** — the pale-corner failure the brief
asks about does not appear at this aspect. The band only appears above the shipped zoom ceiling
(see the board caveat above). MQ-2 check: **PASS at the shipped envelope.**

---

## Findings

**F-BTB-1 — the twin-banks landmark pack no longer regenerates faithfully (blocks any body-level
beauty work on this map).** Rebuilding with today's `build_landmark_packs.py`, before any edit of
mine, produces a **different atlas** from the shipped one — the shipped atlas holds 16 filled role
tiles, today's `ROLE_COLORS` has 12, so the top row bakes black — and a material named
`Twin-BanksLandmarkPackMaterial` where the shipped GLB carries `Twin-BanksLandmarkPaint`. The
rebuilt homesteads render as **flat orange slabs**: no roof, no value separation, the red roof and
pale foundation gone. `floodplain_dressing_pack`, which the shift never touched, also came back
0.078 m shorter, and its `terrainConformOffsetY` re-derived from +0.097163 to −0.362851 (safe by
construction — `finish_asset` base-centres and the mount carries the same amount back — but it is a
second symptom of the same drift). **Impact:** the brief's U4 body work, and any future one, must
first repair the pack pipeline or re-author these bodies by another route. **State:** the eight pack
files and the terrain contract's conform offset are back at HEAD bytes; the designed bodies are
described above and in this branch's U4 commit message, not in the tree.

**F-BTB-2 — the twin-banks panorama pipeline has drifted too (12% of the atlas, new contract
fields).** Same class as F-BTB-1, different asset. Measured, reverted, U5 not attempted.

**F-BTB-3 (non-blocking, owner-side) — the reed bed is placed by the LEGACY band, not the braid.**
`Scatter.nearWaterMask` biases reeds by `RIVER_MAX_Z`, which for this tile falls back to ±5 because
the contract's water block declares no `centerZ`/`halfWidth`. The real channels run at |z| ≤ 3.5, so
"near-water" reeds start at least 1.5 m from any waterline and often 4–6 m away. Fixing it means
teaching the scatter about the sculpt's mask — the same mask F-OP5-1 keeps owner-gated — so it is
deliberately left alone. It is why the reeds read as bank grass rather than a river's edge.

**F-BTB-4 (non-blocking) — `e2e/e1-twin-banks.spec.ts` is not the 10/10 the brief believes.** Three
of its tests are in the tree's own red inventory (`logs/suite-red-inventory.md:93-97`, flake rates
43.8% / 40% / mobile-only). They failed here and were **proven not to be this shift's**: with the
water disabled at the same commit (`?nochannelwater`), the same two desktop tests still failed 3/3.

---

## Gates

| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `e2e/beauty-twin-banks.spec.ts` (new, permanent) | 5/5 desktop, 3/3 mobile |
| `e2e/e1-twin-banks.spec.ts` (the brief's named suite) | 6 passed / 5 failed — all five fingerprint-match `logs/suite-red-inventory.md:93-97`; control run proves they are not this shift's (F-BTB-4) |
| adjacent: `tile-identity-pass`, `landmark-brightness`, `terrain3d-claim-pilot` | see the gate log recorded with this branch |
| sculpt contract equality | vertices 25,921 / triangles 51,200 / bounds / mask agreement 0/0 — all byte-identical; only the three file hashes moved |
| landmark footprints (sim) | `landmark-collision-contract.json` untouched; pack bounds returned to HEAD bytes |
| zero console/page errors | asserted in every board test, both viewports |

**What the new spec guards permanently:** the sculpt still validates (51,200 tris / 25,921 verts),
the sim zones still classify, the deep channel is still the one the contract calls deep (a mirrored
re-export would otherwise teach the wrong crossing), both ribbons are mounted **and put cool water on
the screen at six probed world points**, the reed field moves, and the dressing costs exactly two
draw calls measured against its own build.

---

## THE HONEST LINE — what still looks wrong

1. **The water is a flat sheet.** It reads as water now, and at 2:1 it reads well, but a still frame
   shows almost no structure across a channel: no shore-to-centre value gradient the eye can follow,
   no specular streak, no visible flow detail at the game camera's ~11 px/m. The shader's ripple and
   flow terms exist and animate; they are simply too fine to survive that scale. A braid this small
   probably wants a hand-authored cross-section — bright wet edge, dark core, a moving highlight —
   rather than a 64 m river's shader stretched down.
2. **The two homesteads are still twins from above.** U4's grade wins the run camera and loses the
   overview. Until the pack pipeline is repaired (F-BTB-1), the map's "one family, two banks" story
   is carried by one lit window.
3. **The map's idea still stops at the tile edge.** U5 did not run. The braid ends at x=±28 and
   nothing downstream re-braids; the 64 m tile still reads as a tray at any camera that can see its
   rim.
4. **The west source pool stays dark.** The mask's `west-source-box` (x −30…−26) is genuine water the
   ribbons do not cover — they are cut from the two channel polylines only, and extending them was
   not worth inventing geometry the contract does not declare. A player walking the west edge finds
   a 4×4 m dry hole in the river.
5. **The reeds are bank grass.** See F-BTB-3. They are damp, they move, they have contact — and they
   are 4 m from the water.
6. **The ford pans read dry.** Both fords are cut below the water plane across an 11 m band, and only
   a 3.4 m ribbon crosses them, so the crossing itself is brown gravel with a stripe of water
   through it. The pressure board (`3-west-ford-pressure.png`) shows enemies wading dry ground. This
   is the single highest-value thing left that needs no new pipeline: two shallow ford sheets, one
   draw call, inside the same mask.
