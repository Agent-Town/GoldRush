# e6-glow-mesa — entry framing, 2026-09-24

IMPROVED: phone derrick then cooling rack fit one window; desktop rack HELD.

entryLandmarks keeps mesa-starstone-derrick first and adds isotope-cooling-rack. The phone tour preserves the 0.7 s entry/return eases and uses the old 1.1 s hold for 0.2 s first hold, 0.7 s transit and 0.2 s second hold. The phone bodies are visible about 0.45–0.55 s and 0.58–0.68 s; this trades dwell time for two views. Desktop rack already has body pixels, so it is skipped; its zero peak count is at the derrick stop, not a claimed rack glance. Cropping, desktop rack HUD coverage, full mesa grouping and active node-ring presentation remain HELD.

Declared: `mesa-starstone-derrick`, `isotope-cooling-rack`. The cooling rack is the offscreen facility the first derrick glance did not reveal.

| View | Landmark | Rest pixels | Peak pixels | Return pixels | Seconds visible | Entry window |
| --- | --- | ---: | ---: | ---: | --- | --- |
| 1280 | mesa-starstone-derrick | 0 | 37,168 | 0 | 1.392–1.509 | True |
| 390 | mesa-starstone-derrick | 0 | 41,400 | 0 | 0.448–0.55 | True |
| 1280 | isotope-cooling-rack | 5,390 | 0 | 5,389 | 1.6–1.709 (observation censored) | True |
| 390 | isotope-cooling-rack | 0 | 35,096 | 0 | 0.575–0.684 | True |

Unique-magenta depth-tested body counts use a fixed DPR-1 viewport render target, excluding the HUD. Counting the unique colour prevents animated water from contaminating a two-render difference. The normal-HUD screenshots remain ordinary live boots. These numbers measure body visibility, not total landscape fidelity or HUD clearance. Duration follows recorded live camera poses against a frozen final scene; no teleport or sim order is used. Zero console/page errors in all capture arms.

[Desktop board](board-1280.png) · [Phone board](board-390.png) · [Raw captures](captures.json) · [Metrics](metrics.json) · [Contract invariants](invariants.json).

TypeScript and default/full/E1 builds PASS. First-town payload **34,340,281 B**; delta **+736 B** from the preceding map/build.

Own existing browser spec exit: **0**. See [test receipt](e2e-own.json) and [log](e2e-own.log). Own unchanged Atomic story suite PASS 10/10. Scoped guards PASS (see guards-gates.json); normal/replay/multiplayer camera poses match the baseline for 1,200 frames, and the old single-target route matches for 540 frames. The two-stop timing and visibility-case proof passes. No protected assertion was changed. Shared replay, parity, release checks and all gate holds are recorded in the [closing run note](../run-note.md).

Additional body boards: [cooling-rack desktop](cooling-rack/board-1280.png) · [cooling-rack phone](cooling-rack/board-390.png).

The entry-window column names whether the map tour ran, not whether each individual body qualified. Already-visible bodies are skipped. Visibility sums separate observed intervals and does not count the offscreen gap between them. The singular declaration is retained as the list first element.

Engine `2b0d52300abd6a7558c4d4a818e8bc61f0f3ffbde92984685d8f77a8aa653de4` → `13fb20763655460af233764b4bb4ad960b2a1e758c3476473bd353e5b4203aa1`. Engine pin remains drain-owned. Camera offset, FOV, zoom, every hero start, Game entry/replay hook, view schema, sim and asset geometry are unchanged.
