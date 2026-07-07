# Codex Art Run 010 - batch-013 town concept and plaza dressing

Date: 2026-07-07
Tool path: Codex built-in `image_gen` / GPT Image 2
Task: `/Users/robin/Claude/Projects/Gold Rush/tasks/running/art--20260707-193342-art-batch-013-town-concept.md`

Scope: raw generation only. No extraction, `assets/processed/`, layer contracts, `src/`, specs, reviews, e2e, or commits.

## Inputs read

- `specs/town-v1/README.md`: T1 square is intimate, around 30x30, with tavern, claim office, schoolhouse, and assay office.
- `docs/GOLD_RUSH_BRIEF.md` sections 4 and 9.
- `STATUS.md` verification lessons.
- `assets/LEDGER.md` header and current town/art rows.
- Existing processed visual references: `assets/processed/bld-tavern.png`, `assets/processed/bld-claim-office.png`, `assets/processed/bld-schoolhouse.png`, `assets/processed/hero-homesteader.png`, `assets/processed/char-prospector-portrait.png`.

Style anchor used in every prompt:

> Antique frontier expedition ledger map style — the style of a Wild-West survey map: fine sepia engraved linework and hatching, subtle aged-paper texture, muted warm colors, illustrated — not photorealistic, not saturated.

## Outputs

- `assets/raw/concept-town-square.png`
  - source: `/Users/robin/.codex/generated_images/019f3c91-e733-7642-adf5-1e5112a5f7e9/ig_0868ca3f05dcbb17016a4cf302cc688191b324aa07debbafd1.png`
  - raw prep: copied as generated; no processing.
- `assets/raw/ter-plaza-ground.png`
  - source: `/Users/robin/.codex/generated_images/019f3c91-e733-7642-adf5-1e5112a5f7e9/ig_0868ca3f05dcbb17016a4cf3ff0a188191a81c54f9614e76bf.png`
  - raw prep: one highlight pixel luma-capped to keep max luminance inside the existing terrain-bank band; no extraction.
- `assets/raw/prop-town-dressing.png`
  - source: `/Users/robin/.codex/generated_images/019f3c91-e733-7642-adf5-1e5112a5f7e9/ig_0868ca3f05dcbb17016a4cf46f89548191a5d82bf3f15b4bf2.png`
  - raw prep: magenta-like background pixels normalized to exact `#ff00ff`; no extraction.
- `assets/raw/prop-town-lamps.png`
  - source: `/Users/robin/.codex/generated_images/019f3c91-e733-7642-adf5-1e5112a5f7e9/ig_0868ca3f05dcbb17016a4cf4ca3d808191b3a173886926328c.png`
  - raw prep: magenta-like background pixels normalized to exact `#ff00ff`; no extraction.

## Burn count

- New image generations: 6
- Accepted final assets: 4
- Rejected attempts: 2
- Retakes: concept plate 1, plaza ground 1, dressing sheet 0, lamp sheet 0
- Rate-limit/quota errors: 0

Rejected attempts:

- `concept-town-square.png` attempt 1: rejected because it picked up a chapel/cross signal from an inspected reference outside T1's requested four-building square.
- `ter-plaza-ground.png` attempt 1: rejected because boardwalk/rut details touched unmatched edges, making wrap seams likely.

## Prompts used

### `concept-town-square.png`

```text
Use case: stylized-concept
Asset type: Gold Rush town art-direction reference, target filename assets/raw/concept-town-square.png
Input images: use ONLY the visible processed bld-tavern.png, bld-claim-office.png, bld-schoolhouse.png, hero-homesteader.png, and char-prospector-portrait.png as references. Ignore any chapel/cross image in the conversation; do not include a chapel or cross. Match the timber construction, warm windows, tiled roofs, sepia engraved linework, parchment warmth, and brass/teal agent-tech accents from the tavern, claim office, and schoolhouse references.
Primary request: Full-bleed 16:9 concept plate of the Town v1 square at golden hour, seen from the gameplay camera angle: high oblique top-down, compact intimate about 30 by 30 units. This is the art-direction reference, not an in-game cutout.
Scene/backdrop: packed-earth plaza in the middle with boardwalk runs, wheel ruts, warm dust, and exactly four main buildings around it: tavern with warm windows and blank hanging sign; claim office with its blank ledger-post and brass plaques; schoolhouse with a secular bell tower and the Elder's chart visible through one window as simple blank diagram shapes only; small assay office porch with crates and a balance scale silhouette. Keep each building consistent with the existing tavern, claim office, and schoolhouse references.
Subjects: two townsfolk mid-errand crossing the square, plus the Prospector idling near the claim office as a round brass-and-copper hovering automaton with teal lens glow and miner helmet. The player homesteader is a small idling figure near the plaza edge, broad hat and satchel.
Style/medium: Antique frontier expedition ledger map style — the style of a Wild-West survey map: fine sepia engraved linework and hatching, subtle aged-paper texture, muted warm colors, illustrated — not photorealistic, not saturated.
Composition/framing: exact 16:9 wide full-bleed concept plate, no border, no UI, no labels. High oblique gameplay camera, all four buildings readable around a compact square, boardwalks make a rough loop, plaza center open enough for movement.
Lighting/mood: golden hour, warm parchment/ochre/terracotta/rust palette, dusty teal only in agent-tech glows, cozy settlement reward beat.
Constraints: NO text, NO letters, NO numbers, NO readable marks, NO handwriting, NO chalk writing, NO signage words, NO logos, NO watermark, NO signature. Blank boards/plaques only. NO crosses, NO chapel, NO church. No realistic firearms, rifles, pistols, cannons, or gun barrels. No gore. No Native American enemy imagery. Avoid parody cowboy/saloon/wanted-poster tropes; this is warm frontier settlement craft plus agent collaboration.
```

### `ter-plaza-ground.png`

```text
Use case: stylized-concept
Asset type: Gold Rush raw terrain texture, target filename assets/raw/ter-plaza-ground.png
Primary request: Full-bleed square TILEABLE terrain texture for the Town v1 packed-earth plaza. Packed warm dust, compacted sand, subtle wheel ruts, scuffed footpaths, tiny pebbles, and a few low boardwalk-plank runs embedded across the surface.
Scene/backdrop: no buildings, no characters, no props, no horizon, no object shadows. Just ground texture viewed from the gameplay terrain angle, top-down with very slight oblique tilt.
Tileability requirement: the outer 10 percent on all four edges must be mostly uniform packed earth/parchment with only tiny noise, no planks, no large rocks, no strong wheel rut ends, no grass clumps. Put the boardwalk-plank runs and stronger rut curves away from the edges so the tile wraps cleanly. Left edge should visually match right edge; top edge should visually match bottom edge.
Style/medium: Antique frontier expedition ledger map style — the style of a Wild-West survey map: fine sepia engraved linework and hatching, subtle aged-paper texture, muted warm colors, illustrated — not photorealistic, not saturated.
Composition/framing: exact square full-bleed tile, no border. Details are low contrast and center-biased; repeated tiling should feel like continuous packed-earth plaza ground. Boardwalk-plank runs should be subtle and not dominate the tile.
Lighting/mood: warm parchment/ochre/sand palette, low contrast, no hard cast shadows, value range close to existing sand terrain.
Constraints: NO text, NO letters, NO numbers, NO labels, NO logos, NO watermark, NO signature. NO magenta background. NO isolated object silhouettes, no people, no buildings, no signboards, no UI. Avoid lush green vegetation. Avoid dark asphalt or saturated orange.
```

### `prop-town-dressing.png`

```text
Use case: stylized-concept
Asset type: Gold Rush raw prop sheet, target filename assets/raw/prop-town-dressing.png
Primary request: #ff00ff sprite sheet with an explicit 3x2 grid, six separate frontier town plaza dressing props, NO mirrored duplicates.
Grid layout: row 1 col 1 hitching post; row 1 col 2 water trough; row 1 col 3 rain barrel. Row 2 col 1 notice-post with a completely blank board; row 2 col 2 crate stack; row 2 col 3 town well.
Style/medium: Antique frontier expedition ledger map style — the style of a Wild-West survey map: fine sepia engraved linework and hatching, subtle aged-paper texture, muted warm colors, illustrated — not photorealistic, not saturated.
Composition/framing: square sheet, exact 3 columns by 2 rows, each cell has one centered prop with generous padding. Props are isometric/high-oblique like the existing Gold Rush building and prop art, sized for townsfolk plaza dressing; no prop should touch a cell edge. Use thin dark grid divider lines only if needed for cell separation.
Background: perfectly flat solid uniform #ff00ff across the whole sheet and between cells; no gradients, no shadows, no texture, no floor plane, no border around the entire sheet.
Prop details: timber, brass bands, buckets, rope, warm sepia/rust/ochre palette. Notice board must be completely blank with no marks. Town well is small stone-and-wood well with simple roof and bucket, not huge.
Constraints: NO text, NO letters, NO numbers, NO labels, NO logos, NO watermark, NO signature. No humans, no animals, no weapons, no firearms. No mirrored cells; each object should be a distinct object/pose.
```

### `prop-town-lamps.png`

```text
Use case: stylized-concept
Asset type: Gold Rush raw prop sheet, target filename assets/raw/prop-town-lamps.png
Primary request: #ff00ff sprite sheet with an explicit 2x1 grid: two different unlit oil-lamp posts for the Town v1 square, used as plaza dressing and later Night Shift variants. NO mirrored duplicate.
Grid layout: col 1 short sturdy timber post with one hanging brass-and-glass oil lamp, unlit; col 2 taller forked timber post with two small brass-and-glass oil lamps, unlit. Both are frontier-made, simple, readable at gameplay scale.
Style/medium: Antique frontier expedition ledger map style — the style of a Wild-West survey map: fine sepia engraved linework and hatching, subtle aged-paper texture, muted warm colors, illustrated — not photorealistic, not saturated.
Composition/framing: square sheet or wide 2:1 sheet, exact 2 columns by 1 row, one centered lamp post per cell with generous padding. Isometric/high-oblique view like the existing Gold Rush prop art. Use thin dark divider line only if needed for cell separation.
Background: perfectly flat solid uniform #ff00ff across the whole sheet and between cells; no gradients, no shadows, no texture, no floor plane, no border around the entire sheet.
Lighting: lamps must be visibly UNLIT. No glow, no flame, no light cone; engine will add glow later.
Constraints: NO text, NO letters, NO numbers, NO labels, NO logos, NO watermark, NO signature. No humans, no animals, no weapons, no firearms. No mirrored cells; the two posts must differ in height and construction.
```

## Self-QA

Existing terrain bank luminance band measured from processed `terrain-bank-tile{,-b,-c}.png`: min 43.0, max 252.0. Existing processed townsfolk alpha bbox height band: min 746, max 757, avg 751.9 in 768px portraits.

| File | Size | Building / grid consistency | Measured checks | Magenta / text / canon QA | Verdict |
|---|---:|---|---|---|---|
| `concept-town-square.png` | 1672x941 | Tavern matches processed tavern timber, tiled roof, warm windows, blank hanging board. Claim office matches processed claim-office brass/porch language and ledger-post idea. Schoolhouse keeps processed schoolhouse roof/bell/windows and no cross. Assay office has no direct processed reference; it uses the same timber porch/crate/brass scale grammar. | n/a | Visual PASS: no readable text/letters/numbers/logos; chart is diagram nodes only; no firearms/gore/Native enemy imagery. | PASS |
| `ter-plaza-ground.png` | 1254x1254 | Full-bleed square, center-biased plank/rut details, plain edge band. | Luma min 44.4 / max 252.0 / avg 164.2, inside terrain bank min 43.0 / max 252.0. Edge-wrap mean RGB delta: L/R 1.3, T/B 1.2. Seam note: faint value noise only; no plank or rut terminates at an edge. | PASS: no text/letters/numbers, no magenta, no objects. | PASS |
| `prop-town-dressing.png` | 1254x1254 | Explicit 3x2 grid: hitching post, trough, rain barrel, blank notice-post, crate stack, well; no mirrors. | Cell bbox heights: 438, 357, 477, 441, 371, 409 px of 627px cells (56.9-76.1%). Below townsfolk portrait band as dressing-scale props. | PASS: near-magenta non-exact pixels 0; exact key 71.988%; notice board blank; no letters/numbers/weapons. | PASS |
| `prop-town-lamps.png` | 1774x887 | Explicit 2x1 grid: short single-lamp post and taller twin-lamp post; no mirrors. | Cell bbox heights: 568 and 780 px of 887px cells (64.0%, 87.9%). Taller lamp intentionally exceeds human dressing props but remains narrow. | PASS: near-magenta non-exact pixels 0; exact key 88.140%; lamps visibly unlit, no glow/flame/text. | PASS |

No alpha extraction, processed outputs, source changes, specs, reviews, e2e, or commits were created.
