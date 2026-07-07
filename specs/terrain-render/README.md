# Terrain Render v2 — the ground stops being tiles
Status: RATIFIED-BY-DIRECTIVE 2026-07-08 (owner, verbatim): "For me the solutions with the graphic tiles is a temporary one. The edges are clearly visible and it looks cheap/easy. So improving that going forward is important. But it helped us to get where we are." Sibling directive same message: "Having geographical variations will add a lot to E1. Asking the players to play the same geography again and again is going to be not very successful."

## The architecture (why the edges die and the style survives)
Today: ground = repeated tile-texture quads → visible seams, obvious repetition. Successor: **one continuous ground mesh from the GT-01 heightfield** (the substrate already shipped) + **splat blending**: 3–5 material layers (the EXISTING hand-painted textures — sand, riverbank damp, rock, scrub — as splat inputs) blended per-fragment by weights + low-frequency noise breakup + macro-variation tint. Result: no quad boundaries CAN exist (one mesh, blended materials), repetition broken by noise, and the illustrated warmth preserved because the painted art IS the palette — the shader only decides WHERE each texture shows, never what it looks like. Trails/ruts/transitions move to a detail-decal layer on top (already the RenderLayers pattern).

## Laws
1. RENDERING-ONLY (the planar-sim law untouched; GT tiles keep their sim meaning).
2. STYLE PRESERVATION: splat inputs are the existing painted textures; any new blend must pass a side-by-side vs the current look at gameplay zoom — warmer or equal, never "procedural-looking". The owner judges.
3. PERF: mobile-first budgets — one ground draw call target, shader cost measured on the 390px project, frame p95 within existing envelopes.
4. CONTRACT-DRIVEN: palette/material weights come from tile descriptors (the identity pass's socket) — one system feeds every geography.
5. Placeholder-first honored in reverse: tiles remain the fallback until TR-02 passes the owner's eye; nothing breaks mid-migration (a flag flips per-tile).

## Slices
- **TR-01 continuous ground mesh** — heightfield-driven mesh replaces the tile quads (same textures, still per-region UVs; seams reduced, not yet gone), behind a flag; both paths gate-green.
- **TR-02 splat blending + noise breakup** — the edges DIE: multi-layer weights + noise; side-by-side artifacts for the owner verdict; flag defaults on when he approves.
- **TR-03 contract material identities** — descriptors declare palettes/weights (mesa ochre for the Gulch, braided-marsh for Twin Banks, the claim's classic warm) — feeds/merges with the tile-identity pass.
- **TR-04 detail decal layer** — ruts, trails, waterline transitions, scorch as decals on the continuous ground (kills the last "tile-ish" tells).
Sequencing: the TILE-IDENTITY PASS runs FIRST on current machinery (geography variety now, cheap); TR-01/02 follow (the look upgrade); TR-03 then makes identity inherit seamlessness automatically. GT-04/05 (sightlines/water sim) proceed independently — different layer.

## Integration map
Touches: TerrainView/render pipeline, tile descriptors (additive weights), shaders. NEVER touches: TileHeight sim data, routing, determinism, the water sim, camera.
