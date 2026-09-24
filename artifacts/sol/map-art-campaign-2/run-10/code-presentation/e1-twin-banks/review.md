# Twin Banks — riparian scatter replaces the generic cards

2026-09-24 **run 10: code — presentation clause implemented; broader acceptance remains held.**

> “Sparse prop cards lack riparian density” / “generic scatter cards remain scatter-owner scope”.

The per-map appearance table in `Scatter.ts` replaces all 248 desktop / 102 phone generic cards with 150/62 reeds, 30/12 willows and 68/28 pieces of driftwood. Each original class retains its count and rendering owner; scatter stays at **6 draws**. Shapes reuse the shipped Twin Banks landmark atlas's green (2,1) and wood (0,1) cells. No bitmap or store bytes were authored.

Roots sit **0.025 m below** the delivered terrain. A late terrain-height swap re-seats the cards and contact patches, including cards hidden by existing building clearings. Contact patches stay above the ground. Both build zones and fords exclude a **1 m footprint margin**; bank probes keep cards off deep water. New actual-owner unit and browser checks cover counts, material selection, grounding, exclusions and hide/rebuild/reveal behavior. All **41 other map scatter meshes are byte-identical** at the fixed seed, including instance matrices, colors, geometry and material properties.

Visual judgment: generic pale grass, stumps and square cards are replaced by taller river vegetation and low driftwood. Build clearings remain intentionally open. This closes the excluded scatter-owner replacement clause; it does not establish full plate density or cure the offscreen far bank, river framing or HUD. The existing pack's 48 reed clumps remain unchanged.

Stations: homestead `(-13,-9)` and river `(0,9)`, plus original entry. Plain captures have no debug/test seam and advance to 10 seconds. Frozen diagnostic captures retain normal HUD; the tavernkeeper popup is present in both arms.

| Width | Frame p95 before → after | Change | Observed total draw calls before → after |
| --- | --- | --- | --- |
| 1280 | 9.95 → 9.65 ms | -3.02% | 78 → 78 |
| 390 | 9.95 → 9.70 ms | -2.51% | 56 → 56 |

Timing is the median of four paired/interleaved p95 runs per arm and width, 180 animation frames each, DPR 1, Chromium, fixed seed and frozen sim. Relay timing includes an active R2 beacon. All frame and draw deltas are within the 15% bar. Transient extra draws belong to existing scene behavior; owner draw counts above are exact. See `performance.json` and `../performance-summary.json`.

[1280 before/after board](board-1280.png) · [390 before/after board](board-390.png) · [Raw board state](boards.json) · [Plain boot state](plain.json) · [Full gates, attribution and remaining list](../run-note.md). All retained paired captures report zero console/page errors.

E1 first-town payload **34,341,349 → 34,341,349 B (+0 B)**, below 52,000,000 B. This is the declared first-town budget, not the total lazy game/asset output. The reused Twin Banks atlas adds a 307,650 B diet WebP to the release output, outside that first-town declaration. Total E1 dist output is **97,361,455 → 97,678,105 B (+316,650 B: WebP +307,650 B, JavaScript +9,000 B)**; no store asset changes.

Cumulative engine boundary for this map's commit: `dcc407bec54d01d4040d835f8140c21368c4cec8c445400d346cda59220b3d0b` → `85808a1e3507e2580343be4050a23d381b155c559be8794fb7c8fc8341bea785`. Shared store `5793a967da46e8f00c0ba16f92f17dc10d36558d` unchanged. Same-game audit counts and content are unchanged except the two inserted Game lines shifting source-line citations. Engine pin untouched.
