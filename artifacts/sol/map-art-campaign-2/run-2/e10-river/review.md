# The River — visual verdict, 2026-09-19

UNACCEPTED / HELD: the raw E10 River still uses the painted fallback; the finale's stamped charter uses the Claim sculpt. The raw plain boot has no mounted sculpt and shows flat banks, a tiled ford and the ordinary combat/build HUD. The plate's quiet dawn river is not achieved. HUD work is expressly excluded.

The render mismatch is traced in [route-invariants.json](route-invariants.json): both descriptors name `frontier-river-claim`, but raw E10 declares 128×128 and `terrainMesh: off`; the shipped Claim GLB spans −32..32 on each horizontal axis. The actual fallback cause is the absent raw `e10-river` entry in `Terrain3dClaimPilot.REGISTRY`, not the declarative flag alone. The finale's `E10FinaleSystem.launchRiver` stages the existing `the-claim` charter. Claim has five visible landmark mounts and three collision footprints; raw River has none.

A simple registry alias would therefore put a half-width sculpt and five legacy landmarks on a differently sized route, with no matching collision registry. Matching that by changing descriptor dimensions, the finale/door route, or collision meaning is outside this task. HELD pending a canonical route decision by those owners; no render alias, height-sampler edit or gameplay-data change was made. The next authorized fix should make both entries consume the same canonical charter, or explicitly author a matching 128 m render contract without inheriting unrelated mounts.

This is a diagnosed open defect, not a completed fallback repair. The actual finale lever is exercised separately after labelled diagnostic staging; its destination screenshots are plain, with no test hook. It does not prove native final-boss completion.

[Desktop route comparison](route-board-1280.png) and [phone route comparison](route-board-390.png) show the raw and charter outputs beside the same plate. The real lever reaches `the-claim` with ready sculpt, five mounts, name The River, no debug hook and zero errors at both viewports (`finale-route.json`). The riverbank/ford visual mismatch is confirmed, not inferred only from source.

[Desktop board](board-1280.png) · [Phone board](board-390.png). Both panels are fresh plain boots of **unchanged production bytes**, labelled A/B. They are not a claimed before/after improvement. Four runs per arm and viewport use a frozen diagnostic with normal HUD; all frames remain in [verdict-captures.json](verdict-captures.json). All four plain boots have zero console/page errors, correct active contract and no test hook.

| View | Draw calls A / B | p95 median A / B | A/B delta |
| --- | --- | --- | --- |
| 1280 | [69] / [69] | 25.15 / 25.10 ms | -0.20% |
| 390 | [60] / [60] | 29.60 / 25.35 ms | -14.36% |

Timing variation between identical arms measures the host, not an art regression or improvement. The full eight-run distributions are in [performance-summary.json](performance-summary.json); do not interpret a pooled median as a distinct mode. Triangle counts and each applicable authored cap are in asset-budgets.json (or the explicit fallback inventory).

Existing raw River boot and finale staging suites: **4/4 PASS**, both projects, one worker. These assert route/briefing behavior and actual Press handoff, not art correspondence. [Gate receipt](river-own-gates.json). Builds/global GLB/named checks from the unchanged E8 source boundary remain applicable. Raw phone diagnostics have an initial 32–33 ms band followed by 25–27 ms samples; both arms contain identical production bytes, so this is recorded as host/runtime variability, not a measured art speedup. No full battery, engine pin or sim edit.

Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`; pin untouched. No objective/persistence status is changed by this visual verdict.
