# Codex Art Run 011 - batch-014 seamless grounds

Date: 2026-07-08
Tool path: Codex built-in `image_gen` / GPT Image 2
Task: `/Users/robin/Claude/Projects/Gold Rush/tasks/running/art--20260708-120407-art-batch-014-seamless-grounds.md`

Scope: raw terrain generation only. No extraction, `assets/processed/`, layer contracts, `src/`, specs, reviews, e2e, or commits.

## Inputs read

- `specs/terrain-render/README.md`: TR-02 needs hand-painted sand, riverbank damp, rock/mesa, and scrub splat inputs.
- `specs/w1-river-valley/README.md`: rendering-only terrain polish; style and legibility still matter.
- `docs/GOLD_RUSH_BRIEF.md` sections 4 and 9.
- `STATUS.md` verification lessons.
- `assets/LEDGER.md` header and current terrain rows.
- Existing terrain references: `assets/raw/terrain-bank-tile.png`, `assets/raw/terrain-bank-tile-b.png`, `assets/raw/terrain-bank-tile-c.png`, `assets/raw/ter-plaza-ground.png`.

Style anchor used in every prompt:

> Antique frontier expedition ledger map style — the style of a Wild-West survey map: fine sepia engraved linework and hatching, subtle aged-paper texture, muted warm colors, illustrated — not photorealistic, not saturated.

Required seamless clause used in every prompt:

> perfectly seamless tileable texture, all four edges wrap exactly, no visible border, no vignette, uniform lighting, top-down.

## Outputs

- `assets/raw/ter-sand-seamless-a.png`
  - source: `/Users/robin/.codex/generated_images/019f401c-a87b-7d02-8323-7b8cce320c54/ig_05a40eb2866aa375016a4dddb4b4a88196a6d8b508cfb8ab0e.png`
  - raw prep: copied as generated; no processing.
- `assets/raw/ter-sand-seamless-b.png`
  - source: `/Users/robin/.codex/generated_images/019f401c-a87b-7d02-8323-7b8cce320c54/ig_05a40eb2866aa375016a4ddddd7cc081969b64e83caa7a1768.png`
  - raw prep: copied as generated; no processing.
- `assets/raw/ter-mesa-seamless.png`
  - source: `/Users/robin/.codex/generated_images/019f401c-a87b-7d02-8323-7b8cce320c54/ig_05a40eb2866aa375016a4dde206b0c8196aaba645b8a4e3a1d.png`
  - raw prep: copied as generated; no processing.
- `assets/raw/ter-bank-damp-seamless.png`
  - source: `/Users/robin/.codex/generated_images/019f401c-a87b-7d02-8323-7b8cce320c54/ig_05a40eb2866aa375016a4ddeaaa1a88196a6844cc0bf4c302b.png`
  - raw prep: copied as generated; no processing.
- `assets/raw/ter-scrub-seamless.png`
  - source: `/Users/robin/.codex/generated_images/019f401c-a87b-7d02-8323-7b8cce320c54/ig_0d015c20c5e1181e016a4ddfd972ec8191ab912ae1d650f239.png`
  - raw prep: copied as generated; no processing.

## Burn count

- New image generations: 12
- Accepted final assets: 5
- Rejected attempts: 7
- Retakes: sand A 2, sand B 1, mesa 1, damp bank 1, scrub 2
- Rate-limit/quota errors: 0

Rejected attempts:

- sand A attempt 1 `ig_098c8ee10e87dc8e016a4ddb21898c81918d6ebff2299d8d1d.png`: rejected because 2x2 seam metrics were high (L/R 15.01, T/B 16.88 mean delta).
- sand A attempt 2 `ig_0615599ca8e669cf016a4ddb9d6c108197aec78bb1b99167c5.png`: rejected because 2x2 seam metrics stayed high (L/R 16.12, T/B 17.48 mean delta).
- sand B attempt 1 `ig_0be0b792e9a30018016a4ddc3881cc81919c83089c4379d504.png`: rejected because edge detail created visible seam risk (L/R 19.70, T/B 20.63 mean delta).
- mesa attempt 1 `ig_0be0b792e9a30018016a4ddc805b18819184a59e1e406b4286.png`: rejected for avoidable edge mismatch; retake improved both edge pairs.
- damp bank attempt 1 `ig_0be0b792e9a30018016a4ddcce1064819193f832410ee9e99d.png`: rejected for darker edge staining and seam risk; retake improved both edge pairs.
- scrub attempt 1 `ig_0be0b792e9a30018016a4ddd055b288191883462de22ea8725.png`: rejected because scrub patches reached edges and produced visible 2x2 bands.
- scrub retake 1 `ig_05a40eb2866aa375016a4dded8598081968c46c608ac12db44.png`: rejected because a scrub/value band was still visible in the 2x2 preview.

## Prompts used

### `ter-sand-seamless-a.png`

```text
Use case: stylized-concept
Asset type: Gold Rush raw terrain texture RETAKE, target filename assets/raw/ter-sand-seamless-a.png
Primary request: Full-bleed square ground texture for the claim's packed desert sand: fine gravel, subtle pebbles, faint dry cracks. perfectly seamless tileable texture, all four edges wrap exactly, no visible border, no vignette, uniform lighting, top-down.
Critical wrap requirement: this is a game texture that will repeat in a 2x2 grid. The outer 22 percent along all four edges must be the same quiet packed-sand base tone and grain, visually matching the opposite edge and the adjacent corners. Put all larger pebbles, cracks, and stronger hatching only in the interior. No feature may terminate at an edge. Corners must be plain and mutually similar, not accented.
Style/medium: Antique frontier expedition ledger map style — the style of a Wild-West survey map: fine sepia engraved linework and hatching, subtle aged-paper texture, muted warm colors, illustrated — not photorealistic, not saturated.
Composition/framing: exact square full-bleed texture only, no frame or border. Low-contrast, evenly distributed micro-grain; no strong diagonal washes.
Lighting/mood: flat top-down parchment light, no cast shadows, no directional lighting bake, value range close to the existing warm sand terrain.
Constraints: NO text, NO letters, NO numbers, NO labels, NO logos, NO watermark, NO signature. NO magenta. No characters, no buildings, no props, no horizon. Avoid large stones, visible edge border, corner darkening, saturated orange, lush green vegetation.
```

### `ter-sand-seamless-b.png`

```text
Use case: stylized-concept
Asset type: Gold Rush raw terrain texture RETAKE, target filename assets/raw/ter-sand-seamless-b.png
Primary request: Full-bleed square packed desert sand variant, slightly rougher than A, with sparse tufts of dry grass stubble for anti-tiling variation pairing. perfectly seamless tileable texture, all four edges wrap exactly, no visible border, no vignette, uniform lighting, top-down.
Critical wrap requirement: this is a game texture that will repeat in a 2x2 grid. The outer 22 percent along all four edges must be the same quiet sand-and-gravel base tone and grain, visually matching the opposite edge and the adjacent corners. Keep tufts tiny, dry, low-contrast, and away from every edge. No feature may terminate at an edge. Corners must be plain and mutually similar, not accented.
Style/medium: Antique frontier expedition ledger map style — the style of a Wild-West survey map: fine sepia engraved linework and hatching, subtle aged-paper texture, muted warm colors, illustrated — not photorealistic, not saturated.
Composition/framing: exact square full-bleed texture only, no frame or border. Slightly rougher central micro-grain than A, sparse dry stubble only.
Lighting/mood: flat top-down parchment light, no cast shadows, no directional lighting bake, warm sand/ochre palette with desaturated dry straw only.
Constraints: NO text, NO letters, NO numbers, NO labels, NO logos, NO watermark, NO signature. NO magenta. No characters, no buildings, no props, no horizon. Avoid lush green vegetation, strong shadows, obvious repeating tufts, visible edge border, saturated orange.
```

### `ter-mesa-seamless.png`

```text
Use case: stylized-concept
Asset type: Gold Rush raw terrain texture RETAKE, target filename assets/raw/ter-mesa-seamless.png
Primary request: Full-bleed square ground texture for the Gulch's red-rock mesa ground: ochre dust over cracked hardpan, muted red-rock powder, dry compacted clay, tiny stone flecks. perfectly seamless tileable texture, all four edges wrap exactly, no visible border, no vignette, uniform lighting, top-down.
Critical wrap requirement: this is a game texture that will repeat in a 2x2 grid. The outer 22 percent along all four edges must be the same quiet ochre hardpan base tone and grain, visually matching the opposite edge and the adjacent corners. Keep cracks fine, broken, interior-biased, and never ending at an edge. Corners must be plain and mutually similar, not accented.
Style/medium: Antique frontier expedition ledger map style — the style of a Wild-West survey map: fine sepia engraved linework and hatching, subtle aged-paper texture, muted warm colors, illustrated — not photorealistic, not saturated.
Composition/framing: exact square full-bleed texture only, no frame or border. Muted red-rock/ochre hardpan variation with small texture, not cliffs or slabs.
Lighting/mood: flat top-down parchment light, no cast shadows, no directional lighting bake, dusty ochre/terracotta/rust palette, not saturated.
Constraints: NO text, NO letters, NO numbers, NO labels, NO logos, NO watermark, NO signature. NO magenta. No characters, no buildings, no props, no horizon. Avoid large rocks, canyon walls, cliffs, strong shadows, visible edge border, dark asphalt, saturated red.
```

### `ter-bank-damp-seamless.png`

```text
Use case: stylized-concept
Asset type: Gold Rush raw terrain texture RETAKE, target filename assets/raw/ter-bank-damp-seamless.png
Primary request: Full-bleed square ground texture for damp riverbank earth: darker water-stained packed soil, small smooth stones, silt, muted damp patches, no standing water. perfectly seamless tileable texture, all four edges wrap exactly, no visible border, no vignette, uniform lighting, top-down.
Critical wrap requirement: this is a game texture that will repeat in a 2x2 grid. The outer 22 percent along all four edges must be the same quiet damp silt base tone and grain, visually matching the opposite edge and the adjacent corners. Keep stones and damp stains small, low-contrast, interior-biased, and away from every edge. No waterline or stain may terminate at an edge. Corners must be plain and mutually similar, not accented.
Style/medium: Antique frontier expedition ledger map style — the style of a Wild-West survey map: fine sepia engraved linework and hatching, subtle aged-paper texture, muted warm colors, illustrated — not photorealistic, not saturated.
Composition/framing: exact square full-bleed texture only, no frame or border. Smooth small stones and silt texture, no objects.
Lighting/mood: flat top-down parchment light, no cast shadows, no directional lighting bake, darker than dry sand but still warm and readable; muted brown/silt/gray stones, no blue water.
Constraints: NO text, NO letters, NO numbers, NO labels, NO logos, NO watermark, NO signature. NO magenta. No characters, no buildings, no props, no horizon. Avoid glossy puddles, strong shoreline bands, large rocks, visible edge border, lush vegetation.
```

### `ter-scrub-seamless.png`

```text
Use case: stylized-concept
Asset type: Gold Rush raw terrain texture FINAL RETAKE, target filename assets/raw/ter-scrub-seamless.png
Primary request: Full-bleed square scrubland mix for a terrain splat mid-layer: warm sand with moss-dry patches, dusty lichen, sparse brittle scrub flecks, no lush grass. perfectly seamless tileable texture, all four edges wrap exactly, no visible border, no vignette, uniform lighting, top-down.
Critical wrap requirement: this is a game texture that will repeat in a 2x2 grid. Make the entire outer 35 percent perimeter on all four sides plain warm sand with the same quiet dusty-olive micro-grain only. Do not put any visible moss patch, scrub clump, crack cluster, dark stain, or color blob near any edge or corner. All scrubland patches must sit inside the central 30 percent of the square and fade softly into sand. Opposite edges and all corners must look nearly identical and plain.
Style/medium: Antique frontier expedition ledger map style — the style of a Wild-West survey map: fine sepia engraved linework and hatching, subtle aged-paper texture, muted warm colors, illustrated — not photorealistic, not saturated.
Composition/framing: exact square full-bleed texture only, no frame or border. Desaturated olive-gray/tan central patches, warm sand base, subtle small texture.
Lighting/mood: flat top-down parchment light, no cast shadows, no directional lighting bake, warm sand base with muted dusty olive accents only.
Constraints: NO text, NO letters, NO numbers, NO labels, NO logos, NO watermark, NO signature. NO magenta. No characters, no buildings, no props, no horizon. Avoid lush green, flowers, large shrubs, strong shadows, visible edge border, saturated color.
```

## Self-QA

Raw existing terrain-bank luminance band measured from `assets/raw/terrain-bank-tile{,-b,-c}.png`: min 29.3, max 254.0. Final 2x2 previews were generated in `/tmp/gr-art-014-wrap-retake/` for inspection only; no preview artifact was committed.

| File | Size | Luma min/max/mean | Edge deltas L/R mean/p95/max | Edge deltas T/B mean/p95/max | 2x2 wrap verdict | Other QA | Verdict |
|---|---:|---|---|---|---|---|---|
| `ter-sand-seamless-a.png` | 1254x1254 | 54.5 / 236.7 / 165.9 | 8.14 / 20.00 / 38.33 | 8.56 / 21.33 / 36.33 | left-right wrap: no visible discontinuity; top-bottom wrap: no visible discontinuity | 0 magenta / 0 near-magenta; no letters; flat top-down light | PASS |
| `ter-sand-seamless-b.png` | 1254x1254 | 46.5 / 251.6 / 158.2 | 11.37 / 27.67 / 53.33 | 11.53 / 29.00 / 58.33 | left-right wrap: no visible discontinuity; top-bottom wrap: no visible discontinuity | 0 magenta / 0 near-magenta; no letters; flat top-down light | PASS |
| `ter-mesa-seamless.png` | 1254x1254 | 58.6 / 222.4 / 143.6 | 9.39 / 22.67 / 42.00 | 10.01 / 26.00 / 50.67 | left-right wrap: no visible discontinuity; top-bottom wrap: no visible discontinuity | 0 magenta / 0 near-magenta; no letters; flat top-down light | PASS |
| `ter-bank-damp-seamless.png` | 1254x1254 | 30.6 / 178.0 / 95.7 | 8.68 / 21.00 / 35.67 | 7.91 / 19.67 / 45.33 | left-right wrap: no visible discontinuity; top-bottom wrap: no visible discontinuity | 0 magenta / 0 near-magenta; no letters; flat top-down light | PASS |
| `ter-scrub-seamless.png` | 1254x1254 | 80.5 / 231.9 / 163.7 | 6.24 / 15.00 / 27.00 | 6.51 / 15.00 / 25.00 | left-right wrap: no visible discontinuity; top-bottom wrap: no visible discontinuity | 0 magenta / 0 near-magenta; no letters; flat top-down light | PASS |

All final luma ranges sit inside the raw existing terrain-bank band. No alpha extraction, wrap-blending, processed outputs, source changes, specs, reviews, e2e, or commits were created.
