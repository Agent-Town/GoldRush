# fe2cs2-1 — publish coal seams on the agent view

**Slice:** `fe2cs2-1-publish-coal-seams-on-the-view`
**Branch:** `lane/c` · **Tip:** `cdc29b717` · **Base:** `bbceb43a55ab6d98e47962cb099dd899adfcc1bc`

## Verdict

**HOLD — DO NOT MERGE.** The feature is correct and its own guard is honest, but the one-line
import that delivers it drags a **Vite-only module into the plain-node collection graph** and
**silently zeroes the entire playwright suite**: `npx playwright test --list` goes from
`Total: 2958 tests in 425 files` to `Total: 0 tests in 0 files`.

Corrective master authored and queued in the same commit as this review:
`tasks/fe2cs2-2-coal-seam-defaults-node-safe.md` → lane-c, BUILD-ON-PREDECESSOR over
`cdc29b717`.

## What it does

`src/agent/View.ts` publishes `stablePrefix.map.coalSeams` beside the existing `map.seams`, so a
rider can read where a pressure contract's coal lies. Contract-authored `twist.coalSeams` win;
a pressure contract that declares none falls back to `DEFAULT_COAL_SEAMS`; a non-pressure
contract publishes `[]`. `scripts/coal-seams-on-the-view.test.mjs` pins all three arms with real
coordinates. That part is good work and the corrective should preserve it unchanged.

## The blocking finding

**F-2143-3 (BLOCKING) — `View.ts` reaches a Vite-only module and the whole e2e suite stops
collecting.**

The chain, read link by link and then proved by isolation:

| Link | Evidence |
|---|---|
| `src/agent/View.ts` (new) | `import { DEFAULT_COAL_SEAMS } from '../systems/PressureSystem';` |
| `src/systems/PressureSystem.ts:5` | `import * as Terrain from '../world/Terrain';` |
| `src/world/Terrain.ts` | the repo's only importer of `assets/layer-contracts/m1-core.layer-contract.v1.json?raw` |

Under Vite that `?raw` suffix is a loader directive; under plain node it is a JSON module without
an import attribute, so loading throws
`TypeError: Module "…m1-core.layer-contract.v1.json?raw" needs an import attribute of "type: json"`
**during playwright's config/collection pass**, and collection yields zero files.

**Isolated by reverting exactly one file**, everything else left merged:

| Tree | `npx playwright test --list` |
|---|---|
| merged (main + `lane/c`) | rc 1 — `Total: 0 tests in 0 files`, `?raw` TypeError present |
| merged, `src/agent/View.ts` reverted to main | **rc 0 — `Total: 2958 tests in 425 files`**, no TypeError |

`View.ts` restored byte-identically afterwards (SHA-256
`89d11a4f216fe39551fbcebafc451bfd398cdc1890a4d792b580560d84bc6796` before and after, by content
compare).

**Why this is severe rather than cosmetic:** a suite that collects zero tests does not go red, it
goes *empty*. Every playwright gate downstream of this merge would pass by running nothing — the
Mistake #10 shape, at the scale of the whole e2e surface. `scripts/whole-suite-collection.test.mjs`
exists for exactly this and caught it on the first battery.

**The runner is not at fault.** Its report says plainly *"Full `test:node-guards` remains owed by
the drain, as required"*, and `tsc`, `build`, its focused test and `gate-caller-audit` are all
genuinely green — none of them collect the playwright suite. This is the drain's job and the
division worked.

**The cure** (specified in the corrective): `DEFAULT_COAL_SEAMS` is a three-element coordinate
list with no runtime dependencies, used by `PressureSystem` and now by `View`. Move it to a
node-safe leaf module and have **both** import it from there — one definition, no duplication, and
`View.ts` stops reaching into a THREE.js/Terrain-bearing system module for a constant.

## Gate battery (merged tree, detached `gate-s2143`)

`npm run test:node-guards` — **489 tests · 480 pass · 4 fail · 5 skipped**. The four reds resolve to
**two** subjects, and only one is this slice's:

| Red | Attribution | Evidence |
|---|---|---|
| `whole suite collects without loading Vite-only modules` | **THIS SLICE** | passes ALONE on main (rc 0); fails ALONE on the merged tree; cured by reverting `View.ts` only |
| `whole-suite collection guard is cwd-invariant` | same cause | its child is the test above |
| `all 34 scripts/*.test.mjs fixture owners remove their temp directories` | same cause | its child is the test above |
| `same-game report exemption reasons and citations match source` | **INHERITED — NOT THIS SLICE** | fails ALONE on main at `21425bf1d (archive: pruned by the A3 rewrite)`: `stale exemption reason for 'e2-incline' — regenerate with node scripts/same-game-audit.mjs --write-report` |

Three of the four reds are one defect wearing three names, which is why the count was resolved to
subjects before any verdict was formed.

## F-2143-4 (non-blocking, inherited) — main carries a stale generated report

`docs/bench/same-game-audit.md` is stale against `assets/contracts/**` on main **before** this
merge, and `scripts/same-game-report-guard.test.mjs` reds on it standing alone. It arrived with the
attended e5-stillwater admission (`508d37de0`), whose own working tree still held an uncommitted
edit to that file at the time this fire read it — i.e. the regeneration was in flight, not skipped.
**Not this slice's to fix and deliberately not fixed here** (regenerating a generated file inside an
unrelated drain is how attribution gets lost). Whoever next touches the bench regenerates it with
the command the guard itself names.

## F-2143-5 (non-blocking, observation) — the new guard construts at a parameterisation its consumer does not use

`scripts/coal-seams-on-the-view.test.mjs` builds `HeadlessContractSim` with `admissionProbe: true`;
the campaign harness builds it **without**. This is the standing F-2141-2 hazard, filed one fire
earlier against a different guard, recurring immediately in the next slice to ship a pinned view
guard. Benign here — the field is assigned unconditionally in the view builder, not behind a probe
branch — but the corrective should pin at least one arm **without** `admissionProbe` so the guard
answers the question its consumer actually asks.

## Merge classification (recorded for the corrective's drain; nothing merged)

Base `bbceb43a`.

| Path | Class |
|---|---|
| `src/agent/View.ts` | LANE-ONLY |
| `scripts/coal-seams-on-the-view.test.mjs` | LANE-ONLY (new) |
| `package.json` | **BOTH-MOVED** — grafted by hand |

The `package.json` graft is already solved and the resolution is recorded here so the next drain
does not re-derive it: both sides prepend exactly one new guard to `test:node-guards`
(`scripts/campaign-harness-terrain.test.mjs` from this fire's own f2142-1 merge,
`scripts/coal-seams-on-the-view.test.mjs` from lane/c). **Keep both**; the two sides were proved
identical after stripping their respective prepends, so no other change is hiding in that hunk.
