> ⛔ **SHIPPED — DO NOT QUEUE (Mistake #8 guard, content-probed s1132 2026-07-27).** `src/assets/SpriteAnimator.ts` exists; the master's test hook shipped as `src/game/Game.ts:1842` `setTestClip: (slot, frames, fps)`; the contract `assets/layer-contracts/characters.v2.json` is at v2 with grid+clips; spec `e2e/vp-02-sprite-animation.spec.ts`. See F-1132-1.

# Task 004 — VP-02 sprite-animation (sheet-based billboards)

**Spec (BINDING, read fully):** `specs/visual-polish/slices/02-sprite-animation.md` (REVISED s9c header supersedes the s9b plan where they conflict).
**Brief constraints:** `docs/GOLD_RUSH_BRIEF.md` §9 (illustrated never gory; naming per §9.4). Read `AGENTS.md` first.
**Skills:** use `threejs-gameplay-systems` (pooling/UV patterns) and `threejs-qa-release` (evidence) as relevant.

## Goal

Sheet-based sprite animation for hero and claim jumper per the REVISED spec: layer-contract v2 with `grid` frames + `clips`, a `SpriteAnimator` on sim time, wired to hero (idle/walk from velocity) and claim jumper (walk; flee clip hook only — no thief logic). Placeholder-first: with no sheet assets present, 1-frame clips reproduce today's billboards exactly.

## What already exists (s12 — do NOT redo)

- `scripts/extract-alpha.mjs` already has `--key`, `--grid CxR`, hue-targeted despill, bbox-center-normalize. Do not modify it.
- Processed sheet cells are committed: `assets/processed/char-hero-sheet-side-r{0,1}c{0,1}.png`, `char-jumper-sheet-side-r{0,1}c{0,1}.png` (512², bbox-centered, ONE shared scale per sheet) + `char-hero-sheet-side.frames.json` / `char-jumper-sheet-side.frames.json` (grid, scale, per-cell bbox).
- Orchestrator's visual read of cell semantics (verify against the images yourself):
  - hero: r0c0 stand/idle (pan at side), r0c1 walk-A, r0c1/r1c0 are the stride pair, r1c1 two-hand pan brace (use for `hit` or `pan`).
  - jumper: r0c0 crouch-lurk (idle), r0c1 reach, r1c0 stride (walk pair with r0c1), r1c1 running nugget-carry (use for `flee` — M2-04 hook).
- Asset loading rule (BINDING, s11/s12 gate findings): lazy `import.meta.glob` ONLY for processed pngs (see `src/world/Terrain.ts` and `src/ui/UpgradeOverlay.ts` headers); never eager. NEVER mutate a live texture's backing canvas dimensions — three.js storage is immutable after first upload; swap in a fresh `THREE.CanvasTexture` (see Terrain.ts atlas install, s12 fix).

## Files in scope

- `assets/layer-contracts/characters.v2.json` (new)
- `src/assets/SpriteAnimator.ts` (new), `src/assets/generated.ts` (additive only), `src/assets/slots.ts` (additive only)
- `src/entities/Hero.ts`, `src/entities/Enemy.ts` (animation wiring only — NO movement/stat/pool-semantics changes)
- `src/game/Game.ts` (diagnostics + `__GR_TEST__.setTestClip` plumb only)
- `e2e/vp-02-sprite-animation.spec.ts` (new)

**Do not touch:** `src/systems/*` (WaveSystem/CombatSystem/Economy), `Balance.ts`, `BuildSystem`/buildables, existing e2e specs, `scripts/`, `assets/processed/*`, `STATUS.md`, `specs/` other than marking VP-02 progress notes.

## Acceptance (from the spec, verbatim gates)

1. tsc/build green; zero console errors.
2. New `e2e/vp-02-sprite-animation.spec.ts`: injected 2-frame test clip via `__GR_TEST__.setTestClip(slot, frames, fps)` — in-page rAF tracker sees ≥2 distinct frames over 2s sim while hero moves; frame HOLDS during hit-pause; 1-frame contract renders identical to today (tolerance compare).
3. Renderer-memory stable across clip swaps ×3 (warm a full cycle before baselining — see STATUS "Verification lessons").
4. No added draw calls; no per-frame material clones or allocations (pre-resolved UV rects).
5. Desktop + 390px screenshots to `reviews/shots-vp-02/`.
6. Procedural bob/tilt stays, tuned down ~50% under frame cycles.

## Environment notes (Robin's Mac — you run there)

Run e2e via base `playwright.config.ts` only (own webServer). Full regression (`npx playwright test`) must be green before you finish; the suite is currently 65 desktop-chrome tests + this slice's new spec.
