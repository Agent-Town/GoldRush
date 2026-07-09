# Codex Art Run 015 - batch-018 cast completion

Date: 2026-07-09
Tool path: Codex built-in `image_gen` / GPT Image 2
Task: `/Users/robin/Claude/Projects/Gold Rush/tasks/running/art--20260709-112953-art-batch-018-cast-completion.md`

Scope: raw character-reference generation only. No extraction, `assets/processed/`, layer contracts, `src/`, specs, reviews, e2e, or commits.

## Inputs read

- `CLAUDE.md` section 8 art pipeline and section 6 art-batch quality bar.
- `docs/GOLD_RUSH_BRIEF.md` sections 4 and 9.
- `STATUS.md` verification lessons.
- `assets/LEDGER.md` header, current codex rows, and batch-017 rows.
- `lore/canon-rules.md` for the minors-clothed, no-firearms, warm-illustrated guardrails.
- `lore/characters.md` for cast canon.
- Batch-017 layout law: one character x 5 poses in order, constant scale, plain warm background, no text.
- Reference board: `artifacts/art-batch-018/reference/youngsters-reference.png`.
- Reference board: `artifacts/art-batch-018/reference/bandits-reference.png`.

Style anchor used in every prompt:

> Frontier Ledger style: hand-engraved storybook illustration, fine ink hatching and cross-hatch shading, parchment-warm palette of ochres, sepias and warm browns with restrained teal agent-tech glow accents; illustrated and warmly readable, never photorealistic, never gory.

Every turnaround prompt specified one horizontal row, one character only, five full-body poses in this order: left profile, three-quarter left, front A-pose with arms out, three-quarter right, back. Prompts also specified no mirrored shortcuts, constant scale/eye-line, plain warm parchment background, no text/letters/numbers/logos/watermarks/signatures, no firearms or gun-like silhouettes, no gore, and no extra characters. Youngster prompts explicitly required fully clothed minors.

## Outputs

- `/Users/robin/Claude/Projects/Gold Rush/assets/raw/codex-youngster-m-e1.png`
  - source: `/Users/robin/.codex/generated_images/019f4523-aba2-7f90-92a6-8f5b44f4beb1/ig_0cacc99e48d7eb5a016a4f2455c118819191c086cb0797fd04.png`
  - raw prep: copied as generated; no processing.
- `/Users/robin/Claude/Projects/Gold Rush/assets/raw/codex-youngster-f-e1.png`
  - source: `/Users/robin/.codex/generated_images/019f4523-aba2-7f90-92a6-8f5b44f4beb1/ig_00f55d6790478321016a4f24d7ec288191908872d2c4936fa3.png`
  - raw prep: copied as generated; no processing.
- `/Users/robin/Claude/Projects/Gold Rush/assets/raw/turn-youngster-m.png`
  - source: `/Users/robin/.codex/generated_images/019f4523-aba2-7f90-92a6-8f5b44f4beb1/ig_072bd90628bb35cc016a4f256a33dc8191915ebff555bf8a28.png`
  - raw prep: copied as generated; no processing.
- `/Users/robin/Claude/Projects/Gold Rush/assets/raw/turn-youngster-f.png`
  - source: `/Users/robin/.codex/generated_images/019f4523-aba2-7f90-92a6-8f5b44f4beb1/ig_05d6a7d20f783570016a4f2630d55881918f253d27eb2ac078.png`
  - raw prep: copied as generated; no processing.
- `/Users/robin/Claude/Projects/Gold Rush/assets/raw/turn-bandit-base.png`
  - source: `/Users/robin/.codex/generated_images/019f4523-aba2-7f90-92a6-8f5b44f4beb1/ig_0709b1abf6396152016a4f26bd1ff48191ad2daeb2cf950b31.png`
  - raw prep: copied as generated; no processing.
- `/Users/robin/Claude/Projects/Gold Rush/assets/raw/turn-bandit-thief.png`
  - source: `/Users/robin/.codex/generated_images/019f4523-aba2-7f90-92a6-8f5b44f4beb1/ig_019bc7409a30b199016a4f273627f08191be47c4ebb8fd2c9f.png`
  - raw prep: copied as generated; no processing.
- `/Users/robin/Claude/Projects/Gold Rush/assets/raw/turn-bandit-wrecker.png`
  - source: `/Users/robin/.codex/generated_images/019f4523-aba2-7f90-92a6-8f5b44f4beb1/ig_06d59d4632827519016a4f2843ad78819480336b1b58657360.png`
  - raw prep: copied as generated; no processing.

QA contact sheet: `artifacts/art-batch-018/contact-sheet.png`.

## Burn count

- New image generations: 8
- Accepted final assets: 7
- Rejected attempts: 1
- Retakes: 1 (`turn-bandit-wrecker`; first pass had a weaker neutral front pose, retake clarified the A-pose)
- Rate-limit/quota errors: 0

Rejected source retained in default image output directory:

- `/Users/robin/.codex/generated_images/019f4523-aba2-7f90-92a6-8f5b44f4beb1/ig_0ae62e0acc9831d1016a4f279e12c0819181855ad9dba20dec.png`

## Prompt notes

- `codex-youngster-m-e1.png`: conditioned on the batch-009 youngster boy sprite and batch-016 paired plate; required curly brown hair, brown newsboy cap, red-brown vest, cream shirt, suspenders, work trousers, boots, teal belt lantern, and fully clothed minor presentation.
- `codex-youngster-f-e1.png`: conditioned on the batch-009 youngster girl sprite and batch-016 paired plate; required braids, wide brown hat, work overalls, cream shirt, neckerchief, boots, teal belt lantern, and fully clothed minor presentation.
- `turn-youngster-m.png`: conditioned on `codex-youngster-m-e1.png` and the youngster reference board; required the same boy alone in five views.
- `turn-youngster-f.png`: conditioned on `codex-youngster-f-e1.png` and the youngster reference board; required the same girl alone in five views.
- `turn-bandit-base.png`: conditioned on processed claim-jumper sprites; required the claim-jumper poncho/hat/scarf silhouette and no firearms.
- `turn-bandit-thief.png`: conditioned on processed claim-jumper sprites; required a lighter build and visible satchel for stolen gold, no firearms.
- `turn-bandit-wrecker.png`: conditioned on processed claim-jumper sprites; required heavier build, tool harness, demolition tools-as-menace, and no firearms.

## Measured QA

Dimensions and magenta purity were checked with `pngjs`. Letter/text, minors-clothed, firearms, and A-pose checks are visual checks against the saved assets and contact sheet.

| File | Size | Magenta | Identity / same-character check | Pose/layout check | Canon check | Verdict |
|---|---:|---:|---|---|---|---|
| `codex-youngster-m-e1.png` | 1672x941 | 0 exact, 0 near | Same cap-and-vest boy from batch-009/batch-016. | Identity plate: portrait + full body. | Fully clothed minor; no text. | PASS |
| `codex-youngster-f-e1.png` | 1671x941 | 0 exact, 0 near | Same hat-and-braids girl from batch-009/batch-016. | Identity plate: portrait + full body. | Fully clothed minor; no text. | PASS |
| `turn-youngster-m.png` | 1671x941 | 0 exact, 0 near | Boy identity preserved across all five poses. | Five views in order; center A-pose readable. | Fully clothed minor; no text. | PASS |
| `turn-youngster-f.png` | 1672x941 | 0 exact, 0 near | Girl identity preserved across all five poses. | Five views in order; center A-pose readable. | Fully clothed minor; no text. | PASS |
| `turn-bandit-base.png` | 1671x941 | 0 exact, 0 near | Claim-jumper poncho/hat/scarf silhouette preserved. | Five views in order; crouched center pose has separated arms. | No firearms, no letters, illustrated menace only. | PASS |
| `turn-bandit-thief.png` | 1671x941 | 0 exact, 0 near | Lighter claim-jumper variant with satchel preserved. | Five views in order; center A-pose readable. | No firearms, no letters, satchel variant clear. | PASS |
| `turn-bandit-wrecker.png` | 1670x941 | 0 exact, 0 near | Heavy claim-jumper variant with tool harness preserved. | Retake accepted; five views in order; center A-pose clearer. | Tools-as-menace only, no firearms, no letters. | PASS |

No alpha extraction, processed outputs, source changes, specs, reviews, e2e, or commits were created.
