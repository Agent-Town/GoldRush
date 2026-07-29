# standing-orders-wave-early-seam — the "25% mobile-only flake" was a deterministic spec-sequencing bug

**Slice:** `standing-orders-wave-early-seam` · **Branch:** `lane/perf` · **Tip:** `6999e57a` · **Drained:** s1222, 2026-07-29
**VERDICT: PASS — merged.** The runner determined the mechanism, cured it in the spec, and left `src/` byte-untouched. The drain re-measured both arms on the merged tree and found the pre-cure red **harder than anyone had recorded** — see F-1222-3.

## What it does

`e2e/ap-standing-orders.spec.ts` has been carrying an inherited flake label since F-1212-2 (`:121`, *"measured 25% mobile-only at w4"*), and three fires in a row treated it as noise to be routed around. It is not noise. The runner found the mechanism and it is entirely in the **spec's sequencing**, not in `StandingOrders.detectSurprises`:

With `?nowaves&timescale=8`, the spec could let the scheduled wave countdown **expire** before it called `startWaveForTest(1)`. At the deciding tick the runner captured, in both projects:

| project | `at` | wave | `expectedWaveAt` | `nextWaveInSim` before → after | early guard |
|---|---|---|---|---|---|
| desktop | 76.2667 | 0 → 1 | 30.2667 | 0 → 30 | **false** |
| mobile | 61.6 | 0 → 1 | 30.2667 | 0 → 30.000000000000007 | **false** |

`startWaveForTest(1)` resets the next-wave timer to 30 s, but it **cannot make an already-expired expectation early** — so `wave_early` never fired and the assertion at `:121` correctly rejected the transition. The product was right; the test was asking the wrong question at the wrong moment.

The cure is test-only: freeze manual simulation, `setWave(0)` to establish a fresh countdown, install Standing Orders, advance one fixed tick, force wave 1, advance one fixed tick, resume. Plus a new seam test that **deliberately expires the countdown first**, so the failure mode can never come back silently.

**Nothing else moved.** `git show --name-only 6999e57a -- src/ functions/ assets/ package.json playwright.config.ts` is **empty**: no product source, no timeout, no retry, no worker config, no `playwright.config.ts` — i.e. none of the four cures that would have hidden the bug instead of fixing it.

## Evidence (re-measured by the drain on the merged tree)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean, no output |
| `npx vite build` | **✓ built in 1.08 s** |
| `npx playwright test --list` | **2466 tests in 344 files** — LB-03's 2464 + 1 new test × 2 projects, exactly as reported |
| `run-guards.mjs` | **8/8 PASS**, incl. `test:node-guards` rc=0 and `test:task-guards` rc=0 |
| `probe-plain-boot-console.mjs` | **PROBE CLEAN** — desktop 1280×800 and mobile 390×844, 0 errors / 0 warnings / 0 pageErrors |

### The two arms, counted per project — never pooled

s1221's standing warning was explicit: *a pooled 0/16 proves nothing.* Both arms below were run one after the other in the same box, same command shape, same scratch server.

**TREATMENT — the merged tree** (`--repeat-each=8 --workers=4`, literal `Running 32 tests using 4 workers`):

| project | pass | fail |
|---|---|---|
| desktop-chrome | **16** | **0** |
| mobile-chrome | **16** | **0** |

`32 passed (2.1m)`, **exit 0**, under 1-minute **loadavg 25.28** — lane-a was live on Codex throughout. A green under that load is worth more than a quiet one.

**CONTROL — main's pre-cure spec blob `6a68e219`, everything else identical** (`--repeat-each=4 --workers=4`, literal `Running 8 tests using 4 workers`):

| project | pass | fail |
|---|---|---|
| desktop-chrome | **0** | **4** |
| mobile-chrome | **0** | **4** |

`8 failed`, **exit 1**. Every failure is the same test, `ap-standing-orders.spec.ts:80:1 › seeded standing orders obey priority, gates, legal actions, surprises, and the live rung` — the one containing the `:121` assertion. Restored to the cured blob byte-identically afterwards (`855ed888` = `6999e57a:e2e/ap-standing-orders.spec.ts`).

**0/8 → 32/32 across the single blob under test. The cure is real and the assertion is not tautological.**

## Findings

**F-1222-3 — the inherited "25% mobile-only at w4" label was a LOAD SAMPLE, not a property; at drain-time load this red is 100% in BOTH projects.** *(informational, closed by this merge — but the lesson outlives it)*
The master's own known-reds block, F-1212-2, and three fires' worth of routing-around all described `ap-standing-orders:121` as *"measured 25% mobile-only at w4"*. My control measured **8/8 — desktop 4/4 and mobile 4/4, 100% in both projects.** So the failure was never mobile-only and, at the load a real drain runs under, never a flake either.

**I checked the obvious alternative explanation rather than assuming mine.** LB-03 merged into main forty minutes earlier and it touches `Game.ts`, and the spec's URL carries `seed=ap-standing-orders` — a **non-member** pinned seed, which LB-03 teaches the client to stop submitting. A plausible story for a fresh 100% red. It is refuted by an independent measurement that already existed: **the runner's own BEFORE arm was 16/16 FAILED in `worktrees/lane-d`, a tree that predates LB-03 entirely.** Two measurements on opposite sides of that merge agree at 100%, so LB-03 is not the variable. ➡️ The consistent reading is a **load ceiling, not a line**: the countdown race saturates as the box gets busier — 25% at s1218's load, 100% at loadavg 25. **The lesson to carry: a flake rate quoted without the load it was measured under is a number with no denominator, and "mobile-only" survived three fires purely because nobody re-ran the desktop arm.**

## Merge classification

Base: the branch tip's parent blob for the one real file is `6a68e219`, **identical to main's** — main never moved `e2e/ap-standing-orders.spec.ts`. `logs/session-scratch/s1219-wave-early/` is absent from main (pure add, 38 retained measurement files kept per the RETENTION LAW — the rate tables and every raw run are evidence, not debris).

| Path | Class |
|---|---|
| `e2e/ap-standing-orders.spec.ts` | LANE-TOUCHED, main unmoved → clean apply |
| `logs/session-scratch/s1219-wave-early/**` (38 files) | pure add |

No MAIN-MOVED file, no 3-way graft, no conflict. Merged path-scoped by `git checkout 6999e57a -- <both paths>`. Browser gates ran on **scratch port 5231** (`GR_CAPTURE_BASE_URL` + `GR_CAPTURE_EXTERNAL_SERVER=1`) because the default config's 5188 is shared with the live lane worktrees.

## Note for the next fire

`e2e/ap-standing-orders.spec.ts:121` and the "25% mobile-only" line should be **struck from every known-reds block that still carries them** — the next master that copies that warning forward will be quoting a number that is now false in both directions. It is not in `logs/suite-red-inventory.md` (checked); it lives only in task-master prose.
