# Review — e6-tile-consumers (E6 atomic-era tile-state consumers)

**Slice:** lane-e6-tile-consumers · **branch:** lane/perf (lane-d) · **tip:** b02d88d6 `runner(lane-d): lane-e6-tile-consumers.md`
**Drained by:** s738 fire · **base:** bbc3c614 (5 behind main at drain time) · **merged onto:** main @ 0a1c2c95

## Verdict
**PASS — merged.** Clean surgical apply (no 3-way conflict — main never moved any of the five files since the lane's base), full gate battery green both projects, firewall respected exactly. One carried non-blocking finding (RunSuspend adjacency, pre-existing).

## What it does
Arms E6's era systems to CONSUME the shipped TileStateStore persistence substrate — the last unarmed engine gap the owner's 2026-07-18 goal-tree completeness sweep flagged. Adds `E6TileConsumerSystem` (424 lines): two authored **decay fields** with a three-stage fade and independent breathing that persist their safe phase across runs, and a six-vein **night-vein ring** that opens after dark, harvests through Economy (sole gold writer), and remembers spent veins via suspend-receipt recovery. The existing WrangleSystem remains the pen owner (untouched). All of it is strictly era-gated: non-E6 boots leave the consumer and the shared decay scheduler inert, and a plain boot writes zero tile-state keys.

## Evidence
| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, built in 1.34s (dist sizes nominal; Game chunk 778kB/207kB gz) |
| playwright (scratch cfg :5238, `--workers=1`, both projects) | **28/28 passed (2.6m)** |
| — e6-tile-consumers.spec.ts (new, the slice) | green ×2 projects — decay fade/breathe/persist · six-vein harvest-through-Economy + spent-vein memory · non-E6 boot inert |
| — e6-decay-framework.spec.ts (adjacent) | green ×2 — same-seed determinism + plain-boot scheduler inert |
| — e6-wrangle.spec.ts (adjacent) | green ×2 — kite→capture→persist→Economy payout |
| — tp00-tile-persistence.spec.ts (substrate adjacent) | green ×2 — profile isolation, byte-identical restore, over-budget refusal, plain-boot no-keys |
| Boot probe | E6 is era-gated → inert on plain boot (tests 16/19/26 assert zero tile-state keys + inert scheduler, no console errors). Not visible in a plain boot by design (Mistake #10: player sees it by reaching the E6 era; in-era behavior verified by tests 17/18). |
| Perf | N/A on the default board — era-gated system, no new draw calls / no scheduler ticks until E6 is active. No plain-board render regression. |
| Console | The two `console.warn` "Tile state write refused … exceeds the 32768-byte budget" lines are the intentional over-budget test assertions, not errors. Zero unexpected console/page errors. |

## Merge classification
Base **bbc3c614**, only 5 commits behind main (F-N3 notes ×2, four-correctives authoring, board-era-chapters, 3D-promotion). Verified `git diff bbc3c614 main -- <the 5 files>` = **EMPTY** → main is byte-identical to base for every touched file, so the lane's versions ARE the correct merged result. Applied path-scoped via `git checkout lane/perf -- <files>` (NOT a full branch merge — that would have carried the stale-base tasks/queue phantom churn).

| File | Class | Note |
|---|---|---|
| `src/systems/E6TileConsumerSystem.ts` | NEW (+424) | free |
| `e2e/e6-tile-consumers.spec.ts` | NEW (+137) | free — the gate-authorship spec |
| `src/game/Balance.ts` | additive (+26) | `e6Tiles` tunable block; main untouched since base |
| `src/game/Game.ts` | additive (+39/-8) | E6 wiring seam only; main untouched since base |
| `src/vite-env.d.ts` | additive (+4) | `e6Tiles` diagnostics typing on the debug window |

Firewall (TOUCH-ONLY: new system + Game wiring seams + Balance.e6Tiles + spec) — **matched exactly**; no out-of-scope edits.

## Findings
- **F-e6t-1 (non-blocking, carried):** The run log notes "broader single-player RunSuspend timer/channel snapshots remain an adjacent issue outside the touch-only firewall." This is the same standing thread as the carried **F-e6-1** (wrangle pen persists via `RunSuspend.ts` rather than TileStateStore as specced). Not introduced by this slice; a future pen/suspend-UI slice should confirm the substrate ownership. Left on the OWNER'S DESK carry list.
