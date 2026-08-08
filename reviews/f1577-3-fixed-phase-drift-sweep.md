# F-1577-3 — fixed-phase drift sweep

## Verdict

**NEGATIVE RESULT: pinning `simulation.tick` does not reproduce or move the breach band.** Across 1,680 pinned samples (four `tickBefore` values × 70 windows × three runs × two projects), no `driftAbs` reached `0.4`. The drain gate's clean/breach split therefore is not explained by `tickBefore` alone.

The sweep also found why that conclusion must stay narrow: `tickBefore` is not the Prospector's complete motion phase. At `timescale=4`, normal loop ticks advance `timeAlive` four times as quickly as `advanceSim` ticks. The same pinned tick therefore arrived at different `timeBefore` values across runs, while `Embodiment.ts` drives idle oscillation from `timeAlive`. A cure must pin the motion clock as well as the tick/window; pinning only `(tickBefore, tickDelta)` is still under-specified.

## Fixed-phase result

All entries aggregate three serial desktop runs and three serial 390 px mobile runs. Raw samples are in `artifacts/f1577-3-fixed-phase-sweep/<project>-P<NN>-run-NN.txt` (70 lines each).

| Start tick | `driftAbs >= 0.4` band | Largest observed drift through window 70 | Observed `timeBefore` range |
|---:|---|---:|---:|
| P=35 | none | 0.380000 at window 69 | 2.466667–3.066667 |
| P=39 | none | 0.368978 at window 67 | 3.300000–3.700000 |
| P=43 | none | 0.346144 at window 63 | 3.433333–3.933333 |
| P=47 | none | 0.323360 at window 59 | 3.566667–3.966667 |

**Does the band move with start phase? No.** There is no band at any requested tick phase through window 70. Thus the gate's five clean runs versus its P=47 breach need another explanation. The measured hidden axis is `timeAlive` (and possibly receipt timing before the pin), not `simulation.tick` alone.

## Named target

**Recommended measured target: `(start tick P=35, window=11)`**, preserving the existing test's 0.35 s / 11-fixed-step semantic. Its worst-case `driftAbs` across all six refreshed runs was **0.046754678910244166**, giving a **0.35324532108975587 margin below 0.4**. This is the largest margin among measured windows `>=11`.

This target is safe only inside the requested tick-pinned harness. It is not yet a sufficient cure because P=35 mapped to three distinct `timeBefore` values spanning 0.6 s. A production cure must pin that clock too, then re-measure before changing `m4-06`.

## Harness

- The existing f1575-1 test (lines 19–58) is byte-identical to `HEAD`; `cmp` returned 0.
- Four additive tests use P=35/39/43/47. Each reaches permission denial, then one `page.evaluate` latches manual simulation, advances the shortfall, asserts exact `tickBefore`, and makes 70 separate `advanceSim(1/30)` calls. Each call flushes presentation; the forbidden `onTick` sampler is not used.
- Every sample records `tickBefore`, `tickDelta`, `driftAbs`, `gapClosed`, and the diagnostic `timeBefore` that exposed the hidden clock.
- Zero console and page errors are asserted in every phase test.

## Evidence

| Gate | Result |
|---|---|
| Required pre-flight greps | `1`, `1`, `1` |
| `npx tsc --noEmit` | rc=0 |
| Final `npm run build` | rc=0; Vite `1.22s` |
| Asset diet | Herald `1158214 / 1500000`; 235 GLBs `592044952 -> 92718740` (84%); 54 PNGs `187042157 -> 24822346` (87%) |
| Fixed-phase desktop, runs 01–03 | `4 passed` each; added-test cost 8.0 s, 7.8 s, 8.0 s |
| Fixed-phase mobile, runs 01–03 | `4 passed` each; added-test cost 8.0 s, 8.0 s, 8.2 s |
| Final full f1575-1 spec, desktop | `5 passed (11.5s)`, rc=0 |
| Final full f1575-1 spec, mobile | `5 passed (11.5s)`, rc=0 |
| Whole m4-06, desktop | `10 passed (42.8s)`, rc=0; denied line: `[m4-06-denied] driftAbs=0.30904530412222725 gapClosed=0.30863110994026144 tickBefore=25 tickAfter=49 tickDelta=24 simSecondsDelta=2.1000000000000014` |
| Whole m4-06, mobile | `10 passed (42.6s)`, rc=0; denied line: `[m4-06-denied] driftAbs=0.3722002149381437 gapClosed=0.37139096406706074 tickBefore=25 tickAfter=50 tickDelta=25 simSecondsDelta=2.233333333333335` |

No pinned or adjacent denied-drift run breached `0.4`; there is therefore no breach line to exclude or re-run away. The two early harness reds are retained as `desktop-chrome-invalid-harness-run.txt` (rAF ticks between protocol calls) and `desktop-chrome-invalid-console-run.txt` (reload aborted an in-flight GLTF blob). Both were instrument failures, fixed by keeping all single-tick calls inside one evaluate and giving each phase a fresh Playwright page.

The independent `codex review --uncommitted` run found the tick/`timeAlive` mismatch and reproduced it directly. I verified the finding against `Game.ts`: `simTick` increments per update, normal simulation multiplies delta by `simTimeScale`, while `advanceSimForTest` divides its frame delta by that scale. The reviewer later recursively launched another review and was terminated; no other finding was emitted.

`npm run test:node-guards` was not run because the diff touches no trigger path. Screenshots are not owed because this slice renders nothing new. Playwright-regenerated existing PNG evidence was discarded under the factory-churn exception; no screenshot is part of this slice.

## Adjacent finding deliberately not fixed

The task calls `simulation.tick` the start phase, but the Prospector oscillation actually consumes `timeAlive`. This is a test-design defect in the prescribed measurement, not a request for `src/**` changes. No source, m4-06 assertion, threshold, package, config, or other e2e file was changed.

---

## DRAIN GATE — s1579

**VERDICT: MERGED** at `bc64e04895add67e0525a1382b54443c40489d59`. Base clean main `25d9be0af`; gated in a detached scratch worktree (`worktrees/gate-s1579`, §3.0b custody) so undecided content never entered main's working tree.

`drain-block-check`: **CLEAR** — leaf `f1577-3-fixed-phase-drift-sweep` matched with `status="queued"` (a real leaf, not the advisory UNKNOWN path).

### Merge classification

Merge-base `9d4182c9d`. Main moved **9** files since that base (`.claude/skills/author-task/SKILL.md`, `STATUS.md`, `logs/**`, `scripts/law-pointer-baseline.json`, `tasks/BACKLOG.md`, `tasks/goals.json`, `tasks/lane-b-f1578-1-*.md`); the lane touched **40**. **The intersection is EMPTY** — every lane path is LANE-TOUCHED, nothing is MAIN-MOVED, no BOTH-MOVED file exists, and no three-way graft was needed. `git merge --no-ff` reported zero conflicts.

Firewall: clean. Outside `artifacts/f1577-3-fixed-phase-sweep/**` the lane touched exactly the two permitted paths — `e2e/f1575-1-drift-tick-budget.spec.ts` and this review. The spec diff is **purely additive** (one hunk, `@@ -56,3 +56,57 @@`, 54 insertions / 0 deletions), so the banked f1575-1 test at `:19` is byte-unchanged — verified from the diff shape at the gate, not from the report's `cmp`.

### Gate battery (merged tree, `--workers=1`, serial)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc=0, no output |
| `npm run build` | green, Vite `1.17s`; Herald `1158214 / 1500000`; 235 GLBs `592044952 -> 92718740` (84%); 54 PNGs `187042157 -> 24822346` (87%) |
| `e2e/f1575-1-drift-tick-budget.spec.ts` desktop | **5 passed (12.6s)** |
| `e2e/f1575-1-drift-tick-budget.spec.ts` mobile 390px | **5 passed (11.7s)** |
| adjacent `e2e/m4-06-embodiment.spec.ts` desktop, whole file | **10 passed (42.4s)**; `[m4-06-denied] driftAbs=0.20800000000000016 gapClosed=0.20675740724312952 tickBefore=30 tickAfter=55 tickDelta=25` |
| adjacent `e2e/m4-06-embodiment.spec.ts` mobile, whole file | **10 passed (42.7s)**; `[m4-06-denied] driftAbs=0.3722002149381437 gapClosed=0.37139096406706074 tickBefore=26 tickAfter=50 tickDelta=24` |
| console / page errors | zero, asserted in-spec, both projects |
| `npm run test:node-guards` | **not owed** — F-1460-1's trigger is `src/sim/`, `src/systems/`, `src/entities/`; this diff is `e2e/** + artifacts/** + reviews/**` only, confirmed by `git diff --name-only` rather than by the report's say-so |
| screenshots | not owed; this slice renders nothing new |

No denied-drift breach occurred in either adjacent run, so there is no red to fingerprint or excuse.

### Evidence re-derived at the gate, not inherited

All 24 raw sample files were reparsed independently:

- **1,680 samples**, 420 per phase — matches the report's claimed count.
- **The pin held on every single sample**: no line's `tickBefore` differed from its file's `P`. The exact-phase assertion is real, and the harness reports a miss rather than silently accepting one (`expect(before.simTick, \`phase ${phase} was unreachable...\`).toBe(phase)`).
- **Per-phase maxima match the report to 6 dp**: P=35 `0.380000` · P=39 `0.368978` · P=43 `0.346144` · P=47 `0.323360`.
- **Global max `driftAbs` = 0.37999999999999995** (desktop P=35 run-03, window 69). **No breach — the negative result is confirmed.**
- **The named target is the true optimum**, not merely a good one: of every measured `(phase, window>=11)` pair, **zero** have a smaller worst-case than `(P=35, w=11)` at `0.046754678910244166`, margin `0.35324532108975587`.
- **The second axis reproduces**: at P=35 the same pinned tick yielded `timeBefore` of 2.466667 / 2.566667 / 3.066667. The gate's own fresh mobile run added a **fifth** value at P=47 (`3.4666666666666632`, outside the report's stated 3.566667–3.966667 range) — widening the spread rather than contradicting it.
- Corroboration the report did not claim: the gate's fresh mobile m4-06 run produced `driftAbs=0.3722002149381437`, **identical to 16 digits** to the report's banked mobile figure, at a **different** `tickBefore` (26 vs 25). Same drift, different start tick, is direct independent evidence that `simulation.tick` is not the determinant.

### F-1579-1 — the pinned harness suppresses the very oscillation it was built to locate (NON-BLOCKING)

The report's verdict and its hedge are both correct, and it names the mechanism (`timeAlive` vs `simulation.tick`). This finding follows that mechanism through to its consequence, because the **Named target** section can otherwise be read as a ready-to-use cure parameter.

✓ **MEASURED at the gate over all 24 runs / 1,656 sample-to-sample transitions:**

- `driftAbs` is **monotonically non-decreasing in every run** — **zero** decreases; the largest decrease observed is exactly `0`.
- Motion **saturates and stops** between window **51 and 69** in all 24 runs; `maxDrift == finalDrift` everywhere.
- `|driftAbs - gapClosed| <= 0.0144` across all 1,680 samples — the displacement is essentially **net travel toward the node**.

⚠️ **That is a qualitatively different curve from the one this task exists to explain.** The ladder curve quoted in the master rises to a **0.459 peak**, decays to **0.008** (the Prospector returns almost exactly to where it started), then rises again to 0.215 — an **oscillation**. The pinned sweep never returns: it walks, then freezes.

➡️ **Reading — CORRECTED in the same fire, before any successor scope was written.**

⛔ **The first version of this section was wrong, and it is left here named rather than quietly swapped:** it said *"`Embodiment.ts` drives idle oscillation from `timeAlive`, so the pinned regime advances the oscillation phase ~4x more slowly per tick and the oscillation is switched off."* That inherited the runner's attribution and added confidence to it. ✓ **Refuted by reading the code** (prompted by `/author-task` §0.2, which requires verifying a premise on current main before writing scope from it):

1. The idle bob is driven by **`presentationAt`**, not `timeAlive` — `src/agent/Embodiment.ts:160`.
2. **The bob cannot enter `driftAbs` even in principle, which is the decisive point.** It is a **Y-axis** displacement of amplitude **0.045** (`src/game/Balance.ts:252`, applied via `floatY` at `Embodiment.ts:316`), while the spec's `distance()` is `Math.hypot(a.x - b.x, a.z - b.z)` — **x/z only** (`e2e/f1575-1-drift-tick-budget.spec.ts:15`). A 0.045 **vertical** bob cannot contribute anything to a **planar** metric, let alone a 0.459 excursion. Whatever the oscillation in the ladder curve is, **it is not the idle bob.**

✅ **THE VERIFIED PICTURE — every clock in the pinned harness runs exactly 4× slower PER TICK, and the ratio is the same for both.** Established by reading `Loop.ts`'s constructor and every `setTimeScale` caller, because a first pass at this got it wrong by assuming `Loop.timeScale` carried the `?timescale=4` param. **It does not** — `Loop.timeScale` is `1` by default (`Loop.ts:35`) and is only ever set for replay speed (`Game.ts:6211…6260`); the `timescale=4` param lives in `Game.simTimeScale` and enters at `Game.ts:2499`. With `stepSeconds = FIXED_SIM_STEP_SECONDS = 1/30` (`Game.ts:953`):

| clock | live loop (`?timescale=4`) | manual sim (`advanceSimForTest`) | ratio |
|---|---|---|---|
| ticks per real second | `1 / stepSeconds` = **30** | n/a (driven by call count) | — |
| `presentationAt` per tick | **1/30 s** | `(steps × 1/30) / scale` = **1/120 s** (`Game.ts:6831`) | **4×** |
| `timeAlive` per tick | `simDelta = (1/30) × 4` = **2/15** (`Loop.ts:132` → `Game.ts:2499`) | `(1/120) × 4` = **1/30** (`Game.ts:6843`) | **4×** |

➡️ **So the pinned harness advances every time-driven behaviour at one quarter of the live rate per tick** — the presentation clock and the simulation clock alike. The runner's headline ("normal loop ticks advance `timeAlive` four times as quickly as `advanceSim` ticks") is **exactly right**; only its attribution of the *consequence* to the idle bob was wrong, and per point 2 the bob could not have mattered either way.

**The conclusion is unchanged and now rests on verified evidence:** at a given tick count the pinned sweep has advanced the simulation's own clock 4× less far than the live loop had, so it is measuring a genuinely different regime. Its null result and its margin belong to that regime, not to the live one.

💡 **The lesson is worth more than the correction, and it repeated inside this very section.** The runner asserted a mechanism; this gate elaborated it confidently; the first correction then over-reached in the opposite direction by assuming `Loop.timeScale` carried the timescale param. **Three readings, two wrong, all of them plausible — the stable facts came only from opening `Embodiment.ts`, `Balance.ts`, the spec's `distance()` helper and `Loop.ts`'s constructor and reading what they say.** The one claim that never wobbled is the one that needed no causal story at all: a Y-axis bob cannot move an x/z metric.

**Therefore:** *"no band at any start phase"* is a sound statement **about the manual-sim regime**, and **not** evidence that start phase is irrelevant in the live regime where the breach was observed. Correspondingly the `0.35324532108975587` margin was measured with the **dominant error term suppressed**, and **must not be carried into a re-pin of the live-loop `m4-06` assertion**. The report already says the target is "safe only inside the requested tick-pinned harness"; this records *why*, with numbers, so the next task cannot mistake it for a transferable budget.

**This is not a defect in the slice.** The master prescribed a tick-pinned harness; the runner built exactly that, banked every sample, reported the negative result without laundering it, and flagged its own narrowness unprompted. The measurement still owed — a sweep with the **motion clock** pinned too, or one under the live loop — is new scope, not a rework.

### Adjacent, upheld and deliberately not fixed

The runner's own adjacent finding (the master calls `simulation.tick` "the start phase" while the oscillation actually consumes `timeAlive`) is **upheld**, and is the same root as F-1579-1.
