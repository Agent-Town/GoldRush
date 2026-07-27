# Task lane-c-f1148-1-trajectory-spec-rig: re-run the m2-04 trajectory split through the PLAYWRIGHT TEST RUNNER (lane-c, commit prefix "chore:")

**FIRE-AUTHORED s1151 (attended review welcome).** This is **attempt 2** of the F-1148-1 measurement, and it is licensed by a **CHANGED PREMISE**, not by hope (§7.5 forbids an identical retry). Attempt 1 (`lane-c-f1148-1-trajectory-split`, landed as a lawful STOP at `83eab9b0`) was **blocked by its own instrument, not by the game.** That is measured, not assumed — see WHY. Your job is the same question with a rig that empirically works. This is a **MEASUREMENT** task: the deliverable is a **three-arm trajectory table and a classification**, **not a repair**. The cure is OWNER-GATED. Read scope 7 before you touch anything.

CODEX: model=gpt-5.6-sol effort=high

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c`.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits, and s1151's drain grafted the tip rather than merging it, which leaves a **false-ahead**. **Do not compare this worktree against a list of files I wrote; I do not have one, and an exhaustive dirt list is the wrong instrument (it is what stopped a runner needlessly at s1132).** Check the **invariant** instead: **no dirty blob in this worktree may be UNIQUE** — every modified/deleted/untracked file's content must already exist somewhere in git (main's history, any branch, or this lane's own commits). If every dirty blob is reachable, the reset destroys nothing → `git checkout -B lane/e2-arsenal main && git clean -fd` and PROCEED. If **any** blob exists nowhere else, **STOP and report that file by name** — that one is real unmerged work and resetting it would be the Mistake #2 shape. (`git hash-object <file>` then `git cat-file -e <hash>` is enough; `.wrangler/tmp/**` is build scratch and is exempt.) Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

*(s1151 measured this lane at close and you must still re-verify it: `git rev-list --count main..lane/e2-arsenal` was **1**, and that 1 is a **false-ahead** — proven at the blob, not by an ahead-count. `git rev-parse main:e2e/lane-c-activations-assay-office.spec.ts` and the same on `lane/e2-arsenal` both returned `179ecc92345b713aa17f89794449ad69d675c7ca`, and `git diff --numstat main lane/e2-arsenal` showed main NEWER on all five differing files. The lane holds nothing unique. If that is no longer true, apply the invariant above.)*

## READ FIRST (paths, in this order)

1. `reviews/lane-c-f1148-1-trajectory-split.md` — attempt 1's review, **including why it stopped**. Read this before anything else.
2. `artifacts/f-1148-1-trajectory-split.md` — attempt 1's own report, written under the block. It is honest and it invents no data; treat its UNMEASURED verdict as true.
3. `scripts/probe-f1148-1-trajectory.mjs` — **attempt 1's committed probe. The in-page measurement block at `:55-80` is CORRECT and is your starting material.** What failed was the harness around it, not the physics inside it.
4. `artifacts/f-1147-1-bisect.md:84-107` — the original instrument and its numbers; the rAF trajectory table at `:95-100` is the shape you are reproducing with a third arm.
5. `e2e/m2-04-gold-stealing.spec.ts:17-23` (`openGame`), `:43-47` (`placeBuildableAt`), and `:211-230` (the `"thief routes around a finite palisade line to steal"` test). **This is the rig that works, and you will NOT edit this file.**
6. `src/entities/Enemy.ts:688-731` — the live mechanism: the blocker-aware detour at `:688` and the seeded lateral bias added **on top** at `:704-728`.
7. `CLAUDE.md` §5 Mistake #12 and §7 (escalation).

## WHY (quoting the evidence, dated)

Attempt 1 rebuilt the trajectory probe as a **standalone bare-chromium script** (`scripts/probe-f1148-1-trajectory.mjs`, `chromium.launch()` at `:10`). It could not place its fifth palisade — `confirmBuild failed: palisade@2,9` — hit that twice, stopped under its own two-strike rule, and reported **UNMEASURED**. It invented no data. That was correct behaviour and F-1148-1 is still **OPEN and unclaimed**.

Attempt 1 attributed the block to *"the separate `placeBuildableAt` fault already recorded by the predecessor"* — i.e. to the **game**. **s1150 measured that attribution and it is WRONG** (verbatim from the s1150 handoff, `fab3cede`/`83eab9b0`, instrument `scripts/probe-s1150-confirmbuild-rate.mjs`, 5 runs per arm, positive control green):

> the bare-chromium probe places **1/5 at `timescale=1` AND 1/5 at `timescale=10`**, while the m2-04 spec places all five palisades **4/4** through the Playwright test runner, failing only later at `:226` (`--repeat-each=3` → **3/3 fail at `:226`, never at placement**). Seven of eight probe failures are the **fifth** palisade, `palisade@2,9`.

**Three hypotheses were tested and REFUTED, so do not re-run them:** *timescale* (identical rates), *readiness* (`openGame` at `m2-04-gold-stealing.spec.ts:17-23` is the same three steps the probe performed), and *device context* (spreading `devices["Desktop Chrome"]` gave 2/5 vs 1/5 — noise at n=5, not a cure). The dev server, viewport `1280x800`, and `channel:'chromium'` were all verified equal between the two rigs.

**The divergence is UNEXPLAINED and is recorded as open.** ➡️ **But this task does not depend on the cause.** The empirical fact is enough: **placement is reliable through the Playwright test runner and unreliable in bare chromium.** So build the instrument where it works.

## THE QUESTION THIS TASK ANSWERS (one sentence)

**On today's main, does removing the lateral bias restore the parent revision's ROUTE, or only part of it?**

Answer it with the trajectory probe, not with the pass/fail counter. `expect.poll` cadence *amplifies* route delay (the predecessor measured `10.334 → 20.596` at the assertion for a `7.997 → 10.836` change in the route), so pass/fail counts compress three different worlds into one number. **Trajectory separates them.**

## SCOPE (numbered; each item testable)

1. **Port the probe into a SPEC, reusing the rig that works.** Create `e2e/f1148-1-trajectory-probe.spec.ts`. It must:
   - use the **m2-04 spec's own** `openGame` and `placeBuildableAt` shapes and its exact setup from `:212-214` — `?debug&timescale=10&nowaves&nokill&nolevel&seed=m2-04-walls`, `setBalance('palisade.cost', 0)`, then `for (const x of [-2,-1,0,1,2]) placeBuildableAt(page,'palisade',x,9)`. **Copy those helpers into the new spec** (F-1150-2: there is no shared helper to import — `placeBuildableAt` is privately duplicated across 22 specs with drifting signatures; do NOT refactor those 22, that is out of scope);
   - carry over the **in-page rAF sampling block from `scripts/probe-f1148-1-trajectory.mjs:55-80` essentially unchanged**, emitting `simTime`, `pathDistance`, `xMin`, `xMax`, `sampleCount`;
   - write its raw per-run numbers to `artifacts/f1148-1-trajectory/<arm>-run<N>.json`.
2. **⛔ THE SPEC MUST BE OPT-IN AND MUST NOT JOIN THE DEFAULT SUITE.** `npm test` runs `playwright test` with no filter, so a new spec file silently becomes part of every future gate battery. This one is a **measurement rig**, not a guard: it is slow, it runs n≥3, and it deliberately measures a **known-red** behaviour — landing it as an always-on test would red the board for every fire afterwards. Gate it at the top: `test.skip(!process.env.GR_F1148_PROBE, 'measurement rig — set GR_F1148_PROBE=1 to run')`, and **prove it**: paste `npx playwright test --list | grep -c f1148` and a full-suite collection run showing the spec **skipped**, not executed, when the variable is unset.
3. **Prove the rig places before you trust any number.** First deliverable run: confirm **all five palisades placed**. ⛔ **A probe that executes nothing reports zero and looks like a clean result.** Every run must carry its **positive control**: `sampleCount` and `pathDistance` both non-zero and plausible (the predecessor's distances were ~18–19 world units over hundreds of frames). **A run reporting zero samples, zero distance, or a placement failure is VOID — say so and re-run; do not average it in.** If placement fails ≥2 times through the test runner, **STOP and report** — that would contradict s1150's 4/4 measurement and is a finding in its own right.
   ⛔ **Do NOT add a `confirmBuild` retry loop.** It papers over an unexplained divergence, and a measurement's only value is that it is trustworthy.
4. **Run THREE arms, n≥3 each, same box, back to back.**
   - **Arm A — today's main, unmutated.**
   - **Arm B — today's main, `const lateralOffset = 0`** at `src/entities/Enemy.ts:704` (behaviourally = the recommended cure). **THROWAWAY — see scope 6.**
   - **Arm C — parent revision `4da134a9`, unmutated.** The known-good baseline that produced `7.997` s.
   ⚠️ **n=1 is what produced the finding you are correcting — do not repeat it.** Report **every individual run** plus median and spread per arm. Overlapping spreads are themselves the answer to scope 5 and must be reported as such, never hidden behind a mean.
   ⚠️ **Neither arm may be a contaminated control:** run all three the same way on a quiet box, nothing else building or testing. **The load measurement must exclude the measurer** (F-1150-3: `scripts/stream-showcase-queue.test.mjs:58` false-redded a whole battery under a competing scratch server). If you cannot get a quiet box, say so — a contaminated control can AGREE with a contaminated treatment and prove nothing.
5. **Arm C must not disturb main, and the spec must travel to it.** Build `4da134a9` in a **detached worktree** (`git worktree add --detach <path> 4da134a9`) with its own `npm install`. ⚠️ **The new spec does not exist at that revision** — copy it in as an untracked file and run playwright from inside that worktree. ⚠️ **Use a scratch port, not the default** — lane worktrees share port `5188`, and a second server on it will either fail or, worse, silently measure the **wrong tree** (`5199`/`5231`/`5234` are the house scratch ports). **State the port you used**; a trajectory measured against a foreign tree is the most expensive way to be wrong here. Remove the worktree when done.
6. **⛔ THE MUTATION IS A THROWAWAY AND MUST NOT SHIP.** Arm B edits `src/entities/Enemy.ts`. Take a byte backup first, restore after, and **verify `git status --porcelain -- src/` is EMPTY before you commit anything.** Paste that verification. A `src/` diff in this slice is a firewall violation and the drain will reject it.
7. **Classify the split — this is the deliverable.** Compare arm B against A and C on **route shape**, not just duration:
   - **B ≈ C** (sim time back to ~`7.997` s *and* a non-negative X floor): the lateral bias is the **whole** regression; the residual `20.999`/`20.667` failures are **polling amplification** — a harness question, not a pathing one.
   - **B between A and C**: a **real remainder** stacked after `3c749607`. Say so, and name where if you can — but see scope 8: identify, do not fix.
   - **B ≈ A**: the mutation control's pass-rate improvement was distribution noise and the bisect's n=1 pair overstated the commit's share. **This would be the most important finding of the three.**
   The X floor is the sharpest discriminator the predecessor found (parent `0.000` vs child `-0.628`, the S-bend) — **report it for all three arms.**
8. **⛔ DIAGNOSE, DO NOT REPAIR — AND DO NOT WIDEN THE BUDGET.**
   - **Do not fix the regression.** The cure is **OWNER-GATED** (adjacent to E① pathing, F-1131-5). Your report's *recommendation* is welcome; your *repair* is not.
   - **Do not touch `e2e/m2-04-gold-stealing.spec.ts`.** In particular **do not relax `expect(timeAlive - spawnedAt).toBeLessThan(20)` at `:226`** — verified at source by s1151; attempt 1's master called it `:227`, which is in fact the `expect(errors.consoleErrors)` line, so trust `:226` and re-read it yourself before you go near it. That assertion is the only pathing-efficiency guard on this behaviour, and F-1148-1 exists *because* it was left unwidened. A green there obtained by editing that file is the **REJECT** condition for this task.
   - If your measurement **contradicts** F-1148-1, the bisect, or s1150's rig finding, **say so plainly and show the numbers.** You are licensed to contradict all three. A well-evidenced "the predecessor was wrong" is the most valuable outcome this task can produce; **a STOP with reasons is a SUCCESS, not a failure** — attempt 1 proved that and it is why this task could be scoped at all.

## FIREWALL

**TOUCH-ONLY:** `e2e/f1148-1-trajectory-probe.spec.ts` (new) · `artifacts/f1148-1-trajectory-split-v2.md` (new) · `artifacts/f1148-1-trajectory/**` (new raw runs) · `src/entities/Enemy.ts` **temporarily for arm B only, restored to byte-identical before any commit**.

**NO:** `e2e/m2-04-gold-stealing.spec.ts` (read-only, and never widen `:226-227`) · any other `e2e/**` · any permanent `src/**` change · `scripts/probe-f1148-1-trajectory.mjs` (attempt 1's retained artifact — leave it, RETENTION LAW) · `STATUS.md` · `tasks/**` · `reviews/**` · any config that would enrol the new spec in the default suite · the 22 specs that duplicate `placeBuildableAt`.

## SELF-CHECK (run these; paste the output)

1. `npx tsc --noEmit` → rc=0.
2. `npm run build` → rc=0.
3. `npx playwright test --list | grep -c f1148` **and** the same collection with `GR_F1148_PROBE` unset showing the spec **skipped** — scope 2's proof it did not join the default suite.
4. `GR_F1148_PROBE=1 npx playwright test e2e/f1148-1-trajectory-probe.spec.ts --project=desktop-chrome --workers=1 --reporter=list` → the arm-A runs, with sample counts.
5. `node scripts/run-guards.mjs` → **8/8** (it is 8/8 on main as of s1151 `3fa3b85f`; if you see 7/8, check whether you are running from the lane worktree — `test:task-guards` now SKIPs there by design, F-1151-1).
6. `git status --porcelain -- src/` → **EMPTY** (scope 6).
7. `git status --short` → only the TOUCH-ONLY new files.
8. `npx playwright test e2e/m2-04-gold-stealing.spec.ts --project=desktop-chrome --workers=1 --reporter=list` on the **restored, unmutated** tree → expected **RED at `:226`**; paste it as confirmation you left the guard intact. **A green here is a red flag, not a success** — it would mean the mutation survived or the spec was edited.

## SEQUENCING / LAWS

- Path-scoped `git add` only — never `-A` at repo root. Commit prefix `chore:`.
- One concern per commit.
- The runner auto-commits on this lane; do not touch `STATUS.md`, `tasks/**` or `reviews/**`.
- If you are blocked twice on the same obstacle, **STOP and report** rather than trying a third variation of the same idea (§7.5). Attempt 1 did exactly this and was right to.

**READY-FOR-GATES** when scopes 1–8 are done. Report: the rig's placement result (all five palisades?) and the sample-count positive control for every run, the full three-arm table (**every run, not just medians**), the X-floor shape comparison, the scope-7 classification and what it implies for how the eventual repair must be scoped, the scope-2 not-in-default-suite proof, the empty-`src/`-diff proof, arm C's port and worktree handling, and anything you are reporting rather than fixing.
