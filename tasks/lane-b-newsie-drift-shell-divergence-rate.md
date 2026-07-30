# Task newsie-drift-shell-divergence-rate: measure the LANE side of the shell divergence as a RATE, and report the lane's own environment (LANE SLOT)
FIRE-AUTHORED s1265 · **AMENDED s1266** (attended review welcome) — attempt 2. Its first run
(`20260730-192621`) measured nothing: it stopped at the lane-safety pre-flight over four regenerated
screenshots that were v1/v2's exhaust. Changed premise per §7.5: the lane is pre-cleared, the
pre-flight now classifies evidence artifacts, and the firewall's false "writes no file" claim is
corrected (F-1266-1). **The measurement scope below is UNCHANGED — it has still never been run.**
You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b` (branch `lane/m4`, commit prefix `test:`).
CODEX: model=gpt-5.6-sol effort=high

> 🔬 **THIS TASK CHANGES NO CODE. IT IS A MEASUREMENT, AND ITS ONLY DELIVERABLE IS A TABLE OF NUMBERS.**
> There is no cure to implement, no file to edit, and **no outcome that counts as a failure.** Every
> result this task can produce is the result the factory needs. Read that twice before you start
> looking for something to fix — the two previous masters on this assertion both died trying.
>
> ⛔ **DO NOT implement `gazette-welcome-drift-observation-frame` (v1 or v2). Do not edit `e2e/` or `src/` at all.**
> Those masters are parked precisely because the question below is unanswered.

## Why this exists (read it, it is short and it is the whole point)

Five fires have now argued about one assertion, `e2e/gazette-welcome.spec.ts:88`
("the Gazette welcome fires once, walks skippably, and retriggers through the newsie"). The current
state of the argument is **F-1264-3: "the fire shell and the lane shell are not the same
measuring instrument"** — the identical command, in the identical worktree, on the identical
commit, goes **6/6 GREEN in the lane (13.8 s)** and **6/6 RED in the fire shell (55–60 s/test)**.

s1265 then killed three candidate explanations by execution (F-1265-1): **not the sandbox**,
**not a CPU/core cap** (the fire shell measures a 5.04× parallel speedup on 6 workers), and
**not the node major version** (node26 = 11 drift reds/12 instances, node23 = 11/12, interleaved).

But s1265 also found the hole in the whole argument (F-1265-2): ⭐ **the lane-green half is n=1.**
It is a *single* 13.8-second run. And s1265 demonstrated on this exact assertion that a single
6-instance reading **flips** — its own first node-23 run read `2 failed / 4 passed`, a clean and
completely wrong answer that evaporated to 11/12 red once it was sampled properly.

➡️ **So: before the factory spends another fire hunting an environment difference, somebody has to
check that the difference exists.** You are the only party who can measure the lane side.

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)

The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its
content is already merged to main (verify via git log/diff), it is a SAFE DUPE →
`git checkout -B lane/m4 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead
commit's content is **NOT** on main (undrained work — resetting would DESTROY it), or the worktree
holds uncommitted edits you did not make.

🔴 **EVIDENCE-ARTIFACT EXCEPTION — READ THIS, IT IS WHY YOUR PREDECESSOR NEVER MEASURED ANYTHING
(F-1266-1, s1266).** Changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`,
any `.png` screenshot — are **NEVER "work" and NEVER a STOP**, whether they sit as uncommitted dirt
or as the whole content of an ahead commit. Screenshots are never byte-identity gated, so their
bytes differ from main forever. **Discard them and PROCEED**, listing what you discarded.
⚠️ **This master's own first run (`20260730-192621`) stopped dead here** — it found four modified
`artifacts/gazette-welcome/*.png`, correctly refused to reset over unknown work, and measured
nothing. Those PNGs were the *exhaust of v1 and v2*: a run that STOPS still ran playwright and
still regenerated screenshots. Three consecutive masters died before taking a single measurement.

✅ **s1266 pre-cleared this lane for you**: `lane/m4` was reset to main (`0 ahead / 0 behind`,
clean worktree), and the churn commit `2f15624c` is preserved at `archive/lane-b-shots-churn-s1266`.
**So your own pre-flight should measure 0 ahead, 0 behind, and an empty `git status`.** If it does
NOT, say so loudly and report what you found — that is new information, not a reason to stop.

⚠️ **Re-derive this yourself after the reset (VERIFY-DON'T-INHERIT).** At authoring time s1265
measured `git diff --name-status --diff-filter=A main..lane/m4` as **EMPTY** — nothing exists on
the lane that is absent from main. **If your own re-measurement finds any `A` line, or any two-dot
diff touching `e2e/` or `src/`, STOP** — do not reason it away.

Then `npm install --no-audit --no-fund`, and `npm run build` green before you measure anything.

## READ FIRST (paths, in this order)

1. `logs/session-scratch/s1265/RESULTS.md` — **the measurement this master stands on**, including
   the false positive that nearly shipped. Read it before you run anything. **Read-only.**
2. `logs/session-scratch/s1264/RESULTS.md` — the fire-shell red, sampled 18/18. **Read-only.**
3. `e2e/gazette-welcome.spec.ts` — the subject. Read the test `the Gazette welcome fires once,
   walks skippably, and retriggers through the newsie` (starts `:45`); the assertion under
   measurement is `e2e/gazette-welcome.spec.ts:88`, the `toBeLessThan(1)` drift bound inside
   ("the Gazette welcome fires once, walks skippably, and retriggers through the newsie").
   **You will not modify this file.**

**Owner-relevant framing (Mistake #10):** nothing a player sees changes, and no src file is
touched. This is the factory refusing to build a fourth theory on a single unreplicated reading.

## Scope (numbered; each independently checkable)

1. **REPORT YOUR ENVIRONMENT, BEFORE ANY TEST RUN.** Three facts, each from a command, each quoted
   verbatim in your report — the fire shell's values are in brackets for contrast, **do not copy
   them, measure your own**:
   - `node --version` [fire shell: **v26.4.0**]
   - `node -e "console.log(require('os').cpus().length)"` [fire shell: **16**, Apple M4 Max]
   - `node logs/session-scratch/s1265/renderer.mjs` — asks chromium what renders its WebGL.
     [fire shell: **SwiftShader**, i.e. CPU software rasterisation]
   ⚠️ **If your renderer line does NOT say SwiftShader, say so loudly** — that is the last
   surviving mechanism candidate and you would have just closed it.

2. **MEASURE THE CONCURRENT ARM AS A RATE — FOUR RUNS, NOT ONE.** This is the deliverable. Run,
   **four separate times**, on the clean unmodified tree, recording `uptime` loadavg before each:

   ```
   npx playwright test e2e/gazette-welcome.spec.ts --project=desktop-chrome --project=mobile-chrome --repeat-each=3 -g "fires once" --reporter=list
   ```

   For **each** run report: the reporter's `Running N tests using M workers` line verbatim, the
   pass/fail counts, the **wall time**, the loadavg, and **the `Received:` value of every red**.
   Then report the total as a rate: **drift-assertion reds / 24 instances.**
   - ⚠️ **Count reds by the assertion's own `toBeLessThan(expected)` signature**, not by the run's
     total failure count — another assertion failing in the same test must not inflate the number.
   - ⚠️ **If `M` comes back as 1**, your box resolved a different default; re-run with an explicit
     `--workers=6` and say so. A worker count of 1 makes the arm meaningless.

3. **MEASURE THE SERIAL CONTROL TWICE.** Same command plus `--workers=1`, two runs, same reporting.
   The fire shell and the lane previously agreed here (~8–9 s/test, 49.1 s total on each side);
   this checks that agreement still holds and anchors your box against both prior measurements.

4. **INTERPRET YOUR OWN NUMBER, IN ONE PARAGRAPH, USING THIS TABLE.** Do not hedge — say which row
   you landed in:
   | your concurrent rate | what it means |
   |---|---|
   | **0–2 / 24** | The shells genuinely differ. F-1264-3 stands and the environment audit is justified. |
   | **~20–24 / 24** | **There was never a shell difference.** Codex's 13.8 s green was a lucky single sample, five fires of theory rest on it, and F-1264-3 should be retired. |
   | **anything in between** | It is a *rate*, not a property of a shell — the assertion is load/timing-sensitive in both environments and the whole "which shell" framing is wrong. |

5. **REPORT, DO NOT FIX, ANYTHING ADJACENT.** If you notice other `e2e/` assertions that would be
   sensitive to the same effect, list them `file:line` and **touch none of them.**

## Firewall

**TOUCH-ONLY:** nothing **you author**. Your entire output is the run report.

⚠️ **CORRECTED s1266 (F-1266-1) — the previous wording here was factually wrong and it cost three
runs.** It said "this task writes no file in the repository" and "there should be an empty diff."
**That is not true of the command in scope 2:** `e2e/gazette-welcome.spec.ts` regenerates four
tracked screenshots — `artifacts/gazette-welcome/{desktop,mobile}-chrome-{delivery-moment,walk-beat}.png`
— every time it runs. So a **non-empty diff limited to exactly those four PNGs is the EXPECTED and
CORRECT outcome.** Do not revert them, do not treat them as a scope violation, do not "fix" them,
and do not let them stop you. Name them in your report as expected exhaust. A diff touching
**anything else** is the violation.

**NO:** `src/**` · `e2e/**` · `playwright.config.ts` · `package.json` · `tasks/**` · `STATUS.md` ·
any file at all. **Do not implement the parked cure. Do not "fix" the assertion you are measuring.**

## Self-check before you report

- [ ] Environment reported from three commands, not from this master's bracketed values.
- [ ] **Four** concurrent runs, each with its own worker-count line, loadavg, wall time, `Received:` values.
- [ ] **Two** serial runs.
- [ ] Reds counted by `toBeLessThan(expected)`, and the rate stated as `N / 24`.
- [ ] Row of the scope-4 table named explicitly.
- [ ] `git status` shows no modified tracked file **other than the four expected
      `artifacts/gazette-welcome/*.png`** — list them by name and call them expected exhaust.
      (Corrected s1266: the old wording demanded a clean tree the prescribed command cannot leave.)

**READY-FOR-GATES** — report: your environment triple, the two rate tables, the row you landed in,
and any adjacent `file:line` list. **There is no failing outcome. A rate of 0/24 and a rate of
24/24 are equally successful runs of this task; only an unsampled answer is a failure.**
