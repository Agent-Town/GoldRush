# F-1148-1 trajectory split v2 — measured; final confirmation stopped

## Verdict

**Classification: B BETWEEN A AND C.** Setting `lateralOffset = 0` restores the
parent's non-negative X floor, but it does not restore the parent trajectory's
duration or distance. A real route remainder remains: Arm B is 1.916 s slower
and 0.660 world units longer than Arm C at the median, with no overlap in either
spread.

The measurement is valid: all nine probe runs placed all five palisades, and
every run had non-zero sample count and path distance. The final unchanged
`m2-04-gold-stealing.spec.ts` confirmation then failed during palisade placement
twice. Per the task's two-strike rule, work stopped without a third attempt.
That final result contradicts s1150's claim that placement is reliable through
the Playwright test runner; it does not invalidate the nine already-completed
probe runs.

## Method

`e2e/f1148-1-trajectory-probe.spec.ts` copies the existing m2-04 `openGame` and
`placeBuildableAt` helper shapes, uses its exact five-palisade setup, and carries
the retained in-page rAF sampler into an opt-in Playwright spec. It writes one
JSON record per run under `artifacts/f1148-1-trajectory/`.

All arms ran serially with one desktop-chrome worker on the same Mac. Process
checks before measurement found no competing Playwright, TypeScript, build, or
asset-diet process. Long-lived idle Vite servers existed on other ports, but no
other build or test ran with the measurement. Arm C used detached revision
`a26eca02`, its own `npm install`, and scratch port **5234**. The spec copied
into that worktree matched the main-worktree spec at SHA-256
`07c0983fe1b02d1a2087f1b5bf194929d3fe09ee912c3a87a200aa226cbf2991`.
The detached worktree was removed after its three raw records were copied back.

Arm B was a one-line throwaway mutation. Before mutation,
`src/entities/Enemy.ts` and its byte backup both hashed to
`682638a178774192f9c90fe30d0ed269b47987963bf6efe0964760b2188055cb`.
After Arm B, `cmp` returned `0`, both hashes still matched, and
`git status --porcelain -- src/` was empty.

## Individual runs

| Arm | Run | Palisades | Sim time (s) | Path distance | X min | X max | Samples |
|---|---:|---:|---:|---:|---:|---:|---:|
| A — current main | 1 | 5/5 | 11.333 | 21.811 | -0.662 | 3.230 | 134 |
| A — current main | 2 | 5/5 | 11.333 | 21.811 | -0.662 | 3.230 | 134 |
| A — current main | 3 | 5/5 | 11.333 | 21.811 | -0.662 | 3.230 | 133 |
| B — main, `lateralOffset = 0` | 1 | 5/5 | 10.333 | 20.313 | 0.000 | 3.230 | 123 |
| B — main, `lateralOffset = 0` | 2 | 5/5 | 10.333 | 20.313 | 0.000 | 3.230 | 123 |
| B — main, `lateralOffset = 0` | 3 | 5/5 | 10.333 | 20.313 | 0.000 | 3.230 | 121 |
| C — parent `a26eca02` | 1 | 5/5 | 8.417 | 19.653 | 0.000 | 3.230 | 67 |
| C — parent `a26eca02` | 2 | 5/5 | 8.511 | 20.043 | 0.000 | 3.256 | 67 |
| C — parent `a26eca02` | 3 | 5/5 | 8.333 | 19.497 | 0.000 | 3.230 | 67 |

Every positive control is plausible: sample counts are 67–134 and path
distances are 19.497–21.811 world units. No zero-valued or placement-failed run
was averaged.

## Medians and spreads

Spread is reported as `[min, max]`, not hidden behind a mean.

| Arm | Sim time median [spread] | Path median [spread] | X floor median [spread] | X ceiling median [spread] | Samples median [spread] |
|---|---|---|---|---|---|
| A | 11.333 [11.333, 11.333] | 21.811 [21.811, 21.811] | -0.662 [-0.662, -0.662] | 3.230 [3.230, 3.230] | 134 [133, 134] |
| B | 10.333 [10.333, 10.333] | 20.313 [20.313, 20.313] | 0.000 [0.000, 0.000] | 3.230 [3.230, 3.230] | 123 [121, 123] |
| C | 8.417 [8.333, 8.511] | 19.653 [19.497, 20.043] | 0.000 [0.000, 0.000] | 3.230 [3.230, 3.256] | 67 [67, 67] |

Arm B removes 1.000 s (34.3%) of the A-to-C median time gap and 1.498 world
units (69.4%) of the A-to-C median distance gap. It fully removes the negative
X excursion. The B and C duration spreads do not overlap; neither do their path
distance spreads.

## Classification and implication

The seeded lateral offset is responsible for the S-bend and part of the route
cost, but it is not the whole regression. The eventual owner-gated repair must
preserve the X-floor improvement **and** address the remaining formation-steer
cost; a lateral-offset-only patch is insufficient.

The source read identifies the closest remainder without repairing it. With
`lateralOffset = 0`, the current block still computes and adds
`spreadBiasX`/`spreadBiasZ` from `moveTarget + 0`. Parent `a26eca02` had no
formation-spread bias block at all. Thus the throwaway mutation removes the
seeded lane but retains center-seeking formation steering. This is consistent
with B's parent-shaped X floor but still-longer duration and distance. This is
diagnosis only; no source change ships.

## Opt-in proof

With `GR_F1148_PROBE` unset:

```text
$ npx playwright test --list | grep -c f1148
6

$ npx playwright test e2e/f1148-1-trajectory-probe.spec.ts \
    --project=desktop-chrome --workers=1 --reporter=list
Running 3 tests using 1 worker
3 skipped
```

The six collection entries are three runs in each of the desktop and mobile
projects. The default suite collects the spec but its top-level `test.skip`
prevents execution.

## Self-check

```text
$ npx tsc --noEmit
rc=0

$ npm run build
rc=0
[asset-diet] 235 terrain/landmark GLBs 592176964 -> 92768500 bytes (84% cut);
53 plate-class PNGs 183518013 -> 24346570 bytes (87% cut).

$ node scripts/run-guards.mjs
PASS  rc=0  6s  test:node-guards
PASS  rc=0  0s  test:power-budget
PASS  rc=0  3s  test:stats
PASS  rc=0  2s  test:accounts
PASS  rc=0  4s  test:mp
PASS  rc=0 79s  test:deploy-contract
PASS  rc=0  1s  test:deploy-site-contract
PASS  rc=0  0s  test:task-guards
guards: 8/8 passed

$ git status --porcelain -- src/
<empty>

$ git status --short
?? artifacts/f1148-1-trajectory-split-v2.md
?? artifacts/f1148-1-trajectory/
?? e2e/f1148-1-trajectory-probe.spec.ts
```

Arm A's required command passed 3/3 and printed all three positive controls.
Arms B and C passed 3/3 with the same command shape.

The restored, unmodified m2-04 confirmation did **not** reach the known `:226`
budget red:

```text
$ npx playwright test e2e/m2-04-gold-stealing.spec.ts \
    --project=desktop-chrome --workers=1 --reporter=list
attempt 1: 6 passed, 1 failed at placeBuildableAt line 46 / setup line 214
attempt 2: 6 passed, 1 failed at placeBuildableAt line 46 / setup line 214
Expected: true
Received: false
```

Both failures occurred during the five-palisade loop, before trajectory or the
`:226` assertion. No retry loop was added. A third attempt is forbidden by the
task's two-strike rule.

## Firewall

- `e2e/m2-04-gold-stealing.spec.ts` remains byte-unchanged.
- `scripts/probe-f1148-1-trajectory.mjs` remains untouched.
- The Arm B source mutation was restored byte-identically; there is no `src/`
  diff.
- Only the opt-in spec, this report, and the nine raw run records are intended
  deliverables.
- No repair, budget relaxation, test enrolment config, task, spec, review,
  STATUS, or git-history change was made.

**STOP, not READY-FOR-GATES:** the requested trajectory classification is
measured, but the final two placement failures are a new contradiction that the
task explicitly says to stop and report.
