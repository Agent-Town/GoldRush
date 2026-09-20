# F-1030-3 — is the m2-05 suite still timing-unstable? (s1290 measure-first probe)

**Question.** `tasks/BACKLOG.md:2143` ⑵ (owner blocker sweep, 2026-07-30) directs the next fire to
AUTHOR a "stabilise-as-a-suite" corrective per **F-1030-3's own GATE line**
(`BACKLOG:1465`: *"a future corrective should stabilise it as a suite, not test by test"*).

Per CLAUDE.md §7.1 and the measure-first law, the corrective's premise was tested **before**
authoring anything: *is `e2e/m2-05-base-damage-repair.spec.ts` still unstable?*

## Subject presence (checked first — a probe must verify its subject exists)

`e2e/m2-05-base-damage-repair.spec.ts` is present, 398 lines, **7 tests**. F-1030-3 named three
timing tests at `:198` desktop and `:319` desktop+mobile; those coordinates have **drifted**
(F-1040-1 already recorded `:198` → `:223`). Cite the file, not the coordinates.

## Method

Bar shape per **F-1036-2**: N separate **INVOCATIONS**, not `--repeat-each` — repeats inside one
`npx playwright test` reuse one dev server, one browser launch and one warm cache, so they buy N
samples of the *fast warm path* rather than N independent samples.

Per **fire.md §3.1**: `--workers=1` (a fire-shell correctness requirement, not an optimisation).
Per **Mistake #12**: external scratch dev server on port **5231**, never 5188 — a live lane-b
Codex run was in flight and `playwright.config.ts:42` sets `reuseExistingServer: false`, so binding
5188 would have killed the live run's own gates.

Probe: `/tmp/gr-s1290-probe.mjs` · raw records `/tmp/gr-s1290-probe.jsonl`.

## Result — 3 invocations, all green

| # | rc | tests | failed | loadavg1 | wall | literal worker line |
|---|---:|---:|---:|---:|---:|---|
| 1 | 0 | 14 passed | 0 | 3.19 | 97 s | `Running 14 tests using 1 worker` |
| 2 | 0 | 14 passed | 0 | 8.24 | 97 s | `Running 14 tests using 1 worker` |
| 3 | 0 | 14 passed | 0 | 5.01 | 132 s | `Running 14 tests using 1 worker` |

**42/42 test executions green across 3 cold invocations, desktop + mobile.**

The literal `Running … using 1 worker` line was captured per arm rather than trusting the flag —
**F-1217-2**'s lesson (a `--workers=N` flag that the config or the file count silently overrides).

Invocation 2 ran at **loadavg 8.24** with a Codex lane run live. A green under heavy load is a
stronger reading than a quiet green, which is what makes this sample worth something at n=3.

## ⚠️ DECLARED CUTOFF — this is not a full sample

The probe was **stopped at 3 of a planned 6 invocations**, deliberately: the lane-b F-1288-3 run
done-moved mid-probe, and §2B makes a drain outrank a measurement. Running a second battery
concurrently with a drain gate is exactly the self-inflicted contamination **F-1288-2** recorded.
No silent cap: 3 invocations is what was measured, and 3 is what is claimed.

## Verdict

**NOT ENOUGH TO CLOSE F-1030-3, BUT ENOUGH TO REFUSE TO AUTHOR ITS CORRECTIVE BLIND.**

The directive's premise — an unstable suite — did **not** reproduce in 3 cold invocations at the
prescribed worker count. Authoring a "stabilise-as-a-suite" corrective now would be a master whose
own premise is unmeasured, and would spend a Codex run on a suite that currently passes.

**Owed before that corrective is authored:** finish the sample (≥6 invocations, ideally spanning an
idle machine and a loaded one) and record the rate. If it stays 0/N, F-1030-3 should be struck as
measured-stale the way s1261 struck its 14 siblings — its GATE is *"a future corrective should"*,
which was never a claim that the instability is still live.

**Note the asymmetry that makes this cheap:** a red here would have *justified* the directive; only
a green could cancel it, and a green is exactly what three invocations produced.
