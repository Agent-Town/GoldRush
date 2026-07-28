# Task lane-c-power-budget-retry-policy: make `test:power-budget` REPORT its number instead of only asserting it, and let `run-guards.mjs` demand a SECOND consecutive over-cap before it reds — but only after measuring whether two consecutive runs are independent enough for that to mean anything (lane-c, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s1172, 2026-07-28. Authored from **F-1170-4** (`tasks/BACKLOG.md:25`), which is itself the drained refutation of the previous attempt, plus **F-1160-2** (`tasks/BACKLOG.md:208`) and its s1161 re-derivation on the same line. **Both published remedies for F-1160-2 are DEAD** — min-of-3 refuted by s1161 (4/4 fail under systematic deprioritisation), the in-process reference loop refuted by s1170 (`reviews/power-budget-instrument-control.md`, bands disjoint). This is the third and last cheap mechanism, and s1172 re-derived every premise below at source before writing a line.

CODEX: model=gpt-5.6-sol effort=high

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c`.

READ FIRST (paths, not memory):
- `AGENTS.md`
- `scripts/run-guards.mjs` — **all 74 lines, and the header comment first.** That header is the law you are amending. It exists because `test:node-guards` printed "61/61 pass" and then exited 1, and two fires in a row read the counter instead of `$?`. **You are adding the first-ever branch that lets a red row not be a red run. If you do that carelessly you re-open the exact hole this file was built to close.**
- `scripts/check-power-graph-budget.mjs` — **all 45 lines.** Note `:40-43` (the `assert.ok` whose *message* carries the p95 on the FAIL path) and `:44` (the `console.log` that carries it on the PASS path). **The number exists on both paths today, in two different formats, one of them inside an exception.** That asymmetry is half of what you are fixing.
- `src/systems/PowerGraph.ts:160-170` — `POWER_GRAPH_LIMITS`, incl. `solveBudgetMs: 0.5` at `:165`, **the number you may never touch**.
- `tasks/BACKLOG.md:25` (F-1170-4, the refutation that produced this task) and `tasks/BACKLOG.md:208` (F-1160-2 in full, **including the s1161 re-derivation that refuted one third of its own diagnosis**). Read what failed, not just what was recommended.
- `reviews/power-budget-instrument-control.md` — the predecessor's STOP. Read *why* it stopped; the same class of unmeasured assumption is what scope 1 of this task exists to kill.
- `logs/session-scratch/s1170-power-budget-rate.mjs` — the instrument you will extend. It already spawns the REAL guard as a fresh subprocess and already prints an ordered per-run line; it only ever reported the *sorted* body, which is precisely the information this task needs it not to discard.
- `package.json:17-20` — `test:power-budget`, `test:node-guards` (an explicit file list), `test:guards`.

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)
The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via `git log`/`git diff`), it is a SAFE DUPE → `git checkout -B lane/e2-arsenal main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make.

**The dupe is PRE-PROVEN for you — do not spend budget re-deriving it.** s1172 verified at 2026-07-28T15:35Z: `lane/e2-arsenal` is **1 ahead at `18e132f8`** (`runner(lane-c): lane-c-power-budget-instrument-control.md`), whose entire content is two files — `logs/session-scratch/lane-c-power-budget-reference-probe.mjs` and its `tasks/runs/` report — **and both are on main**, landed by the s1170 drain `95b82bbc`. `git diff --stat main lane/e2-arsenal -- src/ scripts/ e2e/` returns **only files main gained later** (`e2e/f1169-world-info-build-fixture-probe.spec.ts`, `e2e/world-info-notes.spec.ts`), i.e. **main is strictly ahead and the lane holds nothing unmerged**. Textbook SAFE DUPE → reset and proceed. Re-run that one `git diff --stat` to confirm nothing changed since, then move on.

Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## Why (the defect, dated and measured — and the two graves you must not dig a third next to)

`test:power-budget` is **guard 2 of 8** in `run-guards.mjs` — the battery every fire cites as *"guards 8/8"*. It runs the PowerGraph fixed-step solve 224 times, keeps the last 160 `lastStepMs` samples, and asserts their **p95 ≤ 0.5 ms** from **one** run. It is a pure wall-clock CPU measurement on a box that is never quiet by design.

**1. It cannot tell "the code got slower" from "this process was descheduled", and it blames the code.** Its failure sentence is `power graph fixed-step p95 2.438ms exceeded 0.500ms` — a statement *about the game* that is false whenever the box was the problem.

**2. The rate is a property of the BOX, so no single fire's number is the rate.** Pooled default-QoS across three fires: **5/52 ≈ 9.6%** (s1160 4/20, s1161 1/12, s1170 0/20 — and 0/20 does **not** disprove an 8% rate; P(0 in 20) ≈ 0.19). Under `taskpolicy -b` the failure is **deterministic**: s1161 **12/12**, s1170 **6/6** (1.707–3.036 ms).

**3. F-1170-3 proved it does real damage.** During an unrelated s1170 drain, `run-guards` returned **7/8** with this guard red at p95 0.752 on a **zero-`src/` diff** — the first time the flake was caught ambushing a gate that was not hunting for it. *A guard that reds at random is how a battery gets trained out.*

**4. TWO REMEDIES ARE ALREADY DEAD, AND BOTH DIED THE SAME WAY — an unmeasured assumption about how the box degrades.** min-of-3 (s1161): works at default QoS, **4/4 fails** under systematic deprioritisation. Reference loop (s1170): background inflated the reference **3.12×** but the solve **6.11×**, per-run bands **disjoint** — so any threshold that called the degraded arm DEGRADED would also swallow a real regression. **Any in-process CPU proxy inherits that**, because proxy and subject degrade at different rates. **Do not build a third proxy.**

**5. So this task uses no proxy and no environment model at all.** It changes what the guard *says* and how many consecutive over-caps the runner *requires*. But that rests on its own unmeasured assumption, and scope 1 exists to kill it before you write a line of policy — see below.

## Scope

### 1. MEASURE FIRST — and this scope may CANCEL the retry half of the task (STOP gate)

**The assumption: that two consecutive fresh-subprocess runs of this guard are close enough to INDEPENDENT that requiring a second over-cap is a real filter.** If over-cap excursions are *clustered* — if a degraded episode lasts longer than the ~5 s the guard takes to run — then a re-run five seconds later is still inside the same episode, the second run fails too, and the policy filters nothing while costing every red an extra five seconds. **Nobody has measured this.** The banked data is openly suggestive of clustering: under sustained `taskpolicy -b` the failures are **100% correlated** (12/12, 6/6). The open question is the default-QoS arm.

⚠️ **DO NOT try to answer this by counting rare over-cap events.** At ~9.6% and any n you can afford, you would be estimating a conditional probability from three or four events — the same statistical dead end that made s1160's stated gate unrunnable. **Measure the CONTINUOUS variable instead:**

(a) Extend `logs/session-scratch/s1170-power-budget-rate.mjs` into a new scratch instrument (new filename, in `logs/session-scratch/`, **not** in `scripts/`) that keeps the **ordered, timestamped p95 series** — the existing script already parses the p95 on both paths (`:29`, and note its comment explaining why the regex handles both formats); it merely throws the order away at `:37` by sorting. Keep the raw sequence and write it to a file so the drain can re-read it.

(b) Run **n ≥ 40** back-to-back at default QoS. Record loadavg at start and end (**the rate is only meaningful quoted with its load**).

(c) Compute and report the **lag-1 autocorrelation of the p95 series** — i.e. how much a run's p95 predicts the next run's. Report `r`, n, the median, and the body range. Also report the observed over-cap count, but **do not use it as the discriminator**; it is context, not the measurement.

(d) Run **n ≥ 6 PAIRS** under `taskpolicy -b` — each pair being a run and an immediate re-run, exactly as the retry policy would issue them — and report **how many pairs failed BOTH times**. This is the sustained-degradation arm and it directly measures what the policy would do there.

(e) **THE VERDICT SENTENCE, written before any edit to `scripts/run-guards.mjs`:**
- **`|r| < 0.3`** → consecutive runs carry little memory; a second consecutive over-cap is a genuinely independent event and the policy takes the false-red rate from ~9.6% to roughly its square. **PROCEED to scope 3.** State the `r` you measured and the expected residual false-red rate you are claiming.
- **`|r| ≥ 0.3`** → excursions persist across the guard's own runtime. **STOP the retry half.** Write the table, state that **the third F-1160-2 remedy is refuted by measurement**, and say plainly that the remaining options are out-of-band (an OS-level scheduler signal) or an owner question about whether a wall-clock p95 can be asserted at all inside a permanently-loaded box. **A STOP here with a populated table is declared a FULL SUCCESS of this scope** — it kills, for a tenth of the cost, a remedy that would otherwise have shipped on argument alone, for the third time on this finding.
- **Either way, scope 2 still ships** (it has no dependence on this assumption).

ⓘ Expect (d) to come back **6/6 both-failed**, and that is *not* a refutation on its own — under sustained deprioritisation no in-process remedy works, and the guard staying red there is arguably correct. Report it as the **trade-off boundary**, not as the verdict. The verdict is (c).

### 2. REPORT THE NUMBER — unconditional, ships regardless of 1(e)

Today the p95 reaches a human on the PASS path as a `console.log` and on the FAIL path only inside an assertion message. So every handoff that writes *"guards 8/8"* is recording a **boolean** for a measurement that produced a **number**, and the trend nobody can see is the trend that would have shown this drifting years before it reds.

Edit `scripts/check-power-graph-budget.mjs` so that **before it asserts**, it prints ONE stable machine-readable line on **both** paths, e.g.:

```
power-graph-budget: p95=0.374ms cap=0.500ms samples=160 verdict=PASS
```

- The line must be emitted **before** the assertion, so it survives the throw.
- Keep the existing assertion and its message **exactly as they are** — the rc contract does not change in this scope.
- Then have `run-guards.mjs` surface that number in the guard's row when present. **Parsing must be defensive**: a guard that prints nothing parseable must still report its rc normally, never crash the runner, never be treated as a pass.

⛔ **This scope changes NO exit code.** If your diff for scope 2 alters when anything exits non-zero, you have exceeded it.

### 3. THE RETRY POLICY — only if 1(e) says PROCEED

In `scripts/run-guards.mjs`, allow **exactly one** re-run of a failed guard, and red only on the second consecutive failure.

**Three constraints, each of which is the whole point:**

(a) **IT IS AN ALLOWLIST OF ONE, NOT A GLOBAL POLICY.** F-1170-4's own wording (*"treat one over-cap as a warning with a re-run"*) is guard-agnostic, and **s1172 is correcting it here**: the other seven guards are deterministic contract checks — `test:task-guards` gates the ledger, `test:deploy-contract` gates the deploy shape — and for those a single red is real. A blind retry there would **mask a genuinely intermittent contract break**, which is a worse defect than the one you are fixing. So: a named constant listing `test:power-budget` **only**, with a comment naming F-1160-2 and the measured flake rate that earned it the exemption. Adding a second guard to that list is a future task's decision, backed by its own measurement.

(b) **A RETRIED PASS IS NOT A SILENT PASS.** It prints its own row — the first rc, the second rc, and both p95 numbers from scope 2 — with an unmistakable word (`FLAKED`, not `PASS`), and the final summary line says how many guards flaked. **A flake that nobody can see is how this guard gets trained out through the other door.** The runner's exit code stays 0 in that case; its *output* must make a fire that keeps seeing FLAKED go read this finding.

(c) **THE POLICY MUST BE A PURE, EXPORTED, UNIT-TESTED FUNCTION.** Add `scripts/run-guards-retry.test.mjs` (house pattern — see any of the twelve `scripts/*.test.mjs` files) and register it in `package.json`'s `test:node-guards` file list. Cover at minimum: a non-allowlisted guard reds on its first failure with **no** second run; the allowlisted guard reds when both runs fail; the allowlisted guard flakes-then-passes only when the second run passes; and a guard that emits no parseable p95 is still classified by rc alone.
⚠️ **Importing `run-guards.mjs` from the test must not execute a single guard.** Today the file runs its loop at import. Guard the executable body (e.g. on `process.argv[1]`) or extract the policy into a module the runner imports — your choice, but **the test must assert that importing spawns nothing**, and remember `test:node-guards` is itself guard 1 of the very battery being amended.

### 4. THE MUTATION CONTROLS — mandatory, and there are TWO because you added two ways to swallow a red

A retry is a mechanism for a guard to stop failing. Scope 3 is acceptable only if you prove it did not become one.

(a) **The subject mutation.** Inject a **genuine cost regression into `src/systems/PowerGraph.ts`** — real extra work inside the solve — **not** into the guard script and **not** by lowering the cap. Run the full `npm run test:guards` at **normal QoS**. It **MUST exit non-zero**, with both attempts failing and the PowerGraph message, **not** a FLAKED pass. Record both p95 numbers.
(b) **The allowlist control.** Prove the retry does **not** leak to the other seven: temporarily break one cheap deterministic guard (a scratch mutation of its input, reverted) and show the runner reds it on the **first** failure with **no** second run in the log.
(c) **REVERT both mutations and prove it**: `git diff main -- src/` **empty** at report time, and `git diff --name-only main` listing nothing outside TOUCH-ONLY. **Zero permanent `src/` changes ship from this task.**
(d) If (a) passes instead of failing, the policy has swallowed a real regression → **revert scope 3 entirely and STOP with the finding.** Scope 2 still ships.

### 5. Prove the cure, and read the exit code

- `npm run test:guards`: **8/8**, read as the runner's **exit code**, not its printed counter. *That distinction is the entire reason `run-guards.mjs` exists — see its header.*
- Default QoS, **n ≥ 20** via your scope-1 instrument: the p95 body must be **unmoved** from the 0.352–0.405 band s1170 measured. **The fix must not change what a healthy box measures**; if it did, you changed the measurement, not the policy.
- State, in one sentence in your report, the **accepted trade-off**: on a *sustained*-degradation box this guard still reds and still blames PowerGraph, because a retry cannot rescue a process that is being deprioritised throughout. That is deliberate and must be written down, not discovered later.

**TOUCH-ONLY:** `scripts/run-guards.mjs` · `scripts/check-power-graph-budget.mjs` · `scripts/run-guards-retry.test.mjs` (new) · the `test:node-guards` line of `package.json` (**that one line only**) · your scratch instrument + its output file in `logs/session-scratch/` · your run report in `tasks/runs/` · **temporary, reverted** mutations per scope 4.

**NO (do not touch, do not "improve"):**
- **`POWER_GRAPH_LIMITS.solveBudgetMs` (`src/systems/PowerGraph.ts:165`) — the 0.5 ms cap is FIREWALLED.** *A budget edited to fit its measurement is not a guard* (F-1156-2, F-1047-1). The healthy median is 0.374 — ~25% headroom already. If you believe the cap is wrong, that is a **finding to report**, never an edit.
- **Any permanent `src/**` change.** The scope-4 mutations are temporary and their reversion is a gated deliverable.
- **A third CPU proxy of any kind** — reference loop, min-of-N, calibration constant, load-average read. Two are already dead (§Why 4) and any in-process proxy inherits the refutation. If you find yourself measuring the box, you have left this task.
- **The `GUARDS` list membership or order in `run-guards.mjs`**, its 10-minute timeout, or its `signal:` handling. You add a policy beside them; you do not re-shape them.
- **The other seven guards' own scripts.** Scope 4(b) breaks one *temporarily* to prove the allowlist holds; it repairs nothing and ships no edit to them.
- **`e2e/bt-00-demolish.spec.ts`, `e2e/bt-01-tiers.spec.ts`, `e2e/night-light-doctrine.spec.ts`, `e2e/world-info-notes.spec.ts`** — lane-a holds a LIVE task in all four this hour (`lane-a-build-mode-prompt-spec-realign`). Touching any of them collides with a running lane (Mistake #12). This task has no reason to open them.
- Any `test.skip`, unconditional early `process.exit(0)`, `try/catch` that swallows an assertion, or any path that lets a guard pass **without** either a healthy rc or a *measured, printed, twice-attempted* flake. **The FLAKED branch is narrow and loud or it is a bug.**
- Widening the sample window, changing 224/64/p95, or altering which statistic is asserted.

## Self-check before you report READY-FOR-GATES
- `npx tsc --noEmit` clean.
- `npm run build` green.
- Scope 1 produced its ordered series, its **lag-1 `r`**, the `taskpolicy -b` pair table, and the explicit **1(e) verdict sentence** — all before any edit to `run-guards.mjs`.
- Scope 2 shipped and provably changed **no** exit code.
- If scope 3 ran: the retry test file exists, is registered in `package.json`, passes, and **asserts that importing the runner spawns nothing**.
- Scope 4(a) recorded a **real double failure** under mutation at normal QoS; 4(b) showed a first-failure red for a non-allowlisted guard; `git diff main -- src/` is **empty**.
- Scope 5's `npm run test:guards` **exit code** 0 with 8/8, and the healthy p95 body unmoved.
- `git diff --name-only main` shows nothing outside TOUCH-ONLY.

**READY-FOR-GATES** — report: the scope-1 series summary + lag-1 `r` + the pair table + the 1(e) verdict sentence; whether scope 3 ran or was cancelled; the scope-4 mutation numbers for both controls and the proof of reversion; scope 5's exit code and p95 body; the accepted trade-off sentence; and any finding you had to leave alone.
