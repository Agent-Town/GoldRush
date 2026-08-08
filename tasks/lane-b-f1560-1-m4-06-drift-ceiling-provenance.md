# Task f1560-1: prove or refute the drift CEILING with a two-window experiment, then name the constants it depends on (LANE-B, commit prefix "test:")

**FIRE-AUTHORED (attended review welcome)** — s1560, 2026-08-08.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

READ FIRST: `AGENTS.md`; `reviews/f1559-1-m4-06-deterministic-drift-sample.md` (the drain that produced this task — read F-1560-1 and F-1560-2 in it); `artifacts/f1559-1-m4-06-deterministic-drift/samples.txt` (the 60 samples you are extending); `e2e/m4-06-embodiment.spec.ts:395` ("permission-denied receipts do not send the Prospector to the denied target").

**SEQUENCING LAW:** this task depends on f1559-1 having merged. Verify with
`git log --oneline | grep -q 'deterministic denied-receipt drift sample'` — search the WHOLE log, not `git log -N`.
If it is absent: **STOP and report "f1559-1 not landed"**. Do not improvise the dependency.
Then confirm the arrangement you are measuring is the merged one:
`grep -c 'expect(driftAbs).toBeLessThan(0.4);' e2e/m4-06-embodiment.spec.ts` must print **1**.
If it prints 0, the lane is stale — **STOP and report "lane stale, expected the merged f1559-1 arrangement"**.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE: `git -C worktrees/lane-b status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

## Why (F-1560-1 + F-1560-2, s1560 drain of f1559-1, 2026-08-08)

f1559-1 replaced a 350 ms wall-clock wait with `advanceSim(0.35)` and banked 60 samples. Its premise —
that `driftAbs` is **quantised** and would collapse to one value — was **refuted by its own evidence**:
**10 distinct values across 60 samples**, the runner's summary printing
`quantisation model: readings remained multi-valued; model not confirmed`.

✓ **VERIFIED by reading the product** (not by re-running the test): a denied receipt leaves the Prospector
**idle**, and an idle Prospector chases a **time-dependent** anchor:

- `src/agent/Embodiment.ts:299` — idle anchor is `hero.x - 1.8 + Math.sin(at * 0.78) * 0.22`
- `src/agent/Embodiment.ts:292` — step is `Math.min(distance, Balance.agent.moveSpeed * 0.58 * delta)`
- `src/agent/Embodiment.ts:288` — drifts only while `distance > 0.06`
- `src/game/Balance.ts:250` — `moveSpeed: 4.8`

The arithmetic says the reading is **gap-limited, not speed-limited**: `advanceSim(0.35)` runs
`Math.round(0.35 / (1/30)) = 11` ticks = 0.3667 s; the idle speed cap `4.8 × 0.58 = 2.784` u/s gives a window
budget of **1.021 units**, while the observed max is **0.372 — 36% of budget**.

**That model is an INFERENCE and this task exists to test it.** The max value `0.3722002149381437` occurs
**27 of 60 times, bit-identical**, which looks like a **saturation ceiling** (the agent closes its gap and
stops) rather than a distribution tail. If that is right, the shipped `< 0.4` bound is geometric and sound.
If it is wrong — if the ceiling is really set by the window length — then `< 0.4` is a **window artefact**
with 6.9% of margin, and F-1560-2's whole justification for accepting the narrowing collapses.

**One experiment separates them, and it is cheap.**

## Scope

1. **ARM A (control, the shipped arrangement).** With `e2e/m4-06-embodiment.spec.ts` exactly as it is on
   main, run the denied-receipt test **20× per project**:
   `npx playwright test e2e/m4-06-embodiment.spec.ts --grep 'permission-denied receipts' --project=desktop-chrome --repeat-each=20 --workers=1`
   and the same for `--project=mobile-chrome`. Capture every `[m4-06-denied] driftAbs=… gapClosed=…` line.

2. **ARM B (the discriminating arm).** Temporarily change **only** the number inside `advanceSim` at
   `e2e/m4-06-embodiment.spec.ts:409` from `0.35` to `1.05` (a 3× window). Change nothing else — not one
   assertion, not one bound. Re-run both projects exactly as in scope 1, 20× each.
   ⚠️ **Arm B is expected to FAIL its assertions** if drift grows; that is data, not a defect. Record the
   readings **whether the test passes or fails** — use the printed `driftAbs` lines, which are emitted
   before any assertion. If a run aborts before printing, say so and report how many samples you actually got.

3. **RESTORE.** Put `e2e/m4-06-embodiment.spec.ts:409` ("permission-denied receipts do not send the Prospector to the denied target") back to `advanceSim(0.35)`. This is verifiable and it
   will be verified: after scope 5, `git diff main -- e2e/m4-06-embodiment.spec.ts` must show **no changed
   line containing `expect(` and no changed line containing `advanceSim`** — comment lines only.

4. **VERDICT against a prediction stated in advance** (so the result is falsifiable rather than narrated).
   Write `artifacts/f1560-1-drift-ceiling/samples.txt` containing: both arms' full sample lines, the per-arm
   **distinct-value count**, and the per-arm **max `driftAbs`**. Then state the verdict:
   - **CEILING CONFIRMED (geometric)** if `max_B ≤ max_A + 0.10` — tripling the window did not materially
     raise the maximum, i.e. the agent had already arrived and stopped.
   - ⛔ **CEILING REFUTED (window-limited)** if `max_B > max_A + 0.30`. **This is a STOP:** report it as a
     finding, change **no** bound, and do not attempt a cure. It would mean the shipped `< 0.4` is a window
     artefact and that F-1560-2 must be re-verdicted by the next fire.
   - **INCONCLUSIVE** if `max_B` lands between those two — report it plainly as inconclusive with both
     numbers. Do not round it into whichever verdict looks tidier.

5. **THE F-1560-2 CURE (comment-only).** At `e2e/m4-06-embodiment.spec.ts:418` ("permission-denied receipts do not send the Prospector to the denied target")–`:422`, replace the comment
   block so that it names **what the ceiling actually depends on**, not just a sample max. It must name:
   `Balance.agent.moveSpeed` (4.8), the `0.58` idle multiplier and the `-1.8` follow offset and
   `±0.22 / 0.78 Hz` oscillation (all `src/agent/Embodiment.ts:288`–`:299`), and it must state that
   **changing any of them moves this bound**. Also reconcile the line at `:421` — it currently reads
   *"Loose absolute-drift sanity bound, not the permission rule"* while the bound below it is now `0.4`,
   **equal to** the permission bound, which that sentence no longer describes. Cite your own new artifact
   for the two-arm evidence.
   ⛔ **Change no numeric value in any `expect(...)` call.** Widening or narrowing a bound is a STOP.

## Firewall

**Touch ONLY:** `e2e/m4-06-embodiment.spec.ts` (comments in the final state; the `advanceSim` number
temporarily during scope 2, restored in scope 3) · `artifacts/f1560-1-drift-ceiling/samples.txt` (new).

**NO changes to:** `src/**` — **anything you find in the Prospector's drift behaviour is REPORTED, never
fixed here**; a test-provenance slice that starts editing the agent is how a flake becomes a regression ·
any numeric argument to `expect(...)` in any spec · `e2e/**` other than the one file · `scripts/**` ·
`tasks/**` · `specs/**` · sim semantics · other tasks' fresh work · the existing assertion ORDER (f1557-3
earned it) · `after.lastLine` must NOT be re-asserted (f1558-1 deleted it deliberately) ·
`waitForTimeout` must NOT return in any guise.

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` rc=0 · `npm run build` green.
- `e2e/m4-06-embodiment.spec.ts` green **desktop-chrome AND mobile-chrome**, `--workers=1`, in its FINAL
  (restored + re-commented) state — 9 passed each.
- Adjacent unmodified-green both projects, by name: `e2e/m4-05-agent-closeout.spec.ts`,
  `e2e/m4-07-prospector-panel.spec.ts`, `e2e/m4-08-agent-attribution.spec.ts`.
- Zero console/page errors (the spec's own `expect(errors.consoleErrors).toEqual([])` covers this — say so).
- `artifacts/f1560-1-drift-ceiling/samples.txt` exists and holds **all 80 sample lines** (2 arms × 2 projects
  × 20), or an honest count with the reason if any arm produced fewer.
- **Restoration proof:** paste the output of `git diff main -- e2e/m4-06-embodiment.spec.ts` — every changed
  line must be a comment.
- **All playwright commands pass `--workers=1`** (§3.1 — a fire-shell correctness requirement, and the lane
  should match the arrangement being compared).

**If you find yourself about to exit without changes, WRITE WHY into your report first** — a silent no-op
wastes a queue slot and a gate.

End: **READY-FOR-GATES** + report: (a) `max_A` and `max_B` with their distinct-value counts, (b) the scope-4
verdict verbatim (CONFIRMED / REFUTED / INCONCLUSIVE) with both numbers, (c) whether arm B's assertions
passed or failed and at which line, (d) the restoration diff, (e) anything you noticed about the
Prospector's drift that you were forbidden to fix.
