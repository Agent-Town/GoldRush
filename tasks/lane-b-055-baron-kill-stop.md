# Task 055: the claim holds its breath — the Baron's death becomes a MONUMENT (LANE-B, branch lane/m4, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b. READ FIRST: AGENTS.md; 054's epic Baron (this rides ON it — stats/rampage/boss-bar land there; VERIFY it merged, file-probe the boss-bar module, else STOP "054 not landed"); the baron defeat beat (presence's card — this task ELEVATES it); the pause machinery (sim-freeze exists — the ceremony reuses it); the audio governor + victory sting; determinism laws (the freeze is a scripted sim-pause window: sim HALTS, render continues — no timestep manipulation, hash-safe). Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/m4 main && git clean -fd`, proceed; STOP only on unmerged content or foreign edits); npm install; build green. SEQUENCING: after town-t4-growth in this lane's queue (and 054 merged per the probe above).

## Owner order (2026-07-08 ~07:20)
"There could also be a stop in the game when it dies and this monumental moment could be celebrated." Plus the standing appetite: "even bigger and with more live and more strong" — served here as OWNER-TUNABLE knobs on top of 054's numbers, adjusted after he plays 054 (data-only manifest edits; list them in the report).

## Scope
1. **THE KILL-STOP**: on the Baron's death — the sim FREEZES for ~2.2s (the pause path, scripted; enemies/projectiles hold mid-air; render/vfx continue): his death read plays through it (sprite tips, THE BANNER FALLS with its own beat of hang-time, dust bloom at scale), the defeat card blooms center-screen ("THE BARON IS DEFEATED" + the dragged-off line), the victory sting plays (governor priority: sting class), warm ember/spark burst (festival-class, gold-and-teal — never gore). Then the world exhales and resumes exactly where it held (determinism: the freeze window is sim-time-neutral; seeded hash identical vs a no-freeze control with the pause accounted).
2. **The aftermath dressing**: his banner remains PLANTED in the ground where he fell for the rest of the run (a trophy prop, world-anchored) — walking to it shows an info-note ("The Baron's standard. He'll want it back.").
3. **Skippable + safe**: click/key skips the hold instantly (the card stays 4s); the freeze never traps input; if the hero would die in the same tick as the Baron, the DEATH resolves first (no celebration on a lost run — assert it).
4. **Owner-tunable "bigger" knobs surfaced**: the report lists the exact manifest fields for scale/HP/damage with current values and one-line effects, so the owner's post-054 verdict is a one-edit tune (no code).
5. Mobile: the moment reads at 390px.

## Firewall
Touch ONLY: the kill-stop sequence (pause-path reuse), the death read/banner-plant prop + its info-note entry, the elevated defeat card, e2e, artifacts. NO camera changes (the 054 spawn-impulse remains the only exception, unchanged), NO stat changes (knobs documented, not edited), NO CombatSystem changes (death detection uses existing events), NO sim-timestep changes.

## Self-check
tsc/build; extended baron e2e: kill → freeze window (sim clock asserted held, render frames advance) → card + banner-plant → resume with seeded-hash parity vs control · skip path · hero-death-same-tick = no celebration · the planted banner persists + its note; 054 + baron + m1-01 + m2-01 unmodified green both projects; zero console errors; screenshots (mid-freeze with the card, the planted banner after) into artifacts/055/. Commit on lane/m4. End: READY-FOR-GATES + the tunable-knob table + results.
