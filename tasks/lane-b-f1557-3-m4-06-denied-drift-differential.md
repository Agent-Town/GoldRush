# Task f1557-3: make the permission-denied drift assertion measure the rule it is named for (LANE-B, commit prefix "test:")

**FIRE-AUTHORED (attended review welcome)** — authored s1557 from F-1285-2 plus a fresh 15-sample idle re-measure taken by the authoring fire (see Why).

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

READ FIRST: `AGENTS.md`; `e2e/m4-06-embodiment.spec.ts` (the whole file — you are editing ONE test in it); the F-1285-2 and F-1557-3 rows in `tasks/BACKLOG.md`.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded. ⚠️ The trap this closes: a run that STOPPED still ran playwright and still regenerated screenshots, so a stopped predecessor leaves tracked dirt that freezes its successor — three consecutive masters (gazette-welcome-drift-observation-frame v1/v2, newsie-drift-shell-divergence-rate) died before measuring anything, the third killed by the exhaust of the first two.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE, WHICH THE LANE TEMPLATE OWED AND DID NOT CARRY UNTIL s1505 (F-1505-1): `git -C worktrees/lane-b status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

**SEQUENCING:** none. This edits one test body and no shipped code. Do NOT gate on any other slice.

## Why (F-1285-2, s1285; re-measured idle by the s1557 fire, 2026-08-08)

F-1285-2 has sat open since s1285 with the gate **"re-run both arms idle"**. s1557 ran the merged arm on a genuinely idle board (no batteries, no playwright, no lane runners; the only resident `codex exec` was a foreign project at 0.0–0.4% CPU) and measured, at `--workers=1`, mobile-chrome:

- batch 1: `--repeat-each=5` → **5 passed** (16.9 s)
- batch 2: `--repeat-each=10` → **9 passed, 1 failed** (34.8 s)
- **idle total: 14/15 pass, 1/15 fail.** The failure value was `Received: 0.4757520362541813` against `Expected: < 0.45`.

Compare s1285's loaded measurement: merged tree **4/5 failed**, control on `0b87c662 (archive: pruned by the A3 rewrite)` **5/5 failed**.

⇒ **The quantity STRADDLES the threshold.** Load is a strong amplifier (80% → ~7%) but is NOT the cause: the assertion is reachable on an idle machine. F-1285-2's gate offered only two outcomes — *"Green when idle ⇒ load ceiling"* or *"red ⇒ instrument finding"* — and the truth is a third the row did not anticipate.

🔑 **THE ACTUAL DEFECT, verified by reading `e2e/m4-06-embodiment.spec.ts:395`–`:417` on main.** The test is named *"permission-denied receipts do not send the Prospector to the denied target"*, and that rule is encoded by three assertions:

- `:411` `expect(after.moving).toBe(false)` — it is not walking anywhere
- `:412` `expect(distance(after.target, before.target)).toBeLessThan(0.01)` — it did not retarget
- `:413` `expect(distance(after.target, node!.position)).toBeGreaterThan(0.5)` — its target is NOT the denied node

The flaky line, `:410` `expect(distance(after.position, before.position)).toBeLessThan(0.45)`, encodes something weaker and different: *"it did not drift much"* — an **undirected** magnitude, over 350 ms of wall time at `?timescale=4` (≈1.4 s of sim), which idle wander alone can push past 0.45. ⚠️ **And it runs FIRST**, so when this test fails it fails **without ever evaluating the three assertions that prove the property it is named for.** The weakest proxy pre-empts the real rule.

⛔ **F-1285-2 says "Do NOT widen the 0.45 tolerance until that question is answered", on the stated ground that "the number encodes *the Prospector did not walk to the denied target*". That ground is now measured FALSE — `:413` encodes that; `:410` encodes undirected drift.** The prohibition was protecting the wrong line. **This task still does not widen it by fiat**: it replaces it with a *directional* measurement of the same rule and derives every threshold from an archived distribution.

## Scope

1. **Instrument before you change any assertion.** In the `permission-denied receipts …` test only, after `const after = await companion(page);` (`:408`), compute both metrics and emit ONE structured line **before any `expect`**, so that even a failing repeat contributes a sample:
   - `driftAbs = distance(after.position, before.position)` (what `:410` measures today)
   - `gapClosed = distance(before.position, node!.position) - distance(after.position, node!.position)` (positive = it moved TOWARD the denied node; this is the directional form of the rule)
   - line shape exactly: `[m4-06-denied] driftAbs=<n> gapClosed=<n>`
2. **Measure the distribution.** With the line in place and assertions untouched, run `--repeat-each=30 --workers=1` for **both** `--project=mobile-chrome` and `--project=desktop-chrome`. Collect every emitted line. Write `artifacts/f1557-3-m4-06-denied/distribution.txt` containing all raw samples plus, per project, **min / median / max for both metrics** and the observed pass count. This file is the justification for every number in item 4 — it must exist before you pick a threshold.
3. **Assert the rule before the proxy.** Reorder so `:411`, `:412`, `:413` (moving / target-unchanged / target-not-the-node) run FIRST, and any drift assertion runs after them. Do not alter their comparands or tolerances.
4. **Replace the magic number with the directional assertion.** Remove `expect(distance(after.position, before.position)).toBeLessThan(0.45)` and assert instead that the Prospector did not close the gap to the denied node: `expect(gapClosed).toBeLessThan(<threshold>)`. Retain an absolute drift **sanity bound** `expect(driftAbs).toBeLessThan(<bound>)` — clearly commented as a loose sanity bound, NOT the rule. Both numbers must be derived from item 2's measured maxima with a stated margin, and a comment above them must cite `artifacts/f1557-3-m4-06-denied/distribution.txt` and give the measured max each was derived from.
   ⛔ **You may NOT delete an assertion, weaken `:411`–`:413`, or set a bound so loose it cannot fail** — if your measured `gapClosed` max is at or above what you would need to assert for the test to mean anything, STOP and report the numbers instead of choosing one.
5. **Prove the flake is gone.** Re-run the amended test `--repeat-each=15 --workers=1` on **both** projects and report the pass counts. Target 15/15 on each. If any repeat still fails, report the metric values rather than adjusting the threshold to fit.
6. **No-op guard.** If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

## Firewall

Touch ONLY: `e2e/m4-06-embodiment.spec.ts` (the `permission-denied receipts …` test body and, if genuinely required, the `distance`/`companion` helpers — **read-only preferred**), and `artifacts/f1557-3-m4-06-denied/**`.

NO changes to: `src/**` (this is a test-correctness task; if you believe the Prospector's drift is a real product bug, REPORT it, do not fix it) · any other test in `e2e/m4-06-embodiment.spec.ts` · any other `e2e/**` spec · `scripts/**` · `src/config/Balance.ts` · sim semantics · `playwright.config.ts` · `tasks/**`, `specs/**`, `STATUS.md`, `tasks/BACKLOG.md`.

## Self-check (evidence, not vibes)

`npx tsc --noEmit` clean. `npm run build` green. `e2e/m4-06-embodiment.spec.ts` **green in full** (not just the edited test) on **both** `desktop-chrome` and `mobile-chrome` at `--workers=1`. Adjacent suites unmodified-green both projects, by name: `e2e/m4-08-attribution.spec.ts`, `e2e/agent-view.spec.ts`, `e2e/agent-seat.spec.ts`. Zero console/page errors (the test already asserts `errors.consoleErrors`/`pageErrors` empty — keep those assertions). Artifacts at the exact path `artifacts/f1557-3-m4-06-denied/distribution.txt`. No screenshots or perf table needed — nothing here renders differently.

End: **READY-FOR-GATES** + report: (a) the measured min/median/max of `driftAbs` and `gapClosed` per project, (b) the two thresholds you chose and the margin reasoning, (c) the 15×2 re-run pass counts, (d) whether any repeat still failed and with what values, (e) anything you had to adapt.
