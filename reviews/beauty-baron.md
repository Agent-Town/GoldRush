# Review — THE e1-baron BEAUTY SHIFT

**Slice/branch/tip:** `beauty/baron` · worktree `gr-task-beauty-baron` · base `551a1e73` (merge-base with `origin/main`)
**Brief:** `docs/beauty/e1-baron-brief.md` (E1 release map 5 of 5, the finale) · program laws `docs/beauty/README.md`
**Shift:** dedicated Opus 5 solo-writer session, 2026-08-02/03
**Verdict:** ✅ **U1–U4 KEPT AND SHIPPED · U5 PAINTED, MEASURED, REVERTED** — four of five upgrades land; the fifth is reverted on evidence with a program-level finding attached.

---

## What it does

The finale played on the plainest canvas of the five. This shift rewrites what the
Baron's arena says before a single shot is fired, and what it does while he fires.

The ground now carries the fight that happened *first*: cart-churned lanes running
from his siege line to the ford, six rocket-impact pads scoured into the player's
own bank, a wreck margin of cut stumps and driven stakes where the fort ate the far
bank, and his banner shadows printed on the dirt. The duel became readable as a
duel — warm home parchment against cold company iron, with the river lifted out of
the near-black slab it used to be and the ford left as the one warm thing in it.
His volleys stopped being a number: they draw a tracer, land a dust ring in the
world's own frame, and leave ember-smoke standing over the crater, all lit by the
six spotlights that were already there. And his brand finally moves.

Rendering only, end to end: **zero sim bytes**. The heightfield, the water mask,
the ford, the mount positions, the volley cadence, the spread RNG, the damage
resolution and the "Baron 22/22" battery are untouched. The two lines added to
`CombatSystem.ts` pass an id the resolver already held to a presentation callback,
and add a sibling presentation callback beside the impact ring it already drew.

---

## Per-upgrade verdict table

Frame p95 is the **settled window** of the mid-volley sample (third of three
180-frame windows, sim LIVE), median of repeated runs — see *How p95 was measured*
below for why that and not the raw number. Draw calls are median / peak over the
same window. Both arms were measured on the same box, same dev server, minutes
apart, with the shift reverted for the BEFORE arm.

| # | Upgrade | Verdict | Before → After | Desktop p95 | Mobile p95 | Draw calls (desktop / mobile) |
|---|---------|---------|----------------|-------------|------------|-------------------------------|
| U1 | Fought-over ground | ✅ **KEPT** | `before/desktop-chrome-fresh-eye.png` → `u1/desktop-chrome-fresh-eye.png` | texture only, no claim | texture only, no claim | 105/107 → 105/107 (unchanged) |
| U2 | Two sides, two lights | ✅ **KEPT** | `u1/…-fresh-eye.png` → `u2/…-fresh-eye.png`; A/B `u2-ab-paint-off/` | texture + 1 tunable, no claim | — | 105/107 → 105/107 (unchanged) |
| U3 | Rocket theatre | ✅ **KEPT** | `before/…-mid-volley-*.png` → `after/…-mid-volley-*.png` | 10.2 → **10.1 ms** (−1%) | 10.1 → **10.1 ms** (±0%) | 105–106/107 → 107–109/110–111 · 80/82–83 → 82/85–86 |
| U4 | Banners in the wind | ✅ **KEPT** | `u4/…-siege-line.png` + `…-siege-line-sway.png` (pair 900 ms apart) | no measurable delta | no measurable delta | unchanged (vertex shader only) |
| U5 | Horizon repaint | ⏹️ **REVERTED** | painted: `u5-reverted/baron-panorama-atlas-painted.png`; proof of visibility: `u5-reverted/desktop-chrome-lowcam-panorama-visible.png` | n/a | n/a | n/a — assets byte-restored to base |

**The +15% p95 law holds with room to spare: −1% desktop, ±0% mobile.** Median
frame time is 8.3 ms on both viewports before and after. Triangles 112,846–113,134
→ 113,102–113,774 desktop, 108,542 → 108,798 mobile — the three new instanced
meshes, which hide themselves when their pools drain, so an idle frame returns to
the old count.

The whole before→after delta is booked against U3 deliberately. U1, U2 and U4 are
a texture, a material tunable and a vertex shader; none of them can move a draw
call, and the box cannot resolve a texture-sized frame-time change (see below). If
any of the three costs something, that cost is already inside U3's row, which is
the conservative direction.

---

## The shot board

Every frame carries the contract-equality gate inline: `terrain3dPilotState=ready`,
`terrain3dPilotRenderSource=glb`, 5 landmarks mounted, 0 skipped, asserted before
the shutter. A silent painted fallback (Mistake #10) cannot produce a passing shot.

| # | Moment | Before | After |
|---|--------|--------|-------|
| 1 | Arrival boot — the taunt-banner moment | `before/{desktop,mobile}-chrome-arrival.png` | `after/{desktop,mobile}-chrome-arrival.png` |
| 2 | Fixed fresh-eye run camera | `before/{desktop,mobile}-chrome-fresh-eye.png` | `after/{desktop,mobile}-chrome-fresh-eye.png` |
| 3 | MID-VOLLEY (also the p95 frame) | `before/{desktop,mobile}-chrome-mid-volley-{arcs,impact,live}.png` | `after/…` |
| 4 | Siege line — banners mid-sway | `before/{desktop,mobile}-chrome-siege-line.png` | `after/…-siege-line.png` + `…-siege-line-sway.png` |
| 5 | Victory over the battle-scarred field | `before/{desktop,mobile}-chrome-victory.png` | `after/…-victory.png` |
| 6 | Horizon behind the fort | `before/{desktop,mobile}-chrome-horizon.png` | `after/…-horizon.png` (unchanged by design — U5 reverted) |

Every pair is pose-matched: the whole `before/` board was re-shot from the base
tree with the final spec, on the same box and the same dev server, so the two
columns differ only in the thing under test. The `after/` board was re-shot once
more after the last code tweak, so it is the shipped tree and nothing earlier.

Intermediate boards are kept per upgrade: `artifacts/beauty-baron/{u1,u2,u3,u4}/`,
the U2 A/B in `u2-ab-paint-off/`, and the reverted U5 evidence in `u5-reverted/`.

The fixed fresh-eye camera is the brief's own: Blender eye `(0,-30.3,26.26)` →
target `(0,-8.65,0.51)` at 42°, reproduced in-engine as hero z `+8.65` with camera
offset y `25.75` / z `21.65`, lag `0.001`, look-ahead and down-screen offset zeroed
so both arms frame the same dirt.

---

## Evidence

| Gate | Result |
|------|--------|
| `tsc --noEmit` | clean |
| `npm run build` | green (tsc + vite build + asset-diet) |
| `e2e/beauty-baron.spec.ts` (new) | 12/12, both projects |
| Baron battery — `e1-baron` + `054` + `055` + `057` + `lane-baron-arrival` | 54/56 (2 control-proven pre-existing) — see *Battery* |
| Contract equality | `state=ready`, `RenderSource=glb`, landmarks 5, skipped 0, on every captured frame, both projects |
| Console / page errors | zero in all 12 frames, both projects (each test asserts empty buckets) |
| Zero new dynamic lights | asserted, not asserted-about: live muzzle flashes ≤ 6, fired 6, cap 6 |
| Re-export determinism | same source → **bit-identical atlas and GLB** (0 differing pixels, matching sha256) |

### Measured picture changes

**Terrain atlas, luminance by game z** (0–255; the finale's three-value structure):

| Band | Before | After |
|------|--------|-------|
| player's bank z +8…+28 | 106–113 | 100–113 |
| river z −5…+5 | **21** | **38** |
| far bank z −8…−28 | 70–97 | **44–59** |

**In game, fixed fresh-eye frame, 80-px bands:** the murk band that swallowed the
crossing lifts from 18.2 / 17.6 to 25.9 / 23.8 (+42% / +35%), and the close home
ground rises 65.8 / 63.0 → 69.2 / 69.1.

**U2's landmark paint, A/B at the siege line** (fort region x 270–1010, y 0–300):

| | mean luminance | peak |
|---|---|---|
| paint OFF (shipped default) | 27.4 | 168 |
| paint ON | 23.0 | **93** |

Mean falls 16%, **peak falls 45%** — which is exactly the shape the brief asked
for. The bright red roofs stop competing with the player's own gear while the
silhouette edges, the stakes and the wall line all stay readable. Without the
paint the fort reads as circus tents.

**U4's sway**, same pinned pose 900 ms apart: **34,844 pixels differ (3.4% of the
frame, max channel delta 206)**. A still cannot show a sway; the pair can.

**U3's pools under sustained fire:** wisps 8 active at cap 8 after 27 spawns,
tracers 3 of 16, rings 8-capped — proven by monotonic spawn counters, because a
0.2 s tracer expires inside a screenshot round-trip and an `active` read that
loses that race reports "the VFX does not exist".

### How p95 was measured, and why the raw number is not the headline

The naive instrument lies here. A single 180-frame window on this box swung
**26.5 ms and 10.4 ms for the same unchanged scene, in consecutive runs**. The
sampler therefore takes three windows per run with a 45-frame warm-up and reports
the median; runs are then repeated three or four times per arm. Even so, the
**first** window after handing the clock back to the live sim is an outlier in
*both* arms (before-desktop saw 29.4 ms; after-desktop saw 24.6 ms), so the table
above is built on the settled third window:

| Arm | Desktop settled p95 | Mobile settled p95 |
|-----|---------------------|--------------------|
| before (3 runs) | 10.1 / 10.2 / 10.3 → **10.2 ms** | 10.0 / 10.1 / 10.2 → **10.1 ms** |
| after (5 runs, last on the shipped tree) | 9.9 / 9.9 / 10.1 / 10.2 / 10.4 → **10.1 ms** | 9.6 / 10.1 / 10.1 / 10.4 / 10.5 → **10.1 ms** |

Raw per-run medians are in `artifacts/beauty-baron/{before,after}-rep*/`. The one
run that showed mobile at 12.4 ms (+18%, over the law) did not reproduce: three
repeats immediately after gave 10.3 / 10.8 / 10.7. **The regression was the
instrument, and it took a control to say so.**

The harness was deliberately made control-capable — `volleyVfx()` tolerates a tree
with no `baronVolley` diagnostics — because a p95 instrument that only runs on the
changed tree cannot produce a before/after table at all.

### Battery

`e2e/e1-baron.spec.ts` is the "Baron 22/22" launch gate named at
`specs/release-e1/README.md:26` and was **not touched**; the shift's own frames
live in a separate spec.

**Full battery, 56 tests across the five baron specs, both projects: 49 passed /
6 failed in one 16.4-minute run — and four of those six were the dev server, not
the code.** All four were bare `Test timeout of 30000ms exceeded` with no
assertion mismatch anywhere in them (`054:171`, `055:175`, `057:359`, `057:444`),
after that dev server had spent seven hours serving a 7.7 MB GLB through dozens of
HMR reloads. Restarted the server, re-ran exactly those four on the same tree:
**4 passed in 50.7 s.** Two of them — `055:175` "kill-stop leaves the sim hash
identical to a nopause control" and `057:444` "volley targeting is deterministic
for the same seed" — are sim-determinism tests, so this mattered: had they been
real, this shift would have violated its own render-only law. They were not. The
honest count on a healthy server is **54 / 56**.

**The remaining two are RED and they are not mine — control-proven.**
`e1-baron.spec.ts:343` *"contract board requires science plus two secured claims
and always shows an earned medal"* fails on desktop and mobile with
`getByTestId('contract-card-list').locator('[data-contract-id]')` **expected 5,
received 6**. Every byte of this shift was reverted and the same two tests were
re-run on the base tree, same box, same dev server, same hour: **identical
failure, identical count** (`/tmp/control-head.log`). A sixth contract card has
appeared on the E1 board since the suite-red inventory snapshot, which still
records all 22 as green. Filed below as **F-BEAUTY-BARON-1**.

---

## Merge classification

- **Base:** `551a1e73`, the merge-base with `origin/main`. The branch is four
  commits of shift plus one revert, each pushed and verified with `git ls-remote`.
- **`assets/pilots/map-rebuild-spike/build_unique_contract_terrains.py`** —
  LANE-TOUCHED. New `paint_baron_ground()` and its deterministic scatter helpers;
  a baron-scoped Grit-Law white-point override; and `carry_forward_mount_records()`
  (see F-BEAUTY-BARON-2). The only shared-path behaviour change is the mount
  carry-forward, which preserves and never invents.
- **`baron-terrain.{glb,blend,atlas.png}` + `baron-terrain-contract.json`** —
  regenerated together, same commit, from the committed source. Counts and bounds
  are byte-identical to base (16,641 verts / 32,768 tris / bounds unchanged); only
  the texture and the three file hashes move. `landmarkPack` moved above `files` in
  the JSON — pure key order, no semantic change.
- **`baron-panorama.*`** — MAIN-MOVED-check: byte-restored to base after U5's
  revert (verts 1351, tris 1920, unchanged hashes).
- **`src/world/Terrain3dClaimPilot.ts`** — LANE-TOUCHED. `keepLandmarkPaintReadable`
  gains an optional paint argument whose default reproduces the previous behaviour
  exactly (`intensity 3`, tint `#ffffff` → `color.multiply(white)` is a no-op), so
  every other contract is unchanged. `installBannerSway` is gated on
  `contractId === 'e1-baron'`.
- **`src/systems/CombatSystem.ts`** — two presentation lines only: `onShot` now
  receives the `ownerId` the call site already had, and `onBlastImpact` fires next
  to the `vfx.detonationRing` the resolver already drew. No damage, ordering, RNG
  or event-log byte moves.
- **`src/game/Game.ts`, `src/vite-env.d.ts`** — construct / scene-add / update /
  reset / diagnostics for the new VFX, plus the shed-order registration beside the
  existing verdict thresholds.
- **New files:** `src/systems/BaronVolleyVfx.ts`, `e2e/beauty-baron.spec.ts`,
  `scripts/beauty-imgdiff.mjs`, `logs/session-scratch/{preview_baron_atlas.py,beauty-baron-probe.mjs}`.

---

## Findings

**F-BEAUTY-BARON-1 🟡 — two of the Baron 22 are red on main and the inventory
doesn't know.** `e1-baron.spec.ts:343` expects 5 contract cards and finds 6, on
both projects, on the untouched base tree. `logs/suite-red-inventory-compact.json`
still records all 22 as `expected`. Non-blocking for this shift (control-proven
pre-existing) but the E1 launch gate is named "Baron 22/22" and it is currently
20/22, so the release door is measuring something that no longer passes. Owner /
next fire: either the card count or the assertion needs updating, and the inventory
needs a refresh.

**F-BEAUTY-BARON-2 ✅ CURED IN THIS SHIFT — a plain terrain re-export used to
un-mount every landmark, silently.** `build_unique_contract_terrains.py` authors
`landmarkMounts` from its own profile table, but `asset` and
`terrainConformOffsetY` are written later by the landmark-pack pipeline. Any
re-export dropped both, plus the whole `landmarkPack` block. The runtime resolves
the body GLB through `mount.asset` (`Terrain3dClaimPilot.ts:605`), so the first
atlas repaint in this shift would have shipped a baron map with **zero landmarks
and no error anywhere** — the fort, the siege line, the banners, the cart and the
headframe all gone, falling back to painted ground. Caught by the first rebuild.
`carry_forward_mount_records()` now preserves those fields, and only when the
rebuilt mount still sits at the same planar X/Z. **The trap is still armed
everywhere else, and that was checked rather than assumed:** six builders in
`assets/pilots/map-rebuild-spike/` write `landmarkMounts` — `build_the_claim_terrain.py`,
`build_dry_gulch_terrain.py`, `build_e2_contract_terrains.py`,
`build_e3_contract_terrains.py`, `build_e4_extra_terrains.py`,
`build_e5_deepwater_terrain.py` — and **none of them carry anything forward**. It
is worse than a render bug: `build_landmark_packs.py:1978-1981` reads
`terrain_contract["landmarkMounts"]` and dereferences `mount["asset"]`, so a
re-exported terrain contract breaks the pack pipeline as well as the runtime. Any
beauty shift that repaints another map's atlas hits this on its first rebuild.
**The sibling `e1-night-shift` shift saw half of this and mis-sized it** — its
notes record the re-export as dropping only the `landmarkPack` key and call that
"doc-only; no reader". It also dropped `asset` off every mount. That shift
restored byte-for-byte so nothing shipped, but the lesson as written would have
let the next repaint ship a Baron map with no fort, no siege line, no banners and
no error. Corrected at the source.

**F-BEAUTY-BARON-3 🔺 — the U5-class panorama upgrade is unreachable at the shipped
run camera, on every map that uses this rig.** `Balance.camera` is fov 42 with
offset y 26.2 / z 18.3, i.e. pitched roughly 46–55° down, so the **top** of the
frame sits about 25° *below* horizontal while the sky ring spans −9° to +30°. The
finale's sky is behind the player's head. Painting it is not wasted craft — it is
craft aimed at a surface the camera cannot reach. A future slice must either lower
the authored band into the visible wedge, raise the ring's foot, or retarget the
brief at the ring FOOT, which is the part the camera actually sees. This is a
program-level finding, not a baron one: the other four E1 briefs carry the same U5.

**F-BEAUTY-BARON-4 🟡 — the shipped baron panorama predates its own builder.** A
re-export goes 1,351 → 1,836 vertices and 1,920 → 2,688 triangles because the
builder has since grown a county ground skirt. That skirt renders as a **pale band
directly behind the fort** — a light halo around the darkest silhouette on the map
(`u5-reverted/desktop-chrome-lowcam-panorama-visible.png`). Nobody has judged it on
this contract. Any future panorama work on `baron` has to decide that question
first, deliberately, rather than inherit it as a side effect of touching paint.

---

## Deviations from the brief, stated plainly

1. **Tracer life is 0.3 s where the brief says "~0.2 s".** At 0.2 s the streak is
   real in play (12 frames at 60 Hz) but cannot survive a screenshot round-trip, so
   the beat most in need of a before/after pair was the one with no picture of it.
   0.3 s is still a flick against a 2 s cadence. Reversible in one constant.
2. **U4's "detail rung" — rope fringe and patched weave in the pack atlas — was
   NOT done.** Only the sway shipped. The pack atlas is shared by all five baron
   bodies and rebuilding it means re-running `build_landmark_packs.py`, which is
   the same class of predates-its-builder risk that killed U5 (F-BEAUTY-BARON-4).
   Not attempted rather than attempted badly.
3. **U5 reverted in full** — reasoning above, evidence kept.
4. **The siege-line frame was reframed** from the brief's implied close-up (which
   pointed at the middle of the river and put the banners off-screen) to hero
   z −6.5 / camera 15,15. The scorch pads the brief lists for that frame live on
   the player's bank and appear in shots 1 and 2 instead.

---

## THE HONEST LINE — what still looks wrong

- **The river is better, not good.** It went from a 21/255 black slab to a 38/255
  readable dark band with a bed, shallows and a warm ford, and that single change
  did more for the map than anything else in this shift. It is still the lowest,
  flattest quarter of the run frame. It reads as *painted dark water*, not as
  water. The honest next move is not more paint — it is asking whether this map
  should get the code-owned water surface the Claim family has.
- **The home bank got brighter near the camera and darker in the middle.** U2's
  warm lift ramps in from z 6.5, so the close ground gains ~6% while the band at
  z +8…+12 loses ~12% to U1's marks and the re-grade (in-game rows 400–480:
  72.7 → 60.5). Nobody would call it wrong, but it is a redistribution, not a lift.
  Widening the ramp to start at the bank edge is a one-line next pass.
- **On 390 px portrait the pads mostly miss the frame.** The same fixed camera
  shows roughly a third of the horizontal ground, so mobile's wins are the ford,
  the warm/cold split and the river — not U1's craters. The mobile arrival frame is
  ~60% HUD. If the mobile board matters, the pads want a tighter, mobile-aware
  scatter, or mobile wants its own camera.
- **The impact still fires two rings.** The shared teal `CombatVfx.detonationRing`
  fires alongside the new warm dust ring, and the teal one is bigger, brighter and
  more arcade than anything else on the map. It is shared by every turret on every
  contract, so it was out of scope here — but the Baron's impacts would read better
  if that ring were per-owner.
- **The tracer reads as a line, not an arc, in the harness pose,** because the
  Baron sits directly up-screen from his target and the bend projects along the
  view axis. It bends properly when the shot comes in off-axis. The pinned pose
  flatters it least.
- **The fort is at the dark end of "menace".** The A/B says the peak fell 45% and
  the silhouette survived, and it is the right direction — but it is close to the
  floor the brief warned about, and it should get an owner eye in a real playtest
  before anyone pushes it further.
- **The wisps read as lit dust, not smoke.** Additive was the only way to fade a
  per-instance colour on an `InstancedMesh`, and additive dust glows. In the warm
  illustrated palette it sits fine; under a night rig it would not.
- **Nothing here was judged by a human playing it.** Every verdict above is a
  measured render at a pinned camera. The pinned camera is a good instrument and a
  poor player.
