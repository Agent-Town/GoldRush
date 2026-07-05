# Task 025 — VP-02e: jumper 8-way activation + grab/flee clips (ART-GATED — do not run yet)

PRECONDITION (hard): the batch-007 regen sheet is PROCESSED and the LEDGER row "char.claim_jumper SHEET full-ROTATION 4x3" says scale-debt CLEARED with measured heights in the side-sheet band (~409–439 px). If that row still says SCALE DEBT, STOP and report — activating on the 005R3 cells ships a visible size pop. Also run AFTER tasks/024 (idle semantics land there).

Goal: the claim-jumper stops being coarse-orientation-only — enemy code drives the full 8-way rotation contract block (dormant since s37) plus the grab/flee clips (dormant since s15, batch-004 sheets) so stealing reads on the enemy itself: approach 8-way, GRAB at the stockpile, FLEE with the gold.

## Compact contract

- `src/entities/Enemy.ts` (jumper family only): own an `OrientationResolver` (the Hero pattern — damped heading, hysteresis; reuse, don't fork) and send resolved directions + clips to its SpriteAnimator: `walk` while pathing, `grab` during the steal dwell, `flee` while escaping with gold, crouch idle otherwise. Read state from existing steal-lifecycle events/fields — do NOT add new event types.
- Wrecker/other families: untouched, still coarse.
- Contract: read `assets/layer-contracts/characters.v2.json` at face value — jumper rotations are in SPEC order, sw/nw mirror se/ne (per the s37 pixel-verified ruling; ignore any stale "cells 5–8 swap" prose you find in older notes).
- CombatSystem/WaveSystem/Economy: zero changes. Rendering-only slice; sim stays byte-identical (existing sim e2e suites green UNMODIFIED is the proof).

## e2e (new `e2e/vp-02e-jumper-8way.spec.ts` + keep vp-02b green)

1. Jumper pathing east vs north resolves different rotation cells (frameKey assert, mirrored flags per contract).
2. Steal dwell → `grab` clip active; escape → `flee` clip active (drive via the m2-04 harness pattern).
3. No size pop: jumper bbox height on-screen stable within ~10% across s/e/walk/grab transitions (in-page probe).
4. Dormancy inversion: the old jumper-shape dormancy assert flips to an activation assert — update that ONE test with an in-file note.

## Acceptance

- tsc/build clean; new spec green both projects; vp-02/vp-02b green; m2-04 suite green UNMODIFIED (sim untouched); boot probes desktop+390 zero errors.
- Visual: screenshot strip of jumper walking 4+ directions + grab at stockpile + flee — to reviews/shots-vp-02e/ pattern (gate session will re-shoot; include yours as evidence).

Do not touch: Balance.ts gameplay knobs, CombatSystem.ts, WaveSystem.ts, Economy.ts, Hero.ts, other e2e suites, assets/. Canon (brief §9.2): thief stays unarmed and non-gory — grab/flee art is already compliant; do not add blood/weapon VFX.
