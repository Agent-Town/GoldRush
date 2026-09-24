# e1-baron — entry framing, 2026-09-24

IMPROVED: phone headframe revealed; desktop already partly visible.

The phone glance frames seized_headframe for about 1.9 seconds and returns to the rider. Desktop skips its already-visible body. The 55.21 m fort, second cart, broad occupied valley, desktop headframe crop and remaining HUD overlap are HELD outside this bounded reveal.

Declared: `seized_headframe`. The seized headframe identifies the Baron's occupied workings and fits a single glance; the 55.21 m fort remains a separate layout hold.

| View | Landmark | Rest pixels | Peak pixels | Return pixels | Seconds visible | Glance |
| --- | --- | ---: | ---: | ---: | --- | --- |
| 1280 | seized_headframe | 24,267 | 24,265 | 24,264 | 4–4 (observation censored) | False |
| 390 | seized_headframe | 0 | 22,185 | 0 | 1.858–1.966 | True |

Unique-magenta depth-tested body counts use a fixed DPR-1 viewport render target, excluding the HUD. Counting the unique colour prevents animated water from contaminating a two-render difference. The normal-HUD screenshots remain ordinary live boots. These numbers measure body visibility, not total landscape fidelity or HUD clearance. Duration follows recorded live camera poses against a frozen final scene; no teleport or sim order is used. Zero console/page errors in all capture arms.

[Desktop board](board-1280.png) · [Phone board](board-390.png) · [Raw captures](captures.json) · [Metrics](metrics.json) · [Contract invariants](invariants.json).

TypeScript and default/full/E1 builds PASS. First-town payload **34,333,649 B**; delta **+4,577 B** from the preceding map/build.

Own existing browser spec exit: **1**. See [test receipt](e2e-own.json) and [log](e2e-own.log). Own suite 20 passed / 2 failed. Both failures reproduce at the identical prefetch assertion under the pre-task CameraRig/manifest control: baronAnimationLoaded false instead of true, line 302 in the test at line 411, desktop and mobile. See e2e-base-verified.log. Full suite acceptance remains HELD; no assertions changed. No protected assertion was changed. Shared replay, parity, release checks and all gate holds are recorded in the [closing run note](../run-note.md).

Engine `97855ed9d083ec03a2057dfc9f33b0618f6c8cb28fcfac99952fa1e2e6000a97` → `3791c3f04a2941cd2b03a1b34883ef4ddee1c09d7d5e57630ef58416db65113b`. Engine pin remains drain-owned. Camera offset, FOV, zoom, every hero start, Game entry/replay hook, view schema, sim and asset geometry are unchanged.
