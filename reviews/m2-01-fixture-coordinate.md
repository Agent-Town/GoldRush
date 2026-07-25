# m2-01-fixture-coordinate — the draw-call guard now actually tests the draw-call budget

**Slice:** `lane-m2-01-fixture-coordinate` (FIRE-AUTHORED s1029, drained s1030)
**Branch:** `lane/m3` · **Lane tip:** `64b0970d` (`runner(lane-a): lane-m2-01-fixture-coordinate.md`)
**Base:** clean `main` at `cff86423` · **Drained:** 2026-07-25, s1030 fire
**Closes:** F-1029-2

## VERDICT: ✅ MERGE

A three-line e2e fixture change that converts a **vacuously red** guard into a **genuinely
executing** one. The 200-call ceiling was not touched, and the honest numbers came in with
comfortable headroom. Zero `src/` bytes change, so no player-facing surface moved.

## What it does

`m2-01:322` ("stress draw calls stay under 200 with palisades and beacons") has never once
evaluated its own assertion. It timed out inside the `placeSelected` helper
(`e2e/m2-01-build-menu.spec.ts:84`), polling `build.ghostValid` for 5000ms and receiving `false`,
because the palisade stress row's first target `(-6, 16)` sits inside the working-camp collision
footprint. The assertion at line 339 was unreachable — the guard was red for a reason that had
nothing to do with draw calls, which is worse than having no guard at all.

The fix moves **only** the twelve-palisade stress row from `z=16` to `z=20`, clear of that
footprint, and adds a one-line comment so the next reader does not "tidy" the coordinate back.
The fixture keeps its shape — still six beacons at `z=10` and twelve palisades — so the guard
still stresses exactly what it was written to stress.

**The ceiling at line 339 is byte-identical to main.** A budget edited to fit its measurement is
not a guard; the master forbade touching it, and the diff proves it was not touched.

## Merge classification

`git diff main lane/m3` listed six files. Only one is LANE-TOUCHED:

| File | Class | Action |
|---|---|---|
| `e2e/m2-01-build-menu.spec.ts` | **LANE-TOUCHED** (+2/−1) | merged, path-scoped |
| `STATUS.md` | MAIN-MOVED-ONLY | not copied |
| `e2e/asset-diet.spec.ts` | MAIN-MOVED-ONLY (s1029 `9ba65911`) | not copied |
| `reviews/asset-diet-gate-honesty.md` | MAIN-MOVED-ONLY (s1029) | not copied |
| `tasks/BACKLOG.md` | MAIN-MOVED-ONLY | not copied |
| `tasks/goals.json` | MAIN-MOVED-ONLY | not copied |

The lane branched before s1029's two merges, so those five read as lane-side *deletions* — a
classic false-ahead in the reverse direction. No 3-way graft was needed: the lane and main touched
disjoint files. After applying the change, `git diff lane/m3 -- e2e/m2-01-build-menu.spec.ts` was
**empty**, i.e. the merged tree is byte-identical to the lane's output for the one file it owned.

## Evidence

All runs on the merged tree, `--workers=1`, both projects, native Mac.

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | ✅ clean |
| `npm run build` | ✅ green (1.12s; diet 598MB→93MB GLB, 183MB→24MB PNG) |
| `e2e/m2-01-build-menu.spec.ts` desktop | ✅ **7/7** incl. `:322` |
| `e2e/m2-01-build-menu.spec.ts` mobile | ✅ **7/7** incl. `:322` |
| `e2e/m1-01-claim-jumpers-death.spec.ts` | ✅ **8/8** both projects |
| `e2e/m2-05-base-damage-repair.spec.ts` | ⚠️ 11/14 — all 3 failures pre-existing flakes, proven below |
| Console/page errors | ✅ zero across 22 asserted boots (see note) |

### The measured numbers — taken myself, not inherited

The master required the honest per-project count, and s1029's rule is that a number you did not
measure is a number you do not have. A green run only proves `≤ 200`, so I measured the actual
value with a **temporary** probe: assertion flipped to `toBeLessThanOrEqual(0)` so Playwright
prints the received value, run, then reverted.

| Project | Draw calls | Ceiling | Headroom |
|---|---:|---:|---:|
| desktop-chrome | **182** | 200 | 9% |
| mobile-chrome | **160** | 200 | 20% |

This probe is also the **proof the assertion now executes**: line 339 produced a `Received:` value,
which it structurally could not do while the helper was timing out three lines earlier.

The probe was reverted before the merge and verified reverted two ways —
`git diff lane/m3 -- e2e/m2-01-build-menu.spec.ts` empty, and `git diff --stat` still showing
exactly `2 insertions(+), 1 deletion(-)`.

Codex reported 182 / 162; I measure 182 / **160**. Desktop matches to the call; mobile differs by
2, which is ordinary late-upload jitter of the same class s1029 root-caused in `f7cd0103`. Both
readings agree on the finding that matters: **the ceiling holds with room to spare.** For the
record, the predecessor's probe figure of 131 mobile was measured through a hand-driven probe
rather than the real fixture and should not be carried forward — 160 is the number this guard
actually defends.

### Boot-probe note

This slice changes **zero `src/` bytes**, so no boot surface could move. Rather than run a separate
probe, the evidence is stronger from the suites themselves: every one of the 14 m2-01 tests and 8
m1-01 tests asserts `consoleErrors == []` and `pageErrors == []` (spec lines 318-319 / 340-341),
across desktop and 390px mobile. That is 22 clean boots on both viewports.

## Findings

### F-1030-1 — `m2-05:319` fails on BOTH projects, via TWO DIFFERENT assertions

**Self-correction, recorded deliberately.** My first pass through this finding read the failure
messages without checking *which* assertion produced them, and concluded "the geometry drift is
cross-project." That was wrong, and the `<=` in half the messages is what gave it away — line 348
uses `toBe`, line 349 uses `toBeLessThanOrEqual`. Two assertions, two different defects. Verified
by re-running with the source frame printed, rather than by pattern-matching the numbers:

| Project | Failing line | Assertion | Reading | Repeatability |
|---|---|---|---|---|
| desktop-chrome | **348** | `geometries` `toBe` baseline | expected **94**, received **95** (**+1**) | **2/2 — deterministic** |
| mobile-chrome | **349** | `calls` ≤ baseline **+2** | expected **≤69**, received **70** (**+3**) | 1/2, 1/3 — intermittent |

So s1029's *"Desktop only; mobile green"* was **half right**: the **+1 geometry leak really is
desktop-only**, and its mobile counterpart is green. But the test *as a whole* also fails on
mobile, through the draw-call tolerance, which no prior fire recorded.

A third mode appears in full-suite runs: with the whole file running `--workers=1`, **desktop**
fails at **line 349** instead (baseline 89, received 93) while its geometries pass. Baselines move
with test order (94 isolated vs 89 in-suite), so which assertion trips depends on what ran before.

**Not attributable to this drain:** both modes reproduce on clean main with the change reverted
(`git status -- e2e/` empty), and this slice touches a different spec file entirely.

Whoever takes the corrective must treat this as **two defects behind one test name**, and must not
gate on a single run of either project — a 1-in-3 red reads green two times out of three.

**Not attributable to this drain:** the desktop failure reproduces on clean main (change fully
reverted, `git status -- e2e/` empty), and this slice touches a different spec file entirely.

### F-1030-2 — `m2-05:198` is intermittently red on clean main, and no prior fire recorded it

```
[desktop-chrome] m2-05:198 "repair dwell spends exact sink, restores function,
                            and keeps replay equal to HUD"
    Expected: > 0    Received: 0
```

Reproduced on **clean main** (1 fail in the full suite) and 1-in-3 on `--repeat-each=3`. So it is a
flake, not a hard regression — but it is a *new* red: s1029 gated seven adjacents and reported
"45 passed / 1 failed", the single failure being `:319`. Either `:198` flaked green through that
gate or it arrived with `f7cd0103` / `9ba65911`. Worth an owner-cheap look, because "replay equal
to HUD" is an economy-truth assertion and a zero where a positive is expected is the shape of a
real race, not merely a slow poll.

### F-1030-3 (process, no action owed) — `m2-05` is now a three-flake suite

Between F-1030-1 and F-1030-2, `m2-05-base-damage-repair.spec.ts` has three tests that pass or
fail on timing. It is used as a standard adjacent on this board, which means **it will keep
manufacturing false attributions for innocent drains** (it nearly did for this one). A future
corrective should stabilise it as a suite, not test by test.

None of the three findings block this merge: all are pre-existing, all reproduce without this
change, and all live in a spec this slice's firewall forbade touching.

## Firewall audit

**TOUCH-ONLY:** `e2e/m2-01-build-menu.spec.ts` — ✅ held exactly; it is the only file merged.
**NO:** any `src/` file · collision/placement semantics · the 200 ceiling · other specs ·
`Balance.ts` · the `m1-01` guard — ✅ all held, verified by the one-file diff.
