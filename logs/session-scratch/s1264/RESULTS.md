# s1264 — the newsie drift assertion: the discriminator, measured at the SUBJECT

Fire s1264, 2026-07-30, main at `924e98c9` (tree clean apart from the lock commit).
Subject: `e2e/gazette-welcome.spec.ts:88`, **unmodified shipped spec** — no probe, no proxy,
no instrumentation. Every number below is the shipped assertion's own `Received:` value.

## Why this run exists

s1263 measured this with a hand-built probe that inserted an extra `page.evaluate` between
the before-sample and the click, and then **refuted its own arm** when its authored master ran
the real subject and reproduced nothing (F-1263-4). The load arm it had used — 14 CPU spinners
at `--workers=1` — was the wrong experiment. F-1263-4 proposed the right one:
**concurrent browser instances, not machine load.** That proposal was itself an untested
hypothesis. This is the test of it.

## The three arms

| arm | command (all on `e2e/gazette-welcome.spec.ts`) | concurrency | loadavg at start | drift assertion (`:88`) |
|---|---|---|---|---|
| **A1 concurrent, whole file** | `--project=desktop-chrome --project=mobile-chrome --repeat-each=3` | default workers | **2.93** | **6 / 6 RED** |
| **A2 concurrent, whole file (repeat)** | same as A1 | default workers | 19.51 | **6 / 6 RED** |
| **A3 concurrent, drift test only** | same + `-g "fires once"` | **6 workers** (reported) | **2.13** | **6 / 6 RED** |
| **B control, serial** | same as A1 + `--workers=1` | 1 | **33.65** | **0 / 6 red** |

### The killer contrast

**Arm B ran at loadavg 33.65 and the drift assertion went 6/6 GREEN.
Arm A3 ran at loadavg 2.13 and it went 6/6 RED.**

The green arm was the *most heavily loaded* run of the session by an order of magnitude.
Machine load is not the variable. **Concurrent browser instances is the variable.**

## Measured displacements (shipped assertion, bound is `< 1`)

- A2 desktop-chrome: **3.222**, **4.030**, **4.666**
- A3 desktop-chrome: **3.739**, **4.358**, **3.521** · mobile-chrome: **2.813** (+2 more red)

Range **2.81 – 4.67** against a bound of **1**. Not marginal — 3–5× over.

## What this establishes and what it does not

✓ **ESTABLISHED — F-1263-4 is confirmed at the subject.** The discriminator is concurrent
browser instances. Reproduced 18/18 across three independent concurrent arms, twice on a
quiet box.

✓ **ESTABLISHED — machine load is refuted as the variable**, by a control that was green at
11× the load of a red arm. This retires F-1262-5's premise (which s1263 had inherited and
amplified before catching it) and restores F-1211-6's original discrimination.

✓ **SURVIVES from s1263, independently re-derived here from source** — the arithmetic.
`TownActorRuntime.update()` steps the newsie `min(remaining, delta * 7)`
(`src/town/TownScene.ts:2613`) = 7 world units/second, so `toBeLessThan(1)` *is* the assertion
"the observation window closed within ~143 ms". At 3.22–4.67 units the observed windows were
**~460–670 ms**.

✗ **NOT established: the per-term breakdown.** s1263's click-vs-poll-vs-sample split
(284–347 ms click, etc.) came from the refuted proxy. This run did not re-derive it and does
not rely on it. The cure does not depend on which term dominates — it removes the whole
round-trip from the window.

## A control-flow guarantee, read from source (not a measurement)

`src/core/Loop.ts:108-119`: when `stepSeconds <= 0` — which is TownScene's case, since
`TownScene.ts:306` constructs `new Loop(...)` **with no options** — `runFrame` calls
`this.update(this.frame.presentationDeltaSeconds)`, and
`presentationDeltaSeconds = Math.min(delta, MAX_PRESENTATION_DELTA_SECONDS)` with the constant
`0.05` at `Loop.ts:27`.

**Therefore every sim delta is ≤ 0.05 s by control flow, on any machine at any load.** This is
what makes the sim-time-window cure a guarantee rather than a hope: a window bounded at 0.08 s
of `elapsed` overshoots by at most one clamped delta, so the peak displacement is at most
`7 × (0.08 + 0.05) = 0.91 < 1`. F-1263-2's arithmetic holds, re-verified here at the source.

## Honest loose end (reported, not folded in)

Arm B's single red is **not** the drift assertion. It is
`expect(locator).toHaveAttribute(expected) failed / element(s) not found` on the **first**
test instance of the run (24.1 s, vs ~9 s for every subsequent instance), consistent with a
cold dev-server start rather than a behavioural fault. It did not recur in any of the other
23 instances of that test across the session. **Recorded as an observation; it is not part of
F-1264-1 and it is not this master's subject.**

## Correction to a factory belief

The note "`--workers` caps at project count on a single spec file" is **false when
`--repeat-each` is used**: arm A3 reported **"Running 6 tests using 6 workers"** on a single
file with a single test name. `--repeat-each` produces separately-schedulable jobs. This
matters because it is why the concurrent arm is reproducible at all on one file.
