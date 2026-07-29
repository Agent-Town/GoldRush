# ap-view — THE VIEW + THE ALMANAC (lane-ap-view)

**Slice:** `lane-ap-view` · **branch:** `lane/e2-arsenal` · **tip:** `c502f9cc` · **base:** `2fb016e7`
**Salvage ref:** `save/ap-view-c502f9cc` (pinned this fire — the lane pre-flight `reset --hard`s, and this work is unmerged)
**Drained by:** s1213 fire, 2026-07-29
**§3.0 drain-block-check:** `? UNKNOWN` — no goal leaf matched the master. Per §3.0 that is a **Goal Registration Law bookkeeping finding, not a clearance** (F-1213-2, closed in this fire's commit).

## VERDICT: **REJECTED — DO NOT MERGE.** Blocking regression F-1213-1: the slice makes the entire e2e suite uncollectable (2458 tests → 0).

The slice is *good work* — it is faithful to its firewall, it reuses `StatSimHarness` instead of building a second simulator as the master demanded, and its own spec is thorough. It is rejected for one import edge, not for its design. The cure is small and named below.

## What it does

`src/agent/View.ts` (+584) builds the rider's read of a run in the cache shape the spec asks for: a **stable prefix** (contract briefing digest, map digest, current orders), an **append log** (one entry per wave: outcome, gold delta, works hp, kills, surprises), a **NOW** block, and **THE ALMANAC** — next wave's composition and arrival time plus a `runStatSimHarness`-backed projection of leaks/works-damage/gold, labelled `the Almanac reckons` and stamped with a `fnv1a32:` harness hash. It is exposed as `et.goldrush.view` on the tool surface and as a `window.__GR_AGENT__.view` getter. `e2e/agent-view.spec.ts` (+351) snapshots the view at wave 3, asserts prefix stability across waves, append-log growth, and bounded projections.

## F-1213-1 — BLOCKING — the whole e2e suite stops collecting

**Measured, four arms, one variable:**

| Arm | `scripts/whole-suite-collection.test.mjs` | `npx playwright test --list` |
|---|---|---|
| clean main (`70e244f2`) | **pass 1 / fail 0** | **Total: 2458 tests in 343 files** |
| main + this slice (grafted) | pass 0 / **fail 1** | **Total: 0 tests in 0 files** |
| grafted, new spec removed | pass 0 / **fail 1** | Total: 0 tests in 0 files |
| main restored | **pass 1 / fail 0** | Total: 2458 tests in 343 files |

**Error:** `TypeError: Module ".../assets/layer-contracts/m1-core.layer-contract.v1.json?raw" needs an import attribute of "type: json"`

**Mechanism (traced, not inferred):**
`src/agent/ToolSurface.ts` gains a **value** import `import { buildView } from './View'` → `src/agent/View.ts:6` `import { nodeAnchors } from '../world/Terrain'` → `src/world/Terrain.ts:2` `import terrainContractText from '../../assets/layer-contracts/m1-core.layer-contract.v1.json?raw'`. The `?raw` suffix is a **Vite-only** specifier. Playwright's Node-side collection resolves it literally and throws — so **every spec that imports `ToolSurface` dies at collection**, and playwright reports zero tests for the whole run.

**Why the runner reported green, and why this is the interesting part:** the slice's own spec imports View with `import type { AgentView }`, which is *erased*. Run `agent-view.spec.ts` **in isolation** and it passes — nothing pulls the value import. The defect only appears when the suite is collected **as a whole**, which the drain minimum never does. The third arm above is the proof: removing the new spec does **not** cure it. The spec was never the carrier; `ToolSurface.ts` is.

➡️ ***A slice's own spec passing in isolation says nothing about whether the suite can still be collected.*** The only instrument that saw this was `npm run test:node-guards`.

## F-1213-2 — the master had no goal leaf

`drain-block-check` returned `UNKNOWN` for `20260729-125850-lane-ap-view.md`. Grepped `ap-view` against the whole of `tasks/goals.json`: **never registered**, rather than registered-and-blocked. Closed in this fire's commit with an honest `blocked` status pointing at F-1213-1.

## F-1213-3 — the master's own premise is false (non-blocking, but it misled the runner)

Scope 3 told the runner: *"full build only (release compiles the agent surface out already — **verify, do not change that**)"*. **It does not.** `src/game/Game.ts:2054` calls `installAgentStub(...)` unconditionally; `AgentStub.ts:153` calls `installToolSurface(game, options)`; there is no `__GR_RELEASE_E1__` guard anywhere in `src/agent/`. Only the `window.__GR_AGENT__` *exposure* is debug-gated (`AgentStub.ts:54`). The runner, told to verify an untrue premise, compensated by **adding** `!__GR_RELEASE_E1__` gating to the tool registration — which forced an `as GoldRushToolSurface['tools']` cast to silence the now-optional `view`. That cast disables type-checking on the **entire** tools object, not just `view`. Any re-land should fix the premise, not inherit the cast.

## THE `et.goldrush.view` NAME COLLISION — RULED: **WRAP** (F-1212-5, carried from s1212)

Two runners who could not see each other both claimed `et.goldrush.view` from one spec section. **The ruling, and its evidence:**

- `specs/agent-play/README.md:19,41,42` defines **THE VIEW** as *"a state summary the game composes"* + *"THE VIEW includes simulated futures"* + *"THE VIEW is an append-only run log behind a stable prefix"*. That is **View.ts's payload**, verbatim. The spec **never names a tool id**, so this is not an owner design fork — it is a spec reading.
- AP-06's `view` returns `standingOrders.snapshot()`, which is an **orders** concern, not THE VIEW. AP-06 squatted the name.
- **But AP-06 shipped, with a live consumer:** `e2e/ap-standing-orders.spec.ts:72,116` read `view().outcome.result` / `.result.orders`. The incoming payload has **no `result` key**, so a blind supersede breaks a green spec — and editing a sibling's shipped spec to agree is the forbidden move.

➡️ **RULING: WRAP, not supersede.** One tool, both readings: `result` keeps AP-06's snapshot and its consumer; `state` carries View.ts's payload. Neither design is deleted. This was implemented and type-checked clean this fire (tsc 0, build 1.66 s) before F-1213-1 forced the rejection — the wrap is *proven to compile*, and the re-land should adopt it verbatim:

```ts
view: () =>
  makeReceipt('et.goldrush.view', EMPTY_ARGS, {
    ok: true,
    result: standingOrders.snapshot(),   // AP-06 — consumer preserved
    state: buildView(game),              // the spec's THE VIEW
    economyLog: [],                      // ap-view asserts [] at agent-view.spec.ts:283; AP-06 asserts nothing here
  }),
```
`economyLog` is the one field where the two genuinely conflict. Taking `[]` (the incoming's) is safe: no `src/` consumer reads `view().outcome.economyLog`, and AP-06's spec never asserts it — verified by grep, not assumed.

## Gates run

| Gate | Result |
|---|---|
| `npx tsc --noEmit` (with wrap) | **0 errors** |
| `npm run build` | **green, 1.66 s** |
| `test:node-guards` → `whole-suite-collection` | **FAIL — F-1213-1** |
| `npx playwright test --list` | **0 tests in 0 files** (blocks all further gating) |
| own spec / adjacent suites / boot probe | **NOT RUN — impossible; nothing collects** |

The battery stopped where it stopped honestly: with zero tests collectable, no spec result on this tree would have meant anything.

## Merge classification

Base `2fb016e7`; real delta is 3 files (+958) — `main..c502f9cc` shows ~17.5k deletions which are **stale-base phantoms**, not real removals. `src/agent/View.ts` and `e2e/agent-view.spec.ts` are **pure adds** (LANE-TOUCHED, no main movement). `src/agent/ToolSurface.ts` is the only **both-moved** file — main gained AP-06's orders+view, the lane gained view+View import — hand-merged as the wrap above. **Nothing merged to main. Main's `src/` and `e2e/` are byte-identical to `70e244f2`.**

## The cure (for the corrective — options, with the gate that decides it)

The re-land must break the `ToolSurface → View → Terrain` value-import chain at collection time. Candidates, implementer's choice:
1. **Drop the `Terrain` import from `View.ts`** — take the node anchors off the passed-in `AgentViewSource`/diagnostics instead of importing the module. Likely smallest.
2. **Lazy-load** `buildView` behind the existing `__GR_TEST__`/debug path so `ToolSurface` keeps only `import type`.
3. **Make `Terrain.ts`'s contract import node-safe** (`readFileSync`/JSON import attribute). Widest blast radius; touches core — needs its own firewall.

**GATE (non-negotiable, and it is the whole point):** `node --test scripts/whole-suite-collection.test.mjs` passes **and** `npx playwright test --list` reports its full `Total: NNNN tests in 343 files` — *before* any spec-level claim is made.
