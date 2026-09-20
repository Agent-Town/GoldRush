# Review — 079-render-micro-perf

**Slice:** 079 (render micro-perf: cache projectile origin heights · share walk8 alias atlases · hoist night palette colors · trim boss-hp-bar work · sync enemy dark render regime)
**Branch / tip:** `lane/polish` @ `8270f8b` (+5 commits)
**Merge-base:** `9e8243e`
**Ruled by:** s291 fire, 2026-07-10
**Verdict:** ⛔ **NOT MERGED — RE-LAND ruled** (stale + semantically conflicted against main's fixed-step unification). Salvage preserved `save/079-render-micro-perf@c1dd5bd`.

## Why this can't be a hand-merge (Mistake #15)
079 branched at `9e8243e`, BEFORE main landed **`512f41b` "feat(sim): park fixed-step unification for gate ruling"** — the ratified 30 Hz accumulator + render-interpolation refactor (attended/sol-owned determinism work). Both 079 and `512f41b` rewrite the **same render-sync flow** in `src/entities/pools.ts` and `src/entities/Projectile.ts`, incompatibly:

- **`pools.ts` `EnemyPool` update tail (~L472-513):** 079 keeps `syncRenderInstances()`/`syncHitFlashes()` INSIDE `update()` and INSERTS `this.syncEnemyFog();` before them; `512f41b` REMOVES `syncRenderInstances()`/`syncHitFlashes()` from `update()` entirely and moves them into a NEW `applyRenderInterpolation(alpha)` method. Both also delete `this.syncBossHpBar();` from the same block. These are directly contradictory edits to the identical lines → a 3-way merge conflicts, and even a "clean" auto-resolution would be semantically wrong (079's `syncEnemyFog` placement assumes the pre-interpolation structure).
- **`Projectile.ts` `fire()` (~L146-148):** 079 changes `visualStartY[i] = this.originVisualY(...)` (new origin-height cache); `512f41b` inserts `this.previousActive[i] = false;` at the adjacent line + adds `captureRenderState()`/`applyRenderInterpolation()`. Adjacent-hunk collision; the origin-height cache must be re-expressed against the new interpolation-aware `fire()`/`sync()`.

`git diff --name-only 47fce60..main` on 079's four files = `512f41b` touched `Projectile.ts` + `pools.ts` (2 of 4). Hand-merging perf micro-opts into freshly-rewritten determinism-critical sim code = exactly the subtle-corruption trap CLAUDE.md §6 + Mistake #15 forbid.

## Merge classification
Base `9e8243e`. Per-file:
| File | Class | Disposition |
|------|-------|-------------|
| `src/entities/pools.ts` | **BOTH MOVED (conflict)** | render-flow rewrite collides with `512f41b` — RE-LAND |
| `src/entities/Projectile.ts` | **BOTH MOVED (conflict)** | origin-cache vs interpolation state — RE-LAND |
| `src/assets/SpriteAnimator.ts` | LANE-TOUCHED only | main untouched since base — clean re-derive |
| `src/world/LightRig.ts` | LANE-TOUCHED only | main untouched since base — clean re-derive |

## Ruling / next step
- Salvage pinned: **`save/079-render-micro-perf@c1dd5bd`** (`git show` for the full intent). On the re-land's merge, rename → `archive/079-render-micro-perf`.
- **079b NOT fire-authored this cycle (deliberate).** The two conflicted opts (projectile-origin cache + enemy-fog/dark-regime) must be RE-DERIVED to compose with `512f41b`'s `applyRenderInterpolation`/`captureRenderState` — i.e. authoring INTO the attended/sol-owned fixed-step render flow. Per fire.md §2E HARD LIMIT (don't author where it needs design judgment / touches attended-owned territory) + the coexistence law, this wants **attended eyes**. The 2 clean opts (SpriteAnimator alias atlases, LightRig night-palette hoist — files main never moved) can be cherry-scoped trivially and could ship as a small clean 079a if desired.
- **F-079-1 (process):** same root as F-080-2 — 079 (render micro-perf) was dispatched to a lane in parallel with the sol/* fixed-step work that rewrote the same render flow; siblings touching the render/sim hot path must serialize against the sol/attended determinism series, not run concurrently.

## Findings
- **F-079-1** (above): serialize render-hotpath tasks against the attended fixed-step series.
