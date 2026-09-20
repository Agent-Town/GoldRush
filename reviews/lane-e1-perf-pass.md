# lane-e1-perf-pass — E1 render-allocation pass (F-BW-11)

- **Slice:** `lane-e1-perf-pass` (master `tasks/lane-e1-perf-pass.md`)
- **Branch / tip:** `lane/perf` @ `452eb7475592ff68d7109dee338bde048147e846`
- **Base:** `823999527279053f214ccf93f8aafd6b0565bd79` (a genuine merge-base — `main..lane/perf` was exactly one commit)
- **Merged as:** `08b3ecb263551d06304e194e4e592d004542b175`
- **Drained by:** s1440 fire, 2026-08-03T20:45Z
- **Archive ref:** `archive/lane-perf-s1440-452eb747` (taken before any refill could reset the lane)

## Verdict

**MERGE — PARTIAL. Six source files landed; `e2e/e1-perf-pass.spec.ts` WITHHELD (F-1440-2).**

The optimization is sound and independently verified. Its own spec is not mergeable as written:
it would join the shared default battery permanently red on any machine that is not the lane shell.

## What it does

The owner's gate walk asked for it verbatim — *"the light effects are hard on the machine. But we can
do some optimization of the threejs of the maps in E1 maybe? ... We did not really optimize yet but
the night map is rough."* The runner profiled first and optimized second, in cost order, and it
reported its negative results honestly: enemy sprite instancing removed ~60 draw calls from the Night
pressure scene but changed transparent overlap ordering and **failed pixel equivalence, so it was
fully reverted**. What remains is allocation hygiene on the render path:

- **`Game.ts`** — the watchdog frame window keeps a rolling total and reuses a p95 sort buffer,
  instead of allocating a copy and rescanning for the average on every rendered frame. Thresholds and
  verdict logic untouched. Adds the `renderCensus()` test hook.
- **`pools.ts`** — `EnemyPool` reuses its light-dimming source records rather than re-mapping them per
  call, and computes each enemy's physical light **once** per render sync, sharing it with watch paint
  and fever presentation instead of recomputing it three times.
- **`LightField.ts`** — reuses its owned source array; `diagnostics()` counts with counters instead of
  three `filter()` chains. Source priority and light caps unchanged.
- **`LightRig.ts` / `Terrain3dClaimPilot.ts`** — reuse the 32-source candidate buffer instead of
  `filter`+`sort`+`slice` per render. Shader cap and ordering unchanged.

Sim, Balance, watchdog thresholds and accepted pixels are all untouched. The runner changed no
threshold and said so: night pressure p95 was 54% (desktop) and 58% (mobile) of the 33.4 ms shed line,
which does not justify moving the shed line.

## Merge classification

Base `82399952` is an ancestor of main, so this was a real 3-way merge, not a graft.

| File | Class | Handling |
|---|---|---|
| `src/entities/pools.ts` | PURE LANE-TOUCHED | direct |
| `src/systems/LightField.ts` | PURE LANE-TOUCHED | direct |
| `src/vite-env.d.ts` | PURE LANE-TOUCHED | direct |
| `src/game/Game.ts` | BOTH-MOVED | 3-way auto-merge, clean |
| `src/world/LightRig.ts` | BOTH-MOVED | 3-way auto-merge, clean |
| `src/world/Terrain3dClaimPilot.ts` | BOTH-MOVED | 3-way auto-merge, clean |
| `e2e/e1-perf-pass.spec.ts` | PURE LANE-TOUCHED | **WITHHELD — F-1440-2** |
| `artifacts/e1-perf-pass/**` | PURE LANE-TOUCHED | taken from `452eb747`, never from this fire's gate run |

A clean auto-merge is not evidence the merge is right, so it was checked rather than trusted: the gate
tree's diff **against main** is line-for-line stat-identical to the lane's own hunks across all seven
files (461 insertions / 62 deletions both ways), which is what proves main's side of the three
BOTH-MOVED files survived. All six landed files were then blob-hash-verified against the merged gate
tree after the copy.

## Evidence

Gates ran in a **detached worktree `gate-s1440`** (§3.0b — undecided content never entered main's
working tree), on **scratch port 5199**; `5188` was held by a live lane under `strictPort`. Every
playwright command carried **`--workers=1`** (§3.1).

| Gate | Result |
|---|---|
| `tsc --noEmit` (gate tree, spec included) | clean |
| `npm run build` (gate tree) | green, 1.19s |
| `tsc --noEmit` (main's tree, after the withhold) | clean |
| `npm run build` (main's tree, after the withhold) | green, 1.94s |
| Slice's own spec, both projects | **2 failed** — see F-1440-2 |
| Adjacent battery, both projects | **26 passed / 8 failed** |
| Control run, clean main, same worktree/server/port | **19 passed / 7 failed** |

Adjacent suites were derived **by grep** over the symbols the slice touches
(`lightDimming`/`watchPaint`/`feverAccent`/`lightFactor`, `lightField`/`poweredLamps`/`lanterns`,
`frameMsP95`/`watchdog`): `fevered-tell`, `freed-legibility`, `night-light-doctrine`,
`e1-night-shift`, `058-device-tiers`.

### The adjacent reds are pre-existing — established by a control, not by title-matching

Eight reds on the merged tree, **all clustered in exactly the light math this slice rewrites**. That
is where a real defect would surface, so a control run was mandatory rather than optional. Main
equivalence for the control arm was proven by an **EMPTY** `git status --porcelain -- src e2e` with
`HEAD == main`.

| Test | Merged | Clean main |
|---|---|---|
| `e1-night-shift:271` ramps full/dusk/dark/dawn lighting | red (both projects) | **red (both)** |
| `e1-night-shift:372` lantern post relights a true-dark ring | red (both) | **red (both)** |
| `e1-night-shift:435` lantern pool build island at true dark | red (both) | **red (both)** |
| `058-device-tiers:195` tier switch is render-only | red (desktop) | **red (desktop)** |
| `e1-night-shift:478` cold lantern relight survives run suspend | red (mobile only) | green |

Seven of eight reproduce on clean main with matching assertion shapes. The eighth is the red
inventory's documented **5.1% (2/39)** flake with an exact `TimeoutError: page.waitForFunction`
match.

The load-bearing number is the lantern-luminance assert at `:435` — the one assertion this slice could
actually break, since it measures light inside vs outside a lantern pool. It reads
**inside 0.1565 / outside 0.0660 merged** against **inside 0.1545 / outside 0.0652 on clean main**
(mobile). Within ~1%. The light math is not regressed.

### Perf numbers reproduce on the desktop arm

The fire shell reproduced the lane's reported after-numbers closely on desktop — 15.7 / 16.4 / 15.8 /
15.9 / 18.4 ms p95 across the five E1 maps against the lane's 18.2 / 16.4 / 15.7 / 18.7 / 17.9 — with
draw calls unchanged (±1). The mobile arm ran hot (the-claim 28.5 ms, driven work 6.00 ms/frame vs the
lane's 1.66), which is the fire shell's CPU ceiling (F-1269-1), not the slice.

## Findings

### F-1440-2 — 🔺 the slice's own spec encodes one machine's wall-clock as a permanent gate (WITHHELD)

`e2e/e1-perf-pass.spec.ts` does not measure its `before` arm in-run. It **reads it from a committed
artifact**, `artifacts/e1-perf-pass/census-before-<project>.json` (`:239`), and `STAGE` defaults to
`'after'` (`:8`). So every ordinary run, anywhere, compares its own wall-clock and draw calls against
the numbers one lane shell recorded on an M4 Max on 2026-08-03.

Both observed failures are that design, not the optimization:

- **desktop** — `e1-dry-gulch draw calls`, received **137**, expected `<= 136`. An off-by-one against
  a frozen baseline.
- **mobile** — `the-claim p95 regression`, received **28.5 ms**, expected `<= 25.05 ms`. Note 28.5 is
  comfortably under the real 33.4 ms shed line; the spec's own absolute assert at `:224` passed. What
  failed is the stricter *lean* line derived from the foreign baseline.

The spec is **not** in `claimedByAnotherConfig`, and `testDir: './e2e'` sweeps everything — so merging
it adds a permanently-red suite to every future full-suite run and it becomes red-inventory entry #11.

**Recommended cure (for the corrective, not applied here):** keep the machine-independent asserts that
already work — the 200-call budget, the 33.4 ms absolute shed line, the census publication and the
zero-console-error check — and put the cross-run baseline comparison (`:238`–`:246`) and the pixel
comparisons (`:137`, `:145`) behind an explicit opt-in env flag, so before/after becomes a deliberate
A/B tool the way `perf-ab-*.json` already is elsewhere in this repo. That is ~3 lines, but it is a
design decision on the runner's own gate, so it is written as a corrective rather than taken as a
fire-side drive-by. Generator proposes, contract disposes.

The census evidence is retained on main regardless — REPORT.md, both before/after censuses and all 20
screenshots — so the corrective has its baseline material and RETENTION is satisfied.

### F-1440-3 — 🟢 the red inventory's entry for `e1-night-shift:372` is stale in its assertion direction

`logs/suite-red-inventory.md` records that test failing with `toBeGreaterThanOrEqual`. Clean main today
fails it with `toBeLessThanOrEqual`. The inventory line is stale, not slice-caused — proven by the
control arm.

This is worth recording because the mismatch is exactly the kind of signal that *should* stop a drain:
a slice that rewrites light math, meeting a light-math red whose shape does not match the known-red
record. Title-matching alone (the F-1436-2 practice) would have waved it through; only the control run
could tell "stale record" from "new defect". The inventory's coordinates were also stale for all four
night-shift entries (`:450` vs `:435`, `:406` vs `:372`, `:359` vs `:271`, `:171` vs `:478`), which is
the ordinary coordinate rot F-1436-2 already describes.

### F-1440-1 — 🟡 the master was never registered in the goal tree

`drain-block-check` returned **UNKNOWN** for this slice — no leaf in `tasks/goals.json` matched. Per
§3.0 that is a Goal Registration Law bookkeeping finding, not a clearance. `lane-e1-perf-pass` was one
of the five masters the attended gate-walk campaign dispatched at 17:14–17:17; none of that batch
carried a leaf. Registered by this drain.

### F-1440-4 — 🟡 a lane with an undrained done-move had already been refilled

`tasks/queue/lane-d/lane-mill-horizon-copy.md` was sitting queued while `452eb747` was still
undrained, and lane-d read **BUSY**. Under LANE-SAFETY that ordering can destroy unmerged output via
the pre-flight `reset --hard` — the w1-03 / polish-02 shape. Nothing was lost: this fire archived the
tip as `archive/lane-perf-s1440-452eb747` as its first act, before gating. Recorded because the refill
came from outside the fire loop, so the lane-safety law's enforcement point does not cover it.

## Retention

- Lane tip archived: `archive/lane-perf-s1440-452eb747`
- Evidence on main: `artifacts/e1-perf-pass/REPORT.md`, `census-{before,after}-{desktop,mobile}-chrome.json`, `before/` and `after/` (20 screenshots)
- Withheld spec remains reachable in `452eb747` and in the archive ref
