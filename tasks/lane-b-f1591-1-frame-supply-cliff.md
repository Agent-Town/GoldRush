# Task f1591-1: F-1587-2 is a FRAME-SUPPLY defect — measure the clamp law and find the cliff (LANE-B, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome).** s1591, 2026-08-09.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b.

READ FIRST:
- `AGENTS.md`.
- `src/core/Loop.ts` — **the whole file, it is 159 lines.** It contains the line `const MAX_PRESENTATION_DELTA_SECONDS = 0.05;` — **grep for that exact span; if it returns 0 your lane is stale, STOP and report** (do not proceed, do not "fix" it). Also grep `this.update(this.frame.presentationDeltaSeconds);` — **expect 1, STOP if 0.**
- `e2e/beauty-town.spec.ts` — the subject test is at `:14`, `the day town boots with ground contact, wear and parcel dressing — and no night dressing`. Its wait is `saveEraLightShot` at `:243`. It contains the line `}, undefined, { timeout: 30_000 });` — **grep for it, expect 1, STOP if 0.**
- `reviews/f1590-1-dep-reoptimize-armed.md` — the s1590 drain that refuted the previous hypothesis and handed F-1590-2 forward. It contains the span `Dependency re-optimization is not the cause of the 41.8 s stall` — **grep for it, expect 1, STOP if 0.**
- `reviews/town-music.md` §Findings — where F-1587-2 was first recorded, with the original 41.8 s observation.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE: `git -C worktrees/lane-b status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

## Why (F-1591-1, derived from source at s1591 — the fourth attempt, and the first that knows the mechanism before running)

F-1587-2 has survived three attempts, all of which measured **how long the subject test took** and all of which found ~5.4–5.6 s against a single historical 41.8 s. The reason none of them could reproduce it is that **they were all measuring the wrong quantity.** The defect is not about the server's temperature. It is about **frame supply**, and the mechanism is derivable from source without running anything:

- `src/core/Loop.ts:27` — `const MAX_PRESENTATION_DELTA_SECONDS = 0.05;`
- `src/core/Loop.ts:116` — `presentationDeltaSeconds = Math.min(delta, MAX_PRESENTATION_DELTA_SECONDS)`
- `src/core/Loop.ts:121` — on the variable-step path, `this.update(this.frame.presentationDeltaSeconds);`
- `src/town/TownScene.ts:453` — `new Loop((delta) => this.update(delta), () => this.render())` is constructed **with no options**, so `stepSeconds = 0` and the town takes exactly that variable-step path.
- `src/town/TownScene.ts:679` — `this.elapsed += delta`, where `delta` is that clamped presentation delta.
- `e2e/beauty-town.spec.ts:244-247` — the wait is `waitForFunction(() => (town?.elapsed ?? 0) > 4)` with `{ timeout: 30_000 }`.

**Therefore `town.elapsed` gains AT MOST 0.05 s per presented frame, so `elapsed > 4` requires AT LEAST 81 presented frames, no matter how much wall time passes.** The consequences are quantitative and falsifiable:

| sustained frame rate | Δelapsed per frame | wall time the wait consumes | outcome |
|---|---|---|---|
| ≥ 20 fps (delta < 50 ms) | = real delta, unclamped | ≈ **4 s** | passes; sim runs at real time |
| ≤ 20 fps (delta ≥ 50 ms) | pinned at **0.05** | ≈ **81 / fps** seconds | sim runs at `fps × 0.05` of real time |
| **< 2.7 fps** | pinned at 0.05 | **> 30 s** | **TIMEOUT — the 41.8 s class** |

So there is a **cliff at ~2.7 fps sustained**, and above 20 fps the wait is insensitive to frame rate entirely — which is exactly why eight isolated repetitions across three tasks all landed in the same 4–6 s band and told nobody anything. **A pass is not evidence against this mechanism; only the RATIO is evidence.**

This subsumes F-1590-2 (handed forward by the s1590 drain) rather than replacing it: load-sensitivity is real, and this names the mechanism by which load becomes failure — a loaded battery depresses frame supply, and frame supply is what the wait actually spends. It is also consistent with F-1269-1's fire-shell CPU ceiling being the known manufacturer of timing reds in this shell.

⚠️ **This derivation is from reading source, not from measurement. That is precisely the epistemic state F-1589-4 was in before it was refuted — a mechanism that explains everything is not thereby true.** Your job is to measure it, and a refutation is a completely acceptable outcome.

📊 **The instrument already exists and needs NO spec edit.** `window.__GR_TOWN_DIAGNOSTICS__` publishes both counters live (`src/town/TownScene.ts:243-244` in the `TownDiagnostics` type, written at `:2537-2539`): `frame: number` and `elapsed: number`. Polling both gives you **Δelapsed / Δframe** directly, which is the whole prediction.

## Scope

1. **Build the probe.** Write `artifacts/f1591-1-frame-supply-cliff/probe.mjs`: a standalone Playwright script (NOT a spec under `e2e/`) that boots a page against a dev server on a scratch port, reproduces what the subject test does before its wait — seed profile, Enter Town — and then **polls `window.__GR_TOWN_DIAGNOSTICS__` about every 250 ms**, recording `(wallMs, frame, elapsed)` triples until `elapsed > 4` or 30 s elapses. You may **copy** `seedProfile` and `enterTown` logic out of `e2e/beauty-town.spec.ts` into your probe — reading and copying is allowed; **editing that spec is not.** The probe must assert the diagnostics object is defined and STOP loudly if it never appears: a probe that dies in your own stub is evidence about your stub, not about the game. Port law: `GR_CAPTURE_EXTERNAL_SERVER=1` + `GR_CAPTURE_BASE_URL=http://127.0.0.1:<port>` (5231 or 5234). **`PORT` sets nothing.**

2. **Arm 0 — the clamp law, unloaded, 3 repetitions.** Run the probe with no added load. For each: report mean and max **Δelapsed/Δframe**, achieved fps during the wait, and the wall time the wait consumed.
   **The prediction to check is `Δelapsed/Δframe ≤ 0.05, always`** — a single sample above 0.05 falsifies the derivation outright, and you should say so plainly if you see one. At healthy frame rates expect ≈ 0.0167 (60 fps) and a wait of ≈ 4 s.

3. **Arm A — graded load, the cliff hunt.** Repeat the probe while N synthetic CPU hogs run (`node -e "while(true){}"` × N, killed after each repetition — kill them by the pids YOU spawned, never by name). Use **N = 2, 4, 8, 16**, one repetition each, then **3 repetitions at whichever N first drove the wait past 15 s** (or at N=16 if none did).
   ⚙️ **ARM PROOF — a repetition counts as ARMED only if the measured mean frame interval during the wait exceeded 50 ms (fps < 20).** Below that threshold the clamp never engages and the run says nothing. If no N arms, report **COULD-NOT-ARM** and stop — do not report unarmed runs as null results. (This task's predecessor was given two levers that could not physically arm; that is why the arming criterion here is stated as an observable, not assumed.)
   For each repetition report: N, mean/max Δelapsed/Δframe, achieved fps, wall time of the wait, whether it timed out, and **the predicted wall time `81 / fps`** beside the measured one.

4. **Arm B — batch position, F-1590-2's own axis.** Run the subject test **as the 6th arm of a multi-arm battery** (the arrangement in which F-1589-3's defect appears and disappears) and, interleaved, **alone**, 2 repetitions each, using the real command:
   `npx playwright test e2e/beauty-town.spec.ts --project=desktop-chrome --workers=1 -g 'the day town boots with ground contact'`
   Report first-test duration and rc for each. This answers whether the factory's **real** arrangement reaches the cliff, which is the question that matters for gate reliability. If you cannot construct a 6-arm battery inside the time you have, say so and report Arm B as NOT RUN — an honest gap beats a fabricated arrangement.

5. **Rule on the mechanism in writing.**
   - **CONFIRMED** = Δelapsed/Δframe is capped at 0.05 as predicted, AND load can drive the wait's wall time up in step with `81/fps`, AND enough load crosses 30 s.
   - **PARTIALLY CONFIRMED** = the clamp law holds but no achievable load reaches the cliff on this machine. Say so — that bounds the defect to heavier load than a fire can generate, which is itself a result.
   - **REFUTED** = Δelapsed/Δframe exceeds 0.05, or the wait's wall time does not track `81/fps` under armed load. Report it as plainly as the s1590 drain reported its own refutation.

6. **Write `reviews/f1591-1-frame-supply-cliff.md`**: the verdict line, the Arm 0 / Arm A / Arm B tables with predicted-vs-measured columns, the arm proof per Arm A repetition, and an explicit statement of what the evidence does and does not support.

🚫 **SHIP NO CURE. This task measures; it does not fix.** If it confirms, the cure is a design question with at least three candidate answers (wait on frame COUNT rather than sim time; drive the loop deterministically — note `Loop.advanceFrame` exists at `src/core/Loop.ts:101` and its own comment says *"debug gates use this after stop()"*; or budget that one wait in frames with a named cause). **Choosing between them is the next author's call, not yours** — three predecessors were right to refuse a cure on an unconfirmed cause, and this task's value is the measurement.

If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

## Firewall

Touch ONLY: `reviews/f1591-1-frame-supply-cliff.md` and `artifacts/f1591-1-frame-supply-cliff/**`.

NO changes to: `e2e/beauty-town.spec.ts` or any other spec (**raising that 30 s timeout is specifically forbidden — it hides a harness artefact inside a gameplay assertion's budget, F-1275-1 — and this task is the one that finally explains what that budget is actually buying**); `src/core/Loop.ts` and `src/town/TownScene.ts` (**you are measuring them, not tuning them; changing `MAX_PRESENTATION_DELTA_SECONDS` would alter sim behaviour for every scene in the game**); `playwright.config.ts` (**and in particular do not touch `workers` — the fire-shell serialisation there is load-bearing, F-1270-3, and guarded**); `scripts/**`; `package.json` / `package-lock.json`; other tasks' fresh work.

## Self-check (evidence, not vibes)

- `npm run build` green (pre-flight, before anything).
- `git status --short` shows nothing outside the TOUCH-ONLY paths.
- Every run's raw output written under `artifacts/f1591-1-frame-supply-cliff/`, including the poll traces, not just the summaries.
- All spawned load processes confirmed dead at the end (`ps` line in the report).
- **No executable byte changed**, so state "tsc/build/suites provably unaffected" rather than claiming suites you did not run — the drain checks the diff, not the claim. `test:node-guards` is **not** owed: no `src/sim/`, `src/systems/` or `src/entities/` path is in scope (F-1460-1).

End: READY-FOR-GATES + report: the Arm 0 clamp numbers; the arm proof and predicted-vs-measured table for Arm A; the Arm B result or an honest NOT RUN; and the item-5 ruling.
