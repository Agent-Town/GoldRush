# Drain review: `audio-harshness-1`, the sound stops being spiky (normalized assets, a simulated re-balance, ramps, fades, seam-free loops); the owner's listen decides keep or revert

**Branch** `sol/wave-lane-b` at `488a95c4d` · **merge** `e277f077d` · engine hash #74 `99920310` · drained attended 2026-09-28 13:57Z in a detached chain worktree with the scratch store at `5793a96`; deployed (scripts/attended/land.sh, config `ahr1`).

**Verdict: LANDED.**

**Slice / branch / tip:** `audio-harshness-1`, lane-b `sol/wave-lane-b`, five commits (`53fb39384`, `106854327`, `7da46910b`, `4fcced309`, `488a95c4d`), Astra gpt-6-astra, 168,590 tokens, 2026-09-28 12:39Z to 13:01Z. Attended pinned landing under `land-held.sh`, owner absent: the change is reversible (one revert landing), measured against the review's own targets, and inside the owner-commissioned review's ranked recommendations (ranks 2 to 4); the owner's listen decides keep or revert (F-AUD-15 on the desk).

**What it does.** From `reviews/audio-review-1.md` (Opus 5.5 at the owner's word, 2026-09-28: the music and effects "were quite harsh"). Forty-one one-shot mp3s under `assets/audio/raw/` are loudness-normalized in place to the LEDGER's -14 LUFS integrated target with a -1 dBTP ceiling (two-pass `loudnorm`, reproducible by the committed `normalize.py`; git keeps every previous version). The manifest volumes are then set against that target by re-running the review's `simulate.py`: the spark and turret shots lower, the four loud cues (victory, defeat, palisade collapse, chirp-refuse) about 6 LU quieter, the two hit sounds lifted to within 2 LU of the music, the shot pitch spread widened. `SoundSystem` gains a gentle high-shelf on the SFX bus, an optional gain scale on `play()` that the beacon and turret call sites use to attenuate building shots by distance from the hero, ramped gain writes, music fade-in and fade-out, and seam-free loops through two alternating sources crossing the file's measured tail. No limiter (the review measured no clipping); no music file content changed; no gameplay or sim value changed.

**Evidence (real numbers, from the task's re-run of the review's simulation).**

| Scenario | SFX LUFS | SFX minus music LU | SFX energy above 2 kHz | Mix peak default dBFS | Mix peak maximum dBFS |
|---|---:|---:|---:|---:|---:|
| early Spark Rig | -27.6 → -28.5 | +2.6 → +1.7 | 68.2% → 28.4% | -8.12 → -12.45 | -3.18 → -5.13 |
| early Blast Charge | -25.3 → -28.5 | +4.9 → +1.7 | 45.1% → 33.3% | -8.30 → -11.23 | -2.66 → -5.51 |
| late Spark Rig | -26.0 → -27.3 | +4.2 → +2.9 | 67.9% → 24.9% | -8.28 → -11.23 | -4.21 → -5.21 |
| late Blast Charge | -24.9 → -26.9 | +5.3 → +3.3 | 55.1% → 28.5% | -8.31 → -10.90 | -3.82 → -5.24 |

| Check | Result |
|---|---|
| Normalized assets | 41 of 41 reproduced byte-for-byte by `normalize.py`; LEDGER entry added |
| The four loud cues | about 6 LU quieter; the two hits within 2 LU of the music |
| Listen clips | `artifacts/audio-harshness-1/listen-before.ogg` (377,450 B), `listen-after.ogg` (355,155 B): 30 s of the early Spark Rig scenario |
| Audio suites, both projects, `--workers=1` | 48 of 50: 050 8/8, 051 8/8, mu-02 6/6, mu-03 6/6, music-survives-pause 2/2, audio-music-toggle 10/10, audio-integration 8/10 |
| The two reds | `audio-integration.spec.ts:80` ("settings volume and mute persist across reload"), both projects: the test clears all storage and then clicks a `start-menu-settings` control the first-boot card no longer has; reproduced against the exact pre-task source and assets (pre-existing on main), recorded as F-AUD-16 |
| tsc / build / plain boots | green; six plain boots with zero console and page errors |
| Evidence budget | 968,650 B added, inside the 25 MB task budget and the 40 MB ceiling |
| tsc / release build / payload / halo / null floors / release suite / the nine specs / ledger battery / pin | measured by this landing's gates (see the gates log) |

**Merge classification.** Base: main at the chain cut. Lane-touched: `src/audio/manifest.ts`, `src/audio/SoundSystem.ts`, `src/systems/CombatSystem.ts` and `src/systems/BuildSystem.ts` (the gain scale on the shot sounds only), `assets/audio/LEDGER.md`, 41 `assets/audio/raw/*.mp3`. New: `artifacts/audio-harshness-1/**`. `src/**` and assets changed: `hash: pin`, measured last. Conflicts: none expected; the toolkit records any.

**Findings.**
- **F-AUD-1, F-AUD-2, F-AUD-3, F-AUD-4, F-AUD-6 (code half) addressed by this landing;** F-AUD-6's file half (re-editing the loops) and F-AUD-5/7 (variation, lengths, new pieces) stay the owner's (F-AUD-13, F-AUD-14).
- **F-AUD-15 (owner's desk):** listen to the before and after clips and say keep or revert; a revert is one landing.
- **F-AUD-16 (recorded):** `e2e/audio-integration.spec.ts` still expects a `start-menu-settings` control on a cleared first boot; the first-boot card has none (the review's F-AUD-9 gave it the music toggle instead). Pre-existing on main; a scoped fix (the test or a first-boot Settings route) is owed.
- **The allowed row** is that pre-existing red only; nothing else was excused.

### Evidence (this drain's gates on the merged tree)
| Check | Result |
| --- | --- |
| tsc / build / e1 | `0 / 0 / 0` |
| strict release build (the assertion) | `(strict, the assertion): rc=0 [release-build] E1-only: 1128 files, 97732997 bytes, zero later manifest ids or plate/GLB assets (checked against 283 later-asset stems)` |
| first-town payload | `34355296 bytes` |
| halo | `rc=0 halo re-extraction PASS: 315 cured, 0 held, 760 regenerated-and-cured, 2127 scanned; alpha and opaqu` |
| null floors | `rc=0 83 of 83 null floors match assets/contracts/null-floors.json (310.7s).` |
| law-pointer | `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 137 ℹ fail 0` |
| the ledger battery | `rc=0 ℹ tests 1263 ℹ pass 1260 ℹ fail 0 ℹ skipped 3` |
| the release suite under its own config | `(own config): rc=0   30 passed (2.3m)` |
| e2e both projects, --workers=1 | `rc=1   2 failed   72 passed (5.7m)  13:37Z` |
| full npm run test:node-guards (before the pin) | `rc=1 ℹ tests 4 ℹ pass 3 ℹ fail 1 ℹ skipped 0 ℹ tests 5 ℹ pass 4 ℹ fail 1 ℹ skipped 0 ℹ tests 1040 ℹ pass 1032 ℹ fail 3 ℹ skipped 5  13:57Z` |
| engine hash | `merged: 999203109481b7906b00e957ee739ca015b05a692201f039b4a3062a2f344bd4 (pinned cd76fd088099119c9233e6ac50b2319fa07611ae1955082110b5043f2c7458f9)` |
