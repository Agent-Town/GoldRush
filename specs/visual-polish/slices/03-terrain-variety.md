# VP-03 — terrain-variety (kill the tile repetition) (s9b, 2026-07-04)

**Robin directive (2026-07-04):** "the tiles for the floor are highly repetitive, a bit boring — use GPT Image 2.0 again." LEDGER already flagged it: the bank tile's diagonal dry wash is a strong feature → repetition is loud.

**Goal:** the claim ground stops reading as a repeated stamp. Code first with the EXISTING tile; batch-003 variants drop in later by filename.

## Contract

1. **Variant sampler** (`src/world/Terrain.ts`): ground grid samples per-cell from a variant list (`terrain.bank` → `[terrain-bank-tile.png, terrain-bank-tile-b.png, terrain-bank-tile-c.png]`, contract-driven; missing variants gracefully collapse to available ones — with only the current tile it still works) + deterministic per-cell rotation (0/90/180/270) and mirror, seeded by cell coords (stable across runs — no shimmer on rebuild).
2. **Macro variation:** low-frequency tint/brightness noise (value noise, seeded, parchment-band amplitude — subtle: ±4–6% lightness, warm hue drift only) across the ground so distant repetition dissolves. Shader-level on the existing terrain material — ONE material, no draw-call growth.
3. **Feature-tile damping:** the dry-wash diagonal is the repetition tell; with rotation+mirror it becomes 8 orientations. If still loud at gameplay zoom, blend-weight it down (uniform, ?debug knob `Balance.terrain.featureMix`).
4. **River unchanged** this slice (UV-scroll fine per Robin); river-bank seam must not regress (screenshot compare).
5. Slots added to ledger: `terrain.bank.b`, `terrain.bank.c` (batch-003, full-bleed, same style anchor, NO strong diagonal features — quiet filler tiles by design).

## Acceptance

1. tsc/build green; zero console errors; visual + m0-02/terrain-related suites green; full regression NOT required if shader/material-only (no sim semantics) — but run visual.spec.ts + m1-05 (beacon ground placement unaffected).
2. New `e2e/vp-03-terrain-variety.spec.ts`: two ground screenshots 40 units apart differ (pixel-diff > threshold — proves per-cell variation); same seed twice → identical (determinism); draw calls unchanged (±0).
3. Desktop + 390px screenshots to `reviews/shots-vp-03/`; before/after pair at default camera for Robin.
4. 60fps target intact (frameMs p95 within m1-07 envelope on stress snapshot).

## Firewall

No gameplay changes; no props/decals this slice (batch-003 props are queued later — scatter system is VP-04 candidate, don't build it); don't touch Enemy/Build/Wave systems; existing e2e untouched.
