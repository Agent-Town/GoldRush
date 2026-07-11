# Authored terrain grid v1 — render-only substrate

**Status:** B5 implementation note for `sol/terrain-authored-grid`.

## Decisions

- `ContractManifest.tileParams.authoredTerrain` is a bounded, versioned row-major grid of additive visual height deltas. V1 is a square, full-tile lattice sampled by the existing terrain mesh and capped at 41 by 41 samples (1,681 deltas) to bound document size and sampling work. Each finite delta is capped at 16 world units and the perimeter must remain zero so the authored surface returns continuously to the existing vista.
- `Terrain.sampleHeight()` and `sampleUnclampedHeight()` compose the decoded bilinear delta over the existing visual base. The no-layer path returns the old value directly. B5 edits no `src/sim/TileHeight.ts`, targeting, or gameplay-elevation code; its substrate gate hashes only simulation-height samples and requires equality with and without the authored layer. Existing gameplay code still reads rendered entity `y` in the canonical multiplayer hash and scripted rail arrival; both out-of-territory couplings are recorded in `reviews/sol-findings-b5-lockstep-visual-y.md` and are not claimed as resolved here.
- The active editor document lives as canonical JSON in per-contract `sessionStorage`, staged through `parseContractDescriptor()` before reload. This is the smallest seam that exists before `Terrain` captures the active contract, survives `location.replace()`, stays tab-scoped, and avoids putting a dense grid or undo history in the URL. B6 may store its bounded snapshot history under a separate editor-owned session key.
- Old `editorDescriptor` links remain readable, but new edits put only the short `editorDescriptor=session` selector in the URL and keep the descriptor bytes in session storage. A rejected edit cannot replace the last valid session bytes.

## V1 paint boundary

V1 adds no raster masks. Zone, water, and lane painting must compile to the existing bounded shapes: build-zone rectangles, `spring_pond` circles, and unique north/south/east/west spawn edges. Arbitrary polygons, water masks, feathered zones, and sampled lane masks wait for a separately versioned descriptor decision.
