# Task gazette-welcome-drift-observation-frame-v3: move the newsie drift bound inside the page — hygiene with a proof, because the red is unobservable where you run (LANE SLOT)
FIRE-AUTHORED s1293 (attended review welcome)
You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b` (branch `lane/m4`, commit prefix `test:`).
CODEX: model=gpt-5.6-sol effort=high

> ⚠️ **THIS IS ATTEMPT 3, AND THE PREMISE HAS CHANGED IN THE STRONGEST WAY A PREMISE CAN CHANGE (CLAUDE.md §7.5): THE GATE THAT STOPPED THE LAST TWO ATTEMPTS HAS BEEN REMOVED, BECAUSE IT IS NOW PROVEN UNPASSABLE IN YOUR ENVIRONMENT.**
>
> v1 (s1263) stopped at `PREMISE-NOT-REPRODUCED` — its load arm (14 CPU spinners at `--workers=1`) was the wrong experiment. v2 (s1264) re-aimed the arm at **concurrent browsers** and stopped at the *same* gate for a completely different and much more interesting reason: **the arm is RED in the fire shell and GREEN in yours.** You ran it. You reported `Running 6 tests using 6 workers` and got **6/6 GREEN in 13.8 s**. The same command, same worktree, minutes later from the fire shell: **6/6 RED at 55–60 s per test.**
>
> That is not a flake and it is not your box being wrong. It has since been measured three independent ways — see §Why. **The consequence for you is simple and total: no re-aiming of a reproduction arm can ever make this defect visible from `worktrees/lane-b`, so this master does not ask you to reproduce it.**
>
> ⛔ **THEREFORE: there is NO "reproduce the red first" gate in this task. Do not go looking for one, do not re-run v2's scope 1, and do not STOP because the assertion is green — green is the expected and correct reading in your environment.** If you find yourself about to report `PREMISE-NOT-REPRODUCED`, you have re-derived v2 and this paragraph is the answer.
>
> ⚠️ **But a cure with no observable defect risks shipping a vacuous assertion, and that is a real hazard, not a hypothetical one.** The reproduce-first gate existed to stop exactly that. It has been **replaced, not deleted** — by scope 1 (prove the arithmetic at source) and scope 4 (**prove the new assertion can still go RED, by mutation**). Those two together do the epistemic job the old gate did, and unlike the old gate they are executable where you run.

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)

The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/m4 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

> ℹ️ Authoring-time safety measurement (s1293 — **verify it yourself anyway, per VERIFY-DON'T-INHERIT**). At the queue moment: `git rev-list --count main..lane/m4` = **0**, `lane/m4..main` = **10**, and `git diff --name-status --diff-filter=A main..lane/m4` was **EMPTY** (no path exists on the lane that main lacks). `node scripts/lane-freeze-classify.mjs lane/m4` was also run. **The lane holds nothing — it is a clean fast-forward case, the safest possible refill.** ⚠️ The behind-count will have grown; that is cosmetic. The ahead-count is the load-bearing number: **if your own re-measurement finds it non-zero, or finds any `A` line, STOP** — do not reason it away.

## READ FIRST (paths, in this order)

1. `e2e/gazette-welcome.spec.ts` — the subject. Read the whole test **`the Gazette welcome fires once, walks skippably, and retriggers through the newsie`**. The block you are replacing is the `if (newsieBefore) { … }` body: `expect.poll(welcomeFollowsPlayer).toBe(false)` → sample the newsie → `expect(Math.hypot(…)).toBeLessThan(1)`. **Note that `newsieBefore` is sampled BEFORE the `click`.** That ordering is the whole defect; see §Why. ⚠️ **Locate these by CONTENT, not by line number** — v2 cited `:81-89` and the file has moved since; cite the coordinates you actually find.
2. `src/town/TownScene.ts` — `TownActorRuntime.update()`, the line `const ratio = remaining > 0 ? Math.min(1, (delta * 7) / remaining) : 1;` (**verified at `:2613` by s1293**). This is the newsie's walk-home speed and it is the number that makes the current bound meaningless. **You will not modify this file.**
3. `src/core/Loop.ts` — `MAX_PRESENTATION_DELTA_SECONDS = 0.05` (**verified `:27`**) and `this.frame.presentationDeltaSeconds = Math.min(delta, MAX_PRESENTATION_DELTA_SECONDS)` (**verified `:111`**) feeding `this.update(this.frame.presentationDeltaSeconds)` (**verified `:116`**). `TownScene.ts:306` constructs its `Loop` with **no options** (verified: `new Loop((delta) => this.update(delta), () => this.render())`), so the town runs a variable timestep with delta clamped at **0.05 s**. This clamp is what makes the fix a *guarantee* rather than a hope. **You will not modify this file.**
4. `src/town/TownScene.ts` `TownDiagnostics` type — confirm for yourself that **`elapsed: number`** (`:155`) and **`welcomeFollowsPlayer: boolean`** (`:162`) are already public, and published (`:2203` / `:2217`). **You need no src change at all in this task.**
5. `tasks/lane-b-gazette-welcome-drift-observation-frame-v2.md` — **the predecessor. Read its §Why table.** Its measurement is sound and is carried forward here; only its scope 1 and scope 4 are retired. **Read-only.**
6. `tasks/BACKLOG.md` — **F-1264-3**, **F-1267-1**, **F-1270-1**, **F-1270-3**, **F-1293-1**. **You will not edit this file.**

## Why

The assertion claims: *when the welcome's last beat is dismissed, the newsie is released and does not get yanked away.* It measures that as the distance between a sample taken **before** `click('town-welcome-next')` and a sample taken **after** the click round-trip and a state poll have both returned.

**Everything inside that span is round-trip latency, not behaviour.** The newsie walks home at `delta * 7` per frame = **7 world units per second**. So the `<1` bound is, in plain arithmetic, an assertion that **the observation window closed in under ~143 ms**. It is a latency test wearing a behaviour test's clothes — and the newsie is *supposed* to be moving during it.

**This defect is established by READING, and needs no red to be true.** Two facts, both checkable in thirty seconds and both re-verified at source by s1293: the two samples straddle a `click` and an `expect.poll`, and the subject moves at 7 u/s. A bound of `1` on that span is a bound on latency. **That is the entire argument, and it does not depend on any measurement.**

### Why you will not be shown a failing test (the three measurements)

| fire | measurement | reading |
|---|---|---|
| s1264 | same command, same worktree, both shells | **lane shell 6 workers: 6/6 GREEN, 13.8 s total.** Fire shell: **6/6 RED, 55–60 s per test.** |
| s1267 (F-1267-1) | crossed shell × working directory, the two having moved together for five fires | fire shell **in `worktrees/lane-b`**: 21 drift reds / 24 · repo root: 22 / 24 · **lane shell, same directory: 0 / 24** |
| s1270 (F-1270-1) | interleaved worker-count arms **in the fire shell**, explicit flags | `--workers=1` → **0 drift reds / 18** · 6 workers → **17 / 18** |

Read together: **the RED is a property of the fire shell's per-job CPU ceiling** (F-1269-1), which starves each chromium until timing-sensitive assertions fail. The lane shell has no such ceiling and runs 6 workers ~3.5× faster. **So the red is the instrument — but the DEFECT is not**, because the defect is the arithmetic above, and arithmetic does not care which shell reads it.

⚠️ **The distinction this master is built on, stated once so it cannot be lost:** *"the red is an artifact" does not imply "the assertion is fine."* It implies only that **this box cannot be the thing that proves it.* A bad assertion that currently passes is still a bad assertion — it will red the moment concurrency conditions shift, and it has already cost five fires. **Closing this thread as "just a flake" would leave a latency test in the suite.** That is the trap; scopes 1 and 4 are how you avoid it.

**Owner-relevant framing (Mistake #10):** nothing a player sees changes. No src file is touched. This is the factory retiring a question permanently rather than re-measuring it every quiet fire.

## Scope (numbered; each independently checkable)

1. **PROVE THE ARITHMETIC AT SOURCE BEFORE YOU EDIT — this replaces v2's reproduce-first gate and is mandatory.** No test run is required. Read and quote, `file:line`, each of the four facts the cure rests on, **as they exist in your tree, not as this master states them**:
   - the newsie's per-frame step `min(remaining, delta * 7)`;
   - `MAX_PRESENTATION_DELTA_SECONDS = 0.05`;
   - the clamp `Math.min(delta, MAX_PRESENTATION_DELTA_SECONDS)` and the `update()` call it feeds;
   - the `TownScene` `Loop` construction taking **no options** (this is what selects the variable-timestep path — if it took a fixed `stepSeconds`, the clamp would not apply and the guarantee below would be VOID).

   Then state the bound in your own arithmetic: window `0.08 + 0.05 = 0.13 s` of simulation, peak `≤ 7 × 0.13 = 0.91 < 1`. **⛔ STOP-AND-REPORT if any of the four differs from the above** — particularly if the `Loop` is constructed with options, or the `7` or the `0.05` has moved. That is a real changed premise and the drain will re-aim. This is the only STOP in this task that concerns the cure's validity.
2. **Move the observation window inside the page.** In `e2e/gazette-welcome.spec.ts`, replace the `newsieBefore` sample and the `if (newsieBefore) { … }` body with an in-page sampler **installed before the `click`**, so the window opens where the behaviour opens instead of after a round-trip. Required shape:
   - Before the click, one `page.evaluate` installs a `requestAnimationFrame` sampler on `window` that each frame reads `__GR_TOWN_DIAGNOSTICS__`'s `welcomeFollowsPlayer`, `elapsed`, and the `newsie` actor position.
   - The sampler ignores frames while `welcomeFollowsPlayer` is `true`. On the **first frame where it reads `false`** it latches an anchor `{ x, z, elapsed }`.
   - After the anchor, each frame updates `peak = max(peak, hypot(pos - anchor))`, and it stops — setting a `done` flag — on the first frame where **`elapsed - anchor.elapsed >= 0.08`**.
   - The test then clicks, `await page.waitForFunction(() => …done)`, reads the record back, and asserts **(a)** an anchor was latched (the release really happened) and **(b)** `peak` is **`toBeLessThan(1)`** — the same bound as today, now measured against the right frame of reference.
   - ⚠️ **State plainly in your report that this changes the ANCHOR**, from "position before the click" to "position at the frame the release is observed in-page". That is deliberate and is the fix; the two anchors differ by exactly the round-trip this task exists to remove.
   - **Carry the arithmetic as a comment on the `0.08`**, because it is load-bearing and a future speed change must be visibly coupled to it. ⛔ **Do not change the `< 1` bound and do not change the `7`.**
   - ⛔ **`waitForTimeout` must not appear in the replaced block**, and **no `Date.now()`/`performance.now()` wall-clock term may enter the bound** — the window is measured in the town's own `elapsed`, which is what makes it load-invariant. A reviewer will grep for both.
   - ⚠️ **Assert `(a)` deliberately and do not let it be vacuous:** if the sampler never latches an anchor, `peak` stays `0` and `(b)` passes trivially. `(a)` is what stops that, so it must fail loudly — not `if (anchor) expect(...)`.
3. **No `src/` edit is in scope.** `elapsed` and `welcomeFollowsPlayer` are already on the public `TownDiagnostics` type and already published. If you believe you need a src change, **STOP and report why** — do not add a field.
4. **PROVE THE NEW ASSERTION CAN STILL GO RED — MUTATION, MANDATORY, AND THE REAL ACCEPTANCE CRITERION.** A green test in an environment that cannot show you the red proves nothing on its own; this is what makes the difference. Run **two mutation arms**, restoring **byte-identically** after each (report the sha256 or blob hash before and after, both sides, per the F-1273-1 pattern):
   - **arm A — the subject moves:** temporarily change the newsie's `7` in `src/town/TownScene.ts` to a value large enough to breach the bound within the window (`70` gives a predicted peak ≈ 9.1). The new assertion **must go RED**, and the `Received:` value **must be close to your prediction** — report predicted vs observed. This proves the assertion is still coupled to the thing it claims to measure. ⚠️ **This is the one place you may touch a `src/` file; it is a scratch mutation and MUST be reverted. It is not a cure and must never be committed.**
   - **arm B — the anchor never latches:** temporarily make the sampler's latch condition unreachable. Assertion **(a)** must go RED. This proves the vacuity guard in scope 2 is real rather than decorative.
   - **Both arms must red the assertion you predict AND leave the other one green** — if one mutation reds both, say so; that means the two assertions are not independently load-bearing and the drain wants to know.
   - Then, on the restored tree, run the subject **as it will actually be gated**: `--project=desktop-chrome --project=mobile-chrome --repeat-each=3`, **and report the reporter's `Running N tests using M workers` line verbatim.** ⚠️ **Report `M`; do not tune it.** You are not running a worker-count experiment — F-1270-3 documents that a bare arm no longer means what it used to, and that trap is not yours to walk into. Green here is expected and is a sanity check, not the acceptance criterion. **The mutation arms are the acceptance criterion.**
5. **Report, do not fix, anything adjacent.** Any other place in `e2e/` that samples a moving world object across a CDP round-trip and asserts a distance bound on it is the same defect class. **List them `file:line` in your report and touch none of them.** That list is wanted — it is the next master, not this one.

## Firewall

**TOUCH-ONLY:** `e2e/gazette-welcome.spec.ts`.

**NO:** every `src/**` file as a *cure* — including `src/town/TownScene.ts`, `src/town/TownWelcome.ts`, `src/core/Loop.ts` (the walk speed, the delta clamp, and the welcome's behaviour are **subjects of measurement, never of cure**; scope 4 arm A's temporary mutation is the sole exception and **must be reverted byte-identically and never committed**) · any other `e2e/*.spec.ts` · `logs/session-scratch/s1263/**` and `logs/session-scratch/s1264/**` (read-only evidence — do not regenerate or "tidy" it) · `tasks/BACKLOG.md` · `tasks/goals.json` · `STATUS.md` · `scripts/**` · `package.json` · any screenshot or artifact regeneration.

## Self-check before you report

- `npx tsc --noEmit` clean · `npm run build` green (report the seconds).
- **`git status --short` at the very end must show `e2e/gazette-welcome.spec.ts` and nothing else** — this is your proof that scope 4's mutations were reverted. Paste it.
- Scope 1's four quoted facts with the coordinates **you** found.
- Scope 4's two mutation arms: predicted vs observed `Received:`, which assertion redded in each, the independence check, and the before/after hashes proving byte-identical restoration.
- Adjacent suites unmodified-green: derive them by grep, not from memory — at minimum every spec that reads `__GR_TOWN_DIAGNOSTICS__` and asserts on the welcome or the newsie (`grep -rln "town-welcome\|newsie" e2e/`). Report the list you derived and each result. Any red must be fingerprint-matched to a known red in `logs/suite-red-inventory.md` **with the matching row quoted**, or it blocks.
- `node scripts/run-guards.mjs --only test:node-guards` — report `N/N`, **derived**, not inherited.
- `npm run test:citations` — **run it as your LAST act, after every edit** (F-1262-2: a fire reported this guard passing for a file it wrote afterwards).
- Zero console/page errors in a plain boot (no `?debug`).
- `grep -n "waitForTimeout" e2e/gazette-welcome.spec.ts` — report every remaining hit and say why each is legitimate; the scope 2 block must not be among them.
- Commit path-scoped with the `test:` prefix. **Do not `git add -A`.**

READY-FOR-GATES + report: scope 1's four facts as you found them · the before/after of the replaced block · the comment you wrote on the `0.08` · the anchor-change statement from scope 2 · **scope 4's two mutation arms with predicted-vs-observed and the restoration hashes** · the worker count you observed (reported, not tuned) · the scope 5 adjacent-shape list · and any place this master told you something about the tree that turned out to be false.
