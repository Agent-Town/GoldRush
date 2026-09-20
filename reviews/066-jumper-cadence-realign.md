# 066-jumper-cadence-realign

- **Slice:** `lane-b-066-jumper-cadence-realign` (F-1302-1)
- **Branch / tip:** `lane/m4` @ `5f75bad0`
- **Base:** `0a86951d` (merge-base with main — s1302's own authoring commit)
- **Merged to main:** `fbc2f07a76efbf66db630f6960675aa806ac99ae`
- **Drained by:** s1303 fire, 2026-07-31

## Verdict

**MERGED.** The standing `066-walk8-engine` known-red is **CLOSED** — the suite is green for the
first time since 2026-07-12. One non-blocking finding raised (F-1303-1), which belongs to a
different spec and pre-dates this slice.

## What it does

s1302 measured that the advertised one-line known-red in `e2e/066-walk8-engine.spec.ts` was
actually **four** stale assertions: an earlier repair migrated the diagnostics lookups to
`char.bandit_base` but stopped before the assertions below them, leaving `:234` expecting the
`char-jumper-sheet-walk8-` frame key and three downstream assertions dark since 2026-07-12.

This slice repairs all four. **It is better than the master that ordered it.** The master ordered a
re-baseline to s1302's measured numbers (7.60 / 14.0488). The runner instead **derived** them at
runtime from `Balance.anim` and `RUN_CAST_SCALE`:

```ts
const strideUnits      = Balance.anim.strideUnits * RUN_CAST_SCALE;
const cadenceSpeed     = slowGroundSpeed * cadenceReferenceFrames / (strideUnits * Balance.anim.walkFpsPerSpeed);
const slowExpectedFps  = Math.max(Balance.anim.walkMinFps, cadenceSpeed * Balance.anim.walkFpsPerSpeed) * cadenceFrameScale;
const fastExpectedFps  = fastGroundSpeed * frameCount / strideUnits;
```

So the assertions now track the source of truth instead of freezing one fire's measurement, and the
tolerance **tightened** from 1–2 decimal places to 5. A balance change that moves cadence will now
move the expectation with it rather than manufacturing a false red.

The slow arm's stride assertion became `toBeLessThan(hero.strideUnitsPerCycle)` with a comment
naming the cause: below the ≈2.921 ground-speed knee `walkMinFps` clamps and the engine deliberately
suspends stride preservation, so the old `toBeCloseTo(hero, 1)` was **unsatisfiable as written**.
Re-baselining it to 2.8421 would have turned a law into a rubber stamp. `:238` — the fast-arm stride
invariant, which genuinely holds — is **byte-unchanged**.

## Evidence

Arithmetic re-derived independently at merge time, not inherited from the runner:

| Quantity | Derivation | Value |
|---|---|---|
| `walkFpsPerSpeed` | `9.5 / 6` | 1.583333 |
| `walkMinFps` | `9.5 × 0.4` | 3.8 |
| stride | `2.05 × 1.5` | 3.075 |
| slow unclamped | `2.7×4/(3.075×1.58333) × 1.58333` | 3.5122 → clamped |
| **slow expected fps** | `3.8 × 8/4` | **7.6000** |
| **fast expected fps** | `5.4 × 8 / 3.075` | **14.0487805** |
| knee | `3.8 × 3.075 / 4` | 2.92125 |

These match s1302's independently-derived figures exactly, and the runner's report reproduced them
a third time from source. Three independent derivations agree.

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, built in 1.46s |
| Slice `066-walk8-engine.spec.ts` | **6/6** (3 desktop-chrome + 3 mobile-chrome) |
| `eight-winds-hero` | green both projects |
| `vp-02b-rotation-resolver` | green both projects |
| `run-gait-stride` | green both projects |
| `run-cast-scale-up` | green both projects |
| `wire-e2-enemy-walk4` | green both projects |
| `vp-02-sprite-animation` | green both projects |
| `cast-motion-wiring` | green both projects |
| `eight-winds-enemies` | **1 red — F-1303-1, not this slice** (see below) |
| Console / page errors | zero |
| `git status --porcelain -- src assets` | **EMPTY** |

All playwright runs at `--workers=1` per §3.1.

**Adjacent set was derived, not inherited.** The runner's report named four adjacent suites. I
re-derived the set by grepping `e2e/` for `walk8|strideUnitsPerCycle|walkFpsPerSpeed|walkMinFps|RUN_CAST_SCALE`
and gated seven, which is how the `eight-winds-enemies` red surfaced at all.

## Merge classification

| Path | Class |
|---|---|
| `e2e/066-walk8-engine.spec.ts` | LANE-TOUCHED — main has not moved it since base |
| `artifacts/066/*` (8 files) | LANE-TOUCHED — main has not moved them since base |
| `STATUS.md`, `docs/bench/agent-playability-census.md`, `specs/agent-play/README.md`, `tasks/BACKLOG.md`, `logs/s1302-*.mjs` | MAIN-MOVED-ONLY — stale-base phantom deletions in the two-dot diff |

`git log 0a86951d..main -- e2e/066-walk8-engine.spec.ts artifacts/066/` is **empty**, so no conflict
was possible and no 3-way graft was needed. Merged as a path-scoped checkout of the two lane-touched
path groups; the phantom deletions were never staged. Artifact churn from my own gate runs
(`eight-winds-*`, `run-gait-stride`, `run-cast-scale-up`, `wire-e2-enemy-walk4`, `cast-metrology`,
`shots-008-rotation`, `shots-vp-02*`) was restored. Pre-existing attended dirt
(`artifacts/trail-guide-plain-boot/`, `artifacts/map-census/`, `logs/`) was left untouched — an
attended session was live throughout this drain and its dirt was disjoint from mine (§2A).

## Findings

### F-1303-1 — `eight-winds-enemies.spec.ts:39` fails by test ORDER, not by load (NON-BLOCKING, not this slice)

`[mobile-chrome] › eight-winds-enemies.spec.ts:39 › diagnostics drive thief northeast and Baron
southwest on their correct rows` failed during the adjacent battery with
`page.waitForFunction: Test timeout of 60000ms exceeded`.

**This slice cannot be the cause:** the diff contains **zero `src/`**, does not touch
`eight-winds-enemies.spec.ts`, and that spec does not import the 066 spec — it is not even collected
in a run of it. The two census commits that landed on main immediately before this drain
(`8e2c9c2b`, `f31d4c70`) also touched zero `src`/`e2e`, verified by `git show --stat … -- src e2e`
returning empty. The spec has been in-tree since `15d50fc0` (s1183) and appears in no ledger,
`STATUS.md` or `tasks/BACKLOG.md` entry as a known red.

**It is not a load flake, and I nearly recorded it as one.** Measured rather than assumed:

| Arm | `:39` result |
|---|---|
| Full-file run #1 (inside the adjacent battery) | mobile **FAIL**, desktop pass |
| Full-file run #2 (spec in isolation) | mobile **FAIL**, desktop pass |
| Solo, `-g "diagnostics drive thief"`, `--repeat-each=3`, mobile | **3/3 PASS** (23.9s) |
| Full-file run #3 | mobile **FAIL**, desktop **FAIL** |

Solo: **3/3 green.** In file order: **0/3 green on mobile, 1/3 on desktop.** Every run was at
`--workers=1`, so §3.1's shell-serialisation cause is excluded. When it passes it passes in ~8s;
when it fails it burns the full 60s timeout. That is a bimodal, order-dependent signature — the
test appears to depend on state left by `:19` in the same worker (`:19` is a plain boot, `:39` boots
`/?debug&contract=e1-baron&nowaves&nolevel&nopause&nokill`), not on machine load.

A 3/3 green in isolation is exactly what would have let me file this as "flaky, ignore". The
discriminating run is what turned it into a reproducible fault with a hypothesis attached.

**Recommendation:** fire-authorable as a scoped investigation of `:19`→`:39` state leakage — but
note F-1294-2's lesson from this very slice: an "obviously small" test repair was four assertions.
Size it after the first measurement, not before. Not queued this fire (drain budget; one authored
master per fire, and none was authored here).

## Owner

Nothing owner-gated in this slice. `drain-block-check.mjs` returned **✅ CLEAR** and matched by name,
which independently confirms the leaf registration took.
