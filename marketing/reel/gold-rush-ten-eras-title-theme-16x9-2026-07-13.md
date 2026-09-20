# Gold Rush — Ten Eras / Title Theme Film

Status: **DRAFT — owner review required; not published**

## Deliverable

- Film: `gold-rush-ten-eras-title-theme-16x9-2026-07-13.mp4`
- Purpose: landscape master for X and review playback
- Runtime: `60.000 s`
- Picture: H.264, `1280x720`, `24 fps`, `yuv420p`, web-fast-start
- Sound: AAC stereo, `44.1 kHz`, `192 kb/s`

## Editorial construction

1. `00:00.000–00:05.000` — branded opening over the first-era valley: official pan-and-survey-rod emblem, **GOLD RUSH**, “AN AGENT TOWN TALE,” and “TEN ERAS. ONE CLAIM.” The card fades to black over its final `0.700 s`.
2. `00:05.000–00:50.583` — the complete, unobstructed ten-era picture master with short fade-through-black handoffs. A clean neighboring-frame sky patch replaces the source's generated “MOON CLAIM” text only during its brief appearance.
3. `00:50.583–01:00.000` — closing card over the final deep-sky settlement: **GOLD RUSH**, the canon title thesis “THE GOLD RUSH WAS NEVER ABOUT THE GOLD.”, and “AN AGENT TOWN TALE.” It fades up over `0.600 s` and resolves to black during the final second.

The display lockups use Rye; supporting copy uses Wellfleet, following `docs/GOLD_RUSH_BRIEF.md` §4.3. The reel deliberately has no persistent logo bug: the opening and closing cards carry the identity while every era plate keeps the full frame.

## Source lock

| Role | Source | SHA-256 |
|---|---|---|
| Ten-era picture master | `marketing/raw/gen/the-ten-eras-reel.mp4` | `c0dc3d0094e0a3115d3dab9db6f80bf35b13dcb0894b280bc32f0d4e2906e628` |
| Sole soundtrack | `assets/audio/raw/title-theme.mp3` | `e18231d418648a8ab978a59e66d86f60ef5194ffba979a9a15397545a23e72f8` |
| Brand emblem | `assets/processed-full/ui-title-emblem.png` | `511bb49e9a8d9a950c4c2aea7625afa9cd380e2b09623491b84a30b3c300881c` |
| Rye Regular render font | Google Fonts Rye Regular | `b7edee5e615ae1b6b07e9d030c1309152bf3672a0e8a2a46293e273730f5adba` |
| Wellfleet Regular render font | Project brand-kit Wellfleet Regular | `347f3918762c7b61c3b98d57071b03295485bc97b6bfb6c7627bcf365cc3c9e7` |

**Audio law:** the ten-era source reel's existing AAC track was discarded. The export maps only `assets/audio/raw/title-theme.mp3`; it contains no source-reel audio, replacement score, voice-over, or sound-effects mix. The title theme has a `1.2 s` fade-in, a `2.67 s` fade-out, and a fixed `-2.9 dB` gain pass.

## Acceptance evidence

- Full-file FFmpeg decode: clean; no video or audio decode errors.
- Stream count: one H.264 video stream and one AAC audio stream.
- `npm run build`: green (existing chunk-size warning only).
- Measured programme loudness: `-14.0 LUFS-I`; true peak: `-2.9 dBFS`; LRA: `5.5 LU`.
- Output SHA-256: `acd87fc36df7f310c18d8e1c0b805e643e371c339248b157fe6079be9dc29a75`.
- Visual review samples cover the opening card, both fade-through-black handoffs, early/middle/late eras, the generated-text cover area, closing card, and final fade.
- Independent visual critique caught doubled branding during the first-pass dissolves, an edge-cramped persistent plaque, and an insufficient terminal-black sample. The accepted cut uses clean fade-through-black handoffs, removes the persistent plaque, enlarges supporting copy, replaces only the generated-text interval with a clean source-frame patch, preserves the source's intrinsically dense Era 7 artwork without softening it, and holds true black at the end.
- Fresh final visual gate: **ACCEPT**, confidence `0.90`, no blockers. It found no ghosted branding, generated-text leakage, patch seam, unsafe title placement, or residual imagery in the black seam and terminal frame.
- Publication remains owner-gated under the marketing outbox law.
