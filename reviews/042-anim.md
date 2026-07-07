# Review — 042 walk-animation smoothness (MAIN slot)

**Verdict: PASS — drained to main (s105 fire).**

## Scope drained
Main-slot task 042 (`tasks/done/20260707-055710-042-anim-smoothness.md`): investigate-then-fix
walk smoothness for hero + claim-jumper. Root cause (from `artifacts/042-anim/summary.md`): a
fixed global `walkFps=9.5` made the 2.7 wu/s jumper cadence identical to the 6.0 wu/s hero,
producing 1.137 wu/cycle vs the hero's 2.526 wu/cycle (foot-slide/skating); and clip/orientation
swaps reset the frame cursor to frame 0 (visible pop).

## Files (path-scoped, within firewall: SpriteAnimator / resolver / Balance.anim additive / diagnostics additive / e2e)
- `src/assets/SpriteAnimator.ts` — speed-derived fps, walk-cursor preservation across walk restarts + orientation clip swaps, reset clears cached phase, start/stop blend holdoff capped to base cadence.
- `src/entities/Hero.ts` — derives read-only `actualSpeed` from position delta, passes to animator (no sim/movement change).
- `src/entities/pools.ts` — derives enemy `animationSpeed` from velocity, passes to animator (no sim change).
- `src/game/Balance.ts` — ADDITIVE `anim.walkFpsPerSpeed = 9.5/6`, `anim.walkMinFps = 3.5`.
- `src/vite-env.d.ts` — ADDITIVE diagnostics fields (sourceFrameKey, walkFpsPerSpeed, strideUnitsPerCycle).
- `e2e/task-042-anim-smoothness.spec.ts` (new) + `e2e/task-031-anim-roundness.spec.ts` (jumper fps assertion 9.5→6.33 to match the intentional speed-scaled cadence; units/cycle now 2.526, matching hero).

**Firewall check ✓:** no movement-speed/sim edits (Hero/pools only *read* speed for animation); Balance.anim + vite-env additive-only; no contract/art files touched. Measured stride result: jumper units/cycle 1.137 → 2.526 (matches hero); hero cadence unchanged (9.50 fps, 2.526 wu/cycle).

## Evidence (gate battery — s105)
- `npx tsc --noEmit`: clean.
- `npm run build`: clean (311 modules; only benign >900kB chunk-size warning).
- **Full anim battery** `task-042 + task-031 + vp-02 + vp-02b`, both projects, serial (`--workers=1`): **37/38 pass**.
- `perf-01-stress-budget` both projects: **PASS** (042 self-report: draw calls 138, frameMs p95 16.70ms, avg 10.58ms, 0/0 errors — matches m2-01 stress budget; no regression).
- Boot / console: vp-02 `openGame` + "captures VP-02 desktop and narrow screenshots" green → zero console/page errors, desktop + 390px.
- Visual: `artifacts/042-anim/before/` vs `after/` frame-series (hero + jumper, straight run / direction change / start-stop).

## Findings — F-042-1 (non-blocking): concurrent-load timing flake
Under **2 live lanes** (lane-a sci-03, lane-c damage-orientation running Codex) the full parallel
battery produced a **non-deterministic** failure set (5 fails run 1 incl. task-042 own spec; a
*different* 5 fails run 2 with task-042 green). Every failure is timing-class:
- vp-02b `hero-locomotion` / `idle-snaps`: `waitForFunction` 30s timeouts (sim advances slowly under CPU starvation). Retry run: **9 passed, 1 flaky** (retry-recovered).
- vp-02 `orientation swap crossfades once`: only the **wall-clock** bound (line 668, fade span ≤150ms) fails at 232ms; the structural assertions (line 664/665 — exactly one crossfade window, no double-fire) **pass**. Isolated serial (`--repeat-each=3`): **6/6 pass** (3–4s each). This is the last wall-clock assertion in a test the file itself annotates as frame-gap-fragile (s25/s26/s27 harness history).

**Attribution:** load, not 042. Demonstrated by (a) non-deterministic failure set across two identical runs, (b) structural assertions green while only timeout/wall-clock bounds fail, (c) every affected test passes under reduced contention (retry-recover + 6/6 isolated). 042's logic is correct. No corrective owed; the wall-clock 150ms bound in vp-02 remains a candidate for a future frame-count rewrite (harness debt, not 042).

## Environment exception
Gated against a scratch dev server on port **5199** (`playwright.s105.config.ts`) because lane-a/lane-c
occupy the default 5188. Same base config, dev bundle — faithful to how 042's own self-check ran.
