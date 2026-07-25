---
title: THE MAP RECONCILIATION (late half) — twenty maps held against their promised art
date: 2026-07-25
branch: sculpt/map-fix-late
status: IN PROGRESS — findings land as they are verified; every number here was measured, not inferred
scope: e6/e7/e8/e9/e10 — twenty maps (see the roster)
---

# The late half

Twenty maps, E6 through E10, each held against **its own engraved plate**
(`assets/raw/plate-contract-<id>.png` — the promised look), its chapter, and the
Grit Law. Harness, boards and measurements live in
`assets/pilots/map-rebuild-spike/reconcile-late/`.

## What I found before I judged a single map

Two structural facts came out of building the harness, and they reframe the whole
commission. Both are measured, both are reproducible, and one of them was very
nearly a false finding of my own making.

### F-MRL-1 — Four late-era terrain GLBs fail the runtime's own contract handshake, so seven maps render the painted fallback instead of the sculpt

`Terrain3dClaimPilot.validTerrain()` (`src/world/Terrain3dClaimPilot.ts:217`)
requires the loaded GLB to match its contract on meshes, triangles, materials,
**vertices** and bounds. Any mismatch calls `failLoad()` and the map silently drops
to the painted tile — no console error, no page error, no visible failure.

Measured from each GLB's own JSON chunk
(`reconcile-late/measure-glb.mjs`, re-runnable):

| sculpt | contract vertices | GLB vertices | verdict |
| --- | ---: | ---: | --- |
| **glow-mesa** | 16 641 | **59 032** | INVALID |
| **relay-valley** | 16 641 | **84 064** | INVALID |
| **echo-canyon** | 16 641 | **40 018** | INVALID |
| **low-orbit** | 16 641 | **87 071** | INVALID |
| showroom, half-life-hollow, mare-claim, dome-basin, seed-run, devils-alley, old-canal, ember-shore, archive-world | 16 641 | 16 641 | VALID |

16 641 = 129², the welded baked grid. The four invalid exports are **split-vertex**
(flat-shaded) exports: same 32 768 triangles, but every vertex duplicated per face.

Maps affected — **7 of the 20**: `e6-glow-mesa`, `e6-picnic` (glow-mesa);
`e7-relay-valley`, `e7-dead-band`, `e7-relay-rush` (relay-valley);
`e7-echo-canyon`; `e8-low-orbit`.

Confirmed live for the two of those whose contract door opens: booting
`e6-glow-mesa` and `e7-relay-valley` in the real game yields
`data-terrain3d-pilot-render-source="painted"`, `state="failed"`, `panorama="off"`
— **with zero console errors**. The player gets the flat painted tile and no
panorama at all.

**This is the fresh-eye arc's F-OP5-13 seen from the other side.** That review
measured glow-mesa's 59 032 vertices and read it as carriage cost — "pure carriage
cost… not urgent". It is not carriage cost. It is the reason the map its own author
called "the strongest read in the set" never reaches a player. The number was
right; the consequence was missed because nobody booted the map.

Class: Mistake #10, the Debug-Gate Leftover — *"where does the PLAYER see this, in
a plain boot?"*

**FIX-IN-PLACE, and it is mine**: re-export the four terrains with welded vertices
so they satisfy the contract they already declare. The contract is not touched (the
sculpt conforms to it).

### F-MRL-2 — Twelve of the twenty maps cannot be opened in the game at all

The contract door (`src/meta/ContractFamilies.ts:1155`) refuses any contract whose
`tileParams.harvestAnchors` is an empty array, substituting The Claim with the
briefing line *"<name> is not ready for a direct claim; The Claim opened
instead."* Read straight from `assets/contracts/*/contracts.json`:

| opens | refused (`harvestAnchors: []`) |
| --- | --- |
| e6-glow-mesa, e6-showroom, e7-relay-valley, e8-mare-claim, e8-eclipse, e9-dome-basin, e10-last-claim | e6-half-life-hollow, e6-picnic, e7-echo-canyon, e7-dead-band, e7-relay-rush, e8-far-side, e8-low-orbit, e9-seed-run, e9-devils-alley, e9-old-canal, e10-ember-shore, e10-archive-world, e10-river |

Sculpt, panorama, atlas and engraved plate all exist for these maps. The door does
not open. **BIGGER-THAN-ME**: `assets/contracts/**` is explicitly outside this
claim's territory ("NO contracts/masks — the sculpt conforms TO them"), and
authoring harvest anchors is a gameplay-contract decision, not a sculpt decision.

Consequence for method: these twelve cannot be judged at the live run camera. They
are judged instead at the **same** run-camera pose rendered headless from the GLB
(the fresh-eye arc's fixed pose), which is why that arc used Blender at all.

### A harness defect I caught before it became twelve false verdicts

My first sweep reported all twenty maps as captured, twelve of them as
`source=glb` and healthy. They were not. The contract door had fallen back to
`the-claim` and I was screenshotting **E1's river tile with the target map's HUD
painted on top** — `e8-low-orbit`, a lunar map, showed brown dirt, grass tufts, a
timber headframe and a "Ford" label
(`reconcile-late/door-fallback-quarantine/`, kept as evidence).

Nothing in the page said so. The census spec guards this at
`e2e/map-census.spec.ts:100` — `if (active !== id) throw new Error('door opened
${active}')` — and I had not copied the guard. It is now
`reconcile-late/capture.mjs`'s door guard, and it fails loud.

Recording it because it is the same class of error this review exists to catch, and
because the fresh-eye arc's own write-up had to correct two harness bugs before its
findings were true. **A harness that cannot fail loudly will produce confident
false verdicts at exactly the rate you stop checking it.**

## Roster and status

| # | map | sculpt | door | GLB valid | verdict |
| ---: | --- | --- | --- | --- | --- |
| 1 | e6-glow-mesa | glow-mesa | opens | **INVALID** | pending |
| 2 | e6-showroom | showroom | opens | valid | pending |
| 3 | e6-half-life-hollow | half-life-hollow | refused | valid | pending |
| 4 | e6-picnic | glow-mesa (alias) | refused | **INVALID** | pending |
| 5 | e7-relay-valley | relay-valley | opens | **INVALID** | pending |
| 6 | e7-echo-canyon | echo-canyon | refused | **INVALID** | pending |
| 7 | e7-dead-band | relay-valley (alias) | refused | **INVALID** | pending |
| 8 | e7-relay-rush | relay-valley (alias) | refused | **INVALID** | pending |
| 9 | e8-mare-claim | mare-claim | opens | valid | pending |
| 10 | e8-far-side | mare-claim (alias) | refused | valid | pending |
| 11 | e8-low-orbit | low-orbit | refused | **INVALID** | pending |
| 12 | e8-eclipse | mare-claim (alias) | opens | valid | pending |
| 13 | e9-dome-basin | dome-basin | opens | valid | pending |
| 14 | e9-seed-run | seed-run | refused | valid | pending |
| 15 | e9-devils-alley | devils-alley | refused | valid | pending |
| 16 | e9-old-canal | old-canal | refused | valid | pending |
| 17 | e10-ember-shore | ember-shore | refused | valid | pending |
| 18 | e10-archive-world | archive-world | refused | valid | pending |
| 19 | e10-last-claim | *(none — painted by design)* | opens | n/a | pending |
| 20 | e10-river | *(none — painted by design)* | refused | n/a | pending |

Six of the twenty are **alias reuses**: `e6-picnic` rides glow-mesa's sculpt,
`e7-dead-band` and `e7-relay-rush` ride relay-valley's, `e8-far-side` and
`e8-eclipse` ride mare-claim's. Each still has **its own engraved plate**, so each
still owes an answer to the question this commission asks: does the delivered
sculpt honour the look that plate promised?
