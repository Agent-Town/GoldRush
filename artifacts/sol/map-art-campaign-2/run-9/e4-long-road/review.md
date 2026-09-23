# Long Road — run 9 fidelity

| Earlier clause, quoted verbatim | Run 9 answer |
| --- | --- |
| “Existing stop architecture and wagon paint still fall short of the plate; they remain campaign art gaps.” | IMPROVED: west stop rebuilt as a trestle-supported water tank and open teal canopy; static convoy body rebuilt with open freight bed, spoked wheels, exposed axles and banded boiler. Exact source envelopes retained. Stop 2248 → 1268 / 3000 triangles; convoy 2504 → 2140 / 3000. Three other pack bodies and shared Motor actors remain unchanged. Further material weathering and the two other stops remain HELD for art. |
| “A modest tonal boundary remains; full apron art continuity is not accepted.” | IMPROVED locally: the same fixed boundary strip falls from 0.020655 to 0.002105 mean absolute luminance difference (−89.81%). Earlier run-5 apron RMS 0.011795 is now 0.012285 (+4.15%); median 0.284254 → 0.304129. This reduces the light/dark join; richer ground detail and full illustrated apron continuity remain HELD. The panorama's existing near-ground pigment is balanced against its different lighting with a 1.12 linear diffuse multiplier, fading by the existing interior factor. Terrain, atlas, geometry and mask truth remain unchanged. Distant sky receives no multiplier. |

Camera/layout holds remain: the road is transverse to the fixed view, the first stop is 46 m from the starting actor, and the full route cannot fit the entry. Entry HUD and story placement remain with camera/UI via Claude.


The exact run-5 ground boxes retain RMS **0.008785822 / 0.025618193** desktop/phone; fresh paired pixels are identical, versus earlier **0.008785822 / 0.025618064**. Whole-body emission stays **0.45**.

Declared 5 m HUD, previous run 5 → now (desktop / phone): convoy **0 → 0% / 0.011033 → 0.004065%**; west stop **0.084129 → 0.005698% / 0.015612 → 0.017112%**. The phone stop rises **0.001500 percentage points**, explicitly reported, with unchanged exact body bounds and unchanged station/camera/UI. Fresh paired phone stop is 0.097418 → 0.017112%; silhouette proportions and tiny mask-edge sampling vary, so no newly certified clearance is claimed. At phone entry the wagon still overlaps actor/UI: fresh persistent coverage **3.615 → 7.493%**, even though run 5 was 12.369%. Entry HUD fractions have different covered body geometry; this is retained as a limitation, not claimed solved.

Wagon body median at inspection rises **0.103154 → 0.134860** at both widths; the silhouette and material proportions also change. Stop median **0.140635 → 0.137830 / 0.143136 → 0.140696**, so no stop brightness increase. The new stop occupies more of its same box; the wagon less. These are constructed forms, not a luminance-only correction.

[Plain desktop board](board-1280.png) · [plain phone board](board-390.png) · [station masks and bounds](visual-metrics.json) · [earlier-number comparison](prior-comparison.json) · [apron measurement](apron-metrics.json) · [independent review](independent-visual-review.md).

The independent reviewer prefers both new bodies but retains dark machinery, streaked wood, blocky canopy/platform, weak wheel visibility and contact. Full entry vista and the other stop bodies remain unaccepted. No contract, collision, route, height/mask truth, mount, station, actor or HUD changes. Original atlas bytes and three sibling GLBs/source meshes remain exact. [Invariants](invariants.json) · [budgets](asset-budgets.json) · [source re-export](source-verification.json) · [frozen-input recipe](recipe-verification.json).


TypeScript/default/full builds, **34/34** scoped render guards and **3/3** named guards pass. Loading **8/8** and repeated-instance **2/2** probes pass. Full map-ID-matching and shared browser suites: **57 passed / 17 optional skips / 10 failures**; all 10 also fail on the exact baseline: eight exact fingerprints, two Claim-horizon predicates with small pixel-value differences. [Attribution](failure-attribution.md). No assertion changed. Plain/station/performance captures have zero console/page errors.

Four fresh browser runs per arm/viewport, one comparable mode: p95 median **9.45 → 9.60 ms desktop (+1.59%) / 9.90 → 9.90 ms phone (0%)**, inside 15%. Draws remain **61 / 51**; rendered entry triangles **100836 → 100472 / 100306 → 99942**. These entry timings include the convoy but do not imply the west stop enters that frustum. [Timing samples](performance-summary.json).

E1 payload measurement is not applicable to this E4 map. No E1 source or runtime assets changed; engine pin remains drain-owned.

Engine `7811cb664727d4e4e9da87f09ae49a92f429af42d000a50d495f36aa5e250443` → `8a51dec200e748ad42ea24d3ffd8f53525dfc7f34edba41b260107179b9f809c`. Store `e33b81277c9058ae8e8a18c595c975703d4887a7`, pushed/read back on `astra/fidelity-2`. READY-FOR-GATES with the explicitly retained holds and base-red cases.
