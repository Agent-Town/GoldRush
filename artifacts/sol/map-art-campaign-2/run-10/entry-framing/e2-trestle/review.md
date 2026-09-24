# e2-trestle — entry framing, 2026-09-24

IMPROVED: phone bridge body revealed; desktop already partly visible.

The bridge span is the declared trestle-crossing body. Phone gains a 2.5-second glance and returns to the rider; desktop skips the existing visible fragment. Full span composition, gorge vista, rail stock and HUD clearance remain separate holds under the unchanged offset, zoom and zero-pixel rule.

Declared: `trestle-crossing`. The plate leads with the bridge span over the gorge; the existing crossing mount is the view's central structure.

| View | Landmark | Rest pixels | Peak pixels | Return pixels | Seconds visible | Glance |
| --- | --- | ---: | ---: | ---: | --- | --- |
| 1280 | trestle-crossing | 8,161 | 8,155 | 8,148 | 3.997–3.997 (observation censored) | False |
| 390 | trestle-crossing | 0 | 52,732 | 0 | 1.833–1.95 | True |

Unique-magenta depth-tested body counts use a fixed DPR-1 viewport render target, excluding the HUD. Counting the unique colour prevents animated water from contaminating a two-render difference. The normal-HUD screenshots remain ordinary live boots. These numbers measure body visibility, not total landscape fidelity or HUD clearance. Duration follows recorded live camera poses against a frozen final scene; no teleport or sim order is used. Zero console/page errors in all capture arms.

[Desktop board](board-1280.png) · [Phone board](board-390.png) · [Raw captures](captures.json) · [Metrics](metrics.json) · [Contract invariants](invariants.json).

TypeScript and default/full/E1 builds PASS. First-town payload **34,339,545 B**; delta **+5,896 B** from the preceding map/build.

Own existing browser spec exit: **0**. See [test receipt](e2e-own.json) and [log](e2e-own.log). Own unchanged Trestle gameplay spec PASS 2/2, desktop and mobile. Full-span top/bottom cropping is visible in the phone peak board and is not represented as a full-frame success. No protected assertion was changed. Shared replay, parity and scoped guards are recorded in the run note.

Engine `3791c3f04a2941cd2b03a1b34883ef4ddee1c09d7d5e57630ef58416db65113b` → `2b0d52300abd6a7558c4d4a818e8bc61f0f3ffbde92984685d8f77a8aa653de4`. Engine pin remains drain-owned. Camera offset, FOV, zoom, every hero start, Game entry/replay hook, view schema, sim and asset geometry are unchanged.
