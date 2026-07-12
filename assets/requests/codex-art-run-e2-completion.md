# Codex Art Run - E2 Steamworks completion batch

Task: `/Users/robin/Claude/Projects/Gold Rush/tasks/running/art--20260712-071345-art-e2-completion-batch.md`
Date: 2026-07-12
Tooling: native `image_gen` only for still generation; no Higgsfield still models.

## Outputs

| File | Source | Result |
|---|---|---|
| `assets/raw/bld-rail-depot.png` | `call_9NSvmim0XB2sYXG21loT0vBt.png` | 1254x1254 RGB raw |
| `assets/raw/bld-machine-shop.png` | `call_th0WjPYFfRTM1jvcB3DxIHoZ.png` | 1254x1254 RGB raw |
| `assets/raw/ter-rail-elements.png` | `call_C1b6wTLDXKtLLyFZTYXWLfps.png` | 2172x724 RGB raw, #ff00ff normalized |
| `assets/raw/icons-e2.png` | `call_DkdLRZjy0kHRthTEJs1oO6aL.png` | 2172x724 RGB raw, #ff00ff normalized |

## Prompts

Style anchor used verbatim in every prompt:

> "Frontier Ledger style: hand-engraved storybook illustration, fine ink hatching and cross-hatch shading, parchment-warm palette of ochres, sepias and warm browns with restrained teal agent-tech glow accents; illustrated and warmly readable, never photorealistic, never gory, no text or letters or watermarks anywhere in the image."

`bld-rail-depot.png`: A small frontier rail depot: plank platform, bracketed awning, brass bell, a hand-cart with a strongbox, semaphore arm with teal signal lens, rail track stub entering frame low. Portrait convention + reference conditioning. Reference-conditioned on `assets/processed/bld-general-store.png` and `assets/raw/plate-e2-bld-set.png`.

`bld-machine-shop.png`: An open-fronted machine shop: belt-driven lathes and a flywheel inside warm shadow, gears and pipe stock racked on the wall, workbench with brass parts, sliding barn door half open. Portrait convention + reference conditioning. Reference-conditioned on `assets/processed/bld-general-store.png` and `assets/raw/plate-e2-bld-set.png`.

`ter-rail-elements.png`: sprite sheet, #ff00ff bg, explicit cells: rail straight, rail curve, buffer stop, ore cart empty/full, trestle segment, semaphore post. One-row seven-cell sheet requested; no labels.

`icons-e2.png`: #ff00ff bg, 8 explicit 1-row cells: boiler lance, pressure mortar, iron wall, boiler battery, pressure gauge resource, Pressure card crest, Rail card crest, Iron card crest. Anchor at icon scale: bold engraved pictograms; no labels.

## QA

- `bld-rail-depot.png`: 1254x1254; teal semaphore lens visible; platform, bell, strongbox cart, and rail stub readable; no visible letters, numbers, watermark, firearms, or gore.
- `bld-machine-shop.png`: 1254x1254; interior readable but dim; flywheel, belts, lathes, pipe stock, and workbench readable; no black voids; no visible letters, numbers, watermark, firearms, or gore.
- `ter-rail-elements.png`: 2172x724; seven explicit cells; rail gauge visually consistent across straight, curve, stop, carts, and trestle; exact #ff00ff empty background after native-output key normalization; no labels.
- `icons-e2.png`: 2172x724; eight explicit cells; pictograms readable in preview; exact #ff00ff empty background after native-output key normalization; no labels.
- Preview contact sheets: `assets/contact-sheets/e2-rail-elements-preview.png`, `assets/contact-sheets/e2-icons-preview.png`.

## Notes

- No processing/extraction, alpha conversion, `src/`, specs, reviews, or e2e files touched.
- `bld-boiler-house.png` was not regenerated; raw-to-processed promotion remains fire-side.
