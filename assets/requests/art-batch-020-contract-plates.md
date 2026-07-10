---
source: codex
project: Gold Rush
date: 2026-07-10
type: art-run
---

# art-batch-020-contract-plates

Owner order 2026-07-10: "each contract should have an image depicting what it is about, its topic and tease that. Not a generic image."

Style anchor used verbatim in every prompt:

> Antique frontier expedition ledger map ... Style of a Wild-West survey map: fine sepia engraved linework and hatching, subtle aged-paper texture underneath, muted warm colors, illustrated - not photorealistic, not saturated.

## Accepted raws

| Contract | File | Source image | Tease |
|---|---|---|---|
| The Claim | `assets/raw/plate-contract-the-claim.png` | `call_cqFJn9d8BVAXyRwFDD21sAA7.png` | A welcoming first claim: river bend, fresh stake, brass pan, and sluice timber. |
| Dry Gulch | `assets/raw/plate-contract-dry-gulch.png` | `call_sDb4ogvFHv1u9XHo7BX1VPYM.png` | Scarcity puzzle: dry washes converge on one sunken green spring. |
| Night Shift | `assets/raw/plate-contract-night-shift.png` | `call_cz8jb5NwUAUuAraKzMTcKokT.png` | Sight as the resource: one warm lantern against a chain of cold darkness. |
| Twin Banks | `assets/raw/plate-contract-twin-banks.png` | `call_trym0CVZMqenRxAbPTwEGJYx.png` | Split homestead: braided river, two fords, and buildable banks on both sides. |
| Claim-Jumper Baron | `assets/raw/plate-contract-baron.png` | `call_elPBTzLpBhAJBC9ZppyQHFOe.png` | Mystery-law tease: crossed-pickaxes banner, sky-rocket sparks, and an off-screen coat-shadow. |
| Hill Mine | `assets/raw/plate-contract-hill-mine.png` | `call_uSC16TKi73qbp05725PZiIGD.png` | Steamworks elevation: terraced hill, rail switchbacks, ore carts, and steam wisps. |

Contact sheet: `assets/contact-sheets/art-batch-020-contract-plates-6up.png`.

## Generation Notes

- Built-in `image_gen` path, 8 image calls total.
- Retakes: Twin Banks first pass rejected for decorative map border; Baron first pass rejected for decorative corner marks. Both accepted on the second pass.
- Every prompt specified full-bleed 16:9 landscape, no letters/numbers/signage/watermark, no firearms, no gore, and the contract-specific tease.
- Baron prompt explicitly required no visible Baron/person/face/body; accepted plate shows only the banner, horizon sparks, and shadow.

## Wiring

Data-only registry edit in `src/town/TownScene.ts`:

- `the-claim` -> `contract-the-claim` / `plate-contract-the-claim.png`
- `e1-dry-gulch` -> `contract-dry-gulch` / `plate-contract-dry-gulch.png`
- `e1-night-shift` -> `contract-night-shift` / `plate-contract-night-shift.png`
- `e1-twin-banks` -> `contract-twin-banks` / `plate-contract-twin-banks.png`
- `e1-baron` -> `contract-baron` / `plate-contract-baron.png`
- `e2-hill-mine` -> `contract-hill-mine` / `plate-contract-hill-mine.png`

## QA

- Dimensions: all six raws are 1672x941 RGB PNG.
- Full-bleed: accepted plates fill the canvas to the edges; no accepted plate has a decorative map frame.
- Canon: no firearms, no gore, no Native American enemies, no visible Baron spoiler.
- Content read: each plate depicts the contract's topic rather than a generic western scene.
