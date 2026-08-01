# lane-d — F-1319-3: the terrain seed is re-parsed from the URL on EVERY noise hash, and it is not a headless problem

**FIRE-AUTHORED (attended review welcome)** — s1320, 2026-08-01.
**Role:** Codex runner, lane-d. **Workdir:** `worktrees/lane-d` (branch `lane/perf`).

---

## READ FIRST (paths, in this order)

1. `tasks/BACKLOG.md` — the **F-1319-3** row (s1319's measurement) **and the F-1320-1 row directly
   below it** (s1320's attribution, which supersedes both of F-1319-3's hypotheses). F-1320-1 is your brief.
2. `src/world/Terrain.ts:1619-1622` — `terrainSeed()`, the defect. Four lines.
3. `src/world/Terrain.ts:1636-1639` — `terrainHash()`, which calls `terrainSeed()` **once per hash**.
4. `src/world/Terrain.ts:1624-1634` — `valueNoise()`, which calls `terrainHash()` **four times**.
5. `src/world/Terrain.ts:165` (`sample`) and `:417-422` — the fan-out that makes one terrain sample
   cost ~36 URL parses.
6. `reviews/ap-07-night-shift-fixtures.md` §F-1319-3 — the drain that first saw the wall-time regression.

---

## WHY (evidence, measured 2026-08-01 by s1320, all numbers reproducible)

`terrainSeed()` reads the run seed by constructing **a new `URLSearchParams` from
`window.location.search` and re-running `normalizeSeed` (an FNV hash over the seed string)** — and it
does this **on every single call**. `terrainHash()` calls it once per hash; `valueNoise()` calls
`terrainHash()` four times; `sample()`/`terrainFeatures()` call `valueNoise()` ~9 times. **One terrain
height sample therefore costs roughly 36 URL parses and 36 string hashes.**

**A `--cpu-prof` of one `e1-night-shift` headless episode (19.85 s, 2,618 samples) attributes the run:**

| self time | share | frame |
| ---: | ---: | --- |
| 8,218 ms | **41.4%** | `parseParams` (`node:internal/url:1259`) |
| 2,790 ms | 14.1% | `normalizeSeed` (`src/core/Rng.ts:20`) |
| 1,782 ms | 9.0% | `URLSearchParams` ctor (`node:internal/url:337`) |
| 1,403 ms | 7.1% | `terrainHash` |
| 826 ms | 4.2% | `terrainSeed` |
| 516 ms | 2.6% | `get search` (`node:internal/url:534`) |

**~67% of the episode is URL parsing to re-derive a constant.**

### The four arms, same box, same seed `e1-night-shift-01`, 3 runs each

`advanceCpuMs` is the sim's **own** instrument (`HeadlessContractSim.ts:114/225/229`) and counts the
tick loop only — construction is excluded, which is what makes this attribution airtight.

| arm | advanceCpuMs | wall | `eventLogHash` |
| --- | ---: | ---: | --- |
| main, 7 wrecked fixtures | **19,048–20,000** | 20,225 | `fnv1a32:c086ef19` |
| fixture loop neutered (0 fixtures) | 1,660–1,754 | 2,556 | `fnv1a32:84c22e10` |
| 7 fixtures placed **not wrecked** | 2,614–2,721 | 3,478 | `fnv1a32:f0bfb566` |
| main + seed memoised (naive) | **2,174–2,198** | 2,982 | `fnv1a32:c086ef19` |
| main + seed cached, keyed on `search` | **3,670–3,704** | 4,474 | `fnv1a32:c086ef19` |

Both s1319 hashes (`84c22e10`, `c086ef19`) were reproduced exactly, so the before/after table is
independently confirmed. `timeMs` is `126167` in **every** arm — identical tick count (3,785 at
`STEP_SECONDS = 1/30`), so every comparison is per-tick apples-to-apples.

**What this settles.** F-1319-3 offered two candidate causes and both are now refuted:
- *"per-fixture `placeFree` cost at construction"* — **refuted.** `nonTickMs` (vite boot + module
  transform + construction + the whole fixture loop) is **indistinguishable between arms**
  (801–949 ms with no fixtures, 482–1,178 ms with seven).
- *"seven extra structures widening every scan"* — **refuted as the main cause.** Seven *working*
  lanterns cost +970 ms; flipping those same seven to `wrecked` costs a further **+16,730 ms**. The
  structure count is ~6% of the delta.

Wrecked fixtures were never the disease — they were the **symptom that made it measurable**, because
wrecked instances alone fall through `updateRepairs`' cheap `continue` (`BuildSystem.ts:2117`) into
`terrainMaxForFootprint` every tick.

### ⚠️ This is NOT a headless-only defect, and that is the real reason to fix it

`terrainSeed()` returns `0` early only when `typeof window === 'undefined'`. **In a browser `window` is
always defined**, so the shipped game pays the same ~36-parses-per-sample on every terrain sample —
including `Terrain.sample`, which the hero's ground-height lookup calls **every frame**
(`HeadlessContractSim.ts:273` mirrors the production call). The headless runner did not create this
cost; it merely has no frame budget to hide it in. **Treat the browser frame cost as the primary
finding and the 8.6× headless tax as the evidence.**

---

## SCOPE (numbered; each item testable)

### 1. MEASURE FIRST — and this scope can CANCEL the task

Reproduce the `main` and `no-fixtures` arms above before changing anything, and state whether your
numbers reproduce s1320's. Use the sim's own `gr-sim speed: N waves/s` stderr line to recover
`advanceCpuMs` (`waves / wavesPerSec × 1000`).

- If the two `eventLogHash` values do **not** reproduce (`c086ef19` with fixtures, `84c22e10`
  without), **STOP and report** — the tree has moved under this brief and the numbers below are stale.
- If your ratio is far from ~11× on `advanceCpuMs`, say so plainly. **A disagreement is itself the
  finding.**

### 2. Cache the terrain seed — and choose the invalidation strategy deliberately

The seed cannot change without something rewriting `location.search`. Both options below are
**bit-for-bit behaviour-neutral** in the measured arms; they differ in speed and in risk:

- **(a) key the cache on the raw `window.location.search` string** — drop-in, self-invalidating,
  no call sites to remember. Measured **3,670 ms (5.1×)**. The residual is the `search` *getter*
  itself, which re-serialises the query on every access.
- **(b) memoise once + explicit invalidation** — measured **2,174 ms (8.8×)**, but it requires every
  site that rewrites the seed to call the reset. Those sites exist and you must enumerate them
  yourself: `src/main.ts:204/219`, `src/meta/DebugEraSeed.ts:35`,
  `src/diagnostics/DeterminismHarness.ts:68`, `src/town/TownScene.ts:1143` all use
  `history.replaceState`/`pushState`, which do **not** reload. (`src/main.ts:247` and
  `src/charter/PressPanel.ts:288` assign `location.href`, which does reload — those are safe either way.)

**Recommendation: (a).** It is 5.1× for four lines with no coupling to remember, and a missed
invalidation site in (b) would produce *wrong terrain*, which is far worse than 1.5 s. If you prefer
(b), you must show the enumeration is complete and add a guard that fails when a new seed-rewriting
site appears — **do not hand-wave the completeness of that list.**

⛔ Do **not** "fix" this by widening the `typeof window === 'undefined'` early-out to detect headless.
That would leave the browser — the case that actually matters — paying the full cost, and would turn a
real defect into a hidden one.

### 3. Guard it, and make the guard RED at its own birth commit

A perf cure with no guard silently regresses the first time someone inlines the call back. Add a guard
that fails if the seed is re-derived per sample. Prefer a **direct** instrument over a wall-time
threshold (wall-time guards flake under load and get their timeouts raised, which hides the
regression — F-1319-3's own closing note):

- Preferred: count the derivations. Have the test observe that N `Terrain.sample` calls perform
  **O(1)** seed derivations, not O(N) — e.g. by spying `URLSearchParams` or by exporting a counter.
- Acceptable fallback: assert `advanceCpuMs` for one `e1-night-shift` episode is under a ceiling with
  real headroom, **and** say in the report why the direct instrument was not practical.

**Prove the guard REDs by reverting your own cure**, not by reasoning about it: restore
`terrainSeed()` to its shipped four lines, observe RED, paste the failure text, re-apply, observe
GREEN. **A report without that manufactured RED is a pre-declared REJECT** — s1319 merged a guard
whose assertion had become a theorem of the code it guarded (F-1319-2), and this task must not repeat it.

### 4. Determinism is the acceptance condition, not a nicety

`eventLogHash` **must stay `fnv1a32:c086ef19`** for the with-fixtures arm across your change. It did
for both options in s1320's measurements. If it moves, your cache is changing terrain — **stop and
report**, do not adjust the expected hash.

### 5. Report the browser-side number you are NOT being asked to cure

State, with a measurement, what the per-frame saving looks like in the real game (a `performance.now()`
bracket around the hero ground-height path, or a profile of a plain boot). **Report only** — do not
start a rendering-side optimisation pass. The point is to size the finding for the owner.

---

## FIREWALL

**TOUCH-ONLY:** `src/world/Terrain.ts` (the `terrainSeed` function only; plus a reset export if you
choose 2(b)) · the seed-rewriting call sites listed in scope 2 **only if** you choose 2(b) · your new
guard spec · `artifacts/f1319-3-terrain-seed-per-sample-url-parse/**` (report + evidence).

**NO:**
- ⛔ `src/core/Rng.ts` — `normalizeSeed` is correct and is hot only because it is called too often.
  Do not micro-optimise it; that would mask the real defect.
- ⛔ `src/systems/BuildSystem.ts` — `updateRepairs`/`terrainMaxForFootprint` are the *caller* that made
  this visible, not the bug. Tempting and out of scope. Report anything you notice.
- ⛔ `src/sim/HeadlessContractSim.ts` and `scripts/gr-sim.mjs` — measure with them, do not change them.
- ⛔ **Do not raise the `timeout: 30_000` in `scripts/gr-sim.test.mjs`.** If your cure works, that
  timeout gains ~16 s of headroom on its own. Raising it is the one action F-1319-3 explicitly names
  as hiding the finding rather than fixing it.
- ⛔ Do not change terrain shape, `Balance.wreck.*`, or any contract JSON.
- ⛔ `e2e/tl-01-run-telemetry.spec.ts` — its *"plain no-debug secure return"* case is a deterministic
  known red on both projects. Do not repair it, do not add assertions to it.

---

## SELF-CHECK (name the exact commands and paste real numbers)

- `npx tsc --noEmit` → clean.
- `npm run build` → green.
- `node --test scripts/gr-sim.test.mjs` → green, and report the night-shift case's wall time
  **before and after** (it is the finding's own near-miss: 19.9 s against a 30 s timeout).
- Your new guard spec → both projects, `--workers=1`.
- Adjacent, **derived by grep, not inherited**: run `grep -rln "Terrain.sample\|valueNoise\|terrainSeed" e2e src`
  yourself and run every spec it names. Terrain is load-bearing for far more than it looks — determinism,
  placement, and camera specs all read it. Report the list you actually ran.
- `npm run test:node-guards` → derive the count at **both** ends and report the delta with the file
  list you ran (s1319 measured **205**; 203 is the known signature of an omitted file).
- Zero console/page errors, desktop **and** 390 px mobile.
- Screenshots → `artifacts/f1319-3-terrain-seed-per-sample-url-parse/{desktop,mobile}-chrome.png`.
  Terrain must look **identical** to main — that is the visual half of the determinism claim.
- **Write `artifacts/f1319-3-terrain-seed-per-sample-url-parse/report.md` as a FILE**, not only as
  your closing message (F-1318-3).

**READY-FOR-GATES** — report: the scope-1 arms and whether they reproduce s1320's; which invalidation
option you chose **and why**; the manufactured RED with its failure text and the byte-exact
re-apply; the `eventLogHash` at both ends; the gr-sim test's before/after wall time; the derived
adjacent list and its results; node-guards at both ends; and your scope-5 browser-side number.
