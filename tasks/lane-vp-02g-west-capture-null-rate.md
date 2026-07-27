# Task lane-vp-02g-west-capture-null-rate: make the intermittent `:549` capture timeout say what it actually saw (lane-b, commit prefix "test:")

**FIRE-AUTHORED s1139 (attended review welcome).** From **F-1137-2** (`tasks/BACKLOG.md:1437`, s1137), **F-1138-7** (s1138) and **F-1139-3** (this fire's measurement). It invents no scope: it adds no assertion, changes no expectation, and touches no product code. **This is a DIAGNOSTIC task. It must not "fix" the flake, and it must not touch `src/`.**

CODEX: model=gpt-5.6-sol effort=high

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. **Do not compare this worktree against a list of files I wrote; I do not have one, and an exhaustive dirt list is the wrong instrument (it is what stopped a runner needlessly at s1132).** Check the **invariant** instead: **no dirty blob in this worktree may be UNIQUE — every modified/deleted/untracked file's content must already exist somewhere in git** (main's history, any branch, or this lane's own commits). If every dirty blob is reachable, the reset destroys nothing → `git checkout -B lane/m4 main && git clean -fd` and PROCEED. If **any** blob exists nowhere else, **STOP and report that file by name** — that one is real unmerged work and resetting it would be the Mistake #2 shape. (`git hash-object <file>` then `git cat-file -e <hash>` is enough; `.wrangler/tmp/**` is build scratch and is exempt.) Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

*(s1139 pre-measured the branch and you must still re-verify it: `lane/m4` is **1 ahead** at `7b35e6d3`, the vp-02f runner commit, **already drained to main at `eb387ec4`** by s1138. Confirmed by content, not by message: `e2e/vp-02-sprite-animation.spec.ts` and `e2e/vp-02b-rotation-resolver.spec.ts` are **absent from `git diff --name-only main..lane/m4`**, i.e. byte-identical to main — the slice's content is fully merged and this is a false-ahead tip. Nothing is lost by the reset.)*

## READ FIRST (paths, in this order)

1. `tasks/BACKLOG.md:1437` — **F-1137-2**, which deliberately declines to claim a diagnosis. Read that restraint before you read the code; it is the whole posture of this task.
2. `tasks/BACKLOG.md` — **F-1139-3** (this fire), the rate measurement that supersedes the "reproducible" / "did not reproduce" disagreement.
3. `e2e/vp-02-sprite-animation.spec.ts:174-194` — `canvasCaptureAtHeroFrame()`. **This is the instrument you are improving**, and its final `throw` at `:185` is the exact information gap.
4. `e2e/vp-02-sprite-animation.spec.ts:549-593` — the failing test, including its own 2-attempt reload retry at `:570-573`.
5. `e2e/vp-02-sprite-animation.spec.ts:131` — `reloadForSpriteCellRetry()`, the retry that is currently *not* rescuing these runs.

## WHY (evidence, measured this fire — re-measure it, do not inherit it)

Two fires disagreed about this test and **both were sampling the same intermittent failure without enough runs to see it**:

- s1137 (F-1137-2): *"reproducible, cure-caused, mobile-only"* — it observed failures.
- s1138 (F-1138-7): *"did not reproduce"* — it observed passes, in two full batteries, contended and quiet.

s1139 settled it by measuring a **rate** instead of hunting a reproduction. On **today's main** (the vp-02f cure merged at `eb387ec4`), a **quiet box**, scratch port, `--project=mobile-chrome -g "east heading uses explicit rotation2 files" --repeat-each=6 --workers=1`:

**2 failed / 4 passed — a ~33% mobile failure rate.**

The timing signature is the useful part: **passes take 4.9s / 5.1s / 5.7s / 10.9s; both failures take 22.3s and 22.4s.** That is the test consuming *both* attempts — the built-in reload retry at `:570` runs and still does not rescue it. So this is not a first-load warm-up artifact.

What the failure means, read at source: `west` is `null` because `canvasCaptureAtHeroFrame` threw, and it throws only when its 2000 ms poll never simultaneously satisfies **three** conditions at `:180` — `snapshot.direction === 'w'`, `snapshot.frameKey === 'char-hero-sheet-rotation-f-r1c0.png'`, and `snapshot.fadeActive !== true`. **The message it throws, `Timed out waiting for w <key>`, discards every observation it made.** So nobody can currently tell which of the three conditions failed, and that is the only reason this finding is still open after three fires.

⚠️ **This task does not fix the flake. It makes the flake explain itself.** The next fire decides the cure from what you report.

## SCOPE (numbered, each testable)

1. **ESTABLISH THE RATE YOURSELF, BOTH PROJECTS.** Run the single test `-g "east heading uses explicit rotation2 files"` with `--repeat-each=10 --workers=1`, once for `--project=mobile-chrome` and once for `--project=desktop-chrome`. Report **two rates as N/10 each**, plus the per-run durations. **If your rates disagree with the ~33%-mobile figure above, your measurement wins and you say so.** A desktop rate of 0/10 is a real and useful result — it confirms the mobile-only claim on a sample big enough to mean something.

2. **MAKE THE INSTRUMENT REPORT WHAT IT SAW.** In `canvasCaptureAtHeroFrame` only: while polling, accumulate the **distinct** observed tuples `{direction, frameKey, fadeActive}` in order (dedupe consecutive repeats; cap the list so a 2000 ms window cannot produce an unbounded string). On timeout, throw an error that includes the wanted tuple **and** that observed sequence, plus the number of frames polled.
   - ⛔ **Do not change the success condition at `:180`.** Not the three clauses, not the 2000 ms window, not the `requestAnimationFrame` cadence. You are adding an `else`-path record, nothing more. A capture that succeeds today must still succeed, identically.

3. **CAPTURE AT LEAST TWO REAL FAILURE DUMPS.** Re-run mobile with `--repeat-each=10` until you have **≥2** failures with the new message, and paste the observed sequences **verbatim** into your report. If you get 0 failures in 10, run 10 more and say so; if you reach 30 runs with no failure, that is itself the finding — report it as a rate and STOP.

4. **CLASSIFY THE CAUSE FROM THE DUMPS — and only from the dumps.** State which of these the evidence supports, and quote the tuples that support it:
   - (a) the heading never reaches `'w'` within the window (a stick/input or camera-settle problem);
   - (b) `'w'` is reached but `frameKey` is some *other* west cell (e.g. `…-f-r1c1.png`, the second stride cell) and never `r1c0` — i.e. a stride-phase race;
   - (c) the right direction+frameKey do occur but always with `fadeActive === true` — i.e. the crossfade gate;
   - (d) none of the above / the diagnostics object is absent or stale.
   If the dumps do not clearly support one, **say "inconclusive" and report the sequences anyway.** An honest inconclusive with data beats a confident guess — F-1137-2 got this right and you should too.

5. **PROVE THE NEW MESSAGE ACTUALLY FIRES.** Temporarily, in your working tree only, ask the helper for a frameKey that cannot occur (e.g. `char-hero-sheet-rotation-f-r9c9.png`) and show the thrown message contains a populated observed-sequence. Revert it. **Do not commit the mutation**, and `git status` must show no `src/` changes and no stray spec edits when you finish. *(This is the positive control: a probe that executes nothing reports nothing, and we have shipped that mistake before.)*

6. **THE SUITE MUST NOT MOVE.** Run the full `e2e/vp-02-sprite-animation.spec.ts`, both projects, `--workers=1`, and report the per-test list. The known-red `char.claim_jumper` waits at `:233` and `:707` are **excluded and expected to stay red** — leave them exactly as they are. Your change must not alter any pass/fail outcome except by making an already-failing message more informative.

## TOUCH-ONLY

- `e2e/vp-02-sprite-animation.spec.ts` (the helper at `:174-194` only)
- your report

## NO — do not touch

- ⛔ **`src/**` — ANY file.** If your dumps show the *product* is at fault (a real crossfade or stride bug), that is a **STOP + report**, and it is the most valuable outcome this task can have. Do not fix it here.
- ⛔ **Any `expect(...)` in any spec.** Especially: do not widen `:576` to accept a second frameKey, do not raise the 2000 ms window, do not add a third retry attempt, do not add `test.retry`. **Making this test pass is NOT the goal and will be rejected** — the flake is the subject under study, and loosening the assertion destroys the evidence. F-1137-2's refusal to let anyone "fix" it that way is deliberate and still binding.
- ⛔ The `:233` / `:707` `char.claim_jumper` known-reds.
- ⛔ Any other spec file, `tasks/`, `reviews/`, `STATUS.md`, `tasks/goals.json`.

## SELF-CHECK before you report

- `npx tsc --noEmit` clean; `npm run build` green.
- Scope 1's two rates, as N/10 each, with durations.
- ≥2 verbatim failure dumps (or the 30-run no-failure result).
- Scope 4's classification, with the quoted tuples, or an explicit "inconclusive".
- Scope 5's positive-control message, and proof it was reverted.
- Full `vp-02-sprite-animation` per-test list, both projects, with the two known-reds unchanged.
- Zero console/page errors introduced.
- `git status` clean of `src/`.

READY-FOR-GATES + report the two rates, the verbatim dumps, your classification, and anything you had to STOP on.
