# Codex Art Run 021 - E4 Motor Frontier saga-library gap-fill plates

Date: 2026-07-09
Tool path: Codex built-in `image_gen` / GPT Image 2
Task: `/Users/robin/Claude/Projects/Gold Rush/tasks/running/art--20260709-151924-art-saga-library-e4.md`

Scope: raw saga-library plate generation only. No extraction, `assets/processed/`, layer contracts, `src/`, specs, reviews, e2e, or commits.

## Inputs read

- `specs/epoch-saga/e4-motor-bundle.md` art manifest and E4 style anchor.
- `docs/GOLD_RUSH_BRIEF.md` sections 4 and 9.
- `docs/decisions/ADR-001-weapon-tech-language.md`.
- `docs/decisions/ADR-003-agent-origin.md`.
- `STATUS.md` verification lessons.
- `assets/LEDGER.md` current kit, codex, turnaround, and E2/E3/E5/E6/E7 saga-library rows.
- `lore/canon-rules.md` Persistence Law and canon guardrails.
- `lore/story-arc.md` and `lore/characters.md`.
- Reference anchors: `kit-era-4.png`, `codex-hero-e4.png`, `codex-youngsters-e4.png`, `codex-prospector-e3.png`, `codex-prospector-e5.png`, `turn-bandit-thief.png`, E1/E2 townsfolk raws, and E2/E3 building plates.

Style anchor used in every prompt:

> Frontier Ledger style: antique expedition ledger concept plate, hand-engraved storybook illustration, fine sepia ink hatching and cross-hatch shading, tactile parchment texture, illustrated and warmly readable, never photorealistic, never gory, no text or letters or watermarks anywhere in the image.

E4 palette addendum used in every prompt:

> dust-warm ochres pushed lighter and hazier; machines are riveted steel with brass carryovers and teal agent-glow instruments; exhaust reads as light dust puffs, never black smoke; speed is drawn with engraved motion lines, never blur.

Every prompt specified no text/letters/numbers/logos/watermarks/signatures, no firearms or gun-like silhouettes, no gore, no Native American enemy imagery, and no bright magenta/#ff00ff.

## Outputs

- `/Users/robin/Claude/Projects/Gold Rush/assets/raw/codex-prospector-e4.png`
  - source: `/Users/robin/.codex/generated_images/019f45f5-cc7a-7d33-8df2-c53c67e44193/ig_091054cbeff70023016a4f5a34d50c8191be4f25eaf49479ab.png`
  - purpose: Prospector Motor Frontier variant, conditioned on `codex-prospector-e3.png` and `codex-prospector-e5.png`.
- `/Users/robin/Claude/Projects/Gold Rush/assets/raw/plate-e4-enemy-motorgang.png`
  - source: `/Users/robin/.codex/generated_images/019f45f5-cc7a-7d33-8df2-c53c67e44193/ig_049ebf02ee875f8f016a4f5a9618c48191b361adda76b674d2.png`
  - post-copy normalization: width resized from 1671 to 1672 px; height unchanged.
  - purpose: motor gang rider and scrap-built motorbike unit plate.
- `/Users/robin/Claude/Projects/Gold Rush/assets/raw/plate-e4-enemy-tarsprite.png`
  - source: `/Users/robin/.codex/generated_images/019f45f5-cc7a-7d33-8df2-c53c67e44193/ig_06878a0286dd490b016a4f5b0f9bc88195862100302871cc0e.png`
  - purpose: tar sprite states plate.
- `/Users/robin/Claude/Projects/Gold Rush/assets/raw/plate-e4-enemy-pipeline-rustler.png`
  - source: `/Users/robin/.codex/generated_images/019f45f5-cc7a-7d33-8df2-c53c67e44193/ig_02b666b702c83c8f016a4f5b63461881959266190a741771b9.png`
  - purpose: pipeline rustler siphon-crew plate.
- `/Users/robin/Claude/Projects/Gold Rush/assets/raw/plate-e4-boss-land-yacht.png`
  - source: `/Users/robin/.codex/generated_images/019f45f5-cc7a-7d33-8df2-c53c67e44193/ig_067da5e3d3ed9937016a4f5bbef7dc8191a5845a2c1db5111b.png`
  - purpose: Land-Yacht component boss plate.
- `/Users/robin/Claude/Projects/Gold Rush/assets/raw/plate-e4-townsfolk-era.png`
  - source: `/Users/robin/.codex/generated_images/019f45f5-cc7a-7d33-8df2-c53c67e44193/ig_0f9ed950dc57dd23016a4f5c5f6ea081998fdfdb2122629ce4.png`
  - purpose: E4 motor-era townsfolk aging/cast plate.
- `/Users/robin/Claude/Projects/Gold Rush/assets/raw/plate-e4-bld-set.png`
  - source: `/Users/robin/.codex/generated_images/019f45f5-cc7a-7d33-8df2-c53c67e44193/ig_002dfbb11cf3bf8e016a4f5d1ba5e8819b80ec7a2dbaa654da.png`
  - purpose: E4 A1 task-gap building plate.

QA contact sheet: `artifacts/art-saga-e4/contact-sheet.png`.

## Burn count

- New image generations: 7
- Accepted final assets: 7
- Rejected attempts: 0
- Retakes: 0
- Rate-limit/quota errors: 0

## Prompt notes

- `codex-prospector-e4.png`: preserve the round brass Prospector body between E3 and E5; add road-dust weathering, driving goggles pushed up on hull, and a small gauge-cluster retrofit.
- `plate-e4-enemy-motorgang.png`: rider and pipe-frame motorbike as one unit; rust-orange scarf, grapple-chain for crate theft, light dust puffs, no firearms.
- `plate-e4-enemy-tarsprite.png`: knee-high animate tar glob with pilot-light hat, sticky trail, and cute-menacing read.
- `plate-e4-enemy-pipeline-rustler.png`: siphon crew with hand-pump backpack on the figure's left, hose coiled to the figure's right, tank/pipeline tapping tools only.
- `plate-e4-boss-land-yacht.png`: rolling fortress on six wheels with barge hull, amidships stack, cargo-crane arm, wheelhouse, and readable wheel/crane/wheelhouse zones.
- `plate-e4-townsfolk-era.png`: same townsfolk family aged into motor-era dress; role reads include wildcatter, mechanic, road-boss with theodolite, diner cook, radio tinkerer, and promoted depot clerk.
- `plate-e4-bld-set.png`: rendered only task gaps: derrick with pump-jack up/down reads, refinery with fuel/tar spigots, garage with Flivver, and grader-post with pictogram route table. Existing E2/E3 building anchors were skipped rather than regenerated.

## Gap list

Rendered:

- `codex-prospector-e4.png`
- `plate-e4-enemy-motorgang.png`
- `plate-e4-enemy-tarsprite.png`
- `plate-e4-enemy-pipeline-rustler.png`
- `plate-e4-boss-land-yacht.png`
- `plate-e4-townsfolk-era.png`
- `plate-e4-bld-set.png` with derrick/pump-jack, refinery, garage, grader-post.

Skipped as existing anchors:

- E4 continuity anchor: `kit-era-4.png`.
- E4 hero/youngsters anchors: `codex-hero-e4.png`, `codex-youngsters-e4.png`.
- E2/E3 building continuity anchors used for style/scale rather than regenerated: `bld-boiler-house.png`, `bld-stamp-mill.png`, `plate-e3-bld-dynamo-hall.png`, `plate-e3-bld-pylon-set.png`, `plate-e3-bld-arc-lamp.png`.

Not rendered:

- `bld-watchtower.png`; it is in E4 §A1 but outside this task's explicit `plate-e4-bld-set.png` gap list.

## Measured QA

Dimensions and magenta purity were checked with `sips` and a `pngjs` scan. Letter/text, firearms, no-gore, identity-chain, persistence, palette, and role-read checks are visual checks against the saved assets and contact sheet.

| File | Size | Magenta | Identity / persistence check | Canon check | Verdict |
|---|---:|---:|---|---|---|
| `codex-prospector-e4.png` | 1672x941 | 0 exact, 0 near | Same round brass Prospector silhouette between E3/E5; goggles, road dust, and gauge cluster clear. | No visible text/firearms/gore; E4 brass/steel/teal palette held. | PASS |
| `plate-e4-enemy-motorgang.png` | 1672x941 | 0 exact, 0 near | Rider+bike read as one unit; rust-orange scarf, pipe-frame bike, grapple-chain, and dust motion clear. | No visible text/firearms/gore; outlaw only, no gun shapes. | PASS |
| `plate-e4-enemy-tarsprite.png` | 1672x941 | 0 exact, 0 near | Three tar-sprite states, pilot-light hat, and sticky trail visible. | Cute-menacing, never gross; no text/firearms/gore. | PASS |
| `plate-e4-enemy-pipeline-rustler.png` | 1672x941 | 0 exact, 0 near | Hand-pump backpack appears on the figure's left; hose coils right; pipeline/tank tapping action clear. | Tools only, no visible firearms/text/gore. | PASS |
| `plate-e4-boss-land-yacht.png` | 1672x941 | 0 exact, 0 near | Six wheels, barge hull, crane, wheelhouse, and wheel/crane/wheelhouse component reads are silhouette-readable; faint rail/pylon continuity appears in the background. | No visible text/firearms/gore; stack puffs are light, not black smoke. | PASS |
| `plate-e4-townsfolk-era.png` | 1672x941 | 0 exact, 0 near | Motor-era cast/roles readable; road-boss with inherited theodolite and fully clothed radio-tinkerer kid present; maps/cards are blank or pictogram-only. | No visible text/firearms/gore; warm civic tone held. | PASS |
| `plate-e4-bld-set.png` | 1672x941 | 0 exact, 0 near | Derrick/pump-jack, refinery fuel/tar spigots, garage/Flivver, and grader-post all readable; maps/signs are pictogram-only. | No visible text/firearms/gore; E4 materials and light haze held. | PASS |

No alpha extraction, processed outputs, layer-contract edits, source changes, specs, reviews, e2e, or commits were created.
