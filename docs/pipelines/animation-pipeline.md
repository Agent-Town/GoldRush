# Animation Pipeline

This is the standing process for adding an animated character, companion, enemy, or animated prop to Gold Rush. The source of truth for shipped slots is `assets/layer-contracts/characters.v2.json`; this doc records the laws that are easy to lose when reading only the code.

## Source Trail

- Canon and style: `docs/GOLD_RUSH_BRIEF.md` sections 4 and 9.
- Pipeline state and shipped examples: `assets/LEDGER.md`.
- Sheet prompts and failures: `assets/requests/batch-003.md` through `assets/requests/batch-005R3-bandit-rotation.md`, plus `assets/requests/codex-art-run-*.md`.
- Runtime contract: `specs/visual-polish/slices/02-sprite-animation.md`, `assets/layer-contracts/characters.v2.json`, and `src/assets/SpriteAnimator.ts`.
- Extraction surface: `scripts/extract-alpha.mjs`.

If a future batch contradicts this doc, update the source trail first, then this doc.

## Canon Rules

Use the Frontier Ledger style anchor in every prompt:

> Antique frontier expedition ledger map style - the style of a Wild-West survey map: fine sepia engraved linework and hatching, subtle aged-paper texture, muted warm colors, illustrated - not photorealistic, not saturated.

Keep assets warm, readable, and illustrated. Agent-tech accents are brass/teal; threat accents are rust. Do not generate realistic firearms, gun barrels, gore, Native American enemy imagery, text, letters, numbers, watermarks, labels, borders, or parody cowboy/wanted-poster tropes.

## Cell Maps

All extracted animation cells ship as 512x512 PNGs unless `--cell` is explicitly changed. Raw sheet sizes used so far:

- 1254x1254 square raws from GPT Image/Codex image generation.
- 1700x1700 walk4 raws for exact 425x425 native cells before extraction.
- 1254x1254 4x4 Prospector raws with about 313.5px native cells before extraction.

### Rotation 4x3

Use this as the locomotion pilot sheet when a character needs 8-way movement.

| Cell | Meaning |
|---|---|
| r0c0 / r0c1 | S walk stride A / stride B |
| r0c2 / r0c3 | SE walk stride A / stride B |
| r1c0 / r1c1 | E or W side walk stride A / stride B, depending on the accepted art |
| r1c2 / r1c3 | NE walk stride A / stride B |
| r2c0 / r2c1 | N walk stride A / stride B |
| r2c2 / r2c3 | S idle / N idle |

For asymmetric characters, this is not enough by itself unless the missing side directions are explicitly generated elsewhere.

### Completion 4x2

Use this to retire mirror fallbacks for asymmetric characters.

| Cell | Meaning |
|---|---|
| r0c0 / r0c1 | SW walk stride A / stride B |
| r0c2 / r0c3 | E walk stride A / stride B |
| r1c0 / r1c1 | NW walk stride A / stride B |
| r1c2 / r1c3 | E idle / W idle |

The hero completion sheet used `--scale 0.66` during reprocessing so neighboring direction heights matched the prior rotation sheet. Use `--scale` only to scale down for a measured match; the extractor never upscales.

### Action 3x2

Use one 3x2 sheet per orientation or action family. Existing action sheets output 6 cells at 512x512 each.

Hero front template:

| Cell | Meaning |
|---|---|
| r0c0 | idle |
| r0c1 / r0c2 | walk stride A / stride B |
| r1c0 | hurt |
| r1c1 | panning |
| r1c2 | brace or aim |

Hero back template:

| Cell | Meaning |
|---|---|
| r0c0 | idle |
| r0c1 / r0c2 | walk stride A / stride B |
| r1c0 / r1c1 | build raised / build struck |
| r1c2 | hurt |

Enemy front/back templates should preserve role-specific actions, for example grab reach / grab clutch on front and flee A / flee B on back. Write the exact cell semantics in the batch request before generation; that request becomes binding for the contract.

### Walk4 4x4

Use walk4 when locomotion needs a rounder gait than two frames.

| Sheet | Rows | Columns |
|---|---|---|
| A | S, SE, E, NE | contact, down, passing, up |
| B | N, NW, W, SW | contact, down, passing, up |

The shipped hero and claim-jumper walk4 raws were resized to 1700x1700, then extracted with `--key ff00ff --grid 4x4`.

## Prompt Skeleton

Start with the style anchor, then fill these clauses:

```text
One square sprite sheet, exact <COLS>x<ROWS> grid of equal invisible cells, no visible borders, no labels, no text. Perfectly flat solid uniform bright magenta hex #ff00ff across the whole sheet and between cells; no gradients, no texture, no shadows, no glow spill, no floor plane, no halos.

Same <character> in every cell: <fixed outfit, colors, proportions, scale, lighting, carried props, agent-tech accents>. Keep the same physical side for carried props as the character turns. All requested directions are explicit newly drawn views; no mirrored duplicate cells.

Cells left to right, top to bottom: <cell map>.

Constraints: no text, letters, numbers, watermarks, realistic firearms, firearm silhouettes, gore, extra characters, Native American enemy imagery, or photorealism.
```

Reference-conditioning rule: generate against accepted local references whenever possible. Use the most recent accepted raw or processed sheets for the same character, and name what must match: silhouette, outfit, carried item side, scale band, palette, light direction, and role. If the generator cannot attach local references, inspect the references first and copy those constraints into the prompt. Do not trust a bare role name like "bandit" or "prospector" to preserve identity.

## Extraction

Copy-paste commands:

```sh
node scripts/extract-alpha.mjs --key ff00ff --grid 4x3 assets/raw/char-<id>-sheet-rotation.png
node scripts/extract-alpha.mjs --key ff00ff --grid 4x2 assets/raw/char-<id>-sheet-rotation2.png
node scripts/extract-alpha.mjs --key ff00ff --grid 3x2 assets/raw/char-<id>-sheet-front.png
node scripts/extract-alpha.mjs --key ff00ff --grid 3x2 assets/raw/char-<id>-sheet-back.png
node scripts/extract-alpha.mjs --key ff00ff --grid 4x4 assets/raw/char-<id>-sheet-walk4-a.png assets/raw/char-<id>-sheet-walk4-b.png
```

The extractor writes `assets/processed/<base>-r<row>c<col>.png` and `assets/processed/<base>.frames.json`. It keys border-connected magenta, clears saturated near-key interior spill, despills opaque magenta fringe, centers each cell by alpha bbox, and applies one shared scale per sheet so frames do not breathe. If a raw has near-magenta instead of exact `#ff00ff`, either normalize the raw before extraction or log why the default tolerance is acceptable.

Use scale override only after measuring a mismatch:

```sh
node scripts/extract-alpha.mjs --key ff00ff --grid 4x2 --scale 0.66 assets/raw/char-<id>-sheet-rotation2.png
```

## Per-Cell QA

Run this checklist before contract wiring:

| Check | Pass bar |
|---|---|
| Grid | Correct CxR cell count; all cells non-empty unless intentionally blank and ledgered. |
| Order | Cell contents match the batch request left-to-right, top-to-bottom. |
| Scale | Bbox heights stay in the nearest shipped family band or the batch's declared target band. |
| Existing bands | Hero rotation2 316-379px; hero walk4 336-372px; claim-jumper walk4 277-349px; Prospector hover about 200-225px; Baron walk4 about 393-425px. |
| Key | Background is exact `#ff00ff` or normalized/tolerance-verified; no painted magenta inside the figure/effect after extraction. |
| Color | Frontier Ledger palette; teal only where agent-tech or the prompt calls for it. |
| Canon | No letters, numbers, labels, watermarks, realistic firearms, gore, or forbidden enemy imagery. |
| Direction | Carried props, belt items, ponchos, lanterns, and agent limbs stay on the same physical side. |
| Mirroring | No mirrored duplicate cells for asymmetric characters. |
| Runtime | Screenshot or e2e evidence shows no size pop, orientation snap, missing fallback, or console/page errors. |

If bbox spread within one sheet is over about 8%, do not hand-wave it. Gate it at gameplay zoom and regenerate if it reads as scale pulsing rather than normal gait.

## Explicit Cells Over Mirrors

Asymmetric characters get explicit cells, not mirror tables, once art is meant to be final. Mirrors are acceptable only as temporary placeholder wiring or for genuinely symmetric shapes.

Why: mirroring flips physical design facts. It makes the hero's pan, belt, lantern, or tool side jump across the body during direction changes; it can also reverse a claim-jumper's poncho read, grasping hand, or carried nugget. The first claim-jumper full-rotation attempt failed cell-order QA because side-profile pairs were reversed. The hero rotation completion exists because Robin called for no mirrors on the asymmetric hero.

When a mirror remains, label it in the contract notes as temporary or deliberate, and make the activation gate prove it at gameplay zoom.

## Contract Wiring

1. Save accepted raws in `assets/raw/` with final filenames. Candidate suffixes are fine during review; final contract names are not.
2. Run `scripts/extract-alpha.mjs` into `assets/processed/`.
3. Inspect the generated `*.frames.json` and a montage/contact sheet if the task produced one. Verify cells and bbox measurements before code wiring.
4. Add or update the slot in `assets/layer-contracts/characters.v2.json`.
   - Use `fallback.file` for the single-image safety path.
   - Use `orientations` for side/front/back action sheets.
   - Use `rotations.directions` for 8-way two-frame locomotion.
   - Use `walk4.directions` with `status: "ACTIVE"` for 4-frame locomotion or hover cycles.
   - Put exact filenames in `frames.files` or a `frames.grid.order`; the runtime resolves them from `assets/processed/char-*.png`.
5. If this is a brand-new slot, the source slice that consumes it must add the slot id in `src/assets/slots.ts`, any fallback loader in `src/assets/generated.ts`, and a `SpriteAnimator` consumer like `Hero`, enemy pools, town actors, or `Embodiment`.
6. Keep dormant art dormant in the contract until the runtime asks for the direction or clip. Placeholder-first stays valid: missing cells must fall back to existing art instead of blocking gameplay.
7. Update `assets/LEDGER.md` with prompt, generated, processed, integrated state, measured QA, and evidence paths.

## Done Gate

An art batch is DONE only when all applicable evidence exists:

- Request log with prompt, references, burn count, retries/rejections, and QA verdicts.
- Raws in `assets/raw/`.
- Processed outputs in `assets/processed/`, with `*.frames.json` for sheets.
- Contract row wired or explicitly marked dormant/deferred.
- Ledger row updated with exact state.
- Typecheck/build and the relevant Playwright gate pass for any source or contract activation.
- In-game screenshots or e2e diagnostics show the new slot loaded, animated, and fallback-safe.
- Zero console/page errors for the touched path.

Docs-only prompt batches can stop before raws. Raw-generation-only runs can stop before extraction. Processing-only runs can stop before activation. Mark the stop state plainly in the ledger.

## New Character Worksheet

Copy this section into the next batch request and fill it there.

### Identity

- Slot:
- Public character name:
- Role:
- Canon risks:
- Closest shipped reference:
- Reference files:
- Target height band:

### Cell Map

#### Rotation 4x3

| Cell | Planned content | QA result |
|---|---|---|
| r0c0 |  |  |
| r0c1 |  |  |
| r0c2 |  |  |
| r0c3 |  |  |
| r1c0 |  |  |
| r1c1 |  |  |
| r1c2 |  |  |
| r1c3 |  |  |
| r2c0 |  |  |
| r2c1 |  |  |
| r2c2 |  |  |
| r2c3 |  |  |

#### Completion 4x2

| Cell | Planned content | QA result |
|---|---|---|
| r0c0 |  |  |
| r0c1 |  |  |
| r0c2 |  |  |
| r0c3 |  |  |
| r1c0 |  |  |
| r1c1 |  |  |
| r1c2 |  |  |
| r1c3 |  |  |

#### Action Sheet

| Cell | Planned content | QA result |
|---|---|---|
| r0c0 |  |  |
| r0c1 |  |  |
| r0c2 |  |  |
| r1c0 |  |  |
| r1c1 |  |  |
| r1c2 |  |  |

### Prompt

```text
<STYLE ANCHOR>

One square sprite sheet, exact <COLS>x<ROWS> grid of equal invisible cells, no visible borders, no labels, no text. Perfectly flat solid uniform bright magenta hex #ff00ff across the whole sheet and between cells; no gradients, no texture, no shadows, no glow spill, no floor plane, no halos.

Same <CHARACTER> in every cell: <IDENTITY AND CONSISTENCY CLAUSES>.

Cells left to right, top to bottom: <CELL MAP>.

Constraints: <CANON AND TECHNICAL CONSTRAINTS>.
```

### QA Table

| Check | Result | Evidence path |
|---|---|---|
| Grid count and cell order |  |  |
| Key purity / near-key tolerance |  |  |
| Bbox height band |  |  |
| No interior magenta spill |  |  |
| No text/letters/numbers |  |  |
| No mirror/side-swap defects |  |  |
| Canon guardrails |  |  |
| Contract filenames match processed outputs |  |  |
| Runtime/e2e evidence |  |  |

