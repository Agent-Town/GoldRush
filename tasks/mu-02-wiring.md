# Task mu-02-wiring: the music enters the game — title + E1 loop (lane-a; commit prefix "feat:")
CODEX: model=gpt-5.6-sol effort=medium
FROM specs/music/README.md MU-02 (owner picked take-1 = THE PAN THEME; the E1 loop PASSED). ASSETS EXIST: marketing/raw/audio/title-theme-sonilo-take1.m4a (menu) + era-e1-frontier-take1.m4a (in-run loop). READ: the spec + src/audio/SoundSystem + the Settings-panel audio home (058) + perf-05's lazy-load pattern (music must NOT join the boot-critical bytes).
## Scope
1. Encode/move the two tracks into the asset pipeline (m4a→(ogg|mp3 if needed for safari), assets/audio/, lazy chunks — boot bytes budget unchanged, assert vs perf-05 numbers).
2. THE TITLE THEME plays on the start menu + town (menu volume law: starts only after first user gesture — autoplay policy); THE E1 LOOP plays in-run (loop-clean seam), ducks under existing sfx.
3. A MUSIC VOLUME slider joins the Settings audio home (persisted, default modest); mute honors the existing master mute.
4. e2e: menu music starts after gesture (audio-context state probe), in-run loop active, volume slider persists, LITE/mobile unaffected in perf probe, zero console.
Firewall: audio assets + SoundSystem/menu/run wiring + Settings slider + e2e. NO sim, NO other tracks (era tracks arrive with their epochs), NO autoplay violations.
End: READY-FOR-GATES + the boot-bytes delta + a 20s capture with audio.
