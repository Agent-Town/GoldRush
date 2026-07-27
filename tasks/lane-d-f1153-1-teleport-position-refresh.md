# Task lane-d-f1153-1-teleport-position-refresh: make `__GR_TEST__.teleport()` refresh the action-actor position, then PROVE the flake rate falls (lane-d, commit prefix "fix:")

**FIRE-AUTHORED s1154 (attended review welcome).** F-1152-1 is **already diagnosed** — s1153 merged the diagnosis at `4f3223f8` and this fire re-verified the mechanism at source, all five sites, before authoring. This task is the **CURE**, and its deliverable is **a measured before/after rate**, not a green run.

CODEX: model=gpt-5.6-sol effort=high

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-d`.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): `lane/perf` is **0 commits ahead** of main and its three-dot diff against main is **empty** — s1154 verified that by content (`git rev-list --count main..lane/perf` = 0, `git diff --name-only main...lane/perf` = empty), not by the ahead-count. **Nothing unique dies on a reset.** Re-verify that yourself with the **unique-blob invariant** rather than a file list: no dirty/modified blob in this worktree may exist *nowhere else* in git (`git hash-object <file>` then `git cat-file -e <hash>`; `.wrangler/tmp/**` is build scratch and is exempt). If every blob is reachable → `git checkout -B lane/perf main && git clean -fd` and PROCEED. If **any** blob exists nowhere else, **STOP and name that file** — that is the Mistake #2 shape. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

⚠️ **Your two-dot diff against main will look enormous (~440 files) and that is EXPECTED, not a conflict.** Main absorbed a 428-file commit (`c7601082`) carrying `.wrangler/tmp/**` and `artifacts/**`; your lane simply predates it. **Judge this lane by the three-dot diff only.**

⛔ **`lane-calibrate-suite-workers-v2` is OWNER-BLOCKED and is NOT your task.** The block attaches to that *task*, not to this *slot* (F-1151-3).

## READ FIRST (paths, in this order)

1. `reviews/lane-d-f1152-1-confirmbuild-cause.md` — **the diagnosis you are curing.** Read it before touching anything.
2. `src/game/Game.ts:997-999` — `updateActionActorPosition()`, the one-line seam. **This already exists; you are adding a CALL, not writing a helper.**
3. `src/game/Game.ts:1649-1655` — `__GR_TEST__.teleport()`. **This is the subject.**
4. `src/game/Game.ts:1862-1868` — the harness `confirmBuild` wrapper (no refresh).
5. `src/game/Game.ts:6884-6890` — **production `confirmAction()`, which DOES refresh at `:6888` immediately before `buildSystem.confirm()`.** This asymmetry is the whole bug.
6. `e2e/m2-04-gold-stealing.spec.ts:43-47` (`placeBuildableAt`) and `:211-230`.
7. `CLAUDE.md` §5 Mistake #12, §6 (drain gate), §7 (escalation).

## WHY (quoting the evidence, dated)

**The cause is established and was verified at source twice.** s1153's drain (`4f3223f8`, review `reviews/lane-d-f1152-1-confirmbuild-cause.md`) found that **all 8/21 observed failures took `confirm()`'s `!valid` exit → `computeValid()`'s overlap check, with state one placement stale.** s1154 re-read all five sites and confirms:

- `__GR_TEST__.teleport()` (`Game.ts:1649-1655`) sets `this.localActor.group.position`, syncs visual height, zeroes velocity, resets physics and snaps render state — and **never refreshes `actionActorPosition`.**
- `BuildSystem` reads that separate vector, handed to it at `Game.ts:1211`.
- It is refreshed on the fixed tick (`:2246`) and **immediately before the PRODUCTION confirm (`:6888`)** — but **NOT** in the harness `confirmBuild` (`:1862-1868`).

➡️ **Production cannot exhibit this race; only the harness can.** A test that teleports and immediately confirms is reading the *previous* placement's position.

**The rate is large and independently reproduced:** 27–40% across s1152's interleaved probe (n=30), 38.1% in the runner's own sample, and **33.3% (5/15) re-measured by s1153 on merged main.** Every failure showed `overlapOk:false` with `playerPos` reading the **previous** placement.

⛔ **TWO CURES ARE ALREADY REFUTED — do not ship either:** a `confirmBuild` retry loop (papers over the fault), and the briefing-card dismissal (refuted s1152 by its own interleaved control, 4/15 vs 6/15).

## THE QUESTION THIS TASK ANSWERS (one sentence)

**Does refreshing the action-actor position inside `teleport()` remove the placement flake — measured as a before/after rate on the same instrument, same box, interleaved?**

## SCOPE (numbered; each item testable)

1. **Re-measure the BEFORE rate yourself, on your own lane, before changing any `src/`.** Use the existing instrument (`scripts/probe-s1152-briefing-race.mjs` or the s1153 probe named in the review — read the review and use the one it used). **n ≥ 20.** ⛔ **A before-run that reports zero failures is INCONCLUSIVE, not clean** — say so and raise n. You cannot prove a cure against a baseline you did not observe.
2. **Ship the cure: call `this.updateActionActorPosition()` inside `__GR_TEST__.teleport()`,** after the position is set and the render state snapped. This is the **default and recommended** fix because the staleness reaches *any* harness call that reads the action-actor, not just `confirmBuild`.
3. **VERIFY THE IDENTITY BEFORE YOU TRUST THE ONE-LINER.** `teleport()` moves `this.localActor`; `updateActionActorPosition()` copies `this.actionActor.group.position`. **Confirm at source whether `actionActor` and `localActor` are the same object on the harness path** (and what happens in the multiplayer slot case). If they can differ, the naive call fixes nothing and you must say so and fix it correctly. **Paste the evidence for whichever is true.** ⚠️ This is the single most likely way this task ships a no-op that looks like a cure.
4. **Measure the AFTER rate on the same instrument, same box, INTERLEAVED with the before arm if at all possible.** ⚠️ **Arm order is a confound** — s1152 produced a clean-looking 10/12-vs-5/12 result that was pure time-on-box and had to be thrown away. If you cannot interleave, run the arms in both orders and report all four numbers.
5. **Classify every m2-04 failure BY ITS FAILING ASSERTION, never by the spec's name (F-1152-4).** Two different faults share one test name: the `:226` budget red (`toBeLessThan(20)`, seen at ~20.999) and the placement failure. **"m2-04 red as usual" is the declared WRONG answer.** Report the counts of each, separately, before and after.
6. **State honestly whether the flake is GONE or merely REDUCED.** If placement failures persist at any rate above zero, that is a finding worth more than a claimed cure — report the residual rate and the state at failure.
7. **⛔ DO NOT:**
   - Touch `e2e/m2-04-gold-stealing.spec.ts`, and never widen `expect(...).toBeLessThan(20)` at `:226`. A green obtained by editing that file is the **REJECT** condition.
   - Add a `confirmBuild` retry loop, or a wait/sleep anywhere in the harness.
   - Ship the briefing-card dismissal (already refuted).
   - Refactor the 22 specs duplicating `placeBuildableAt` (F-1150-2) — out of scope.
   - Change `confirm()`, `computeValid()` or any `BuildSystem` behaviour. **The bug is in the harness; the fix belongs in the harness.**
8. **You are licensed to contradict this task.** If your before-measurement says the rate is near zero, or the cure does not move it, **say so and show the numbers.** A well-evidenced *"this cure does not work"* is a SUCCESS here and is far more valuable than a green you had to arrange.

## FIREWALL

**TOUCH-ONLY:** `src/game/Game.ts` — *the `teleport()` body only*, per scope 2/3 · `scripts/probe-*.mjs` (extend an existing probe or add one sibling) · `artifacts/f1153-1-teleport-refresh.md` (new report) · `artifacts/f1153-1-teleport-refresh/**` (new raw records) · `reviews/` **NO**.

**NO:** ❌ `e2e/**` (any file — the specs are the measuring instrument, not the subject) · ❌ `src/systems/BuildSystem.ts` · ❌ any other `src/` file · ❌ no retry loops, no sleeps, no timeouts added to harness calls · ❌ no `assets/**`, no `generated.ts`, no contracts · ❌ do not touch `STATUS.md`, `tasks/**` or `logs/**`.

## SELF-CHECK (run these exact commands; report each result)

1. `npx tsc --noEmit` → **rc=0**.
2. `npm run build` → **rc=0**. ⚠️ Run it as a **single command with NO pipe** — a pipeline masks the exit code.
3. `npm run test:guards` → report the pass count (expect **8/8**).
4. `npx playwright test e2e/m2-04-gold-stealing.spec.ts --repeat-each=5` in **both** projects (desktop + 390px mobile) → report **every** failure classified by its failing assertion per scope 5.
5. The before/after probe numbers from scope 1 and 4, with **n**, the arm order, and whether they were interleaved.
6. `git status --porcelain -- src/ e2e/ scripts/` → paste it, and confirm `e2e/` is **untouched**.
7. Paste the **full `src/` diff**. It should be ~1 line plus comment. **Any hunk that changes control flow or timing outside `teleport()` is a firewall violation — STOP instead.**
8. Zero console/page errors in the probe's boot path; note any that appear.

**READY-FOR-GATES** — then report: the before rate and after rate with n and arm order · whether `actionActor === localActor` on the harness path, with the source evidence (scope 3) · the m2-04 failure counts split by assertion, before and after · the full `src/` diff · and an explicit statement of whether the flake is **GONE** or **REDUCED**, with the residual rate if any.
