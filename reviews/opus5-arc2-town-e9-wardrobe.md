---
title: E9 + E10 town wardrobes — both thin eras closed to full cast
date: 2026-07-25
branch: sculpt/opus5-3d-night
status: READY-FOR-GATES
---

# ARC 2 — the thin eras: E9 and E10 closed to full cast

**Verdict: READY-FOR-GATES.** Sixteen files land both thin eras: eight `.e9.glb`
(Red Fields) and eight `.e10.glb` (Deep Sky). Both boot green at their era on
desktop and 390 px mobile — 4/4 across the two eras and two projects — with zero
console or page errors and no fallback to the previous era. **The town now
evolves through all ten eras.**

## The gap, measured

The commission described E9/E10 as "thin (8 and 6 variants)". The real shape is
worse and simpler: those 14 files are **all plaza props** (ark scaffolds, canal
segments, ice blocks, survey cairn; bridge-school, charter-press, engine glows).
Of the eight core town buildings, **none** had an `.e9` or `.e10` variant.

| era | e2 | e3 | e4 | e5 | e6 | e7 | e8 | e9 | e10 |
| --- | --: | --: | --: | --: | --: | --: | --: | --: | --: |
| core town buildings | 8 | 8 | 8 | 8 | 8 | 8 | 8 | **0 → 8** | **0 → 8** |

This never failed loudly. `TownTavernPilot.eraCandidates` (`src/town/TownTavernPilot.ts:191`)
walks DOWN from the active era, so era 9 silently served each building's E8 coat.
The town did not break; it stopped evolving for two whole eras.

## What shipped

Each variant is the same building wearing the era, per the ratified law that an
era transform is an image-EDIT of existing art. Every `.e9` keeps its `.e8`
shell, footprint and UV layout; the atlas is transformed, not repainted, so every
panel line, porthole and rivet the E8 wave authored survives into the rust.

| Building | E9 role | Spec basis | Derived from | Tris (+added) | Re-export |
| --- | --- | --- | --- | ---: | --- |
| tavern | Dome Commons | §A transform, verbatim: "Orbital Canteen → Dome Commons annex" | `tavern.e8.glb` | 13,320 (+404) | byte-identical |
| schoolhouse | Areology Hall | §A transform, verbatim: "Mission Archive → the Areology Hall" | `schoolhouse.e8.glb` | 7,620 (+216) | byte-identical |
| claim-office | Canal Reeve | §A townsfolk: "canal reeve (water law returns! the E1 claim office's oldest job reborn)" | `claim-office.e8.glb` | 3,836 (+120) | byte-identical |
| stamp-mill | Canal Works | §A buildings: "canal works (THE building: sluice lineage's apotheosis — gates, locks, a water-wheel waiting dry)" | `stamp-mill.e8.glb` | 3,252 (+240) | byte-identical |
| assay-office | Ice Quarry Rig | §A buildings: "ice quarry rig" — assay is the extraction lineage, and E9's ore is water | `assay-office.e8.glb` | 5,536 (+156) | byte-identical |
| general-store | Seed Vault | §A buildings: "seed vault (green economy)" | `general-store.e8.glb` | 4,728 (+292) | byte-identical |
| dynamo-hall | Weather Spire | §A buildings: "weather spire (E4/E5 weather tech's endgame)" | `dynamo-hall.e8.glb` | 4,868 (+172) | byte-identical |
| chapel | Ark Yard | §A buildings: "the Ark yards (megaproject site, visible growing for the whole era)" | `chapel.e8.glb` | 4,672 (+108) | byte-identical |

**The swatch contract.** The bundle's palette note says the spreading green is
E1's exact riverbank green — "sample it — literally the same swatch: the point IS
the callback". `#50674c` is laid into each atlas with an inset core that survives
engraving, and it is verified by reading the atlas back OUT of the **delivered
GLB**: 3,203–3,227 exact pixels per building. The convention was measured against
the shipped `era-props-e9-atlas.png` (41,468 exact pixels), not assumed.

## Evidence

| Gate | Result |
| --- | --- |
| Boot at era 9 AND era 10, desktop-chrome + mobile-chrome (390 px) | **4/4 pass** |
| All eight `.e9.glb` and `.e10.glb` served | pass — none missing |
| Previous-era fallback fired | **none** — `canvas.dataset.town3dPilotEra === "9"` / `"10"` |
| Console errors / page errors | 0 / 0 |
| Semantics per building | 1 node / 1 mesh / 1 primitive / 1 material / 1 image, 1024² atlas |
| Cameras / lights / animations | 0 / 0 / 0 |
| Triangle cap (15,000) | max 13,320 (tavern) |
| Footprint vs `.e8` | identical to 3 dp on both ground axes, all eight |
| Centred / grounded | centre drift 0.000 m; min-Z ≤ 0.001 m |
| Deterministic re-export | 8/8 byte-identical from the reopened `.blend` |

- `reviews/shots-town-e9/{desktop,mobile}-chrome-e9-square.png`
- `reviews/shots-town-e10/{desktop,mobile}-chrome-e10-square.png`
- `artifacts/town-e9/town-e9-wardrobe-board.png` — all eight, E8 above / E9 below, one camera
- `artifacts/town-e9/*.json`, `artifacts/town-e10/*.json`, both wardrobe boards

## Findings

**F-OP5-5 — a silent no-op, caught and closed.** The first eight builds reported
success and shipped eight **byte-identical E8 atlases**. An image imported from a
GLB arrives packed, holding its original file bytes as the source of truth, so
writing `image.pixels` edits a buffer that `save()` and `export()` both discard.
The era transform never reached a single file. Fixed by making the transform a
NEW image that is written, reloaded and packed; and the builder now refuses to
finish unless it can read the swatch back out of the exported GLB. Had the check
been "did the build run", eight buildings would have shipped as E8 with props.

**F-OP5-6 — re-export drift on all eight, closed.** Exports from the reopened
`.blend` agree 3/3, so the recipe was always deterministic; the delivery was
being exported from the live session, whose in-memory atlas encodes its PNG
differently. The delivery now comes out of the reopened `.blend`.

**F-OP5-7 — the runtime rejects silently, so the builder now enforces its rules.**
`TownTavernPilot` validates every candidate and falls to the previous era when one
fails — width/depth within the parcel, bounding box centred within 0.06 m,
grounded, ≤1 material, ≤15,000 triangles. An asymmetric addition breaks `centered`
and the building simply reappears in last era's clothes. The builder now clamps
every part inside its `.e8` ground plan and refuses to export on centre drift,
footprint growth or loss of grounding. Height is deliberately unclamped — the
runtime does not cap it, and the era's domes and spires live up there.

**F-OP5-8 — my own false red, recorded so it is not re-derived.** The boot probe
first reported all eight buildings falling back to E8. They were not: Vite's dev
server eagerly resolves `import.meta.glob` entries, so every era's `.glb` is
fetched as a `?import&url` module regardless of the active epoch. Only queryless
fetches are the loader pulling a model. A network-based era assertion must filter
`?import` or it reads every era as a fallback.

**F-OP5-9 — art debt, non-blocking.** The added E9 vocabulary is UV'd to flat
palette cells, so at close range the new parts read flatter than the painted shell
they sit on. Two earlier revisions fixed the worst of it (near-black "iron" that
punched voids in the silhouette; a spire that floated over its own roof because
"top" is the bounding-box lid, above chimneys). What remains is acceptable at the
town camera but is honest debt: the parts want hatching in their cells rather than
plain fill. Recorded rather than quietly accepted.

## E10 — the capstone (delivered)

E10's art law is preservation, not reinvention: the Ark's decks "keep each era's
grammar", and the last contracts "don't extract; they PRESERVE". Doing to E9 what
E9 did to E8 would erase the nine eras the Ark exists to carry, so the E10
transform is deliberately restrained — deep values cool toward the void outside
the hull, highlights warm to the nebula's parchment-gold, and the midtones that
carry the accumulated grammar are left almost untouched.

| Building | E10 role | Spec basis | Tris (+added) |
| --- | --- | --- | ---: |
| tavern | Long Table Deck | §A: "the Long Table mess (tavern's final form)" | 13,444 (+124) |
| schoolhouse | Bridge Deck | §A: "the Bridge School" | 7,808 (+188) |
| claim-office | World Window | §B1: "the world-window bridge where visited-world charters are chosen" | 3,960 (+124) |
| assay-office | Press Hall | §A: "the Charter Press hall (Assay lineage's endpoint)" | 5,660 (+124) |
| general-store | Preserve Hold | §A: the final contracts "PRESERVE" | 5,020 (+292) |
| dynamo-hall | Engine Deck | §B1: "engine decks aft" | 5,008 (+140) |
| chapel | Pan Shrine | §A: "the Pan Shrine (the original E1 pan)" | 4,796 (+124) |
| stamp-mill | Keel Works | the mill lineage builds the hull it now rides in | 3,384 (+132) |

**F-OP5-10 — two E10 roles are named for the hall, not the fixture (owner call).**
`bridge-school.e10.glb` and `charter-press.e10.glb` already exist as plaza props.
Naming the schoolhouse and assay-office variants after them would put the same
landmark in the square twice, so they ship as **Bridge Deck** and **Press Hall** —
the rooms around those fixtures. If the intent was that the props ARE those
buildings, this is a rename, not a rebuild. Flagged rather than decided.

**F-OP5-11 — the E10 change is subtle by design, non-blocking.** At the town
camera E10 reads close to E9, because preservation is the era's stated law. A
reviewer expecting another wholesale palette shift will ask whether anything
changed; the answer is the hull seam, the gilded highlights, the inked darks and
the per-lineage deck fittings. Said plainly here so restraint is not mistaken for
an unfinished pass.

## What is not here

**Sources not tracked.** The `.e9.blend` / `.e10.blend` files stay on disk
untracked; the committed recipes regenerate them byte-identically in one command.
This matches the E8 wave, which also shipped GLBs without blends. Nothing was
deleted.

**Sources not tracked.** The eight `.e9.blend` files (23 MB) stay on disk
untracked; the committed recipe regenerates them byte-identically in one command.
This matches the E8 wave, which also shipped GLBs without blends. Nothing was
deleted.

**The boot probe is a lane probe**, as E8's was — `e2e/.town-e9-probe.spec.ts`,
left on disk, not committed, outside this commission's firewall. Reproduce with:

```
npx vite --host 127.0.0.1 --port 5241 --strictPort &
GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5241 \
  npx playwright test e2e/.town-e9-probe.spec.ts e2e/.town-e10-probe.spec.ts \
  --project=desktop-chrome --project=mobile-chrome --reporter=line
```

A scratch port is used deliberately: the default 5188 risks gating against
another tree's dev server while a fire is live.
