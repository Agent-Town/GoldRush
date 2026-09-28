# Audio review 1: harshness, repetition, and turning the music off

Read-only review, Opus 5.5 at max effort, 2026-09-28. Code read at `bc9d86e19`; no audio-relevant file changed through `433f224d5`. Nothing booted, no repo file touched.
Labels: MEASURED (computed from the shipped files), SIMULATED (the SoundSystem mix re-implemented offline, rendered from those files), INFERRED (read in code, not run), UNCERTAIN.

## 1. Verdict

- **Harsh: yes, bright and spiky, not clipping.** With the Spark Rig, 68% of simulated SFX energy is above 2 kHz against 1.9% of the E1 music's; one twang (spark-bolt-fire) carries 70 to 73% of it at up to 264 starts a minute; four cues land 8 to 12 LU above the music's loudest moment. Peaks stay at or below -2.7 dBFS even at maximum settings. The music is dark and quiet; its harsh moments are its seams.
- **Repetitive: yes.** The public E1 build has 2 music tracks. The 90 s E1 loop plays in town and every run, passes 6.7 times per 10-minute run, restarts from bar one at every scene change, and marks each wrap with an 85 ms hole and a click.
- **Quick to disable: no.** No music-only toggle or key exists; M mutes everything, only in a run, only on a keyboard. Music alone takes 3 interactions on desktop and phone (pause, drag Music Volume to 0, resume), with the slider below 10 other blocks of the pause panel. The choice persists per profile.

## 2. What ships today

Each audio owner (menu, town, run, ceremonies, story) builds its own `SoundSystem` and AudioContext (StartMenu.ts:57, TownScene.ts:491, Game.ts:572, CeremonySystem.ts:112, StoryRuntime.ts:35), with an SFX bus (master volume times a voice-count headroom factor) and a music bus (master volume only), both wired straight to the output with no compressor or limiter (SoundSystem.ts:304-307, :528-532). Music is one looping buffer per scene, chosen by epoch alone: the title theme on the menu (StartMenu.ts:86), the era loop in town at a reduced level (TownScene.ts:642-650) and in a run (Game.ts:4897-4913); only the E10 Static and squall ducks ever vary it (Game.ts:4905-4912). Loops start at offset zero and stop with no fades, and leaving a scene closes its context (SoundSystem.ts:361-375, :435-438, :224). One-shots are single samples fired by game events, thinned by interval throttles, a per-sound cap and a global cap with priority eviction (SoundSystem.ts:381-427); they carry no position (SoundSystem.ts:119). Players get a master Volume slider, a Music Volume slider and a Mute checkbox (AudioSettingsControl.ts:15-31) in start-menu Settings, town Settings and the in-run pause panel, plus M for master mute in a run (Game.ts:3017), all stored per profile.

## 3. Evidence

Method: ffmpeg 8.1.2 `volumedetect` and `ebur128=peak=true`; durations cross-checked with `afinfo`; band shares from an energy-weighted numpy FFT. The 44 mp3s in `dist/assets` (E1 release build, 2026-09-27) are byte-identical to `assets/audio/raw` (`cmp`), so these are the files players hear.
In-game level is file loudness plus the gain chain of table (c) at default settings; "vs music" compares with the E1 music's loudest in-run moment, -27.6 LUFS max momentary.

### (a) Music loops (MEASURED)

| Track | Where it plays | Duration ffprobe / afinfo | Mean / max vol dBFS | LUFS / true peak dBTP | Energy above 2 kHz | Gain in game | In-game LUFS | Seam: fade before it; gap below -40 dBFS; first sample | Chroma self-similarity peak (lag; vs baseline) |
|---|---|---|---|---|---|---|---|---|---|
| title-theme | start menu (StartMenu.ts:86) | 59.98 s / 60.00 s | -13.1 / -0.3 | -11.1 / -0.3 | 5.9% | 0.134 | -28.5 | 3 s fade; 465 ms; 0.156 FS | 8.0 s (0.86 vs 0.61) |
| era-e1-frontier-loop | town at x0.7 and every E1 run (TownScene.ts:231, :642-650; Game.ts:4900-4904) | 89.98 s / 90.02 s | -13.5 / -0.4 | -11.7 / -0.4 | 1.9% | run 0.118, town 0.082 | run -30.3, town -33.4 | softer last 3 s; 85 ms (80 ms below -60 dBFS); 0.432 FS, a click | 15.0 s (0.76 vs 0.45) |
| era-e2-steamworks-loop | E2 contracts; not in the E1 release | 120.02 s / 120.06 s | -13.6 / 0.0 | -11.0 / +0.2 | 5.1% | 0.118 | -29.6 | 1 s fade; 180 ms; 0.000 FS | 50.0 s (0.75 vs 0.47) |
| era-e3-voltage-loop | epoch order 3 and up; not in the E1 release | 120.02 s / 120.06 s | -13.0 / -0.4 | -11.1 / -0.4 | 0.9% | 0.118 | -29.7 | 3 s fade; 490 ms; 0.000 FS | 7.5 s (0.64 vs 0.44) |

| Repetition arithmetic | Value | Source |
|---|---|---|
| Music tracks a public player can hear | 2: title-theme, era-e1-frontier-loop | scripts/deploy.sh:108 (`GR_RELEASE` defaults to e1); vite.config.ts:233-236 |
| E1 loop passes per run to wave 20 | 6.7 (a 30 s wave interval) | Balance.ts:76, :827 |
| E1 loop passes per 20 minutes | 13.3 | derived |
| Restarts from bar one | every menu, town and run start, and every run restart | SoundSystem.ts:375; StartMenu.ts:57; TownScene.ts:491; Game.ts:572 |
| Seam depth | more than 27 dB under a -12.9 dBFS body (median 1 s RMS) | MEASURED |
| Extra gap where a decoder ignores the MP3 gapless header | 28 to 42 ms | afinfo minus ffmpeg durations |
| Owner's production lengths | "title 2-3min, era loops 2min+" | specs/music/README.md:2 |

### (b) One-shot SFX: loudest ten and quietest five by max volume (MEASURED file, INFERRED gain chain)

| Sound | Trigger | Max vol dBFS | True peak dBTP | File LUFS | Manifest vol | In-game max momentary LUFS | vs music LU | Energy above 2 kHz |
|---|---|---|---|---|---|---|---|---|
| spark-bolt-fire | every hero Spark Rig and sentry beacon shot (CombatSystem.ts:667; SoundSystem.ts:199-200; BuildSystem.ts:2249) | 0.0 | +2.1 | -10.4 | 0.13 | -26.8 | +0.8 | 90% |
| t5-winch-rhythm (post-E1) | E5 ceremony beat (ceremony/scripts.ts:213) | 0.0 | +0.7 | -10.9 | 0.30 | -22.1 | +5.5 | 15% |
| build-place | building placed (BuildSystem.ts:1071) | 0.0 | +0.4 | -19.2 | 0.42 | -28.7 | -1.1 | 11% |
| victory-sting | claim secured, Baron beaten (Game.ts:1999, :6748) | 0.0 | +0.3 | -7.1 | 0.42 | -15.5 | +12.1 | 13% |
| palisade-crack | palisade hit at low health (SoundSystem.ts:213) | 0.0 | +0.2 | -19.6 | 0.44 | -26.7 | +0.9 | 8% |
| palisade-collapse | building wrecked (SoundSystem.ts:209-210) | 0.0 | 0.0 | -14.3 | 0.50 | -17.5 | +10.1 | 9% |
| defeat-sting | hero died (Game.ts:2003) | -0.1 | -0.1 | -10.9 | 0.42 | -16.4 | +11.2 | 0% |
| invalid | bad placement, gold snatched (BuildSystem.ts:1610; Game.ts:9580) | -0.1 | -0.1 | -24.0 | 0.34 | -35.3 | -7.7 | under 1% |
| demolish | building demolished (BuildSystem.ts:1472) | -0.6 | -0.6 | -19.7 | 0.42 | -26.2 | +1.4 | 15% |
| chirp-refuse | agent refuses an action (Game.ts:2762) | -0.9 | -0.8 | -9.7 | 0.30 | -19.7 | +7.9 | 100%: a 2.1 kHz tone, 0.5 ms attack, cut off at -45 dBFS |
| tier-up | building upgraded (BuildSystem.ts:1416) | -9.2 | -8.7 | -23.7 | 0.38 | -29.6 | -2.0 | 89% |
| gold-chime | every coin; kills at x0.55 (Game.ts:596; CombatSystem.ts:966) | -15.5 | -15.2 | -30.1 | 0.30 | -38.6 | -11.0 | 100% |
| palisade-hit | palisade hit (SoundSystem.ts:214) | -17.9 | -17.9 | -40.0 | 0.38 | -47.6 | -20.0 | 0% |
| research-pick | research node picked (Game.ts:10336) | -19.3 | -18.7 | -31.0 | 0.34 | -40.2 | -12.6 | 72% |
| spark-bolt-hit | every bolt hit (CombatSystem.ts:901) | -30.4 | -30.4 | -55.5 | 0.24 | -67.0 | -39.4 | 51% |

| Asset-wide check | Value | Source |
|---|---|---|
| Loudness target written into every SFX prompt | -14 LUFS | assets/audio/LEDGER.md:6 onward |
| One-shot range (33 in the manifest) | -7.1 to -55.5 LUFS; 6 within 2 LU of target | MEASURED |
| Files at full scale (56) | 12 within 0.1 dB of 0 dBFS; 8 above 0 dBTP | MEASURED |
| Quieter, but never triggered | homemaker-done-chime, dredge-queen-arrival-horn | no call site in `src/` |

### (b2) Stacking (SIMULATED; 60 s each; default settings)

| Scenario | SFX starts per min | spark-bolt-fire starts per min | Dropped or evicted | SFX bus LUFS | Music bus LUFS | SFX minus music LU | SFX max momentary LUFS | SFX energy above 2 kHz | Largest energy share | Mix peak dBFS, default / max settings |
|---|---|---|---|---|---|---|---|---|---|---|
| Early: Spark Rig, one turret | 383 | 120 | 4% | -27.6 | -30.2 | +2.6 | -22.0 | 68% | spark-bolt-fire 73% | -8.1 / -3.2 |
| Early: Blast Charge, one turret | 188 | 0 | 0% | -25.3 | -30.2 | +4.9 | -18.9 | 45% | blast-charge-boom 69% | -8.3 / -2.7 |
| Late: Spark Rig, six beacons, four turrets | 885 | 264 | 58% | -26.0 | -30.2 | +4.2 | -21.4 | 68% | spark-bolt-fire 70% | -8.3 / -4.2 |
| Late: Blast Charge, six beacons, four turrets | 943 | 215 | 52% | -24.9 | -30.2 | +5.3 | -20.5 | 55% | spark-bolt-fire 40% | -8.3 / -3.8 |

| Model input or extra result | Value | Source |
|---|---|---|
| Hero Spark Rig | 2 shots/s | Balance.ts:271 |
| Sentry beacons | up to 6, 1.2 shots/s each | Balance.ts:519, :524 |
| Turrets | up to 4, 1.1 shots/s, x1.35 at top tier | Balance.ts:535, :537, :757 |
| Blast Charge | every 2.5 s; exclusive with the rig | Balance.ts:287; Game.ts:715, :731 |
| Hits, kills, palisade hits | 80% of bolts; 1 kill per 3 hits; 0.2/s early, 1.5/s late | assumption |
| Max-settings renders | master and music at 100%, plus a victory sting | assumption |
| Samples over full scale | 0 in all 8 renders | SIMULATED |
| SFX bus gain in late scenarios | steps about 20/s, up to 2.2 dB, below unity 99% of the time | SIMULATED |
| Governor ceiling for spark-bolt-fire | 300 starts/min (4 voices of 0.8 s) | SoundSystem.ts:18; MEASURED duration |

### (c) Gain constants

| Constant | Value | Where |
|---|---|---|
| Master volume default | 0.8 | settings.ts:63 |
| Music volume default | 0.35 | settings.ts:79 |
| SFX bus gain | master x headroom | SoundSystem.ts:530 |
| Music bus gain | master only; no headroom, no duck under SFX | SoundSystem.ts:531 |
| Headroom factor | 1 up to 6 voices, then sqrt(6/n), floor 0.45 | SoundSystem.ts:20-21, :521-526 |
| Voice caps | 4 per sound; 12 non-music overall; lowest priority evicted | SoundSystem.ts:18-19, :129-133, :402-427 |
| Family intervals | gold 120 ms, hit 60 ms | SoundSystem.ts:31-34 |
| Shot throttles | spark-bolt-fire 80 ms, spark-bolt-hit 50 ms, turret-fire 70 ms | manifest.ts:93, :94, :104 |
| Pitch variance | 5% spark fire; 4% hit and turret; none elsewhere | manifest.ts:93, :94, :104 |
| Music track volumes | era loops 0.42; title 0.48 | manifest.ts:76-78, :103 |
| Town music factor | 0.7 | TownScene.ts:231 |
| Run music factor | Static-boss gain x squall duck; 1 outside E10 | Game.ts:4908-4912; E10StaticBossSystem.ts:252-255 |
| Loop gain | track volume x call volume x source scale x music volume | SoundSystem.ts:165, :567-569 |
| E1 music in a run, end to end | 0.42 x 0.35 x 0.8 = 0.118 (-18.6 dB) | derived |
| Output stage | both buses to the destination; no compressor or limiter | SoundSystem.ts:304-307 |
| Gain writes | `.value` assignments, instant steps | SoundSystem.ts:165, :331, :530-531 |
| Loop start and stop | offset zero, no fade-in; `stop()` without fade | SoundSystem.ts:361-375, :435-438 |

### (d) Turning the music off, every step counted (INFERRED from code; nothing booted)

| Situation | Desktop | Phone, 390 px | Provided by |
|---|---|---|---|
| In a run, music only | 3: P or Esc; drag Music Volume to 0; P | 3: tap the 44 px "Ⅱ"; drag the slider thumb to 0; tap "back to the claim" | InputController.ts:23; Hud.ts:299-301, :395-398, :763-767; theme.css:2068-2082, :1777-1781 |
| Scroll to reach the slider | +1, UNCERTAIN | +1, UNCERTAIN | theme.css:558-571, :1772-1775 |
| In a run, all sound | 1: M, toast "The claim goes quiet." | 3: pause, Mute, resume | InputController.ts:24; Game.ts:3017, :9273-9276 |
| In town, music only | 2: Settings, slider | 2 | TownScene.ts:1165-1170 |
| Start menu, returning player | 2: Settings, slider | 2 | StartMenu.ts:146, :157 |
| Start menu, first boot | no route to Settings until a profile exists, while the title theme already plays after the first gesture | same | StartMenu.ts:86, :127-148; SoundSystem.ts:114-115 |
| M in town or on the menu | does nothing | n/a | no mute handler under `src/town/` or `src/ui/menu/` |
| Music-only key | none | none | InputController.ts:3-28 |
| Any hint that mute exists | Greenhorn Gazette keyboard copy only | none | greenhornGazette.ts:30, :36-40 |

### (e) Persistence

| Logical key | Stored as | Default | Written | Read |
|---|---|---|---|---|
| `gr.audio.volume.v1` | `gr.profile.v2.<profile id>.gr.audio.volume.v1` (ProfileStorage.ts:71-73, :283-285, :357-361) | 0.8 (settings.ts:63) | every `input` event of Volume (AudioSettingsControl.ts:50, :53) | every `play()` and gain update (SoundSystem.ts:127, :529) |
| `gr.audio.muted.v1` | same prefix | unmuted: an absent key reads false (settings.ts:71) | Mute `change` (AudioSettingsControl.ts:51, :54); M in a run (Game.ts:9274) | same |
| `gr.audio.music-volume.v1` | same prefix | 0.35 (settings.ts:79) | every `input` event of Music Volume (AudioSettingsControl.ts:52, :55) | every music loop gain (SoundSystem.ts:165, :567-569) |

The values survive reloads and apply live on every map and scene (SoundSystem.ts:111, :557-565); they also travel with profile export and cloud backup, which pack every profile key (ProfileTransfer.ts:64-70; INFERRED, not traced to the server).

## 4. Findings

**F-AUD-1 (high, harshness).** One bright twang dominates a dense SFX layer over a dark music bed.
Evidence: tables (a), (b), (b2); a single sample with 5% pitch spread (manifest.ts:93); building shots carry no position, so every beacon and turret plays at full level (SoundSystem.ts:119, :194-202). MEASURED and SIMULATED.
Corrective: lower, darken and distance-attenuate the shot sounds; cutting spark-bolt-fire alone by 6 dB lowers the Spark Rig SFX bus by about 3.3 dB (from its energy share).

**F-AUD-2 (medium, harshness).** Four cues jump far above everything else.
Evidence: table (b): victory-sting +12.1, defeat-sting +11.2, palisade-collapse +10.1, chirp-refuse +7.9 LU. MEASURED.
Corrective: cut those four manifest volumes by about 6 dB; fade the chirp's tail.

**F-AUD-3 (medium, harshness and feedback).** The assets missed their loudness target and the manifest does not correct it, so impacts vanish while launches stay loud.
Evidence: table (b) and the asset-wide check; hits play at -67.0 and -47.6 LUFS in game. MEASURED.
Corrective: loudness-normalize every asset offline to one target, then set manifest volumes against it.

**F-AUD-4 (low, negative result).** No limiter exists and the numbers do not need one for clipping; the voice-count "Poor-man limiter" (SoundSystem.ts:524) pumps the bus instead.
Evidence: table (b2) and its model table; gains are written instantly (SoundSystem.ts:530). SIMULATED; audibility of the steps UNCERTAIN.
Corrective: ramp gains with `setTargetAtTime`.

**F-AUD-5 (high, repetition).** Two tracks cover the public game, and the in-run track restarts at every scene.
Evidence: table (a) and the repetition arithmetic; town and run both open on bar one; the E1 harmony cycles every 15 s. MEASURED and INFERRED.
Corrective: ambience-only rests and a random start offset now; longer or more pieces later (Q2).

**F-AUD-6 (medium, repetition and harshness).** No music file is loop-clean, so every repeat is heard as a seam.
Evidence: table (a) seam column, against the law "loop-clean" (specs/music/README.md:15) and the MU-02 task's "loop-clean seam" (tasks/done/20260711-101223-mu-02-wiring.md:6). MEASURED.
Corrective: re-edit the four files so tail meets head, or crossfade in code; fade in and out at scene changes.

**F-AUD-7 (medium, owner).** The title and E1 pieces are shorter than the owner's production ruling.
Evidence: 60 s and 90 s against "title 2-3min, era loops 2min+" (specs/music/README.md:2); the same verdict says "the E1 loop PASSES", so whether the rule binds E1 is the owner's call. MEASURED.
Corrective: Q2.

**F-AUD-8 (high, quick disable).** Music alone is a three-step pause-panel task on every device, and phones get no shortcut or hint.
Evidence: table (d); the Music Volume slider is the second control of the eleventh block of the pause panel (Hud.ts:742-767); M's all-sound behavior is pinned by e2e/050-audio-mix-and-access.spec.ts:90-103. INFERRED; the scroll is UNCERTAIN.
Corrective: a one-tap music toggle in the HUD, town bar and menu, with a key.

**F-AUD-9 (low, first boot).** No audio prompt, and no route to Settings while the title theme plays.
Evidence: table (d), first-boot row. INFERRED.
Corrective: put the music toggle on the first-boot card.

**F-AUD-10 (low).** Music Volume at zero still downloads and plays the loop silently.
Evidence: loops stop only for mute or master zero (SoundSystem.ts:143-146), so each scene still fetches the 1,800,881 B E1 loop. INFERRED.
Corrective: treat music-off like mute for music loops.

**F-AUD-11 (low, side finding).** stockpile-deposit is swallowed by the gold family interval wherever it follows a coin.
Evidence: both share the 120 ms gold family (SoundSystem.ts:31-34, :664-666) and the coin is requested first in the same tick (Game.ts:3150-3151, :9802-9803; :596 with :3320). INFERRED.
Corrective: take stockpile-deposit out of the gold family, or play it instead of the coin.

Requested measurement: one e2e that pauses at 390x844 and 1280x800 and reports the bounding box of `pause-music-volume` against the visible pause panel; it settles the scroll question.

## 5. Recommendations, ranked

| Rank | Change | Fixes | Cost (implementer) | Files | Owner decision |
|---|---|---|---|---|---|
| 1 | One-tap music toggle in the run HUD beside pause (44 px on phones), the town bar and the start menu including first boot; its own profile key so the slider level survives; music-off skips the fetch; a keyboard key | F-AUD-8, 9, 10 | about 4 to 6 h | src/audio/settings.ts, SoundSystem.ts, AudioSettingsControl.ts; src/ui/Hud.ts, theme.css; src/town/TownScene.ts; src/ui/menu/StartMenu.ts; src/core/InputController.ts; src/game/Game.ts, ProfileStorage.ts; src/news/greenhornGazette.ts; one new e2e on both projects | the key only (Q1) |
| 2 | SFX re-balance: loudness-normalize every mp3 offline; then lower spark-bolt-fire and turret-fire, cut the four loud cues about 6 dB, lift the inaudible hits, high-shelf the SFX bus, attenuate building shots by distance, widen pitch spread | F-AUD-1, 2, 3 | about 3 to 5 h plus an owner listen | assets/audio/raw; src/audio/manifest.ts, SoundSystem.ts; src/systems/CombatSystem.ts | a listen; no money |
| 3 | Ramp every gain change; fade music in on start and out before `stop()` and before a scene closes its context | F-AUD-4, 6 | about 2 h | src/audio/SoundSystem.ts; extend e2e/music-survives-pause.spec.ts | none |
| 4 | Loop-clean music: trim the fades and gaps and crossfade each seam in the four files, or crossfade two sources in code | F-AUD-6 | about 2 h plus an owner listen | assets/audio/raw (or SoundSystem.ts) | none; restores the ratified law |
| 5 | Variation. Free: ambience-only rests between passes and a random start offset per scene. Paid: longer E1 and title pieces, or MU-04 encounter tracks | F-AUD-5, 7 | about 2 to 3 h for the free part | src/audio/SoundSystem.ts, src/game/Game.ts, src/town/TownScene.ts | yes (Q2) |
| 6 | Master limiter: NOT justified (no clipping at default or maximum settings); add an SFX-bus compressor only if the listen after 2 and 3 still says harsh | none measured | about 1 h | src/audio/SoundSystem.ts | none |

Item 1 is what users asked for and can land alone; items 2 to 4 are the harshness fix.

## 6. Owner questions

Q1. Keep M as mute-all (as the Gazette and e2e/050 document) and add a music-only key, or make M music-only and leave mute-all to the checkbox? Recommendation: keep M, add the visible toggle (the real fix) plus a free key such as N.

Q2. Approve the free rests-and-offset change now, and choose whether to spend Sonilo credits on a longer E1 piece and a two-to-three-minute title (your MU-01 lengths) or to revisit MU-04 encounter tracks, whose "after MU-02 ships two eras" condition is met (specs/music/README.md:14)? Recommendation: the free change now, a longer E1 piece next.

Q3. Is a processing-only fix for the spark twang enough, or should ElevenLabs credits buy a darker multi-take set? Recommendation: process first, listen, then decide.

Reproduction: `measure.py`, `seam.py`, `chroma.py`, `simulate.py`, their JSON outputs and this text (`draft.md`) sit in `/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush-history-local/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/audio-review/`; the renders `sim-early-*.wav` and `sim-late-*.wav` with no rig or blast in the name come from a superseded first model that fired both hero weapons at once. The folder is temporary, so copy it under `artifacts/` if the evidence should outlive the session.
