# f1559-1 — M4-06 permission-denied: deterministic drift sample

**Slice:** `f1559-1-m4-06-deterministic-drift-sample`
**Branch:** `lane/b` · **Tip:** `fa2c180a5` · **Base:** `da7203e30`
**Merge:** `93e13a8b7e93f7a7f758672c322705cc87c59be8` (main, `--no-ff`, `ort`, no conflicts)
**Drained:** s1560, 2026-08-08

## VERDICT: MERGED — deliverable landed, and its own premise is refuted by the evidence it produced.

The slice did exactly what its master asked and the result **disproves the model that motivated it**. That is
the valuable outcome here, not a disappointing one: s1559 pre-committed to reading a non-collapse as a
finding rather than as a number to tune, and this drain honours that.

## What it does

Replaces the 350 ms wall-clock wait in `e2e/m4-06-embodiment.spec.ts:409` with
`window.__GR_TEST__!.advanceSim(0.35)`, so the sampling window is a fixed number of sim ticks instead of a
race against machine load. Banks 60 samples (30 desktop + 30 mobile) in
`artifacts/f1559-1-m4-06-deterministic-drift/samples.txt` and narrows two bounds to match the archived
distribution.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc=0 |
| `npm run build` | green, built in 1.04 s |
| m4-06 desktop-chrome `--workers=1` | **9/9 passed** (40.4 s) |
| m4-06 mobile-chrome `--workers=1` | **9/9 passed** (40.0 s) |
| adjacent m4-05 + m4-07 + m4-08 desktop | **9 passed, 1 skipped** (25.5 s) |
| console/page errors | none — the spec's own `expect(errors.consoleErrors).toEqual([])` passed in all arms |

All gates run on the **merged tree** in detached worktree `gate-s1560` (§3.0b), `--workers=1` (§3.1), machine
idle apart from a foreign-project `codex exec` (CIRCUIT3), measured not assumed.

**`test:node-guards` deliberately NOT run, and I state it rather than implying coverage:** the diff touches
`e2e/` and `artifacts/` only — no `src/sim/`, `src/systems/`, `src/entities/` — so **F-1460-1 does not bind**.

**Merge classification:** 2 files, both **LANE-ONLY**. Verified, not assumed:
`git log da7203e30..main -- e2e/m4-06-embodiment.spec.ts artifacts/f1559-1-m4-06-deterministic-drift/`
returns empty; main moved only STATUS/logs bookkeeping since the base.

**Firewall respected.** The master's FORBIDDEN GREENS were: widening any bound, restoring `waitForTimeout`
in any guise, re-asserting `after.lastLine`, touching `src/**`. The diff does **none** of them — both bound
changes are **narrowings** (`gapClosed` 0.45→0.4, `driftAbs` 0.6→0.4), and `src/**` is untouched.

## F-1560-1 — THE QUANTISATION MODEL IS REFUTED, AND THE REAL MECHANISM IS A MOVING TARGET THE WINDOW NEVER CONTROLLED

**The gate condition, answered:** the runner reports **10 distinct `driftAbs` values across 60 samples** and
its own summary line reads `quantisation model: readings remained multi-valued; model not confirmed`.
s1559 predicted collapse to a single value. **It did not happen, and per that row's own instruction this is a
finding.**

Counted from the artifact (not from the runner's summary):

| `driftAbs` | count |
|---|---|
| `0.3722002149381437` | **27** |
| `0.26277176408434727` | 12 |
| `0.3026763948510024` | 6 |
| `0.2833831328784402` | 5 |
| `0.33233868267175914` | 4 |
| `0.20800000000000016` | 2 |
| four singletons | 1 each |

🔑 **THE MECHANISM, VERIFIED BY READING THE PRODUCT RATHER THAN BY RE-RUNNING THE TEST.** A denied
receipt leaves the Prospector idle (F-1558-1 established this: `handleReceipt` returns early without setting
`moving`). An idle Prospector does not hold still — it runs `driftNearHero`, which chases an anchor that is
**itself a function of time**:

- `src/agent/Embodiment.ts:299` — the idle anchor is `hero.x - 1.8 + Math.sin(at * 0.78) * 0.22`. ✓ VERIFIED
- `src/agent/Embodiment.ts:292` — the step is `Math.min(distance, Balance.agent.moveSpeed * 0.58 * delta)`. ✓ VERIFIED
- `src/agent/Embodiment.ts:288` — it only drifts while `distance > 0.06`. ✓ VERIFIED
- `src/game/Balance.ts:250` — `moveSpeed: 4.8`. ✓ VERIFIED

➡️ **The reading is GAP-limited, not speed-limited, and the arithmetic settles it.** `advanceSim(0.35)` runs
`Math.round(0.35 / (1/30)) = 11` ticks = 0.3667 s. The idle-drift speed cap is `4.8 × 0.58 = 2.784` u/s, so
the window's speed budget is **1.021 units**. The observed maximum is **0.372** — **36% of the budget**.
The agent is therefore never clipped by the window; it travels its whole available gap and stops.

💡 **WHY THE CURE COULD NOT HAVE WORKED, WHICH IS THE REUSABLE HALF: `advanceSim` makes the WINDOW
deterministic, but the variance was never in the window — it is in the STATE AT THE WINDOW'S START.**
The gap the agent has left to close, and the phase of `sin(at * 0.78)` when sampling begins, are both set by
everything that happened *before* the first tick of the sample. Making the ruler exact cannot fix a
measurement whose subject moved before you picked up the ruler. **This generalises past this test: a
determinism fix aimed at a sampling window is inert against variance that enters upstream of it — check
which side of the boundary the noise lives on before authoring the fix.**

ⓘ **Consistent with, but not proof of, the anchor model (marked honestly): the 10 values are NOT evenly
spaced** — successive gaps run 0.0548, 0.0175, 0.0031, 0.0193, 0.0064, 0.0233, 0.0175, 0.0031, 0.0193 —
i.e. **the gap sequence 0.0175 / 0.0031 / 0.0193 repeats.** A sinusoid sampled at tick offsets produces
exactly this shape (levels that repeat in pattern but not in spacing), whereas s1559's model predicted
**uniform ~0.07 spacing**, which the data does not show. ? INFERRED — the periodic structure is strong
support for the anchor model, not a proof of it; proving it needs a run at a different `advanceSim` duration.

⛔ **CONSEQUENCE FOR F-1285-2: IT STAYS OPEN, AND ITS VERDICT IS CORRECTED A SECOND TIME.** It is not a
load ceiling (s1557 disproved that), not cured by the f1557-3 reorder (s1559 disproved that), and **not a
quantised sample whose bound sits in a gap** (this fire disproves that). It is a **bounded chase of a moving
idle anchor**, whose ceiling is geometric. The standing prohibition on widening `0.45` is **unaffected and
still correct**, but for a third reason: there is now a *named ceiling* to reason about instead of a
tolerance to argue over.

## F-1560-2 — THE NARROWED BOUND IS DEFENSIBLE, BUT IT NOW SILENTLY DEPENDS ON FOUR PRODUCT CONSTANTS NO GUARD NAMES

The runner narrowed `driftAbs` from `< 0.6` to `< 0.4`, leaving **0.0278 of margin (6.9% of the bound)** over
the observed max. Two things must be said, and they point opposite ways.

✅ **Why it is not as thin as it looks:** the max is the **MODE — 27 of 60 samples, bit-identical**. That is a
**saturation ceiling**, not a distribution tail; a continuous tail cannot hit the same double 27 times. The
agent completes its return to the anchor and stops, so the value is the *geometry* of the test, not a
sampling extreme. A 6.9% margin above a saturation value is a far better bet than 6.9% above a tail.

⚠️ **Why it is still a finding:** that ceiling is a function of `moveSpeed` (4.8), the `0.58` idle
multiplier, the `-1.8` follow offset and the `±0.22 / 0.78 Hz` oscillation — **plus the test's own pan
geometry**. None of those is named anywhere near the assertion; the surviving comment cites only a sample
max. A future slice tuning the Prospector's idle follow distance — an ordinary, legitimate change — will red
this e2e on mobile with **no hint of why**, and the next fire will read a 6.9% miss and reach for the
tolerance, which is the exact loop F-1285-2 has been stuck in for 275 fires.

🚫 **NOT CURED BY WIDENING IN THIS DRAIN, deliberately.** Restoring `0.6` would be *widening a bound* — the
precise act the master listed as a STOP, and it was listed so nobody papers over signal. The cheap correct
cure is a **comment naming the four constants** so a future red is diagnosable at the failure site, plus the
`driftAbs` line's own surviving description — *"Loose absolute-drift sanity bound, not the permission
rule"* — being reconciled with a bound now equal to the permission bound. **GATE: none — fire-authorable,
one comment-only slice, no `src/**`.** Not blocking: the slice is green 18/18 across both projects here.

## Findings

| ID | Verdict |
|---|---|
| **F-1560-1** | Quantisation model REFUTED; real mechanism is a time-dependent idle anchor, variance upstream of the window. F-1285-2 stays OPEN, verdict corrected. Non-blocking. |
| **F-1560-2** | Narrowed `driftAbs` bound is defensible (saturation, not tail) but couples an e2e threshold to four unnamed product constants. Comment-only corrective owed. Non-blocking. `GATE: none`. |

No blocking finding. No owner decision required — nothing here touches design, canon, or money.
