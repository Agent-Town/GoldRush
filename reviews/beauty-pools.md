# Review — THE POOL EXPOSURE TREATMENT (F-BEAUTY-2, `beauty2/pools`)

**Slice/branch/tip:** beauty2/pools · worktree `gr-task-beauty2-pools` · solo-writer Fable session, 2026-08-03 · rig `ebb9e93a`, seam `541b3cbe` (review + probe scripts land in the commit after this file)
**Task:** `TASK.md` (F-BEAUTY-2) — "design and implement the pool-local exposure/grading seam that keeps luminance-law satisfied while the core reads AMBER … choose by MEASUREMENT, not preference."
**Verdict:** ✅ **SHIPPED on branch** — Route C implemented as THE POOL GRADE: a pre-tonemap chroma re-anchor + hue-preserving exposure shoulder in the terrain pool shader, flag-guarded, measured on every axis the task names. Branch-only; nothing merged to main.

## The mechanism, corrected by measurement (read this first)

The task inherited this premise from `reviews/beauty-night-shift.md` §HONEST LINE: *"pool cores wash to cream because ACES + lanternRenderIntensity 34 drives hue past survival."* Verify-don't-inherit (Mistake #4) applied to a premise, not just a claim:

**At shipped values, ACES does NOT bleach the night pool ground.** The transect rig (`e2e/beauty-pools.spec.ts`, 9×9 median over 5 frames per point, desktop+mobile) measured the first relit lantern pool at true dark:

| configuration | mid-band ground (d 2.5–3.5 of r 7) | verdict |
|---|---|---|
| lantern pool, isolated (`heroLightRadius 0`) | rgb ~(84,69,40) · **sat 0.52–0.57 · hue ~40°** | **already amber** |
| two warm pools overlapping (both intensity 34) | sat 0.40–0.52 · hue ~40° | still amber — no over-range bleach |
| dusk, isolated (sun up + pool) | rgb ~(177,133,74) · sat 0.58–0.63 | bright amber |
| emissive term alone (`lanternRenderIntensity 0`) | rgb ~(82,67,36) · sat 0.54–0.57 | the amber IS the terrain emissive |
| **as the player sees it (hero standing in the pool)** | rgb ~(83,70,67) · **sat 0.19 · hue 11°** | **the pale disc** |

**The wash is the hero's/prospector's cool light** (`#b3d4ec`, by design "your reach stays tellable") additively contaminating the warm ground exactly where the player stands — which is exactly where the player looks. Blue channel 67 vs 40 with the hero light on/off; nothing else moved. The night-shift's U1 rim work had already won the isolated-pool fight; every scene it was judged in had the hero standing inside the pool.

Consequence for the route decision: **no luminance-only curve can undo an additive hue shift.** An "exposure treatment" alone would have compressed the pale disc into a dimmer pale disc. The seam therefore grades chroma at preserved luminance, and carries the exposure shoulder as the second half — the insurance the original premise asked for, priced at zero when nothing is over-range.

## Routes — evaluated honestly, two rejected by numbers

| route | measured result | rejected because |
|---|---|---|
| **A — localized tone-map region via the existing post pass** (`LedgerPostPass`) | The pale zone's post-ACES chroma signal is **16 8-bit steps**; the amber target needs **44** — a ×2.75 expansion puts ~2.75-step banding across a smooth gradient (`reviews/shots-beauty-pools/route-a-note.json`). | Operates after the information is quantised; needs a per-frame framebuffer copy at night — the exact cost class the auto-tier ladder sheds FIRST and `LightRig` deliberately never runs at night (`heatOn = !stress && !night`); needs screen-space pool projection plumbing; and it would regrade sprite pixels inside the disc, where `e1-night-shift`'s `VISIBLE_LIGHT ≥ 0.35` floors sit. |
| **B — pre-tonemap emissive colour-space shaping** | The emissive-only arm already reads amber (sat 0.54–0.57) — **within 3% of the isolated pool**. | The emissive is not the patient: the wash arrives through the lighting term, accumulated after the emissive block. Emissive shaping's measured ceiling on the pale disc is zero. The prior shift's four rejected colour tweaks all live on this route. |
| **C — hue-preserving treatment in the pool shader only** ✅ | Full sweep below; pale disc recovers to the isolated signature at preserved luma. | **CHOSEN.** Runs where the information still exists (float HDR, pre-tonemap), terrain fragments only, zero extra passes, compiled out under `?nopoolgrade`. |

## The seam (one injection, `Terrain3dClaimPilot.ts`)

`POOL_GRADE_GLSL`, injected before `#include <opaque_fragment>` in the terrain material only, masked by **warm-pool falloff × darkness** (the same spatial law the pool emissive already follows; hero/prospector cool pools are excluded by the existing `w` flag):

1. **Chroma re-anchor** — mix `outgoingLight` toward the pool's own per-fragment warm tint (`terrain3dPoolWarm`, rim→core), luma-matched via Rec.709 weights so **pre-tonemap luminance is preserved per-pixel**. Ground texture detail survives in luma; only chroma re-anchors.
2. **Exposure shoulder** — hue-preserving Reinhard on the max channel above `poolGradeKnee` (0.85) rolling toward `poolGradeCeiling` (1.6): the pool's own exposure treatment, so any over-range sum (dusk + flash + future intensity raises) rolls off before ACES can bleach it. Identity when under-range — measured dusk deltas ≤0.5%.

`Balance.contracts.nightShift.poolGradeStrength/Knee/Ceiling` are read per frame (live `setBalance` tuning); `?nopoolgrade` (`DebugParams.isPoolGradeDisabled`) compiles the shader byte-identical to main for same-session A/B (F-1113-4 doctrine).

**Strength sweep** (live, one browser, `scripts/beauty-pools-tune.mjs`; pale zone d 2.5–3.5; gate points shown never moved at any strength):

| strength | pale-zone sat | hue | luma vs baseline 0.2845 | `:435` in (d2) | `:435` out (d11) |
|---|---|---|---|---|---|
| 0 (=main) | 0.193 | 11.3° | — | 28,21,13 | 15,12,7 |
| 0.55 | 0.333–0.345 | 29–31° | −0.8% | 28,21,13 | 15,12,7 |
| 0.7 | 0.381–0.393 | 33–35° | −1.2% | 28,21,13 | 15,12,7 |
| **0.85 (shipped)** | **~0.44** | **~37°** | **−1.5%** | 28,21,13 | 15,12,7 |
| 0.9 | 0.464–0.500 | 38.6° | −1.9% | 28,21,13 | 15,12,7 |
| 1.0 | 0.524–0.565 | 40–41° | −2.4% | 28,21,13 | 15,12,7 |

0.85 ships: unambiguous amber (three steps past the 33° amber boundary, sat within 0.08 of the isolated signature) while keeping ~15% of the original ground chroma so the cool light's presence is de-emphasised rather than erased (F-3 below), with luma cost −1.5% at points no spec samples.

## Before → after at full dark

Contact sheet (top baseline, bottom graded; desktop `:435` view · desktop two-pools-with-hero · mobile 390px): `reviews/shots-beauty-pools/contact-sheet-before-after.png`

| view | before | after |
|---|---|---|
| the `:435` pool, hero standing in it | `shots-beauty-pools/baseline/desktop-chrome-dark-pool-435.png` — amber rim, **pale pink middle** (sat 0.19, hue 11°) | `…/graded/desktop-chrome-dark-pool-435.png` — one warm amber gradient core→rim (sat 0.33→0.44 at the same points, hue 30–37°) |
| two pools, hero between | `…/baseline/desktop-chrome-dark-two-warm-hero.png` — pale saddle across the overlap | `…/graded/desktop-chrome-dark-two-warm-hero.png` — continuous amber lake, no saddle, no seam between pools |
| mobile 390px | `…/baseline/mobile-chrome-dark-pool-435.png` | `…/graded/mobile-chrome-dark-pool-435.png` — same recovery (sat 0.221→0.33+, mobile transect JSON) |

Complete per-point JSON transects for every arm, both projects: `shots-beauty-pools/{baseline,graded}/transect-*.json`. The intermediate strength-0.55 take is kept whole under `graded-s055/` (Retention Law: rejected takes are evidence).

## Evidence

| gate | result |
|---|---|
| `tsc --noEmit` | clean |
| `npm run build` | green (asset-diet included) |
| `night-mode-truth.spec.ts` — the pixel samplers the task names, UNMODIFIED | **4/4 green desktop+mobile.** Its hero-pool sample points carry warm-pool mask 0 → pixels untouched by construction, and measured so |
| `e3-day-night.spec.ts` | **2/2 green** |
| `night-light-doctrine.spec.ts` | **2/2 green** |
| `e1-night-shift.spec.ts` | 12 passed; **6 red = the exact three pre-existing lines (:271/:372/:435) × both projects** — control-proven: a detached worktree at pristine main (`216a19c3`, own vite :5262, same box, minutes apart) fails the identical six. `:435` desktop values are **bit-identical** on both trees: inside 0.09376705882352941 / outside 0.045056470588235295 — the treatment moved the gated sampler by zero bytes |
| `night3d-perf.spec.ts` | Ratio assert red **at the-claim, a daylight contract where the seam is structurally zero**: treated 1.788/2.441 (d/m); **pristine-main control fails WORSE, 2.284, and its sticky-tier test flaked too (4/4 red vs my 2/2 green)**. Same shape the night-shift review recorded (control 1.8148 > branch 1.7019). Box-conditioned pre-existing red, not this seam's |
| cross-map compile | night3d-perf's matrix booted `the-claim`, `e5-deepwater-claim`, `e9-dome-basin` + LITE fallback path with the new shader — all reached `terrain3dPilotState=ready`, zero console/page errors |
| day no-regression | `scripts/beauty-pools-day-probe.mjs`: 6 ground points at wave 1, grade ON vs `?nopoolgrade`, same browser — worst channel delta **1 of 255** (animation-residue quantisation; grade branch is skipped at darkness 0) |
| console/page errors | zero across every capture and probe (asserted in-rig) |

**Perf, the +15% law** (`scripts/beauty-pools-perf-ab.mjs`, F-1113-4 same-session A/B: one browser, arms interleaved by reload, night pressure scene = 60 enemies / 7 relit lanterns / cap 8 / true dark):

| arm | round p95s (ms) | median |
|---|---|---|
| grade ON | 12.6 · 12.6 · 13.0 | **12.6** |
| grade OFF (`?nopoolgrade`) | 13.0 · 12.7 · 11.4 | **12.7** |

Δ = **−0.8%** at loadavg 22–27 (recorded in-run) — the arms are statistically identical; the seam is a handful of ALU ops on terrain fragments. The absolute numbers sit above the task's quoted 9.8/10.3 baselines because this box was running 3 sibling shifts; the interleaved-arm design is exactly why that doesn't matter. No p95 claim is made from separate runs (night-shift review's own rule).

## Findings

**F-1 — The task's mechanism premise was misattributed; the fix targets the measured mechanism.** ✓ VERIFIED (decomposition arms above). "ACES + intensity 34 kills the hue" is not reproducible on the ground at shipped values — the night-shift's own U1 re-cut had already carried the isolated pool to amber. The cream the owner sees is warm+cool additive mixing. The seam fixes that, and still ships the exposure shoulder so the original failure mode is priced in if future tuning pushes sums over range. The task's "choose by MEASUREMENT" clause is what caught this.

**F-2 — `:435` stays red, pre-existing, and this seam provably didn't touch it.** ✓ VERIFIED. Its inside point (d=2) sits in a dark patch already on the amber axis (28,21,13 — the grade is near-identity there), and the failure values are bit-identical between treated tree and pristine-main control. The night-shift review's F-5b recommendation (sample over N frames or pin the flicker) stands unaddressed and is still the right fix for that guard.

**F-3 — Deliberate tradeoff: the cool light's GROUND read inside warm pools is mostly graded away.** The hero's "reach" stays tellable on figures, buildings, and all ground outside warm pools (mask 0 → byte-identical); inside a lantern pool the ground now belongs to the lantern (owner canon: the pools ARE the composition). Strength 0.85 keeps ~15% of the original chroma as a residual cool presence. **Reversible with one word:** `poolGradeStrength 0` (or the flag) restores main's look exactly; any value 0–1 is live-tunable if the owner wants the cool disc back stronger.

**F-4 — Dawn was not separately transected.** Dusk (darkness 0.62) was measured healthy in both arms; dawn re-uses the same darkness ramp downward and the grade scales with darkness by construction. Stated as a known gap, not a verified fact.

**F-5 — Enemy-lantern micro-pools (r 4.6, warm) are inside the mask.** Their ground gets the same grade; at intensity 5.5 they were not near any wash threshold. No spec samples them; noted for completeness.

## Merge classification

Branch-only; **nothing merged to main; main's working tree never touched** (solo-writer worktree, own vite on :5261, control on :5262 in `/tmp`, since removed). Path-scoped commits:

- `ebb9e93a` rig — `e2e/beauty-pools.spec.ts`, `playwright.beauty2-pools.config.ts`, `reviews/shots-beauty-pools/**` (baseline + graded evidence, route-a note)
- `541b3cbe` seam — `src/core/DebugParams.ts` (+`isPoolGradeDisabled`), `src/game/Balance.ts` (3 keys), `src/world/Terrain3dClaimPilot.ts` (uniforms + injections)
- (this commit) review — `reviews/beauty-pools.md`, `reviews/shots-beauty-pools/contact-sheet-before-after.png`, `scripts/beauty-pools-{tune,perf-ab,day-probe}.mjs`, BACKLOG line

No sim byte moved: every `darkness`, radius, `minLight`, falloff and coverage rule is byte-identical to main (§4.6 rendering-only; the rig's `setBalance` probes are capture-session-local). No assets, no contracts, no LITE path, no light-budget change (32-pool cap and `maxDynamicLights 8` untouched). The drain should run its standard battery; expect the two known pre-existing reds with the fingerprints recorded above.
