# Task 050: the mix earns its keep — spark softened, volume reachable mid-run (MAIN slot, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in the repo root (main slot). READ FIRST: AGENTS.md; src/audio/ (SoundSystem.ts — spark plays at :102/:127, manifest.ts gain table, settings.ts storage keys); the pause overlay; the 044 Settings screen (existing slider/mute = the reference controls); specs/audio/README.md (grammar laws). Pre-flight: zero staged/modified tracked files under src/ e2e/ or configs — EXEMPT artifacts/ logs/ reviews/shots docs/ tasks/ (list briefly, proceed); `??` untracked expected.

## Owner finding (2026-07-07 ~17:50, playing the first-sound build)
"You have to add an option in the game to manipulate the sound volume or turn it off — the Spark Rig is kind of a sharp noise." Two real problems: (1) volume/mute exist ONLY in the main-menu Settings — unreachable mid-run where the noise actually bothers; (2) spark-bolt-fire is the game's most frequent sound and it reads SHARP — a mix problem no slider fixes.

## Scope
1. **Mid-run access**: the PAUSE overlay gains the master volume slider + mute toggle (reuse the Settings controls verbatim — same component/persistence, both surfaces stay in sync). Plus hotkey **M** = mute toggle anytime in-run, with a small ledger-voice toast ("The claim goes quiet." / "Sound returns."). Persisted per profile (existing keys).
2. **Soften the spark**: per-sound gain table in manifest.ts — spark-bolt-fire cut noticeably (start ~-8dB relative, tune by ear against pan-swish as the reference mid-level; document the chosen values + a one-line listen note per adjusted sound). Review turret-fire and spark-bolt-hit levels in the same pass (the three highest-frequency sounds).
3. **Rapid-fire throttle**: per-sound minimum interval (spark-fire ~80ms floor — drop, don't queue, excess play calls) + slight random pitch variance (±4–6%) on the high-frequency combat sounds so bursts read organic, not machine-gun. Audio layer is render-side — plain randomness permitted (NEVER in sim).
4. Diagnostics: per-sound plays-per-second counter (for the e2e + future mix work).
5. The game must still pass zero-console with audio absent (existing law).

## Firewall
Touch ONLY: src/audio/** (gain table, throttle, pitch variance), pause overlay + hotkey wiring, the toast, e2e. NO changes to: which events play sounds (seams stay), sim timing (sound remains fire-and-forget), Settings screen behavior (it keeps working), Balance.

## Self-check
tsc/build; e2e: pause-overlay slider changes volume + persists + syncs with Settings · M toggles mute with toast · spark throttle proven via the plays-per-second diagnostic under rapid fire (≤ the floor rate) · audio-absent boot clean; audio-integration spec + m1-01 + m2-01 unmodified green both projects; zero console errors; screenshots (pause overlay with slider, toast) into artifacts/050/. End: READY-FOR-GATES + the gain values chosen with listen notes.
