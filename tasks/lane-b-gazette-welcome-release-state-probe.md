# Task gazette-welcome-release-state-probe: make the newsie-release assertion observe a STATE, not a 50 ms wall-clock window (LANE SLOT)
FIRE-AUTHORED s1261 (attended review welcome)
You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b` (branch `lane/m4`, commit prefix `test:`).
CODEX: model=gpt-5.6-sol effort=high

> ⚠️ **THIS IS TEST HYGIENE, NOT A FLAKE CURE. READ THIS PARAGRAPH TWICE.** The assertion you are changing currently **PASSES**, and its failure rate has been measured at **0 failures in 48 executions**. Its predecessor task (`gazette-welcome-newsie-drift-window`) was authored as a *flake cure*, stopped lawfully at `PREMISE-NOT-REPRODUCED`, and s1261 retired its leaf as `superseded` (**F-1261-6**). ⛔ **Do NOT re-open the flake premise. Do NOT hunt a concurrency bug. Do NOT touch the welcome's behaviour.** You are removing a *timing dependency* from a test that is currently green, and the only acceptable outcome is a test that asserts the same truth without consulting the wall clock.

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)

The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/m4 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

> ℹ️ Authoring-time safety measurement (s1261 — **verify it yourself anyway, per VERIFY-DON'T-INHERIT**). `git rev-list --count main..lane/m4` = **1**, `lane/m4..main` = **6**, so `lane/m4` is **not** a strict ancestor and the one-line ancestor check will NOT clear it. Establish safety the direction-proof way instead: **`git diff --name-status --diff-filter=A main..lane/m4` was EMPTY at authoring** — the branch adds no file main lacks — and the single ahead commit is **`d50e2887` `runner(lane-b): lane-b-findings-state-vocabulary-triage.md`**, whose content was drained to main as **`637e156e`** by a tip-graft (which is exactly why the branch still reads 1 ahead). **That is a SAFE DUPE.** ⚠️ If your own re-measurement finds any `A` line in that diff, treat the branch as holding undrained work and **STOP** — do not reason it away.

## READ FIRST (paths, in this order)

1. `e2e/gazette-welcome.spec.ts` — the subject. Read the whole test `the Gazette welcome fires once, walks skippably, and retriggers through the newsie` (starts `:45`), and specifically the block at **`:84-88`**: `click('town-welcome-next')` → `waitForTimeout(50)` → sample newsie position → `expect(Math.hypot(…)).toBeLessThan(1)`.
2. `src/town/TownWelcome.ts` — **`:44` `get followsPlayer(): boolean { return this.phase === 'delivery' || this.phase === 'walk'; }`** and the `advance()`/`skip()` path at `:89+` that leaves `phase === 'idle'` on the final beat. **This getter is the state the test is trying to infer. You will not modify this file.**
3. `src/town/TownScene.ts` — `:556` (`const welcomeFollowing = this.welcome.followsPlayer && !this.storyBeatVisible();`) proves the getter is already a live read; the `TownDiagnostics` type at **`:153`** (see `namingPrompt: boolean;` `:161`, `assayOpen: boolean;` `:166`) and the object literal at **`:2200`** (see `namingPrompt: this.nameCardOpen,` `:2215`, `assayOpen: this.assayBenchOpen(),` `:2220`) are the two sites you will add one field to.
4. `tasks/BACKLOG.md` — **F-1261-6** (why the flake premise is dead) and **F-1261-7**. **You will not edit this file.**
5. `logs/suite-red-inventory.md:626-627` and `:636-637` — the merged rate table (`987df9889da24857bf1472121b249f4d8621b20f`) behind the 0/48. Read it so you do not re-derive a flake that is not there.

## Why

`e2e/gazette-welcome.spec.ts:84-88` ("the Gazette welcome fires once, walks skippably, and retriggers through the newsie") asserts that the newsie **stops following the player** once the welcome's final beat is dismissed. It asserts that by waiting **50 ms of wall clock** and then checking that the newsie moved less than 1 world unit.

**The truth it wants is a state property.** `TownWelcome.followsPlayer` is `false` the moment `skip()` lands, and `TownScene.ts:556` already consumes that getter every frame. The test instead infers the state from a displacement measured over an arbitrary window — so what it actually asserts is *"in the next 50 ms of wall clock, the newsie did not travel 1 unit"*, which couples a behavioural claim to how many simulation ticks happen to fit in 50 ms on the machine running it. Under heavier load that window covers more ticks, and a legitimately-released newsie with residual velocity can exceed the bound; under a stall the sample can be taken before any drift would have shown. **Both directions are wrong for the same reason: the instrument reads the clock instead of the thing.**

**Owner-relevant framing (Mistake #10):** nothing a player sees changes here. This is the factory's own instrument getting honest, and it is worth a slot because **this single assertion has already consumed four fires** — s1214 discriminated it, s1215 ran a cure that stopped `PREMISE-NOT-REPRODUCED`, s1216 wrote its stopped note, and s1261 retired the leaf after re-reading all of it. Removing the timing dependency retires the question permanently instead of re-measuring it every time the board is quiet.

⚠️ **And the reason scope 1 is a mandatory STOP gate rather than a formality:** a green wall-clock assertion is *consistent with the release working* **and** with the release not working while the newsie simply had no velocity to spend. Those are different worlds and the current test cannot tell them apart. **Find out which one you are in before you change a line** — if it is the second, the subject is the game, not the test, and this master is void.

## Scope (numbered; each independently checkable)

1. **OBSERVE THE DEFECT FIRST — MANDATORY GATE, NO EDITS BEFORE IT PASSES.** On a clean tree, drive the existing test to the final beat and, immediately after `click('town-welcome-next')`, record from the page (a) the welcome's phase / `followsPlayer` value, and (b) the newsie's position sampled across **at least 10 successive animation frames** (not one sample after a fixed sleep). Write the raw table into your report. **Then answer both questions in writing:**
   - **(i) Does `followsPlayer` become `false`?** ⛔ **If it stays `true`, STOP** and report — the release does not happen, the green assertion was luck, and this is a game finding that outranks the test change. Reporting this is a **SUCCESS**, not a failure.
   - **(ii) What is the newsie's actual peak displacement across those frames?** Record the number. If it exceeds **1** at any frame while `followsPlayer` is already `false`, **STOP** and report: the bound the test asserts is wrong on its own terms and picking a new bound is a drain question, not yours.
2. **Expose the state, behaviour-neutrally — exactly one field, two sites, in `src/town/TownScene.ts` only.** Add `welcomeFollowsPlayer: boolean;` to the `TownDiagnostics` type (`:153` block, beside `namingPrompt`/`assayOpen`) and `welcomeFollowsPlayer: this.welcome.followsPlayer,` to the diagnostics object literal (`:2200` block, same neighbourhood). **`followsPlayer` is an existing read-only getter over `phase`** — reading it cannot mutate anything, and `:556` already reads it every frame. ⛔ **No other src/ edit is in scope.** Do not add a setter, a test hook, or a second field "while you are there".
3. **Replace the wall-clock probe in `e2e/gazette-welcome.spec.ts:84-88` ("the Gazette welcome fires once, walks skippably, and retriggers through the newsie") with a state assertion, and KEEP the displacement check — after the state settles, not racing it.** Shape: `await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!.welcomeFollowsPlayer)).toBe(false);` **then** sample the newsie and keep an equivalent `toBeLessThan(1)` bound, so the test still catches a released-but-teleporting newsie. ⛔ **`waitForTimeout` must not appear in the replaced block** — that is this task's whole point, and a reviewer will grep for it.
4. **Prove the assertion is now load-indifferent rather than merely still green.** Run the spec on **both** projects at **default workers** (not `--workers=1` — a `--workers=1` arm has produced false GREENs on this family three times) with **`--repeat-each=3`**, and report the pass count with the loadavg before and after. Then re-run once more under deliberate load (a second playwright project running concurrently is sufficient) and report that too. **A green under load is the only green that means anything here.**
5. **Report, do not fix, anything adjacent.** If you find other `waitForTimeout`-then-assert-state shapes in this spec or its neighbours, **list them with file:line in your report** and touch none of them. That list is a finding for the drain, and it is genuinely wanted.

## Firewall

**TOUCH-ONLY:** `e2e/gazette-welcome.spec.ts` · `src/town/TownScene.ts` (the `TownDiagnostics` type block and the diagnostics object literal — **those two sites only**).

**NO:** `src/town/TownWelcome.ts` (the behaviour is not the subject — no phase, timing, or follow-logic change) · any other `e2e/*.spec.ts` · `src/game/Balance.ts` · `tasks/BACKLOG.md` · `tasks/goals.json` · `STATUS.md` · `scripts/**` · any screenshot or artifact regeneration · `package.json`.

## Self-check before you report

- `npx tsc --noEmit` clean · `npm run build` green (report the seconds).
- `e2e/gazette-welcome.spec.ts` green on **desktop AND mobile-chrome at default workers**, `--repeat-each=3`, with the loadavg table from scope 4.
- Adjacent suites unmodified-green: derive them by grep, not from memory — at minimum every spec that reads `__GR_TOWN_DIAGNOSTICS__` and asserts on the welcome or the newsie (`grep -rln "town-welcome\|newsie" e2e/`). Report the list you derived and each result. Any red must be fingerprint-matched to a known red in `logs/suite-red-inventory.md` **with the matching row quoted**, or it blocks.
- `node scripts/run-guards.mjs --only test:node-guards` — report `N/N`, **derived**, not inherited.
- Zero console/page errors in a plain boot (no `?debug`).
- `grep -n "waitForTimeout" e2e/gazette-welcome.spec.ts` — report every remaining hit and say why each is legitimate (some may be unrelated to state assertions; the block from scope 3 must not appear).
- Commit path-scoped with the `test:` prefix. **Do not `git add -A`.**

READY-FOR-GATES + report: scope 1's raw frame table and both written answers · the exact diff of the two `TownScene.ts` sites · the before/after of the replaced block · scope 4's two load arms with loadavgs · the scope 5 adjacent-shape list · and any place this master told you something about the tree that turned out to be false.
