# m1/03-wave-pressure

**Contract:** escalating pressure replaces debug spawning; a run has a shape and an end. **First "is it fun" checkpoint — verdict recorded in this file.**

**Seam:** `src/systems/WaveSystem.ts` + `Balance.waves` — grace 5 s; trickle 1/2.4 s (×0.97 per 10 s, floor 0.8 s); wave every 30 s **sim time**: pulse of 3+3·wave from a random compass edge (spawn ring just outside camera), banner via UiSnapshot with flavor copy rotation ("Rustlers on the north bank!", "Trouble follows the river…"); HP ×1.12 / speed ×1.02 (cap +30%) per wave; alive cap 60. Survival timer on HUD; death overlay now shows waves survived. All spawning routes through WaveSystem (debug `T` included).

**Playable checkpoint:** the first honest run — survive escalating waves until death, restart, again.

**Verification:** GATE-STD; e2e at `?timescale=8`: banner text asserted; `wave` increments on schedule; by sim-t 60 s spawn totals match spec; cap respected under `?nokill`; restart mid-wave probe; stress to wave 10 → ≥ 60 fps, draw calls ≤ 200. **Playtest note written into this spec: does kiting + panning tension emerge? If "flat" → reslice before building more** (knobs: trickle floor, pulse size, hold-to-pan variant, knockback).

**Deps:** 02.

**Firewalls:** no enemy stat logic beyond applying wave multipliers; no UI beyond banner/timer snapshot fields; no economy.
