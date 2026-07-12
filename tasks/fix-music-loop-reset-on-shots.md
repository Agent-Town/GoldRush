# fix-music-loop-reset-on-shots — the band does not restart for every bullet
ROLE: audio surgeon. WORKDIR: lane-a (worktrees/lane-a).
CODEX: model=gpt-5.6-sol effort=high

## WHY (owner, in-run 2026-07-12, verbatim): "It seems like in the game each shot of the gun resets the music loop that is kind of weird."
## READ-FIRST: src/systems/AudioSystem.ts + src/audio/SoundSystem.ts + manifest (how the music loop vs SFX channels are played — suspect: shot SFX sharing/retriggering the music element, or a play() key collision resetting currentTime on the loop) · specs/music (Pan Theme/loop laws).
## SCOPE: reproduce headless-or-attended (fire rapidly, observe the loop's currentTime resetting); root-cause; fix so MUSIC and SFX are fully independent channels (loop never restarted by any SFX; volume ducking if any = smooth, not reset); e2e or unit: fire N shots, assert music element continuity (currentTime monotonic across shots).
## TOUCH-ONLY: audio systems + one test, artifacts/. NO Balance/sim/weapon logic, no new audio assets.
## SELF-CHECK: tsc; build; audio settings + existing suites green; zero console; a before/after capture with audible loop continuity described in the report.
END: READY-FOR-GATES + root-cause line.
