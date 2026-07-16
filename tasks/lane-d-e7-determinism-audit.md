# Task lane-d-e7-determinism-audit: PB-00 — prove/repair the replay substrate (LANE-D, commit prefix "chore:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md; specs/playbook-core/README.md (§laws + PB-00 — this task IS that slice); src/diagnostics/DeterminismHarness.ts (the existing proof surface — understand what it hashes and what it misses); src/game/Game.ts (the fixed-timestep loop; where render dt could leak into sim).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/perf main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## Why (playbook-core PB-00; owner 2026-07-17: "author the hard parts already... find out if there are issues with them or we nail them quickly")
E7's playbooks (record/replay) and E9's persistence both stand on exact sim determinism. The event-log + fixed-timestep laws exist since month one; nobody has AUDITED the whole sim surface against them. Find the issues now, while they are cheap.

## Scope
1. **Static sweep** of src/ SIM paths (systems/, game/, entities/, world/ — exclude ui/, diagnostics/, town/ render-only code) for non-determinism sources; produce a classified table (file:line · pattern · SIM-CRITICAL / RENDER-ONLY / TEST-ONLY):
   - `Date.now()`, `new Date()`, `performance.now()` feeding sim values
   - `Math.random()` outside the seeded RNG
   - Map/Set/Object-key iteration whose ORDER reaches sim outcomes
   - unstable `Array.sort` comparators on sim collections
   - render frame-dt reaching sim state (anything sim-side scaled by real elapsed time instead of the fixed step)
   - floating-point accumulation patterns that differ across run lengths (flag only; don't fix)
2. **Fix the trivial SIM-CRITICAL findings** (≤20 lines each, mechanical: route to seeded RNG, stabilize sort with id tiebreak, snapshot iteration to sorted arrays). Anything larger: REPORT with a proposed fix, do not implement (firewall).
3. **Harness A/B**: run the determinism harness (?debug&determinism) 2× each on 3 seeds — hashes must be identical per seed. If the harness's coverage is thin (misses combat/economy/waves), EXTEND its hash to cover kills, gold, wave numbers, and entity counts per probe tick (additive).
4. **Report**: artifacts/e7-determinism-audit/report.md — the findings table, what was fixed vs deferred, the 3×2 hash matrix, and a one-paragraph verdict: IS the substrate replay-ready?

## Firewall
Touch ONLY: trivial sim-critical fixes per scope 2, DeterminismHarness additive coverage, the report. NO refactors, NO behavior changes beyond determinism repairs, NO ui/render/test-only "fixes", NO existing e2e assertion edits.

## Self-check (evidence, not vibes)
tsc + `npm run build` green. Determinism harness: identical hashes 3 seeds × 2 runs (paste the matrix). Adjacent unmodified-green both projects: task-025 baseline + one boss suite (fixes must not shift outcomes — if a fix DOES shift a suite's expected values, that suite was measuring nondeterminism: report it, don't paper it). Zero console/page errors.
No-op guard: if you exit without changes, WRITE WHY into your report first — "zero findings" is itself a reportable result with the sweep evidence.
End: READY-FOR-GATES + the verdict paragraph + the fixed-vs-deferred split.
