# F-1467-1 — extraction recipe A/B at play scale

**Slice:** `f1467-1-alpha-recipe-ab` · **Branch:** `lane/b` · **Base:** `b5e828af` · **Tip:** this lane commit

**Verdict:** ✅ **F-1464-2 CLOSED-BY-MEASUREMENT. Use KEY-BEFORE-FINAL-RESAMPLE: standalone sprites key at 1024 then downsample; grids preserve native-sheet keying before cell resampling.**

**Play-scale ruling, `alphaTest: 0.35`:** **the two recipes are indistinguishable at play scale.**

**Play-scale ruling, `alphaTest: 0.04`:** **the two recipes are indistinguishable at play scale.**

The screenshots do not manufacture a visual winner: desktop and 390px pairs are visually indistinguishable at both tiers, a neutral image-only review reached the same verdict, and GPU foreground deltas are small and mixed. The machine-independent threshold core does separate the recipes: two-step retains more thin-feature ground-truth texels for all three subjects at both tiers. The feared high-tier erosion did not occur. Two-step therefore wins the reproducible discriminator while also preserving the historical softness established by F-1450-4.

## Subjects

| subject | runtime scale used | why it can answer the question |
|---|---:|---|
| `prop-baron-banner` | `3.44 × 3.44` | Required control; its tied cord, tassel, pole edge, and torn cloth tips are thin. The E1 Baron's contract scale is `4`, and `applyBannerSprite` overrides the batch default to `0.86 × visualScale` (`src/entities/pools.ts`). |
| `prop-drill-faucet-station` (assay table) | `3.4 × 3.4` | The balance beam, two hanging chain sets, pan rims, and crank are isolated thin structures, not decorative padding (`src/game/DrillYard.ts`). |
| `bld-signal-turret` portrait | `0.78 × 0.52` | The concentric hoops, radial spokes, rail chains, and ladder are the sample's hardest small-sign filigree (`src/entities/Turret.ts`). |

The target, established before comparison, was: preserve those thin structures without edge noise or a halo at the real game camera and scale. A subject without such structures was not included.

## Exact arm commands

The extractor was used unmodified. `measure.mjs downsample` is the same centre-sampled bilinear loop used by `scripts/extract-alpha.mjs` and the byte-proven F-1450-4 control.

```sh
# Baron banner — one-step
node scripts/extract-alpha.mjs --key ff00ff --size 384 --out artifacts/f1467-alpha-recipe-ab/arms/baron-banner/one-step assets/raw/prop-baron-banner.png

# Baron banner — two-step
node scripts/extract-alpha.mjs --key ff00ff --out artifacts/f1467-alpha-recipe-ab/arms/baron-banner/master-1024 assets/raw/prop-baron-banner.png
node artifacts/f1467-alpha-recipe-ab/measure.mjs downsample artifacts/f1467-alpha-recipe-ab/arms/baron-banner/master-1024/prop-baron-banner.png artifacts/f1467-alpha-recipe-ab/arms/baron-banner/two-step.png 384

# Assay table — one-step
node scripts/extract-alpha.mjs --key ff00ff --size 384 --out artifacts/f1467-alpha-recipe-ab/arms/assay-table/one-step assets/raw/prop-drill-faucet-station.png

# Assay table — two-step
node scripts/extract-alpha.mjs --key ff00ff --out artifacts/f1467-alpha-recipe-ab/arms/assay-table/master-1024 assets/raw/prop-drill-faucet-station.png
node artifacts/f1467-alpha-recipe-ab/measure.mjs downsample artifacts/f1467-alpha-recipe-ab/arms/assay-table/master-1024/prop-drill-faucet-station.png artifacts/f1467-alpha-recipe-ab/arms/assay-table/two-step.png 384

# Signal-turret portrait — one-step
node scripts/extract-alpha.mjs --key 8a8a8a --size 384 --out artifacts/f1467-alpha-recipe-ab/arms/signal-turret/one-step assets/raw/bld-signal-turret.png

# Signal-turret portrait — two-step
node scripts/extract-alpha.mjs --key 8a8a8a --out artifacts/f1467-alpha-recipe-ab/arms/signal-turret/master-1024 assets/raw/bld-signal-turret.png
node artifacts/f1467-alpha-recipe-ab/measure.mjs downsample artifacts/f1467-alpha-recipe-ab/arms/signal-turret/master-1024/bld-signal-turret.png artifacts/f1467-alpha-recipe-ab/arms/signal-turret/two-step.png 384

# Threshold table + reuse of F-1450-4's alpha-probe
node artifacts/f1467-alpha-recipe-ab/measure.mjs analyze
```

The full nine-file arm set was generated twice. SHA-256 before and after was identical for every master and final PNG; final arm hashes are in `measurements.json`.

## Offline threshold analysis

The WebGL survivor predicate is `alpha / 255 >= alphaTest`, so the first surviving byte is 90 at `0.35` and 11 at `0.04`. `partial` means `0 < alpha < 255` and is repeated per tier for a complete subject × arm × tier table.

**Thin-feature retention metric:** threshold the 1024 keyed master at the same tier. A surviving master texel is "thin" when background occurs within four master texels on both sides of at least one horizontal, vertical, or diagonal axis (a local stroke no more than nine master texels wide). Map each such master texel by pixel centre to its 384 output texel. Retention is the share whose mapped output texel survives the same threshold. This measures the exact risk in F-1464-2—whether a narrow native keyed stroke is discarded—without using wall-clock, human taste, or one recipe as ground truth.

| subject | arm | tier | surviving texels | partial | thin-feature retention |
|---|---|---:|---:|---:|---:|
| Baron banner | one-step | 0.35 | 60,701 | 121 | 80.49% |
| Baron banner | two-step | 0.35 | 60,904 | 1,845 | **84.21%** |
| Baron banner | one-step | 0.04 | 60,731 | 121 | 80.39% |
| Baron banner | two-step | 0.04 | 61,484 | 1,845 | **93.20%** |
| Assay table | one-step | 0.35 | 58,272 | 75 | 83.61% |
| Assay table | two-step | 0.35 | 58,506 | 1,715 | **88.21%** |
| Assay table | one-step | 0.04 | 58,289 | 75 | 83.60% |
| Assay table | two-step | 0.04 | 59,062 | 1,715 | **95.53%** |
| Signal turret | one-step | 0.35 | 29,555 | 85 | 81.71% |
| Signal turret | two-step | 0.35 | 29,488 | 713 | **82.91%** |
| Signal turret | one-step | 0.04 | 29,585 | 85 | 80.90% |
| Signal turret | two-step | 0.04 | 29,722 | 713 | **91.51%** |

At `0.35`, two-step gains **+3.72 / +4.60 / +1.20 percentage points** of thin-feature retention. At `0.04`, it gains **+12.81 / +11.93 / +10.61 points**. The signal-turret high-tier row is the important counterexample to reading total area as retention: two-step has 67 fewer total survivors but still retains nine more thin master texels (82.91% vs 81.71%).

## In-game A/B

`e2e/f1467-alpha-recipe-ab.rig.ts` imports the shipped Three.js dependency and `src/core/Renderer.ts`, loads artifact textures directly as data URLs, uses real `SpriteMaterial` alpha testing and mipmaps, and pins the shipped run camera (`fov 42`, offset `[0, 26.2, 18.3]`, look-at `[0, 0.45, -3.35]`). Each arm is measured at the identical centre before the labeled pair is rendered. No file under `assets/` is swapped.

Foreground pixels below are read from the real WebGL framebuffer against an empty-scene control. Deltas are `two-step − one-step`; their mixed sign is why they are telemetry, not a manufactured preference.

| viewport | subject | tier | one-step | two-step | delta | screenshot |
|---|---|---:|---:|---:|---:|---|
| desktop | Baron banner | 0.35 | 7,933 | 7,928 | -5 | `desktop-chrome-baron-banner-alpha-0-35.png` |
| desktop | Baron banner | 0.04 | 8,323 | 8,208 | -115 | `desktop-chrome-baron-banner-alpha-0-04.png` |
| desktop | Assay table | 0.35 | 5,492 | 5,494 | +2 | `desktop-chrome-assay-table-alpha-0-35.png` |
| desktop | Assay table | 0.04 | 5,710 | 5,671 | -39 | `desktop-chrome-assay-table-alpha-0-04.png` |
| desktop | Signal turret | 0.35 | 97 | 97 | 0 | `desktop-chrome-signal-turret-alpha-0-35.png` |
| desktop | Signal turret | 0.04 | 132 | 133 | +1 | `desktop-chrome-signal-turret-alpha-0-04.png` |
| 390px | Baron banner | 0.35 | 34,916 | 34,919 | +3 | `mobile-chrome-baron-banner-alpha-0-35.png` |
| 390px | Baron banner | 0.04 | 35,680 | 35,374 | -306 | `mobile-chrome-baron-banner-alpha-0-04.png` |
| 390px | Assay table | 0.35 | 24,041 | 24,077 | +36 | `mobile-chrome-assay-table-alpha-0-35.png` |
| 390px | Assay table | 0.04 | 24,598 | 24,524 | -74 | `mobile-chrome-assay-table-alpha-0-04.png` |
| 390px | Signal turret | 0.35 | 419 | 417 | -2 | `mobile-chrome-signal-turret-alpha-0-35.png` |
| 390px | Signal turret | 0.04 | 485 | 492 | +7 | `mobile-chrome-signal-turret-alpha-0-04.png` |

Screenshots and per-project JSON are under `reviews/shots-f1467-alpha-recipe-ab/`. Both Playwright projects passed with zero console/page errors. An unprimed, image-only reviewer independently returned **indistinguishable** for both tiers: no arm visibly preserves more banner cord/tips, table chain detail, or turret filigree, and neither shows a noisy halo.

## Recommendation for F-1464-1

Use the **key-before-final-resample** invariant for the roster. For standalone sprites, use the measured two-step recipe: key at the extractor's default 1024, then bilinear-downsample to the shipped size. For sheet assets, preserve the existing `--grid` recipe: key the native sheet, then let `sliceGrid` bilinear-resample to the declared `--cell` size with the existing grid and scale parameters. Do not insert a standalone 1024 resize into grid mode; that would move cell cuts and normalization. Do not split the recipe by `alphaTest` tier: the high tier did not erode sampled thin features, and two-step retained more of them there too.

The re-extraction master must still classify and visually QA the output by consumer. Of the 1,075 halo suspects, **1,073 are `-rNcM` grid cells** and only two are standalone files (`ui-title-emblem.png`, `townsfolk-youngster-b.png`), so source-sheet reconstruction plus each sheet's existing grid/cell/scale parameters is the dominant batch path. The codebase has three `0.35` sites (single sprites, sprite-animation fades, Town actors) and seven `0.04` sites (batches, gameplay props, building signs, Drill Yard, agent embodiment, and Town props). Files are not safely partitioned by folder, and one processed asset can reach more than one surface. This slice settles the resample ordering only. It does not change `assets/`, `src/`, or the 1,075-file F-1464-1 batch.
