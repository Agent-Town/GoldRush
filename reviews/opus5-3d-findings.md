---
title: ARC 3 — the fresh eye: eight maps judged at the gameplay camera
date: 2026-07-25
branch: sculpt/opus5-3d-night
status: FINDINGS (no fix-in-place corrections applied — see "What I did not touch")
---

# The fresh eye

Eight maps spanning the saga, judged against each map's chapter and the Grit Law
("holiday or fight?"). Boards in `artifacts/opus5-fresh-eye/`.

## Method, and why it is shaped this way

Two passes per map, because they answer different questions:

- **Run camera, held FIXED across all eight** (`(0, −30.3, 26.26) → (0, −8.65, 0.51)`,
  42°). The gameplay camera sits a fixed height above the player, so what a player
  can read does not change when the tile does. This is the readability judge.
- **Overview, SCALED to each tile.** This is the composition judge.

Per-map builders each pose their own hero angle, which is exactly how a weak
composition survives review — so none of them were used.

**Two corrections to my own harness, recorded because both produced false
readings first.** They are the same class of error this review is hunting.

1. *The sweep mounted panoramas.* The ring enclosed each tile and ate the key
   light; canyon-works and echo-canyon rendered nearly black and read as "broken
   maps". The shipped builders hide the panorama for run-camera boards and raise
   it only for a separate distance view. Fixed; those two maps are fine.
2. *The sweep assumed every tile is 64 m.* They are not: twin-banks and the-claim
   are 64 m, canyon-works is 96 × 112 m, and deepwater-claim, dome-basin,
   glow-mesa and archive-world are **128 m**. One identical overview framed the
   big maps on their middle quarter, and their own edges read as holes punched in
   the world. The overview now scales to measured tile bounds.

## Per-map verdicts

| Map | Chapter | Verdict | Read at the run camera |
| --- | --- | --- | --- |
| **twin-banks** | E1 — the braid | **PASS** | Two channels around a lit plait; best value structure of the E1 pair. This commission's ARC 1. |
| **the-claim** | E1 — first claim | **WEAK** | The river band is the only event. Large pale parchment fields with no ruts, scars or bank lips — F-OP5-12. |
| **canyon-works** | E2 — steamworks | **PASS** | Gorge walls frame a legible floor; the pylon-site flats stay flat, which is why this map became the standard. |
| **echo-canyon** | E3 — voltage | **WATCH** | Composition good (ring engravings, walls), but the floor sits deep in shadow at the run camera — F-OP5-14. |
| **deepwater-claim** | E5 — deepwater | **BY DESIGN** | Renders as almost nothing without a water surface. Verified: the entire tile is below the water plane (max Z **−0.34**). Correct for a submerged shelf — F-OP5-15. |
| **glow-mesa** | E6 — atomic | **PASS (composition)** | The strongest read in the set: converging haul roads, crack scars, real travel pressure. Carries a budget defect though — F-OP5-13. |
| **dome-basin** | E9 — red fields | **WEAK** | The basin floor is a large flat rectangle with no relief or mark-making; at the overview it reads as a hole in the world — F-OP5-16. |
| **archive-world** | E10 — deep sky | **WATCH** | Deep-ink values are era-correct, but the tile is nearly uniform dark with one bright strip; little for the eye to navigate by — F-OP5-17. |

Grit Law across the set: the mid-saga maps (canyon-works, glow-mesa) fight. The
two ends — the-claim at the start, dome-basin and archive-world at the finish —
read closer to holiday: warm, tidy, and under-pressured.

## Findings

**F-OP5-12 — `the-claim`: empty space without travel pressure.** The craftbook
allows empty space, but "empty space is bad when it has no travel pressure, scar
pattern, bank edge, rut, rubble, or sight rhythm". Both banks are broad pale
parchment with two faint pad circles and one cart-rut pair. As the tutorial
ground this is arguably deliberate — it is the calmest map in the game and the
player's first. Flagged, not corrected: changing the first map's read is a design
call, not a polish call.

**F-OP5-13 — `glow-mesa` ships ~3.5× the vertex data of its peers.** Measured:
**59,032 vertices for 32,768 faces**, where dome-basin and archive-world carry
16,641 vertices for the same 32,768 faces. Its vertices are fully split (49,070
interior boundary edges vs **0** on its peers), i.e. the surface is exported
flat-shaded rather than welded. It is the heaviest terrain in the spike at
**10.9 MB** against a ~8.5 MB norm. The composition is the best in the set, so
this is pure carriage cost. Worth a re-export with shared normals if a map-weight
pass is ever run; not urgent, and not something to change blind.

**F-OP5-14 — `echo-canyon`: the gorge floor is where the player stands, and it is
the darkest thing on screen.** Composition is sound; the issue is that the run
camera looks down into shadow. Candidate fixes are a lighter floor value in the
atlas or a shallower cut — both are sculpt changes to a shipped map, so this is
recorded for its owner rather than nudged here.

**F-OP5-15 — `deepwater-claim` has no dry read at all, and that is correct.**
Verified rather than assumed: the tile's maximum height is **−0.34 m**, entirely
beneath the water plane, so the bare terrain renders as scattered reef tops on
backdrop. Recorded so a future sweep does not "fix" a map that is working. It
does mean this map cannot be judged at all without the runtime water surface —
any future board for it must mount one.

**F-OP5-16 — `dome-basin`: the basin floor reads as a void.** *This began as a
false finding and is corrected here.* I first recorded a rectangular hole in the
mesh. A boundary-edge test proved the mesh is continuous — **0 interior boundary
edges**. What is actually there is a large, perfectly flat basin floor whose
value sits close to the backdrop, so it reads as absence rather than ground. The
defect is real but it is composition, not topology: the floor wants ruts, canal
scars or a crust break to say "ground". E9's own vocabulary (canal segments,
survey cairns) already exists for exactly this.

**F-OP5-17 — `archive-world`: uniform darkness at the run camera.** The deep-ink
palette is E10-correct, but with one bright strip and near-uniform dark elsewhere
there is little sight rhythm. Same class as F-OP5-14: a value problem on a
shipped map, recorded for its owner.

## What I did not touch

The commission invited "SMALL fix-in-place corrections where confident (mount
nudges, scale sins)". **None were applied.** No finding here reached that bar:
every one is either a value/composition judgement on a shipped map (F-OP5-12, 14,
16, 17), correct behaviour (F-OP5-15), or a re-export decision with a real
trade-off (F-OP5-13). No mount was found sitting off its prepared ground and no
scale sin was found — the mount discipline in these maps is holding.

Editing another map's sculpt on a hunch, at the end of a session, with no owner
present, is how the Reset Massacre and the Blind Hand-Merge happened. The
findings are cheap to act on with a fresh premise; a blind nudge is not.

Two of my own six candidate findings were false on investigation (the panorama
blackout, the dome-basin "hole"). That ratio is the argument for the rule.
