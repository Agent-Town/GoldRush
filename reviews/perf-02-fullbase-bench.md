# Drain review: perf-02 full-base benchmark + M6-r3a audit doc (s88)

**Verdict: PASS — merged to main.** Focused drain of `lane/m6-r3a-apply` commit `ccd084d` only.
The stacked m6 actors salvage (`72db71b`) was **deliberately NOT merged** — see §Classification.

## What landed

Cherry-pick of `ccd084d` (perf-02 output that landed on the r3a scratch branch by wrong-branch context, per its own commit note), reconstructed by file tools because headless `git cherry-pick` is not allowlisted. Six files, all additive:

| File | Change |
|---|---|
| `src/diagnostics/fullBaseBenchmark.ts` | NEW — `?bench=fullbase` harness: builds the 20-piece full base, samples baseline + waves 12–15, writes `window.__BENCH_REPORT__` (draw-call ≤200 + p95-ratio ≤2 budgets). |
| `e2e/perf-02-fullbase-bench.spec.ts` | NEW — gates the bench report both projects. |
| `reviews/m6-r3a-audit.md` | NEW — the M6-r3a attempt verdict doc (owner-facing). |
| `src/core/DebugParams.ts` | `bench=fullbase` ⇒ debug=true, seed=`perf-02-fullbase`, timescale=24. |
| `src/main.ts` | import + bench-param URL bootstrap (debug/nolevel/nopause/seed/timescale) + `installFullBaseBenchmark()` call. |
| `src/vite-env.d.ts` | `Window.__BENCH_REPORT__?: unknown`. |

### Integration note (main.ts drifted)
`ccd084d` was authored pre-ProfileManager. Current main creates the Game inside the `installProfiles(...)` start callback. Verified this does NOT break the bench: `shouldShowProfileTitle()` returns false for any non-empty query without `profiles`, so `?bench=fullbase` **auto-starts** the game (no picker). The `installFullBaseBenchmark()` call was placed after the profiles-install block; it polls up to 5s for `__GR_TEST__`/`__THREE_GAME_DIAGNOSTICS__`, which appear once the debug-mode game starts. `nolevel`/`nopause` flags still exist and are consumed.

## Classification — why the m6 salvage did NOT merge (F-PERF02-1)
`72db71b` ("m6 salvage parked attempt-2/3 partial") touches `Game.ts`/`CombatSystem.ts`/`Balance.ts`. The bundled audit (`reviews/m6-r3a-audit.md`) explicitly recommends **attempt-4-scope**: "Do not integrate `lane/m6-partial-salvage` as a branch." The salvage was cherry-picked onto **e738424-era** main; current main has moved 89 commits (SCI-02, 041 turret, W1) — its `Game.ts` refactor is now stale vs latest. The perf-02 files are provably independent of the actors API (no `actor`/`primaryActor`/`Hero[]` references), so landing them alone is clean. The M6 actor plumbing remains a future owner-gated attempt-4 slice; the code is preserved on `lane/m6-r3a-apply` (`72db71b`) and `lane/m6-partial-salvage` (`6f4aca6`). **Robin still owes the M6 attempt go/no-go verdict** (the audit is the recommendation, not the decision).

## Evidence
- `npx tsc --noEmit` — clean.
- `npm run build` — pass (461ms; pre-existing >900kB chunk warning only).
- `npx playwright test --config pw.reuse.config.ts --workers=1 e2e/perf-02-fullbase-bench.spec.ts` — **2 passed** (desktop-chrome + mobile-chrome, 23.1s). Report: `test-results/perf-02-fullbase-bench/<project>.json` (status pass, build.placed=20, waves=4, draw calls ≤200, no GL errors).
- Adjacent regression (`--workers=1`): `m3-06-demo-profiles` + `m2-01-build-menu` + `m1-01-claim-jumpers-death` + `task-025-bandits-dont-swim` — **38 passed** both projects (2.6m). Zero console/page errors asserted throughout (boot probe covered desktop 1280 + mobile 390).
- Gates ran on port 5189 (pw.reuse vite spin-up); lane-c live runner works in its own worktree — no contention.

## Findings
- **F-PERF02-1 (informational, not blocking):** m6 actors salvage held back for attempt-4 per its own audit; owner verdict owed.
