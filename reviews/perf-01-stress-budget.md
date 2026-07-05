# Review: lane/perf — PERF-01 sprite stress budget diagnostics

> **STATUS: MERGED (s34, 2026-07-05) — on main as `a0d2458`, cross-merged with 020/021 at `2254ff8` (post-merge smoke: tsc/build, perf-01, vp-02 mirroring+hit-pause, pip, xp-audit — all green).**
> All gates below ran green on the true merge candidate (main d801243 x lane 6c4d0f3, conflicts
> resolved semantically). First land attempt aborted: the lane-runner was live-editing the main
> tree (tasks/020/021) — integration order inverted, candidate re-lands after their per-slice
> review. Gate record: `reviews/gate-progress.json` s34.
>
> Gate results: tsc + vite build clean · perf-01 2/2 both projects · vp-02 desktop 11/11 (tiling
> verified against source: 11 titles) · vp-02 mobile 9/11 — 2 failures are PRE-EXISTING env
> baseline, stock-main repro'd (`reviews/vp02-mobile-env-baseline.md`) · vp-02b desktop 5/5 ·
> m4-01 8/8 both · m3-01 8/8 both · m1-05 6/6 · stress boot probe (stress=120&profile) zero
> console/page errors desktop+390 · shots: `reviews/shots-perf-01/`.
>
> Merge notes: Game.ts conflicts trivial (imports + helpers + shared-closing-brace). SpriteAnimator
> conflict NON-trivial — lane's triple dedup guard predates main's vp-02 mirroring refactor; resolved
> by keying the guard on the RESOLVED (mirror-aware) frame (`resolvedKey = key + '#m'` when mirrored,
> map compared against the resolved texture, userData tagged with resolvedKey). Escalation per s23:
> compensated with FULL vp-02 both projects + vp-02b instead of smoke. F2 dedupe: vite-env.d.ts
> auto-merged clean, tsc confirms no duplicate identifiers.

Lane: `lane/perf`, single commit `6c4d0f3` "perf: add sprite stress budget diagnostics" (2026-07-04 14:34Z), 5 files, +218/−4.
Task: `tasks/lane-d-perf-01.md` — diagnostics + measurement ONLY; the one sanctioned fix is the frameKey cache.

## Scope verdict: CLEAN

Every deliverable in the task is present and nothing beyond it:

1. **spriteStats diagnostics** — module-level counters in `SpriteAnimator.ts` (`activeAnimators`, `textureSwapsPerFrame`, reset per frame via `beginSpriteStatsFrame(frame)` called at the top of `Game.update`), exposed through `getDiagnostics().spriteStats` with `fadeOverlaysActive` supplied by `Game`. Type added to `vite-env.d.ts`.
2. **`?profile` harness param** — `DebugParams.profile` flag + `isProfileEnabled()`; `Game.recordProfileSample()` accumulates frameMs + `renderer.info.render.calls` and emits one `console.table` row per ~5s window (p50/p95/max drawCalls), then resets. Off by default; zero cost when disabled beyond one boolean check per render.
3. **New spec `e2e/perf-01-stress-budget.spec.ts`** — boots `?debug&stress=120&timescale=3&nowaves&nolevel&nokill&profile&seed=perf-01`, grants gold, places 12 palisades via `__GR_TEST__`, then runs a 5.25s in-page rAF max-tracker (house style per s6 lesson) asserting: `maxDrawCalls ≤ 200`, no frame with `textureSwapsPerFrame > activeAnimators`, `stressCount === 120`, enemies alive, >10 samples, zero console + page errors. Timeout 45s, poll-tolerant.
4. **Sanctioned cheap fix** — `SpriteAnimator.setFrame` now skips redundant material updates behind a triple guard: `lastFrameKey !== frame.key || material.map !== frame.texture || texture.userData.spriteFrameKey !== frame.key`. The `userData` clause is cross-animator invalidation insurance for shared frame textures (write-once in the common per-frame-texture layout). repeat/offset writes now happen only inside the guard, which is the actual saving. This is exactly the fix the task authorizes, nothing bigger.

No gameplay, sim, economy, or combat changes. Naming and diagnostics style match house patterns (in-page tracker, `__THREE_GAME_DIAGNOSTICS__` extension, debug-param plumbing).

## Findings (non-blocking, carry to gates)

- **F1 (merge attention, the real risk):** all 4 src files overlap main-side changes since merge-base `0f875e0` — 016 touched `SpriteAnimator.ts`, m4-01 touched `Game.ts` (+ likely `vite-env.d.ts`), and `DebugParams.ts` has drifted. Expect textual conflicts in `Game.ts` (import block, `update()` head, `getDiagnostics()` object) and `vite-env.d.ts` (`ThreeGameDiagnostics`). Resolve with a real 3-way in the /tmp preview; the mount merge stays plumbing-path with md5-verified resolved blobs.
- **F2:** `vite-env.d.ts` adds `direction?`/`mirrored?` to `spriteAnimations` entries — 016 may have already added these on main; dedupe rather than duplicate on merge.
- **F3 (nit):** spriteStats counters reset in `update()`, so a `getDiagnostics()` poll landing mid-update reads a partial frame. The spec's rAF tracker reads post-update, so its numbers are consistent; fine for a max/budget test, would matter if anything ever asserts exact equality.
- **F4 (nit):** `fadeOverlaysActive` is a coarse sum of three UI states (damage flash, dead, levelup) rather than a render-layer count. Matches the task's letter; note it so nobody treats it as an overlay-mesh census.
- **F5 (watch):** if any future clip layout maps multiple frame keys onto one shared texture object with differing repeat/offset, the `userData` guard degrades to per-frame re-apply + `needsUpdate` churn for every co-holder — bounded by the spec's `swaps ≤ animators` assert, and vp-02's "frameKey alternates" / "crossfades once" / "stride cells|mirrored pixels" tests are the semantic canaries. Not a today problem.

## Gates owed (per v2 drain protocol)

tsc/build on the merged preview; `perf-01` both projects; vp-02 11/11 with `--list` tiling check (rotation trio hides outside the historic groups); m4-01 8/8 (Game.ts touched); m3-01 8/8 (cheap); boot probe desktop + 390px with zero console errors; screenshots → `reviews/shots-perf-01/`. No FULL regression required — no sim-semantics change — unless conflict resolution in `Game.ts` turns out non-trivial, in which case escalate per s23 law.
