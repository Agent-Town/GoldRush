# Codex Art Run 013 - batch-016 character codex

Date: 2026-07-09
Tool path: Codex built-in `image_gen` / GPT Image 2
Task: `/Users/robin/Claude/Projects/Gold Rush/tasks/running/art--20260709-094502-art-batch-016-character-codex.md`

Scope: raw character-codex reference generation only. No extraction, `assets/processed/`, layer contracts, `src/`, specs, reviews, e2e, or commits.

## Inputs read

- `CLAUDE.md` section 8 art pipeline.
- `docs/GOLD_RUSH_BRIEF.md` sections 4 and 9, plus the 2026-07-09 hero canon note.
- `STATUS.md` verification lessons.
- `assets/LEDGER.md` header and current raw art rows.
- `specs/story-spine/README.md` and `specs/town-v1/README.md` for cast roles.
- Existing processed visual references: hero sheets, Prospector portrait/hover cells, Baron walk4 cells, `prop-baron-banner.png`, townsfolk Elder/Tavernkeeper/Assay Clerk/Youngsters.
- Existing raw visual reference: `assets/raw/kit-the-baron.png`.

Style anchor used in every prompt:

> Frontier Ledger style: hand-engraved storybook illustration, fine ink hatching and cross-hatch shading, parchment-warm palette of ochres, sepias and warm browns with restrained teal agent-tech glow accents; illustrated and warmly readable, never photorealistic, never gory, no text or letters or watermarks anywhere in the image.

Hero prompt note: the hero prompts used "young woman miner" / "same woman" and did not use the agent title. The Prospector prompts were only for the agent.

## Outputs

- `assets/raw/codex-hero-e1.png`
  - source: `/Users/robin/.codex/generated_images/019f44c3-aea3-7d13-be2d-c8219579511a/ig_0fd4e7af70dcf9f9016a4f0bc945cc8191aa07505d83629d3b.png`
  - raw prep: copied as generated; no processing.
- `assets/raw/codex-prospector-e1.png`
  - source: `/Users/robin/.codex/generated_images/019f44c3-aea3-7d13-be2d-c8219579511a/ig_03f217276da6dbb2016a4f0c121ff88191a98cc2e27428b40f.png`
  - raw prep: copied as generated; no processing.
- `assets/raw/codex-elder-e1.png`
  - source: `/Users/robin/.codex/generated_images/019f44c3-aea3-7d13-be2d-c8219579511a/ig_0b29bbed7444a63b016a4f0c5197c881919ccc8a71a2aecf9c.png`
  - raw prep: copied as generated; no processing.
- `assets/raw/codex-tavernkeeper-e1.png`
  - source: `/Users/robin/.codex/generated_images/019f44c3-aea3-7d13-be2d-c8219579511a/ig_0a94560748eb8fa9016a4f0cb505188191afde1af1e0715c25.png`
  - raw prep: copied as generated; no processing.
- `assets/raw/codex-clerk-e1.png`
  - source: `/Users/robin/.codex/generated_images/019f44c3-aea3-7d13-be2d-c8219579511a/ig_0d021df914f368ee016a4f0d0f657c8191a68f917ea87218d0.png`
  - raw prep: copied as generated; no processing.
- `assets/raw/codex-baron-e1.png`
  - source: `/Users/robin/.codex/generated_images/019f44c3-aea3-7d13-be2d-c8219579511a/ig_014b63790cc94800016a4f0d9f373481918f4b8fb0e7d27120.png`
  - raw prep: copied as generated; no processing.
- `assets/raw/codex-youngsters-e1.png`
  - source: `/Users/robin/.codex/generated_images/019f44c3-aea3-7d13-be2d-c8219579511a/ig_0f6027c3105672fc016a4f0de9bbd88191a1fd24a1505ce51b.png`
  - raw prep: copied as generated; no processing.
- `assets/raw/codex-hero-e4.png`
  - source: `/Users/robin/.codex/generated_images/019f44c3-aea3-7d13-be2d-c8219579511a/ig_01ed89821508221c016a4f0e71dde481918b68271e253ae001.png`
  - raw prep: copied as generated; no processing.
- `assets/raw/codex-hero-e8.png`
  - source: `/Users/robin/.codex/generated_images/019f44c3-aea3-7d13-be2d-c8219579511a/ig_00a686ec4630fd7d016a4f0ece80f881918b7797f12b7f3632.png`
  - raw prep: copied as generated; no processing.
- `assets/raw/codex-elder-e2.png`
  - source: `/Users/robin/.codex/generated_images/019f44c3-aea3-7d13-be2d-c8219579511a/ig_04f6e7e628d9dc43016a4f0f44d3308191970f8dd638bf637a.png`
  - raw prep: copied as generated; no processing.
- `assets/raw/codex-youngsters-e4.png`
  - source: `/Users/robin/.codex/generated_images/019f44c3-aea3-7d13-be2d-c8219579511a/ig_0206a4e417e55d2e016a4f0fc9738081918de5267e79e091bd.png`
  - raw prep: copied as generated; no processing.
- `assets/raw/codex-prospector-e8.png`
  - source: `/Users/robin/.codex/generated_images/019f44c3-aea3-7d13-be2d-c8219579511a/ig_05b3e4a1620218cc016a4f10bfc4c48191ac2af965db209944.png`
  - raw prep: copied as generated; no processing.

QA contact sheet: `artifacts/art-batch-016/contact-sheet.png`.

## Burn count

- New image generations: 12
- Accepted final assets: 12
- Rejected attempts: 0
- Retakes: 0
- Rate-limit/quota errors: 0

## Prompt notes

Every prompt included the style anchor above plus hard constraints: no text, letters, numbers, labels, logos, watermarks, signatures, firearms, gun-like silhouettes, gore, or extra characters. E1 prompts used processed sprite references where available. Aged variants were generated after loading their E1 codex plates as the identity anchors.

- `codex-hero-e1.png`: conditioned on hero processed sprites; required young woman miner, hat, work coat, satchel, brass pan, teal chest lamp.
- `codex-prospector-e1.png`: conditioned on Prospector portrait/hover cells; required round brass/copper hovering agent, teal core, pan arm, no legs.
- `codex-elder-e1.png`: conditioned on townsfolk Elder; required white beard, brown hat, shawl/coat, schoolhouse mentor presence.
- `codex-tavernkeeper-e1.png`: conditioned on tavernkeeper portrait; required broad smiling man, apron, towel, warm host presence.
- `codex-clerk-e1.png`: conditioned on assay clerk portrait; required spectacles, vest/apron, blank ledger.
- `codex-baron-e1.png`: conditioned on `kit-the-baron`, Baron cells, and banner; required oxblood coat, blank hat card/pictogram, waxed mustache.
- `codex-youngsters-e1.png`: conditioned on the two youngster portraits; required the pair together, distinct identities, no weapons.
- Aged variants: same face/silhouette from E1, older; no role drift.

## Measured QA

| File | Size | Luma min/max/avg | Magenta | Visual/text/canon QA | Verdict |
|---|---:|---:|---:|---|---|
| `codex-hero-e1.png` | 1672x941 | 0.0 / 250.5 / 154.1 | 0 exact, 0 near | Young woman miner; hat/coat/satchel/pan/teal lamp match sprite language; no visible text. | PASS |
| `codex-prospector-e1.png` | 1672x941 | 0.0 / 255.0 / 180.1 | 0 exact, 0 near | Brass round hovering agent; teal core, pan arm, cap silhouette; no human drift, no visible text. | PASS |
| `codex-elder-e1.png` | 1672x941 | 0.0 / 251.9 / 147.4 | 0 exact, 0 near | Elder face, hat, beard, shawl/coat match townsfolk anchor; no visible text. | PASS |
| `codex-tavernkeeper-e1.png` | 1672x941 | 0.0 / 252.3 / 146.3 | 0 exact, 0 near | Tavernkeeper apron/towel/sturdy smile preserved; plain mug prop has no markings. | PASS |
| `codex-clerk-e1.png` | 1672x941 | 0.0 / 249.9 / 158.0 | 0 exact, 0 near | Clerk spectacles, hair, apron/vest, blank ledger preserved; no visible writing. | PASS |
| `codex-baron-e1.png` | 1672x941 | 0.0 / 255.0 / 133.3 | 0 exact, 0 near | Baron oxblood coat, mustache, blank hat card, crossed-pickaxe banner; no visible letters. | PASS |
| `codex-youngsters-e1.png` | 1672x941 | 0.0 / 254.9 / 143.6 | 0 exact, 0 near | Two distinct youngsters preserved as one pair plate; no visible text or weapons. | PASS |
| `codex-hero-e4.png` | 1672x941 | 0.0 / 253.9 / 141.5 | 0 exact, 0 near | Same woman older, silver streaks, same hat/lamp/pan identity; no masculinization. | PASS |
| `codex-hero-e8.png` | 1672x941 | 0.0 / 254.4 / 145.8 | 0 exact, 0 near | Same woman as elder stateswoman; same hat/lamp/pan identity; no masculinization. | PASS |
| `codex-elder-e2.png` | 1672x941 | 0.0 / 250.6 / 138.1 | 0 exact, 0 near | Same Elder frailer and brighter-eyed; hat/beard/shawl identity intact. | PASS |
| `codex-youngsters-e4.png` | 1672x941 | 0.0 / 254.2 / 127.5 | 0 exact, 0 near | Same pair grown into young adults; identities not swapped; no visible text. | PASS |
| `codex-prospector-e8.png` | 1672x941 | 0.0 / 255.0 / 160.2 | 0 exact, 0 near | Same round Prospector silhouette, patina and pictogram medals; no decay, no visible letters. | PASS |

## Identity-chain table

| Chain | E1 anchor | Aged plate | Same-person / same-silhouette check | Verdict |
|---|---|---|---|---|
| Hero E1 -> E4 | `codex-hero-e1.png` | `codex-hero-e4.png` | Same woman, same eyes, hat, coat, teal lamp, satchel/pan; age reads mid-life with silver streaks. | PASS |
| Hero E1 -> E8 | `codex-hero-e1.png` | `codex-hero-e8.png` | Same woman, older face and silver hair, same hat/lamp/pan language; reads elder stateswoman. | PASS |
| Elder E1 -> E2 | `codex-elder-e1.png` | `codex-elder-e2.png` | Same beard, hat, shawl/coat, bright eyes; frailer final-era read without horror. | PASS |
| Youngsters E1 -> E4 | `codex-youngsters-e1.png` | `codex-youngsters-e4.png` | Same two-person pair, distinct hair/hat/clothing ancestry, grown into young adult leads. | PASS |
| Prospector E1 -> E8 | `codex-prospector-e1.png` | `codex-prospector-e8.png` | Same round brass hovering body, cap silhouette, teal core, pan arm; patina and medals add age without decay. | PASS |

No alpha extraction, processed outputs, source changes, specs, reviews, e2e, or commits were created.
