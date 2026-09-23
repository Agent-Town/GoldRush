# Incline — run 9 fidelity

2026-09-23. **IMPROVED / HELD; full concept fidelity remains unaccepted.**

## Carried clauses, verbatim

| Earlier clause | Run 9 answer |
| --- | --- |
| "Further terminal silhouette/platform fidelity remains campaign art-owned." | **IMPROVED:** the cable house gains a spoked sheave, supported axle, explicit wound drum and direct cable returns, a boarded deck/fascia, timber pitched roof, facade openings and a visible exhaust neck. Removing the buried reused winch avoids layering new geometry over the old dark cluster. Body **2,028 → 2,136 / 3,000 triangles**, net +108. Original bounds, mounts, collision footprint and stations remain exact; four sibling bodies and atlas pixels remain byte-identical. |
| "Remaining high-confidence defects: hoop lacks a convincing axle/spokes silhouette, lower assembly is a dark crossed cluster, platform reads as a thin rectangular sheet, and the defining cliffs and integrated incline terminal are absent from entry." | **IMPROVED mechanism:** eight spokes and a hub/bearings replace the empty-hoop reading; two visible cable returns meet a wound drum. **FIXED duplicated dark crossed cluster:** its entire reused winch component is removed, exposing the facade and cable path. **IMPROVED platform:** front fascia thickness **0.24 → 0.48 m**, new deck boards, unchanged outer bounds. **HELD art:** fine bearing/axle definition and strong contact shadows. **HELD contract/layout/camera:** cliffs, functional track integration and entry vista. These new component dimensions are source comparisons; the earlier review published no separate spoke/contact metric. |
| "Medium confidence: saturated red roof and source-less-looking bright patch dominate, rear machinery merges, and a pale plant intersects the platform edge." | **IMPROVED roof/plume:** timber replaces the saturated red roof, a pipe neck meets the existing steam vent, and the cable-house puff radius/growth shrink **3.6/1.9 → 1.45/1.4** while source position, cadence, lifespan and rise remain unchanged. **HELD art:** roof/wall/deck values remain similar and atlas grain repetitive. **HELD layout/camera:** rear machinery overlap. **HELD excluded scatter owner:** the pale plant remains at the deck edge; neither its placement nor the body footprint is moved. |
| "Phone: persistent weapon card conceals rear machinery and part of the roof region; temporary dialogue occupies the lower screen." | **HELD UI/camera:** the ordinary phone capture retains the banner and weapon card. Primary-body coverage is measured at the unchanged 5 m station, separately from rear machinery; no entry or UI fix is claimed. |
| "No obvious new ordering defect was identified. Still images do not prove lift/cart motion; actual escort motion is covered only by existing functional tests." | **PRESERVED:** independent review identifies no new depth-order, geometry or scale defect. This is static terminal fidelity; existing escort gameplay is verified separately, and no active lift/cart animation is claimed. |

## Numbers and limits

Each earlier comparison uses the latest **run-4** figure for this map; it had no run-6 replacement. The original inspection stations are unchanged. Measurements below are display-RGB luminance and percentages, not physical radiometry.

| Measure | Run 4 | Run 9 | Answer |
| --- | ---: | ---: | --- |
| Ground RMS, 1280 px | 0.01913605 | 0.01914262 (+0.034%) | No further noise reduction claimed; terrain bytes and median 0.17735373 unchanged, dark share 0. |
| Ground RMS, 390 px | 0.01818416 | 0.01833808 (+0.846%) | No further noise reduction claimed; terrain bytes and median 0.21204549 unchanged, dark share 0. |
| Cable-house body median, 1280 px | 0.13415529 | 0.16405569 (+22.29%) | IMPROVED at unchanged whole-body emission 0.375. |
| Cable-house body median, 390 px | 0.13729569 | 0.16602667 (+20.93%) | IMPROVED at unchanged whole-body emission 0.375. |

**Persistent HUD coverage at the same 5 m stations (percent):** every measured increase is disclosed. These masks exclude temporary dialogue only; the ordinary-HUD images retain it. Neither body pose, inspection distance nor UI changes to obtain a better number.

| Body | Width | Run 4 | Run 9 | Compared with prior |
| --- | ---: | ---: | ---: | --- |
| upper-ore-cable-house | 1280 | 0.008406% | 0.058934% | INCREASE — reported / held |
| lower-yard-engine-crane | 1280 | 0.160340% | 0.424777% | INCREASE — reported / held |
| west-line-brake-tower | 1280 | 0.031450% | 0.055752% | INCREASE — reported / held |
| east-line-brake-tower | 1280 | 0.060129% | 0.117793% | INCREASE — reported / held |
| ford-service-pump | 1280 | 0.141353% | 0.013947% | Within prior |
| upper-ore-cable-house | 390 | 0.270133% | 0.246094% | Within prior |
| lower-yard-engine-crane | 390 | 0.329949% | 0.067170% | Within prior |
| west-line-brake-tower | 390 | 0.062059% | 0.150159% | INCREASE — reported / held |
| east-line-brake-tower | 390 | 0.086319% | 0.238007% | INCREASE — reported / held |
| ford-service-pump | 390 | 0.099459% | 0.055076% | Within prior |

The fuller primary body remains below its earlier phone value (**0.270133% → 0.246094%**), while desktop rises **0.008406% → 0.058934%** versus run 4. The current paired base is **0.062886% → 0.058934% desktop / 0.470018% → 0.246094% phone**; this does not erase the historical desktop increase. Unchanged sibling GLBs, mounts, stations and emission do not guarantee identical sampled pixels: the ford-service-pump body median is **0.189438 → 0.166927 desktop / 0.188604 → 0.171533 phone**, so no universal sibling brightness improvement is claimed. Full values and the matched current-base arm are in [prior-comparison.json](prior-comparison.json) and [visual-metrics.json](visual-metrics.json).

At plain entry, the cable house has **zero visible body pixels** in both arms and widths. This is **offscreen**, not zero HUD obstruction. No cliff, lift, cart, rail or opening-view fix is claimed.

Final four-run fresh-browser pairs: desktop p95 **9.65 → 9.60 ms (−0.52%)**, phone **9.80 → 9.55 ms (−2.55%)**. Each arm has one mode; every comparison is within +15%. Draws stay **76 desktop / 58 phone**; submitted entry triangles stay **106,440 / 104,528** because the edited cable house is offscreen at that station. Its asset budget is checked separately: **2,136 / 3,000**. The earlier run-4 final medians were **8.85 / 9.15 ms**; acceptance uses the fresh alternating before/after pair on the same host. These timings do not claim that an offscreen asset is free when visible. [All 16 runs](performance-paired.json) · [Mode comparison](performance-summary.json).

TypeScript/default/full/E1 builds and **34 render + three named scoped guards pass**. E1 first-town payload **34,311,866 B**, **+1 B** versus Pressure Garden and **+2,036 B** across this leg, below 52,000,000 B; no E1 art assets change. Final plain/station/performance arms report zero console/page errors. Final own/pack browser batch: **62 pass / six skips / six shared registry failures**. All six registry failures reproduce by project, test and expected/received fingerprint on the exact preceding code/store/engine; the candidate is restored to its exact engine hash. [Fingerprint comparison](browser-failure-attribution.json) · [Exact-base replay](base-registry.json). Required loading probes **8/8** and repeat probes **2/2** pass. [Final verification receipts](final-verification.json).

The lane still predates the mirror include fixes already on main (`214a54568`, `82c226185`). The exact canonical main deployment script passes the unchanged assertion against the final Incline source inventory in an isolated tree. The original lane mirror assertion has 14 omitted files on the exact map base and 15 on the candidate; the added file is the task-required source input JSON. [Exact-base mirror attribution](mirror-failure-attribution.json). Lane deployment script and test assertions remain untouched; integration must retain these main fixes. [Bound current-main proof](mirror-prerequisite-proof.json).

The active atlas UV layer is also corrected for **576 retained service-wheel loops**. Source and re-export checks bind the saved Blender file to the shipped GLB and prove all four siblings are unchanged. No new bitmap, atlas, material or gameplay owner is introduced.

The independent reviewer prefers the revised silhouette and clear lower assembly, while retaining brown material similarity, weak deck contact, pale strips and limited upper bearing definition. Phone dialogue still obscures the wheel; route/cliff/transport context remains absent. These are held limitations, not owner acceptance.


## Evidence and identity

[1280 board](board-1280.png) · [390 board](board-390.png) · [desktop terminal comparison](cable-house-comparison-1280.png) · [phone terminal comparison](cable-house-comparison-390.png) · [independent final critique](independent-visual-review.md) · [source re-export proof](source-verification.json) · [authority invariants](invariants.json).

Engine `e300ac0f43d653be8b76c3f65610264ad5c2db023a9dd15a115a275cad6ea6f7` → `72968f9ab06af85b2754a57ba175fb04a106f60db887103b4cf8f494584ea3c2`. Store `d76ee141dcac825aa29cf4e5d4a868fe845fb1c8`, pushed and remotely read back on `astra/fidelity-2`; pin stays drain-owned. **READY-FOR-GATES**, with six exact-base registry failures and the verified current-main mirror prerequisite.
