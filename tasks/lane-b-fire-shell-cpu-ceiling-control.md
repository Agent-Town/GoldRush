# Task fire-shell-cpu-ceiling-control: run ONE committed probe in the lane shell and report its numbers (LANE SLOT)
FIRE-AUTHORED s1268 (attended review welcome) — attempt 1.
You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b` (branch `lane/m4`, commit prefix `test:`).
CODEX: model=gpt-5.6-sol effort=medium

> 🔬 **THIS TASK CHANGES NO CODE AND FIXES NOTHING. It runs one committed script and reports what
> it printed.** There is no cure to implement, no file to edit, and **no outcome that counts as a
> failure** — a high number and a low number are equally successful runs, and they mean opposite
> things, which is exactly why the run is worth its slot.
>
> ⛔ **Do NOT edit `src/`, `e2e/`, `playwright.config.ts`, `package.json`, or the probe script itself.**
> ⛔ **Do NOT implement `gazette-welcome-drift-observation-frame` (v1 or v2)** — still parked, still
> waiting on the question below.

## READ FIRST (paths, in this order)
1. `logs/session-scratch/s1268/RESULTS.md` — §3, §4 and §5. The whole reason for this task.
2. `logs/session-scratch/s1268/child-scaling-v2.mjs` — the probe you will run. Read it; it is 60 lines.
3. `logs/session-scratch/s1267/RESULTS.md` §4 — the lead that produced s1268's sweep.

## Why this exists

Six fires have argued about one assertion, `e2e/gazette-welcome.spec.ts:88`
("the Gazette welcome fires once, walks skippably, and retriggers through the newsie" — the
newsie-drift `toBeLessThan(1)` check). The state of the
argument is **F-1264-3: the fire shell and the lane shell are not the same measuring instrument** —
the identical command on the identical commit goes **6/6 GREEN in the lane (~14s)** and **6/6 RED
in the fire shell (~50s/test)**. s1265 killed the sandbox, the node version, and vite warmth.
s1267 killed the working directory. s1268 measured the fire side as a curve and found the shape
underneath it:

- **The drift red is a graded dose on concurrent browser count** — 0/18 · 5/18 · 14/18 · 18/18 at
  1 · 2 · 3 · 6 workers (n=72). The serial arm read **0 reds across loadavg 2.46 → 20.65**.
- At 6 workers **every test inflates 6.7×** (7.5s → 50s) and throughput falls **below serial** —
  while `top` reports **44–52% idle** and memory **79% free**. Not CPU saturation. Not memory.
  Not thermal. No orphan servers, no foreign load, nice 0 / pri 20 throughout.
- ⭐ **The fire shell's spawned CHILD PROCESSES cap at ~3.1–3.5× parallel throughput on a 16-core
  box.** With eight CPU-bound children live, `top` shows all eight at **54.4–54.5% of a core each**
  while **45.3% of the box is idle**. Eight independent processes converging on an identical share
  is a policy ceiling, not competition.
- Refuted by execution, so do not re-test them: the **sandbox** (3.15× vs 2.93×, indistinguishable),
  the **Background QoS class** (`taskpolicy -c background` is **0.51×** — 7× worse than where the
  fire sits), and an inherited **background designation** (`taskpolicy -B` on self: 3.64× → 3.76×,
  nothing to remove).

🚨 **What s1268 could NOT do, and why it is your task.** Every one of those readings was taken
*inside the fire's own process tree*. A launchd resource limit and "this box simply cannot do
better" produce identical numbers from in there. **Your shell is the other arm** — a login zsh
under Terminal, not a launchd job. One command separates them, and no fire can run it.

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)

The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its
content is already merged to main (verify via git log/diff), it is a SAFE DUPE →
`git checkout -B lane/m4 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead
commit's content is **NOT** on main (undrained work — resetting would DESTROY it), or the worktree
holds uncommitted edits you did not make.

🔴 **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266).** Changes confined to regenerated evidence —
`artifacts/**`, `reviews/shots-*`, any `.png` — are **NEVER "work" and NEVER a STOP**, as dirt or
as the entire content of an ahead commit. Discard them and PROCEED, listing what you discarded.
Three consecutive masters on this thread died at this exact gate; do not be the fourth.

⚠️ **Premise check, run it AFTER the reset, not before:** `logs/session-scratch/s1268/child-scaling-v2.mjs`
must exist in your worktree. It was committed to main by s1268 before this task was queued. If it
is missing, STOP and report that — it means the queue copy outran its evidence.

## Scope

1. **Report your environment, from commands, not assumptions.** `node --version`; the core count
   (`node -e "console.log(require('os').cpus().length)"`); and `sysctl -n machdep.cpu.brand_string`.
2. **Run the probe, verbatim, and paste its complete stdout into your report:**
   `node logs/session-scratch/s1268/child-scaling-v2.mjs lane 3`
   It takes ~2 minutes, runs 3 repetitions of a 1/2/3/6/8-child sweep, and writes exactly one new
   file, `logs/session-scratch/s1268/child-scaling-lane.json`. **Do not modify the script**, do not
   change the tag from `lane` (it must not overwrite the fire's file), and do not tune the reps.
3. **Report these four numbers explicitly**, quoted from the run and not recomputed by hand:
   the **best 8-child throughput multiplier**, the **idle percentage during the 8-child arm**, the
   **eight per-child %CPU values**, and your **core count**.
4. **Same-shell cross-check on the actual subject**, one run, so the CPU reading and the test
   outcome come from the same shell in the same session:
   `npx playwright test e2e/gazette-welcome.spec.ts --project=desktop-chrome --project=mobile-chrome --repeat-each=3 -g "fires once" --reporter=list --workers=6`
   Report the reporter's own `Running X tests using M workers` line, the failed/passed counts, and
   the wall time. **If the worker line does not say 6, say so and do not draw any conclusion from
   the run** — the box resolved a different default and the arm is void.
5. **Do not interpret.** Report the numbers. The drainer owns the conclusion; the table below is
   printed here only so you can see that every outcome is a real answer.

| your 8-child reading | what it will mean (drainer's call, not yours) |
|---|---|
| **~7–12×** | the ceiling is the fire's process context; the six-fire divergence is explained and the remedy is one key in one plist |
| **~3×, like the fire's** | the ceiling is the BOX; the fire's context is exonerated and the lane's own 14s green becomes the thing to re-measure |
| between | a partial ceiling — report it and stop |

## Firewall

**TOUCH-ONLY:** nothing. The only file you create is `logs/session-scratch/s1268/child-scaling-lane.json`,
written by the probe itself.
**NO:** `src/**` · `e2e/**` · `playwright.config.ts` · `package.json` · `tasks/**` · `STATUS.md` ·
`reviews/**` · `logs/session-scratch/s1268/child-scaling-v2.mjs` (the shared instrument — if you
change it, the two arms stop being the same measurement and the fire's numbers become worthless).

**Expected diff, stated so it is not mistaken for a violation:** one new untracked JSON from scope 2,
plus up to six regenerated tracked `artifacts/gazette-welcome/*.png` from scope 4. **That is correct
and expected** (F-1266-1). A zero diff would mean scope 4 never ran.

## Self-check before you report

- [ ] Pre-flight outcome stated: ahead/behind counts, and what (if anything) you discarded.
- [ ] `child-scaling-v2.mjs` confirmed present **after** the reset; not modified (`git diff` on it is empty).
- [ ] Probe stdout pasted in full — all three rep lines plus the BEST/idle/child-%CPU summary lines.
- [ ] The four scope-3 numbers stated as their own line items.
- [ ] Scope 4's `Running X tests using M workers` line quoted verbatim, with failed/passed and wall time.
- [ ] `git status` reported; the only changes are the new JSON and regenerated PNGs.
- [ ] No file in the NO list touched.

READY-FOR-GATES — report: the environment triple, the full probe stdout, the four scope-3 numbers,
the scope-4 reporter line with its counts and wall time, your pre-flight outcome, and your final
`git status`.
