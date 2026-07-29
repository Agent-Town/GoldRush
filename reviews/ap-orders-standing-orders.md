# AP-ORDERS — Standing Orders: the plan the reflexes obey

**Slice:** `lane-ap-orders.md` (attended-authored, owner greenlight 2026-07-29)
**Branch:** `lane/m3` · **Tip:** `f44097b1` · **Base:** `a4524f9e` · **Drained:** s1212
**Verdict:** ✅ **MERGE — in-scope work complete and green; the runner's own NOT-READY is a FIREWALL STOP, not a defect.** Two of six verbs are inert in production, honestly and loudly; corrective queued with the firewall lifted.

## What it does

Adds a schema-validated standing-orders vocabulary (`src/agent/StandingOrders.ts`, 577 lines) that lets a rider hand the game a *plan* instead of driving every tick: `BUILD` (gold/wave-gated), `REPAIR_UNDER {pct}`, `MOVE_TO`/`HOLD`, `HARVEST {seam|sluice}`, `FALLBACK_IF {threat → pos}`, executed in list order. An executor runs on the Prospector's reflex clock inside `ProspectorEmbodiment` (7 added lines), acting **only** through the existing `ToolSurface` actions, so legal placement and the permission ladder remain the law — an order above the granted rung is rejected, not attempted. Two new tools appear on the surface: `et.goldrush.orders` (atomic replace of the standing set) and `et.goldrush.view` (order lifecycle + surprise log). Unknown verbs are rejected with a reason rather than coerced — the vocabulary law of Mistake #14, honoured.

## Evidence (all on the MERGED tree)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **0 errors** |
| `npm run build` | **green, 1.18 s**; GG-03c herald ceiling intact (1,099,906 B vs 1,500,000 B) |
| Own spec `ap-standing-orders.spec.ts` | **2/2**, both projects (desktop 8.2 s, mobile 6.7 s) |
| `test:node-guards` | **74/74, exit 0** |
| Drain minimum (task-025, m1-01, m2-01, `_s106-prospector-boot-probe`) | **34/34** at `--workers=1` |
| Plain-boot probe (no `?debug`), desktop + 390px | **green, zero console/page errors** (asserted in-spec) |
| Adjacent agent battery (9 specs incl. m4-01/05/06/07/08/09/10, task-026) | **63 passed, 1 skipped, 2 failed** → both fingerprinted PRE-EXISTING (F-1212-2) |
| Release suite (`playwright.release.config.ts`) | **25/26**; the single red re-measured **8/8 green** in isolation → contention, not the slice |
| Perf | m1-01 stress=120 draw-call budget and m2-01 stress <200 draw calls both green at `--workers=1` — the new per-tick hook costs nothing measurable |

### ⚠️ Contention nearly cost me two false findings

The first pass of the drain minimum ran at **default workers** and returned **5 failed / 29 passed**, including the boot probe. Re-run at the prescribed `--workers=1`: **34/34**. Likewise `m4-07-prospector-panel:113` failed in *both* arms under load and passes clean at `--workers=1`. **Every red I saw today at default concurrency was my own rig.** This is F-1211-1's lesson arriving one fire later: *a failing test can manufacture the load that fails its neighbours.* The gate content was not thinned — only the concurrency.

## Merge classification

Base `a4524f9e`; `lane/m3` carried two commits, of which `8e265ee4` is the **already-merged GG-03c safe dupe** (landed as `b5be7ab3`). Only the tip's own delta was grafted.

| File | Class | Resolution |
|---|---|---|
| `src/agent/StandingOrders.ts` | **NEW** | free |
| `e2e/ap-standing-orders.spec.ts` | **NEW** | free |
| `src/agent/Embodiment.ts` | LANE-TOUCHED only | clean apply (+7) |
| `src/agent/ToolSurface.ts` | LANE-TOUCHED only | clean apply (+63/−7) |

`git diff a4524f9e main` on all four paths is **empty** — main never moved them. **Zero MAIN-MOVED, zero conflicts.**

## Findings

### F-1212-3 — BUILD and HARVEST are inert in production (the firewall stop, verified and re-aimed)
The runner reported NOT-READY because "production `Game.ts` does not expose `placeBuilding` or `panAt`." **The claim is true; my first attempt to refute it was wrong, and the way it was wrong is the point.** `ToolSurface.place_building` falls back to `placeBuildingThroughGame(game, …)`, which drives the *real* BuildSystem via ghost+confirm — so I concluded BUILD had a production path. It does not. `Game.ts:2040` installs the agent stub with an **adapter object literal**, not `this`:

```
diagnostics · economyLog · repair · collectXp · collectGold
```

The fallback reads `internal.buildSystem` **off that adapter**, which has no such property → returns `undefined` → `NO_SYSTEM_API`. So:

- `REPAIR_UNDER` → ✅ wired (`repairProspectorBuilding`)
- `MOVE_TO` / `HOLD` / `FALLBACK_IF` → ✅ act through the embodiment
- `BUILD`, `HARVEST` → ❌ **inert** — but they fail *loudly*, marked `failed(reason)` with `NO_SYSTEM_API`. Nothing is silently swallowed.

*Lesson for the catalog: reading a fallback's definition is not enough — you must read what object it is handed.* Corrective `tasks/ap-orders-adapter-wiring.md` queued with the firewall explicitly lifted to `Game.ts`.

### F-1212-2 — `m4-06-embodiment.spec.ts:395` is an undocumented ~45% flake on main
"permission-denied receipts do not send the Prospector to the denied target". **Measured as a rate, both arms, `--repeat-each=5` × 2 projects:**

| Arm | Failures |
|---|---|
| Control (clean main, graft fully removed) | **4/10** |
| Treatment (graft applied) | **5/10** |

Statistically indistinguishable at n=10 → **pre-existing, not caused by this slice**. It was absent from `logs/suite-red-inventory.md`; an inventory row lands in this drain's commit so the next fire does not read it as *their* merge's fault (the F-1204-1 / F-1211-6 shape).

### F-1212-1 — Goal Registration Law gap on both attended masters
`drain-block-check.mjs` returned **UNKNOWN** for `lane-ap-orders.md` *and* `lane-county-standings.md` — neither had a leaf in `tasks/goals.json`. Not a clearance and not a block; leaves added under `agent-play` in this commit (`ap-06-standing-orders`, `ap-07-county-standings`).

## Non-blocking notes
- **GZ-01: nothing owed.** The filter law asks for a *player-visible* change; this is an agent substrate with no UI surface and no plain-boot difference. No gazette item.
- The executor calls `tickStandingOrders` every simulation tick and `observeStandingOrders` every presentation frame. With no orders submitted these are no-ops; the stress/draw-call gates above found no cost.
- Module-level singleton state (`bindStandingOrders`) is reset via `resetStandingOrders()` in `ProspectorEmbodiment.reset()` — worth a second look when the adapter wiring lands and orders can actually mutate the world.
