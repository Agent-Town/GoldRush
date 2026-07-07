# Codex Art Run 008 - batch-011 E1 contract roster art

Date: 2026-07-07
Tool path: Codex built-in `image_gen` / GPT Image 2
Task: `/Users/robin/Claude/Projects/Gold Rush/tasks/running/art--20260707-151319-art-batch-011-e1-contracts.md`

Scope: raw generation only. No extraction, `assets/processed/`, layer contracts, `src/`, specs, reviews, e2e, or commits.

## Inputs read

- `specs/e1-contracts/README.md` art manifest entries 1-5.
- `docs/GOLD_RUSH_BRIEF.md` sections 4 and 9.
- `STATUS.md` verification lessons.
- `assets/LEDGER.md` header and current character rows.
- Existing jumper measurements from `assets/processed/char-jumper-sheet-walk4-{a,b}.frames.json`.

Style anchor used in every prompt:

> Antique frontier expedition ledger map style — the style of a Wild-West survey map: fine sepia engraved linework and hatching, subtle aged-paper texture, muted warm colors, illustrated — not photorealistic, not saturated.

## Outputs

- `assets/raw/char-baron-sheet-walk4-a.png`
  - source: `/Users/robin/.codex/generated_images/019f3ba3-8323-7b51-b1e1-76e15a8515c2/ig_017a17ce4fca144f016a4cb8b62264819197d31890b050e8dc.png`
  - raw prep: resized to 1700x1700 for exact 425px cells; magenta-like pixels normalized to exact `#ff00ff`.
- `assets/raw/char-baron-sheet-walk4-b.png`
  - source: `/Users/robin/.codex/generated_images/019f3ba3-8323-7b51-b1e1-76e15a8515c2/ig_017a17ce4fca144f016a4cb935d6cc819190e82b4443e489f2.png`
  - raw prep: resized to 1700x1700 for exact 425px cells; magenta-like pixels normalized to exact `#ff00ff`.
- `assets/raw/prop-baron-banner.png`
  - source: `/Users/robin/.codex/generated_images/019f3ba3-8323-7b51-b1e1-76e15a8515c2/ig_0ef267f418d62d06016a4cb6c37a248191a30c1c6cd66e343e.png`
  - raw prep: magenta-like pixels normalized to exact `#ff00ff`.
- `assets/raw/prop-spring-pond.png`
  - source: `/Users/robin/.codex/generated_images/019f3ba3-8323-7b51-b1e1-76e15a8515c2/ig_0ef267f418d62d06016a4cb72f3c98819198a8b6db9c4402d5.png`
  - raw prep: copied full-bleed; no key normalization.
- `assets/raw/prop-lantern-post.png`
  - source: `/Users/robin/.codex/generated_images/019f3ba3-8323-7b51-b1e1-76e15a8515c2/ig_0fe0a04ca43da1a5016a4cb81646a88198a8cb634d0d74421f.png`
  - raw prep: magenta-like pixels normalized to exact `#ff00ff`.

## Burn count

- New image generations: 9
- Accepted final assets: 5
- Rejected attempts: 4
- Rate-limit/quota errors: 0

## Prompts used

### `char-baron-sheet-walk4-a.png`

Attempt 1:

```text
char-baron-sheet-walk4-a.png — 4×4 walk cycle grid (down/left/right/up rows, 4 frames each), #ff00ff background, NO mirrored frames. The Claim-Jumper Baron: stout outlaw in a long oxblood greatcoat with brass buttons, stage-villain waxed mustache, tall black hat with a playing card in the band, 1.4× the height of existing claim-jumper sprites (measure against char-jumper-sheet cells). Antique frontier expedition ledger map style — the style of a Wild-West survey map: fine sepia engraved linework and hatching, subtle aged-paper texture, muted warm colors, illustrated — not photorealistic, not saturated. No text, no letters, no numbers, no watermark. Perfectly flat solid uniform #ff00ff background across the sheet and between cells; no gradients, shadows, texture, borders, labels, or floor plane.
```

Rejected: measured average visible height 367.1px, only 1.18x the all-walk4 jumper average.

Retry 1, accepted:

```text
char-baron-sheet-walk4-a.png — 4×4 walk cycle grid (down/left/right/up rows, 4 frames each), #ff00ff background, NO mirrored frames. The Claim-Jumper Baron: stout outlaw in a long oxblood greatcoat with brass buttons, stage-villain waxed mustache, tall black hat with a playing card in the band. He must be much larger than normal claim-jumper sprites: after resizing to a 1700×1700 sheet with 425×425 cells, the visible Baron figure should be about 435–455 px tall per cell, with hat close to the cell top and boots close to the cell bottom, minimal vertical padding. Antique frontier expedition ledger map style — the style of a Wild-West survey map: fine sepia engraved linework and hatching, subtle aged-paper texture, muted warm colors, illustrated — not photorealistic, not saturated. No text, no letters, no numbers, no watermark. Perfectly flat solid uniform #ff00ff background across the sheet and between cells; no gradients, shadows, texture, borders, labels, or floor plane.
```

### `char-baron-sheet-walk4-b.png`

Attempt 1:

```text
char-baron-sheet-walk4-b.png — same grid/character, banner-bearer pose variant (left hand hoisting a short standard). Antique frontier expedition ledger map style — the style of a Wild-West survey map: fine sepia engraved linework and hatching, subtle aged-paper texture, muted warm colors, illustrated — not photorealistic, not saturated. No text, no letters, no numbers, no watermark. 4×4 walk cycle grid (down/left/right/up rows, 4 frames each), #ff00ff background, NO mirrored frames. Perfectly flat solid uniform #ff00ff background across the sheet and between cells; no gradients, shadows, texture, borders, labels, or floor plane.
```

Rejected: drifted into a generic pack-carrying prospector and lost the Baron identity.

Retry 1:

```text
char-baron-sheet-walk4-b.png — 4×4 walk cycle grid (down/left/right/up rows, 4 frames each), #ff00ff background, NO mirrored frames. The Claim-Jumper Baron: stout outlaw in a long oxblood greatcoat with brass buttons, stage-villain waxed mustache, tall black hat with a playing card in the band, 1.4× the height of existing claim-jumper sprites; banner-bearer pose variant with his left hand hoisting a short standard. Antique frontier expedition ledger map style — the style of a Wild-West survey map: fine sepia engraved linework and hatching, subtle aged-paper texture, muted warm colors, illustrated — not photorealistic, not saturated. No text, no letters, no numbers, no watermark. Perfectly flat solid uniform #ff00ff background across the sheet and between cells; no gradients, shadows, texture, borders, labels, or floor plane.
```

Rejected: identity and banner passed, but measured average visible height 392.8px, only 1.26x the all-walk4 jumper average.

Retry 2, accepted:

```text
char-baron-sheet-walk4-b.png — 4×4 walk cycle grid (down/left/right/up rows, 4 frames each), #ff00ff background, NO mirrored frames. The Claim-Jumper Baron: stout outlaw in a long oxblood greatcoat with brass buttons, stage-villain waxed mustache, tall black hat with a playing card in the band; banner-bearer pose variant with his left hand hoisting a short standard. He must be much larger than normal claim-jumper sprites: after resizing to a 1700×1700 sheet with 425×425 cells, the visible Baron figure plus banner should be about 435–455 px tall per cell, with hat/banner close to the cell top and boots close to the cell bottom, minimal vertical padding. Antique frontier expedition ledger map style — the style of a Wild-West survey map: fine sepia engraved linework and hatching, subtle aged-paper texture, muted warm colors, illustrated — not photorealistic, not saturated. No text, no letters, no numbers, no watermark. Perfectly flat solid uniform #ff00ff background across the sheet and between cells; no gradients, shadows, texture, borders, labels, or floor plane.
```

### `prop-baron-banner.png`

```text
prop-baron-banner.png — single cell, #ff00ff: tattered oxblood banner, crossed pickaxes sigil in faded gold, wind-torn edge. Antique frontier expedition ledger map style — the style of a Wild-West survey map: fine sepia engraved linework and hatching, subtle aged-paper texture, muted warm colors, illustrated — not photorealistic, not saturated. No text, no letters, no numbers, no watermark. Perfectly flat solid uniform #ff00ff background; no gradients, shadows, texture, border, labels, or floor plane.
```

### `prop-spring-pond.png`

```text
prop-spring-pond.png — full-bleed square tile decal: small desert spring pond, teal-green water matching the river palette band, reed clusters, damp-earth ring. Antique frontier expedition ledger map style — the style of a Wild-West survey map: fine sepia engraved linework and hatching, subtle aged-paper texture, muted warm colors, illustrated — not photorealistic, not saturated. Full-bleed square image, no magenta background. No text, no letters, no numbers, no watermark, no border lines.
```

### `prop-lantern-post.png`

Attempt 1:

```text
prop-lantern-post.png — single cell, #ff00ff: wooden lantern post with brass-and-glass lantern, UNLIT (warm glow is engine-side), slight lean, frontier-made. Antique frontier expedition ledger map style — the style of a Wild-West survey map: fine sepia engraved linework and hatching, subtle aged-paper texture, muted warm colors, illustrated — not photorealistic, not saturated. No text, no letters, no numbers, no watermark. Perfectly flat solid uniform #ff00ff background; no gradients, shadows, texture, border, labels, floor plane, or glow.
```

Rejected: generated as 1024x1536 portrait, not a square single cell.

Retry 1, accepted:

```text
prop-lantern-post.png — square single cell, #ff00ff: wooden lantern post with brass-and-glass lantern, UNLIT (warm glow is engine-side), slight lean, frontier-made. Antique frontier expedition ledger map style — the style of a Wild-West survey map: fine sepia engraved linework and hatching, subtle aged-paper texture, muted warm colors, illustrated — not photorealistic, not saturated. No text, no letters, no numbers, no watermark. Perfectly flat solid uniform #ff00ff background; no gradients, shadows, texture, border, labels, floor plane, or glow.
```

## Measured QA

Existing `char-jumper-sheet-walk4-{a,b}` measured basis: 32 cells, all-walk4 average visible height 312.1px. Sheet A average is 330.0px; sheet B average is 294.2px.

| File | Size | Grid/cell QA | Height QA | Key/full-bleed QA | Visual QA |
|---|---:|---|---|---|---|
| `char-baron-sheet-walk4-a.png` | 1700x1700 | PASS: 4x4 exact 425px cells, all cells non-empty, rows read down/left/right/up | MIN 404 / MAX 420 / AVG 407.7px = 1.31x all-walk4 jumper avg, 1.24x jumper-A avg, 1.39x jumper-B avg. Caveat: below strict 1.4x if using all-walk4 or jumper-A basis after max retries. | PASS: key purity 100.000%, exact key 65.4% | PASS: Baron identity, oxblood coat, mustache, hat/card, no readable text/letters/numbers. Gait poses are conservative. |
| `char-baron-sheet-walk4-b.png` | 1700x1700 | PASS: 4x4 exact 425px cells, all cells non-empty, rows read down/left/right/up | MIN 393 / MAX 425 / AVG 409.1px = 1.31x all-walk4 jumper avg, 1.24x jumper-A avg, 1.39x jumper-B avg. Caveat: below strict 1.4x if using all-walk4 or jumper-A basis after max retries. | PASS: key purity 100.000%, exact key 70.8% | PASS: same Baron identity, banner-bearer variant, no readable text/letters/numbers. Gait poses are conservative. |
| `prop-baron-banner.png` | 1254x1254 | PASS: square single cell | n/a | PASS: key purity 100.000%, exact key 58.5%, bbox 1110x1204 | PASS: tattered oxblood banner, crossed pickaxes, no text. |
| `prop-spring-pond.png` | 1254x1254 | PASS: square full-bleed tile | n/a | PASS: 0 exact/near-magenta pixels | PASS: teal-green pond, reeds, damp-earth ring, no text. |
| `prop-lantern-post.png` | 1254x1254 | PASS: square single cell | n/a | PASS: key purity 100.000%, exact key 85.2%, bbox 924x1204 | PASS: wooden post, brass/glass lantern, unlit, slight lean, no text. |

No alpha extraction or processed outputs were created.
