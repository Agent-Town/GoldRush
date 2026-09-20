# Eclipse — shared drum detail verdict, 2026-09-19

IMPROVED; full concept remains UNACCEPTED. [Desktop board](board-1280.png), [phone board](board-390.png). This map reuses Mare's terrain and the same three independent dome mounts, per its reuse contract.

- Inhabited drum: IMPROVED by five framed ports and six service panels per dome, +32 triangles, exactly 3,000/3,000. The limited benefit is visible on the lower wall; it does not supply an inhabited interior.
- Glass richness: HELD. Existing panes and materials are unchanged; the broad glass surfaces still read dull and empty.
- Player contrast: HELD. Brown hero/ground/architecture remain close in tone; character owners are excluded.
- Map dressing and full concept: HELD. The plain boot does not communicate the plate's terrace enclosure, settlement lighting or eclipse vista; central dome and HUD dominate portrait. A shared dome detail cannot settle this map-wide composition.

Four runs per arm: median p95 9.20→9.60 ms desktop (+4.35%) / 9.45→9.10 ms phone (−3.70%); calls unchanged 85/60, visible triangles +96/+32. Same 8.4–10.0 ms timing band, no discarded mode. [All frames](dome-paired.json), [summary](performance-summary.json). Terrain 32,768/60,000; panorama 3,072/4,000; shared dome 3,000/3,000.

The final before captures route only the exact old GLB bytes (SHA256 recorded in before.json). An initial capture overlapped a builder run and a second attempt accidentally intercepted Vite's import wrapper; both invalid attempts are preserved under `_raw/run-2` and excluded from these boards. Corrected before/after plain captures report zero console/page errors and no test hook.

This verdict follows the shared source landing in Mare. No further runtime or asset change. Engine before = after 32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb. Shared geometry proof and gates: [Mare review](../e8-mare-claim/review.md).
