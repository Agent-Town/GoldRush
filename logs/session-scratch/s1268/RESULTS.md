# s1268 — the worker-count sweep, and the cap underneath it

Fire s1268, 2026-07-30, main at `b1f1f515`. Subject: `e2e/gazette-welcome.spec.ts:88`, the
unmodified shipped drift assertion. Prescribed by `logs/session-scratch/s1267/RESULTS.md` §4.
Every number below was executed this fire; raw logs are `.txt` (tracked) beside this file,
because `.gitignore:7` swallows `*.log` and that is F-1267-3.

## 1. The sweep — a graded dose, not a binary shell property

Twelve runs, `--workers=1,2,3,6`, three cycles, **arms interleaved** (never all of one step then
all of another — a fixed arm order confounds the treatment with time-on-box, s1152/s1180).
Concurrency is quoted from the reporter's own line, never the flag (s1217/s1264); every run
printed exactly the worker count requested. Reds counted by s1267's signature verbatim
(`Received:` immediately under `Expected: < 1`).

| workers | reporter line | runs | drift reds | wall mean | per-test |
|---:|---|---:|---:|---:|---:|
| **1** | `Running 6 tests using 1 worker` | 3 | **0 / 18** | 66.7s | 11.1s |
| **2** | `Running 6 tests using 2 workers` | 3 | **5 / 18** | 57.6s | 9.6s |
| **3** | `Running 6 tests using 3 workers` | 3 | **14 / 18** | 96.7s | 16.1s |
| **6** | `Running 6 tests using 6 workers` | 3 | **18 / 18** | 75.7s | 12.6s |

**0% → 28% → 78% → 100% over n=72 instances.** The assertion is not a coin that lands one way in
one shell and the other way in another — it is a **graded response to concurrent browser count**.
This confirms F-1264-1's direction and is the first time it has been measured as a curve.

⭐ **The serial arm is the control, and it is decisive about load.** w=1 ran three times at
loadavg-before **2.46, 19.49 and 20.65** — an 8× spread that includes the two hottest moments of
the fire — and produced **0 drift reds every time**. Machine load was refuted by s1264 with one
control; it is now refuted with eighteen instances spanning the range.

ⓘ **An honest correction I had to make against myself mid-fire.** Cycle 2's w=1 run exits `rc=1`
and I read it, for several minutes, as "the serial arm went red" — which would have been the
finding of the fire. It was not: `drift=0`, and the single failure is a different assertion.
**Read the failure reason, not the red count** — the rule exists because this is easy, and I did
it while actively holding the rule.

⚠️ **Stated against my own design: the middle steps are order-confounded.** Each cycle ran
1→2→3→6, so w=3 and w=6 always executed on a box my own earlier arms had already heated, and the
wall-time column trends upward across cycles for that reason (w=2: 26.2s, 64.8s, 81.8s). The
**extremes are not** confounded: cycle 2's w=1 ran immediately after the hottest arm of the fire
and still read 0/6, and w=6 read 6/6 in all three cycles from three different starting loads. The
0/18-vs-18/18 contrast survives; the exact shape of the 2-and-3 middle does not, and should be
re-run in reversed order before anyone quotes 5/18 or 14/18 as a rate.

## 2. Where the time goes — and it is not CPU

Per-test durations from the list reporter, cycle 1 (the clean cycle):

| workers | per-test durations | throughput |
|---:|---|---:|
| 1 | 7.5 · 7.0 · 6.9 · 7.7 · 7.6 · 7.8 | 0.125 tests/s |
| 2 | 7.5 · 7.5 · 7.3 · 8.1 · 8.1 · 8.1 | 0.229 tests/s |
| 3 | 9.4 · 9.1 · 8.8 · **20.8 · 21.3** · 8.3 | 0.155 tests/s |
| 6 | **49.6 · 50.6 · 50.6 · 51.3 · 52.4 · 53.3** | 0.072 tests/s |

At six workers **every test inflates 6.7×** (7.5s → ~50s) and **total throughput falls below
serial** — the box does less work with six browsers than with one. That is negative scaling, and
it is the mechanism behind the red: the assertion is a latency threshold (s1267 §6), so whatever
inflates latency crosses it.

**But the box is not busy.** `top -l 2` sampled during a degraded arm: **52.3% idle**, and during
a second: **44.67% idle**. `memory_pressure` reports **79% free**; `pmset -g therm` records no
thermal or performance warning. Not CPU saturation, not memory, not thermal.

Also refuted by direct observation, cheaply: **no orphan accumulation** (one vite on 5188 — mine;
the two long-lived vites on 5247/5252 are 4 days old and idle), and **no foreign spike** (the lane
runner pid 35584 is alive at 0.0%, no Codex task running). The browsers themselves carry
**nice 0 / pri 20** — no priority demotion anywhere in the tree.

## 3. ⭐ The cap — measured with an instrument that can see it

s1267 reopened scheduling policy because s1265 had closed it with `capacity.mjs`, which measured
node **worker threads inside one already-running process** (5.04×). A policy binding on **spawned
child processes** is invisible to that workload. `child-scaling.mjs` spawns genuinely separate
child processes doing identical fixed CPU work:

| children | wall | throughput vs 1 |
|---:|---:|---:|
| 1 | 3.92s | 1.00× |
| 2 | 4.17s | 1.88× |
| 3 | 5.08s | 2.31× |
| 6 | 8.66s | 2.72× |
| 8 | 10.71s | **2.93×** |

**Eight CPU-bound child processes reach ~3× throughput on a 16-core box.** Re-run later at a
quieter moment: 3.64×, and 3.76× on a repeat — the ceiling moves a little, it does not lift.

**The direct observation, which is the sharpest single reading of this fire:** with eight
CPU-bound children live, `top` shows all eight at **exactly 52% of a core each** while the box
reports **44.67% idle (~7 cores free)**. Eight independent processes converging on an identical
share is the signature of a **policy ceiling**, not of competition — contention produces uneven,
drifting shares.

### What the cap is NOT — three candidates killed by execution

| candidate | test | verdict |
|---|---|---|
| the **sandbox** | identical probe with `dangerouslyDisableSandbox` | ✗ **REFUTED** — 3.15× vs 2.93×, indistinguishable |
| **Background QoS class** | same probe under `taskpolicy -c background` | ✗ **REFUTED** — background is **0.51×** (61.3s), i.e. 7× *worse* than where we sit |
| an inherited **background designation** | `taskpolicy -B -p <self>`, then re-measure | ✗ **REFUTED** — 3.64× → 3.76×, nothing to remove |

ⓘ **s1265's sandbox verdict was right, and its instrument could not have shown it.** Its arm
measured redness on a box at loadavg 18.14 with an instance timing out at 30s; I re-derived the
same conclusion on wall time, which is the quantity the fire-vs-lane gap is denominated in.
Refuting a report's mechanism is not refuting its symptom — here the symptom survived and the
conclusion held anyway.

## 4. The cause: a documented candidate, deliberately NOT claimed as proven

`~/Library/LaunchAgents/com.goldrush.fire.plist` (read this fire) declares `Label`,
`ProgramArguments`, `StartInterval 300`, `RunAtLoad`, `WorkingDirectory`, the two log paths and
two environment variables. **It declares no `ProcessType` key.** `man launchd.plist`:

> **ProcessType** … The system will apply resource limits based on what kind of job it is.
> **If left unspecified, the system will apply light resource limits to the job, throttling its
> CPU usage and I/O bandwidth.**

That is a documented mechanism which predicts precisely what §3 measures, and it fits every prior
observation in the thread: serial work is under the ceiling and matches the lane (~8-9s/test,
49s), while 3+ concurrent browsers exceed it and collapse; CPU sits idle; nice and priority are
untouched; the sandbox is irrelevant; node version is irrelevant; the working directory is
irrelevant.

🚫 **It is NOT established, and this fire does not claim it.** Everything in §3 is measured
*inside* the fire's own process tree, so I can show the ceiling exists and cannot show what
imposes it. A launchd resource limit and "this box simply cannot do better" produce the same
numbers from in here.

## 5. ⭐ The one control that separates them — and a fire cannot run it

Run **the identical committed probe** (`logs/session-scratch/s1268/child-scaling.mjs`, which
edits nothing) **from the runner's shell**, which is a login zsh under Terminal, not a launchd
job. The decision table is total:

| lane reading at 8 children | conclusion |
|---|---|
| **~7–12×** | the ceiling is the **fire's process context**. The five-fire divergence is fully explained, and the remedy is one key in one plist. |
| **~3×, like mine** | the ceiling is **the box**, the fire's context is exonerated, and the lane's 14s / 6-worker green becomes the anomaly to re-measure — starting with whether it still reproduces today. |
| between | a partial ceiling; report the number and stop. |

Authored as `tasks/lane-b-fire-shell-cpu-ceiling-control.md` (leaf
`fire-shell-cpu-ceiling-control`), queued last per F-1263-3.

## 6. Adjacent, reported and untouched

**F-1267-2 did not reproduce.** The second latency-sensitive assertion (`:42`, the `approachNewsie`
nearest-actor check, which s1267 saw at 2/24) produced **0 misses in 72 instances** here —
`Received: "tavernkeeper"` appears nowhere in twelve logs. Not fixed, not touched; recorded so the
next fire knows its rate is at most a few percent and not a reliable co-signal.

**Screenshot exhaust, declared:** these runs regenerate tracked `artifacts/gazette-welcome/*.png`.
Per the s1266 evidence-artifact exception that is expected and correct, not a violation.
