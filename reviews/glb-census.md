# GLB census — settling the premise under F-1050-3

**Session:** s1051 fire, 2026-07-26 · **Type:** measurement report (no merge, no code change, no authored master)
**Scope:** read-only. `dist/` was never written; every transform ran on a copy in a temp dir outside the repo.

## Verdict

**F-1050-3's recommendation (a) — "stop shipping the undieted GLB originals" — cannot be done, because there are no undieted duplicates to stop shipping.** `scripts/asset-diet.mjs:76` writes each optimized model **back over itself** (`await io.write(file, document)`). The 406 `.glb` files in `dist/` are 406 **distinct models**; deleting any of them removes a model the game loads.

The real lever sits one line up, at the **selector**: the diet only ever *names* 235 of those 406. The other **171 files / 217.3 MB were never eligible for optimization at all.** Compressing them with the diet's own transform is **measured at −192.9 MB (89%)**, taking the upload from 423.4 MB to **~230.5 MB**.

Separately, and larger: **49% of the upload is later-epoch content that the project's own E1 release guard would reject.**

## Evidence

All numbers measured this fire against `dist/` as built 2026-07-26 00:33 (build `00f5d464`, the tree s1050's real deploy attempted).

### 1. The diet rewrites in place — no duplicates exist

| Claim | Source | Verified |
|---|---|---|
| Diet writes over the original | `scripts/asset-diet.mjs:76` `await io.write(file, document)` | ✓ read |
| Selector names terrain + landmarks + 7 town models only | `scripts/asset-diet.mjs:41-45` | ✓ read |
| dist match is `basename.startsWith(sourceName + '-')` | `scripts/asset-diet.mjs:46-52` | ✓ read |

### 2. The census (selector replicated verbatim — `logs/_s1051_glb_census.mjs`)

| Bucket | Files | Bytes |
|---|---:|---:|
| dist `.glb` total | 406 | 306.8 MB |
| **DIETED** (in place) | 235 | 89.5 MB |
| **NEVER NAMED** | **171** | **217.3 MB** |

### 3. Why they escaped — a `.` where the selector expects a `-`

45 of the 171 are **era variants of the very buildings the diet already compresses**. The naming convention is `base.eN-hash`; the selector tests `base-`. The dot excludes them.

Direct in-tree proof, same building, no transform needed:

| File | Size | Dieted? |
|---|---:|---|
| `schoolhouse-BR3cnoTX-…glb` | **224 KB** | yes |
| `schoolhouse.e2 … .e10` (9 files) | **1.47–1.83 MB each** | no |
| `assay-office-xAW04uBp-…glb` | **249 KB** | yes |
| `assay-office.e2 … .e10` (9 files) | **1.57–1.75 MB each** | no |

The remaining 126 are models the diet's list never named at all — including `tavern.eN` (registered under the base name `town-v3-tavern`, so its variants miss too), `dynamo-hall.eN`, bosses and props.

### 4. What they would weigh dieted — MEASURED, not projected

Every one of the 171 was run through the **exact** transform `asset-diet.mjs` applies (`meshopt` level `medium` + `textureCompress` webp q80), on a copy. **171/171 succeeded; zero failures.**

| Bucket | Files | Before | After | Cut | Saved |
|---|---:|---:|---:|---:|---:|
| (A) era variants of already-named models | 45 | 66.65 MB | 10.35 MB | 84% | 56.30 MB |
| (B) never named at all | 126 | 150.65 MB | 14.04 MB | 91% | 136.61 MB |
| **TOTAL** | **171** | **217.30 MB** | **24.39 MB** | **89%** | **192.91 MB** |

Per-file cuts ranged 81–97%. Largest single win: `ark-plaza-e10` **5.81 → 0.42 MB (93%)**.

**Upload effect: 423.4 MB → ~230.5 MB (−46%).**
Scripts retained: `logs/_s1051_diet_bucketA.mjs`, `logs/_s1051_diet_bucketB.mjs`, `logs/_s1051_diet_probe.mjs`.

### 5. The bigger, separate finding — the deploy ships all ten epochs

`scripts/deploy.sh:48` runs **`npm run build`**, not `build:release`. The project *has* an E1 release guard, `scripts/assert-release-build.mjs:40`, which **fails the build** if any file matches `(?:^|[.-])e(?:[2-9]|10)(?:[.-])`. Applying that same regex to the shipped `dist/` (`logs/_s1051_era_footprint.mjs`):

| | Files | Bytes | Share |
|---|---:|---:|---:|
| dist total | 3054 | 423.4 MB | 100% |
| **later-epoch (e2..e10)** | **418** | **205.6 MB** | **49%** |

Breakdown: 171.8 MB `.glb` · 15.5 MB `.webp` · 13.6 MB `.png` · 4.7 MB `.mp3` (3 era loop tracks).

## Findings

- **F-1051-1 — F-1050-3 recommendation (a) rests on a false premise.** No undieted duplicates exist; the diet writes in place. The line "406 `.glb` ship; the diet only names 235" is *true*, but the 171-file gap is **un-optimized distinct models**, not redundant copies. Acting on (a) as worded would delete assets the game needs.
- **F-1051-2 — the diet's selector misses 171 of 406 GLBs (217.3 MB), 45 of them on a naming-convention mismatch alone** (`base.eN-` vs `base-`). Measured recoverable: **192.9 MB (89%)**. This is a selector defect, not a design decision.
- **F-1051-3 — the deploy publishes all ten epochs, 205.6 MB (49% of the upload) of which the repo's own E1 release guard is written to reject.** Whether that *should* ship is a product question (the T6–T10 saga wall shipped s958), not an oversight to fix unilaterally — hence owner's desk.

## Limits — what this report does NOT establish

1. **Visual fidelity of the newly-dieted files is unverified.** The transform is owner-accepted for this asset class (the asset diet shipped s1024 with visual-parity comparison on 2 maps + the town), and these are the *same buildings* whose base models are already dieted — but no side-by-side was rendered for the 171.
2. **It is NOT proven that ~230 MB completes where 423 MB timed out.** The failure is `UND_ERR_HEADERS_TIMEOUT` (undici's 300s per-request header wait). Halving the payload is the largest lever available and it is measured; it is not a guarantee.
3. **Runtime necessity was not tested.** I did not check which of the 171 the running game actually requests. If some are never loaded, *dropping* beats *compressing* — a further lever, unmeasured here.
4. No `src/`, no assets, and no `dist/` bytes were modified by this fire.
