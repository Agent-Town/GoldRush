# e1-night-shift — entry framing, 2026-09-24

DECLARED / HELD: already partly visible, so no glance.

lampworks_yard has nonzero body pixels at both widths. The unchanged zero-pixel trigger cannot cure partial cropping or HUD coverage; no improvement is credited to the live count variation. The phone yard and full lantern procession remain held.

Declared: `lampworks_yard`. The plate's foreground working yard and lamp rig establish the night work beside the lantern route; this is the declared yard mount at (8,18).

| View | Landmark | Rest pixels | Peak pixels | Return pixels | Seconds visible | Glance |
| --- | --- | ---: | ---: | ---: | --- | --- |
| 1280 | lampworks_yard | 101,349 | 80,279 | 80,258 | 3.996–3.996 (observation censored) | False |
| 390 | lampworks_yard | 11,087 | 9,361 | 9,343 | 3.986–3.986 (observation censored) | False |

Depth-tested body counts use a fixed DPR-1 viewport render target, excluding the HUD. The normal-HUD screenshots remain ordinary live boots. These numbers measure body visibility, not total landscape fidelity or HUD clearance. Duration follows recorded live camera poses against a frozen final scene; no teleport or sim order is used. Zero console/page errors in all capture arms.

[Desktop board](board-1280.png) · [Phone board](board-390.png) · [Raw captures](captures.json) · [Metrics](metrics.json) · [Contract invariants](invariants.json).

TypeScript and default/full/E1 builds PASS. First-town payload **34,322,816 B**; delta **+4,270 B** from the preceding map/build.

Own existing browser spec exit: **1**. See [test receipt](e2e-own.json) and [log](e2e-own.log). Own suite: 13 passed / 5 failed. Corrected pre-task CameraRig/manifest control: 3 failed / 3 passed. Both fog mismatches reproduce exactly (34/58 vs 18/42). The mobile sprite-lighting test also fails at base, but on its in-radius lower bound rather than the candidate out-of-radius upper bound; the exact pixel fingerprint is not reproduced. Both suspend timeouts pass at base; the unchanged candidate suspend retry passes 2/2. Initial base-control is invalid (evidence-server raw-JSON boot error) and is not attribution. Full browser acceptance remains HELD. No protected assertion was changed. Shared replay, parity and scoped guards are recorded in the run note.

Engine `d4e4bfb1167e66755209b2f679bf8682e03286b48dc9f8d1b929a1465f264959` → `9c2ee0ea822710505d86a59da361d42c2362729ef5feeded0ce7bff33100e47b`. Engine pin remains drain-owned. Camera offset, FOV, zoom, every hero start, Game entry/replay hook, view schema, sim and asset geometry are unchanged.
