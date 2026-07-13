# reviews/run-cast-scale-up.md

**Slice:** run-cast-scale-up (the frontier gets readable — run-scene cast ×1.5)
**Branch/merge:** main-slot re-land, committed `96d49eb4` (recovered from a dead prior-session uncommitted re-land; drained by s457 fire).
**Base:** `b300f176` (main pre-s457-lock).

## Verdict: MERGED — owner-priority readability fix, render-only, gates green; adjacent reds fingerprint-matched to pre-existing main breakage (proof below).

## What it does
Owner directive (verbatim, 2026-07-13): *"I think also the characters in the game are now too small. Can you size them up by 50% (except the boss) but in the levels it is hard to make out the opponents clearly as they are now so small."*

Introduces `src/entities/runCastScale.ts` → `RUN_CAST_SCALE = 1.5`, applied render-side only:
- **Enemies** (`pools.ts`): new `renderScale(enemy) = visualScale × (eliteKind ? 1 : RUN_CAST_SCALE)` — regular E1/E2 cast ×1.5; **Baron + railcar (elites) excluded** ("except the boss"), scale untouched. Applied at every sprite/fade/bob/flash site.
- **Prospector** (`Embodiment.ts`): sprite ×1.5 with a ground-anchor Y offset so feet stay planted; float-text anchor raised to track the taller sprite.
- **Hero** (`Hero.ts` + `Game.ts`): `Hero(visualScale=1)` scales `visualGroup`; game constructs heroes (incl. MP roster) with `RUN_CAST_SCALE`.
- **Readability anchors** (`GoldPickup.ts`, `XpMote.ts`): pickup/mote render scale and their height-keyed Y raised so they read against the bigger cast.

**RENDERING-ONLY (CLAUDE.md §4.6):** every hunk is a render-side scale/anchor. No `Balance` combat value, no collision/sim radius, no wave data, no hitbox — the planar sim is byte-identical. Verified by diff inspection: the touched set is exactly the render/anchor path.

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | green (Game 527.00 kB / index 1176.13 kB gz 264.39) |
| `run-cast-scale-up.spec.ts` (own spec) | **PASS** desktop-chrome + mobile-chrome (asserts hero + one of each enemy family = 1.5× pre-change constant; Baron + railcar UNCHANGED; bars anchored within epsilon; perf budgets vp-02/e2-enemies/m1-01 green; zero console/page errors) |
| Screenshots | `artifacts/run-cast-scale-up/{desktop,mobile}-chrome-after.png` |

## Adjacent-suite reds — fingerprint-matched to PRE-EXISTING main (F-1)
Running vp-02-sprite-animation + e2-enemies alongside the drain surfaced 13 reds. **These are NOT introduced by run-cast-scale-up** — proven by running the identical specs against a CLEAN checkout of main (the `worktrees/lane-c` = `lane/e2-arsenal` = `b300f176`, which does NOT contain run-cast-scale-up), on an isolated dev server (:5235). Clean main produced the **same 13-failure fingerprint**:
- `vp-02-sprite-animation.spec.ts` :350 (fallback billboard), :447 (hero rotation contract), :506 (walk frameKey alternates), :541 (east rotation2 unmirrored), :699 (screenshot capture) — **both projects, clean main AND dirty.**
- `e2-enemies.spec.ts` :113 (wave pulse roster), :314 (same-seed determinism) — flaky across runs / project, clean main AND dirty.

Root cause of the vp-02 reds: the wired hero sheet is the **`-f-` variant** (`char-hero-sheet-rotation-f-r0c0.png`) but the vp-02 tests still expect the non-`-f-` sheet (`char-hero-sheet-rotation-r0c0.png`). Both asset variants exist on disk; the wiring (untouched by this slice) selects `-f-`. This is drift from recent hero-walk-sheet work (walk8 / fix-walk-cutout-pockets) landed on main WITHOUT updating vp-02 — a real pre-existing regression, see F-2. A render-only scale change cannot influence frameKey resolution or sim wave hashes; mechanistic + empirical proof agree.

## Findings
- **F-1 (non-blocking, resolved-by-proof):** adjacent vp-02/e2-enemies reds are pre-existing on main (clean-worktree fingerprint match). Not caused by this slice; merge proceeds per gate law ("failures fingerprint-matched to known-reds with proof").
- **F-2 (blocking a future gate, corrective owed):** `vp-02-sprite-animation` is BROKEN ON MAIN — tests expect non-`-f-` hero rotation sheets but `-f-` is wired. Corrective task `tasks/queue/lane-b/fix-vp02-hero-sheet-f-variant.md` authored (FIRE-AUTHORED) to reconcile test expectations vs the wired `-f-` sheets. Until fixed, vp-02 must be treated as a known-red in gate batteries.

## Follow-on
- **run-gait-stride** (owner: "feet move so fast") was LADDER-STALLED on this undrained base — now re-queued to lane-c to build on the landed ×1.5 scale (its `cycleSpeed = groundSpeed / (STRIDE_UNITS × visualScale)` denominators are now correct).
