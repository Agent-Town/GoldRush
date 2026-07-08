# Review — perf-03 instancing ladder (vfx-pool audit + render-count optimization)

- **Slice:** perf-03 (m2 §07 instancing/fallback ladder — perf-only, zero visual change)
- **Source:** orphan `bb9b48d` ("runner(lane-d): lane-d-perf-03-instancing-ladder.md"), salvaged to `save/perf-03`
- **Drained by:** s201 fire → main (path-scoped graft: 4 clean-checkout + 1 disjoint 3-way)
- **Verdict:** ✅ MERGE — real draw-call win, all building visuals preserved, gate green.

## ⚠ Reset Massacre recovered (Mistake #2)
perf-03 committed `bb9b48d` to lane/perf at **15:06:02**; the very next lane-d task (hill-mine-visual-relief) pre-flight reset lane/perf to main at **15:07:26** — 84s later, **undrained**. Output survived only as a reflog orphan. s201 salvaged it to `save/perf-03` and drained it. No content lost. (Root cause is the standing runner behavior: lane pre-flights `checkout -B` reset before the prior lane output is drained — the fire's drain-before-refill duty is the guard, but here the runner auto-advanced the queue faster than a fire could drain.)

## What it does (perf-only)
- **`generated.ts` `GeneratedSpriteBatch`**: replaces the per-mutation O(n) `updateRenderedCount()` filter with an incremental `setSpriteVisible()` delta-tracker (early-out when visibility unchanged; adjusts `renderedContribution` + shared `renderedSprites[slotId]` by ±1). Same accounting, far less per-frame work.
- **`Vfx.ts`**: float-text now reuses a pooled canvas texture (`drawTextTexture` redraws in place) instead of allocating a new `CanvasTexture` per spawn; vfx pools stay capped/reused.
- **`pools.ts` / `SentryBeacon.ts`**: pool cap + reuse asserts; beacon instancing tidy.
- **`fullBaseBenchmark.ts`**: benchmark harness updated for the ladder-on measurement.
- **`assay_office` kept NON-instanced** (unique custom shell/sign/wreck/HP building) — reported per the master's "keep non-instanced and report, don't degrade the look" clause. No building tier/shell/wear/HP-bar visual changed.

## Evidence
| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green (397ms) |
| `perf-02-fullbase-bench` (draw-call + frame envelopes) | pass both projects |
| `m2-01` (incl. stress draw calls < 200) · `bt-01-tiers` · `combat-readability` (bars/wear/no-flash stress) · `w1-05` shells | **52/52** single-worker (both projects) |
| Draw-call delta (perf-03 report, refreshed-main baseline → final) | desktop **212 → 154 (-58)**, mobile **197 → 142 (-55)**; p95 ratio 1.25 desktop / 1.01 mobile |
| Building visuals (tier/shell/wear/HP-bar) | unchanged — bt-01 + w1-05 + combat-readability all green |

Absolute draw-call reduction is validated by the perf-02 spec's envelope assertions passing (they enforce the budget; perf-03 lowered usage further). All building-visual suites green = zero visual regression.

## Merge classification
- **Orphan** `bb9b48d`, parent (base) = `704b9f0` (s200 refill = lane/perf's reset point before perf-03 committed).
- `git diff 704b9f0..main` over perf-03's 5 src files → **only `generated.ts`** moved on main (town-T5 `5081312` added 8 townsfolk asset-map entries).
- **4 files LANE-TOUCHED-only** (`fullBaseBenchmark.ts`, `SentryBeacon.ts`, `pools.ts`, `Vfx.ts`) → clean `git checkout bb9b48d -- …`.
- **`generated.ts` = disjoint 3-way**: perf-03's edit is in the `GeneratedSpriteBatch` class (lines ~219-265); town-T5's is the asset-URL map (lines ~6-14). Non-overlapping hunks. Applied perf-03's three hunks via Edit onto main's townsfolk version; verified `git diff bb9b48d -- generated.ts` = ONLY the 8 townsfolk lines → **both changes retained, neither reverted**.
- Artifact churn in the orphan commit (26 PNGs under artifacts/056, correctives-0707, w1-05) was NOT brought over — screenshot noise, out of the perf firewall.

## Firewall
Held — perf-only. No gameplay, no Balance, no tier/shell VISUAL changes. `assay_office` non-instanced-by-design documented above.

## Findings
None blocking. `save/perf-03` → rename to `archive/perf-03` once this commit is confirmed on main (salvage lifecycle).
