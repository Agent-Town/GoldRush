# Task f1577-3: pin the start phase and separate the two axes, so the determinism cure knows where to land (LANE-C, commit prefix "test:")

**FIRE-AUTHORED (attended review welcome)** — s1577, from **F-1577-3**, filed by the drain gate that merged f1575-1 (`7fbcd423d3fc818c8e651f708e292d1b7a7b9d65`). F-1575-1 is answered: the m4-06 denied-receipt window is a **race**, verdict (A) CONFIRMED. This task is the measurement that must happen **before** anyone acts on that answer, because the recommended cure is currently under-specified in a way that can make the suite permanently red.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c`.

READ FIRST: `AGENTS.md`; `tasks/BACKLOG.md` rows **F-1577-3** (top of file — the finding this task exists to settle) and **F-1575-1** (now closed, with the answer and the regime table); `reviews/f1575-1-m4-06-drift-tick-budget.md` — **both the runner report AND the `DRAIN GATE — s1577` section at the end, which contains the oscillation curve and the breach this task is about**; `e2e/f1575-1-drift-tick-budget.spec.ts` (the whole file, 58 lines); `e2e/m4-06-embodiment.spec.ts` — the `companion()` helper (~`:78`) and the denied-receipt test (~`:404`).

**Pre-flight (LANE-SAFETY, runner-auto-commit aware):** the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/c main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP**, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-c status --short` → must be clean, with the **FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

✓ **MEASURED AT AUTHORING (s1577, `node scripts/lane-usable.mjs --all`): `lane-c lane/c ahead=0 behind=11 paths=0 tracked-dirt=0 untracked=0 → USABLE`** — the lane holds nothing main has not absorbed (its f1575-1 output was merged by this same fire), so a reset is provably lossless.

**SEQUENCING / CITATION CHECK (F-1424-3 — run ALL THREE after the reset, before any edit).** Each key is a single line, verified by me to print `1` on main at dispatch (F-1425-2 — a key spanning a line break matches nowhere, including in the file it was copied from):

```sh
grep -c "test('maps denied-receipt drift against the actual simulation tick'" e2e/f1575-1-drift-tick-budget.spec.ts
grep -c 'export const MAX_FIXED_STEPS_PER_FRAME = 5;' src/core/Loop.ts
grep -c 'tickBefore=' e2e/m4-06-embodiment.spec.ts
```

All three must print `1`. **If any prints `0`, STOP and report "lane drifted or predecessor absent" — do NOT improvise.** Keys 1 and 3 prove the lane carries the merged f1575-1 instrument you are extending; key 2 proves the presentation constant this task's central trap depends on.

## Why (F-1577-3, s1577, from measurements taken on the merged tree)

F-1575-1's answer names the cure: *"make the whole `before`→`after` window deterministic."* ⛔ **That cure, as stated, can convert a ~2.4% flake into a 100% red, and nothing currently stops someone implementing it that way.**

✓ **MEASURED at the f1575-1 drain gate (desktop, merged tree), and this is the whole reason for this task** — `driftAbs` is **not monotonic in tick count**. It rises, peaks, decays almost to zero, and rises again:

| tickDelta | 34 | 41 | 45–58 | 62 | 69 | 82–89 | 105 | 119 |
|---|---|---|---|---|---|---|---|---|
| driftAbs | 0.277 | 0.395 | **0.459 (peak)** | 0.397 | 0.275 | 0.142 | **0.008** | 0.215 |

➡️ **So the breach region is a BAND (≈41–62 ticks), not a threshold.** A determinism cure that happens to pin the window at ~45 ticks breaches **every single run**; one that pins it past ~69 passes with large margin. **The cure needs a named target tick count, and no one has the evidence to name one.** Producing that evidence is this task.

⚠️ **AND THE SECOND AXIS, which f1575-1 could not see because it was not looking for it.** The drain gate caught the ladder's **first instrumented breach** — `driftAbs=0.4308236298069081 tickBefore=47 tickAfter=82 tickDelta=35` — and then **five isolated repeats of the same test on the same tree at `tickDelta` 32/34/34/34/37 stayed clean** (`driftAbs` 0.021–0.311). **Window length alone does not predict the breach.** The breaching run's distinguishing feature was its **start phase**: `tickBefore=47` against 33–41 for every clean run. **Both axes are load-dependent; only the window was ever hypothesised.** Every sample in the ladder's ~123 observations confounds the two.

🔑 **THE HARNESS IS CONSTRUCTIBLE WITHOUT TOUCHING `src/**`, ✓ VERIFIED BY READING THE CODE AT AUTHORING.** Phase can be pinned deterministically **inside a single `page.evaluate`**: JS is single-threaded, so no rAF frame — and therefore no unrequested sim tick — can occur between statements of one evaluate. Read `simulation.tick`, compute the shortfall to your target, and call `advanceSim(shortfall / 30)` **in the same evaluate**. `FIXED_SIM_STEP_SECONDS = 1/30` (`src/core/Loop.ts:1`) and `advanceSimForTest` runs exactly `Math.round(seconds / (1/30))` steps (`src/game/Game.ts:6825`).

⛔ **THE TRAP THIS TASK EXISTS TO NOT FALL INTO — READ THIS TWICE.** `advanceSim` accepts an `onTick` callback (`src/game/Game.ts:1853`, fired per fixed step at `:6848`), and sampling position from inside it is the obvious "zero round trips" idea. **It is wrong, and it fails in a way that looks like a physics result.** ✓ VERIFIED: `window.__THREE_GAME_DIAGNOSTICS__` is assigned only in `publishDiagnostics()` (`src/game/Game.ts:4575`), which is called from `updatePresentation()` (`:2813`) — i.e. **per presentation frame, not per sim step** — while `advanceSimForTest` flushes presentation only every `MAX_FIXED_STEPS_PER_FRAME = 5` ticks (`src/core/Loop.ts:2`, flushed at `Game.ts:6861` and once at `:6863`). ➡️ **Sampling `diagnostics.agent.embodiment.position` inside `onTick` therefore yields a 5-TICK STAIRCASE**: five identical positions, then a jump. **If you see that, it is the instrument, NOT the Prospector.** Do not report a staircase as a finding about motion. **Sample by making one `advanceSim` call per sample instead** — each call ends with `presentPendingSteps()`, so each one flushes presentation and refreshes diagnostics. That is what the existing f1575-1 sweep does, and it is correct.

## Scope

1. **Extend the EXISTING spec — do not create a new file.** Add your work as additional `test(...)` blocks in `e2e/f1575-1-drift-tick-budget.spec.ts`. ⛔ **Do NOT create `e2e/f1577-3-*.spec.ts`.** Reason, and it is a measured one (**F-1577-1**): `playwright.config.ts:46` is `testDir: './e2e'` with no `testMatch`, so **every** `e2e/*.spec.ts` is auto-collected into the standing suites — a new file is a permanent standing cost that `package.json` cannot control. Keep your additions under **~20 s per project** total and state the measured cost in your report. ⛔ **Do NOT modify the existing test at `:19`** (`'maps denied-receipt drift against the actual simulation tick'`) — it is banked f1575-1 evidence.

2. **Build the phase-pinned sampler.** Reach the same arrangement the ladder uses (`?debug&timescale=4&nowaves&nolevel&seed=m4-06-denied`, `panAt` the active node, permission denied), then — **in ONE `page.evaluate`** — read the current tick, advance the shortfall to a target start tick `P`, and capture `before` (position + tick). Assert the achieved `tickBefore` **equals** `P`; if it cannot be hit exactly, report the miss rather than silently accepting it. Then sweep the window by repeated single-tick `advanceSim(1/30)` calls, recording `(tickBefore, tickDelta, driftAbs, gapClosed)` per sample.

3. **Separate the axes — this is the deliverable.** Run the sweep at **at least four start phases** `P` spanning the observed range, which must include **P=35 and P=47** (the clean-run centre and the breaching run's phase, both from the drain gate), and sweep each to **at least tickDelta 70** so the full band and its far side are covered. **3 runs per project, both projects, `--workers=1`, serial.** Bank raw samples to `artifacts/f1577-3-fixed-phase-sweep/<project>-P<NN>-run-NN.txt`.

4. **Answer the question the cure needs, in these words or better.** State:
   - **the breach band at each start phase** — the `tickDelta` range where `driftAbs >= 0.4`, or that there is none;
   - **whether the band MOVES with start phase** (if it does, phase is a genuine second axis and the cure must pin BOTH; if it does not, the drain gate's five clean runs need another explanation and you should say so plainly);
   - **a NAMED RECOMMENDED TARGET**: the single `(start phase, window)` pair whose worst-case `driftAbs` across all your runs has the **largest margin below 0.4**, quoted with that margin.
   ⚠️ **A recommendation without a margin number is not a recommendation.** If no pair clears 0.4 with margin at every phase, **say so** — that is a legitimate and important outcome meaning the assertion needs rethinking rather than re-timing.

5. **No-op and honesty guards.** Any run producing `driftAbs >= 0.4` is data: **quote it in full, never re-run it away, never exclude it as an outlier.** If the phase pin proves unreachable (item 2's assertion cannot be made to hold), **STOP and report** with the evidence — do not fall back to an unpinned sweep and present it as pinned.

## Firewall

**Touch ONLY:** `e2e/f1575-1-drift-tick-budget.spec.ts` (**additive only** — new `test(...)` blocks and any new helpers; the existing test at `:19` unchanged) · `artifacts/f1577-3-fixed-phase-sweep/**` (new) · `reviews/f1577-3-fixed-phase-drift-sweep.md` (new, your report).

**NO changes to:** ⛔ **any `expect(...)` in `e2e/m4-06-embodiment.spec.ts`, and above all the `0.4` bounds and the `0.45`** — this task produces the evidence a re-pin would need, so **re-pinning inside it is a task failure even if it greens the suite** (F-1441-3) · **`e2e/m4-06-embodiment.spec.ts` at all** · any `src/**` — the tick counter, `timeAlive` and `advanceSim` are all already exposed; **if you believe a src change is required, STOP and report rather than making one** · `src/sim/`, `src/systems/`, `src/entities/` · `package.json` · `playwright.config.ts` · `.gitignore` · `scripts/**` · `tasks/**` · `tasks/goals.json` · `tasks/BACKLOG.md` · `STATUS.md` · `CLAUDE.md` · `scripts/fire.md` · `.claude/skills/**` · any other `e2e/*.spec.ts`.

🔓 **No firewall lift is granted.** If you find an adjacent defect, **report it in your review file — do not fix it** (CLAUDE.md §4.5).

## Self-check (evidence, not vibes)

`npx tsc --noEmit` rc=0. `npm run build` green — quote the Vite time and the asset-diet line. **`e2e/f1575-1-drift-tick-budget.spec.ts` green on both projects** at `--workers=1`, run serially — quote the `N passed` line and rc for every invocation, and **do not censor a red**. Confirm the pre-existing test at `:19` still passes unmodified. Boot probe: **zero console errors, zero page errors**, asserted in-spec, desktop and 390 px mobile.

**Adjacent, and it is the one that matters:** `e2e/m4-06-embodiment.spec.ts:404` (`'permission-denied receipts do not send the Prospector to the denied target'`) — run the **whole m4-06 file** on both projects, unmodified-green. ⚠️ **This test is a known ~2.4% flake and you are not expected to launder it:** if its denied-drift assertion breaches, **bank the full `[m4-06-denied]` line including `tickBefore`/`tickDelta` and report it as data** — with the counter now merged, every breach is evidence, and F-1577-2 records the first one. A breach here does **not** fail your slice; concealing one does.

`npm run test:node-guards` is **NOT owed** — F-1460-1's trigger is `src/sim/`, `src/systems/` or `src/entities/` and this diff touches none of them (`e2e/**` + `artifacts/**` + `reviews/**` only). Do not run it; it costs ~181 s and would contend with the fire's batteries (s1536 lost ~19 min to exactly that).

Screenshots are **not** owed — this slice renders nothing new; say so explicitly rather than silently skipping.

**No-op guard:** if you find yourself about to exit without changes, **WRITE WHY into your report first** (Mistake #1).

**READY-FOR-GATES** + report: the breach band at each start phase · whether the band moves with phase · **your NAMED recommended `(start phase, window)` target with its measured worst-case margin below 0.4** · the measured standing-suite cost your additions add, per project · confirmation that the `:19` test is byte-unchanged and green · any breach observed, quoted in full and never re-run away · anything adjacent you found and deliberately did not fix.
