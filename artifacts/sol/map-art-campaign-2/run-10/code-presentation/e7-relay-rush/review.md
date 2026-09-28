# Relay Rush — the authored lamp follows the live relay state

2026-09-24 **run 10: code — presentation clause implemented; broader acceptance remains held.**

> “static frames do not claim a relay is active” / “Relay Rush's active signal”.

The new render-only owner binds the **4 existing frame materials** after their terrain mount completes. It reads the existing interference-front sites and relay-chain suppression. Only a lit, unmuted, unsuppressed site's authored teal lamp/dial atlas slot emits; it pulses at **0.75 Hz**, with uniform amplitude **0.75–1.35**. Inactive, locally muted and globally suppressed sites have **0** lamp emission and darkened lamp pigment. Other frame surfaces retain their existing body calibration.

The actual browser test starts with all four lamps dark, lights only R2 via an existing beacon, measures a changing pulse, then verifies the front mutes it and its departure restores it. Unit checks cover global suppression, reset, late loading, full/partial/empty mounts, failed/lite/off terrain, material disposal and hook restoration. Pending terrain performs no scene walk or sim read; completed mounts discover once. The Game mount is conditional on the existing front declaration, so maps without relays construct no owner.

**No new object, light, draw call, order, state or view field.** All 38 supported headless maps preserve their complete sampled view bytes, including Relay Rush. The four additional authored contracts do not support the headless simulator and are explicitly marked null there; their scatter and rail geometry still receive the full comparison.

Visual judgment: R2's two top lamps and ring become visibly teal when active, go dark under the front, and relight when restored, in both widths. Whole-route vista, plateau hierarchy, and inherited charting-station/dish framing/HUD remain separate holds.

Stations: original entry and declared R2 `(-25,44)`, with inactive/active/muted/restored frames. Plain entries run 10 seconds without debug/test hooks; active-state evidence uses existing sim hooks, labelled diagnostic.

| Width | Frame p95 before → after | Change | Observed total draw calls before → after |
| --- | --- | --- | --- |
| 1280 | 9.95 → 9.95 ms | +0.00% | 71/72 → 71 |
| 390 | 9.85 → 10.00 ms | +1.52% | 53 → 53 |

Timing is the median of four paired/interleaved p95 runs per arm and width, 180 animation frames each, DPR 1, Chromium, fixed seed and frozen sim. Relay timing includes an active R2 beacon. All frame and draw deltas are within the 15% bar. Transient extra draws belong to existing scene behavior; owner draw counts above are exact. See `performance.json` and `../performance-summary.json`.

[1280 before/after board](board-1280.png) · [390 before/after board](board-390.png) · [Raw board state](boards.json) · [Plain boot state](plain.json) · [Full gates, attribution and remaining list](../run-note.md). All retained paired captures report zero console/page errors.

E1 first-town payload **34,341,349 → 34,341,349 B (+0 B)**, below 52,000,000 B. This is the declared first-town budget, not the total lazy game/asset output. The reused Twin Banks atlas adds a 307,650 B diet WebP to the release output, outside that first-town declaration. Total E1 dist output is **97,361,455 → 97,678,105 B (+316,650 B: WebP +307,650 B, JavaScript +9,000 B)**; no store asset changes.

Cumulative engine boundary for this map's commit: `5c555d6e0438d8febd8fb430b3a7fe6d1048642928aa8157f76865cf42d0dcab` → `0b017ed5230a0b8c2e46d756004388034a3dc58bca94848b2708a33d35d4dce7`. Shared store `5793a967da46e8f00c0ba16f92f17dc10d36558d` unchanged. Same-game audit counts and content are unchanged except the two inserted Game lines shifting source-line citations. Engine pin untouched.
