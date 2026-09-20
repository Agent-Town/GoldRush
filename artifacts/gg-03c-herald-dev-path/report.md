# GG-03c — Claim Herald dev-path weight

## Result

The plain-boot Claim Herald now uses 13 WebP derivatives from `assets/processed/`
instead of importing the raw masters. The seven engraving derivatives total
317,162 B and the six first-issue panels total 782,744 B (1,099,906 B on disk).
Raw masters were not changed.

The player sees the result after creating a fresh profile, entering town, and
opening the **Claim Herald** badge. Issue No. 1 shows the six panel images; the
ongoing news items show the matching engraving cuts. No `?debug` query is
required.

## Scope 1 — plain-boot network measurement

Command: `node scripts/herald-dev-weight.mjs 5267`

The script requires an explicit dev-server port, creates a clean profile, opens
the Claim Herald, rejects missing/broken Herald images, prints every successful
image response, and applies the 4,000,000 B ceiling to Herald art responses.
The grand total is also printed for visibility; it includes unrelated animated
character, building, kit, and UI images.

| Measurement | Before | After |
| --- | ---: | ---: |
| Herald art responses | 9,443,241 B | 962,188 B |
| All image responses | 14,620,095 B | 6,139,042 B |

Before breakdown (the four raw engraving cuts actually requested):

```text
2243205  herald-engraving-board.png
2328282  herald-engraving-ledger.png
2463126  herald-engraving-river.png
2408628  herald-engraving-schoolhouse.png
HERALD ART TOTAL  9443241
TOTAL             14620095
```

After breakdown:

```text
143516  gazette-panel-claim-goal.webp
139848  gazette-panel-freeing-fevered.webp
143482  gazette-panel-seams-gold.webp
96120   gazette-panel-the-arms.webp
129408  gazette-panel-the-works.webp
130370  gazette-panel-town-serves.webp
36904   herald-engraving-board.webp
38094   herald-engraving-ledger.webp
56330   herald-engraving-river.webp
48116   herald-engraving-schoolhouse.webp
HERALD ART TOTAL  962188
TOTAL             6139042
```

The all-image total varies slightly with the animation frame requests; the
Herald subtotal is stable and is the mutation-tested gate.

## Scope 2 — raw-tree proof

The dev server served the raw file byte-for-byte before rewiring:

```text
assets/raw/herald-engraving-board.png
local bytes = served bytes = 2243205
local SHA-256 = served SHA-256 =
f2f3b5ce7eacaae5ba78fa018a8618e10669d24379c804e7ff664df80823f994
```

## Derivative rationale

- Engravings: 384×384 WebP, quality 82. The UI renders these at 120×120 CSS px
  on desktop and 92×92 CSS px on mobile, so 384 px retains more than 2× density.
- Panels: 768×432 WebP, quality 82. Their largest rendered width is about
  338 CSS px desktop / 320 CSS px mobile, so 768 px retains more than 2× density.

## Source guard and mutation proof

`scripts/asset-diet.mjs` follows the two `import.meta.glob` declarations in
`heraldReader.ts`, requires the exact seven engraving and six panel derivatives, and
weighs the reached source files. The ceiling is 1,500,000 B: 36% above the
1,099,906 B measurement, while still bounded by the 64 KiB spot / 160 KiB panel
class targets.

Temporarily changing the Herald engraving glob and lookup keys back to
`assets/raw/*.png` produced:

```text
[asset-diet] Herald dev-path art 17275540 bytes (1500000 byte ceiling).
Error: Herald dev-path art exceeds byte budget
SCOPE4_EXIT=1

HERALD ART TOTAL  10225985
TOTAL             15402839
Error: Herald dev-path art exceeds 4,000,000 B
SCOPE1_EXIT=1
```

After restoring the processed paths:

```text
[asset-diet] Herald dev-path art 1099906 bytes (1500000 byte ceiling).
SCOPE4_EXIT=0

HERALD ART TOTAL  962188
TOTAL             6139042
SCOPE1_EXIT=0
```

## Archive provenance

The archived GG-03 wiring was re-landed from
`archive/lane-perf-gg03-06eeac68` only after confirming that its parent was the
current `main`. The prior report blob matched `main` at
`c7f8cb9c2d627d7db87d28e04472fa16e2ebcae1`.

## Verification

- `npm run build` — pass; asset diet reports 1,099,906 B / 1,500,000 B.
- `npx tsc --noEmit` — pass.
- `e2e/gazette-first-issue.spec.ts` plus `e2e/gz-02-news-page.spec.ts`,
  desktop + mobile, 2 workers — 10/10 pass; no console or page errors.
- Canonical `e2e/gazette-art-wiring.spec.ts`, desktop + mobile, 2 workers:

| Run | Desktop live cuts | Desktop unclassified | Mobile live cuts | Mobile unclassified |
| --- | --- | --- | --- | --- |
| 1 | pass | pass | pass | pass |
| 2 | pass | pass | pass | pass |
| 3 | pass | pass | pass | pass |
| 4 | pass | pass | pass | pass |

Canonical total: 16/16 pass. `e2e/gazette-art-wiring.spec.ts` was not edited.

Visual review:

- [Desktop badge](desktop-chrome-badge.png)
- [Desktop open issue](desktop-chrome-open-issue.png)
- [Mobile badge](mobile-chrome-badge.png)
- [Mobile open issue](mobile-chrome-open-issue.png)
- [Mobile 390 px evidence](mobile-chrome-390px.png)

Desktop remains a two-column paper layout; mobile collapses to one column.
Images decode without cropping or stretching, and the headings remain readable.

## Explicit follow-ups

These raw families remain out of scope and were not touched:

- `plate-contract-*`: 137.24 MB across 41 files.
- `ceremony-*`: 31.46 MB across 10 files.
