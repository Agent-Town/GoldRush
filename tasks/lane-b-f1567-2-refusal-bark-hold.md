# Task f1567-2: a refusal must not be overwritten by idle chatter (LANE-B, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s1567, from F-1565-1, whose trace I re-verified by reading every cited file on main rather than inheriting it.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

READ FIRST: `AGENTS.md`; `src/agent/Embodiment.ts` — **`handleReceipt` (`:110-124`) and `updateSimulation` (`:126-144`) together, in one sitting, because the bug is in how they compose, not in either one**; `src/agent/Voice.ts:5-48` (the two vocabularies and `barkForReceipt`); `e2e/m4-06-embodiment.spec.ts:395-430` (the existing denied-receipt test — **read the comment at `:426-427`, it documents this defect and works around it**); `tasks/BACKLOG.md` row **F-1565-1**; `reviews/f1564-1-m4-06-ceiling.md` (the trace's origin).

**Pre-flight (LANE-SAFETY, runner-auto-commit aware):** the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to `artifacts/**`, `reviews/shots-*` and any `.png` are NEVER "work" and NEVER a STOP** — discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-b status --short` → must be clean, with the **FACTORY-CHURN EXCEPTION (F-1407-1), always expected and never a STOP: (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*`, any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

**SEQUENCING / CITATION CHECK (F-1424-3 — run BOTH before any edit).** Each key is a single line, verified to print `1` on main at dispatch (s1567):

```
grep -Fc "        if (at >= this.nextSurveyAt) {" src/agent/Embodiment.ts
grep -Fc "  refusal: ['held', 'ask me', 'no trust']," src/agent/Voice.ts
```

Both MUST print `1`. If either prints `0`, **STOP and report "lane-b stale: <which key> missing"**. Do NOT read a `0` as "the file changed shape" and improvise — the first key proves the survey branch you are here to gate is still the exact line, the second proves the refusal vocabulary has not moved.

---

## Why (F-1565-1, traced s1565, re-verified by reading main s1567)

A player asks the agent to do something it lacks permission for. The agent says *"held"* / *"ask me"* / *"no trust"* — and then, with no further input, that denial can be silently replaced by idle chatter about the ledger. **The player is never told they were refused.**

✓ **RE-VERIFIED ON MAIN, not inherited** — every coordinate below was read this fire:

- `src/agent/Voice.ts:13` — `refusal: ['held', 'ask me', 'no trust'],`
- `src/agent/Voice.ts:14` — `survey: ['survey', 'ledger'],`
- `src/agent/Voice.ts:38` — a failed non-`NO_SYSTEM_API` receipt classifies as `refusal`
- `src/agent/Embodiment.ts:315-316` — `say()` is the **only** writer of `lastLine`
- `src/agent/Embodiment.ts:116` — the receipt route says the refusal line
- `src/agent/Embodiment.ts:137` — the idle-survey route says a survey line

🔑 **AND HERE IS THE PART THE ORIGINAL FINDING DID NOT NAME, WHICH YOU SHOULD READ BEFORE CHOOSING A CURE.** This is not a wall-clock race between distant events — **the two writes can land in the same tick, and the code makes that the *likely* case rather than a rare one.** `handleReceipt` returns early at `:117` for exactly the refusal case:

```
if (!receipt.outcome.ok && receipt.outcome.reason !== 'NO_SYSTEM_API') return;
```

That early return skips `this.moving = true`. So **a refused agent stays idle by construction** — and `updateSimulation` calls `handleReceipt` at `:128`, then falls into the idle branch at `:134` in the *same* invocation, where `:136` fires the survey the moment `at >= this.nextSurveyAt`. A successful order sets `moving = true` and is therefore safe; **only the refusal, the one message the player most needs, lands the agent in the exact state that can overwrite it.**

⚖️ **THE ACCEPTED REFUSAL SET IS CORRECT AND IS NOT THE BUG.** s1565 established this by tracing the one writer, and it is why this task changes the game and not the test. Do not "fix" this by widening `['held', 'ask me', 'no trust']` to admit `ledger` — that would make the test agree with a product defect.

📌 **THE TEST ALREADY KNOWS.** `e2e/m4-06-embodiment.spec.ts:426-427` reads:

```
// F-1558-1: Embodiment.updateSimulation's idle-survey branch may replace the denial bark after
// surveyCooldownSeconds (19 s), so after.lastLine is deliberately not asserted here.
```

A suite that documents a defect and routes around it is the clearest possible statement that the defect is real. **After your cure that comment becomes false**, and saying so is part of the deliverable.

---

## Scope

1. **Give a refusal a hold, in `src/agent/Embodiment.ts`.** When `say()` is called with a refusal line, record the sim time; the idle-survey branch at `:136-139` must **not** speak while that hold is live. Two shapes are acceptable and you choose, stating why in the report:
   - a `lastRefusalAt` field consulted by the survey branch, or
   - pushing `nextSurveyAt` forward when a refusal is said.

   ⚠️ **Whichever you pick, the survey timer must not be starved permanently** — after the hold expires the agent surveys again on its normal cadence. Say in the report which invariant you relied on to be sure of that.

2. **The hold length is a named constant in `src/game/Balance.ts`, beside its siblings.** `Balance.agent.surveyFirstSeconds` (`:256`) and `surveyCooldownSeconds` (`:257`) are the pattern; add one in the same block with a comment naming **F-1565-1** and this task. **Do not reuse or move either existing constant.** Pick a value you can defend in one sentence — long enough that a player reads the denial, short enough that the agent does not go mute. State your reasoning; a defended 4 is worth more than an undefended 10.

3. **How you identify a refusal line matters — do NOT string-match the three words at the survey site.** `barkForReceipt` already computes the kind (`Voice.ts:36-48`); thread that fact through rather than re-deriving it, so the vocabulary stays defined in exactly one file. **A second implementation of "is this a refusal?" is the F-1261-1 shape and will be treated as a task failure even under a green suite.**

4. **Prove the RED by manufacturing it, in a NEW test in `e2e/m4-06-embodiment.spec.ts`.** There is no unit harness for `src/**`, so this is the level available. The arrangement: open with the same `?debug&timescale=4&nowaves&nolevel` shape, drive a denied receipt via `window.__GR_AGENT__.panAt(...)`, assert the refusal bark immediately, then **advance deterministically past the survey timer** with `window.__GR_TEST__.advanceSim(...)` (`surveyFirstSeconds` is 7, so the sim time must cross `nextSurveyAt`), and assert `lastLine` is **still** a refusal line.
   - **Report the test's verdict BEFORE your change and AFTER.** It MUST fail before and pass after. **A test that passes before your change has not reproduced the bug** — if that happens, do not adjust it until it goes red; **report it**, because it would mean the mechanism is not what this master says and I would rather be corrected than obeyed.
   - Use `advanceSim`, never a wall-clock wait (f1559-1 replaced exactly that, and a wall-clock wait re-opens the flake).

5. **Update the now-false comment at `:426-427`** to say what is true after the cure, citing F-1565-1 and the new constant. ⛔ **You may edit that COMMENT and nothing else in that test.** The drift test is a measurement subject: **`expect(gapClosed).toBeLessThan(0.4)` and `expect(driftAbs).toBeLessThan(0.4)` are untouchable, as is every other numeric `expect` argument in the file** (F-1441-3, F-1564-1 — a re-pin is a task failure even if it greens the suite). If your change moves a drift number, **STOP and report it**; that is a finding about the cure, not licence to re-pin.

## Firewall

**TOUCH-ONLY:** `src/agent/Embodiment.ts` · `src/agent/Voice.ts` (only if scope 3 needs the kind exported) · `src/game/Balance.ts` (the one new constant) · `e2e/m4-06-embodiment.spec.ts` (the new test + the `:426-427` comment) · `artifacts/f1567-2-refusal-bark-hold/report.md`.

**NO:** any other `src/**` · any other `e2e/**` · `package.json` (a new npm script reds `gate-caller-audit`) · `scripts/**` · `tasks/**` · `specs/**` · `reviews/*.md` · the two `0.4` constants · the existing accepted refusal set at `:408`.

## Self-check (run these, report each by name with its numbers)

- `npx tsc --noEmit` → rc 0.
- `npm run build` → green, asset-diet under ceiling.
- `npx playwright test e2e/m4-06-embodiment.spec.ts --workers=1` → **both projects, desktop AND 390px mobile**, named by PATH (F-1563-2: a gate naming a spec by role can be satisfied by the wrong file). Report the full pass/fail counts, not a summary word.
- **`npm run test:node-guards` → run it and report the counts.** ⚠️ **F-1460-1 keys on `src/sim/`, `src/systems/`, `src/entities/` and this task touches `src/agent/` — so the letter of that law does not bind, but its REASON does: you are moving behaviour the sim replays.** F-1565-1 says run it anyway, and so do I. **Run it ALONE** — it is ~181 s and overlapping it with another battery contaminates both (F-1537-1). If it reds, report the failure; **do not re-pin anything to green it.**
- Zero console errors and zero page errors in the new test (`expect(errors.consoleErrors).toEqual([])` and the page equivalent, as the neighbouring tests do).
- Screenshot of the agent showing a held refusal after the sim advance → `reviews/shots-f1567-2/`.
- `git diff --check` clean.

## Report → `artifacts/f1567-2-refusal-bark-hold/report.md`

State: which cure shape you chose and why · the constant's value and its one-sentence defence · **the new test's verdict before and after your change, quoted** · the `test:node-guards` counts · whether any drift number moved · and the answer to one question I deliberately did not decide for you: **should a refusal also suppress the *other* idle bark routes, or only the survey?** I scoped this to the survey because that is what the trace proved; if reading the file shows a second overwrite path, **report it as a finding — do not widen scope to cure it.**

**READY-FOR-GATES + report the before/after verdict of the new test, the node-guards counts, and any second overwrite path you found.**
