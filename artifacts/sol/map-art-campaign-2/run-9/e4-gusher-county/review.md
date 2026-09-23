# Gusher County — run 9 fidelity

| Earlier clause, quoted verbatim | Run 9 answer |
| --- | --- |
| “Connected pipe dressing and richer outer-field art remain campaign art gaps.” | IMPROVED within all eight existing lease bodies: tapered timber lattice, upper rail, side winch, gauge, valve, service vessel, and a seven-segment connected local header/return chain. Each retains its exact source envelope. Derricks 01/03/04/05/07/08 become 2252 triangles; 02/06 become 2108, all within 3000 (previously 536–892). Full field density, illustrated weathering and between-lease pipe/channel composition remain HELD for art and contract/layout respectively, via Claude. |

The earlier contract/layout hold remains: the 160 m map has eight authored leases, five tar seams, roads and delivery systems; no continuous oil channels or new transport network were invented. All lease mounts, collision, heights, masks, routes and gameplay remain exact. The camp and outhouse source/GLBs, terrain, panorama and original atlas pixels are unchanged. The prior narrower camp and iron sheet correction is preserved.



The independent reviewer prefers the revised bodies and specifically confirms the exposed wheel and collared header improve mechanical readability. The pipe route, wheel-to-winch connection and weathering remain schematic; full oil-field scene fidelity is not accepted. [Review and revision check](independent-visual-review.md).

Derrick 01 occupies **30.38% / 30.86% fewer mask pixels** at the same source bounds (desktop / phone), opening gaps through the lattice despite the added mechanical detail. Inspection body median changes from run-5 **0.218911 / 0.219976** to **0.197651 / 0.197651**; removing the pale diagonal beam changes the material mix, so this is not a brightness gain claim. Whole-body emission stays **0.45**. [All silhouette measurements](silhouette-comparison.json) · [all eight before bodies](derricks-before-contact-sheet.png) · [all eight final bodies](derricks-after-contact-sheet.png).

The prior camp correction is exactly preserved: real actor occlusion **1.997897% desktop / 2.270577% phone** in both fresh arms and the same earlier run-5 values. Camp red-dominant pixels stay **0%**. Camp/outhouse source meshes and GLBs are byte-identical. [Actor masks](actor-visibility.json) · [paint footprint](paint-footprint.json).

Ground RMS retains run-5 **0.025724465 / 0.029924383** versus current **0.025724568 / 0.029924325**; fresh paired pixels are identical. No terrain or panorama treatment changed.

Declared 5 m persistent HUD, run 5 → run 9:

| Body | Desktop | Phone |
| --- | --- | --- |
| county-camp-rig | 0.005776% → 0.008560% | 0.010376% → 0.033327% |
| outhouse-geyser | 0.018386% → 0.009057% | 0.000000% → 0.040700% |
| derrick-01 | 0.011798% → 0.066778% | 0.179774% → 0.206279% |

All rises are explicitly reported: camp +0.002784/+0.022951 percentage points; outhouse phone +0.040700; fuller derrick 01 +0.054980/+0.026505. These are small silhouette-edge/mask samples at unchanged bounds and stations; the camp and outhouse geometry is exact. No new HUD-clearance acceptance is claimed, and the prior below-0.2% statement is not repeated for the fuller derrick. Supplemental 5 m phone stations across all eight derricks peak at **0.403286%**; those extra seven views do not change contract station declarations. Entry crop, story and UI remain held via Claude.

[Plain desktop board](board-1280.png) · [plain phone board](board-390.png) · [full masks/bounds](visual-metrics.json) · [each earlier figure](prior-comparison.json) · [exact source/authority invariants](invariants.json) · [triangle budgets](asset-budgets.json) · [saved Blender re-export](source-verification.json) · [recipe replay](recipe-verification.json).


TypeScript/default/full builds, **34/34** scoped render guards, **3/3** named guards, loading **8/8**, repeat **2/2**, source and recipe proofs pass. All map-ID-matching and shared browser suites ran both projects, one worker: **64 pass / six optional skips / six failures reproduced on exact baseline**. Four fingerprints are exact; two Claim-horizon values vary slightly. [Qualified attribution](failure-attribution.md). No assertion changed. All four ordinary boots and 44 station captures have zero console/page errors.

Four fresh browser runs per arm/viewport at entry, one comparable mode: p95 median **9.75→9.70 ms desktop (−0.51%) / 9.70→9.80 ms phone (+1.03%)**, inside 15%. Draws **80 / 54** and entry triangles **103708 / 99212** remain unchanged. These entry results do not profile the outer leases; the separate lease-station timing follows. [Entry samples](performance-summary.json).

E1 payload gate is not applicable to this E4-only map. No E1 source/runtime assets changed. Engine pin remains drain-owned. [Per-body geometry and byte deltas](model-deltas.json).

At the unchanged derrick-01 5 m inspection station, four fresh browser runs per arm/viewport also pass: p95 **9.05→8.95 ms desktop (−1.10%) / 8.90→8.90 ms phone (0%)**, single mode. Draws remain **63 / 44** while rendered triangles rise **100260→103216 / 97540→98924**. This supplementary profile includes revised lease geometry and remains inside 15%. [Lease-view samples and config](lease-performance/performance-summary.json).

Engine `8a51dec200e748ad42ea24d3ffd8f53525dfc7f34edba41b260107179b9f809c` → `e5acca191da821a5e1bf2ad225fef65ce93a11bd32d0610213465b7b23680bd7`. Store `8ef0a035c47622425dada043aca1145e88aaca80`, pushed/read back on `astra/fidelity-2`. READY-FOR-GATES with explicit art/UI holds and qualified base-red cases.
