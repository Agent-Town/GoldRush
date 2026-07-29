# lane-b — the approach helper must CONVERGE (F-1207-1 / F-1207-2)

**FIRE-AUTHORED s1207 (attended review welcome).**
**Role:** Codex runner, lane-b. **Workdir:** `worktrees/lane-b` (branch `lane/m4`).

## READ FIRST (in this order)
1. `reviews/f1206-1-discriminator.md` — the measurement that produced this task. Read it fully; it contains every number quoted below and the traces they came from.
2. `logs/session-scratch/s1207-probes/run-load-trace.txt` — the raw walk traces.
3. `e2e/release-build.spec.ts:296-330` — **the subject**: the helper and its call sites.
4. `logs/suite-red-inventory.md:198` and `:358` — the known-red this should cure.
5. `CLAUDE.md` §5 mistake #10 and #13; `AGENTS.md`.

## WHY (evidence, dated)
s1206 escalated the trail-guide plain-boot proof under §5 after **three failures on three distinct premises** and forbade a fourth cure until one measurement ran (F-1206-1). s1207 ran it. Verbatim result, at failure, with arrival proven (`arrived=true`):

> `VERDICT INPUT for beat 1: recorder saw it = false, POLL saw it = false`
> `==> FEED GENUINELY SILENT for this beat.`

Two independent instruments on one page in one run. The feed was silent **correctly** — the sim was healthy (**29–35 fps**, so "starved by load" is dead), but `channeling=false` and the hero stood **1.876–3.026** from the nearest active seam while passing runs stood **0.886–1.594** away. He never earned a nugget, so the beat had nothing to announce.

The cause is the approach helper, and the trace names it. Target `{x:-9, z:6.7}`, tolerance ±0.12/axis:

```
KeyD x=-10.130 (+122ms)
KeyD x=-7.535  (+491ms)   <-- 2.6 units in ONE sample; stop line was -8.88
KeyS z=7.550   (+150ms)   <-- the single correction pass overshoots BACK
```

`moveHeroTo` (`e2e/release-build.spec.ts:308-329`) makes **one correction pass per axis, x then z, never re-checking x after z**. Its accuracy is bounded by distance travelled between two `page.evaluate` round-trips, which under 4-worker concurrency measured **166–491 ms against an intended 25 ms loop**. Measured misses: **dx 1.400 / 1.600 / 2.819**, dz 0.979–1.580.

**This is a CLASS, and it is already costing the board a red independent of the trail guide.** `grep -rln pressUntil e2e/` → the helper lives at `release-build.spec.ts:308-329` with **9 call sites**, and `logs/suite-red-inventory.md:198` records `e2e/release-build.spec.ts:297 | Error: Hero blocked while moving KeyW | MOBILE-ONLY` — `:297` is a call site and that string is the `pressUntil` throw verbatim.

## SCOPE

**1. MEASURE FIRST — and this gate may CANCEL the work (STOP gate).**
1a. On unmodified `lane/m4` reset to main, run `npx playwright test e2e/release-build.spec.ts --repeat-each 4 --workers 4` and record per-call-site outcomes. Report the failure rate.
1b. Instrument `moveHeroTo` **temporarily** to log final position vs target for every call, and record the miss (dx, dz) at all 9 sites, plus `dt` mean/max.
1c. **STOP AND REPORT — do not proceed to scope 2 — if the measured misses are all within tolerance**, i.e. if this tree does not reproduce the defect. A cure for a defect you could not measure is a guess. Say so plainly and stop; that is a successful run.

**2. THE CURE — make the approach converge.** Rewrite `moveHeroTo` in `e2e/release-build.spec.ts` so it:
- loops until **both** axes are within tolerance simultaneously (re-check x after moving z), with a bounded attempt count;
- treats the tolerance as a **radius** (`Math.hypot(dx,dz) <= tol`) rather than two independent axis checks;
- **compensates for sampling latency** — e.g. release the key as soon as the *predicted* stop point is reached, or re-approach in shrinking steps — so accuracy does not depend on round-trip time;
- keeps the existing `SIM_PROGRESS_TIMEOUT` overall cap and the `Hero blocked` throw for a genuinely pinned hero (a hero that cannot move must still fail loudly — do NOT convert a real block into a silent success).
Keep the signature `moveHeroTo(page, x, z)` so all 9 call sites are untouched.

**3. THE CONTROL — this is the load-bearing item, and the run is not done without it.**
3a. Re-run 1a/1b on the cured tree. Report the same table. The miss must fall inside tolerance at all 9 sites and the failure rate must drop.
3b. **MUTATION PROOF (mandatory).** Revert *only* the convergence loop (keep everything else) and show the misses return. A cure that cannot be made to fail again has not been shown to be the cure. Report both arms.
3c. Report the failure rate at `--workers 4` before and after. **s1207 measured the trail-guide analogue at a stable 3/8 (37.5%) across three batteries and 0/2 at 1 worker — that rate is the control to move.**

**4. THE LEDGER.** Add a row to `logs/suite-red-inventory.md` retiring `e2e/release-build.spec.ts:297` **only if** scope 3 shows it green across the repeat battery; otherwise record honestly what remains. Do not mark a red cured on a single green run.

## FIREWALL
**TOUCH-ONLY:** `e2e/release-build.spec.ts` · `logs/suite-red-inventory.md`.
**NO:** any `src/**` (this is a harness defect — if you conclude otherwise, STOP and report rather than editing `src/`) · `e2e/trail-guide-*` (the proof is PARKED under §5; re-landing it is the NEXT rung and is explicitly not in this task) · any other spec · `tasks/goals.json` · `STATUS.md` · `reviews/**`.

## SELF-CHECK before READY-FOR-GATES
- `npx tsc --noEmit` clean · `npm run build` green.
- `npx playwright test e2e/release-build.spec.ts` green on **both** `desktop-chrome` and `mobile-chrome`.
- The `--repeat-each 4 --workers 4` battery from 3a, with the before/after rates stated as numbers.
- Adjacent suites unmodified-green, or failures fingerprint-matched to `logs/suite-red-inventory.md` with proof.
- Zero console/page errors in the boot probes.
- Both mutation arms from 3b reported.

## SEQUENCING / LANE SAFETY
`lane/m4` is **4 ahead** of main: `45f78f6e`, `7b2d63f5`, `d7d8ba03` (the three parked trail-guide attempts, each pinned to `archive/lane-m4-trail-guide-*`) and `f4cb37bf` (claw-2x, content-merged as `b00319ea`). It is a **false-ahead SAFE DUPE**. **Re-verify that yourself before resetting** — confirm all three archive refs resolve (`git rev-parse archive/lane-m4-trail-guide-d7d8ba03` etc.) and that the worktree is clean vs main. If either check fails, **STOP and report**; do not reset. (w1-03 and polish-02 died exactly here.)

**READY-FOR-GATES** — report: the before/after miss tables for all 9 call sites, both mutation arms, the failure-rate delta at 4 workers, and whether `release-build.spec.ts:297` is genuinely retired or still red.
