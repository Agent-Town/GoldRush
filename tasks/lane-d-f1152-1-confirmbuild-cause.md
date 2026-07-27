# Task lane-d-f1152-1-confirmbuild-cause: find WHY `confirmBuild()` returns false — instrument the function, not the harness (lane-d, commit prefix "chore:")

**FIRE-AUTHORED s1152 (attended review welcome).** This is **attempt 3** at the placement flake and it is licensed by a **CHANGED PREMISE**, not by persistence (§7.5 forbids an identical retry). Attempts 1 and 2 both asked *"what is different about the harness?"* and killed five hypotheses that way. **Nobody has yet read `BuildSystem.confirm()` and enumerated the branches that actually return false.** That is this task. It is a **DIAGNOSIS** task: the deliverable is **a named branch plus the evidence that it fired**, not a repair.

CODEX: model=gpt-5.6-sol effort=high

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-d`.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): `lane/perf` is **1 commit ahead** of main (`09c00af2 runner(lane-d): lane-calibrate-suite-workers-v2.md`) and that is a **false-ahead** — s1152 verified it at the blob, not by the ahead-count: the entire three-dot diff is one file, `reviews/calib-suite-workers-v2.md`, and `git diff main..lane/perf -- reviews/calib-suite-workers-v2.md` is **88 deletions / 0 insertions**, i.e. **main is a strict superset** (main additionally carries the s1125 drain verdict this lane predates). **Nothing unique dies on a reset.** Re-verify that yourself with the **unique-blob invariant** rather than a file list: no dirty/modified blob in this worktree may exist *nowhere else* in git (`git hash-object <file>` then `git cat-file -e <hash>`; `.wrangler/tmp/**` is build scratch and is exempt). If every blob is reachable → `git checkout -B lane/perf main && git clean -fd` and PROCEED. If **any** blob exists nowhere else, **STOP and name that file** — that is the Mistake #2 shape. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

⛔ **`lane-calibrate-suite-workers-v2` is OWNER-BLOCKED and is NOT your task.** Do not drain it, re-run it, or re-queue it. The block attaches to that *task*, not to this *slot* (F-1151-3, verified s1152).

## READ FIRST (paths, in this order)

1. `reviews/lane-c-f1148-1-trajectory-spec-rig.md` — F-1152-1 in full, **including the control that refuted the briefing-card cure.** Read this before forming any theory.
2. `scripts/probe-s1152-briefing-race.mjs` — **the working instrument. It already interleaves arms and reports a placement-failure rate.** You are extending it, not rebuilding it.
3. `src/systems/BuildSystem.ts:810-839` — `confirm()`. **This is the subject.**
4. `src/game/Game.ts:1862-1868` — the `__GR_TEST__.confirmBuild` wrapper, including its own `!this.deepwaterClaim` guard.
5. `e2e/m2-04-gold-stealing.spec.ts:43-47` (`placeBuildableAt`) and `:211-230`.
6. `CLAUDE.md` §5 Mistake #12 and §7 (escalation).

## WHY (quoting the evidence, dated)

**The flake is real, large, and it is in the DEFAULT SUITE.** s1152 measured `e2e/m2-04-gold-stealing.spec.ts` with `--repeat-each=5` on a quiet box. Of the five repeats of *"thief routes around a finite palisade line to steal"*: **three failed at `:226`** (the known budget red), **one failed at PLACEMENT** (`confirmBuild` → `resolves.toBe(true)` received `false`), and **one passed outright.**

⚠️ **That mix is itself a hazard and is half the reason this task exists.** Two different faults share one test name, so anyone fingerprinting "m2-04 is red" against the known `:226` label will **silently absorb a placement failure as the budget red.** Splitting them requires reading the failing assertion every time.

Rate, measured independently in the derived probe spec with **interleaved** arms, n=15/arm (`scripts/probe-s1152-briefing-race.mjs`): **27–40% of runs fail at placement.**

⛔ **FIVE HYPOTHESES ARE DEAD. DO NOT RE-RUN THEM:**
- **timescale** — identical rates at 1 and 10 (s1150).
- **readiness as a rig *difference*** — `openGame` is the same three steps in both rigs (s1150). ⚠️ Note carefully what that refuted: it showed the two rigs are *equal*, **not** that either is sufficient. **A shared defect is invisible to a differential test.**
- **device context** — 2/5 vs 1/5, noise (s1150).
- **the briefing overlay** — the "Contract/Begin" card *was* visible at one observed failure, but adding the house `Begin` dismissal did **not** reduce the rate (control 4/15 vs treatment 6/15, interleaved). ⛔ **Do not ship that dismissal as a cure** (s1152).
- **cold worker / "always run 1"** — looked clean at n=2; failures scatter across run indices 1, 2 and 3 at n=30 (s1152).
- **load** — the box was quiet for every number above (s1152), refuting s1151's leading guess.

➡️ **Every one of those asked about the HARNESS. This task asks about the FUNCTION.** `confirm()` has four distinct `false` exits and the wrapper adds a fifth, and **no fire has yet established which one fires.** That is a five-way question being answered by guessing, and it is cheap to just look.

## THE QUESTION THIS TASK ANSWERS (one sentence)

**When `confirmBuild()` returns false in this spec family, WHICH of its false-exits fired, and what was the state that made it fire?**

## SCOPE (numbered; each item testable)

1. **Enumerate the exits from source first, before running anything.** Write them out in your report with line numbers. From `BuildSystem.confirm()` they are at least: `:811` `!this.mode` · `:819` `!this.valid` (via `computeValid()`) · `:830` `!result.ok` (economy rejected the spend) · `:833` `placed < 0` (`place()` failed). Plus `Game.ts:1864` `!this.deepwaterClaim`. **If you find more, that is a finding — list them all.**
2. **Add a diagnostic that reports WHICH exit fired.** Extend the `__GR_TEST__` surface with a **read-only** last-failure reason (e.g. `confirmBuildDiagnostics()` returning `{ reason, mode, valid, deepwaterClaim, ghostPos, playerPos, economyOk }`). ⚠️ **This is the one permitted `src/` change and it must be PURELY ADDITIVE: it may not alter the return value, the control flow, or the timing of `confirm()`.** A diagnostic that changes what it measures is worthless. Prove additivity by pasting the diff.
3. **Capture the reason across a real failure sample.** Extend `scripts/probe-s1152-briefing-race.mjs` (or add a sibling) to run ≥20 placement attempts and record, for **every** failure, the exit reason and the accompanying state. ⛔ **A run that reports zero failures is INCONCLUSIVE, not clean** — say so and raise n, exactly as the existing instrument already prints.
4. **Report which palisade fails.** The bare-chromium probe failed 7/8 times on the **fifth** (`palisade@2,9`) while the spec-runner failures observed so far are on the **first**. ⚠️ **Do NOT assume these are the same fault.** Record the failing `x` for every failure and let the data say whether it clusters.
5. **Then, and only then, form a cause.** State it with the branch, the state that produced it, and the reproduction rate. ⚠️ **If the reason turns out to be `!this.valid`, keep going one level: `computeValid()` is where a range-from-player or terrain/collision check would live, and `placeBuildableAt` teleports the player immediately before confirming — a teleport that has not taken effect is a live candidate.** Name the sub-check, do not stop at "invalid".
6. **⛔ DIAGNOSE, DO NOT REPAIR.**
   - **Do not fix the flake.** Recommend a cure in prose; ship none. A repair here touches the build system, which is gameplay code adjacent to owner-gated pathing work.
   - **Do not touch `e2e/m2-04-gold-stealing.spec.ts`,** and in particular never widen `expect(...).toBeLessThan(20)` at `:226`. A green there obtained by editing that file is the **REJECT** condition.
   - **Do not add a `confirmBuild` retry loop** anywhere. It papers over the fault and destroys the measurement's only value.
   - **Do not refactor the 22 specs that duplicate `placeBuildableAt`** (F-1150-2) — out of scope.
7. **You are licensed to contradict everything above.** If your data says the rate is far lower than 27–40%, or that the five dead hypotheses were killed too early, **say so and show the numbers.** A well-evidenced *"s1152 was wrong"* is the most valuable outcome available here, and **a STOP with reasons is a SUCCESS** — attempts 1 and 2 both proved that.

## FIREWALL

**TOUCH-ONLY:** `src/systems/BuildSystem.ts` **and/or** `src/game/Game.ts` — *additive diagnostics only*, per scope 2 · `src/vite-env.d.ts` (the `__GR_TEST__` type) · `scripts/probe-s1152-briefing-race.mjs` (extend) or a new `scripts/probe-s1152b-*.mjs` · `artifacts/f1152-1-confirmbuild-cause.md` (new) · `artifacts/f1152-1-confirmbuild/**` (new raw records).

**NO:** `e2e/m2-04-gold-stealing.spec.ts` (read-only; never widen `:226`) · `e2e/f1148-1-trajectory-probe.spec.ts` (merged, opt-in — leave it) · any **behavioural** `src/` change · any other `e2e/**` · `STATUS.md` · `tasks/**` · `reviews/**` · `scripts/probe-f1148-1-trajectory.mjs` and `scripts/probe-s1150-confirmbuild-rate.mjs` (retained artifacts, RETENTION LAW) · the 22 specs duplicating `placeBuildableAt` · anything enrolling a new spec in the default suite.

## SELF-CHECK (run these; paste the output)

1. `npx tsc --noEmit` → rc=0.
2. `npm run build` → rc=0. ⚠️ Run it **without a pipe** — `npm run build | tail` reports the pipe's exit code, not the build's.
3. `node scripts/run-guards.mjs` → **8/8**. (If you see 7/8 from this worktree, check `test:task-guards` — it SKIPs in a linked worktree by design, F-1151-1.)
4. Your instrument's full output: ≥20 attempts, every failure's exit reason + failing `x`, and the pass/fail totals.
5. `git diff -- src/` → paste it in full. It must be **additive diagnostics only**; a behavioural hunk is a firewall violation and the drain will reject it.
6. `git status --short` → only the TOUCH-ONLY files.
7. `npx playwright test e2e/m2-04-gold-stealing.spec.ts --project=desktop-chrome --workers=1 --reporter=list` → paste it. **Expect a red, and CLASSIFY it**: `:226` is the known budget red; a `resolves.toBe(true)` red is a placement failure. ⚠️ **Reporting "m2-04 red as usual" without naming the assertion is exactly the error this task exists to prevent.**

## SEQUENCING / LAWS

- Path-scoped `git add` only — never `-A` at repo root. Commit prefix `chore:`.
- One concern per commit.
- The runner auto-commits on this lane; do not touch `STATUS.md`, `tasks/**` or `reviews/**`.
- Blocked twice on the same obstacle → **STOP and report** rather than a third variation (§7.5).

**READY-FOR-GATES** when scopes 1–7 are done. Report: the full exit enumeration with line numbers, which exit fired and at what rate, the failing-`x` distribution and whether it clusters, the state captured at failure, your proposed cure **in prose only**, the additive-only `src/` diff, the m2-04 run **with its failures classified by assertion**, and anything you are reporting rather than fixing.
