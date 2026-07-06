# W1 — River Valley beauty pass (world goes 3D, characters stay illustrated)

Owner directive (Robin, 2026-07-06): "I don't like the tiles, it is quite boring... so many cool details in a creative way that make the game more unique. Step by step — the gameplay itself is good. Now we can focus on making it more beautiful and appealing."

## Thesis
The world becomes real three.js 3D — terrain relief, living water, light, instanced detail — built PROCEDURALLY (no generation services, no new MCPs; this is shader + geometry code, Codex's home turf). Characters remain Frontier Ledger illustrated billboards standing IN that world (Octopath pattern). The 3D-character experiment is a SEPARATE, LATER decision (HANDOVER §5.4) — re-judge after this pass lands.

## Laws (every slice)
1. **Rendering-only.** Zero sim diffs: movement, collision, combat, economy, wave logic byte-identical. Existing e2e suites UNMODIFIED-GREEN is the drift proof. Sim stays planar (XZ); any visual height is render-side placement only.
2. **Gameplay legibility beats beauty.** The ford must read as THE crossing; river = wall for bandits; build tiles clear; enemy silhouettes pop against ground. If a beauty choice costs legibility, beauty loses.
3. **Perf gate**: 60fps target mid-range; perf snapshot before/after each slice (draw calls, frame time at wave-15 load); instancing everywhere; knobs to degrade (density/shadows) for mobile.
4. **Art direction**: brief §4 Frontier Ledger — engraved, parchment-warm, illustrated NEVER photoreal. Post-processing tuned toward ledger tones, not generic bloom soup.
5. One slice per lane task; screenshot review vs previous look in every gate; Robin verdicts the direction after W1-01+02 before we run the rest.

## Slices
- **W1-01 Terrain relief + anti-tiling** (first, queued): flat plane → displaced heightmap mesh (gentle valley: banks slope to the river, claim-side flatter; building pads flatten locally). Kill tiling with world-space noise blending of 2-3 ground textures + macro tint variation + existing variant sampler. Characters/buildings sample terrain height for visual placement (render-side Y).
- **W1-02 Living water**: river shader — flow, ripples, bank foam, depth tint, gold glints near pan spots; ford rendered as stones/shallows (legibility law); water edge meets the new banks (no hard seam).
- **W1-03 Light + atmosphere**: golden-hour directional sun, warm ambient, soft shadows (blob fallback knob), distance fog, post pass (subtle vignette + parchment grade + optional paper-grain overlay at low opacity — the ledger signature).
- **W1-04 Instanced detail**: seeded scatter of low-poly rocks, stumps, dry grass, wagon ruts, claim posts (visual only, no collision, excluded from routing lanes + build pads); density knobs desktop/mobile.
- **W1-05 Buildings 3D shells**: placeholder boxes → simple timber-frame 3D structures with the batch portraits as signage; sluice gets a turning wheel. (May be re-scoped after 029's building art is reviewed in-world.)

## Verification per slice
tsc/build; unmodified sim suites green; boot probe zero errors desktop+390; perf snapshot vs baseline; before/after screenshots to reviews/shots-w1-XX/; fire visual review vs brief §4 + this spec's laws.
