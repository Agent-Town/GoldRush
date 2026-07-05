# Task 030: F-025-1 wade-speed test sampler + disarm reticle dim (MAIN slot; test-side + one UI nit, NO gameplay changes)

Context (s46 adjudication, STATUS 2026-07-05): the 025 wade-speed e2e assert reads protocol-sampled hero speed during the ~0.4 wall-second ford-crossing window; on slow envs the sample lands after river exit and reads land speed = false negative. Hero.ts had ZERO diff — game code exonerated; the TEST is wrong per the s27 law (protocol-invisible windows must be sampled in-page).

1. WADE SAMPLER: in the 025 spec (bandits-dont-swim suite), replace the protocol-sampled speed read with an in-page rAF min-speed sampler (same window.__gr test-hook pattern the aim-trio specs use): install BEFORE the hero enters the river, record min speed while `inRiver`, assert min < wade-factor x land speed + epsilon. Must be wall-clock independent — no fixed sleeps around the crossing.
2. RETICLE NIT (from reviews/task-025-bandits-dont-swim.md): the aim reticle stays fully visible while wet-powder-disarmed and reads as "can fire". Hide or dim it (CSS class, match the wet-powder banner's timing exactly; restore on re-arm). EXTEND the existing disarm e2e with the class assertion — do not write a new spec file.

Constraints: no Balance/gameplay changes; CombatSystem stays sole damage resolver; test hooks additive-only; run the full 025 suite + disarm spec + aim trio green before READY-FOR-GATES.
