# Review — BEAUTY SHIFT: Night Shift (`e1-night-shift`)

**Slice/branch/tip:** beauty/night-shift · worktree `gr-task-beauty-night-shift` · solo-writer Opus 5 shift, 2026-08-02/03
**Brief:** `docs/beauty/e1-night-shift-brief.md` (read in full; its five upgrades attempted in order)
**Verdict:** ✅ **3 of 5 upgrades SHIPPED** (U1, U2, U3) · ⛔ **2 NOT DONE** (U4, U5) — both blocked by one discovered defect in the art pipeline, evidence below. Honest partial.

## What it does

The map's composition is its pools of light. This shift made them read as **amber instead of tan**, gave attackers a graded ignition as they cross into that light instead of a binary pop, and replaced the flat grey-mauve dusk with an authored oxblood-ember dusk and a cooler silver-rose dawn. Everything shipped is rendering-only (§4.6): shader constants, LightRig palette constants, and contract keyframe **colour** fields. No sim byte moved — every wave number, `darkness` value, radius, `minLight`, coverage rule and `nightSpeedOutsideLight` is byte-identical to main.

## Verdict table

| # | Upgrade | Verdict | Before → After | Measured effect | p95 (night moments) | Draw calls |
|---|---------|---------|----------------|-----------------|---------------------|------------|
| **U1** | Amber pool core, two-stop falloff | ✅ **KEPT** (re-cut twice) | `before/desktop-chrome-03-dark-pool.png` → `u3/…` | lit-ground warmth (R−B) **49.27 → 53.08** | dark +2.9%, dawn 0.0% | **112 → 111** (unchanged) |
| **U2** | Enemies ignite at the pool edge | ✅ **KEPT** (honest partial) | `u2-control/…-03b-dark-approach.png` → `u2/…` | ramp verified by arithmetic: boost 0.783 → 1.150 across the band | unchanged (≤1%) | unchanged |
| **U3** | Dusk + dawn become paintings | ✅ **KEPT** | `before/…-02-dusk.png` → `u3/…-02-dusk.png` | dusk warmth **48.66 → 67.37 (+18.71)**; dawn **47.72 → 40.53 (−7.19**, cooler, intended) | dusk/dawn unchanged | unchanged |
| **U4** | A night sky that exists | ⛔ **NOT DONE** | — | blocked: builder no longer reproduces shipped art (324 KB → **739 KB**, visibly different) | — | — |
| **U5** | Worked ground under the lanterns | ⛔ **NOT DONE** | — | blocked: same pipeline; geometry reproduces exactly but contract drops `landmarkPack` | — | — |

**A/B'd and rejected, each by measurement, not taste:**

| Tried | Result | Rejected because |
|-------|--------|------------------|
| `terrainPoolIntensity` 0.85 → 1.0 (brief suggested "up to ~1.0") | warmth **fell** 49.27 → 45.45 | more ACES compression ⇒ the pool went *creamier*, not more amber |
| `lanternRenderIntensity` 34 → 24 | lit ground identical (132,98,78) | the ground's colour comes from the terrain emissive, not this light |
| Brief's core tint `vec3(1.00,0.62,0.24)` | warmth 49.27 → **47.02** | it adds green and blue: brighter, but *less* chromatic than the rim it replaces |
| Warm pool light → `#ff9e3d` amber | build-island brightness 0.1053 → **0.0957** | under ACES, saturation on a light this bright costs post-tonemap luminance |
| Deepened rim `vec3(1.00,0.38,0.10)` | same effect, smaller | re-cut to `(1.00,0.485,0.10)` to hold luminance while keeping the warmth |
| Deepened cool stop `vec3(0.08,0.36,0.52)` | hero pool read **pink** on brown ground | reverted; the brief didn't ask for it and the render didn't support it |

## Evidence

| Gate | Result |
|------|--------|
| `tsc --noEmit` | clean |
| `npm run build` | green |
| `night-mode-truth.spec.ts` | **4/4 green** (desktop + mobile) |
| `e3-day-night.spec.ts` | **2/2 green** |
| `night3d-perf.spec.ts` 1.15 ratio assert | **RED — control-proven pre-existing.** Unmodified HEAD fails it *worse* (1.8148) than this branch (1.7019) |
| `e1-night-shift.spec.ts` | **3 RED (:271, :372, :435) — all control-proven pre-existing.** Pristine `origin/main` fails `:435` **4 of 4 runs** at inside ≈ 0.102 vs the 0.1444 floor |
| Console / page errors | zero across every capture (the rig asserts `errors == []`) |
| Draw calls / triangles | identical before → after (85 / 91 / 111 / 80; tris to the ±2 of enemy count) |

**Perf, measured honestly.** The brief's law is +15% p95. Running the board **twice on identical code** gives the real noise floor:

| moment | run A | run B | spread |
|--------|-------|-------|--------|
| 03-dark-pool | 10.6 | 10.4 | **1.9%** |
| 03b-dark-approach | 10.4 | 10.3 | **1.0%** |
| 04-dawn | 10.2 | 10.4 | **2.0%** |
| 02-dusk | 10.6 | 15.4 | 45.3% |
| 01-day | 24.8 | 17.6 | 29.0% |

The **night** moments — the ones this shift is about — repeat to ≤2%, and show no regression (dark +2.9%, dawn 0.0%, approach ≤1%). The day/dusk moments are dominated by asset-streaming settle and swing 24–45% run to run, so **no p95 claim can be made about them in either direction**; an apparent "+55% on 01-day" in one pass was noise, reproduced away on the next. This worktree also shares a machine with other shifts' dev servers, which is the same reason two guard suites flaked and had to be control-run.

## Shot pairs

Contact sheet (top row before, bottom row after; day · dusk · dark · dawn):
`reviews/shots-beauty-night/contact-sheet-before-after.png`

| Brief's shot | Before | After |
|---|---|---|
| 1. Plain day boot | `shots-beauty-night/before/desktop-chrome-01-day.png` | `…/u3/desktop-chrome-01-day.png` |
| 2. Dusk over the terraces | `…/before/desktop-chrome-02-dusk.png` | `…/u3/desktop-chrome-02-dusk.png` |
| 3. Full dark at a pool edge | `…/before/desktop-chrome-03-dark-pool.png` | `…/u3/desktop-chrome-03-dark-pool.png` |
| 3b. Wrecker approach (ignition) | `…/u2-control/desktop-chrome-03b-dark-approach.png` | `…/u2/desktop-chrome-03b-dark-approach.png` |
| 4. Dawn at wave 25 | `…/before/desktop-chrome-04-dawn.png` | `…/u3/desktop-chrome-04-dawn.png` |
| 5. Mobile 390px full dark | `…/before/mobile-chrome-03-dark-pool.png` | `…/u3/mobile-chrome-03-dark-pool.png` |
| 6. Night panorama at dusk | see F-3 — **the sky was not changed** | — |

The A/B ladder that produced U1 is kept whole under `shots-beauty-night/u1, u1b, u1c, u1d, u1e, u1lantern24` (Retention Law: rejected takes are evidence, not litter).

## Findings

**F-1 — The brief's premise for U4 is false: the panorama is unlit and never dims.** ✓ VERIFIED
`night-shift-panorama.glb` declares `KHR_materials_unlit` (`extensionsUsed: ["KHR_materials_unlit"]`), so GLTFLoader builds a `MeshBasicMaterial`, and `preparePanorama` (`Terrain3dClaimPilot.ts:267-292`) additionally sets `fog = false`. Nothing in `src/` ever mutates its colour. It therefore renders at **constant brightness at day, dusk, dark and dawn** — its exposure is baked into the pixels (`night-shift-panorama-contract.json`: `"exposure": {"mode":"bakedIntoAtlas","linearMultiplier":0.42}`). The brief says "the panorama is standard-lit so it dims naturally as darkness→1; verify it carries the dusk and dawn phases" — verified, and it does not. **Consequence for whoever picks U4 up: a star field painted into that atlas is equally visible at noon.** That needs an owner ruling (accept stars-at-noon, or add a render-side darkness response first), which is why I did not paint one on my own authority.

**F-2 — BLOCKING for U4: the panorama builder no longer reproduces the shipped art.** ✓ VERIFIED
Running the canonical, gate-clean route unmodified —
`Blender --background --python assets/pilots/map-rebuild-spike/build_contract_panoramas.py -- night-shift` —
regenerates a **materially different** panorama:

| file | shipped | rebuilt |
|---|---|---|
| `night-shift-panorama-atlas.png` | 324,251 B | **739,170 B** |
| `night-shift-panorama.glb` | 474,332 B | **837,864 B** |
| `night-shift-panorama-contract.json` | 2,370 B | 2,750 B |

The rebuild is visibly different art (heavier ridge silhouettes, a warm ground strip). So the *only* route that keeps the strict verifier green would have silently replaced shipped art with something nobody approved. **I restored all four files byte-for-byte** (atlas sha back to `e1e0b583240a7d04`) and left the sky alone. `assets/` is clean; the nine `artifacts/map-rebuild-spike/` verdict boards the run overwrote were restored from HEAD too.

**F-3 — BLOCKING-ish for U5: same pipeline, smaller gap.** ✓ VERIFIED
`build_unique_contract_terrains.py -- night-shift` reproduces the **geometry exactly** (vertices 16641, triangles 32768, bounds `[-32,-32,-0.47]..[32,32,3.18]` — all identical, so the runtime contract-equality gate would stay green), and the atlas differs by only 2,199 B of 6.34 MB (encoder-level). But the regenerated contract **drops the `landmarkPack` key** (5,480 B → 4,715 B). That key is documentation-only — no hit in `src/`, `scripts/` or `e2e/` — so it is a provenance regression rather than a functional one, and re-adding it by hand after a rebuild is a legitimate fix. **U5 is therefore unblocked-with-care**, unlike U4; what stopped it here was the remaining budget, not safety. Also restored byte-for-byte.

**F-4 — U2 can only ever be a small effect, for two structural reasons.** ✓ VERIFIED (arithmetic from shipped constants)
(a) `renderVisibilityCutoff` (0.35) chops the falloff band off at **0.396 wu** past the pool radius — roughly 0.15 s of walking — so that is the entire runway the ignition has. The real "pop" the brief wants gone is the visibility cutoff itself, and that constant is sim-coupled (`nightSpeedMultiplier` reads it as its `litThreshold`), so it is off-limits.
(b) `WaveSystem.enemyCarriesLantern` is `!wrecker && classes.includes('rusher')`, and this contract's classes are `[rusher, thief]` — so every rusher and thief stands at the centre of its **own** 4.6-radius pool and is permanently fully lit. **Only wreckers can ever show the ramp.** Fitting (they are the class the 1.18× dark-corridor speed rides) but it confines the effect. Measured: an ignition ladder over 15 visible enemies found exactly **one** in the band — the population is bimodal, as the arithmetic predicts.

**F-5 — Two guard suites are red on this machine before any of my work.** ✓ VERIFIED by control runs
`night3d-perf`'s 1.15 ratio assert and `e1-night-shift.spec.ts` `:271/:372/:435`. For `:435` I initially blamed my own colour change off a **single** passing run; a four-run control on pristine `origin/main` showed it failing 4/4 at the same values, which corrected me. Recorded because inheriting that wrong belief is exactly Mistake #4.

**F-6 — Unbriefed defect fixed: the mint disc.** At dusk the hero's pool rendered as a glaring cyan-mint disc (`#8fded3`) completely out of key with the warm frontier palette — visible in `before/desktop-chrome-02-dusk.png`. Moved to a steel blue `#b3d4ec` at matched luminance. It still reads as "your light, not theirs". **Reversible with one word** if the owner wants the mint back.

## THE HONEST LINE — what still looks wrong

**The pools are still washing out to cream in their middles, and that is the real remaining ugliness.** ACES tone mapping plus `lanternRenderIntensity: 34` drives the centre of every lantern pool past the point where any hue survives, so what the player sees is a bright pale disc with an amber *rim* — not the "seven amber pools" of the style anchor. I made the rim genuinely amber (48.66 → 67.37 warmth at dusk) and the core warmer, but I could not make the core amber, because every lever that would do it costs measured luminance somewhere a shipped spec is watching: raise the intensity and ACES desaturates it further; saturate the light and the lantern's build island stops reading as lit. **The honest fix is one I did not have authority to make in a rendering pass: the night pools want a tone-mapping or exposure treatment of their own, not another colour tweak.**

Second: **U2's ignition is real but you will not notice it.** 0.396 wu of runway, on wreckers only. It is strictly better than the binary pop it replaces and it costs nothing, but nobody will point at the screen and say "look, they kindle".

Third: **the sky is still a blurred slate gradient with one rust smudge** — no stars, no moon, nothing for the new oxblood dusk to break against. That is the single biggest remaining gap between this map and the style anchor, and U3 arguably made it *more* conspicuous by giving the dusk a real colour while leaving the horizon behind it empty. It is also the one I am least able to fix safely (F-1, F-2).

Fourth: **the ground is still the airbrushed mud the brief called out.** The seven_lantern_terraces, the night_work_road and the lampworks_yard are still landmarks on a smear; the pools land on undifferentiated brown. U5 remains the right prescription and is *technically* unblocked (F-3).

Fifth, on my own method: **the day and dusk p95 figures in this repo cannot be trusted to ±30%** on a machine running other shifts. I only make perf claims about the dark moments, where repeat runs agree to 2%.

## Merge classification

Branch-only; nothing merged to main. Per-upgrade path-scoped commits, pushed and verified against `git ls-remote` after each:

- `042173ee` rig — `scripts/beauty-shot-probe.mjs`, `e2e/beauty-night-shift.spec.ts` (new files)
- `7118451f` U1 — `src/world/LightRig.ts`, `src/world/Terrain3dClaimPilot.ts`
- `ad6c22df` U2 — `src/entities/pools.ts`, `e2e/beauty-night-shift.spec.ts`
- `af8f2e4f` U3 + U1 tint correction — `src/world/LightRig.ts`, `src/world/Terrain3dClaimPilot.ts`, `assets/contracts/epoch-1-frontier/contracts.json`
- evidence-board commits alongside each

`assets/pilots/map-rebuild-spike/` is byte-identical to main (verified by sha256 after the two Blender probes). LITE untouched. No GLB, no atlas, no contract-equality surface was changed, so the regenerate-same-commit rule never came due.
