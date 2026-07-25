# m2-05-geometry-settle (attempt 2) — drain review, MERGED (s1040, 2026-07-25)

**Slice:** `tasks/lane-m2-05-geometry-settle.md` (FIRE-AUTHORED s1035, refreshed s1036 — attempt 2)
**Branch:** `lane/e2-arsenal` · **Tip:** `f992ebab` · **Base:** `69f0cd80` · **Workdir:** `worktrees/lane-c`
**Run:** `tasks/runs/20260725-164725-lane-c-lane-m2-05-geometry-settle.md.log` · rc=0, `READY-FOR-GATES`
**Predecessor review:** `reviews/m2-05-geometry-settle.md` (attempt 1, s1036 — NOT MERGED, retained)

## VERDICT: MERGED. F-1035-1's geometry race is CLOSED — and unusually for this board, closed with **both** kinds of evidence: a paired A/B that shows the guard flipping from red to green, **and** an independently-reproduced mutation control that shows it can still bite.

## What it does

Two hunks, one file, **zero `src/` bytes**.

1. **`waitForRendererSettle` (`:100-115`) gains a geometry-stability wait.** It polls until
   `renderer.geometries` is unchanged across **8 consecutive ticks spanning ≥1 simulated second**,
   with a **15s timeout** — so it fails loudly rather than proceeding on a machine that never settles.
   This is scope-3's generic condition, not an event wait naming one late producer.
2. **The warm-up loop (`:350-363`) becomes adaptive.** Fixed `2` cycles → up to `8`, exiting once
   geometry has been stable across `3` consecutive wreck/repair cycles, with
   `expect(stableWarmups, 'renderer geometry count did not stabilize during warm-up').toBe(3)`
   as a loud failure if it never converges.

The mechanism it closes (banked by F-1035-1): the merged s1035 wait watches
`canvas.dataset.run3dPilotState`, which is the **terrain** pilot's state and never reports the
per-buildable sentry GLB's registration. On a cold fetch the GLB cylinder replaced its procedural
fallback *after* the baseline snapshot, reading `+1` geometry. A stability wait closes that
generically, where the terminal-state wait could not.

## Firewall compliance — verified by reading the diff, not the report

| Prohibition | Status |
|---|---|
| Don't relax `toBe` equality at the geometry assertion | ✅ untouched (`:389`) |
| Don't widen the `+2` draw-call tolerance | ✅ untouched (`:390`) |
| Don't revert/rewrite the s1035 fix | ✅ extended, not replaced — terminal wait + settle helper intact |
| No `src/` changes | ✅ `git diff --stat` = 1 file, `e2e/` only |
| No `test.skip`, delete, or comment-out | ✅ none present |
| No bare `waitForTimeout` as the stabiliser | ✅ the stabiliser is a predicate + timeout |
| Don't touch F-1030-2's repair-dwell test | ✅ untouched (diff hunks are at `:97` and `:347`; the test body at old `:207` is byte-identical) |
| TOUCH-ONLY `e2e/m2-05-base-damage-repair.spec.ts` | ✅ sole file in the diff |

**F-1036-2 mutation-control check (the defect that shipped once before): CLEAN.** The runner's
temporary post-baseline palisade is **not** in the merged content — verified by reading the entire
2-hunk diff, not by trusting the report's "reverted" claim.

## Classification

`git log 69f0cd80..main -- e2e/m2-05-base-damage-repair.spec.ts` → **empty**. All content is
**LANE-TOUCHED-only**; main has not moved this file since the base. Clean checkout, **no 3-way graft**.
Main's only commits since base are bookkeeping plus the perf-05 drain (`63161278`, zero `src/` bytes).

## Evidence

All runs `--workers=1` on the same machine, control and merged runs adjacent in time.

### The A/B — identical shape (full file, desktop, `--repeat-each=2` = 14 tests)

| variant | geometry guard | repair-dwell (F-1030-2) | total |
|---|---|---|---|
| **MAIN (control, unmodified)** | **FAILED 1/2** (`:328`) | FAILED 1/2 (`:207`) | 12 passed / 2 failed |
| **MERGED (lane content)** | **PASSED 2/2** (`:344`) | FAILED 1/2 (`:223`) | 13 passed / 1 failed |

The unrelated F-1030-2 red holds the **same rate in both variants**, which is what licenses the
comparison: machine load was equivalent across the pair, so the geometry result moved because the
diff moved it. This is the s1039 instrument applied to a different question.

### Mutation control — the primary acceptance evidence (scope 4), **independently reproduced by this fire**

The A/B proves the fix removes a false red. It does **not** prove the guard is still sensitive — a
vacuous guard also passes 2/2. So the control was re-run here rather than inherited:

- Inserted a temporary post-baseline palisade (`grantGold` + `placeBuildableAt` + settle).
- `:389` `expect(after.renderer?.geometries).toBe(baseline...)` → **RED, Expected 94 / Received 97.**
- Reverted, verified **two ways**: `git diff lane/e2-arsenal -- <file>` **empty**, and
  `grep -nE "TEMP-MUTATION|palisade', 4, 12"` **no matches**.

**The guard still bites.** It was not made vacuous.

### Gate battery (merged tree)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean** |
| `npm run build` | **green** (`✓ built in 1.15s`; asset-diet 84%/87% cuts nominal) |
| Slice, desktop, full file ×2 | 13/14 — sole red = F-1030-2, pre-existing (below) |
| Slice, **mobile**, full file ×2 | **14/14 green** |
| Slice, desktop, full file ×1 (first pass) | 6/7 — same F-1030-2 red |
| Repair-dwell isolated ×3, merged | **3/3 green** (order/load-sensitive, not deterministic) |
| Adjacents, **both projects** | **38/38 green** |
| Console/page errors | **zero** — every test asserts `consoleErrors`/`pageErrors` `toEqual([])`; all passed |
| Screenshots | `reviews/shots-m2-05/` regenerated by the passing runs |

**Adjacent-suite correction (the runner reported this and it is accurate — verified by `ls`):** two of
the master's four named adjacents **no longer exist on main** —
`e2e/m1-01-first-claim.spec.ts` and `e2e/m2-01-fixture-coordinate.spec.ts`. Current replacements used
instead: `e2e/m1-01-claim-jumpers-death.spec.ts`, `e2e/m2-01-build-menu.spec.ts`, plus the two
surviving named files `e2e/run3d-turret.spec.ts`, `e2e/run3d-assay-bench.spec.ts`. **38/38 both projects.**
The master's "16 tests" figure is stale and should not be carried forward.

## Findings

**F-1040-1 (REAL, open, inherited-and-now-confirmed) — F-1030-2 is the last timing red in this file,
and it reproduces on unmodified main.** *"repair dwell spends exact sink, restores function, and keeps
replay equal to HUD"* fails at **`:233`** — `expect.poll(... build.repair.progress ?? 0).toBeGreaterThan(0)`,
`Expected: > 0, Received: 0`, 5s poll timeout. **Attributed, not assumed:** it failed **1/2 on the
unmodified-main control** in the same session, and it passes **3/3 isolated** on the merged tree — so it
is order/load-sensitive and belongs to neither this slice nor its predecessor. The diff has **no causal
path** to it: `waitForRendererSettle` is called only at `:358/:364/:378`, all inside the *last* test,
Playwright gives each test a fresh page, and the repair-dwell test runs earlier in file order.
**Line drift for the ledger: recorded as `:198` in F-1030-2, now `:223` (test) / `:233` (assertion).**
GATE: as F-1030-2 already says — *"replay equal to HUD"* is an **economy-truth** assertion, and a zero
where a positive is expected is the shape of a real race rather than a slow poll. Worth a cheap look.
**Not fire-authored this fire** (§2E one-master limit not spent — see handoff; this needs the same
CLASS-level care the geometry race got, and F-1030-3 asks for a suite-level fix, not a test-level one).

**F-1040-2 (process, no task owed) — the defect is not exclusively COLD, which refines F-1036-1.**
F-1036-1's model was *"≈one failure per COLD invocation; every warm invocation went green"*, cold
meaning the test is the worker's first page load. This fire's control failed the geometry guard on the
**second repeat inside a single invocation** (trace dir `…-desktop-chrome-repeat1`), i.e. a **warm**
draw, in the **full-file** shape rather than the isolated one. The cold/warm split is therefore a
strong *tendency*, not a law, and F-1036-1's reconciliation should not be read as a mechanism proof.
This does not change any verdict — it makes the closed race's evidence *stronger*, since the merged
variant went 2/2 green in the very shape that just failed on main.

**Reconciliation of the runner's scope-1 result (no finding owed).** The master predicted 1-3 failures
in six pre-fix invocations; the runner measured **6/6 green** and, per the refreshed no-op guard,
proceeded to instrument and patch anyway rather than stopping. That was the right call and this fire's
control vindicates the master's premise: the defect **did** reproduce on unmodified main here. The
runner's 0/6 is another draw of F-1036-1's warm-sample problem, not a mis-measurement.

## Merge

Path-scoped, one file. Zero `src/` bytes ⇒ **no deploy, no gazette item** (both filter laws checked
against the diff, not assumed — the bundle is byte-identical to pre-merge main).
