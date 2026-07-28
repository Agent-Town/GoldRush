# Review — gazette-art-wiring-hardening

- **Slice:** `gazette-art-wiring-hardening` (lane-a)
- **Branch / tip:** `lane/m3` @ `371ce258`
- **Merge base:** `87a7f488`
- **Drained by:** s1186 fire, 2026-07-28
- **Block-check (§3.0, run FIRST, before classification):** ✅ CLEAR — `status="queued"`, 2 leaves matched, longest wins.

## Verdict

**ACCEPT — merged.** All three of s1185's named gate conditions were re-measured by me and hold: scope 4.1 **genuinely separated** the two assertions (proved by a control that passes the old one and fails the new one on the same page load), the three mutation exit codes reproduce, and `asset-diet.spec.ts` is unmodified-green.

## What it does

Closes the two findings s1185 raised against its own merge, plus the one they imply.

1. **F-1185-2 (assertion strength).** `e2e/gazette-art-wiring.spec.ts` asserted only `toBeVisible()` + `src`-contains — **both of which a 404 satisfies**, and the production URL is a `.webp` that does not exist in dev, so the two environments no longer serve the same file. The spec now also asserts `naturalWidth > 0` and `naturalHeight > 0`, which is the first assertion in this suite that can only pass if the browser actually **decoded** the image.
2. **F-1185-3 (over-broad resize).** `asset-diet.mjs` resized **any** 1024² `dist` PNG to 384². The *selection* stays broad — that is what earns the WebP win — but the **resize** is now narrowed to `herald-engraving-` basenames, and an unrecognised 1024-square tier is converted, **not** resized, and **warned about by name**.
3. **F-1184-1's ceiling made permanent.** It had been proved once, by hand, with nothing preserving it. It is now a named constant `HERALD_SPOT_CUT_BUDGET_BYTES = 1_500_000`, the measured byte total is printed in the build summary, and a breach **throws and fails `npm run build`**.

## Evidence — every number below re-measured by me on the merged tree

| gate | result |
|---|---|
| `npx playwright test --list` (run **before** any other gate) | **exit 0 — `Total: 2418 tests in 337 files`** |
| `npm run test:node-guards` | **exit 0**, `fail 0` |
| `npx tsc --noEmit` | exit 0 |
| `npm run build` | exit 0; summary printed `herald spot cuts 281444 bytes` |
| Herald `dist/` budget | **281,444 B** measured vs **1,500,000 B** ceiling — **5.3× under**, reproduced **to the byte** |
| Unrecognised-tier warnings in a clean build | **none** — nothing non-herald is 1024² in `dist` today |
| Own spec, **dev**, desktop + 390 px | **4/4 passed**, exit 0 |
| Own spec, **production preview**, desktop + 390 px | **4/4 passed**, exit 0 (this is the run that exercises the `.webp`) |
| Adjacent `npm run test:asset-diet` | **4/4 passed**, exit 0 |
| Console/page errors | zero, both projects, both server modes |
| Screenshots (opened and read, not just collected) | `artifacts/gazette-art-wiring/{desktop-chrome,mobile-chrome}-live-cuts.png` |

**The two cheap guards were run first, deliberately** (s1185(I)(2)). A scoped run never collects the suite, so an uncollectable tree would have made every other green on this page vacuous. Both were red on a tree four fires called green only one fire ago; both are green here.

### Where the player sees it (Mistake #10)

Both gate screenshots opened and read. Desktop: four cuts render beside their headlines in THE CLAIM HERALD, plain boot, no `?debug`. 390 px: the cuts sit right of the wrapped headlines with no overlap and no clipping.

### Mutation controls — all three re-run by me, not inherited

| # | control | result |
|---|---|---|
| 1 | `heraldReader.ts` `board` → `/assets/herald-engraving-board-missing.png` (a 404 whose URL still contains `herald-engraving-board`) | **exit 1.** Line **112** — the old `src`-contains assertion — **passed**; line **114** failed with `toBeGreaterThan(0)`, `Received: 0`. **This is the separation proof.** |
| 2 | synthetic 1024×1024 non-herald PNG placed in `dist/assets/` | **exit 0.** Emitted `WARNING: unrecognised 1024-square tier, converted but NOT resized: synthetic-non-herald-1024.png`; output measured **1024×1024 WebP** — converted, **not** downscaled. Warning-only by design, so conversion continues. |
| 3 | ceiling temporarily lowered to `281_443` | **exit 1**, budget throw — so the gate genuinely fails `npm run build`. |

All three subjects restored; `git diff` empty against each mutated file, verified in the same script that mutated it.

## Merge classification

Merge-base `87a7f488`. The two file sets are **fully disjoint** — verified *before* merging, not discovered during it.

- **LANE-TOUCHED only** (taken from the lane): `e2e/gazette-art-wiring.spec.ts`, `scripts/asset-diet.mjs`, `tasks/runs/20260728-234811-…md`. Main never moved these since the base.
- **MAIN-MOVED only** (lane holds stale copies; **main wins, nothing taken**): `STATUS.md`, `logs/.goal-tree.html`, `logs/dashboard.html`, `logs/task-stats.jsonl`, and six `artifacts/**` screenshots — all moved by s1185's own bookkeeping commit `b39c0c6c`.

No conflicts, no 3-way graft required. Path-scoped `git checkout lane/m3 -- <3 paths>` onto clean main.

## Findings

- **F-1186-1 🔻 non-blocking — the byte budget and the resize share one un-declared naming convention.** Both `asset-diet.mjs:88` (resize) and `:115` (budget) key on the literal substring `herald-engraving-` in the basename. A future Herald spot cut named anything else — `herald-spot-*`, `herald-cut-*` — would escape **both** the 384² resize **and** the 1.5 MB budget, silently and with no warning, because the unrecognised-tier warning only fires for files that are 1024² *and* selected. Zero exposure today: all **7** live cuts conform, and `heraldReader.ts:10-16` maps all seven through `herald-engraving-*.png`, so the convention is currently airtight. This is the same *class* as F-1185-3 (a rule keyed on a shape nobody declared), pointed at the budget instead of the resize. Recommendation: derive the family from `heraldReader.ts`'s map, or assert the count of budgeted files is 7. **No corrective task authored** — the exposure is hypothetical and the fix belongs with whoever adds cut #8.
- **Known red, unchanged and correctly refused: `e2e/gz-h1-newsie.spec.ts` 2/4.** Still aborts at `:114` on `Pip Quick` vs the shipped `Chen Mei`. This is the standing **F-1185-1**, owner-gated canon (§9b: fixing the spec would ratify uncited lore). The runner explicitly declined to touch it — **correct refusal**, and it is not collateral from this slice, which touches neither the newsie spec nor any character name.

## Firewall

Clean. The runner refused `assets/**`, `src/**`, other e2e specs, `news/herald.json`, `STATUS.md`, specs, reviews, and tracked screenshots — and restored the artifact screenshots its own gate runs had rewritten, because the TOUCH-ONLY list did not permit artifact changes. `git diff src/news/heraldReader.ts` empty at hand-off, re-verified here.
