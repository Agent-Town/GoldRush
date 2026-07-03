# m1/07-feel-and-tune-gate

**Contract:** the assembled loop is *fun* — M1's verdict, with evidence. No new systems.

**Seam:** `lil-gui` behind `?debug` bound to every `Balance` constant (the only new dep in M1). One-axis-at-a-time feel passes per gameplay-workflows.md: movement accel/decel, camera lag/look-ahead, TTK/fire cadence, wave pressure curve, pan tick rhythm, mote magnet, restart speed (< 2 s death→playing). **Charm pass** (fun pillar): hit-pause micro-stutter on kills (≤ 60 ms), camera impulse ≤ 0.15 m, gold coin-tick, pan-ring wobble, banner flavor rotation, death-ledger copy ("The claim was overrun. The gold remembers."). Final numbers written back into `Balance.ts` + this spec; changed constants logged.

**Playable checkpoint:** a full 5–9 minute run — fight, pan, build, level ×6–8, die, stake again instantly. This is what Robin plays.

**Verification:** GATE-STD; full-loop Playwright script (spawn→kill→pan 25g→build beacon→level-up pick→die→restart→counts at baseline); `new-game-definition-of-done.md` checklist top to bottom; perf: wave-10 live load ≥ 60 fps, draw calls ≤ 200; 3 recorded playtest runs logged (death wave, levels, gold spent, beacons placed) — target band: first-try death wave 5–8 (4–7 min); screenshot-critique on the busiest combat frame ("readable, illustrated, warm even when tense"); compare-screenshots vs 03 baseline for scene/HUD drift.

**Deps:** 03 + 05 + 06 (everything).

**Firewalls:** config values and feedback layers ONLY. Any structural change discovered here = stop, reslice, don't patch. **M1 exit: Robin plays it and signs off.**
