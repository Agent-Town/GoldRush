# VP-02 — sprite-animation (pose-swap billboards) (s9b, 2026-07-04)

**Robin directive (2026-07-04):** "we need sprite sheets to make the animations better."

**Goal:** characters animate via frame cycling on their billboards. Pose-swap flipbook (2–4 frames), NOT dense sheet grids — GPT Image consistency limit; storybook look is the style anchor anyway.

## Contract

1. **Layer-contract v2** (`assets/layer-contracts/characters.v2.json`): a slot may declare `frames` — either `files: ["hero-walk-a.png", "hero-walk-b.png", …]` (per-file poses, batch-003 path) or `grid: {file, cols, rows, order}` (future real sheets). Plus `clips: { idle: {frames:[0,1], fps: 2}, walk: {frames:[2,3], fps: 4}, … }`. v1 single-image contracts stay valid (1-frame clip) — batch-001 assets keep working untouched.
2. **`SpriteAnimator`** (`src/assets/`): per-entity clip state (idle/walk/hit/flee), frame timing on sim time (pauses with hit-pause/`?nopause` correctly), UV-offset or texture-swap on the existing billboard material — whichever is cheaper with InstancedMesh pooling; NO per-frame material clones (pool-wide atlas or shared textures).
3. **Wiring:** hero (idle/walk from velocity), claim jumper (walk; flee clip hook for M2-04 thieves — hook only, no thief logic). Procedural bob/tilt REMAINS under the frame cycle (layered, tuned down ~50% so it doesn't fight).
4. **Placeholder-first:** until batch-003 poses exist, both clips reference the existing single batch-001 frame (1-frame clips) — code fully shippable with zero new art; batch-003 files drop in via contract only.
5. Perf: no added draw calls (atlas/shared texture), no per-frame allocations (pre-resolved UV rects).

## Acceptance

1. tsc/build green, zero console errors; full regression green (rendering-only change, but run it — pool semantics touched).
2. New `e2e/vp-02-sprite-animation.spec.ts`: with a 2-frame test clip injected via `__GR_TEST__.setTestClip(slot, frames, fps)` — in-page rAF tracker observes ≥2 distinct frames over 2s sim on hero while moving; frame HOLDS during hit-pause; 1-frame contract renders identical to today (screenshot compare vs baseline within tolerance).
3. Renderer-memory stable across clip swaps ×3 (warm-cycle pattern per STATUS lessons).
4. Desktop + 390px screenshots to `reviews/shots-vp-02/`.

## Firewall

No gameplay/movement/stat changes; no Enemy.ts movement-update edits (M2-01 lane owns those regions — coordinate at integration); no new art files required; don't touch existing e2e.
