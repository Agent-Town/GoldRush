# VP-02 — sprite-animation (sheet-based billboards) (s9b, REVISED s9c 2026-07-04)

**Robin directives (2026-07-04, BINDING):** (1) "we need sprite sheets" — full animation sets per character as SHEETS, all frames in ONE image (in-image consistency; proven s9c: singles drifted, 2x2 sheets held), on flat **magenta #ff00ff** key. (2) Characters must cover ALL directions (left/right/up/down, turning) and actions (shoot, hit, pan, build — extensible).

**REVISION over the s9b pose-swap plan below:** the contract's primary form is now the sheet grid; per-file frames remain a legacy fallback. Orientation model (BINDING): per character 3 generated orientations — `side` (mirrored at runtime for the 4th direction), `front`, `back` — one sheet per orientation, `clips` defined per orientation with fallback chain (missing orientation → side+mirror; missing clip → walk; missing everything → 1-frame batch-001 billboard). Assets that exist TODAY: `char-hero-sheet-side.png`, `char-jumper-sheet-side.png` (2x2 magenta: idle-ish/walk-L/walk-R/hit|flee) — integrate these first; front/back + action cells arrive as batch-004 ONLY after these two survive extraction→contract→in-game (placeholder-first).

**Extract script extension (part of this slice):** `scripts/extract-alpha.mjs` gains `--key <hex>` (default 8a8a8a; ff00ff for sheets; hue-aware despill for saturated keys — kill magenta fringe on anti-aliased edges) and `--grid CxR` (slice cells, bbox-center each cell's content, normalize to contract cell size, emit `<name>-r<row>c<col>.png` + a frames JSON stub for the contract).

**Original s9b plan (still valid where not superseded):**

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
