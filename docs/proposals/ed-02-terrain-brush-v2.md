# ED-02 terrain brush v2 — implementation note

**Status:** B6 implementation note for `sol/ed-02-brush-v2`, stacked on B5 `a0e49a96` by the 2026-07-11 unblock ruling.

## Brush contract

- Raise, lower, and smooth collect a whole pointer drag as a continuous grid-space polyline and apply each grid node once from its distance to that path on pointer-up. Extra collinear pointer samples therefore cannot change descriptor bytes. Smooth reads one immutable pre-stroke snapshot; all results are clamped to the B5 limit and rounded to three decimals. The zero perimeter is never written.
- A contract without an authored layer gets a full-claim 41 by 41 `visual-delta` grid. Existing valid grid dimensions are preserved.
- Zone gestures compile immediately to the existing build-zone rectangle with an explicit north/south bank. Pond taps compile to `spring_pond` circles. Edge taps toggle the nearest existing spawn-edge enum while preserving at least one edge. V1 creates no sampled paint masks.
- The canvas is pointer/touch driven and keyboard reachable: arrow keys move its announced cursor and Space or Enter applies the selected tool. Tool, size, strength, bank, and cursor state survive the required scene reload in a small editor-only session record.

## Document and history contract

Every successful gesture stages exactly one complete descriptor through the B5 decoder, then uses the existing reload-as-rebuild path. The brush never mutates Game, Terrain, or simulation state directly.

Undo and redo store canonical descriptor snapshots under `gr.editor.history.v1:<contractId>`. The combined serialized stacks are capped at 20 entries and 1,000,000 characters, pruning oldest snapshots first, and a head fingerprint prevents reuse against an unrelated descriptor for the same contract. Field edits and imports use the same history transaction as brush gestures; every restored snapshot is decoded again before it can become active. A new edit clears redo.

The generic inspector deliberately skips `authoredTerrain`: rendering 1,681 individual delta controls would duplicate the brush and make the editor unusable. Export and import remain the ordinary canonical descriptor page, so fields outside the four brush-owned paths retain their order and bytes.

## Gate boundary

B6 owns TypeScript/build and its slice specification. Desktop/mobile browser execution, screenshots, ED-01 regression, and the adjacent 044 and M1-01 batteries remain orchestrator-side. B5-MP-01/02 are accepted pre-existing violations assigned to Session A and are not B6 blockers.
