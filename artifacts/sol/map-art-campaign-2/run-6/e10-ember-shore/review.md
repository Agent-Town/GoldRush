# Ember Shore — run 6 correction, 2026-09-22

**IMPROVED / HELD; full concept remains unaccepted.** The dark floor gains a continuous world-space basalt treatment, and the former shelf is rebuilt as a cooled recovery machine with articulated arms. The fixed envelope still prevents the plate’s dominant buried titan composition.

| Original defect | Result |
| --- | --- |
| Thin material joins and rectangular patches | IMPROVED the same world-space pigment and grain shader is applied to the sculpt and its existing 160 m continuation. The sampled 128 m boundary has zero height gap. HELD the visible southeast rectangular tone join (reviewed around x=715/y=595), residual smooth rectangular landforms and distant panorama patchwork by the terrain/panorama art owner via Claude; no claim of a new sculpt. |
| Dark soft shelves | IMPROVED clear-ground luminance and fine surface detail, measured below. HELD fractured shelf geometry and stratification by the terrain-art owner within the existing height contract. The final low-contrast stone cells remain less geological than the plate. |
| Weak fissure read | IMPROVED existing red heat pixels remain visible against the lifted rock ground. HELD branching fissures, rectangular termini and smooth channel banks by terrain art and the contract owner; the published terrain heights and gameplay bands remain unchanged. No new hot route or hazard is implied. |
| Missing titan composition | IMPROVED a cylindrical hull, ringed core, jointed arms and fingers replace the inherited small shelf: 908→2,356 triangles, below 3,000, same exact bounds/footprint/mount. The octagonal base area is 29.29% smaller. HELD the giant buried head/torso and distant composition by contract/composition owners via Claude. The ordinary entry still faces the altar, not the titan. |
| HUD and story obscure boot | IMPROVED declared 5 m review stations fit both viewports. HELD normal dialogue/world-info overlap and entry composition by UI/camera owners. The persistent-HUD mask excludes transient story only in labelled diagnostics; the plain boards retain the actual story cards. |

[Desktop board](board-1280.png) · [Phone board](board-390.png) · [Independent critique](independent-review.md). The plain entry and labelled exploration views are distinct evidence; inspection of the titan does not count as entry visibility.

All terrain, panorama, atlas, four peer landmark, collision and gameplay bytes remain unchanged. The rebuilt saved Blender source re-exports all five GLBs byte-identically. Source provenance and all station mirrors are updated together. No raster generation/editing occurred. Whole-body emission remains capped at 0.45. The existing opaque altar panes, teal marker, weak local light pools and contact shading remain further presentation work, not claimed fixed here.

The first diagonal-strata ground and larger tile candidates were rejected. A first titan material assignment still looked wood-like; the final recipe uses the existing soot/rock patch for the footing and isotropic per-part UVs to avoid wrap discontinuities. Prior candidate renders remain under the unstaged raw directory. Entry measurements use the actual plain-boot hero position (3, -12.35), after depenetration, rather than the nominal stake center (3, -10).

Final entry altar body medians are **0.213→0.342 desktop / 0.212→0.342 phone**. Actual entry persistent HUD coverage is **0.100→0.069% / 0.751→0.791%**. The newly declared **5 m** altar station measures **0.000% / 0.199%**; all five station bboxes fit and coverage is at most **0.199%**. Titan body medians at 5 m are **0.123→0.231 / 0.124→0.231**, and its phone coverage is **0.680→0.176%**. These small mask deltas include antialiased-edge/frame variation; the station establishes framing, not a runtime camera change.

Clear-ground medians **0.0532→0.3368 / 0.0610→0.3211**; pixels below 0.1 fall from **100%→0%** in both fixed regions. RMS **0.00343→0.01990 (+480.73%) / 0.00615→0.01328 (+115.90%)**. This deliberately adds visible stone variation to previously near-black regions; it is not a claimed RMS reduction. Existing global sepia still tints the basalt olive. [All measurements](visual-metrics.json).

TypeScript/default/full builds and scoped render **34/34** / named **3/3** guards pass. Own preserve/squall **12/12**, story **14/14**, map census **2/2**, full registry simulation parity **2/2**, shared brightness/collision **16 pass / four opt-in skips**, loading **8/8**, repeat **2/2**, six map mount/dispose cycles and all five saved-source exports pass. The selected registry mount test has **two exact-base failures**, expected 32,768 versus actual 51,200 on The Claim before Ember is visited; no assertions changed. The final UV-only correction preserves geometry and gameplay, and final builds/guards/source/captures recheck its bytes. [Attribution](failure-attribution.md) · [Invariants](invariants.json) · [Continuity proof](continuity-proof.json) · [Budgets](asset-budgets.json).

Engine `2a898e9e9e87ddd72c9dea598df97363c9e179592ef33e69a54871da21c1efd3` → `0df7afdfb61520a896c158f0208e401731a733f465ab77a8fc4232bc495c65ba`; pin untouched.

Final independent reassessment confirms reduced wood-like grain and terrain repetition, no obvious new attachment/clipping regression, and persistent weak hand contact/UI overlaps. The southeast tone join remains visibly unresolved; the zero-height-gap proof establishes geometry continuity only.

Four quiet-host runs per arm/viewport have p95 medians **10.10→10.00 ms / 10.00→10.10 ms desktop/phone**, draws **72→72 / 54→54**. Both timing distributions and draw counts stay within 15%. [Full distributions](performance-summary.json).

Store `caf34490756564bd8dfb1693070e479147590c58` pushed on `astra/corrections-4`. READY-FOR-GATES for this bounded correction.
