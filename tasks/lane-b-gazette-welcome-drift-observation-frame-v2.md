# Task gazette-welcome-drift-observation-frame-v2: move the newsie drift bound inside the page, so it measures the newsie instead of the round-trip (LANE SLOT)
FIRE-AUTHORED s1264 (attended review welcome)
You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b` (branch `lane/m4`, commit prefix `test:`).
CODEX: model=gpt-5.6-sol effort=high

> ⚠️ **THIS IS ATTEMPT 2 OF A MASTER THAT STOPPED AT ITS OWN GATE, AND THE PREMISE HAS CHANGED (CLAUDE.md §7.5).** s1263 authored the v1 of this task; it ran and correctly STOPPED at `PREMISE-NOT-REPRODUCED` because **its scope-1 load arm was the wrong experiment** — 14 CPU spinners at `--workers=1`, which does not reproduce the defect. s1264 found and proved the arm that does: **concurrent browser instances**. The cure below is unchanged from v1 (it was never the problem); **only the reproduction arm changed.** Everything else in this master is v1's, which was good work.
>
> ⛔ **Do not re-open "is it a flake". It is not a flake, and this is now measured 18/18 at the subject.** It is an instrument pointed at the wrong frame of reference, and the fix is mechanical.

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)

The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/m4 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

> ℹ️ Authoring-time safety measurement (s1264 — **verify it yourself anyway, per VERIFY-DON'T-INHERIT**). `git rev-list --count main..lane/m4` = **1**, `lane/m4..main` = **5**. The single ahead commit is **`e6560b9a` `runner(lane-b): lane-b-gazette-welcome-drift-observation-frame.md`** — it contains **only** `logs/session-scratch/s1263/**` (the evidence directory s1263 hand-supplied mid-run, F-1263-3), and **no `src/` or `e2e/` file at all**. Two independent checks confirmed the dupe at authoring: **`git diff --name-status --diff-filter=A main..lane/m4` was EMPTY** (nothing exists on the lane that is absent from main), and **`git diff main lane/m4 -- logs/session-scratch/s1263/` showed only DELETIONS** (4 files main has that the lane lacks — main-moved-only). **SAFE DUPE.** ⚠️ If your own re-measurement finds any `A` line, or any two-dot diff touching `e2e/` or `src/`, treat the branch as holding undrained work and **STOP** — do not reason it away.

## READ FIRST (paths, in this order)

1. `logs/session-scratch/s1264/RESULTS.md` — **the measurement this master stands on.** Read it before scope 1 so you know exactly what you are trying to reproduce, and which of s1263's claims it retired. **Read-only.**
2. `e2e/gazette-welcome.spec.ts` — the subject. Read the whole test **`the Gazette welcome fires once, walks skippably, and retriggers through the newsie`** (starts `:45`). The block you are replacing is the `if (newsieBefore) { … }` body at **`:85-89`**: `expect.poll(welcomeFollowsPlayer).toBe(false)` → sample the newsie → `expect(Math.hypot(…)).toBeLessThan(1)`. Note that `newsieBefore` is sampled at **`:81-83`, BEFORE the `click` at `:84`**. That ordering is the whole defect; see §Why.
3. `src/town/TownScene.ts:2597-2625` — `TownActorRuntime.update()`. Specifically **`:2613`**: `const ratio = remaining > 0 ? Math.min(1, (delta * 7) / remaining) : 1;`. This is the newsie's walk-home speed and it is the number that makes the current bound meaningless. **You will not modify this file.**
4. `src/core/Loop.ts:27` and `:108-119` — `MAX_PRESENTATION_DELTA_SECONDS = 0.05`, and the `stepSeconds <= 0` branch that calls `this.update(this.frame.presentationDeltaSeconds)`. `TownScene.ts:306` constructs its `Loop` **with no options**, so the town runs a variable timestep with delta clamped at **0.05 s**. This clamp is what makes the fix below a *guarantee* rather than a hope. **You will not modify this file.**
5. `src/town/TownScene.ts:153` (`TownDiagnostics` type) — confirm for yourself that **`elapsed: number` (`:155`)** and **`welcomeFollowsPlayer: boolean` (`:162`)** are already public, and published at `:2203` / `:2217`. **You need no src change at all in this task.**
6. `tasks/BACKLOG.md` — **F-1264-1**, **F-1263-2**, **F-1263-4**. **You will not edit this file.**

## Why

The assertion claims: *when the welcome's last beat is dismissed, the newsie is released and does not get yanked away.* It measures that as the distance between a sample taken **before** `click('town-welcome-next')` and a sample taken **after** the click round-trip and a state poll have both returned.

**Everything inside that span is round-trip latency, not behaviour.** The newsie walks home at `delta * 7` per frame (`TownScene.ts:2613`) = **7 world units per second**. So the `<1` bound is, in plain arithmetic, an assertion that **the observation window closed in under ~143 ms**. It is a latency test wearing a behaviour test's clothes — and the newsie is *supposed* to be moving during it.

s1264 measured this on the **unmodified shipped spec** (no probe, no proxy) on main, three concurrent arms and one serial control:

| arm | concurrency | loadavg at start | drift assertion (`:88`) |
|---|---|---|---|
| concurrent, whole file | default workers | **2.93** | **6 / 6 RED** |
| concurrent, whole file (repeat) | default workers | 19.51 | **6 / 6 RED** |
| concurrent, drift test only (`-g`) | **6 workers** | **2.13** | **6 / 6 RED** |
| **serial control** (`--workers=1`) | 1 | **33.65** | **0 / 6 red** |

Observed displacements: **2.81 – 4.67** against a bound of **1** — windows of roughly **460–670 ms**.

⚠️ **THE CONTROL IS THE POINT: the GREEN arm was the most heavily loaded run of the session, at 11× the load of a RED arm.** Machine load is not the variable. **Concurrent browser instances is.** This is why every previous attempt that reasoned about *what the test waits for* — sleep, poll, or state — moved a minority term and left the defect standing. **No choice of what to wait for can fix this, because the newsie starts walking home the instant the click lands in the page, and the test cannot observe anything until the round-trip returns.** The window has to move inside the page. That is the entire task.

**Owner-relevant framing (Mistake #10):** nothing a player sees changes. No src file is touched. This is the factory retiring a question permanently rather than re-measuring it every quiet fire.

## Scope (numbered; each independently checkable)

1. **REPRODUCE THE DEFECT BEFORE YOU CURE IT — MANDATORY GATE, NO EDITS BEFORE IT PASSES.** On a **clean, unmodified** tree, run the subject two ways, recording `uptime` loadavg before and after each:
   - **arm CONCURRENT (must be RED):**
     `npx playwright test e2e/gazette-welcome.spec.ts --project=desktop-chrome --project=mobile-chrome --repeat-each=3 -g "fires once" --reporter=list`
     Report the reporter's **"Running N tests using M workers"** line verbatim — `M` is the variable under test and it must be **> 1**.
   - **arm SERIAL (must be GREEN on `:88`):** the same command plus `--workers=1`.

   Report both pass/fail counts, both loadavg pairs, and **the `Received:` value of every red**. **⛔ STOP-AND-REPORT conditions, all of which are SUCCESSES, not failures:**
   - **(i) If arm CONCURRENT comes back green on `:88`**, the defect did not reproduce on your box. **STOP.** Report `PREMISE-NOT-REPRODUCED` with both tables, your core count, and the reported worker count. Do not cure what you cannot see fail — that mistake has been made twice on this exact assertion (F-1215-2, and v1 of this master).
   - **(ii) If arm SERIAL comes back red on `:88`**, the defect is larger than this master describes. **STOP** and report it; the drain will re-aim.
   - **(iii) If `M` is reported as 1** in the concurrent arm, your box resolved a different default. Re-run it with an explicit `--workers=6` and say so. If it is still green at `M=6`, that is case (i).
2. **Move the observation window inside the page.** In `e2e/gazette-welcome.spec.ts`, replace the `newsieBefore` sample (`:81-83`) and the `if (newsieBefore) { … }` body (`:85-89`) with an in-page sampler **installed before the `click` at `:84`**, so the window opens where the behaviour opens instead of after a round-trip. Required shape:
   - Before the click, one `page.evaluate` installs a `requestAnimationFrame` sampler on `window` that each frame reads `__GR_TOWN_DIAGNOSTICS__`'s `welcomeFollowsPlayer`, `elapsed`, and the `newsie` actor position.
   - The sampler ignores frames while `welcomeFollowsPlayer` is `true`. On the **first frame where it reads `false`** it latches an anchor `{ x, z, elapsed }`.
   - After the anchor, each frame updates `peak = max(peak, hypot(pos - anchor))`, and it stops — setting a `done` flag — on the first frame where **`elapsed - anchor.elapsed >= 0.08`**.
   - The test then clicks, `await page.waitForFunction(() => …done)`, reads the record back, and asserts **(a)** an anchor was latched (the release really happened) and **(b)** `peak` is **`toBeLessThan(1)`** — the same bound as today, now measured against the right frame of reference.
   - ⚠️ **State plainly in your report that this changes the ANCHOR**, from "position before the click" to "position at the frame the release is observed in-page". That is deliberate and is the fix; the two anchors differ by exactly the round-trip this task exists to remove.
   - **Carry the arithmetic as a comment on the `0.08`**, because it is load-bearing and a future speed change must be visibly coupled to it: the newsie's step is `min(remaining, delta * 7)` (`TownScene.ts:2613`) and `delta` is clamped to `MAX_PRESENTATION_DELTA_SECONDS = 0.05` (`Loop.ts:27`), so the sampled window is at most `0.08 + 0.05 = 0.13 s` of simulation and the peak is at most `7 × 0.13 = 0.91 < 1` **on any machine at any load**. ⛔ **Do not change the `< 1` bound and do not change the `7`.**
   - ⛔ **`waitForTimeout` must not appear in the replaced block**, and **no `Date.now()`/`performance.now()` wall-clock term may enter the bound** — the window is measured in the town's own `elapsed`, which is what makes it load-invariant. A reviewer will grep for both.
3. **No `src/` edit is in scope.** `elapsed` and `welcomeFollowsPlayer` are already on the public `TownDiagnostics` type (`TownScene.ts:155`, `:162`) and already published (`:2203`, `:2217`). If you believe you need a src change, **STOP and report why** — do not add a field.
4. **Prove load-invariance, not just green.** Re-run **both arms of scope 1** against your cured tree, same commands, same loadavgs recorded, and additionally run the **whole file** concurrently (drop the `-g`) so the sibling tests are exercised too. Report the arms as a table beside scope 1's. **The acceptance criterion is exact: the arm that was RED before your change must be GREEN after it, on the same box, at the same worker count.** A green serial arm alone proves nothing here and will be rejected at the drain.
5. **Report, do not fix, anything adjacent.** Any other place in `e2e/` that samples a moving world object across a CDP round-trip and asserts a distance bound on it is the same defect class. **List them `file:line` in your report and touch none of them.** That list is wanted — it is the next master, not this one.

## Firewall

**TOUCH-ONLY:** `e2e/gazette-welcome.spec.ts`.

**NO:** every `src/**` file — including `src/town/TownScene.ts`, `src/town/TownWelcome.ts`, `src/core/Loop.ts` (the walk speed, the delta clamp, and the welcome's behaviour are all **subjects of measurement, never of edit** in this task) · any other `e2e/*.spec.ts` · `logs/session-scratch/s1263/**` and `logs/session-scratch/s1264/**` (read-only evidence — do not regenerate or "tidy" it) · `tasks/BACKLOG.md` · `tasks/goals.json` · `STATUS.md` · `scripts/**` · `package.json` · any screenshot or artifact regeneration.

## Self-check before you report

- `npx tsc --noEmit` clean · `npm run build` green (report the seconds).
- Scope 1's two arms and scope 4's three arms, as one table, with every loadavg pair and every reported worker count. **Derive the numbers; do not restate this master's.**
- Adjacent suites unmodified-green: derive them by grep, not from memory — at minimum every spec that reads `__GR_TOWN_DIAGNOSTICS__` and asserts on the welcome or the newsie (`grep -rln "town-welcome\|newsie" e2e/`). Report the list you derived and each result. Any red must be fingerprint-matched to a known red in `logs/suite-red-inventory.md` **with the matching row quoted**, or it blocks.
- `node scripts/run-guards.mjs --only test:node-guards` — report `N/N`, **derived**, not inherited.
- `npm run test:citations` — **run it as your LAST act, after every edit** (F-1262-2: a fire reported this guard passing for a file it wrote afterwards).
- Zero console/page errors in a plain boot (no `?debug`).
- `grep -n "waitForTimeout" e2e/gazette-welcome.spec.ts` — report every remaining hit and say why each is legitimate; the scope 2 block must not be among them.
- Commit path-scoped with the `test:` prefix. **Do not `git add -A`.**

READY-FOR-GATES + report: scope 1's two arms with loadavgs, worker counts, every `Received:` value, and the STOP answer in writing · the before/after of the replaced block · the comment you wrote on the `0.08` · the anchor-change statement from scope 2 · scope 4's three arms beside scope 1's · the scope 5 adjacent-shape list · and any place this master told you something about the tree that turned out to be false.
