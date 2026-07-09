# Codex Art Run 012 - batch-015 continuity kit

Date: 2026-07-09
Tool path: Codex built-in `image_gen` / GPT Image 2
Task: `/Users/robin/Claude/Projects/Gold Rush/tasks/running/art--20260709-074508-art-batch-015-continuity-kit.md`

Scope: raw continuity/reference generation only. No extraction, `assets/processed/`, layer contracts, `src/`, specs, reviews, e2e, or commits.

## Inputs read

- `CLAUDE.md` section 8 art pipeline.
- `docs/GOLD_RUSH_BRIEF.md` sections 4 and 9.
- `STATUS.md` verification lessons.
- `assets/LEDGER.md` header and current raw art rows.
- `specs/marketing/README.md` for Seedance/Higgsfield image-reference purpose.
- `specs/epoch-saga/e2-steamworks-bundle.md`, `e4-motor-bundle.md`, `e8-orbital-bundle.md`, `e9-redfields-bundle.md`, and `e10-deepsky-bundle.md`.
- Existing visual references: `assets/raw/mkt-hero-16x9.png`, `assets/raw/concept-town-square.png`, `assets/raw/ter-sand-seamless-a.png`, `assets/raw/ter-bank-damp-seamless.png`.
- Existing processed visual references: `assets/processed/bld-tavern.png`, `bld-schoolhouse.png`, `bld-claim-office.png`, `bld-chapel.png`, `bld-general-store.png`, Baron walk4 cells, and `prop-baron-banner.png`.

Style anchor used in every prompt:

> Frontier Ledger style: hand-engraved storybook illustration, fine ink hatching and cross-hatch shading, parchment-warm palette of ochres, sepias and warm browns with restrained teal agent-tech glow accents; illustrated and warmly readable, never photorealistic, never gory, no text or letters or watermarks anywhere in the image.

## Outputs

- `assets/raw/kit-valley-master.png`
  - source: `/Users/robin/.codex/generated_images/019f4455-e81d-7f12-a2c4-58e34cd262b9/ig_0ea15ad90e3d569e016a4eefc55f8c8191892a74775adaa93d.png`
  - raw prep: copied as generated; no processing.
- `assets/raw/kit-town-canon.png`
  - source: `/Users/robin/.codex/generated_images/019f4455-e81d-7f12-a2c4-58e34cd262b9/ig_053a8ebc78e3cb07016a4ef0135c708191b9b134715a09145e.png`
  - raw prep: copied as generated; no processing.
- `assets/raw/kit-era-2.png`
  - source: `/Users/robin/.codex/generated_images/019f4455-e81d-7f12-a2c4-58e34cd262b9/ig_0f9b49333d20dc3f016a4ef0ad91248191b46a2af1c0da82a6.png`
  - raw prep: copied as generated; no processing.
- `assets/raw/kit-era-4.png`
  - source: `/Users/robin/.codex/generated_images/019f4455-e81d-7f12-a2c4-58e34cd262b9/ig_06721b3670d9944b016a4ef11775b08191bdc536a4037a6fcf.png`
  - raw prep: copied as generated; no processing.
- `assets/raw/kit-era-8.png`
  - source: `/Users/robin/.codex/generated_images/019f4455-e81d-7f12-a2c4-58e34cd262b9/ig_000692d69878ca1c016a4ef1a97ec08191af54d905609176d2.png`
  - raw prep: copied as generated; no processing.
- `assets/raw/kit-era-10.png`
  - source: `/Users/robin/.codex/generated_images/019f4455-e81d-7f12-a2c4-58e34cd262b9/ig_0985253189faa0ef016a4ef23bda10819195cbf387ea4f73fe.png`
  - raw prep: copied as generated; no processing.
- `assets/raw/kit-the-ark.png`
  - source: `/Users/robin/.codex/generated_images/019f4455-e81d-7f12-a2c4-58e34cd262b9/ig_02117ad0deec62da016a4ef2e54a208191a3be6063ff2b8868.png`
  - raw prep: copied as generated; no processing.
- `assets/raw/kit-the-baron.png`
  - source: `/Users/robin/.codex/generated_images/019f4455-e81d-7f12-a2c4-58e34cd262b9/ig_002f6698528515a5016a4ef40f26d48191912311f4e53de48c.png`
  - raw prep: copied as generated; no processing.
- `assets/raw/kit-mark-emblem.png`
  - source: `/Users/robin/.codex/generated_images/019f4455-e81d-7f12-a2c4-58e34cd262b9/ig_08695e2c6349a263016a4ef4b89cb081918b94a1ea03650972.png`
  - raw prep: copied as generated; no processing.

QA contact sheet: `artifacts/art-batch-015/contact-sheet.png`.

## Burn count

- New image generations: 10
- Accepted final assets: 9
- Rejected attempts: 1
- Retakes: Baron plate 1
- Rate-limit/quota errors: 0

Rejected attempts:

- `kit-the-baron.png` attempt 1: rejected because the hat card contained a readable letter. Corrective retake required a blank card or pictogram only.

## Prompt notes

Every prompt included the style anchor above plus hard constraints: no text, letters, numbers, labels, logos, watermarks, signatures, firearms, gun barrels, gore, or Native American enemy imagery.

- `kit-valley-master.png`: conditioned on `mkt-hero-16x9`, `concept-town-square`, and terrain references; preserved the marketing vantage, S-curve river, left/background ridge line, right-bank claim/town, and bank shapes.
- `kit-town-canon.png`: conditioned on processed `bld-tavern`, `bld-schoolhouse`, `bld-claim-office`, `bld-chapel`, and `bld-general-store`; required same silhouettes, rooflines, red tile roofs, false-fronts, bell towers, warm windows, blank boards.
- `kit-era-2.png`: conditioned on `kit-valley-master`; added Steamworks stamp mill, boiler house, white steam, rail spur/depot, trestle/ore carts, brass/teal pressure details.
- `kit-era-4.png`: conditioned on `kit-valley-master`; added Motor Frontier roads, vehicles, garage/motor inn, oil derricks, compact tank farm, dust-warm haze, no black smoke.
- `kit-era-8.png`: conditioned on `kit-valley-master`; added orbital gantries, mass-driver rail, dome habitats, solar lens arrays, airlocks, silver-and-teal orbital works.
- `kit-era-10.png`: conditioned on `kit-valley-master`; added dusty green fields, canal-fed gardens following the river bends, Ark berth, and town-as-ship dock.
- `kit-the-ark.png`: conditioned on `kit-era-10`; preserved the canonical Ark design as a brass-and-timber town-as-ship with cylindrical hull, stacked decks, glass dome, and teal engines.
- `kit-the-baron.png`: conditioned on processed Baron sheets and banner; preserved oxblood coat, tall hat with blank card shape, waxed mustache, stocky proportions, and crossed-pickaxe banner.
- `kit-mark-emblem.png`: letterless centered mark: crossed pickaxes over brass pan with one teal spark.

## Measured QA

| File | Size | Luma min/max/avg | Magenta | Visual/text/canon QA | Verdict |
|---|---:|---:|---:|---|---|
| `kit-valley-master.png` | 1672x941 | 1.6 / 252.8 / 110.2 | 0 exact, 0 near | Marketing vantage preserved; S-curve river, left ridge, right-bank town and banks readable; no visible text. | PASS |
| `kit-town-canon.png` | 1672x941 | 0.0 / 250.5 / 88.7 | 0 exact, 0 near | Tavern, schoolhouse, claim office, chapel, and store roofline/silhouette language match processed refs; no visible text. | PASS |
| `kit-era-2.png` | 1672x941 | 0.4 / 254.6 / 97.9 | 0 exact, 0 near | Same valley geography; steam mill/rail works added; white steam, no black smoke, no visible text. | PASS |
| `kit-era-4.png` | 1672x941 | 0.6 / 251.6 / 97.7 | 0 exact, 0 near | Same valley geography; roads/motors/derricks added; dust haze, no visible text. | PASS |
| `kit-era-8.png` | 1672x941 | 0.0 / 253.4 / 94.6 | 0 exact, 0 near | Same valley geography; orbital gantries/domes/lenses added; no visible text. | PASS |
| `kit-era-10.png` | 1672x941 | 0.2 / 255.0 / 83.3 | 0 exact, 0 near | Same valley geography; green fields and Ark berth added; Ark silhouette establishes design; no visible text. | PASS |
| `kit-the-ark.png` | 1672x941 | 0.0 / 254.0 / 93.0 | 0 exact, 0 near | Matches E10 Ark design: brass cylinder hull, town decks, glass dome, teal engine cluster; no visible text. | PASS |
| `kit-the-baron.png` | 1672x941 | 0.0 / 230.8 / 98.9 | 0 exact, 0 near | Retake removed hat-letter issue; Baron coat/mustache/hat/banner match refs; no visible text. | PASS |
| `kit-mark-emblem.png` | 1254x1254 | 0.0 / 254.6 / 132.9 | 0 exact, 0 near | Crossed pickaxes, brass pan, one teal spark; letterless; no visible text. | PASS |

## Consistency cross-check

| Check | `kit-valley-master` | Era 2 | Era 4 | Era 8 | Era 10 |
|---|---|---|---|---|---|
| Camera/vantage | high oblique ridge, horizon high | match | match | match | match |
| River course | S-curve lower left to upper right | match; rail overlays only | match; roads overlay only | match; gantries/bridges overlay only | match; canals/green fields trace bends |
| Ridge line | left/background mesa ridge | match | match | match | match |
| Right-bank town | palisaded/town footprint on right bank | same footprint, steam/rail additions | same footprint, roads/derricks | same footprint, orbital works | same footprint, Ark berth |
| Palette band | warm parchment/ochre/sepia + restrained teal | same band + steamworks whites | same band + lighter dust | same band + silver/teal | darker deep-sky band + dusty greens |

No alpha extraction, processed outputs, source changes, specs, reviews, e2e, or commits were created.
