# m1/03-wave-pressure

**Contract:** escalating pressure replaces debug spawning; a run has a shape and an end. **First "is it fun" checkpoint — verdict recorded in this file.**

**Seam:** `src/systems/WaveSystem.ts` + `Balance.waves` — grace 5 s; trickle 1/2.4 s (×0.97 per 10 s, floor 0.8 s); wave every 30 s **sim time**: pulse of 3+3·wave from a random compass edge (spawn ring just outside camera), banner via UiSnapshot with flavor copy rotation ("Rustlers on the north bank!", "Trouble follows the river…"); HP ×1.12 / speed ×1.02 (cap +30%) per wave; alive cap 60. Survival timer on HUD; death overlay now shows waves survived. All spawning routes through WaveSystem (debug `T` included).

**Playable checkpoint:** the first honest run — survive escalating waves until death, restart, again.

**Verification:** GATE-STD; e2e at `?timescale=8`: banner text asserted; `wave` increments on schedule; by sim-t 60 s spawn totals match spec; cap respected under `?nokill`; restart mid-wave probe; stress to wave 10 → ≥ 60 fps, draw calls ≤ 200. **Playtest note written into this spec: does kiting + panning tension emerge? If "flat" → reslice before building more** (knobs: trickle floor, pulse size, hold-to-pan variant, knockback).

**Deps:** 02.

**Firewalls:** no enemy stat logic beyond applying wave multipliers; no UI beyond banner/timer snapshot fields; no economy.

---

## Playtest verdict (2026-07-03, headless instrumented — session 3)

**Verdict: NOT FLAT — the tension emerges structurally. No reslice. Proceed to 05/06; tune numbers in 07.**

Method: two instrumented headless runs at `?timescale=4` (SwiftShader, no human input — floor-level evidence, not feel):

1. **Stationary hero** (pure pressure floor): grace + trickle killable hands-free; wave-1 pulse (t≈31) swarms; HP 100→0 between t40–50. Dies sim-t 50, wave 1, 19 kills, 0 gold. AFK is punished on schedule.
2. **Crude kiting bot** (2.2 m hops, orbit + pan-when-calm): survives 107+ s into wave 3, 46 kills, HP eroding 100→20 through waves 2–3. **Gold froze at 25 the moment wave pressure densified** — panning windows disappear unless the player buys space. That is the core loop working: mining = exposure, combat = movement.

Structural signals confirmed: movement doubles survival; XP only flows when you walk to motes (stationary run had kills≫xp); pressure squeezes the gold economy exactly where Sentry Beacons (05) and upgrades (06) will sell relief.

Concerns handed to 07 (tune with lil-gui, not now): (a) HP erosion through wave 2–3 may be steep with no heal until Tinker's Plating — first-timer death target is wave 5–8, bot suggests wave 3–4 uninformed; (b) early-game gold (25 by wave 1) buys exactly one beacon at base cost — intentional scarcity, verify it feels like a choice rather than a trap; (c) trickle floor 0.8 s untested past wave 3 headless.

Human feel check (kiting feel on real hardware ≥30 fps, banner readability mid-fight) = Robin's playtest at the 07 gate.
