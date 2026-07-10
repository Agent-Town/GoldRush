---
source: codex
project: Gold Rush
date: 2026-07-10
type: art-run-note
task: art-ts-02-facades
---

# art-ts-02-facades — Town Facade Plates

Generated six raw full-bleed portrait facade plates for TS-02:

| Building | Output | Shell basis | Town footprint |
|---|---|---|---|
| Tavern | `assets/raw/facade-tavern.png` | `assets/raw/bld-tavern.png` | 5.2w x 3.4d |
| Claim Office | `assets/raw/facade-claim-office.png` | `assets/raw/bld-claim-office.png` | 4.4w x 3.2d |
| Schoolhouse | `assets/raw/facade-schoolhouse.png` | `assets/raw/bld-schoolhouse.png` | 4.4w x 3.4d |
| Assay Office | `assets/raw/facade-assay-office.png` | claim-office shell fallback; assay role palette | 4.6w x 3.4d |
| General Store | `assets/raw/facade-general-store.png` | `assets/raw/bld-general-store.png` | 4.8w x 3.3d |
| Chapel | `assets/raw/facade-chapel.png` | `assets/raw/bld-chapel.png` | 4.2w x 3.2d |

Contact sheet: `assets/contact-sheets/art-ts-02-facades-6up.png`.

Prompt style anchor used in every prompt:

> painted isometric western town facade, warm illustrated Frontier Ledger style, rich western facades, porch timber detail, warm windows, weathered wood, engraved-parchment kin, dusty ochre sunlight, readable at game scale.

QA notes:

- Style-match: visually checked against `assets/reference/agenttown-town-style.jpeg`; warm painted western facades, porch timber, weathered wood, warm windows, and dusty parchment palette held.
- Text rule: signs are pictograms only by visual inspection. OCR produced shape-noise only, not readable words.
- Proportions: each prompt carried the current `src/town/townLayout.ts` footprint. Assay Office uses the same current art fallback as the registry, with its distinct 4.6 x 3.4 footprint and assay palette.
- Retakes: 0 of 2 used for each building.
- Firewall: raw facade plates, contact sheet, this note, and `assets/LEDGER.md` only. No `src/`, processed assets, specs, reviews, e2e, or layer contracts touched.
