# lb-03-bench-seed-sets — THE BENCH gets the frozen seed set its ratified law already required

**Slice:** `lb-03-bench-seed-sets` · **Branch:** `lane/m4` · **Tip:** `307eb766` · **Drained:** s1222, 2026-07-29
**VERDICT: PASS — merged.** Every gate re-run by the drain on the merged tree, not inherited from the runner's report. Two non-blocking findings (F-1222-1, F-1222-2), both recorded below with a corrective each; neither touches behaviour.

## What it does

`specs/agent-play/README.md:61` has said since the day it was ratified that *"bench runs use a frozen seed set per contract (comparability)"*. Until this merge that law had **no mechanism**: `Game.ts` decided the mode as `pinnedSeed === null ? 'live' : 'bench'`, so `seedMode:'bench'` was asserted by the mere **presence** of a `?seed=` parameter, against no set at all, and `standings.ts` accepted the claim with nothing to check it against. This slice supplies the set and both ends of the check.

1. **The frozen set as its own artifact** — `assets/contracts/bench-seeds.json`, a map from `contractId` to an ordered, non-empty, duplicate-free array of seeds. It covers **all five** `epoch-1-frontier` contracts (`the-claim`, `e1-dry-gulch`, `e1-night-shift`, `e1-twin-banks`, `e1-baron`), 3 seeds each, 15 total. **No `contracts.json` was touched** — the master's trap (a field on the contract manifest becomes a player-**editable** field in the Charter Press via `contractDescriptorJson`'s whole-object stringify, so the "frozen" set would be editable in the same commit that froze it) was correctly avoided.
2. **Client** (`Game.ts:5512`, one commented early return): a pinned seed that is **not** a member of its contract's set submits **nothing**. Neither bench (not comparable) nor live (not a live seed).
3. **Server** (`standings.ts:147-149`): a `seedMode:'bench'` claim whose seed is not a member returns `400 bad_bench_seed`. `seedMode:'live'` rows are untouched; the GET board projection is unchanged and the board-blindness assertions still pass unmodified.
4. **A node guard over the data** (`scripts/bench-seeds.test.mjs`), wired into `test:node-guards`: every Frontier contract has a set, every key is a known contract id, every array non-empty, no duplicate seed within a contract, every seed a non-empty string ≤256 chars.

The sharpest thing this closes: `DebugParams.ts:41-42` makes `?bench=fullbase` inject seed `'perf-02-fullbase'` **and `timescale: 24`** — so before this merge, a performance-harness run at 24× speed that happened to secure submitted itself as a **BENCH** row into the corpus the owner intends to compare models on. It now submits nothing.

## Evidence (all re-run by the drain on the merged tree)

| Gate | Result | Note |
|---|---|---|
| `test:node-guards` | **75/75 pass, 0 fail** (15.9 s) | 74 → 75; the new `bench-seeds` guard is the 75th. Runner's claim reproduced exactly. |
| `test-ticker-stats.mjs` | pass | the second half of the `test:node-guards` script |
| `npx tsc --noEmit` | clean, no output | |
| `npx tsc` | clean, no output | |
| `npx vite build` | **✓ built in 1.54 s** | `asset-diet` chunk table normal |
| `npx playwright test --list` | **2464 tests in 344 files** | main baseline was 2460/344; +4 = 2 new tests × 2 projects. Runner's "integrated expectation 2464/344" confirmed. |
| `e2e/lb-01-county-standings.spec.ts` | **16 passed (28.4 s), exit 0** | literal line: `Running 16 tests using 2 workers`. desktop-chrome + mobile-chrome. |
| `e2e/release-build.spec.ts` under `playwright.release.config.ts` | **26 passed (1.2 m), exit 0** | ⚠️ the master's explicit adjacent gate. The runner saw **25/26** under full load and fingerprinted it to a pre-existing mobile GLTF blob-texture red with a matched pre-LB-03 control; **on the merged tree, at drain load, it is 26/26.** Includes `debug and era query seams are inert`. |
| `scripts/probe-plain-boot-console.mjs` (the committed probe) | **PROBE CLEAN**, exit 0 | desktop 1280×800 **and** mobile 390×844; errors 0, warnings 0, pageErrors 0 in both. Console types seen: `debug, info` only. |
| Mutation control | **red as required** | see below |

**Gate isolation:** lane-a (`e2-rail-tough-only-bind`, from 19:54) and lane-d (`standing-orders-wave-early-seam`, from 19:09) were **live on Codex for the whole drain**. The default playwright config's `baseURL` is `http://127.0.0.1:5188`, which the lane worktrees share (and `reuseExistingServer: false`), so every browser gate ran against a **scratch dev server on port 5231** via `GR_CAPTURE_BASE_URL` + `GR_CAPTURE_EXTERNAL_SERVER=1` (Mistake #12). Neither live lane was touched.

### Mutation control — the test is not tautological

The one assertion worth doubting is the client early return, because it is the owner-reversible ruling and it has the widest blast radius. I mutated **the subject, not the guard**: `Game.ts:5512` replaced by `// MUTATION: guard disabled`, nothing else changed.

```
✘ lb-01-county-standings.spec.ts:316 › secure skips county submission for a pinned seed outside the frozen set
  Error: expect(received).toEqual(expected)
  - Expected  -  1        (posts === [])
  + Received  + 19        (a POST body appeared)
  EXIT CODE: 1
```

Restored byte-identically afterwards — `git hash-object src/game/Game.ts` = `30fa8591…` = `git rev-parse 307eb766:src/game/Game.ts`.

### The server rejection's safety premise, verified at source rather than inherited

The master made item 3 conditional on a claim it ordered the runner to re-verify: that no deployed client can emit `seedMode:'bench'`, so tightening a public contract (F-1216-2's hazard) cannot bite. **✓ VERIFIED by reading `src/core/DebugParams.ts:31-41`:** `const RELEASE_E1 = typeof __GR_RELEASE_E1__ !== 'undefined' && __GR_RELEASE_E1__` and `readDebugParams` opens with `if (RELEASE_E1) return DEFAULT_PARAMS;` — **before** the URL is parsed — and `DEFAULT_PARAMS.seed` is `null` (`:18`). So in the E1 release build `getDebugSeed()` is unconditionally `null` ⇒ `seedMode` is unconditionally `'live'` ⇒ no release client emits `bench`. The release suite's `debug and era query seams are inert` passing on the merged tree is the runtime half of the same proof. The rejection is safe.

### Blast radius of the client early return, measured

`grep -rln "api/standings\|submitCountyStanding\|standings" e2e/ scripts/` returns **exactly one file**: `e2e/lb-01-county-standings.spec.ts`. `submitCountyStanding` is the only submitter and its only exerciser is the spec this slice updates. Nothing else in the suite runs with a pinned seed and expects a POST.

## Merge classification

Base: `lane/m4` merge-base with main is `058762f9`, which is stale enough that the two-dot `main..lane/m4` diff shows **171 files / −32,507 lines** — almost all of it main's own later work reading backwards as deletions. **That diff is not the slice.** The three commits below the tip (`6c6ecd57` bench-fields, `d7edcd3b` county-standings, `c162bd1a` approach-convergence-class) are already-shipped tip-graft residue; the branch is falsely 4-ahead.

The slice is the tip commit `307eb766` alone, six files. Classified per file by blob identity — **for every one, the branch's parent blob is identical to main's blob**, i.e. main moved none of them:

| File | parent blob | tip blob | main blob | Class |
|---|---|---|---|---|
| `assets/contracts/bench-seeds.json` | absent | `8a8dbb42` | absent | new, LANE-TOUCHED |
| `scripts/bench-seeds.test.mjs` | absent | `755d1b67` | absent | new, LANE-TOUCHED |
| `e2e/lb-01-county-standings.spec.ts` | `74f0100b` | `757831e2` | `74f0100b` | LANE-TOUCHED, clean apply |
| `functions/api/standings.ts` | `bc0c29f9` | `7591e39b` | `bc0c29f9` | LANE-TOUCHED, clean apply |
| `package.json` | `4b28984f` | `de9371c1` | `4b28984f` | LANE-TOUCHED, clean apply |
| `src/game/Game.ts` | `5b53586d` | `30fa8591` | `5b53586d` | LANE-TOUCHED, clean apply |

**No MAIN-MOVED file, no 3-way graft, no conflict.** Merged by `git checkout 307eb766 -- <the six paths>`, path-scoped.

## Findings

**F-1222-1 — the frozen-set artifact ships UNVERSIONED, though the master asked for a versioned map.** *(non-blocking, informational)*
Scope item 1 said *"a **versioned** map from `contractId` → a frozen, ordered, non-empty array"*. `bench-seeds.json` is a bare `{contractId: string[]}` object with no `version` key, and the guard neither expects nor checks one. Consequence: the first schema evolution this artifact needs — per-epoch keying (see F-1222-2), seed metadata, a retirement marker — has no discriminator, and a server importing it cannot tell an old shape from a new one. Nothing is wrong today; this is cheap now and expensive later. **Corrective:** one BACKLOG line, folded into whichever rung next edits the artifact.

**F-1222-2 — the artifact keys on `contractId` alone while the server keys on `(epochId, contractId)`, and nothing enforces the uniqueness that makes that safe.** *(non-blocking, latent — measured, not asserted)*
`standings.ts` validates with `knownContract(epochId, contractId)`, a **pair**; the membership check added at `:147` looks up `benchSeeds[contractId]`, an **id alone**. I measured whether that is currently ambiguous rather than reasoning about it: across all ten epoch bundles there are **41 distinct contract ids and 0 ids present in more than one epoch** — so today the id determines the epoch and the lookup is sound. But **nothing asserts that**. The new guard builds `knownContractIds` as a flat `Set` over all ten bundles, which *assumes* global uniqueness rather than checking it. If a later epoch ever reuses an id, two epochs silently share one frozen seed set — which is precisely the comparability property the law exists to protect — and the guard would not notice. **Corrective:** add one assertion to `scripts/bench-seeds.test.mjs` that contract ids are globally unique across the ten bundles, so the day the premise breaks the guard says so. Folded to BACKLOG; not worth a lane task on its own.

## Deliberately unsettled — carried to the OWNER'S DESK

Both were flagged by the master as out of scope, and the runner correctly did not invent either.

1. **How is a bench run ever LAUNCHED in a release build?** The corollary of the verified `RELEASE_E1` fact is that bench mode is **unreachable in the shipped game** — the very property that makes the server rejection safe also means no genuine bench row can be produced by a player. Adding a door is a debug-door-in-release **design fork**. (This is the same substance as the standing F-1220-1 desk item; LB-03 sharpens it rather than answering it.)
2. **Is "a non-member pinned seed submits nothing" the ruling the owner wants?** Implemented as one commented early return at `Game.ts:5512`, reversible in one line. The alternative — label it `live` — pollutes the live board with pinned-seed runs, which is the same comparability breach pointed the other way. **Veto window open.**
