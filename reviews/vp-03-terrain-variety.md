# Review — VP-03 terrain-variety (relay lane tasks/003)

**Verdict: PASS with one gate correction (s11, 2026-07-04).** Integrated with the correction folded in.

## What landed

`src/world/Terrain.ts` (+234/-14): shader-level per-cell variety on the bank ground. Custom
`onBeforeCompile` chunk gives each tile cell a deterministic hash-seeded rotation (0/90/180/270),
mirror, and variant pick from a canvas atlas; low-frequency value-noise macro tint (warm drift,
±~5% lightness); `Balance.terrain.featureMix` damping knob wired into the ?debug gui (new
`terrain` section in Balance.ts + DebugTools group). Layer contract `terrain.bank` now maps to a
variant array (tile, -b, -c) — missing files skipped silently. One material, zero draw-call
growth. River untouched. New e2e `e2e/vp-03-terrain-variety.spec.ts` (2 tests: variety without
draw-call growth; same-seed determinism).

## Gates

- `npx tsc` clean; `npm run build` clean.
- New suite vp-03: **2/2** (26–29s), including after the gate correction.
- Canary `m1-05-sentry-beacon-build` (required by task): **6/6**, re-run post-correction: 6/6.
- `verify:visual` (visual.spec.ts): **5/5** — river-band slowdown test confirms no river/seam
  regression.
- Full regression: **65/65** desktop-chrome (after correction; see finding 1).
- Screenshots: `reviews/shots-vp-03/` — desktop-ground-west.png vs desktop-ground-east.png
  (visible per-cell variation, subtle parchment-band, no patchwork; 23 draw calls both),
  mobile-390-ground.png.

## Findings

1. **MAJOR — caught by full regression, fixed at gate (orchestrator, ~10 lines).**
   `visual-polish-assets.spec.ts › failed generated seam image keeps procedural fallback
   playable` failed: game never booted (diagnostics undefined) with the seam texture
   route-aborted. Root cause: the new `import.meta.glob(..., { eager: true })` over
   `assets/processed/*.png` compiles to **static imports of every processed png**, making each
   asset a boot-time module dependency in dev — one failed/blocked asset request kills the whole
   app instead of degrading to placeholders. That inverts the project's placeholder-first
   resilience contract. Fix: lazy glob + caught dynamic import in `loadBankVariantTexture`
   (failure → null → variant skipped). Affected suites re-run green (visual-polish-assets 2/2,
   vp-03 2/2, visual 5/5, m1-05 6/6, m1-06 8/8).
   **Process lesson (mine): tasks/003's self-check list omitted visual-polish-assets.spec.ts, so
   Codex's local checks passed around the regression. Canary lists must include the resilience
   suite whenever asset loading changes.**
2. **WATCH — integration-blocking for batch-003 terrain art.** Atlas row mapping vs `flipY`:
   the atlas canvas is uploaded with three.js default `flipY=true`, while the shader indexes rows
   bottom-up via `(tileUv.y + variant) / atlasRows`. With a single variant (today) this is
   harmless. With 3 variants + power-of-two padding rows, the mapping likely shuffles variants
   (tile A never sampled, last variant doubled). **Before marking terrain-b/-c integrated: set
   the atlas texture `flipY=false` (+ `needsUpdate`) or invert the row index in the shader, then
   verify all three variants appear in a probe screenshot.** Assigned to the art-integration
   fire (LEDGER note).
3. **Minor.** `BANK_TILE_REPEATS=4` hardcoded (matches previous repeat(4,4)); per-frame
   `syncBankMaterial` is a cheap uniform write; seed derives from `?seed` via `normalizeSeed` —
   e2e proves cross-page determinism.
4. **Good.** Contract-driven variant list with graceful degradation; procedural fallback retained
   when no textures resolve; style stays inside the muted parchment band (screenshots); zero
   draw-call growth proven twice (e2e + probe).

## Scope check

Files touched: Terrain.ts, Balance.ts (new terrain section only), DebugTools.ts (one gui line),
layer contract, new e2e — inside the declared lane scope. `props.ts` untouched (ground material
not shared). No canon or naming violations.
