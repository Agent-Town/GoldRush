# Audio harshness — before and after

SIMULATED, 60 seconds per scenario, fixed RNG seed 20260928. Before is the original review method re-run on base `80ba31fd110e504e4e06e87c1aa41659329c5e6a`; after uses the normalized MP3s and the new gain chain. All arrows are before → after.

| Scenario | SFX LUFS | SFX minus music LU | SFX energy >2 kHz | Mix peak default dBFS | Mix peak maximum dBFS |
|---|---:|---:|---:|---:|---:|
| early-rig | -27.6 → -28.5 | +2.6 → +1.7 | 68.2% → 28.4% | -8.12 → -12.45 | -3.18 → -5.13 |
| early-blast | -25.3 → -28.5 | +4.9 → +1.7 | 45.1% → 33.3% | -8.30 → -11.23 | -2.66 → -5.51 |
| late-rig | -26.0 → -27.3 | +4.2 → +2.9 | 67.9% → 24.9% | -8.28 → -11.23 | -4.21 → -5.21 |
| late-blast | -24.9 → -26.9 | +5.3 → +3.3 | 55.1% → 28.5% | -8.31 → -10.90 | -3.82 → -5.24 |

Music bus: −30.2 LUFS at defaults, −19.2 LUFS at maximum, unchanged to the measurement precision. No samples over full scale in any of the 16 before/after renders. The early Spark Rig gate passes: +1.7 LU (limit +2), 28.4% above 2 kHz (limit 45%). Late scenarios remain +2.9/+3.3 LU; the specified balance gate is the early Spark Rig scenario.

## Method and limits

- Original `measure.py` is unchanged except input/output paths. The same ffmpeg ebur128 and FFT methods are used before and after.
- `simulate.py` retains event rates, governors, priority, seed and the review’s assumptions. After-mode reads the new manifest, adds 5ms voice and 30ms bus/loop ramps, one-second music entrance, and the equivalent −3 dB/4 kHz high shelf.
- Building distances are explicit assumptions: the early turret is 25 m away; the ten late buildings are 15–60 m away in 5 m steps. Falloff is 1 within 10 m, linear to 0.35 at 60 m, clamped thereafter. Hero shots retain scale 1. Hits and gameplay rates are unchanged.
- Maximum uses master/music 1.0 and a victory sting at 30 seconds, as in the review. Each scenario is 60 seconds, so it does not reach an E1 music wrap. Actual Web Audio crossfades are measured separately in `runtime-checks.json`.
- Offline results are a controlled mix model, not a recording of browser gameplay. The owner’s listen remains the balance acceptance.

## Listen

- [Before, first 30 seconds](listen-before.ogg)
- [After, first 30 seconds](listen-after.ogg)

OGG/Opus, stereo 48 kHz, 96 kb/s. No separate playback normalization: the files retain the simulated default mix level.

## Reproduction

Install Python numpy and ffmpeg (verified here: ffmpeg 8.1.2). Extract base `assets/audio/raw/*.mp3` into `scratch/before/`. Run these from the repository root; raw WAVs remain ignored in scratch:

```sh
python3 artifacts/audio-harshness-1/normalize.py
GR_RAW="$PWD/artifacts/audio-harshness-1/scratch/before" GR_OUT=measurements-before.json python3 artifacts/audio-harshness-1/measure.py
GR_OUT=measurements-after.json python3 artifacts/audio-harshness-1/measure.py
GR_RAW="$PWD/artifacts/audio-harshness-1/scratch/before" GR_RENDER_DIR="$PWD/artifacts/audio-harshness-1/scratch" GR_OUT=simulation-before.json python3 artifacts/audio-harshness-1/simulate.py
GR_AFTER=1 GR_RENDER_DIR="$PWD/artifacts/audio-harshness-1/scratch" GR_TAG=after GR_OUT=simulation-after.json python3 artifacts/audio-harshness-1/simulate.py
```

Repeat both simulations with `GR_MASTER=1 GR_MUSIC=1 GR_VICTORY=1`, distinct `GR_OUT`/`GR_TAG`. `normalize.py` replays and verifies the recorded two-pass recipes into scratch and asserts byte equality with every shipped one-shot; it does not overwrite the shipped files. Run `node artifacts/audio-harshness-1/check-audio.mjs` against the development server on 5188 for the plain boots, fades, distance curve and four offline Web Audio seam checks.
