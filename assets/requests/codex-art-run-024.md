# Codex Art Run 024 - E9 Red Fields kit retake

Date: 2026-07-10
Tool path: Codex built-in `image_gen` / GPT Image 2, plus local green-swatch correction with `pngjs`
Task: `/Users/robin/Claude/Projects/Gold Rush/tasks/running/art--20260710-185205-art-kit-era-9-retake.md`
Status: RAW GENERATED - true Red Fields endpoint replaces the valley-continuity endpoint.

Scope: `assets/raw/kit-era-9.png`, `assets/raw/kit-era-9-valley-superseded.png`, this note, and `assets/LEDGER.md` only. No extraction, `assets/processed/`, layer contracts, `src/`, specs, reviews, e2e, or commits.

## Inputs read

- `specs/epoch-saga/e9-redfields-bundle.md` era thesis, palette note, terrain/props, and building manifest.
- `lore/story-arc.md` E8 reset-ache to E9 payoff.
- `docs/GOLD_RUSH_BRIEF.md` art direction and canon guardrails.
- `assets/LEDGER.md` current E9 rows.
- `assets/raw/kit-valley-master.png` as Frontier Ledger style and E1 riverbank green swatch reference only.
- `assets/raw/plate-e9-bld-canal-works.png`, `assets/raw/codex-hero-e9-outfit.png`, and `assets/raw/codex-prospector-e9.png` as E9 design-language references.

## Superseded

- `assets/raw/kit-era-9.png` from codex-art-run-023 was moved to `assets/raw/kit-era-9-valley-superseded.png`.
- Supersession reason: that plate carried the home-valley/E8 continuity geography forward. E9 is design-locked as a dead red world/new planet, not the valley turned red.

## Output landed

- `/Users/robin/Claude/Projects/Gold Rush/assets/raw/kit-era-9.png`
  - source: `/Users/robin/.codex/generated_images/019f4bde-e2a6-7150-ac40-3618240a9923/call_kGwPPIk9ZCYgBboYonxY3O0e.png`
  - dimensions: 1672x941 RGB
  - purpose: E9 Red Fields establishing plate, true new-world endpoint.

## Prompt summary

The prompt requested a brand-new Red Fields world establishing plate: rust-red engraved dunes over parchment, vast alien sky with two small moons or a thin sun, small warm-lit dome settlement, canal cuts across dunes, an ice quarry rig, canal works with gates/locks and a dry water-wheel, stage-1 Ark scaffold, hatch-spiral dust devils, survey cairns, and the first wet canal segment with E1 riverbank green spreading along it.

Avoid list: no recognizable home-valley landmarks, no S-curve river, no wooden palisade town, no rails, no train, no stamp mill, no lighthouse, no harbor, no rocket, no mass-driver, no Earthlike river valley, no firearms, no gore, no readable text, no letters, no numbers, no logos, no watermark.

Style anchor:

> Antique frontier expedition ledger map, Wild-West survey map fine sepia engraved linework and hatching, subtle aged-paper texture underneath, muted warm colors, illustrated, not photorealistic, not saturated.

## Measured QA

Green swatch measurement used a `pngjs` green-mask over muted riverbank/canal greens. The generated green was then shifted locally inside that mask to match the E1 sample more tightly.

| File | Green-mask pixels | Mean RGB | Median RGB |
|---|---:|---:|---:|
| `kit-valley-master.png` | 887 | `79.9,102.6,76.0` | `78,98,69` |
| `kit-era-9.png` retake | 1100 | `80.7,103.5,76.5` | `79,104,75` |

Visual QA:

- Red-world/new-planet read: PASS.
- No home-valley landmarks: PASS. No S-curve river, rails, train, stamp mill, lighthouse, harbor, rocket, mass-driver, or old river topology.
- Required E9 elements: PASS. Alien sky, small warm domes, ice quarry rig, canal works/dry water-wheel, canal lines, first wet segment, green spread, hatch-spiral dust devils, Ark scaffold.
- Canon guardrails: PASS. No visible readable text, firearms, or gore.
- Dimensions/color mode: PASS. 1672x941 RGB.

## Side-by-side review

| Superseded valley endpoint | Retake Red Fields endpoint |
|---|---|
| `assets/raw/kit-era-9-valley-superseded.png` | `assets/raw/kit-era-9.png` |

The superseded plate preserves the valley/E8 infrastructure with rails, harbor, rocket/launch works, lighthouse, and broad water geography. The retake removes that continuity geography and establishes a separate red planet with a small new settlement, canal works, quarry, Ark scaffold, dust-devil horizon, and a measured E1-green wet segment.
