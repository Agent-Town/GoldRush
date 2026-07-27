# F-1101-1 Playwright worker calibration v2

- Slice: `lane-calibrate-suite-workers-v2`
- Branch: `lane/perf`
- Base: current `main` after the required fresh reset
- Date: 2026-07-27
- Verdict: **STOP — pre-run quiescence gate failed; no calibration run started**

The first run requires two load samples 60 seconds apart with 1-minute load
average at or below 4.0, zero Chrome-for-Testing processes, and no live foreign
Playwright process. Both samples had zero Chrome processes and no Playwright
process, but the 1-minute load averages were **4.24** and **4.27**. The
instrument therefore did not run.

## Pre-flight

- `git log --oneline main..lane/perf` printed only the expected
  `6372de97 runner(lane-d): lane-calibrate-suite-workers-v2.md`.
- `lane/perf` was reset to current `main`.
- `grep -n "workers" playwright.config.ts` printed nothing.
- `node -e "console.log(require('os').cpus().length)"` printed `16`.
- The prior VOID report's latest commit is
  `642c5d5d drain: F-1101-1 calibration report lands VOID — the 17.88% drift was one flaky test, not an unstable box (F-1107-1/2)`.

## Quiescence evidence

Sample 1:

```text
2026-07-27T07:51:32Z
{ 4.24 4.45 4.67 }
0
```

Sample 2, 60 seconds later:

```text
2026-07-27T07:52:32Z
{ 4.27 4.43 4.65 }
0
```

The absent fourth line in each sample means
`ps ... | grep "[p]laywright test"` found no process.

## Required stop consequences

- No `calib2-*.log` files were created.
- `S` was not built, so there is no exclusion list or drift figure.
- No `inflation(N)` value or worker count was chosen.
- `playwright.config.ts` and `package.json` remain unchanged.
- No pin guard or mutation-control red/green pair exists.
- Build and test self-checks were not run after the stop condition.
- No premise contradicted the task; only the quiescence threshold failed.

Re-run v2 when the box can produce two consecutive accepted quiescence samples.
F-1101-1 remains open.

---

## DRAIN VERDICT — s1125 (2026-07-27T15:0xZ), attempt 2 of v2

**ACCEPTED as the lawful STOP the master pre-declares a SUCCESS.** It pinned nothing, softened no
threshold, guessed no number, and enumerated precisely what it did not do (§"Required stop
consequences"). Merged **path-scoped to this file alone**.

**Merge classification.** Three-dot vs merge-base = `reviews/calib-suite-workers-v2.md` **only** —
a clean single-file docs diff. `scripts/ticker-stats.mjs` appears in the *two-dot* diff only because
**main moved under the lane** (F-1125-1, committed `109a11ba` at 14:55:58, after this run reset at
~14:51); it is **MAIN-MOVED-ONLY** and main's version was kept. Zero `src/`, zero `e2e/`.

✅ **F-1124-2 DID NOT RECUR.** The previous attempt's runner commit swept two unrelated
`artifacts/**` files into its commit via a broad `git add`, and s1124 had to refuse them to protect
banked passing evidence. This fire added an explicit ADD-DISCIPLINE clause to the master's firewall
quoting that finding; **this commit carries exactly one file.** The corrective held.

✅ **The staleness refresh worked as intended.** The pre-flight had pinned `9614b7eb`; this fire
refreshed it to `6372de97` before queueing, and the run's §Pre-flight confirms it accepted that hash
and reset cleanly instead of STOPping on a pure bookkeeping mismatch.

ℹ️ Note line: *"Build and test self-checks were not run after the stop condition."* Correct and
harmless — it stopped before scope 7, so it never observed F-1125-1's red `test:node-guards`.

### 🔴 F-1125-2 — THE QUIESCENCE GATE IS MEASURING A BOX WITH A ~2-CORE OWNER-SIDE BACKGROUND FLOOR, AND `ps` %CPU HAS BEEN THE WRONG INSTRUMENT FOR THREE FIRES RUNNING

The re-queue was made under F-1124-1's rule with the floor checked first and **passing**: three
samples 60 s apart, factory idle, observer absent (real `setTimeout`, not s1124's core-spinning
busy-wait) read **2.35 · 2.00 · 3.82**. The dispatch then read **4.24 / 4.27** minutes later. Chasing
that gap produced the finding.

⚠️ **First, my own contamination, stated plainly:** the run sampled at **14:51:32 and 14:52:32**, and
I was running `npm run test:node-guards` batteries in that window, having queued the task at 14:50.
**I ran a gate battery on the box while the dispatch I had just made was measuring that box.** That
is the third occurrence of s1124's lesson in two fires — it contaminated its own reading twice, I
contaminated the *instrument's*. I cannot prove my battery was decisive (a ~10 s burst moves a 1-min
average only so far), but the protocol error stands regardless of magnitude.

**Second, and larger: `ps` `%CPU` is a LIFETIME AVERAGE, not an instantaneous reading, and both
prior readings of this question used it.** s1124 called `spotlightknowledged` "a stuck reindex … on a
box with 52 days of uptime" — but 52 days was the **box's** uptime, not the process's. I first
"corrected" this to a 32:50-old transient, then found my own probe had matched a *different*
`spotlightknowledged` instance (etime 10 days, 0.0%). **Both readings were artefacts of the wrong
tool.** `top -l 2` (second sample = true instantaneous) settles it:

| process | instantaneous %CPU | note |
|---|---|---|
| `Codex (Renderer)` (ChatGPT.app, pid 58531) | **81.4%** | **largest single consumer; never previously identified** |
| `spotlightknowledged` (pid 25509) | **74.6%** | real, but ~half the story |
| `com.apple.Virtualization…` (pid 64183) | **35.7%** | 26 h CPU time |
| `sublime_text` | 12.1% | |
| 6 × orphaned `esbuild` daemons | ~2.5% each | alive 11 h+, ~0.16 core total |

⇒ **~2.0–2.2 cores of continuous background load before the factory does anything**, against a
**4.0** ceiling. The gate is not fighting one stuck daemon; it is fighting a desktop.

**Third, the load is volatile independently of the factory.** With nothing of mine running, sampling
at 30 s intervals gave **3.53 → 3.40 → 4.04 → 4.63 → 9.39 → 7.78**. A rule of "two consecutive
samples ≤ 4.0" on that series is a coin flip **no matter how well the factory behaves**, which is why
attempt 1 (9.74/7.84) and attempt 2 (4.24/4.27) both failed while an idle-window probe passed.

### ➡️ RULING: STOP RE-QUEUEING v2. THIS IS NOW AN OWNER ITEM.

Two unchanged dispatches have now been spent on the same environmental blocker in one day. A third
would be exactly the failure mode F-1104-2 and F-1124-1 each warned about — *an unchanged re-queue
that can never reliably pass burns one dispatch per fire forever*. The escalation law's
changed-premise bar is now genuinely engaged: **the premise that must change is the box, not the
task, and a fire cannot change it** (v1 gate §65: I never kill what I did not start).

**Owner, any ONE of these unblocks F-1101-1 at zero engineering cost** (ranked by cost):
1. **Quit ChatGPT.app** while a calibration is queued — it is the single largest consumer at 81%.
2. **Add this repo to the Spotlight privacy list** (System Settings → Siri & Spotlight → Privacy),
   which is durable and also stops the reindex recurring.
3. Kill the six orphaned `esbuild` daemons (11 h+ old, no live build).
4. Stop the `com.apple.Virtualization` VM if it is not in use.

Doing 1 + 2 alone should drop the floor to roughly **2.0–3.0** and make the gate pass reliably rather
than marginally.

ℹ️ **Unchanged and still owner/attended-only:** the **4.0 ceiling may itself be miscalibrated** —
25% utilisation on a **16-core** box for a run using at most 8 workers. Reported as a finding and the
rule followed, per the master's closing clause forbidding threshold-softening, which binds the
drainer as much as the runner. **I did not touch it.**

**F-1101-1 REMAINS OPEN** — `playwright.config.ts` still declares no `workers` key. The leaf keeps
**no `mergeHash`** and stays re-queueable, for the same reason s1119 stripped v1's.
