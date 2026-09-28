# The Trestle — shared rails gain junctions and buffer stops

2026-09-24 **run 10: code — presentation clause implemented; broader acceptance remains held.**

> “Intersecting/abruptly ending rails dominate” / “HELD for shared route joins/ends” / “shared rail joins/ends belong to the rail-presentation owner”.

The shared renderer now gives Trestle **1 junction, 4 rail-crossing frogs and 4 buffer stops**. One **5-sleeper**, **2.8 m-wide** run replaces overlapping ties at the crossing; paired check rails flank it and **0.17 m flangeways** separate the crossing rails. Joined offsets meet with mitres. Every graph endpoint gains two braces and a raised crossbar from the same unit rail geometry. Retraced edges are deduplicated, including Canyon Works' reversal, without moving the authoritative polyline.

Trestle's rail instances change **320→348**, ties **160→157**, with **2→2 draw calls**. All seven maps using this shared renderer preserve byte-identical route descriptors and stations. The rule affects only steamworks/mine-spur styles; canal/mass-driver styles retain identical mesh bytes.

| Other map | Result under the same rule |
| --- | --- |
| Hill Mine | Improved: 6 buffer stops, offset mitres at bends; 2 draws. |
| Incline | Improved: 4 buffer stops; 2 draws. |
| Canyon Works | Improved: 1 joined sleeper run, 4 frogs and 4 stops, retraced edge removed and rail gauge preserved at its reversal; 2 draws. |
| Eclipse | Byte-identical mesh/material/instance capture. |
| Mare Claim | Byte-identical mesh/material/instance capture. |
| Dome Basin | Byte-identical mesh/material/instance capture. |

Paired desktop/phone boards for the three other changed maps are in their sibling folders. Endpoint stops and continuous bends are visibly improved; the Canyon crossing has one tie run. The Trestle's existing worksite partly obscures the junction at ordinary camera scale, and its full bridge vista/HUD/approach holds remain. No rail asset, collision, route or station moves.

Stations: original entry, declared crossing `(0,7)`, shared join `(0,-19)` and spur endpoint `(18,-23)`. Plain entry captures advance to 10 seconds without debug/test hooks; diagnostic stations use the same untouched camera.

| Width | Frame p95 before → after | Change | Observed total draw calls before → after |
| --- | --- | --- | --- |
| 1280 | 9.90 → 10.00 ms | +1.01% | 87 → 87 |
| 390 | 9.90 → 10.05 ms | +1.52% | 65 → 65 |

Timing is the median of four paired/interleaved p95 runs per arm and width, 180 animation frames each, DPR 1, Chromium, fixed seed and frozen sim. Relay timing includes an active R2 beacon. All frame and draw deltas are within the 15% bar. Transient extra draws belong to existing scene behavior; owner draw counts above are exact. See `performance.json` and `../performance-summary.json`.

[1280 before/after board](board-1280.png) · [390 before/after board](board-390.png) · [Raw board state](boards.json) · [Plain boot state](plain.json) · [Full gates, attribution and remaining list](../run-note.md). All retained paired captures report zero console/page errors.

E1 first-town payload **34,341,349 → 34,341,349 B (+0 B)**, below 52,000,000 B. This is the declared first-town budget, not the total lazy game/asset output. The reused Twin Banks atlas adds a 307,650 B diet WebP to the release output, outside that first-town declaration. Total E1 dist output is **97,361,455 → 97,678,105 B (+316,650 B: WebP +307,650 B, JavaScript +9,000 B)**; no store asset changes.

Cumulative engine boundary for this map's commit: `85808a1e3507e2580343be4050a23d381b155c559be8794fb7c8fc8341bea785` → `5c555d6e0438d8febd8fb430b3a7fe6d1048642928aa8157f76865cf42d0dcab`. Shared store `5793a967da46e8f00c0ba16f92f17dc10d36558d` unchanged. Same-game audit counts and content are unchanged except the two inserted Game lines shifting source-line citations. Engine pin untouched.
