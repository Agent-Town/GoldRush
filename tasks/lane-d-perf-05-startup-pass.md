# Lane D / PERF-05: startup/load pass — measure then improve boot (LANE-D, worktrees/lane-d, branch lane/perf, commit prefix "perf:")
### FIRE-AUTHORED s213 (attended review welcome) — upgraded from the s9y stub to the house pattern; grounded in the lane-d perf ladder (perf-03 instancing `SHIPPED s201`, perf-04 determinism `SHIPPED s212 0737818`) + the existing boot-deferral idiom already in `src/main.ts` (`void import('./crafting/StatSimHarness')` / `DeterminismHarness`).

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in **worktrees/lane-d** on branch **lane/perf**.

## READ FIRST
- `AGENTS.md` (runner law).
- `src/main.ts` — the boot sequence: eager top-of-file imports (styles, theme, AssayBench, Game, ProfileManager, StoryRuntime, TownScene, StartMenu) + the ALREADY-dynamic debug harnesses (`void import('./crafting/StatSimHarness')`, `void import('./diagnostics/DeterminismHarness')`). This idiom is your model: defer the non-critical behind the first frame.
- `src/assets/generated.ts`, `src/assets/slots.ts`, `src/assets/SpriteAnimator.ts` — the generated-sprite/texture pipeline (what loads, and when).
- `e2e/perf-01-stress-budget.spec.ts`, `e2e/perf-02-fullbase-bench.spec.ts`, `e2e/perf-04-determinism.spec.ts` — the perf-spec house style (performance marks + CDP inside a spec; the adjacency you must not regress).
- `playwright.config.ts` — the base config OWNS the dev server (webServer). Measure INSIDE a spec; never foreground a server (see AMENDMENT below).

## Pre-flight (SAFE-DUPE — RESET AUTHORIZATION baked in)
`lane/perf` is content-merged and **0-ahead of main** as of s213 (`git log main..lane/perf` empty — perf-04 `1238eba`/`8529d6a` all landed via `0737818`+`a865e54`). So the reset is **loss-free**: run `git checkout -B lane/perf main && git clean -fd`, then `npm install`, then `npm run build` (must be green) and PROCEED. **STOP only** if `git status` shows uncommitted foreign edits you did not create, or `git log main..lane/perf` is NON-empty (would mean undrained content — do not reset, report instead).

## Why (owner vision: the game must feel instant to a kid on a school laptop)
Boot cost has never been measured against a budget. The ladder's last two rungs cut *frame* cost (perf-03 draw-calls 212→154 desktop; perf-04 proved sim determinism); perf-05 cuts *startup* cost. Everything non-critical to the first playable frame should load behind it — the deferral idiom already exists in `main.ts`, this generalizes it to assets/UI and puts a budget assertion around it so it can't rot.

## Scope (each item testable)
1. **MEASURE (report before/after, real numbers):** add a boot-metrics probe (a `?debug&boot` or perf-spec-internal harness, NOT normal-boot behavior) capturing **TTI**, **time-to-first-frame**, and **total asset bytes transferred on boot**. Report the baseline table before any change.
2. **PRELOAD ONLY CRITICAL:** hero + terrain + enemy textures load eagerly (needed for the first frame / first wave). Everything else is non-critical.
3. **LAZY-LOAD THE REST behind first frame:** menu icons, victory art, action-cell art, and any panel-only textures move behind a `void import(...)`/deferred fetch (mirror the `main.ts` StatSimHarness idiom). **Prefetch on the wave-1 telegraph** so there is **NO pop-in** on the first enemy or first build.
4. **BUDGET ASSERTS (e2e, both projects):** new `e2e/perf-05-startup.spec.ts` asserts — boot-to-playable **< 3s** on a throttled CPU/network profile; **zero asset 404s**; the lazy set is **actually deferred** (network-log assert: non-critical textures are NOT requested before first frame); no pop-in (the prefetch fires before the wave-1 spawn).
5. Report the after-table (TTI / first-frame / boot bytes, before→after deltas).

## Firewall
TOUCH ONLY: boot/load ordering in `src/main.ts`, the asset-load/deferral code in `src/assets/*` (generated/slots/SpriteAnimator load timing), a boot-metrics probe (debug-gated or spec-internal), `e2e/perf-05-startup.spec.ts`, and `artifacts/perf-05/`.
NO: sim/gameplay/Economy/Combat semantics, no Balance changes, no rendering-visual changes (this is *when* assets load, never *what* renders), no changes to perf-01/02/04 specs, no normal-boot behavior change beyond load timing (the game must look/play identically — only faster to start).

## AMENDMENT (s9y — lane-d hung on a foreground server): NEVER run `npm run dev`/`vite preview` as a blocking foreground command — you will hang forever. Either (a) let Playwright own the server (base `playwright.config.ts` webServer starts/stops it per run — PREFERRED: measure TTI/first-frame INSIDE a spec via performance marks + CDP), or (b) background it: `(npm run dev >/tmp/dev.log 2>&1 &) && sleep 4`, measure, then `kill %1`/`fuser -k` the port before finishing. Verify the port is free at task start AND end.

## Self-check (before done-move)
- `npx tsc --noEmit` clean; `npm run build` green (report any new lazy chunk sizes).
- `e2e/perf-05-startup.spec.ts` GREEN desktop + 390px mobile (budget asserts + deferred-set + no-pop-in all pass).
- Adjacent UNMODIFIED-green both projects: `perf-01-stress-budget`, `perf-02-fullbase-bench`, `perf-04-determinism`, `m1-01`, `m2-01`, `task-025` (single-worker if load-flaky; fingerprint any known red).
- Plain boot (no `?debug`) has **zero console/page errors** AND is visually/behaviorally identical to pre-change (the deferral must be invisible except speed).
- Screenshots + the before/after metrics table into `artifacts/perf-05/`.
- Commit path-scoped on **lane/perf** with prefix `perf:`.

End: **READY-FOR-GATES** + the before/after boot-metrics table (TTI / first-frame / boot-bytes) + the lazy set you deferred + the chosen throttle profile + results.
