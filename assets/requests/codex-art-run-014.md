# Codex Art Run 014 - batch-017 turnaround sheets

Date: 2026-07-09
Tool path: Codex built-in `image_gen` / GPT Image 2
Task: `/Users/robin/Claude/Projects/Gold Rush/tasks/running/art--20260709-101924-art-batch-017-turnarounds.md`

Scope: raw character-turnaround reference generation only. No extraction, `assets/processed/`, layer contracts, `src/`, specs, reviews, e2e, or commits.

## Inputs read

- `CLAUDE.md` section 8 art pipeline and section 6 art-batch quality bar.
- `docs/GOLD_RUSH_BRIEF.md` sections 4 and 9, plus the 2026-07-09 hero canon note.
- `STATUS.md` verification lessons.
- `assets/LEDGER.md` header and current character-codex rows.
- `lore/characters.md` for hero/Prospector naming and cast canon.
- Batch-016 codex plates: `codex-hero-e1.png`, `codex-prospector-e1.png`, `codex-baron-e1.png`, `codex-elder-e1.png`, `codex-tavernkeeper-e1.png`, `codex-clerk-e1.png`, `codex-youngsters-e1.png`.

Style anchor used in every prompt:

> Frontier Ledger style: hand-engraved storybook illustration, fine ink hatching and cross-hatch shading, parchment-warm palette of ochres, sepias and warm browns with restrained teal agent-tech glow accents; illustrated and warmly readable, never photorealistic, never gory, no text or letters or watermarks anywhere in the image.

Every prompt specified one horizontal turnaround row, five poses/groups in this order: left profile, three-quarter left, front A-pose with arms out, three-quarter right, back. Prompts also specified no duplicate/mirrored shortcuts, constant scale/eye-line, plain warm parchment background, no text/letters/numbers/logos/watermarks/signatures, no firearms or gun-like silhouettes, no gore, and no extra characters. The youngsters prompt explicitly required minors fully clothed and no base-layer adaptation.

## Outputs

- `/Users/robin/Claude/Projects/Gold Rush/assets/raw/turn-hero-base.png`
  - source: `/Users/robin/.codex/generated_images/019f44e3-250b-7f90-8091-aa876e0c0c96/ig_0a82ab1978204cf8016a4f13b025b08191abf38a2f409df12c.png`
  - raw prep: copied as generated; no processing.
- `/Users/robin/Claude/Projects/Gold Rush/assets/raw/turn-hero-e1-outfit.png`
  - source: `/Users/robin/.codex/generated_images/019f44e3-250b-7f90-8091-aa876e0c0c96/ig_0789fc30e61a8577016a4f145591bc8191b173ef5d55d8031d.png`
  - raw prep: copied as generated; no processing.
- `/Users/robin/Claude/Projects/Gold Rush/assets/raw/turn-prospector.png`
  - source: `/Users/robin/.codex/generated_images/019f44e3-250b-7f90-8091-aa876e0c0c96/ig_0612a0411281b610016a4f14d2e558819190346e59e4ce1ade.png`
  - raw prep: copied as generated; no processing.
- `/Users/robin/Claude/Projects/Gold Rush/assets/raw/turn-baron-base.png`
  - source: `/Users/robin/.codex/generated_images/019f44e3-250b-7f90-8091-aa876e0c0c96/ig_04bd848618cc9755016a4f15fa8a8c8191b0c9a1e776433df9.png`
  - raw prep: copied as generated; no processing.
- `/Users/robin/Claude/Projects/Gold Rush/assets/raw/turn-baron-coat.png`
  - source: `/Users/robin/.codex/generated_images/019f44e3-250b-7f90-8091-aa876e0c0c96/ig_095f40c180355f11016a4f166e645c81918ffe4efde80bebe1.png`
  - raw prep: copied as generated; no processing.
- `/Users/robin/Claude/Projects/Gold Rush/assets/raw/turn-elder.png`
  - source: `/Users/robin/.codex/generated_images/019f44e3-250b-7f90-8091-aa876e0c0c96/ig_0bb9b4f65f952c75016a4f17372f348191995ea888c6fe0cf2.png`
  - raw prep: copied as generated; no processing.
- `/Users/robin/Claude/Projects/Gold Rush/assets/raw/turn-tavernkeeper.png`
  - source: `/Users/robin/.codex/generated_images/019f44e3-250b-7f90-8091-aa876e0c0c96/ig_0c9f5b1416233386016a4f17abd9f08191b86b0d69fb4e4404.png`
  - raw prep: copied as generated; no processing.
- `/Users/robin/Claude/Projects/Gold Rush/assets/raw/turn-clerk.png`
  - source: `/Users/robin/.codex/generated_images/019f44e3-250b-7f90-8091-aa876e0c0c96/ig_032d15982f0a5a5e016a4f185639308191bfb014ae96048bbf.png`
  - raw prep: copied as generated; no processing.
- `/Users/robin/Claude/Projects/Gold Rush/assets/raw/turn-youngsters.png`
  - source: `/Users/robin/.codex/generated_images/019f44e3-250b-7f90-8091-aa876e0c0c96/ig_076d258e68eb2947016a4f1940026081918388dbcafaa112ba.png`
  - raw prep: copied as generated; no processing.

QA contact sheet: `artifacts/art-batch-017/contact-sheet.png`.

## Burn count

- New image generations: 10
- Accepted final assets: 9
- Rejected attempts: 1
- Retakes: 1 (`turn-baron-base`; first pass had the front arms too close to the body for the A-pose requirement)
- Rate-limit/quota errors: 0

Rejected source retained in default image output directory:

- `/Users/robin/.codex/generated_images/019f44e3-250b-7f90-8091-aa876e0c0c96/ig_04bd848618cc9755016a4f155ed77c81919dc4dca4f45b9013.png`

## Prompt notes

- `turn-hero-base.png`: conditioned on `codex-hero-e1.png`; required same young woman miner, neutral sand-colored fitted full-coverage base layer, boots/hat/teal lamp allowed, no coat/satchel.
- `turn-hero-e1-outfit.png`: conditioned on `codex-hero-e1.png` and the accepted base sheet; required same young woman miner in E1 work clothes. The prompt did not use "Prospector" for the hero.
- `turn-prospector.png`: conditioned on `codex-prospector-e1.png`; required round brass hovering agent chassis, cap lamp, teal core/seams, hover skirt/nozzle, no human body.
- `turn-baron-base.png`: conditioned on `codex-baron-e1.png`; required enormous adult Baron in neutral sand-colored fitted full-coverage base layer, top hat/boots/mustache retained, no coat/banner.
- `turn-baron-coat.png`: conditioned on `codex-baron-e1.png`; required oxblood greatcoat, top hat with blank card only, pictorial crossed-pickaxes banner, no letters.
- `turn-elder.png`: conditioned on `codex-elder-e1.png`; required fully clothed Elder, hat, coat/vest, shawl/scarf.
- `turn-tavernkeeper.png`: conditioned on `codex-tavernkeeper-e1.png`; required fully clothed Tavernkeeper, apron, towel, sturdy friendly build.
- `turn-clerk.png`: conditioned on `codex-clerk-e1.png`; required spectacles, apron/vest, teal lamp; ledger omitted/blank to protect no-text rule.
- `turn-youngsters.png`: conditioned on `codex-youngsters-e1.png`; required five paired groups, both kids present in each group, minors fully clothed, no base layer, no nudity.

## Measured QA

Dimensions and magenta purity were checked with `magick identify` and `pngjs`. Letter/text and A-pose checks are visual checks against the saved assets and contact sheet. Head-height values are visual proportion measurements from the final raw reference sheets, used to compare silhouette consistency against the batch-016 codex plates and existing sprite-height intent; these are not processed-cell bboxes.

| File | Size | Magenta | Identity / same-character check | Pose/layout check | Proportion check | Text/minor check | Verdict |
|---|---:|---:|---|---|---|---|---|
| `turn-hero-base.png` | 1672x941 | 0 exact, 0 near | Same young woman miner face, braid, hat, teal lamp; no role drift to the Prospector. | Five views in order; center A-pose arms out. | ~6.8 heads; matches `codex-hero-e1` young-adult build. | No visible text; adult full-coverage base layer. | PASS |
| `turn-hero-e1-outfit.png` | 1671x941 | 0 exact, 0 near | Same young woman miner as base and codex plate; work clothes consistent. | Five views in order; center A-pose readable. | ~6.8 heads; outfit does not change body scale. | No visible text. | PASS |
| `turn-prospector.png` | 1672x941 | 0 exact, 0 near | Same round brass hovering agent; teal core, cap lamp, hover skirt preserved. | Five chassis views in order; center arms-out chassis pose readable. | Non-human: ~1.5 chassis-diameters tall including cap/skirt; consistent across views. | No visible text; no human body. | PASS |
| `turn-baron-base.png` | 1672x941 | 0 exact, 0 near | Same enormous Baron, mustache, top hat, heavy build. | Retake accepted; five views in order; center A-pose arms clearly out. | ~4.8 heads including hat; matches boss-scale bulky codex silhouette. | No visible text; adult full-coverage base layer. | PASS |
| `turn-baron-coat.png` | 1672x941 | 0 exact, 0 near | Same Baron in oxblood coat; blank hat card; banner remains pictorial. | Five views in order; center A-pose readable; banner does not hide body. | ~4.8 heads including hat; coat preserves bulk/height. | No visible letters; crossed-pickaxe banner only. | PASS |
| `turn-elder.png` | 1672x941 | 0 exact, 0 near | Same Elder beard, hat, shawl/coat, kind mentor read. | Five views in order; center A-pose readable. | ~5.7 heads; slight stoop matches codex Elder. | No visible text; fully clothed. | PASS |
| `turn-tavernkeeper.png` | 1672x941 | 0 exact, 0 near | Same broad Tavernkeeper, beard, hat, apron/towel. | Five views in order; center A-pose readable. | ~5.4 heads; broad build matches codex plate. | No visible text; fully clothed. | PASS |
| `turn-clerk.png` | 1672x941 | 0 exact, 0 near | Same spectacles, curly hair, mustache/goatee, apron/vest, teal lamp. | Five views in order; center A-pose readable. | ~6.4 heads; lean adult build matches codex plate. | No visible text; fully clothed. | PASS |
| `turn-youngsters.png` | 1672x941 | 0 exact, 0 near | Both kids preserved in all five groups: cap/vest boy and hat/braids/overalls girl. | Five paired groups in order; front paired A-pose readable; ten full bodies. | Boy ~5.0 heads, girl ~5.1 heads; child scale and height relationship consistent. | Minors fully clothed; no visible text. | PASS |

No alpha extraction, processed outputs, source changes, specs, reviews, e2e, or commits were created.
