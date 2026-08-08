# Task f1571-1: a bark race must not be able to delete the drift sample — reorder the ASSERTIONS, never the arrangement (LANE-B, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s1571, from **F-1565-2**, whose censoring half has been named un-taken by three consecutive fires (s1565, s1569, s1570). I did not inherit the mechanism: I read `e2e/m4-06-embodiment.spec.ts:402–425` on main and confirmed both halves of it before writing this scope.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

READ FIRST: `AGENTS.md`; `e2e/m4-06-embodiment.spec.ts` — **the test starting at `:395` ("permission-denied receipts do not send the Prospector to the denied target"), the whole body through `:427`, because it is the subject and the change is a reordering of lines you must be able to see at once**; `tasks/BACKLOG.md` rows **F-1565-2**, **F-1563-3**, **F-1558-1** and **F-1560-1** — *the last three are the measurement history that says which numbers are real and which cures are FORBIDDEN*; `CLAUDE.md` §4.5 (firewalls) and Mistake #12.

**Pre-flight (LANE-SAFETY, runner-auto-commit aware):** the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP**; discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-b status --short` → must be clean, with the **FACTORY-CHURN EXCEPTION (F-1407-1), always expected and never a STOP; list them and proceed: (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

**SEQUENCING / CITATION CHECK (F-1424-3 — run BOTH before any edit).** Each key is a single line, verified to print `1` on main at dispatch (s1571):

```sh
grep -c "toContain(immediate.lastLine)" e2e/m4-06-embodiment.spec.ts
grep -c "refusalHoldSeconds now keeps the denial bark readable" e2e/m4-06-embodiment.spec.ts
```

Both must print `1`. **If either prints `0`, STOP and report "lane drifted or predecessor absent" — do NOT improvise.** The second proves f1567-2 (the `refusalHoldSeconds` hold, merge `661e13d9b`) is present in this lane; without it you are editing a different test from the one this task measured.

## Why (F-1565-2, mechanism re-verified s1571 by reading main)

F-1565-2 states the hazard and three fires have left it standing: *"the bark assertion executes BEFORE the drift log line, so a run that loses the bark race yields no drift sample at all — censored in the direction that HIDES the problem"*, and *"the runs most starved of CPU are exactly the ones most likely to both lose that race and drift furthest. A mean over surviving samples is not the mean."*

✓ **CONFIRMED by reading `e2e/m4-06-embodiment.spec.ts:402–413` on main, not inferred:**

```
:402  const receipt = await page.evaluate(... panAt(nodeId) ...)
:403  const immediate = await companion(page);      ← the value is CAPTURED here
:404  expect(receipt ...).toMatchObject({ ok: false, reason: 'PERMISSION_DENIED' })
:408  expect(['held','ask me','no trust']).toContain(immediate.lastLine);
:409  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.35));
:410  const after = await companion(page);
:411  const driftAbs = distance(after.position, before.position);
:413  console.log(`[m4-06-denied] driftAbs=${driftAbs} gapClosed=${gapClosed}`);
```

**Any failure at `:404` or `:408` aborts the test before `:409` ever runs**, so the run contributes **no drift observation at all** — not a high one, not a low one. The censoring is structural, and it is biased: the conditions that make a bark race likely are the conditions that make drift large.

🔑 **THE CURE IS AVAILABLE AND IT IS ALMOST FREE, BECAUSE THE VALUES ARE ALREADY CAPTURED BEFORE THEY ARE ASSERTED.** `receipt` is captured at `:402` and `immediate` at `:403`. The `expect(...)` calls at `:404` and `:408` perform **no page interaction whatsoever** — they read local variables. **Therefore moving those two assertions BELOW the `console.log` at `:413` changes the ORDER IN WHICH FAILURES ARE REPORTED and changes NOTHING about the arrangement under test:** the same page calls happen at the same points, in the same order, with the same timings.

⛔ **AND THIS IS THE ONE CURE F-1565-2 EXPLICITLY PERMITS.** That row says: *"Do NOT 'fix' it by moving the log line — that changes the arrangement under test."* **Read it precisely — it forbids moving the LOG LINE (which sits after a real page round-trip and would move the sample), not the ASSERTIONS (which are pure).** This task moves only pure assertions. If you find yourself moving `:409`, `:410`, `:411`, `:412` or `:413`, you have left the scope.

ⓘ **PRECEDENT: this exact manoeuvre has been done on this exact test before and it worked** — f1557-3 reordered assertions so `:411`–`:413` ran before any proxy, and it passed 100/100 (see the F-1558-1 row). You are applying the same technique to the two assertions that remain above the sample.

⚠️ **WHAT THIS TASK DOES *NOT* DO, stated so nobody reads a green here as closing F-1565-2.** That row has a second half — *"reproduce in the FIRE shell (set `CLAUDE_CONFIG_DIR`)"* — and **it is not lane work; attempting it here would produce a FALSE NEGATIVE.** ✓ **Verified s1571 by reading `playwright.config.ts:23` and `:50`:** `isFireShell` tests only whether `CLAUDE_CONFIG_DIR` is **defined**, and the only thing it controls is `workers: isFireShell ? 1 : undefined`. Per F-1269-1 the fire shell's starvation is a property of the **fire's process context** (measured 7.53× lane vs 3.47× fire at eight children), which an environment variable cannot confer. **So a lane that exports `CLAUDE_CONFIG_DIR` obtains the worker pin it already has from `--workers=1`, and none of the CPU ceiling — it would measure a benign shell and report "no breach", which is exactly the wrong conclusion.** That half belongs to a FIRE and is filed as **F-1571-1**. **Do not attempt it. If you set `CLAUDE_CONFIG_DIR` anywhere in this task, that is a scope violation.**

## Scope

1. **Move the two pure assertions currently at `:404` (the `receipt` / `toMatchObject` check) and `:408` (the `immediate.lastLine` refusal check) to sit immediately AFTER the `console.log` line at `:413`.** Keep their relative order and their exact expressions — this is a **move, not a rewrite**. The captures at `:402` and `:403` stay exactly where they are.
2. **Do not move, alter, re-time or duplicate anything between `:409` and `:413`** — `advanceSim(0.35)`, the `after` capture, both distance computations and the `console.log`. The arrangement under test must be byte-equivalent in behaviour.
3. **Leave every numeric bound alone.** Both `expect(...).toBeLessThan(0.4)` at `:424`/`:425` and every other constant in this file are FIREWALLED. See "Forbidden greens" below.
4. **Add a short comment at the new assertion site naming the reason**, citing F-1565-2 and stating in one sentence that these assertions are placed after the drift log so that a bark or receipt failure cannot suppress the drift sample. Keep it to ≤3 lines; do not restate this task.
5. **Prove the censoring is actually gone, by manufacturing it** (this is the deliverable's evidence, not a formality): temporarily force the refusal assertion to fail — e.g. by asserting against a set that cannot match, **by direct file edit, never a shell-quoted probe** — and run the test. **BEFORE the reorder, the `[m4-06-denied] driftAbs=` line must be ABSENT from the output; AFTER the reorder, with the same forced failure, it must be PRESENT.** Quote both outputs. Then restore the forced failure and confirm the file is byte-identical to your intended final state (`git diff` clean against it). **A green suite alone is NOT evidence for this task** — the whole point is behaviour on the failure path, which a passing run never executes.
6. **Run the test normally, both projects, `--workers=1`, and report the `driftAbs`/`gapClosed` values you observe.** They are expected to be unremarkable and unchanged in character from the F-1560-1 sample set. ⚠️ **If any run BREACHES `0.4`, that is a FINDING to report, not a number to fix** — do not touch the bound (see below).

## Firewall

**Touch ONLY:** `e2e/m4-06-embodiment.spec.ts` (the one test at `:395`–`:427`, assertion order + one comment) · `reviews/f1571-1-m4-06-uncensored-drift-sample.md` (new, your report) · `artifacts/f1571-1-uncensored-drift/**` (new, your evidence).

**NO changes to:** any `src/**` — ⛔ **drift and bark findings are REPORTED, never fixed here; a test-provenance slice that starts editing the agent is how a flake becomes a regression** · any other test in `e2e/m4-06-embodiment.spec.ts` (`:241`, `:384`, `:446`, `:452` are other tests — do not touch them) · any other `e2e/**` file · `playwright.config.ts` · `src/game/Balance.ts` · `tasks/**`, `tasks/goals.json`, `tasks/BACKLOG.md`, `STATUS.md` · `specs/**` · any other `reviews/*.md`.

⛔ **FORBIDDEN GREENS — each is a task FAILURE even if the suite passes:** changing any numeric argument to `expect(...)`, in either direction — **including a NARROWING**, because this task produced no evidence that would justify one · restoring `waitForTimeout` in any guise · re-asserting `after.lastLine` (deleted deliberately by f1558-1 — the idle survey bark legitimately overwrites it) · widening the accepted refusal set to admit `survey`/`ledger` (it would leave the assertion unable to tell a denial from an agent that never spoke) · setting `CLAUDE_CONFIG_DIR` anywhere · moving the `console.log` or any `advanceSim`/`companion` call.

🔓 **No firewall lift is granted.** If you find an adjacent defect, **report it in your review file — do not fix it** (CLAUDE.md §4.5).

## Self-check (evidence, not vibes)

`npx tsc --noEmit` rc=0. `npm run build` green — quote the Vite time and the asset-diet line. **`npx playwright test e2e/m4-06-embodiment.spec.ts --workers=1` for BOTH projects, run SERIALLY, not concurrently** (§3.1: `--workers=1` is a correctness requirement, and the two projects must not be raced against each other) — quote pass counts for each. Adjacent: `e2e/m4-07-*` and `e2e/m4-08-*` at `--workers=1`, unmodified-green. **`npm run test:node-guards` is NOT owed** — this slice touches no `src/sim/`, `src/systems/` or `src/entities/`; say so explicitly rather than silently skipping it.

**No-op guard:** if you find yourself about to exit without changes, **WRITE WHY into your report first**.

**READY-FOR-GATES** + report: the before/after manufactured-censoring outputs verbatim (absent vs present `[m4-06-denied] driftAbs=` line) · the observed `driftAbs`/`gapClosed` values from the normal runs · confirmation that no bound moved and that `:409`–`:413` are untouched · anything adjacent you found and deliberately did not fix.
