# Audio harshness 1 — implementation and proof

READY-FOR-GATES — four implementation items complete; numeric/audio runtime gates pass. The requested adjacent battery is **48 passed / 2 pre-existing failures**, not unqualified green. Both failures reproduce against the exact pre-task source and assets. Owner listening and the orchestrator's integration gates remain.

Base: `a7410b05aa12b25f8e11aab1ba8065d8c3265d83`. Lane: `sol/wave-lane-b`. This is an **engine-pinned landing: `src/**` and `assets/audio/raw/**` changed**. The owner's listen is acceptance of the balance; the numbers are the gate.

## Pre-flight

- `git log --oneline main | grep -q 'audio-music-toggle-1'` passed; prerequisite merge `176aff07c` was already on local main.
- Initial lane `425f29fe2` was an ancestor of main, with zero ahead commits; no undrained work. Reset to current local main `a7410b05a` as authorized.
- Only untracked `logs/guard-stats.jsonl` existed; expected factory churn, retained untouched. No initial evidence discarded.
- `npm install --no-audit --no-fund` exited 0. It removed libc metadata from package-lock; restored only that generated lockfile churn. Baseline `npm run build` exited 0. Post-preflight status contained only the expected log.

## Changes and adaptations

1. **Normalize/rebalance — `53fb39384`.** All 41 one-shots passed decoded loudnorm −14 LUFS ±0.25 LU and ≤−1 dBTP (range −14.22 to −13.75; worst peak −1.14). MP3 sample rates, channels and bitrates retained. All 15 loop files, including the four music tracks, are byte-identical to base. One ledger entry added. Manifest levels now target that common loudness, both shot volumes are 0.055, and shot pitch variance is 9%. Four loud cues measure 5.93–6.14 LU quieter at their loudest moment (`cue-levels.json`). The two hits now measure −32.0 and −30.3 LUFS versus −30.2 LUFS music, both within 6 LU.

   Several short, high-crest cues could not simultaneously hit the loudness and peak targets with scalar gain or unconditioned loudnorm. Their recorded offline recipes reduce crest before the two loudnorm passes; spark-bolt-hit also removes sub-80 Hz/DC energy before soft clipping. This processing is offline, **not a runtime master limiter**. Short cues repeat only for analysis, then trim to their original decoded duration. Five re-encoded cues decode 28.6–32.4 ms shorter (demolish, palisade-crack, pan-swish, slot-save-confirm, tier-up); all other one-shot decoded lengths match to 0.1 ms. Exact processing is recorded in `normalization.json`. `normalize.py` replays every recipe into ignored scratch and verified **41/41 byte-identical** outputs (`normalization-replay.json`).

2. **Darken/place — `106854327`.** Native Web Audio high shelf on SFX only: −3 dB at 4 kHz. Optional clamped gain scale on `play()`/`playShot()`. Building shots are full within 10 m, then fall to 0.35 at 60 m. In the actual current source, beacon shots already use CombatSystem's shared bolt path; the task's old BuildSystem sound call no longer exists. Therefore **CombatSystem alone passes the scale for beacons, turrets and lens turrets**; no redundant BuildSystem call was added. Hero sound scales and all sim/fire/damage values stay unchanged.

3. **Ramp/fade — `7da46910b`.** Gain changes use setTargetAtTime: buses/loop volumes 30 ms, one-shot starts 5 ms. Music gets a separate envelope: ~1 s entrance and ~0.5 s exit. Disposal leaves the AudioContext alive through the fade, then closes it. The real-context check measured envelope 0 → >0.99 after 1.05 s, <0.15 after 250 ms of exit, both sources ended around 0.5 s; disposal transitions running → closed after the fade. No e2e assertion needed changing.

4. **Loop seams — `4fcced309`.** Two alternating one-shot AudioBufferSources crossfade on the audio clock over each measured 1–3 s tail, excluding its 85–490 ms trailing gap. The first pass starts at offset zero. The next pass is scheduled a full stride ahead by the preceding pass's ended event; ordinary timer jitter does not schedule the seam itself. Pending sources are also stopped on toggle/disposal, and their nodes disconnect on end. Actual OfflineAudioContext renders of the four shipped tracks have minimum seam-window 100 ms RMS −24.2 / −25.7 / −26.4 / −28.2 dBFS, all above the review's −40 dBFS gap threshold (`runtime-checks.json`). Music content is untouched.

## Before/after

| Scenario | SFX LUFS | SFX minus music LU | SFX energy >2 kHz | Mix peak default dBFS | Mix peak maximum dBFS |
|---|---:|---:|---:|---:|---:|
| early-rig | -27.6 → -28.5 | +2.6 → +1.7 | 68.2% → 28.4% | -8.12 → -12.45 | -3.18 → -5.13 |
| early-blast | -25.3 → -28.5 | +4.9 → +1.7 | 45.1% → 33.3% | -8.30 → -11.23 | -2.66 → -5.51 |
| late-rig | -26.0 → -27.3 | +4.2 → +2.9 | 67.9% → 24.9% | -8.28 → -11.23 | -4.21 → -5.21 |
| late-blast | -24.9 → -26.9 | +5.3 → +3.3 | 55.1% → 28.5% | -8.31 → -10.90 | -3.82 → -5.24 |

All 16 simulated mixes have zero samples over full scale. Early Spark Rig: +1.7 LU ≤ +2 LU; high-frequency share 28.4% <45%. The model's explicit building-distance assumptions and limitations are in [before-after.md](before-after.md). The unchanged 60 s event model does not reach an E1 wrap; seam checks are separate actual Web Audio renders.

Listen: [before](listen-before.ogg), **377,450 bytes**; [after](listen-after.ogg), **355,155 bytes**. Both 30 seconds, OGG/Opus 96 kb/s, under 1 MB; no additional loudness matching. These are the early Spark Rig default mix.

## Verification

- `npx tsc --noEmit`: exit 0. `npm run build`: exit 0, including asset diet. Existing Vite large-chunk/config warnings and asset-diet UV/tier warnings remain.
- All seven requested suites, both desktop-chrome and mobile-chrome, `--workers=1`: exit 1; **48 passed, 2 failed** in 4.6 minutes. Per project: 24 passed / 1 failed. Assertions unchanged.
- `050-audio-mix-and-access`: 8/8; `051-audio-governor`: 8/8; `mu-02-music`: 6/6; `mu-03-era-audio`: 6/6; `music-survives-pause`: 2/2; `audio-music-toggle`: 10/10; `audio-integration`: 8 passed / 2 failed.
- **Attributed adjacent red:** `audio-integration.spec.ts:80`, “settings volume and mute persist across reload”, times out at line 89 clicking absent `start-menu-settings`. The test clears all storage; the current first-boot profile form has no such Settings button. The page snapshot is in `adjacent-error-context.md`. Restored **all changed source and raw assets to the base commit**, ran the unchanged named test on both projects with one worker: **2/2 reproduce**, exit 1 (`control-e2e.log`). Restored candidate source/assets afterward and rechecked TypeScript. No out-of-firewall UI/test fix attempted.
- Six plain boots (menu, town, run × desktop/390 px) on the candidate: **zero console errors and zero page errors**, with each actual scene awaited. Normal menu/town routes and `?seed=audio-plain` run; no debug flag.
- Candidate-specific checks: real AudioContext fades/disposal and distance falloff; four OfflineAudioContext seam renders; 41 byte-identical normalized-asset replays; cue balance assertions. All exit 0.
- Generated screenshots from the adjacent suites were restored, not included: `artifacts/050/{desktop,mobile}-chrome-{mute-toast,pause-audio-settings}.png`; `artifacts/audio-music-toggle-1/{hud,town}-{desktop,mobile}-chrome.jpg`. No authored outside-scope edits remain. Scratch WAVs, original copies and replay files are ignored locally.

Commands and full test logs are retained in this directory. `verification.json` holds exit codes and asset/listen byte checks. Evidence budget is recorded below for this complete landing.

## Changed engine/asset paths

- `src/audio/manifest.ts`
- `src/audio/SoundSystem.ts`
- `src/systems/CombatSystem.ts`
- `assets/audio/LEDGER.md` (one normalization entry)

Normalized MP3s (all under `assets/audio/raw/`):

- `assets/audio/raw/agent-works.mp3`
- `assets/audio/raw/baron-arrival-sting.mp3`
- `assets/audio/raw/baron-defeat-fanfare.mp3`
- `assets/audio/raw/blast-charge-arm.mp3`
- `assets/audio/raw/blast-charge-boom.mp3`
- `assets/audio/raw/build-place.mp3`
- `assets/audio/raw/chirp-acknowledge.mp3`
- `assets/audio/raw/chirp-refuse.mp3`
- `assets/audio/raw/defeat-sting.mp3`
- `assets/audio/raw/demolish.mp3`
- `assets/audio/raw/dredge-queen-arrival-horn.mp3`
- `assets/audio/raw/epoch-door-sting.mp3`
- `assets/audio/raw/founding-stamp-thunk.mp3`
- `assets/audio/raw/gold-chime.mp3`
- `assets/audio/raw/homemaker-done-chime.mp3`
- `assets/audio/raw/invalid.mp3`
- `assets/audio/raw/ledger-open.mp3`
- `assets/audio/raw/menu-tap.mp3`
- `assets/audio/raw/old-digger-tape-swap.mp3`
- `assets/audio/raw/palisade-collapse.mp3`
- `assets/audio/raw/palisade-crack.mp3`
- `assets/audio/raw/palisade-hit.mp3`
- `assets/audio/raw/pan-swish.mp3`
- `assets/audio/raw/research-pick-sting.mp3`
- `assets/audio/raw/research-pick.mp3`
- `assets/audio/raw/save-tick.mp3`
- `assets/audio/raw/sign-in-chime.mp3`
- `assets/audio/raw/slot-save-confirm.mp3`
- `assets/audio/raw/spark-bolt-fire.mp3`
- `assets/audio/raw/spark-bolt-hit.mp3`
- `assets/audio/raw/stockpile-deposit.mp3`
- `assets/audio/raw/t4-first-wave.mp3`
- `assets/audio/raw/t4-wind.mp3`
- `assets/audio/raw/t5-surfacing.mp3`
- `assets/audio/raw/t5-winch-rhythm.mp3`
- `assets/audio/raw/tier-up.mp3`
- `assets/audio/raw/town-enter-chime.mp3`
- `assets/audio/raw/turret-fire.mp3`
- `assets/audio/raw/victory-sting.mp3`
- `assets/audio/raw/wave-start-horn.mp3`
- `assets/audio/raw/wind-gust.mp3`

No changes to settings/toggle surfaces, BuildSystem, e2e assertions, gameplay values, music files, specs, tasks or reviews.

## Remaining list in order

1. Orchestrator adjudicates the two reproduced adjacent failures; fixing the first-boot Settings test/surface requires a separately scoped task. The seven-suite request cannot honestly be called wholly green.
2. Owner listens to the before/after clips and accepts the balance.
3. Orchestrator performs engine-pinned integration/release gates.

## Evidence budget

Evidence budget: **968650 bytes** added under the measured evidence prefixes, below the task’s 25,000,000-byte limit. Measured with `node scripts/evidence-budget.mjs a7410b05aa12b25f8e11aab1ba8065d8c3265d83 HEAD --limit 25000000 --json`. The stock script counts `artifacts/` and `reviews/shots-`, not assets; separately, normalized MP3 positive growth is **0 bytes**, net **−2,508 bytes**. Therefore the combined evidence-plus-positive-asset-delta budget is the same number. Scratch files are ignored and excluded.
