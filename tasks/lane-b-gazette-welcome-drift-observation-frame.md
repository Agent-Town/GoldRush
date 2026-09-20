# Task gazette-welcome-drift-observation-frame: move the newsie drift bound inside the page, so it measures the newsie instead of the round-trip (LANE SLOT)
FIRE-AUTHORED s1263 (attended review welcome)
You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b` (branch `lane/m4`, commit prefix `test:`).
CODEX: model=gpt-5.6-sol effort=high

> ⚠️ **THIS ASSERTION HAS NOW CONSUMED FIVE FIRES. READ WHY THE PREVIOUS FOUR DID NOT FINISH IT.** s1214 discriminated it, s1215 ran a cure that stopped `PREMISE-NOT-REPRODUCED`, s1216 wrote its stopped note, s1261 retired the leaf as `superseded` on a 0/48 measurement, and s1262 merged a state-probe cure (`8f3974a5`) **whose own spec was red at merge time**. Every one of those fires argued about *what the test waits for*. **None of them measured what the number actually tracks.** s1263 did, and the answer is below. ⛔ **Do not re-open "is it a flake". It is not a flake. It is an instrument pointed at the wrong frame of reference, and the fix is mechanical.**

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)

The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/m4 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

> ℹ️ Authoring-time safety measurement (s1263 — **verify it yourself anyway, per VERIFY-DON'T-INHERIT**). `git rev-list --count main..lane/m4` = **1**, `lane/m4..main` = **8**. The single ahead commit is **`103f07cc` `test: observe Gazette welcome release state`**, drained to main by s1262 as **`8f3974a5`** via a tip-graft — which is exactly why the branch still reads 1 ahead. Two independent checks confirmed the dupe at authoring: **`git diff --name-status --diff-filter=A main..lane/m4` was EMPTY**, and the stronger content check — **`git diff main lane/m4 -- <each file in 103f07cc>` was EMPTY for BOTH files** (`e2e/gazette-welcome.spec.ts`, `src/town/TownScene.ts`). Identical content on both sides = **SAFE DUPE**. ⚠️ If your own re-measurement finds any `A` line, or any non-empty two-dot diff on those files, treat the branch as holding undrained work and **STOP** — do not reason it away.

## READ FIRST (paths, in this order)

1. `e2e/gazette-welcome.spec.ts` — the subject. Read the whole test **`the Gazette welcome fires once, walks skippably, and retriggers through the newsie`** (starts `:45`). The block you are replacing is the `if (newsieBefore) { … }` body at **`:85-89`**: `expect.poll(welcomeFollowsPlayer).toBe(false)` → sample the newsie → `expect(Math.hypot(…)).toBeLessThan(1)`. Note that `newsieBefore` is sampled at **`:81-83`, BEFORE the `click` at `:84`**. That ordering is the whole defect; see §Why.
2. `src/town/TownScene.ts:2600-2625` — `TownActorRuntime.update()`. Specifically **`:2613`**: `const ratio = remaining > 0 ? Math.min(1, (delta * 7) / remaining) : 1;`. This is the newsie's walk-home speed and it is the number that makes the current bound meaningless. **You will not modify this file.**
3. `src/core/Loop.ts:27` and `:108-119` — `MAX_PRESENTATION_DELTA_SECONDS = 0.05`, and the `stepSeconds <= 0` branch that calls `this.update(this.frame.presentationDeltaSeconds)`. `TownScene.ts:306` constructs its `Loop` **with no options**, so the town runs a variable timestep with delta clamped at **0.05 s**. This clamp is what makes the fix below a *guarantee* rather than a hope. **You will not modify this file.**
4. `src/town/TownScene.ts:153` (`TownDiagnostics` type) — confirm for yourself that **`elapsed: number` (`:155`)** and **`welcomeFollowsPlayer: boolean` (`:162`)** are already public. **You need no src change at all in this task.**
5. `logs/session-scratch/s1263/RESULTS.txt` — the measurement this master is built on, with the per-run table. `logs/session-scratch/s1263/s1263-newsie-window.spec.ts.probe` is the instrument that produced it and `logs/session-scratch/s1263/burn.mjs` is the load generator you will reuse in scope 1. **Read RESULTS.txt before scope 1 so you know what you are trying to reproduce.**
6. `tasks/BACKLOG.md` — **F-1262-4**, **F-1262-5**, **F-1263-1**. **You will not edit this file.**

## Why

The assertion claims: *when the welcome's last beat is dismissed, the newsie is released and does not get yanked away.* It measures that as the distance between a sample taken **before** `click('town-welcome-next')` and a sample taken **after** the click round-trip and a state poll have both returned.

**Everything inside that span is network, not behaviour.** s1263 measured the span directly on main (`bf8e99ed`), desktop-chrome, `--workers=1`, `--repeat-each=3`, both arms:

| arm | observation window | displacement | breaches the `<1` bound |
|---|---|---|---|
| quiet (loadavg 2.6) | **121–133 ms** | **0.693–0.763** | 0 / 3 |
| loaded (14 CPU spinners / 16 cores, loadavg 21.4) | **312–483 ms** | **3.303–3.877** | **3 / 3** |

The newsie walks home at `delta * 7` per frame (`TownScene.ts:2613`), i.e. **7 world units per second**. So the `<1` bound is, in plain arithmetic, an assertion that **the round-trip completed in under ~143 ms**. It is a latency test wearing a behaviour test's clothes.

⚠️ **AND THE DOMINANT TERM IS NOT THE THING THE LAST TWO FIRES ARGUED ABOUT.** Under load the window breaks down as **click round-trip 284–347 ms**, poll-to-false 8–163 ms, final sample 4–36 ms. **The click round-trip alone blows the budget.** That is why s1262's control found the *unmodified* spec failing identically at the same load (F-1262-4): swapping `waitForTimeout(50)` for `expect.poll` changed a minority term. **No choice of what to wait for — sleep, poll, or state — can fix this, because the newsie starts walking home the instant the click lands in the page, and the test cannot observe anything until the round-trip returns.** The window has to move inside the page. That is the entire task.

**This also settles F-1262-5 with a measurement instead of a suspicion.** s1261 retired the `gazette-welcome-newsie-drift-window` leaf because the assertion failed 0 times in 48 executions across workers {1,2,4}. Those 48 executions never varied machine load, and load is the variable that moves this number: at `--workers=1` — inside that very sample — s1263 reproduced the failure 3/3 by adding CPU contention alone. **The 0/48 was not wrong; it was blind.** This master is the fold-in that owner desk item asked for.

**Owner-relevant framing (Mistake #10):** nothing a player sees changes. No src file is touched. This is the factory retiring a question permanently rather than re-measuring it every quiet fire.

## Scope (numbered; each independently checkable)

1. **REPRODUCE THE DEFECT BEFORE YOU CURE IT — MANDATORY GATE, NO EDITS BEFORE IT PASSES.** On a **clean, unmodified** tree, run the subject test twice:
   - **arm QUIET:** `npx playwright test e2e/gazette-welcome.spec.ts --project=desktop-chrome --workers=1 --repeat-each=3`, with `loadavg` recorded before and after.
   - **arm LOADED:** the same command, started while `node logs/session-scratch/s1263/burn.mjs 14 200` is running in the background (it is self-terminating and bounded to 200 s — start a second one if your run outlasts it). Record `loadavg` before and after.

   Report both pass/fail counts and both loadavg pairs. **⛔ STOP-AND-REPORT conditions, both of which are SUCCESSES, not failures:**
   - **(i) If arm LOADED comes back green**, the defect did not reproduce on your box. **STOP.** Report `PREMISE-NOT-REPRODUCED` with both tables and your core count. Do not cure what you cannot see fail — that mistake has already been made once on this exact assertion (F-1215-2).
   - **(ii) If arm QUIET comes back red**, you are looking at a different or larger defect than this master describes. **STOP** and report it; the drain will re-aim.
2. **Move the observation window inside the page.** In `e2e/gazette-welcome.spec.ts`, replace the `newsieBefore` sample (`:81-83`) and the `if (newsieBefore) { … }` body (`:85-89`) with an in-page sampler **installed before the `click` at `:84`**, so the window opens where the behaviour opens instead of after a round-trip. Required shape:
   - Before the click, one `page.evaluate` installs a `requestAnimationFrame` sampler on `window` that each frame reads `__GR_TOWN_DIAGNOSTICS__`'s `welcomeFollowsPlayer`, `elapsed`, and the `newsie` actor position.
   - The sampler ignores frames while `welcomeFollowsPlayer` is `true`. On the **first frame where it reads `false`** it latches an anchor `{ x, z, elapsed }`.
   - After the anchor, each frame updates `peak = max(peak, hypot(pos - anchor))`, and it stops — setting a `done` flag — on the first frame where **`elapsed - anchor.elapsed >= 0.08`**.
   - The test then clicks, `await page.waitForFunction(() => …done)`, reads the record back, and asserts **(a)** an anchor was latched (the release really happened) and **(b)** `peak` is **`toBeLessThan(1)`** — the same bound as today, now measured against the right frame of reference.
   - **Carry the arithmetic as a comment on the `0.08`**, because it is load-bearing and a future speed change must be visibly coupled to it: the newsie's step is `min(remaining, delta * 7)` (`TownScene.ts:2613`) and `delta` is clamped to `MAX_PRESENTATION_DELTA_SECONDS = 0.05` (`Loop.ts:27`), so the sampled window is at most `0.08 + 0.05 = 0.13 s` of simulation and the peak is at most `7 × 0.13 = 0.91 < 1` **on any machine at any load**. ⛔ **Do not change the `< 1` bound and do not change the `7`.**
   - ⛔ **`waitForTimeout` must not appear in the replaced block**, and **no `Date.now()`/`performance.now()` wall-clock term may enter the bound** — the window is measured in the town's own `elapsed`, which is what makes it load-invariant. A reviewer will grep for both.
3. **No `src/` edit is in scope.** `elapsed` and `welcomeFollowsPlayer` are already on the public `TownDiagnostics` type (`TownScene.ts:155`, `:162`) and already published (`:2203`, `:2217`). If you believe you need a src change, **STOP and report why** — do not add a field.
4. **Prove load-invariance, not just green.** Re-run **both arms of scope 1** against your cured tree, same commands, same loadavgs recorded, and additionally on **`--project=mobile-chrome`**. Report the four pass counts as a table beside scope 1's. **The acceptance criterion is exact: the arm that was red before your change must be green after it, on the same box, under the same load.** A green quiet arm alone proves nothing here and will be rejected at the drain.
5. **Report, do not fix, anything adjacent.** Any other place in `e2e/` that samples a moving world object across a CDP round-trip and asserts a distance bound on it is the same defect class. **List them `file:line` in your report and touch none of them.** That list is wanted — it is the next master, not this one.

## Firewall

**TOUCH-ONLY:** `e2e/gazette-welcome.spec.ts`.

**NO:** every `src/**` file — including `src/town/TownScene.ts`, `src/town/TownWelcome.ts`, `src/core/Loop.ts` (the walk speed, the delta clamp, and the welcome's behaviour are all **subjects of measurement, never of edit** in this task) · any other `e2e/*.spec.ts` · `logs/session-scratch/s1263/**` (read-only evidence — do not regenerate or "tidy" it) · `tasks/BACKLOG.md` · `tasks/goals.json` · `STATUS.md` · `scripts/**` · `package.json` · any screenshot or artifact regeneration.

## Self-check before you report

- `npx tsc --noEmit` clean · `npm run build` green (report the seconds).
- Scope 1's two arms and scope 4's four arms, as one table, with every loadavg pair. **Derive the numbers; do not restate this master's.**
- Adjacent suites unmodified-green: derive them by grep, not from memory — at minimum every spec that reads `__GR_TOWN_DIAGNOSTICS__` and asserts on the welcome or the newsie (`grep -rln "town-welcome\|newsie" e2e/`). Report the list you derived and each result. Any red must be fingerprint-matched to a known red in `logs/suite-red-inventory.md` **with the matching row quoted**, or it blocks.
- `node scripts/run-guards.mjs --only test:node-guards` — report `N/N`, **derived**, not inherited.
- `npm run test:citations` — **run it as your LAST act, after every edit** (F-1262-2: a fire reported this guard passing for a file it wrote afterwards).
- Zero console/page errors in a plain boot (no `?debug`).
- `grep -n "waitForTimeout" e2e/gazette-welcome.spec.ts` — report every remaining hit and say why each is legitimate; the scope 2 block must not be among them.
- Commit path-scoped with the `test:` prefix. **Do not `git add -A`.**

READY-FOR-GATES + report: scope 1's two arms with loadavgs and the STOP answer in writing · the before/after of the replaced block · the comment you wrote on the `0.08` · scope 4's four arms beside scope 1's · the scope 5 adjacent-shape list · and any place this master told you something about the tree that turned out to be false.
