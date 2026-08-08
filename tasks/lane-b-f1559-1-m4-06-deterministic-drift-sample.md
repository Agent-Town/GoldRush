# Task f1559-1: sample the denied-receipt drift after a fixed number of SIM STEPS, not 350 ms of wall clock (LANE-B, commit prefix "test:")

**FIRE-AUTHORED (attended review welcome)** — s1559, 2026-08-08.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

READ FIRST: `AGENTS.md`; `reviews/f1558-1-m4-06-denied-lastline-race.md` (the slice that just merged into
this same test); `artifacts/f1557-3-m4-06-denied/distribution.txt` (the quantisation evidence you are
acting on); `tasks/BACKLOG.md` rows **F-1559-1**, **F-1559-2** and **F-1285-2**.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE: `git -C worktrees/lane-b status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

## Why (F-1559-1, s1559 2026-08-08 — measured, not reasoned)

`e2e/m4-06-embodiment.spec.ts:395` **("permission-denied receipts do not send the Prospector to the
denied target")** samples the Prospector's position after `await page.waitForTimeout(350)` (`:409`)
and asserts two numeric bounds on the result (`:420` `gapClosed < 0.45`, `:422` `driftAbs < 0.6`).

**That sample is load-dependent, and it has cost the factory 274 fires of argument:**

- **F-1285-2** (s1285) recorded a red at `driftAbs = 0.4846` against a then-`0.45` bound and framed it
  as *"a 7.7% tolerance miss"*, proposing the bound be re-derived.
- **s1557** ran that finding's gate on an idle machine and still got **1 failure in 15** at
  `driftAbs = 0.4757520362541813`.
- **s1558** measured **0 failures in 160** on the merged tree, max `driftAbs = 0.3529334214834294`.

✓ **VERIFIED s1559 by reading it on main** — `e2e/m4-06-embodiment.spec.ts:395` ("permission-denied receipts do not send the Prospector to the denied target") — no merge between those
measurements changed the `panAt → wait → sample` path, so all three describe the **same arrangement** —
and **1/15 against 0/160 is a statistical impossibility** (P ≈ 1.6 × 10⁻⁵). Both fires read the quantity
as continuous. **It is not.** In `artifacts/f1557-3-m4-06-denied/distribution.txt` every reading is one
of a few **bit-identical repeated doubles** (`0.2833831328784402`, `0.3529334214834294`). A continuous
timing jitter cannot produce bit-identical repeats; **a deterministic sim sampled after a whole number of
fixed timesteps can.** So the variable is *how many sim steps land inside the 350 ms wall-clock window*,
the readings are that count's discrete image, and `0.45` sits in the **gap** between the common quanta
and s1557's outlier.

➡️ **A quantised variable has no tolerance to tune** — there is no headroom between quanta to buy. The
cure is to stop sampling on wall clock.

✓ **The harness already exists and is house practice — VERIFIED s1559, do not build a new one:**
`window.__GR_TEST__.advanceSim(seconds, onTick?)` is wired at `src/game/Game.ts` (search
`advanceSim: (seconds: number`) and implemented as `advanceSimForTest` at `src/game/Game.ts:6823`, whose
second line computes `const ticks = Math.round(total / FIXED_SIM_STEP_SECONDS)` — **a deterministic tick
count**. It is already used by ~10 e2e specs including `e2e/054-baron-epic.spec.ts` and
`e2e/sim-fixed-step.spec.ts`.

## Scope

1. In `e2e/m4-06-embodiment.spec.ts`, in the test **"permission-denied receipts do not send the
   Prospector to the denied target"**, replace the wall-clock wait at `:409`
   (`await page.waitForTimeout(350);`) with a deterministic sim advance of the **same nominal sim time**
   via `window.__GR_TEST__.advanceSim(...)`, evaluated in the page. Leave the `before`/`immediate`
   captures, the receipt assertion, the boot URL and every other assertion **exactly as they are**.
2. **STOP-AND-REPORT if `window.__GR_TEST__` or `advanceSim` is undefined under this test's boot mode**
   (`?debug&timescale=4&nowaves&nolevel&seed=m4-06-denied`). Do NOT work around it by restoring the
   wall-clock wait, and do NOT change the boot URL to make it appear — either would silently return the
   test to the load-dependent arrangement this task exists to remove. Report what was undefined.
3. **Measure the result and write it to `artifacts/f1559-1-m4-06-deterministic-drift/samples.txt`**:
   run the denied test `--repeat-each=30 --workers=1` on **both** `--project=desktop-chrome` and
   `--project=mobile-chrome` (60 samples total) and record every `[m4-06-denied] driftAbs=… gapClosed=…`
   line the test already logs at `:413`. Report the **distinct value count** for `driftAbs`.
4. **Re-derive the two bounds from the measured distribution and update the evidence comment at
   `:418-:419`** so it cites this task's artifact instead of the superseded
   `artifacts/f1557-3-m4-06-denied/distribution.txt`. If `driftAbs` is now **single-valued**, set each
   bound to a stated margin above that value and say in your report what margin you chose and why.
5. **Report whether the quantisation model held**: did the readings collapse to one value (model
   confirmed) or remain multi-valued (model wrong)?

## Forbidden greens (any of these = STOP, report, change nothing)

- ⛔ **Widening `0.45` — or any bound — to make a red disappear.** The number encodes *"the Prospector
  did not walk to the denied target"*. If the deterministic sample lands **above** the current bounds,
  that is a **finding**, not a tolerance problem: it means the stepped and wall-clock arrangements are
  not equivalent, which is exactly what this task is measuring. STOP and report the value.
- ⛔ **Restoring `waitForTimeout` anywhere in this test**, in any guise (including a "short safety wait"
  before or after the advance).
- ⛔ **Re-asserting `after.lastLine`.** The comment at `:423-:424` records why it was deleted one merge
  ago (F-1558-1: the idle-survey bark overwrites it after 19 s). Leave that comment intact.
- ⛔ **Touching `src/**`.** The harness you need already exists; if it does not do what this task claims,
  that is scope item 2's STOP, not a licence to edit the product.

## Firewall

**Touch ONLY:** `e2e/m4-06-embodiment.spec.ts` (the denied test only) and
`artifacts/f1559-1-m4-06-deterministic-drift/**` (new).

**NO changes to:** `src/**` (in particular `src/game/Game.ts`, `src/agent/Embodiment.ts`,
`src/agent/Voice.ts`) · any other test in `e2e/m4-06-embodiment.spec.ts` · any other spec file ·
`scripts/**` · `playwright.config.ts` · `tasks/**` · `specs/**` · sim semantics of any kind.

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` rc=0 and `npm run build` green.
- `e2e/m4-06-embodiment.spec.ts` green **desktop-chrome AND mobile-chrome**, `--workers=1`.
- Adjacent unmodified-green both projects: `e2e/m4-07-prospector-panel.spec.ts`,
  `e2e/m4-08-agent-attribution.spec.ts`.
- Zero console/page errors (the test already asserts this at its last two lines).
- `artifacts/f1559-1-m4-06-deterministic-drift/samples.txt` exists and holds all **60** sample lines.
- No screenshots or perf table required: **nothing in this diff renders.**

**If you find yourself about to exit without changes, WRITE WHY into your report first** — a silent
no-op wastes a queue slot and a gate.

End: **READY-FOR-GATES** + report (a) the distinct `driftAbs` value count across the 60 samples,
(b) whether the quantisation model held, (c) the margin you chose for each re-derived bound and why,
(d) anything you adapted and why.
