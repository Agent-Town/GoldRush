# Review: perf-optimization-survey — the county's first full performance survey (lane-b; Codex instruments salvaged, completed by Claude Opus 5; attended drain 2026-09-06 early)

**Slice/branch/tip:** `perf-optimization-survey` · `lane/b` · salvage `afc37ce35` (the codex run's instruments, died at 41 min on "Selected model is at capacity") + `9f53163cb`, `392df7b2f`, `954d7de58 (archive: pruned by the A3 rewrite)` (Opus) · merged to main at `5bba45fb6` (first-parent merge; the only conflict was the ledger, unioned).
**Verdict:** MERGED as a measurement deliverable. No game code changed: `docs/reviews/2026-09-05-perf-survey.md` (8,600 words), `scripts/perf-survey/` (20 instrument files), `artifacts/perf-survey/**` (826 files, 126 MB, largest 4.5 MB; the 59 MB of `.cpuprofile` deliberately left untracked on disk), one ledger row.

## What it found
- **No desktop frame problem on the hardware measured.** A late quiet window (load ≤ 12, median of three, three clean samples per arm) got nine clean arms across five maps (`the-claim`, `e9-seed-run` at 210 draw calls, `e2-hill-mine`, `e1-night-shift` at 156k triangles, `e4-long-road`): every one 119-120 fps with 0.9-1.3 ms render-submit CPU and 0-1 long frames per 10 s. Triangle count varies 60% and draw calls 3.3× across those arms without moving the number. The render-side rungs are therefore headroom, GPU-memory and low-end-device arguments and are labelled so.
- **Where the cost actually is:** the sim (`StandingOrders.snapshot()` deep-clones the whole growing history, 59% of the `county-e6-picnic` replay, `src/agent/StandingOrders.ts:290`+`:845`; 10 of 25 county tapes replay below 20× realtime and 6 more exceed the 60 s node ceiling), delivery (the town's first load 23.99 MB of a 25 MB budget, `e5-regatta` 31.49 MB; the Fast-3G first frame a fixed 7.25 s on 0.89 MB, latency-bound), and resident texture memory (89-215 MB per map after the shared atlas; six 1672×941 boss sheets are 50.3 MB of `the-claim`'s 166.8 MB). `EnemyPool` submits 39,360 triangles of empty pool at wave 1; 63% of submitted triangles carry `frustumCulled = false` (72 sites). The same-document town round trip leaks 0.62 MB of JS heap per cycle.
- **Two master premises corrected:** the board holds 42 contracts, not 36 (the six `terrainMesh: off` boards), and every terrain grid is 128² = 32,768 triangles (a "64-grid" is a 4× cut, not 2×).
- **F-PERF-14 (integrity, ahead of the whole ladder, owner desk):** `county-e3-moth-season` replays to `fnv1a32:9be0399e` against the tape's recorded `64e32dde` and runs 16,390 ticks against 10,801 declared, reproduced twice at loads 64 and 16; the repo's own `scripts/assay-replay-agent.mjs` produces the same divergent hash. All 24 other tapes match exactly. Stale reel or engine divergence is not resolved here; it is F-E8RM-8's contract-lineage question made concrete (Moth Season's composition changed today).
- **Cross-reference with the Astra wave:** the asset-diet manifest, shared atlas, bounded prefetch, triangle sampler and Lantern stage are all in the measured build `44efbf3d6` and not re-litigated; `landmark-lighting-calibration` (`a05abdf1d`) is NOT in the measured build.

## Evidence
| Check | Result |
|---|---|
| `node scripts/perf-survey/validate.mjs` | PASSES on all 227 rows (schema, every published quantile re-derived from the raw per-frame samples, wave/contract/tier identity, tracked firewall) |
| Coverage | 40 of 43 targets (42 board contracts + town), 215 measured rows, zero console/page/network errors; the 12 failures are all F-PERF-11 (`e10-ember-shore`, `e10-archive-world`, `e10-river` fall back to `the-claim`) |
| Frame timings from the census | labelled untrustworthy (F-PERF-1: the host carried three other implementers, 170 of 215 rows above load 12); only §1b's quiet-window arms are ranked on |
| Blob-size law before merge | largest object in `main..lane/b` is the ledger itself (7.9 MB); no artifact over 4.5 MB |
| Attended on the merged tree | tsc clean; nothing under `src/` changed, so no era pin and no e2e beyond the node-guard battery run with the chapter drains |

## Merge classification
Base `79c7d2c57` (the s2529 handoff). 847 files added (826 under `artifacts/perf-survey/`, 20 under `scripts/perf-survey/`, the report), 1 modified (`tasks/BACKLOG.md`, MAIN-MOVED, unioned: the lane's row prepended over main's). No `src/` file touched.

## Findings
- **F-PERF-14** goes to the OWNER'S DESK as ladder rung 0 (`moth-season-replay-hash-divergence`) beside the contract-lineage row from F-E8RM-8; the assayer verifies standings by that hash, so this is correctness, not speed.
- **The ten proposed masters** (§10/§11 of the report, each with the number it must move and its gate; five gates structural and standing without a quiet host) are fire-authorable from the report one at a time; the first three by win ÷ effort are the `StandingOrders.snapshot()` clone, the empty `EnemyPool` submission, and a draw-call budget for the 41 maps `perf-01` does not cover.
- **Named gaps, honest:** ms-level system attribution (noise-dominated, reported as failed), 3 of 6 attribution maps, no clean lite/mobile arm, GPU-side allocation, the leaking module's owner, the 6 tapes past the 60 s ceiling, and any real hardware.
