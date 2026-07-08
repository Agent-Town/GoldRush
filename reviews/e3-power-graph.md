# reviews/e3-power-graph — E3 dormant power graph engine

**Slice:** e3-power-graph-core (lane-a) · **Branch:** lane/m3 tip `bce5c63` · **Merged:** `d0f4204` (s181 drain) · **Base:** `c15e250` (clean ancestor of main)

## Verdict
**MERGED — PASS.** Dormant, dev-gated engine; zero gameplay-visible surface in a plain boot. One adjacent red (`task-025:145`) proven PRE-EXISTING on clean main, not caused by this merge — corrective already queued (fix-025).

## What it does
Adds `src/systems/PowerGraph.ts` (471 lines): a deterministic, id-sorted connected-component power solver — producers/pylons/consumers, supply/demand allocation, `powered | browned-out | dark` states, invalid-span rejection. It is DORMANT: activated only under `?debug&power=dev`; a flag-off boot does zero graph work (asserted by the spec). Ships the buildable power seam (`buildables.ts`), `Balance.powerGraph` knobs, diagnostics wiring (`Game.ts`, `vite-env.d.ts` `GrPowerGraphDiagnostics`), a `ContractFamilies.ts` one-line touch, and the E3 spec. This is the E3 Steamworks power-grid foundation, landed dormant per the placeholder-first / 045 precedent (owner momentum push).

## Evidence (real numbers, on the merged tree)
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | green (289ms; bundle 1,248.82 kB / gzip 319.02 kB — unchanged size class) |
| `e2e/e3-power-graph.spec.ts` (own) | **6/6** desktop+mobile (12.3s) — flag-off-zero-work, solver, determinism |
| `e2e/m1-01-claim-jumpers-death.spec.ts` | 4/4 desktop + 4/4 mobile |
| `e2e/m2-01-build-menu.spec.ts` | 6/6 desktop + 6/6 mobile |
| `e2e/task-025-bandits-dont-swim.spec.ts` | 29/30 — see F-181-1 |
| Boot probe | e3 flag-off-boot test asserts zero console/page errors desktop+mobile; task-025 openGame captures consoleErrors/pageErrors = [] on the passing tests |

Scratch config: `playwright.s181.config.ts` (vite preview of the built bundle on 127.0.0.1:5241 — gates the production bundle, no live-lane port/working-tree contamination). `--workers=1`.

## Merge classification (base `c15e250`)
`c15e250` (the task-master authoring commit — its message "E3 power-graph engine early" was MISLEADING; the diff is only two `tasks/*.md` files) is a clean ancestor of main. Since base, main moved only `Game.ts` + `vite-env.d.ts`.

| File | Class | Resolution |
|------|-------|------------|
| `src/systems/PowerGraph.ts` | NEW | free |
| `e2e/e3-power-graph.spec.ts` | NEW | free |
| `artifacts/e3-power/{desktop,mobile}-chrome-dev-catenary.png` | NEW | free |
| `src/game/Balance.ts` | LANE-TOUCHED only | clean apply (additive knobs) |
| `src/game/buildables.ts` | LANE-TOUCHED only | clean apply |
| `src/meta/ContractFamilies.ts` | LANE-TOUCHED only | clean apply |
| `src/game/Game.ts` | MAIN-MOVED too | git 3-way auto-merged, additive (diagnostics seam vs main's save-slots/info-notes) — no conflict |
| `src/vite-env.d.ts` | MAIN-MOVED too (additive-collision class) | auto-merged additively |

`git merge --no-ff lane/m3` reported "Automatic merge went well" — no manual conflict resolution needed. Merge commit records lane/m3 as a merged ancestor (safe-dupe clean for the next lane-a pre-flight). Staged set = exactly the 9 drain files; the uncommitted `artifacts/*.png` + `logs/dashboard.html` attended dirt was left untouched (path-scoped).

## Findings
- **F-181-1 (non-blocking — corrective ALREADY QUEUED):** `task-025-bandits-dont-swim.spec.ts:186` (`expect(deep.announcement).toContain('Wet powder')`) fails on **desktop-chrome, now DETERMINISTICALLY** (3/3 isolated `--workers=1`; mobile 3/3 pass). Attributed to CLEAN MAIN, not this merge:
  - The transient `__THREE_GAME_DIAGNOSTICS__.ui.announcement` is overwritten at read time by the world-info-notes string `"the Prospector: follows and observes. Chip by weapon; claim wins grow it."` — that string lives on clean main HEAD (`f888a2e:src/game/Game.ts:3230`), predating this merge.
  - `bce5c63` touches ZERO announcement code (`git show bce5c63 -- src | grep announce` = empty).
  - This is F-176-1 (fix-025's target). fix-025 (`tasks/queue/main/fix-task-025-wet-powder-announcement-race.md`) rewrites line 186 to poll the durable Wave-status DOM instead of the transient field — that fully covers this failure mode.
  - **NOTE for the next fire / fix-025 author:** fix-025 was authored (pre-`075a6dc`) describing this as a ~⅔ FLAKE. Since then, attended's **world-info-notes** feature (merged `1612eab`) made the Prospector info-note win the announcement field DETERMINISTICALLY, so the red is now ~100% on desktop. fix-025's durable-DOM approach still fixes it; no scope change needed, but expect fix-025's `--repeat-each=5` proof to go from "recover the flake" to "flip a hard red green."
