# Task f1558-1: the denied-receipt test samples a line an idle bark is free to overwrite (LANE-B, commit prefix "test:")

**FIRE-AUTHORED (attended review welcome)** — authored s1558 from F-1558-1, measured on the merged tree by the authoring fire (100 runs) and then explained by reading the product code (see Why).

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

READ FIRST: `AGENTS.md`; `e2e/m4-06-embodiment.spec.ts` (the whole file — you are editing ONE test in it); `src/agent/Embodiment.ts` (read-only, lines ~110–140 — `handleReceipt` and `updateSimulation`); `src/agent/Voice.ts` (read-only, the `AGENT_BARKS` table); `reviews/f1557-3-m4-06-denied-drift-differential.md` (F-1558-1); the F-1557-3 row in `tasks/BACKLOG.md`.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE (F-1505-1): `git -C worktrees/lane-b status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

**CITATION CHECK (F-1424-3 / F-1425-2), run BEFORE you edit anything:**

```
grep -c "survey: \['survey', 'ledger'\]," src/agent/Voice.ts
grep -c "this.nextSurveyAt = at + Balance.agent.surveyCooldownSeconds;" src/agent/Embodiment.ts
```

Both must return **1**. If either returns 0, the lane has drifted from the main this task was written against — **STOP and report the counts**; do not guess at a replacement line.

**SEQUENCING:** none. This edits one test body and no shipped code. Do NOT gate on any other slice.

## Why (F-1558-1, s1558 — measured on the merged tree, then explained by reading)

f1557-3 merged at `88b3ea977` and did what it was authored to do: the three assertions that encode the permission rule now run before any numeric proxy, and they passed **100/100**. But the test **still flakes**, and s1558 re-measured it on the merged tree at `--workers=1` on an idle machine:

| batch | result |
|---|---|
| `--repeat-each=15` | 14 passed, **1 failed** |
| `--repeat-each=15` | 15 passed |
| `--repeat-each=20` | 19 passed, **1 failed** |
| `--repeat-each=20` | 20 passed |
| `--repeat-each=30` | 29 passed, **1 failed** |
| **total** | **97 / 100 — ~3%** |

Every failure landed on the SAME line, and it is **not** the drift bound:

```
Error: expect(received).toContain(expected) // indexOf
Expected value: "ledger"
Received array: ["held", "ask me", "no trust"]
> 421 |   expect(['held', 'ask me', 'no trust']).toContain(after.lastLine);
```

✓ **Provably not a drift failure, without needing to catch the error:** across all 100 runs `driftAbs` took only three values — `0.2834`, `0.3529`, `0.2080` — a **max of 0.353** against bounds of `0.45` (`gapClosed`) and `0.6` (`driftAbs`). No drift assertion could have failed in any run. Raw data: `artifacts/f1557-3-m4-06-denied/s1558-merged-tree-measurements.md`.

🔑 **THE MECHANISM, verified by READING the product rather than by re-running the test.** `src/agent/Embodiment.ts`:

- `handleReceipt` (`:110`) says a **refusal** bark on a denied receipt — `['held', 'ask me', 'no trust']` — and then `return`s early **without setting `moving`**. That early return is the permission rule working correctly, and it deliberately leaves the Prospector **idle**.
- `updateSimulation` (`:127`) has an `else` branch reached only when the agent is **not moving and has no work left** — precisely the state a denial produces. In it: `if (at >= this.nextSurveyAt) this.say(agentBark('survey', Math.floor(at)))`.
- `src/agent/Voice.ts:14` — `survey: ['survey', 'ledger']`.

So an **idle survey bark overwrites `lastLine`**, and the denial is the very thing that makes the agent eligible for it.

📐 **The arithmetic predicts the observed rate, which is why this is a mechanism and not a story.** `Balance.agent.surveyCooldownSeconds` is **19**. The test waits 350 ms of wall time at `?timescale=4` ≈ **1.4 s of sim**. The chance the survey cooldown elapses inside the sample window is ≈ **1.4 / 19 ≈ 7%** — the same order as the measured ~3%.

⇒ **This is a TEST RACE, not a product defect.** An idle agent surveying after a refusal is correct behaviour. The test's error is asserting that the **last** line 1.4 sim-seconds later is still the denial line, when nothing promises that.

⚠️ **This flake is PRE-EXISTING and independent of f1557-3** — `:421` was asserted before that slice too, merely later in the list. It has most likely been misattributed to the drift flake for the whole life of F-1285-2. **Two independent intermittent failures wearing one finding's name**: a test that can fail two ways reports whichever assertion is reached first, so curing the earlier one simply reveals the later one. Do not treat the drift history as evidence about this.

## Scope

1. **Reproduce before you change anything.** Instrument the `permission-denied receipts …` test to capture `lastLine` at **two** moments — immediately after `panAt` returns (before any wait) and again after the settle wait — and emit ONE structured line before any `expect`, shape exactly: `[m4-06-denied-line] immediate=<v> afterWait=<v>`. Run `--repeat-each=30 --workers=1` on **both** `--project=mobile-chrome` and `--project=desktop-chrome` with the assertions still untouched. Write every raw sample plus per-project counts to `artifacts/f1558-1-m4-06-denied-line/samples.txt`.
   **The expected shape, which you must confirm or refute rather than assume:** `immediate` is always in `['held', 'ask me', 'no trust']`; `afterWait` is occasionally `'survey'` or `'ledger'`. ⛔ **If `immediate` is EVER outside the refusal set, STOP and report** — that would mean the denial line is not set synchronously with the receipt, the premise of the fix is wrong, and this becomes a product finding rather than a test fix.
2. **Assert the line at the moment it is said.** Assert that the refusal line was spoken by checking the **immediate** capture against `['held', 'ask me', 'no trust']`. This is a strictly stronger check than today's: it pins the exact bark the denial produced, rather than whatever happened to be last 1.4 s later.
3. **Remove the post-wait line assertion** (`:421` as merged). It asserts a property the product does not promise. Replace it with a comment — citing this task and `src/agent/Embodiment.ts` `updateSimulation`'s idle-survey branch plus the 19 s `surveyCooldownSeconds` — so that a later reader cannot "restore" it as a lost assertion. ⛔ **Do NOT instead widen the accepted set to include `'survey'`/`'ledger'`**: that would make the assertion unable to distinguish a denial from an idle agent that never spoke at all, which is the property under test.
4. **Everything else stays.** `:411`–`:413` (moving / target-unchanged / target-not-the-node), both drift bounds, and the `consoleErrors`/`pageErrors` assertions are untouched in comparand and tolerance. You are removing exactly one assertion and adding one earlier, stronger one.
5. **Prove it.** Re-run the amended test `--repeat-each=30 --workers=1` on **both** projects and report the pass counts. Target 30/30 each. If any repeat still fails, report the captured values rather than adjusting anything to fit.
6. **Report on the class, do NOT edit it.** `e2e/m4-06-embodiment.spec.ts` holds two other `lastLine` assertions — `:241` (`/motes|sweep|spark/`) and `:384` (`'shine'`). The idle-survey branch is reachable only when the agent is **not moving and has no work left**, so a test that samples while the agent is busy should be immune. **State for each, with the reasoning and any measurement you took, whether it is exposed to this same race.** Do not change them in this task; if either is exposed, say so and it becomes its own corrective.
7. **No-op guard.** If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

## Firewall

Touch ONLY: `e2e/m4-06-embodiment.spec.ts` (the `permission-denied receipts …` test body only) and `artifacts/f1558-1-m4-06-denied-line/**`.

NO changes to: `src/**` — **this is a test-correctness task. The survey bark is correct product behaviour and must not be "fixed"**; if you conclude otherwise, REPORT it, do not edit it · any other test in `e2e/m4-06-embodiment.spec.ts` (including `:241` and `:384` — item 6 is report-only) · any other `e2e/**` spec · `scripts/**` · `src/game/Balance.ts` (the 19 s cooldown is not yours to tune) · `playwright.config.ts` · `tasks/**`, `specs/**`, `STATUS.md`, `tasks/BACKLOG.md`.

## Self-check (evidence, not vibes)

`npx tsc --noEmit` clean. `npm run build` green. `e2e/m4-06-embodiment.spec.ts` **green in full** (not just the edited test) on **both** `desktop-chrome` and `mobile-chrome` at `--workers=1`. Adjacent suites unmodified-green both projects, by name: **`e2e/m4-08-agent-attribution.spec.ts`** and **`e2e/m4-07-prospector-panel.spec.ts`** (⚠️ note: the f1557-3 master named `e2e/m4-08-attribution.spec.ts`, which does not exist — these are the real filenames, verified s1558 by `ls e2e/`). Zero console/page errors — keep the existing `errors.consoleErrors`/`pageErrors` assertions. Artifacts at the exact path `artifacts/f1558-1-m4-06-denied-line/samples.txt`. No screenshots or perf table needed — nothing here renders differently.

End: **READY-FOR-GATES** + report: (a) the `immediate` / `afterWait` distributions per project and how many `afterWait` samples were `survey`/`ledger`, (b) confirmation that `immediate` was ALWAYS a refusal line (or the STOP if not), (c) the 30×2 re-run pass counts after the fix, (d) your item-6 verdict on `:241` and `:384` with reasoning, (e) anything you had to adapt.
