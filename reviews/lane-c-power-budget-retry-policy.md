# Review — lane-c-power-budget-retry-policy

- **Slice**: `tasks/lane-c-power-budget-retry-policy.md` (authored s1172, F-1170-4's remedy)
- **Branch / tip**: `lane/e2-arsenal` @ `319e6304` — one commit ahead, `runner(lane-c): lane-c-power-budget-retry-policy.md`
- **Merge base**: `e1c32005` (the s1172 handoff). Main moved by exactly one commit since (`0c4e92d9`, STATUS.md only).
- **Drained**: s1173 fire, 2026-07-28
- **§3.0 drain-block-check**: `✅ CLEAR — lane-c-power-budget-retry-policy.md [factory-power-budget-retry-policy] status="queued"` — run first, before classification.

## VERDICT: MERGE — scope 2 shipped; scope 3 STOPPED at its declared measurement gate, which the master defines as a full success.

## What it does

The slice was authored to do two separable things. **Scope 2 (unconditional): make the power-graph
guard report its number.** `check-power-graph-budget.mjs` now prints one stable line —
`power-graph-budget: p95=…ms cap=…ms samples=… verdict=PASS|FAIL` — **before** its unchanged
`assert.ok`, and `run-guards.mjs` extracts that line and appends the p95 to the guard's row. The
line it replaces was printed *after* the assert, so it could only ever appear on success: that is
precisely why every handoff on this board has recorded a **boolean** for a measurement that
produced a **number**.

**Scope 3 (conditional): a one-guard retry allowlist.** It was **cancelled by the measurement in
scope 1(e)**, and correctly so. The master required the runner to first test the assumption the
retry makes silently — that two consecutive fresh-subprocess runs are *independent* — via the
lag-1 autocorrelation of the continuous p95 series (n≥40, ordered, timestamped), with |r| ≥ 0.3
stopping the retry half. It measured **|r| = 0.322** and stopped. No retry mechanism, no
allowlist, no `FLAKED` branch, no `package.json` change, no `src/` diff.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean (merged tree) |
| `npm run build` | green — `✓ built in 1.48s`; asset-diet 235 GLBs 84% cut, 53 PNGs 87% cut |
| `node scripts/run-guards.mjs` (the slice's own spec) | **8/8 PASS**, exit 0 |
| — power row, with the new output | `PASS rc=0 0s test:power-budget  p95=0.326ms` |
| Load bracket across the battery | `11.43` before → `5.18` after (1-min avg) |
| Exit code, verified at source | `run-guards.mjs:78` `process.exit(failed.length ? 1 : 0)`, `failed.length === 0` |
| Consumers of the removed string | none — grep over `scripts/ e2e/ src/ package.json .github` returns only the emitter and the npm script entry |
| `git diff main...lane/e2-arsenal -- src/` | empty |

**The green was taken under load, deliberately.** lane-a was running a full Playwright battery
throughout; loadavg peaked at 11.43. Load is a one-directional confound — it invalidates reds, not
passes — so 8/8 at loadavg 11.43 is a *stronger* pass than a quiet one, and it is the condition
under which F-1160-2 has historically fired.

**Both branches of the new `run-guards.mjs` code were exercised in that single run**, observed
rather than asserted: the power row carried `p95=0.326ms`, and the other seven guards — which emit
no such line — printed normal rows with no suffix and no crash.

### The statistic that cancelled scope 3, re-derived independently

The 0.322 is the number that killed the third and last cheap remedy on F-1160-2, so it was
re-derived from the raw series rather than read from the report:

| Check | Value |
|---|---|
| `logs/session-scratch/lane-c-power-budget-retry-series.json`, `default.rows` | **n = 40** (master required ≥ 40) |
| Ordered + timestamped ascending | **true** (master required) |
| Lag-1 autocorrelation, recomputed here | **r = 0.3207** (report: 0.322 — a normalisation convention apart) |
| Threshold | **≥ 0.3 ⇒ STOP.** Both derivations clear it. |
| Over-cap events in that series | **0 / 40** |

That last row is the quiet vindication of the master's design. A rare-event conditional estimator —
the instrument F-1170-4's remedy implied and the master explicitly **forbade** — would have had
**zero events** to work with on this series. Insisting on the continuous p95 series was not
pedantry; it was the only runnable instrument, and the same statistical dead end had already made
s1160's stated gate unrunnable.

### What the runner's own controls add

- Sustained `taskpolicy -b`: **6/6** pairs failed on both attempts — 100% correlated, matching s1161's 12/12.
- Healthy direct control `p95=0.399ms rc=0`; background direct `p95=2.683ms rc=1`; background *through the runner* `FAIL rc=1 … p95=2.082ms` — so the FAIL path does carry the number, which is the half the old code could never print.
- No-measurement runner control (`test:deploy-contract`): normal row, rc=0.

ⓘ **A distinction worth carrying forward:** raw loadavg does **not** reproduce this flake. At
loadavg 11.43 the p95 was 0.326 ms, comfortably under the 0.500 ms cap. The discriminator is the
**QoS class** (`taskpolicy -b` deprioritisation), not machine business. This drain's own green is
independent evidence for the runner's conclusion.

## Merge classification

Pure **LANE-TOUCHED**. Main moved only `STATUS.md` since the merge base, so no file in the slice
was MAIN-MOVED and no 3-way graft was needed. Five files, grafted by
`git checkout lane/e2-arsenal -- <paths>` and committed path-scoped:

| File | Class |
|---|---|
| `scripts/check-power-graph-budget.mjs` | LANE-TOUCHED (+4/−1) |
| `scripts/run-guards.mjs` | LANE-TOUCHED (+5/−1) |
| `logs/session-scratch/lane-c-power-budget-retry-series.mjs` | new (scratch instrument) |
| `logs/session-scratch/lane-c-power-budget-retry-series.json` | new (the raw series, 40+12 rows — retained per the Retention Law) |
| `tasks/runs/20260728-154016-lane-c-power-budget-retry-policy.md` | new (run report) |

No `src/`, no `e2e/`, no `package.json`. The four e2e specs lane-a holds live were firewalled by
name in the master and are untouched here — verified by the diff.

## Findings

- **F-1173-1 (ESCALATION — owner's desk).** **F-1160-2 has no cheap mechanism left.** All three
  published remedies are now refuted by measurement: min-of-3 (s1161, 4/4 under systematic
  deprioritisation), the in-process reference loop (s1170, bands disjoint), and now the consecutive
  retry (s1173, |r| = 0.322 — excursions carry memory across the guard's runtime, so a second
  sample is not an independent draw). The remaining options are **out-of-band** and one of them is
  a design question only Robin can answer: **should a wall-clock p95 be asserted at all on a
  permanently-loaded box, or should this guard assert a work-proportional measure instead?**
  Recommendation: **(a)** keep the guard as-is and accept that it reds under sustained background
  QoS — it is honest about a real condition, it costs a re-run when it fires, and after this slice
  it now *prints the number* so the next fire can tell a 0.52 from a 2.7 at a glance. This is no
  longer a silent boolean, which was the actual cost being paid.
- **F-1173-2 (non-blocking).** `scripts/run-guards.mjs` still has **no test file** among the twelve
  `scripts/*.test.mjs`, and scope 2 added a (small, defensive) new branch to it. Failure mode is
  benign — `?.[1]` yields `undefined` and the suffix is simply omitted — and **both branches were
  observed live in this drain's own battery**, which is why this is a note rather than a blocker.
  If a third mechanism is ever attempted on F-1160-2, a `run-guards` test is its prerequisite.

## Judgement on the STOP

This is the outcome s1172 predicted in writing before the run: *"a diff with **zero**
`run-guards.mjs` retry logic but a changed `check-power-graph-budget.mjs` is the expected STOP
shape, not a partial failure."* The runner wrote its 1(e) verdict **before** touching
`run-guards.mjs`, as the master required, and then honoured it. A measured refutation of a
plausible remedy is worth more than a shipped guess, and the reporting half — the part with no
dependence on the independence assumption — shipped anyway, exactly as scope 2 was designed to.
