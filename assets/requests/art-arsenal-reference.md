# art-arsenal-reference — Epoch arsenal reference plates

Date: 2026-07-10
Task: `/Users/robin/Claude/Projects/Gold Rush/tasks/running/art--20260710-144245-art-arsenal-reference.md`
Mode: Codex built-in image generation
Tier: raw reference plates only; no extraction or runtime integration

## Style Anchor

Antique frontier expedition ledger map, style of a Wild-West survey map: fine sepia engraved linework and hatching, subtle aged-paper texture underneath, muted warm colors, illustrated, not photorealistic, not saturated.

## Deliverables

| File | Era | Retakes | QA |
|---|---:|---:|---|
| `assets/raw/plate-arsenal-e1.png` | E1 Founding | 0 | PASS: pan present, frontier tools, teal/brass inventions, no firearms, no readable text |
| `assets/raw/plate-arsenal-e2.png` | E2 Steamworks | 0 | PASS: pan present, sky-rocket battery reads as festival/science rig, gauges have no numerals, no firearms |
| `assets/raw/plate-arsenal-e3.png` | E3 Voltage | 1 | PASS: retake removed letter/number-like border marks; pan present, arc-gap/coils/linesman tools, no firearms, no text |
| `assets/raw/plate-arsenal-e4.png` | E4 Motor | 0 | PASS: pan present, grapple-chains/pumps/grader tools, no firearms, no text |
| `assets/raw/plate-arsenal-e5.png` | E5 Deepwater | 0 | PASS: pan present, dive-bell tools and utility line/anchor gear, no gore/firearms/text; width normalized 1671->1672 |
| `assets/raw/plate-arsenal-e6.png` | E6 Atomic | 1 | PASS: retake removed pistol-like scanner and label; pan present, tongs/vacuum/safety tools, no text/firearms |
| `assets/raw/plate-arsenal-e7.png` | E7 Signal | 1 | PASS: retake removed signature-like parchment marks; pan present, relay kit, no text/firearms; width normalized 1671->1672 |
| `assets/raw/plate-arsenal-e8.png` | E8 Orbital | 0 | PASS: pan present, Moon claim gear, suit-air/tether/survey tools, no text/firearms |

Contact sheet: `assets/contact-sheets/art-arsenal-reference-8up.png`

## Prompt Notes

Every prompt required:

- the style anchor above;
- museum-plate composition, kit laid out on parchment like a surveyor's equipment board;
- pictogram-only or no labels, with no letters, words, numbers, logos, captions, signatures, or watermarks;
- the brass gold pan as the through-line object;
- warm brass and muted teal agent-tech;
- no firearms, bullets, gore, people, or military silhouettes.

## QA Notes

All final raws identify as 1672x941 PNGs. E5 and E7 were generated at 1671x941 and normalized by centered extent to 1672x941, matching the existing saga-library width-normalization precedent. E3 was retaken after contact-sheet review because the first pass had border marks that read too close to letters/numbers. No processing, processed outputs, layer contracts, source, specs, reviews, e2e tests, or runtime registrations were touched.
