# Codex Art Run 001

Date: 2026-07-05
Tool path: Codex built-in `image_gen`
Model reported: not exposed by the built-in tool output; task target was `gpt-image-2`
Output folder reported by tool: `/Users/robin/.codex/generated_images/019f3069-a9b1-7121-9f23-461ba9b79470`
Limit events: none observed

## A. Hero rotation completion

Batch file: `assets/requests/batch-005R2.md`
Target: `assets/raw/char-hero-sheet-rotation2.png`
Saved source: `ig_00fcf45cc5734f59016a49d5bf894881919fd1483a17329445.png`
Size: 1254x1254 PNG
References used: yes, via local image inspection/context:
- `assets/raw/char-hero-sheet-rotation.png`
- `assets/raw/char-hero-sheet-front.png`
Regenerations: 0

QA verdict:
- Sheet/grid: pass, 4 cols x 2 rows, 8 equal cells.
- Background: pass, uniform magenta key visually acceptable.
- Text/borders: pass, no text, labels, watermarks, or grid borders.
- Consistency: pass, same hero identity, teal chest lantern, brass pan, and scale across cells.

Cell verdicts, map order:
1. Pass - south-west walk, left foot forward.
2. Pass - south-west walk, right foot forward.
3. Pass - pure side profile facing right, left foot forward.
4. Pass - pure side profile facing right, right foot forward.
5. Pass - north-west walk away, left foot forward.
6. Pass - north-west walk away, right foot forward.
7. Pass - idle pure right side profile.
8. Pass - idle pure left side profile.

## B. Claim-jumper full rotation

Batch file: `assets/requests/batch-005R3-bandit-rotation.md`
Target: `assets/raw/char-jumper-sheet-rotation.png`
Saved source: `ig_0a4b6c883f0ae5cb016a49d6f245e88191be529175971b0ef4.png`
Size: 1254x1254 PNG
References used: yes, via local image inspection/context:
- `assets/raw/char-jumper-sheet-front.png`
- `assets/raw/char-jumper-sheet-back.png`
Reference missing as expected: `assets/raw/char-jumper-sheet-rotation.png` did not exist before this run.
Regenerations: 1

First pass:
- Source: `ig_0a4b6c883f0ae5cb016a49d6a435fc8191aa7e88bcf96ea71a.png`
- Verdict: failed cell-order QA because cells 5-8 had the right/left side-profile pairs reversed.

Retry QA verdict:
- Sheet/grid: pass, 4 cols x 3 rows, 12 equal cells.
- Background: pass, uniform magenta key visually acceptable.
- Text/borders: pass, no text, labels, watermarks, or grid borders.
- Consistency: pass, same claim-jumper identity, rust poncho, hat, bandana, gloved hands, no weapons, and stable scale.

Cell verdicts, map order:
1. Pass - sneak-walking toward viewer, left foot forward.
2. Pass - sneak-walking toward viewer, right foot forward.
3. Pass - south-east walk, left foot forward.
4. Pass - south-east walk, right foot forward.
5. Pass - pure side profile facing screen right, left foot forward.
6. Pass - pure side profile facing screen right, right foot forward.
7. Pass - pure side profile facing screen left, left foot forward.
8. Pass - pure side profile facing screen left, right foot forward.
9. Pass with note - walking away angled north-east/right; angle is slightly shallow but usable after the allowed retry.
10. Pass with note - north-east/right, right foot forward; angle is slightly shallow but usable after the allowed retry.
11. Pass - walking straight away from viewer, left foot forward.
12. Pass - sneaking crouch idle facing viewer.

## C. Building portraits bonus

Batch file: `assets/requests/batch-005B.md`
References used: no, prompt-only batch.
Shared size: 1254x1254 PNG
Shared QA note: all four match the Frontier Ledger cutout style, contain no text/watermarks, and avoid firearm content. The gray backgrounds have mild generated falloff rather than a perfectly flat sampled fill; keep that in mind before standard gray-key extraction.

Portrait verdicts:
- `assets/raw/bld-palisade.png` - pass, rough two-post/three-plank timber wall with rope lashings. Source: `ig_085a1461bca9d7d3016a49d776d2888191a230a45fb07ee661.png`.
- `assets/raw/bld-sluice-works.png` - pass, wooden sluice trough, trestles, small water-wheel, riffles, restrained gold glints. Source: `ig_0a81f74212162356016a49d7effdb88191b9808b8d879bc772.png`.
- `assets/raw/bld-stockpile-yard.png` - pass, crates and sacks on a pallet, prosperity not greed. Source: `ig_0dff15b17753f346016a49d84e41448191aeb9a10d917f40e5.png`.
- `assets/raw/bld-signal-turret.png` - pass after one retry, teal lantern signal mast with ring/halo silhouette, no gun/cannon/barrel form. Final source: `ig_081e57f7170fec6e016a49d9034e90819198a2a54ccee2357b.png`.

Signal-turret first pass:
- Verdict: rejected because the long horizontal resonator could read as a barrel/cannon silhouette.
- Action: regenerated once with a no-tube/no-barrel signal-mast prompt.

## ART-RUN-COMPLETE

File list:
- `assets/raw/char-hero-sheet-rotation2.png`
- `assets/raw/char-jumper-sheet-rotation.png`
- `assets/raw/bld-palisade.png`
- `assets/raw/bld-sluice-works.png`
- `assets/raw/bld-stockpile-yard.png`
- `assets/raw/bld-signal-turret.png`
- `assets/requests/codex-art-run-001.md`
