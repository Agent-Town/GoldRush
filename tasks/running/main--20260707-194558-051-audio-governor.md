# Task 051: the audio governor — the mix must never ring (MAIN slot, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in the repo root (main slot). READ FIRST: AGENTS.md; src/audio/SoundSystem.ts (050's per-sound throttle + pitch variance = the foundation; this task adds the GLOBAL layer); how many sluices/turrets a late base runs (30+ sluice loops possible!). Pre-flight: zero staged/modified tracked files under src/ e2e/ configs — EXEMPT artifacts/ logs/ reviews/shots docs/ tasks/ (list briefly, proceed).

## Owner finding (2026-07-07 ~19:40, post-050 build)
"Sound effects are queued too often — there has to be more control. There is RINGING in my speakers and the noises mix massively with each other." 050 throttled the spark; the GLOBAL mix is ungoverned: stacked identical loops (every sluice = its own river-loop instance → phase-stacking = the ringing), unbounded concurrent voices at battle scale, chime pile-ups.

## Scope
1. **Loop dedup (the ringing killer)**: identical ambient loops NEVER stack — ONE instance per loop sound, volume scaled by source count (log curve, capped) and by nearest-source distance. 30 sluices = one sluice-loop, slightly fuller, not 30 phase-interfering copies.
2. **Global voice governor**: hard cap on concurrent voices (~12); priority classes (UI/stings > combat one-shots > economy ticks > ambient); when saturated, lowest class drops first (drop, never queue). Existing >8 ducking replaced by this governor.
3. **Per-family cooldowns**: family-level minimum intervals (gold-chime family ≤1/120ms, hit family ≤1/60ms globally — not just per-sound) so mass events read as texture, not hail.
4. **Gain staging sanity**: master bus headroom (sum-scaling when voice count high) — the poor-man's limiter; document the curve. No new deps.
5. Diagnostics: concurrent-voices + drops-per-second counters (e2e + future mix passes).
6. Listen checklist in the report: 30-sluice base idle · wave-30 battle · pan-spam — each "no ringing, no mud" stated honestly.

## Firewall
Touch ONLY: src/audio/** (governor layer), e2e, artifacts. NO changes to: which events emit, sound files, 050's per-sound values (compose above them), sim, Settings behavior.

## Self-check
tsc/build; e2e: seeded 20-sluice base → exactly ONE sluice-loop instance (diagnostics) · voice cap held under stress (counter ≤ cap) · priority drop order proven · audio-absent boot clean; audio-integration + 050 specs + m1-01 + m2-01 unmodified green both projects; zero console errors. End: READY-FOR-GATES + the listen checklist + governor constants chosen.
