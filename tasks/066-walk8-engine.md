# Task 066-walk8-engine: the new 8-frame sheets walk in-game — process, register, animate (lane-c, RENDER-ONLY; commit prefix "feat:")
WHY NOW: the cast-motion pipeline has delivered its first REAL sheets — `assets/raw/char-hero-sheet-walk8.png` (v3 lineage, owner-gated on the pan fix), `assets/raw/char-prospector-sheet-hover8.png`, jumper landing next (05-town-cast grinding) — but the engine only plays walk4/hover4. This is the laddered SpriteAnimator engine slice (BACKLOG Cast Motion Ladder).
You are Codex in worktrees/lane-c. Pre-flight per LANE-SAFETY. READ FIRST: `src/render/SpriteAnimator*` (or its actual home — grep) + the walk4 sheet registry in `src/assets/generated.ts` + `scripts/extract-alpha.mjs` (the established #ff00ff processing) + the pilot cell geometry (280×340, 4 rows down/left/right/up × 8 frames).

## Scope
1. **Process the raws** (fire-side law, this task does it): `extract-alpha.mjs --key ff00ff --grid 8x4` on each *-sheet-walk8/hover8 raw present → `assets/processed-full/` cells, registered in generated.ts alongside (NOT replacing) the walk4 entries.
2. **Engine:** SpriteAnimator supports 8-frame rows via per-sheet metadata (frameCount from the registry, not hardcoded 4); gait timing scales so the walk SPEED reads identical (8 frames over the same cycle duration — smoother, not faster).
3. **Switch policy, per character, data-driven:** a registry flag selects walk8 when its processed cells exist, walk4 fallback otherwise. **HERO STAYS ON walk4 until the owner passes the v3 pan-fixed sheet** (flag off for hero; ON for prospector hover8; jumper when present). One-line flips later, zero code.
4. **e2e:** prospector hover8 plays 8 distinct frames in a cycle (frame-index probe), hero unchanged vs main (byte-similar screenshot), no frame-rate/speed regression on the perf probe.

## Firewall
Touch ONLY: SpriteAnimator + sheet registry + processed assets for the walk8/hover8 sheets + its e2e + artifacts. **NO sim, NO Balance, NO raw-sheet edits, NO hero visual change (flag OFF), NO other characters' existing sprites.**

## Self-check
tsc/build · new spec green both projects · m1-01/m2-01/vp-02 adjacents green · zero console · before/after prospector GIF-strip or frame screenshots → `artifacts/066/`.
End: **READY-FOR-GATES** + which sheets processed/registered + the frame-probe evidence.
