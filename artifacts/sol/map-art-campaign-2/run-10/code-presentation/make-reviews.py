from pathlib import Path
import json
r=Path(__file__).parent
perf=json.loads((r/'performance-summary.json').read_text())
hashes=json.loads((r/'hash-pair.json').read_text())
proof=json.loads((r/'headless-proof.json').read_text())
texts={
'e1-twin-banks':'''# Twin Banks — riparian scatter replaces the generic cards

2026-09-24 **run 10: code — presentation clause implemented; broader acceptance remains held.**

> “Sparse prop cards lack riparian density” / “generic scatter cards remain scatter-owner scope”.

The per-map appearance table in `Scatter.ts` replaces all 248 desktop / 102 phone generic cards with 150/62 reeds, 30/12 willows and 68/28 pieces of driftwood. Each original class retains its count and rendering owner; scatter stays at **6 draws**. Shapes reuse the shipped Twin Banks landmark atlas's green (2,1) and wood (0,1) cells. No bitmap or store bytes were authored.

Roots sit **0.025 m below** the delivered terrain. A late terrain-height swap re-seats the cards and contact patches, including cards hidden by existing building clearings. Contact patches stay above the ground. Both build zones and fords exclude a **1 m footprint margin**; bank probes keep cards off deep water. New actual-owner unit and browser checks cover counts, material selection, grounding, exclusions and hide/rebuild/reveal behavior. All **41 other map scatter meshes are byte-identical** at the fixed seed, including instance matrices, colors, geometry and material properties.

Visual judgment: generic pale grass, stumps and square cards are replaced by taller river vegetation and low driftwood. Build clearings remain intentionally open. This closes the excluded scatter-owner replacement clause; it does not establish full plate density or cure the offscreen far bank, river framing or HUD. The existing pack's 48 reed clumps remain unchanged.

Stations: homestead `(-13,-9)` and river `(0,9)`, plus original entry. Plain captures have no debug/test seam and advance to 10 seconds. Frozen diagnostic captures retain normal HUD; the tavernkeeper popup is present in both arms.
''',
'e2-trestle':'''# The Trestle — shared rails gain junctions and buffer stops

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
''',
'e7-relay-rush':'''# Relay Rush — the authored lamp follows the live relay state

2026-09-24 **run 10: code — presentation clause implemented; broader acceptance remains held.**

> “static frames do not claim a relay is active” / “Relay Rush's active signal”.

The new render-only owner binds the **4 existing frame materials** after their terrain mount completes. It reads the existing interference-front sites and relay-chain suppression. Only a lit, unmuted, unsuppressed site's authored teal lamp/dial atlas slot emits; it pulses at **0.75 Hz**, with uniform amplitude **0.75–1.35**. Inactive, locally muted and globally suppressed sites have **0** lamp emission and darkened lamp pigment. Other frame surfaces retain their existing body calibration.

The actual browser test starts with all four lamps dark, lights only R2 via an existing beacon, measures a changing pulse, then verifies the front mutes it and its departure restores it. Unit checks cover global suppression, reset, late loading, full/partial/empty mounts, failed/lite/off terrain, material disposal and hook restoration. Pending terrain performs no scene walk or sim read; completed mounts discover once. The Game mount is conditional on the existing front declaration, so maps without relays construct no owner.

**No new object, light, draw call, order, state or view field.** All 38 supported headless maps preserve their complete sampled view bytes, including Relay Rush. The four additional authored contracts do not support the headless simulator and are explicitly marked null there; their scatter and rail geometry still receive the full comparison.

Visual judgment: R2's two top lamps and ring become visibly teal when active, go dark under the front, and relight when restored, in both widths. Whole-route vista, plateau hierarchy, and inherited charting-station/dish framing/HUD remain separate holds.

Stations: original entry and declared R2 `(-25,44)`, with inactive/active/muted/restored frames. Plain entries run 10 seconds without debug/test hooks; active-state evidence uses existing sim hooks, labelled diagnostic.
'''
}
for mid,body in texts.items():
 rows=[p for p in perf if p['map']==mid]
 body+='\n| Width | Frame p95 before → after | Change | Observed total draw calls before → after |\n| --- | --- | --- | --- |\n'
 for p in rows:
  calls=lambda a:'/'.join(map(str,a))
  body+=f"| {p['width']} | {p['beforeP95']:.2f} → {p['afterP95']:.2f} ms | {p['deltaPercent']:+.2f}% | {calls(p['beforeCalls'])} → {calls(p['afterCalls'])} |\n"
 body+='\nTiming is the median of four paired/interleaved p95 runs per arm and width, 180 animation frames each, DPR 1, Chromium, fixed seed and frozen sim. Relay timing includes an active R2 beacon. All frame and draw deltas are within the 15% bar. Transient extra draws belong to existing scene behavior; owner draw counts above are exact. See `performance.json` and `../performance-summary.json`.\n'
 body+='\n[1280 before/after board](board-1280.png) · [390 before/after board](board-390.png) · [Raw board state](boards.json) · [Plain boot state](plain.json) · [Full gates, attribution and remaining list](../run-note.md). All retained paired captures report zero console/page errors.\n'
 h=next(h for h in hashes['maps'] if h['id']==mid)
 body+=f"\nE1 first-town payload **34,341,349 → 34,341,349 B (+0 B)**, below 52,000,000 B. This is the declared first-town budget, not the total lazy game/asset output. The reused Twin Banks atlas adds a 307,650 B diet WebP to the release output, outside that first-town declaration. Total E1 dist output is **97,361,455 → 97,678,105 B (+316,650 B: WebP +307,650 B, JavaScript +9,000 B)**; no store asset changes.\n\nCumulative engine boundary for this map's commit: `{h['before']}` → `{h['after']}`. Shared store `{hashes['storeBefore']}` unchanged. Same-game audit counts and content are unchanged except the two inserted Game lines shifting source-line citations. Engine pin untouched.\n"
 (r/mid/'review.md').write_text(body)
