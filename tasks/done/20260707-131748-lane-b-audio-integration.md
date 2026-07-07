# Task audio-integration: the game gets its voice — SoundSystem v1 (LANE-B, branch lane/m4, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b. READ FIRST: AGENTS.md; specs/audio/README.md (grammar + laws); assets/audio/LEDGER.md + assets/audio/raw/ (28 generated SFX, named per the batch-001 task); task 044's Settings stub (the volume knob's home). Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/m4 main && git clean -fd`, proceed; STOP only on unmerged content or foreign edits); npm install; build green.

## Why (owner: audio = "Generated-first, now", 2026-07-07; sounds exist as of ~12:05)
28 SFX are generated and sitting unwired. Silence has been the placeholder; this task retires it.

## Scope
1. **`src/audio/SoundSystem.ts`**: pooled HTMLAudio/WebAudio playback (pool per sound, max 4 concurrent instances per name, volume ducking when >8 total), lazy-load from `assets/audio/raw/` via a generated manifest (import.meta.glob or explicit map — document choice), master volume 0–1 persisted per profile, **muted-by-default until first user gesture** (autoplay policy — first click/keydown unlocks; no console errors before unlock).
2. **Wire the core moments** (event-driven at existing seams — find the emit points, do NOT restructure): spark-bolt fire/hit · blast arm/boom · turret fire · palisade hit/crack/collapse · pan swish + gold chime · stockpile deposit · demolish · build place · invalid · tier-up · research pick · menu tap · ledger open · wave-start horn · victory/defeat stings · prospector chirp-acknowledge/refuse (consent grammar!) · river + sluice loops (spatial-lite: volume by camera distance, no panner v1) · hover loop while the Prospector moves.
3. **Settings**: the 044 Settings stub gets its first real control — master volume slider + mute toggle, persisted, applies live.
4. **Loudness sanity**: one normalization constant per sound in the manifest (hand-tuned from the ledger's listen notes); no sound may clip or dominate (subjective check documented in report).
5. The game stays FULLY functional with audio files absent (dev safety): missing file = silent no-op, zero console errors.

## Firewall
Touch ONLY: new src/audio/**, event-seam one-liners (play calls at existing emit points), Settings stub wiring, the manifest, e2e. NO changes to: sim timing/logic (sound is fire-and-forget, never awaited), Balance values, existing e2e assertions. NO new deps.

## Self-check
tsc/build; new `e2e/audio-integration.spec.ts`: boot muted-no-errors → gesture unlock → seeded pan produces a play() call (spy/diagnostic counter, not actual sound assertion) → volume persist across reload → missing-file no-op path; m1-01 + m2-01 + task-025 + m4-06 unmodified green both projects; zero console errors INCLUDING pre-gesture; screenshots (settings slider) into artifacts/audio-integration/. Commit on lane/m4. End: READY-FOR-GATES + which seams got wired + any sounds that need retakes (grammar misses) for batch-002.
