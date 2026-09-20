# Review: prefetch-bounded-warming — the advance stream stops after the successor (lane-b, codex runner on gpt-6-astra xhigh, attended drain 2026-09-05)

**Slice/branch/tip:** `prefetch-bounded-warming` · `lane/b` · runner commit `33cdb7c3f` over base `15dc51b89` · merge `c7856dca7` (no-ff, no conflicts; the fire's `save/prefetch-bounded-warming-s2519` backup is now redundant → archive).
**Verdict:** MERGED. F-ASTRA-5 cured.

## What it does
`src/assets/AdvanceStream.ts`: normal mode warms priorities 1–2 only (town + likely destination, or destination + successor); the `:73-74` sweeps are gone from the default plan; a per-session byte allowance (24 MB on desktop tiers, 12 MB on mobile-class or Balanced) stops scheduling once reached, published as `assetPrefetchAllowance`/`assetPrefetchBytes` in the canvas dataset; the old sweep survives only behind a persisted "Warm every map" opt-in in Start Menu → Settings (`src/ui/menu/StartMenu.ts`). Measured build bytes: Town 4,971,188; The Claim 2,939,704; Dry Gulch 3,679,340 — 12 MB covers the town plus either map.

## Evidence (merged tree `c7856dca7` + era pin `8afae55f`)
| Gate | Result |
|---|---|
| `npx tsc --noEmit` / `npm run build` | rc 0 / rc 0 |
| `advance-stream`, `advance-stream-bounded` (new), `advance-stream-cache-reuse`, `advance-stream-walkthrough` (drain port 5273, workers=1) | 22/22 desktop + 390px |
| `scripts/engine-era-guard.test.mjs` after the pin | 5/5 |
| `e2e/asset-diet.spec.ts` | NOT re-run attended: the main working tree carries the rejected `deploy-budget-hard-verdict` edit to that spec (Mistake #12); the runner's own asset-diet runs on the lane passed (its `asset-diet-final/` evidence) |

## Merge classification (base `15dc51b89`)
| File | Class | Resolution |
|---|---|---|
| `src/assets/AdvanceStream.ts`, `src/ui/menu/StartMenu.ts`, `e2e/advance-stream.spec.ts`, `e2e/advance-stream-bounded.spec.ts` | LANE-TOUCHED | clean |
| `artifacts/prefetch-bounded-warming/**` (70 files, small) | NEW evidence | clean |

## Findings
- **F-PBW-1 (non-blocking):** the 12 MB mobile allowance is one town plus one map; a second successor never warms on a phone by design — the survey (`perf-optimization-survey`) should confirm the number against measured time-to-first-frame.
