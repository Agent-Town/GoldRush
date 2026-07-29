CODEX: model=gpt-5.6-sol effort=xhigh
# ap-view-collection-firewall — RE-LAND THE VIEW so the suite still collects
**FIRE-AUTHORED (attended review welcome)** — s1213, 2026-07-29.
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.

## WHY
`lane-ap-view` (`c502f9cc`) was **gated and REJECTED** by the s1213 fire — see `reviews/ap-view.md`, finding **F-1213-1**. The slice itself is sound and is NOT being asked for again from scratch. It failed for exactly one reason:

`src/agent/ToolSurface.ts` gained a **value** import of `buildView` → `src/agent/View.ts:6` imports `nodeAnchors` from `../world/Terrain` → `src/world/Terrain.ts:2` imports `...m1-core.layer-contract.v1.json?raw`. `?raw` is **Vite-only**; Playwright's Node-side collection throws `needs an import attribute of "type: json"`, so **every spec importing ToolSurface dies at collection**.

Measured on clean main vs the graft, one variable:
- clean main → `Total: 2458 tests in 343 files`, `whole-suite-collection` **pass**
- main + slice → `Total: 0 tests in 0 files`, `whole-suite-collection` **fail**
- slice with its own new spec removed → **still 0** (the new spec is NOT the carrier; ToolSurface is)

⚠️ **The trap that hid this:** `e2e/agent-view.spec.ts` imports View with `import type`, which is erased — so the spec **passes in isolation**. Only whole-suite collection sees the fault. Do not use a passing single-spec run as evidence here.

## READ-FIRST
- `reviews/ap-view.md` — the rejection, the four-arm measurement, the `view` name ruling, and the three cure candidates. **This is the law for this task.**
- `save/ap-view-c502f9cc` — the salvage ref holding the rejected work (`git show save/ap-view-c502f9cc:src/agent/View.ts`, `:e2e/agent-view.spec.ts`). **Salvage it; do not re-derive it.**
- `src/world/Terrain.ts:1-30` (the `?raw` import and what `nodeAnchors` actually needs)
- `src/agent/ToolSurface.ts` on current main (AP-06's `orders` + `view` already shipped here)
- `e2e/ap-standing-orders.spec.ts:67-74,116` — AP-06's live consumer of `view().outcome.result`
- `scripts/whole-suite-collection.test.mjs` — the guard that must pass

## PRE-FLIGHT (LANE-SAFETY invariant)
Any dirty tracked blob must be reachable in git, else **STOP**. This lane's branch may hold unmerged content — verify `git log main..HEAD` is empty or already salvaged before any reset; if it holds unsalvaged work, **STOP and report**. The ap-view work is already pinned at `save/ap-view-c502f9cc`, so resetting this lane does not lose it.

## SCOPE
1. **Re-land** `src/agent/View.ts` and `e2e/agent-view.spec.ts` from `save/ap-view-c502f9cc` onto fresh main. Content is accepted as-is except where item 2 requires a change.
2. **Break the collection-time import chain.** Implementer's choice among the candidates in `reviews/ap-view.md` §"The cure"; option 1 (take node anchors off the passed-in source instead of importing `Terrain`) is the recommended smallest. If you choose option 3 (making `Terrain.ts` node-safe), say so in the report — it widens the firewall and needs its own justification.
3. **Register `view` using the WRAP already ruled and compile-proven** in `reviews/ap-view.md` — `result: standingOrders.snapshot()` (AP-06's, consumer preserved) **and** `state: buildView(game)` (THE VIEW), `economyLog: []`. **Do NOT** supersede AP-06's payload; **do NOT** edit `e2e/ap-standing-orders.spec.ts`.
4. **Do not inherit the rejected slice's release gating or its `as GoldRushToolSurface['tools']` cast** (F-1213-3). Register `view` unconditionally, as main does. The master that produced `c502f9cc` claimed "release compiles the agent surface out already" — **that is false**: `Game.ts:2054` → `AgentStub.ts:153` installs it unconditionally. If you believe release-stripping is wanted, report it as a finding; do not implement it here.

## TOUCH-ONLY
`src/agent/View.ts` · `src/agent/ToolSurface.ts` · `e2e/agent-view.spec.ts` · (only if option 3 is chosen and justified) `src/world/Terrain.ts`

## NO
game sim · `Balance` · orders execution (`StandingOrders.ts`) · `e2e/ap-standing-orders.spec.ts` · release gating · `Game.ts` · the drain skill · `suite-red-inventory.md`

## SELF-CHECK (in this order — item 1 first, it is the finding)
1. `node --test scripts/whole-suite-collection.test.mjs` → **pass**
2. `npx playwright test --list` → **`Total: NNNN tests in 343 files`**, and NNNN is within a test or two of **2458**. A number near zero, or a file count below 343, is a FAIL no matter what else is green.
3. `npx tsc --noEmit` → 0 · `npm run build` → green
4. `npx playwright test e2e/agent-view.spec.ts --workers=1` → green, both projects
5. `npx playwright test e2e/ap-standing-orders.spec.ts --workers=1` → green, both projects (**the wrap's real proof — AP-06 must not regress**)
6. zero console/page errors, asserted in-spec; plain boot, no `?debug` where the spec allows

Run batteries at `--workers=1` (F-1212-2: default concurrency manufactures reds on this box).

READY-FOR-GATES + report: the `--list` total before and after your change, which cure option you chose and why, and a sample VIEW dump (verbatim) from a seeded the-claim run at wave 3.
