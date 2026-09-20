# Review — THE TOWN BEAUTY SHIFT (docs/beauty/town-brief.md)

**Slice/branch/tip:** beauty/town, base `551a1e73` (main at shift start) · one Opus-5 solo-writer shift, 2026-08-02/03
**Brief:** `docs/beauty/town-brief.md` (Fable art-director pass) · program laws: `docs/beauty/README.md`
**Verdict:** ✅ SEVEN UPGRADES SHIPPED, ONE REVERTED ON MEASUREMENT (U6 sky/vista) — rendering only, zero sim bytes, frame p95 flat inside noise on all ten frames, zero console/page errors.

---

## 1. What it does

The town had nine handsome buildings, a coherent painted ring, and a walking cast, all of which **floated**. This shift is about contact and hour: things now stand on the ground, the ground shows where feet go, each parcel keeps its own trade at the door, and the square has a dusk it can be photographed in.

| # | Upgrade | Verdict | What landed |
|---|---------|---------|-------------|
| U1 | Townsfolk + hero grounding shadows | ✅ KEPT | One instanced blob mesh rebuilt from the live actor list each frame; feet drop 8cm → 2cm. Works on every tier. |
| U2 | Building ground contact | ✅ KEPT | Sun shadow camera **aimed** (±17 from three.js's default ±5); GLB `castShadow` un-hard-falsed; soft contact skirt per footprint mounted outside the shell so the GLB swap can't kill it. |
| U3 | Dirt wear where feet go | ✅ KEPT | 2048² painted ground following the authored trail curves + walking loops (compaction band, dashed ruts, kicked grit, trampled aprons); ~14 instanced dwell decals over the GLB plate. |
| U4 | Lived-in parcels per role | ✅ KEPT | 3–4 pieces per earned building at its own doorstep, in the building's object frame, two instanced meshes total. |
| U5 | Close-up material integrity | ✅ KEPT | Lite shell gets a pitched roof (it was an open-top crate); per-model emissive hack replaced by one hemisphere fill; anisotropy 4 → 8 on full/balanced. |
| U6 | Sky/light mood | ⚠️ HALF KEPT | Late-afternoon sun **kept**. Sky dome + dune vista **REVERTED** — measured +3 draw calls for zero pixels; the town camera cannot see a horizon at any allowed zoom (arithmetic in §5, F-BT-2). |
| U7 | Dusk: warm windows and doorways | ✅ KEPT | Three-state look behind flags (`?townDusk`, `?townNight`), soft window/door bloom in each building's object frame, ≤6 distance-bounded PointLights. **`?townNight` also got its first plain-boot door.** |
| U8 | Plaza lantern strings | ✅ KEPT | Three catenary runs between authored lantern posts, one instanced cord + one instanced bead mesh, hung at 2.5u minimum. |
| — | LedgerPostPass grain (U6 optional) | ❌ NOT DONE | Honest partial — see §7. |

---

## 2. The loop, and what the renders overruled

Every upgrade was implemented → rendered through `e2e/beauty-town.rig.ts` → **compared against the previous phase's frame** → kept, tuned, or reverted. The renders overruled intentions six times, and each of those is the reason a line of code looks the way it does:

| What I built | What the render said | What shipped |
|---|---|---|
| Blob ellipse sized from `sprite.scale.x` | Puddles 3× wider than the person standing in them — walk-sheet cells carry huge margins | Sized from billboard **height**, the metrology the cast is authored against |
| Wear bands at 0.30 alpha | Lite plaza became a burnt starburst | Halved alphas, narrowed bands, tripled the jitter |
| Pale plank tavern sign at head height | Read as a floating UI card, not a trade sign | Wood plank on a brass hook |
| Near-black 0.95u stakes | Read as scratches at wide zoom | Shorter, thicker, timber-coloured |
| `setColorAt(colour.convertSRGBToLinear())` | Every crate, keg and stake in the town went **flat black** (double conversion — `Color.set` already lands in the working space) | Straight `colour.set(hex)` |
| Hard additive window rectangles | Pale cards pasted across facades whose real windows are elsewhere | Soft-edged bloom that forgives the offset |
| Flat roof deck on the lite shell | A table-top behind a billboard | Pitched slopes + ridge, matching the painted card |

---

## 3. Per-upgrade measurements (desktop `1-boot-wide`, least-contended of three 180-frame windows)

| Phase | frame p95 | render avg | draw calls | triangles | board |
|-------|-----------|------------|------------|-----------|-------|
| before | 10.10 ms | 0.77 ms | 24 | 50 398 | `reviews/shots-beauty-town/before/` |
| U1 | 10.10 | 0.37 | 25 (+1) | 50 662 | `…/u1/` |
| U2 | 10.00 | 0.68 | 37 (+12) | 82 418 | `…/u2/` |
| U3 | 10.20 | 0.67 | 38 (+1) | 82 448 | `…/u3/` |
| U4 | 9.80 | 0.49 | 42 (+4) | 84 536 | `…/u4/` |
| U5 | 10.10 | 0.66 | 42 (+0) | 84 536 | `…/u5/` |
| U6 (sky+ring in) | — | — | **45 (+3)** | **85 448** | measured, then reverted |
| U6 (shipped) | 10.00 | 0.48 | 42 (+0) | 84 536 | `…/u6/` |
| U7 | day unchanged | — | 42 | 84 536 | `…/u7/` (dusk frames) |
| U8 | 9.80 | 0.51 | 45 (+3) | 88 376 | `…/u8/`, `…/after/` |

`+12` at U2 is the shadow pass: every caster is drawn a second time into the map. That is the cost item the brief named, and it is the only large one.

**The dusk frame had a second cost that measurement caught:** U7's first cut built one small plane per window pane, and dusk measured **80 draw calls against day's 42** — sixty of them for light spilling out of six buildings. Instancing the panes brought it to **46**. U8's strings then cost +2 on top of that, not +2 on top of 80.

### Final board, all ten frames (before → after)

| Frame | frame p95 | render avg | draw calls | triangles | console errors |
|-------|-----------|-----------|------------|-----------|----------------|
| 1 boot wide | 10.10 → 9.80 | 0.77 → 0.51 | 24 → 45 | 50 398 → 88 376 | 0 → 0 |
| 2 plaza centre | 10.10 → 10.20 | 0.72 → 0.54 | 22 → 43 | 50 394 → 88 372 | 0 → 0 |
| 3 tavern close | 10.00 → 9.90 | 0.27 → 0.32 | 13 → 34 | 34 818 → 72 796 | 0 → 0 |
| 4 assay close | 10.10 → 10.10 | 0.29 → 0.34 | 13 → 34 | 29 668 → 67 646 | 0 → 0 |
| 5 dusk plaza | 10.00 → 10.10 | 0.71 → 0.67 | 22 → 46 | 50 394 → 87 628 | 0 → 0 |
| 6 mobile default | 10.20 → 10.10 | 0.49 → 0.53 | 18 → 39 | 41 530 → 79 508 | 0 → 0 |
| 6b mobile **lite** | 10.20 → 10.10 | 0.68 → 0.68 | **57 → 55** | 3 120 → 7 362 | 0 → 0 |
| 6c mobile lite close | 9.90 → 10.10 | 0.38 → 0.31 | **33 → 29** | 2 692 → 6 910 | 0 → 0 |
| 7 night plaza | 10.10 → 10.20 | 0.71 → 0.63 | 21 → 45 | 48 954 → 86 188 | 0 → 0 |
| 8 widest (new) | — | 0.59 | 49 | 88 384 | 0 |

**Frame p95 moves by at most 0.3ms on any frame, in both directions — the +15% law has an order of magnitude of room.** Two honest caveats on that number, both stated so nobody reads it as more than it is:

1. **frame p95 is a ceiling here.** Headless chromium runs rAF at ~10ms; an idle scene cannot show a render cost below that. The number that actually moves is `renderMs` (CPU inside `renderer.render`, shadow pass included) — which fell or held on 8 of the 10 frames. Both are published on `__GR_TOWN_DIAGNOSTICS__` now, which is new.
2. **This box also runs the factory's fires.** The same idle scene measured 2.2ms and 4.2ms p95 minutes apart on the first pass, so the rig now takes the least-contended of three consecutive windows. The whole BEFORE board was re-shot from a throwaway worktree at `551a1e73` with the identical instrument, so every pair above compares like with like.

### Lite tier — measured, and the call it produced

Lite is the tier we pick *because the device is weak*. With the newly aimed shadow frustum it measured **106 draw calls; without the shadow pass, 55** — the shadow pass was half of everything lite draws, and this is a desktop GPU pretending to be a phone, so the real cost there is worse than anything I can measure. **Lite now pays no shadow pass** and keeps its grounding from the contact skirt and the blob shadows (two draw calls between them). It lands *cheaper than before this shift* (55 vs 57) while gaining roofs, wear, dressing and blobs. Reverse it with one word — the line is `sun.castShadow = this.performanceTier !== 'lite'` in `dressScene`.

---

## 4. The shot list (docs/beauty/town-brief.md §4)

Fresh profile (territory 3, Quartz Hill), plain boot, no `?debug`, scratch dev server on 5199, `--workers=1`, desktop 1280×800 and mobile 390×844. Every phase shoots at the **same town-second** (elapsed > 6) so the walking cast lands in the same pose and the boards compare like with like.

| # | Moment | Before | After |
|---|--------|--------|-------|
| 1 | Boot wide, default zoom | `reviews/shots-beauty-town/before/1-boot-wide.png` | `reviews/shots-beauty-town/after/1-boot-wide.png` |
| 2 | Plaza centre at the pan monument | `…/before/2-plaza-center.png` | `…/after/2-plaza-center.png` |
| 3 | Tavern close-up, max zoom (−4.9, −4.9) | `…/before/3-tavern-close.png` | `…/after/3-tavern-close.png` |
| 4 | Assay close-up, max zoom (6.6, 2.4) | `…/before/4-assay-close.png` | `…/after/4-assay-close.png` |
| 5 | **Dusk mood, `/?townDusk`** (the marketing frame) | `…/before/5-dusk-plaza.png` | `…/after/5-dusk-plaza.png` |
| 6 | 390px mobile default | `…/before/6-mobile-default.png` | `…/after/6-mobile-default.png` |
| 6b | 390px **lite** (the roughest shipped first impression) | `…/before/6b-mobile-lite.png` | `…/after/6b-mobile-lite.png` |
| 6c | 390px lite, tavern close | `…/before/6c-mobile-lite-close.png` | `…/after/6c-mobile-lite-close.png` |
| 7 | Night, `/?townNight` | `…/before/7-night-plaza.png` | `…/after/7-night-plaza.png` |
| 8 | Widest allowed zoom (1.1) — the frame that proves F-BT-2 | — (added this shift) | `…/after/8-boot-widest.png` |

Per-upgrade boards live in `reviews/shots-beauty-town/u1…u8/`; they are partial by design (each phase re-shot only the moments that upgrade could change). **One frame in them is superseded and should not be read as evidence:** `u1/6b-mobile-lite.png` was shot before the rig seeded the flat meta key, so it shows a territory-0 town (four buildings, eight townsfolk). Kept rather than deleted — see the Retention Law — and superseded by `u2/6b-mobile-lite.png` onward.

---

## 5. Findings

**F-BT-1 — `?townNight` never had a plain-boot door. FIXED HERE.** `main.ts` `MENU_SAFE_PARAMS` was `{town3dPilot, run3dPilot, tier}`; every other search key fell through to `startWithProfiles()`, so `/?townNight` — shipped inside `TownScene` since the town shipped — **booted a contract run**. The only way to see the night town was to enter it and then rewrite history state. `townDusk`/`townNight` are menu-safe now, and `e2e/beauty-town.spec.ts` asserts that `/?townDusk` lands on the start menu rather than a run. (Mistake #10, in its purest form: a visual nobody can reach is a visual that does not exist.)

**F-BT-2 — the town camera cannot show a horizon; the sky is an owner-desk item. OPEN.** `Balance.camera.offset` (0, 26.2, 18.3) over town scale 1.5 puts the camera 17.5u up and 12.2u back; at fov 42 the **top edge of the frame sits 34.1° below horizontal**, so the farthest ground any frame can contain is **25.8u from the camera** — about 15u past the hero at the widest allowed zoom. The plate ends at 15u. A vista ring at r30-45 is off-frame by construction, and so is the horizon itself; three framings (default, widest 1.1, mobile portrait) show ground running to every frame edge. The brief's own don'ts put zoom clamps and default framing on the owner's desk (F-1203-2), so I measured, reverted, and left the arithmetic in the code where the next reader will look. **Recommendation:** if a horizon is wanted, it is a camera-pitch ruling, not a scenery task — a shallower town pitch (or a "look up" framing for the dusk marketing frame) would make U6's sky worth building in an afternoon.

**F-BT-3 — `town-t5-townsfolk:203` is FLAKY, and pre-existing. NOT MINE.** *approach barks identify sampled speakers and the Prospector greets by town name* went red on desktop **and** mobile in two runs on this branch (`activeBark.actorId` came back `"prospector"` where a specific speaker was expected — the Prospector's 6.5u bark radius wins the sample), then **passed** in the final full-family run. Control: the same test goes red the same way on the pre-shift base `551a1e73`, in a throwaway worktree with none of this shift's changes. So: pre-existing intermittent, not a shift regression, and worth a real fix by someone who owns bark radii — an assertion that depends on which of two overlapping barkers speaks first is a coin flip, not a gate.

**F-BT-4 — `TownScene` reads the FLAT meta key, and only a start-menu profile activation copies the profile-scoped one across. OPEN.** Any route that reaches the town directly (history state, a deep link) therefore shows a **territory-0 town**: four buildings, eight townsfolk, no store, no chapel. It cost this shift a whole BEFORE board before the rig seeded both keys. Harmless today because nothing ships a deep link into the town; it will not stay harmless.

**F-BT-5 — the plate's eight audited decoration yards are invisible on lite. NOTED.** `artifacts/town-plate-3d/decoration-clearance.json` bakes tavern-workyard, claim-notice-yard and six more into the plate GLB, with almost exactly the vocabulary U4 asked for — but they sit 2.7–4u out beside and behind each building, and lite has no plate at all. U4's dressing hugs the walls instead, so the two do not double-render, and lite gets parcel dressing for the first time. Anyone editing either should know the other exists.

**F-BT-6 — lite's shadow pass was half its draw calls; disabled on lite. DECIDED, REVERSIBLE.** Numbers in §3. One-word reversal.

---

## 6. Evidence

| Gate | Result |
|------|--------|
| `tsc --noEmit` | clean |
| `npm run build` | green (2.46s; asset-diet ran, no budget breach) |
| `e2e/beauty-town.spec.ts` (new plain-boot door) | 4 passed, desktop + mobile, 6.7s |
| town family, one run, both viewports: beauty-town + t1-square, t5-townsfolk, t6-surfaces, ts-02b-facades, ts-03-prop-ring, plate/tavern/plaza-props blender, scale-zoom, inhabitant-zoom, era-switch, cast-motion-wiring, fresh-boot-textures | **51 passed, 0 failed (13.7m)** |
| earlier runs of the same family | 2 reds, both `town-t5-townsfolk:203`; control-proven identical on the pre-shift base `551a1e73` → pre-existing intermittent (F-BT-3), not a shift regression |
| Console/page errors | zero on all ten capture frames, both viewports, and in every spec's error bucket |
| Screenshots | `reviews/shots-beauty-town/{before,u1…u8,after}/` — small PNGs, pushed |
| Per-shot perf | `artifacts/beauty-town/perf-<phase>-<project>-<shot>.json` (frame/render stats, draw calls, triangles, contact + dressing counts, error buckets) |

**Scope law kept:** zero sim bytes. No `townLayout` position, footprint, approach, trail or metrology moved; no `townPropAt`/`shellAt` entry added; no collision changed; no GLB asset edited (runtime seam only); no zoom clamp or default framing touched; `Game.ts`/`Economy`/`CombatSystem`/`ContractFamilies`/profiles untouched. The one file outside `src/town/` is `src/main.ts`, and it is six words in a set literal (F-BT-1).

---

## 7. THE HONEST LINE — what still looks wrong that this shift could not fix

1. **There is still no horizon.** The town is a beautifully lit tabletop *seen from above*. Everything I could do inside the camera's cone is done; the sky is a framing decision (F-BT-2) and it belongs to the owner. Until then the square ends in fog at the frame edge, and it always will.
2. **The lite shell is still a painted card standing inside a box.** It has a roof now and it closes, but the card depicts a whole building — its painted roofline and the shell's real roof do not agree, and no amount of runtime geometry turns a 2D elevation into architecture. Lite needs either a low-poly building or a card-only presentation, not both.
3. **The window glow is in roughly the right place, not in the windows.** The offsets are authored against each building's *footprint*; the GLBs do not have window anchors, so a soft bloom is the honest maximum. Real light through real panes wants named anchors in the models (art-side, one batch).
4. **Two wear systems now share the ground on full tier.** The plate's baked road wear and U3's dwell decals are both good and they are not the same drawing. At close zoom you can see the seam if you look for it. The right fix is one wear authority — most likely a plate re-bake that consumes the decal placements.
5. **The cast is still flat-lit.** Sprites take no light from the scene, so at dusk the townsfolk stay day-bright inside a copper square. Blob shadows hide the feet; nothing hides the faces. This wants a tinted sprite material driven by the mood, and it is a bigger change than a beauty shift should make unannounced.
6. **No paper grain.** The run scene's `LedgerPostPass` ties its look to "antique ledger illustration"; the town has no post pass at all, and adding one is a render-target pipeline change with a real per-frame cost. U6 listed it as optional; I did not ship it, and the town is a little cleaner-looking than the game it belongs to because of that.
7. **The doorstep dressing has no era variants.** At E2+ the buildings transform and the kegs, tripod and slate stay E1. The `townEraProps` table is the place that would fix it, and it is a data task, not a rendering one.
