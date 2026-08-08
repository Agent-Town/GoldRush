# c3-notes — Playtester Defect Observations

## 1. Build range tracking references wrong actor

The `BuildSystem` constructor parameter `heroPosition` (line 466) is actually assigned `this.prospector.position` in `HeadlessContractSim` (line 297). This causes the build range check at `confirm()` (line 950: `this.ghostPos.x - this.heroPosition.x`) to compute distance from the **prospector**, not the **hero**. An agent relying on `placeRadius` from the claim or hero position will find builds out of range when the prospector is walking to or from a seam.

**Impact during play**: The first beacon was placeable (prospector starts at claim), but subsequent structures could not be built during waves where the prospector was actively harvesting — they only went up when gold accumulated high enough to chain-fire BEFORE the first HARVEST movement tick.

## 2. Single-seam gold bottleneck

Only 2-3 gold seams are ever active simultaneously (`goldSeam.activeMin: 2`, `activeMax: 3`). With only seams 1 and 2 active for the entire 20-wave run, the effective gold income was capped at ~7g/wave (one harvest tick per wave per seam). No third seam was activated when seam-2 depleted at wave 4, leaving a single active seam (seam-1) for the remainder of the run.

**Impact**: Building turrets (50-125g, plus escalating costs) remained impractical for most of the run despite surviving past the secure wave. Only the cheap beacon (25g, then 35g, etc.) saw incremental construction.

## 3. Build-failure detail not propagated

When a BUILD action fails (e.g., for `out_of_zone` due to prospector position), the failure detail is set via `setBuildRejectionDetail()` and captured via `takeBuildRejectionDetail()`, but it is not emitted to stderr as a `gr-sim rejected orders:` message — those are reserved for order-parse and submission-level rejections. Build-action failures are silently marked `ok: false` with `reason: 'FAILED'` in the receipt, and the `order_failure` surprise event is appended to the log. An agent would need to parse the standing-orders log to detect these silent build failures.

## 4. Seam count drifts below activeMin

`Balance.goldSeam.activeMin` is 2, meaning at least 2 seams should be active at any time. When gold-seam-2 fully depleted, the active-seam count dropped to 1 (seam-1 only) and never recovered to ≥2. Either the respawn timer for seam-2 exceeded the run duration, or the activation logic does not guarantee the minimum when a seam depletes. With only 1 active seam, gold income was halved compared to the 2-seam baseline.