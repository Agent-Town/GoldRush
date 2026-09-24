# e7-relay-rush — entry framing, 2026-09-24

Phone charting station and west dishes REVEALED; desktop west dishes REVEALED; desktop charting station HELD.

The charting station and west dish cluster are the two inherited Relay Valley bodies named by the run-6 hold. At 390, both are zero-body at rest and the ordered list reaches each inside the unchanged 2.5 s window. At 1280, 8,548 charting-station pixels already exist at the cropped left edge, so the unchanged zero-body rule skips it; only the west dishes are targeted. The charting-station body disappears during that desktop glance and returns afterward. Persistent HUD and broad plateau composition remain held. The list uses the former hold for two 0.2 s stops with a 0.7 s transit; it does not extend the tour or move the spawn.

Declared: `dead-gap-charting-station`, `west-ridge-dish-cluster`. The charting station and west dishes explain the relay route beyond the already-visible R2 frame.

| View | Landmark | Rest pixels | Peak pixels | Return pixels | Seconds visible | Entry window |
| --- | --- | ---: | ---: | ---: | --- | --- |
| 1280 | dead-gap-charting-station | 8,548 | 0 | 8,549 | 1.839–1.942 (observation censored) | True |
| 390 | dead-gap-charting-station | 0 | 21,955 | 0 | 0.609–0.725 | True |
| 1280 | west-ridge-dish-cluster | 0 | 22,216 | 0 | 2.107–2.223 | True |
| 390 | west-ridge-dish-cluster | 0 | 24,726 | 0 | 0.558–0.667 | True |

Unique-magenta depth-tested body counts use a fixed DPR-1 viewport render target, excluding the HUD. Counting the unique colour prevents animated water from contaminating a two-render difference. The normal-HUD screenshots remain ordinary live boots. These numbers measure body visibility, not total landscape fidelity or HUD clearance. Duration follows recorded live camera poses against a frozen final scene; no teleport or sim order is used. Zero console/page errors in all capture arms.

[Desktop board](board-1280.png) · [Phone board](board-390.png) · [Raw captures](captures.json) · [Metrics](metrics.json) · [Contract invariants](invariants.json).

TypeScript and default/full/E1 builds PASS. First-town payload **34,340,806 B**; delta **+525 B** from the preceding map/build.

Own existing browser spec exit: **0**. See [test receipt](e2e-own.json) and [log](e2e-own.log). The unchanged Relay Rush front spec passed all 8 tests across desktop and mobile. No protected assertion was changed. Shared replay, parity, release checks and all gate holds are recorded in the [closing run note](../run-note.md).

Additional body boards: [west-dishes desktop](west-dishes/board-1280.png) · [west-dishes phone](west-dishes/board-390.png).

The entry-window column names whether the map tour ran, not whether each individual body qualified. Already-visible bodies are skipped. Visibility sums separate observed intervals and does not count the offscreen gap between them. The singular declaration is retained as the list first element.

Engine `13fb20763655460af233764b4bb4ad960b2a1e758c3476473bd353e5b4203aa1` → `dcc407bec54d01d4040d835f8140c21368c4cec8c445400d346cda59220b3d0b`. Engine pin remains drain-owned. Camera offset, FOV, zoom, every hero start, Game entry/replay hook, view schema, sim and asset geometry are unchanged.
