# s1267 — F-1264-3 settled: BOTH shells sampled as rates, and the DIRECTORY control finally run

Fire s1267, 2026-07-30, main at `0f9c19c2`. Subject: `e2e/gazette-welcome.spec.ts:88`, the
unmodified shipped drift assertion. Every number below is a run executed this fire or the
drained lane run of the same hour, counted by the assertion's own `toBeLessThan(expected)`
signature.

## 0. The premise check that changed the shape of the fire

The master, and five fires of argument, rest on the sentence recorded in
`tasks/goals.json` (`gazette-welcome-drift-observation-frame-v2.stoppedNote_s1264`):

> "Tree, spec, worker count, **and working directory** are all ELIMINATED as the variable."

✗ **That claim had no evidence behind it.** `logs/session-scratch/s1264/` contains exactly two
files (`RESULTS.md`, `handoff-line1.txt`), no run logs, and **zero occurrences** of `lane-b`,
`cwd`, or `worktree`. Its header states its own base as "main at `9744f6b9`" — the repo root.
s1265 likewise records "Same cwd" for its arms and states plainly "**I did not measure the lane
shell.**" So every fire-side reading was taken in the **repo root** and every lane-side reading
in **`worktrees/lane-b`**: for five fires, SHELL and DIRECTORY moved together and were never
separated. The elimination was asserted in a bookkeeping note and then quoted forward as
measured (F-1267-1).

So this fire ran three arms, not one.

## 1. Preconditions, verified rather than inherited

The subject is byte-identical across all three measurement bases —
`git diff 9744f6b9 328b1bed -- e2e/gazette-welcome.spec.ts src/town/TownScene.ts
playwright.config.ts package.json` is **empty**, and
`git log 9744f6b9..main --` on the same paths is **empty**. Same instrument content on s1264's
base, the lane's base, and current main.

Toolchain is identical in both directories: `@playwright/test` **1.61.1**, `playwright-core`
chromium revision **1228**, in both `node_modules` and `worktrees/lane-b/node_modules`.

## 2. The three arms

| arm | shell | cwd | node | concurrent drift reds |
|---|---|---|---|---:|
| **L** lane (drained run `20260730-194426`) | runner login zsh | `worktrees/lane-b` | v23.11.1 | **0 / 24** |
| **F** fire, repo root (this fire) | launchd headless claude | repo root | v26.4.0 | **22 / 24** |
| **D** fire, LANE directory (this fire, **new**) | launchd headless claude | `worktrees/lane-b` | v26.4.0 | **21 / 24** |

Command, byte-identical in all three:

```
npx playwright test e2e/gazette-welcome.spec.ts --project=desktop-chrome --project=mobile-chrome --repeat-each=3 -g "fires once" --reporter=list
```

### Arm L — the lane, as reported by the drained run

| run | reporter | result | wall | loadavg before | reds |
|---|---|---|---:|---|---:|
| 1 | `Running 6 tests using 6 workers` | 0 failed / 6 passed | 14.24s | 4.08 3.12 4.66 | 0 |
| 2 | same | 0 / 6 | 15.41s | 7.61 4.06 4.95 | 0 |
| 3 | same | 0 / 6 | 14.11s | 9.08 4.70 5.15 | 0 |
| 4 | same | 0 / 6 | 14.37s | 13.24 6.02 5.62 | 0 |

Serial control, `--workers=1`: **0 / 12**, wall 64.20s and 49.41s.
Lane environment triple, measured by the runner: node **v23.11.1**, `os.cpus().length` **16**,
renderer **SwiftShader** (`ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device …))`) — i.e. the
renderer lead of s1265 §3 is now **REFUTED as a discriminator**: both shells software-rasterise.

### Arm F — the fire shell, repo root

| run | reporter | result | wall | loadavg before | drift reds | `Received:` (bound is `< 1`) |
|---|---|---|---:|---|---:|---|
| 1 | `Running 6 tests using 6 workers` | 6 failed / 0 passed | 79.28s | 1.57 2.89 4.18 | **6** | 3.151 3.081 2.396 1.152 2.589 2.713 |
| 2 | same | 6 / 0 | 79.97s | 25.03 10.96 7.20 | **6** | 2.430 3.325 5.635 2.070 3.745 4.070 |
| 3 | same | 6 / 0 | 77.58s | 30.79 16.79 9.80 | **6** | 3.155 2.068 5.737 3.090 1.702 3.326 |
| 4 | same | 6 / 0 | 106.51s | 29.73 20.49 11.85 | **4** | 3.230 4.375 2.247 4.526 |

**22 drift reds / 24.** Run 4 failed 6 but only **4** carried the drift signature — its other two
are a different assertion (see §5). Counting by signature rather than by failure count is what
kept the rate honest, exactly as the master required.

### Arm D — the fire shell, in the lane's own directory (the control nobody had run)

| run | reporter | result | wall | loadavg before | drift reds | `Received:` |
|---|---|---|---:|---|---:|---|
| 1 | `Running 6 tests using 6 workers` | 5 failed / 1 passed | 80.82s | 13.59 19.60 12.92 | **5** | 1.411 3.012 1.928 3.413 2.997 |
| 2 | same | 6 / 0 | 107.65s | 30.12 24.16 15.30 | **6** | 1.849 1.948 3.627 1.575 1.174 3.377 |
| 3 | same | 5 / 1 | 108.04s | 30.37 27.86 17.95 | **5** | 1.058 1.013 1.220 1.981 3.361 |
| 4 | same | 5 / 1 | 94.02s | 31.41 31.36 20.63 | **5** | 2.072 1.599 4.000 2.907 3.430 |

**21 drift reds / 24.**

## 3. What is now established

✓ **F-1264-3 STANDS, and both halves are now rates, not single samples.** 0/24 in the lane
against 22/24 in the fire shell, measured the same hour on identical subject bytes and an
identical toolchain. The lane-green half was n=1 (F-1265-2); it is now n=24.

✓ **WORKING DIRECTORY IS REFUTED — measured for the first time.** Arm D moves the fire shell
into `worktrees/lane-b` and changes nothing: 21/24 versus 22/24. The claim s1264 asserted
without evidence happens to be **true**; it is now also **measured**. Every remaining
explanation must be a property of the *shell*.

✓ **MACHINE LOAD IS REFUTED AGAIN, HARDER.** Arm F run 1 went **6/6 RED at loadavg 1.57** — the
quietest run of the fire — while every lane run went **green at loadavg 4–13**. The green arm
was the busier box. This independently reproduces s1264's control.

✓ **THE RENDERER LEAD IS CLOSED.** s1265 left SwiftShader standing as "a verified premise with
an unmeasured conclusion". The lane measured its own renderer: also SwiftShader. Not a
discriminator.

✓ **FILE-DESCRIPTOR / PROCESS LIMITS AND MEMORY PRESSURE ARE REFUTED.** `ulimit -n` = 1048576
and `ulimit -u` = 10666 in both the fire shell and a login zsh; the box is 128 GiB with
**80% free** during the arms. Nothing is starved.

## 4. ⭐ The lead this fire hands forward, and why the one that closed it was mis-aimed

The sharpest fact in five fires is in the **wall-time columns**, and no previous fire had both
sides of it:

| | serial, `--workers=1` | concurrent, 6 workers | scaling |
|---|---:|---:|---|
| **lane shell** | ~49–64s | **14–15s** | **≈3.5× faster** |
| **fire shell** | ~49s (s1264 arm B) | **78–108s** | **≈1.7× SLOWER** |

**In the fire shell, six workers are slower than one.** Single-browser performance is equal
across the shells (~8–9s/test on both sides, agreed since s1264), so this is not raw speed — it
is that the fire shell has **negative parallel scaling on concurrent chromium processes** while
the lane shell has strongly positive scaling. That is a mechanism-shaped difference and it
predicts the drift result exactly: the assertion is a latency threshold (§6), so whichever shell
crosses it fails.

⚠️ **s1265 "REFUTED a CPU/QoS scheduling cap" with the wrong instrument.** Its `capacity.mjs`
measured **node worker-thread arithmetic inside one already-running node process** and found a
5.04× speedup. That workload cannot see a policy that binds on **spawned child processes** —
which is what six chromium instances are. The candidate was closed by a probe that was blind to
it, the same class as "a green battery inherits its instrument's blind spots".
➡️ **Treat scheduling/QoS as OPEN, not refuted.**

**Prescribed next experiment (cheap, bounded, and it does not need the lane):** sweep the worker
count in the fire shell — `--workers=1,2,3,6` — recording wall time and drift rate per step, and
read the policy of the chromium children while an arm runs (`ps -o pid,ni,pri`, `taskpolicy -p
<pid>`). A curve that degrades superlinearly with *process* count, on a box with 12 P-cores and
4 E-cores idle and 80% free memory, localises the discriminator to process scheduling policy
inherited from launchd. If the curve is flat and only the 6-worker step collapses, look at
per-tree concurrency limits instead.

## 5. Adjacent, reported and untouched (as the master required)

⚠️ **`e2e/gazette-welcome.spec.ts:42` ("the Gazette welcome fires once, walks skippably, and retriggers through the newsie" — the `approachNewsie` nearest-actor check) is a SECOND
latency-sensitive assertion in the same spec.** In arm F run 4 it failed twice with `Expected: "newsie" / Received: "tavernkeeper"` and
`Timeout 8000ms exceeded while waiting on the predicate` — the `approachNewsie` helper's
nearest-actor check. **The lane never saw it** and its report correctly said "no adjacent
timing-sensitive assertions were observed"; that is true of the lane's environment and false of
the box under load. Rate observed here: **2 / 24**. Not touched, not fixed.

ⓘ **The "four vs six screenshots" discrepancy is not a stale inventory — it is a red/green
signature.** The master named four expected PNGs; the drained run produced six. `shot(page,
testInfo, 'retrigger-prompt')` is at `e2e/gazette-welcome.spec.ts:109`, *after* the assertion at
`:88`. A **failing** run dies before reaching it and writes four; a **passing** run writes six.
This fire's own red arms wrote exactly four, confirming it. The master's inventory was written
from red-run knowledge and is correct for red runs only.

## 6. Mechanism, derived from source and labelled as a lead

`e2e/gazette-welcome.spec.ts:81–88` samples the newsie position, clicks
`town-welcome-next`, `expect.poll`s until `welcomeFollowsPlayer` reads false, then samples
again and bounds the displacement by `< 1`. The newsie steps `delta * 7`
(`src/town/TownScene.ts:2613`), so the bound is arithmetically "the observation window closed
within ~143 ms" — as s1263/s1264 established. `expect.poll` evaluates immediately and only then
waits its first interval (~100 ms): detect the flip on the immediate call and the displacement is
one CDP round-trip (a fraction of a unit, green); miss it and you pay an interval, landing in the
units (red). **The assertion measures playwright's round-trip latency, denominated in world
units** — which is why it can be a shell property at all, and why the parked cure (an in-page rAF
sampler installed *before* the click) is the right shape: it removes the round trip from the
window.

⚠️ **A lead — and one tempting argument for it withdrawn on inspection.** The 43 red `Received:`
values across arms F and D span **1.013–5.737**, and it is tempting to read that as a clean
second mode. **It is not evidence of bimodality: a red is ≥ 1 by construction** (the bound is
`< 1`) and playwright prints no `Received:` for a pass, so the green side's displacements were
never recorded on either shell. The spread is *consistent with* interval quantisation and does
not demonstrate it. Ratifying the mechanism needs the green values — one cheap arm that records
the displacement on passing instances — and nothing downstream depends on it.

## 7. F-1267-3 — the RETENTION LAW's own mirror directory is a black hole (owner call)

`logs/runs-archive/` is the directory CLAUDE.md §10b names as the mirror target for run logs.
Measured this fire:

- `git ls-files logs/runs-archive/` ⇒ **1 tracked file** of **247** present.
- `git check-ignore -v` on this fire's own drained run log ⇒
  **`.gitignore:7:*.log`**.
- `git status --ignored` ⇒ **246 ignored entries**, **635 MB**. `tasks/runs/` adds **381 MB**.

So the law says these are mirrored into git and the repo-wide `*.log` rule at `.gitignore:7`
quietly discards all of them. The file even documents the hazard three lines below the live
rule — `.gitignore:46` reads "a wildcard here is how F-1027-2 turned `logs/runs-archive/` into a
black hole" — and `.gitignore:37` already carries a `!reviews/eight-winds/gen/*.codex.log`
negation for the same reason. `logs/runs-archive/` never got one.

**Not fixed here, deliberately: a ~1 GB add changes repo weight for every clone, which is
§7.3/§7.7 territory, not a drive-by.** Recommendation, cheapest first: **gzip-and-track** —
negate `*.log` for `logs/runs-archive/**.log.gz`, compress on mirror (these logs compress
~10–20×, so ~635 MB → ~40 MB), and let the plain `.log` stay ignored. Alternative: track only
each run's `READY-FOR-GATES` report tail, which is the durable knowledge, and leave the
transcript bulk on disk. Owner picks; either is a one-script change to the mirror step.
