# Task 010: VP-02c rotation smoothing (8-way feels coarse — fix transitions before art)

You are Codex, implementer for Gold Rush, on Robin's Mac in the project folder. Claude orchestrates and runs final gates. READ FIRST: `docs/playtests/2026-07-04-robin-m1-visuals.md` Addendum 3 §B (BINDING), `assets/requests/batch-005-rotation.md` (cell map + mirror table), `AGENTS.md`.

Robin's verdict on the live 8-way resolver: "not really smooth — many directions missing." Treat as two hypotheses, in order:

## 1. PROBE FIRST (do not skip): are all 8 orientations actually firing?
Drive the hero through a full 360° sweep (`__GR_TEST__` teleport/heading or key simulation) and record `spriteAnimations['char.hero'].frameKey` per 45° heading. If any of the 8 headings never selects its expected rotation cell (mapping, mirror-table, or hysteresis bug), FIX THAT FIRST and report which were dead — this alone may explain "directions missing."

## 2. Transition smoothing (the "not smooth")
- **Damped heading:** the sprite's facing angle follows the movement vector through a rate-limited lerp (`Balance.sprite.turnRateDegPerS`, default ~540°/s) — a 180° reversal traverses intermediate orientations (S→SE→E→NE→N), never snaps opposite. Cell swaps trigger when the DAMPED angle crosses boundaries (keep the existing ~10° hysteresis on top).
- **Crossfade:** ~100ms opacity crossfade between outgoing/incoming orientation cells at swap (`Balance.sprite.orientationFadeMs`, 0 disables). Implementation free choice (second overlay quad or shader mix) — but NO new draw calls at rest (overlay active only during a fade) and NO per-frame material clones (pool-shared).
- Idle keeps hemisphere-snap (s/n) but goes through the same fade.

## Scope (hard boundary — lane 009 M2-05 is live on Build/Economy/enemy files)
Touch ONLY: `src/assets/SpriteAnimator.ts`, `src/entities/Hero.ts` (heading feed), `src/game/Balance.ts` (NEW `Balance.sprite` section only), `src/systems/DebugTools.ts` (knobs folder), `e2e/vp-02-sprite-animation.spec.ts` (EXTEND, do not rewrite existing tests). Do NOT touch Enemy.ts, Build/Economy/Wave/Combat/Targeting, styles, or any 009-scope file. No git commits; no STATUS/specs/reviews edits.

## Acceptance (e2e-asserted, in-page rAF trackers, never protocol polling)
1. Probe log: all 8 headings select the correct cell (fix + assert).
2. Heading sweep test: continuous 360° turn produces the full ordered orientation sequence with no skips.
3. Reversal test: S→N flip passes through ≥2 intermediate orientations under the default turn rate.
4. Boundary wiggle ±2° at a 45° seam: zero orientation oscillation over 3s.
5. Fade: during a swap, exactly one overlapping fade window ≤150ms; zero extra draw calls at rest (diagnostics assert).
6. tsc/build clean; existing vp-02 suite green UNMODIFIED semantics; m1-01 + visual-polish-assets green (pool/asset canaries).
Self-check locally, then end with exactly `READY-FOR-GATES` + files changed + local results.
