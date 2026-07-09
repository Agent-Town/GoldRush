# Codex Art Run 016 - E2 Steamworks saga-library plates

Date: 2026-07-09
Tool path: Codex built-in `image_gen` / GPT Image 2
Task: `/Users/robin/Claude/Projects/Gold Rush/tasks/running/art--20260709-115527-art-saga-library-e2.md`

Scope: raw saga-library plate generation only. No extraction, `assets/processed/`, layer contracts, `src/`, specs, reviews, e2e, or commits.

## Inputs read

- `specs/epoch-saga/e2-steamworks-bundle.md` art manifest and Hill Mine boss route.
- `docs/GOLD_RUSH_BRIEF.md` sections 4 and 9.
- `STATUS.md` verification lessons.
- `assets/LEDGER.md` current E2 enemy, boss, kit, codex, turnaround, and building rows.
- `lore/canon-rules.md` Persistence Law and canon guardrails.
- Batch-018 bandit references: `turn-bandit-base.png`, `turn-bandit-thief.png`, `turn-bandit-wrecker.png`.
- Town identity anchors: E1 townsfolk raws plus batch-016 codex plates.
- E2 continuity anchors: `kit-era-2.png`, `bld-boiler-house.png`, and `bld-stamp-mill.png`.

Style anchor used in every prompt:

> Frontier Ledger style: hand-engraved storybook illustration, fine ink hatching and cross-hatch shading, parchment-warm palette of ochres, sepias and warm browns with restrained teal agent-tech glow accents; illustrated and warmly readable, never photorealistic, never gory, no text or letters or watermarks anywhere in the image.

Every prompt specified no text/letters/numbers/logos/watermarks/signatures, no firearms or gun-like silhouettes, no gore, no Native American enemy imagery, and no bright magenta/#ff00ff.

## Building gap list

Rendered:

- `bld-rail-depot` concept inside `plate-e2-bld-set.png`
- `bld-machine-shop` concept inside `plate-e2-bld-set.png`

Skipped because raw assets already exist:

- `bld-boiler-house.png`
- `bld-stamp-mill.png`

## Outputs

- `/Users/robin/Claude/Projects/Gold Rush/assets/raw/plate-e2-enemy-railtough.png`
  - source: `/Users/robin/.codex/generated_images/019f453b-152e-7691-b974-181f5830ae18/ig_00c448051cb5b1a2016a4f2a5bf6508191bf3945925a1017fb.png`
  - purpose: armored rail-company tough, conditioned on `turn-bandit-base.png`.
- `/Users/robin/Claude/Projects/Gold Rush/assets/raw/plate-e2-enemy-coalthief.png`
  - source: `/Users/robin/.codex/generated_images/019f453b-152e-7691-b974-181f5830ae18/ig_0fbec16338d78a34016a4f2ab43bb08191815a349d00fba8de.png`
  - purpose: steam-fast coal/pressure thief, conditioned on `turn-bandit-thief.png`.
- `/Users/robin/Claude/Projects/Gold Rush/assets/raw/plate-e2-enemy-steamwrecker.png`
  - source: `/Users/robin/.codex/generated_images/019f453b-152e-7691-b974-181f5830ae18/ig_0b400cf35abb1b76016a4f2afdba848191a8521ea85e905782.png`
  - purpose: wrecker-class hostile machine, conditioned on the role language from `turn-bandit-wrecker.png`.
- `/Users/robin/Claude/Projects/Gold Rush/assets/raw/plate-e2-boss-component.png`
  - source: `/Users/robin/.codex/generated_images/019f453b-152e-7691-b974-181f5830ae18/ig_0622d967302a016a016a4f2b46888c81918201222e8ca70f1d.png`
  - purpose: Hill Mine armored railcar component boss with wheels/boiler/cabin zones.
- `/Users/robin/Claude/Projects/Gold Rush/assets/raw/plate-e2-townsfolk-era.png`
  - source: `/Users/robin/.codex/generated_images/019f453b-152e-7691-b974-181f5830ae18/ig_0db9bba1f6e7d5f6016a4f2bb24f8881918effb31f0e1be6af.png`
  - purpose: E1 town cast aging/outfit pass in Steamworks dress.
- `/Users/robin/Claude/Projects/Gold Rush/assets/raw/plate-e2-bld-set.png`
  - source: `/Users/robin/.codex/generated_images/019f453b-152e-7691-b974-181f5830ae18/ig_0e65824ff84a2297016a4f2c311d1481919b8e7a86cb177406.png`
  - purpose: two-building gap plate for rail depot and machine shop only.

QA contact sheet: `artifacts/art-saga-e2/contact-sheet.png`.

## Burn count

- New image generations: 6
- Accepted final assets: 6
- Rejected attempts: 0
- Retakes: 0
- Rate-limit/quota errors: 0

## Prompt notes

- `plate-e2-enemy-railtough.png`: slate-blue company coat, riveted shoulder armor, brass knuckle guards, crowbar-spanner, same claim-jumper outlaw family, no firearms.
- `plate-e2-enemy-coalthief.png`: wiry thief posture, soot-dark coal sack fixed to the left shoulder, belt pressure canister, piston ankle braces, no firearms.
- `plate-e2-enemy-steamwrecker.png`: machine not person, riveted boiler body, wrench arms, clamp legs, amber hostile lens, white steam.
- `plate-e2-boss-component.png`: side-elevation railcar, pictorial wheel/boiler/cabin component zones, mechanical damage only.
- `plate-e2-townsfolk-era.png`: same E1 town roles/faces, about 15 years older where appropriate, steam-era dress details, fully clothed minors.
- `plate-e2-bld-set.png`: only rail depot and machine shop; no boiler house or stamp mill.

## Measured QA

Dimensions and magenta purity were checked with `magick identify` and `pngjs`. Letter/text, firearms, no-gore, identity-chain, and role-read checks are visual checks against the saved assets and contact sheet.

| File | Size | Magenta | Identity / persistence check | Canon check | Verdict |
|---|---:|---:|---|---|---|
| `plate-e2-enemy-railtough.png` | 1672x941 | 0 exact, 0 near | Claim-jumper outlaw family preserved; armored slate rail tough reads distinct from bandit red. | No visible text/firearms/gore. | PASS |
| `plate-e2-enemy-coalthief.png` | 1672x941 | 0 exact, 0 near | Thief silhouette preserved; coal sack stays left-side readable; steam-fast braces visible. | No visible text/firearms/gore. | PASS |
| `plate-e2-enemy-steamwrecker.png` | 1672x941 | 0 exact, 0 near | Wrecker role becomes a machine; boiler body, wrench arms, clamp legs read clearly. | No visible text/firearms/gore; machine not people. | PASS |
| `plate-e2-boss-component.png` | 1672x941 | 0 exact, 0 near | Hill Mine rail route fantasy held; wheels/boiler/cabin component zones are visually separable. | No visible text/firearms/gore; damage is mechanical only. | PASS |
| `plate-e2-townsfolk-era.png` | 1672x941 | 0 exact, 0 near | E1 town roles preserved with steam-era aging/outfit pass; youngsters fully clothed. | No visible text/firearms/gore. | PASS |
| `plate-e2-bld-set.png` | 1672x941 | 0 exact, 0 near | Only true A1 gaps rendered: rail depot and machine shop; existing boiler/stamp mill skipped. | No visible text/firearms/gore; warm Steamworks palette. | PASS |

No alpha extraction, processed outputs, layer-contract edits, source changes, specs, reviews, e2e, or commits were created.
