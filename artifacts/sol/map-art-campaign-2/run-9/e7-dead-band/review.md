# Dead Band — layered silent frames, run 9

2026-09-23. **IMPROVED / HELD.** The two formerly flat frames now have layered
lattice pylons, stone sockets, riveted collars, an open truss header, inactive
aerial fittings and an empty double bezel. They remain visibly stylized; this
does not accept the complete plate architecture or landscape composition.

| Earlier clause, verbatim | Run-9 answer against its own earlier evidence |
| --- | --- |
| “These simple braced frames do not yet equal the plate's layered antenna architecture.” | **IMPROVED** geometry: warning frame **156→1,464/3,000** triangles; north gate **180→1,548/3,000**. At the unchanged 3 m stations, warning-frame median luminance versus run 6 is **0.10425→0.18928 desktop / 0.10956→0.19237 phone**; north gate **0.13721→0.16715 / 0.12962→0.16715**. Whole-body emission stays **0.45**. **HELD** full metal/weathering/architectural fidelity with the art owner; the exact thin source envelopes and shared atlas remain evident. |
| “HELD fuller yard composition by contract/collision and art/layout owners: the unselected solid post/caches cannot replace or add blockers within this task.” | **IMPROVED art portion** through the two existing frames only. Run 7 already mounted the post/caches: this run retains **10 bodies**, all three solid variants and every collision byte. Their activation is not credited here. **HELD** fuller yard/terrace arrangement by contract/layout owners via Claude. The north gate's feet remain buried at its existing mount; no mount or terrain correction is claimed. |

No independent review exists for this map in runs 3–6. The latest art review is
[run 6](../../run-6/e7-dead-band/review.md); later solidity, entry and phone-HUD
work is retained, with no new credit taken for it.

[Desktop plain board](board-1280.png) · [Phone plain board](board-390.png) ·
[Desktop station comparison](inspection-board-1280.png) ·
[Phone station comparison](inspection-board-390.png).
Plain boots use ordinary HUD, no debug/test hook, seed `map-art-campaign-2`,
approximately ten seconds, DPR1, 1280×800 and 390×844. All four plain captures
and all paired diagnostic station captures have **zero console/page errors**.
Story-card timing differs between plain boots; station geometry masks provide
the controlled body comparison.

The warning frame's ordinary-entry body pixels versus run 6 are
**5,938→7,831 desktop / 6,786→8,653 phone**. Against the fresh run-9 baseline,
the same figures are **6,523→7,831 / 7,098→8,653**. Declared-station HUD coverage
versus run 6 remains below its own previous figure for both changed bodies:

| Unmoved 3 m station | Desktop persistent HUD | Phone persistent HUD |
| --- | --- | --- |
| Warning frame | 0.014874%→0% | 0.026264%→0.010643% |
| North gate | 0.063198%→0.050792% | 3.512592%→0.198519% |

The north gate's phone bounding box still extends about **7.1 px** past each
side of the viewport. Its current phone mask coverage rises from the fresh
baseline **0.108656%→0.198519%**, although it remains below the run-6 limit.
Most of the reduction from run 6 belongs to the intervening phone-HUD change,
not this art pass. The unchanged radio's desktop 2 m mask reads
**0.028902% run 6→0.033891% now** (**+0.004989 percentage points**); its fresh
baseline is **0.045190%**. This tiny mask variation is disclosed rather than
treated as a new HUD gain. No radio mesh, station, UI or camera changed.

Ordinary entry remains separate: warning-frame persistent coverage is
**0.012770% desktop / 0.080897% phone**; radio coverage is
**43.236566% / 9.591988%**. Radio phone coverage was **4.015009%** in run 6 and
is **9.591988%** in both fresh arms, so that pre-existing HUD tradeoff remains
with the UI owner. Temporary story cards still obscure the lower scene.

Ground preservation is exact against both run 6 and the fresh baseline:
fixed-region RMS **0.025445615 desktop / 0.031491972 phone**, median
**0.206811765 / 0.188887059**, dark share below 0.1 **0% / 0%**. The run-6
ground gains are retained, not re-credited. [Complete paired metrics](visual-metrics.json)
and [each station against its earlier figure](prior-comparison.json).

Both changed models retain one mesh/material/primitive, original atlas pixels
and exact source bounds. All sibling meshes and exports, mirrored mounts,
inspection stations, terrain/panorama, heights, masks, spawns, routes,
collisions, gameplay contracts, source code, tests and engine pin are unchanged.
Terrain **32,768/60,000**, panorama **3,084/4,000**, every landmark **≤3,000**.
[Budget census](asset-budgets.json) · [Boundary proof](invariants.json) ·
[Source re-export](source-verification.json) · [Frozen recipe reproduction](recipe-verification.json).
Both output GLBs reproduce byte-for-byte from the saved source and recipe.
Raw GLB bytes increase **183,916 B** total; no new texture or E1 dependency is
introduced. This is not a measured network-transfer increase, and the E1-only
payload rule does not apply to this E7 leg.

TypeScript, default build and full build pass. Scoped render guards **34/34**
and named guards **3/3** pass. Generic loading **8/8** and repeat **2/2** pass;
the map-specific proof has **six mount/dispose cycles**, **10 bodies**,
zero skipped loads, zero errors and zero retained scene children.
[Commands and exits](build-gates.json) · [Scoped guards](node-gates.json) ·
[Loading/repeat](probes-gates.json) · [Map cycles](mount-repeat-proof.json).
The first map-cycle invocation used the pack slug instead of the declared tile;
[the instrument correction](probe-corrections.md) preserves the failed attempt.

The complete required browser batch finished **103 passed / 5 skipped / 12
failed**. Exact-base replay reproduces **11 failures**, **9 exact fingerprints**
and two variable Claim-horizon samples at the same assertion. The remaining
mobile Charter Press case passes on the exact base and on the restored
candidate's isolated **2/2 desktop/phone recheck**. No persistent unattributed
failure remains in this measured set; full browser acceptance stays **HELD**
for the existing owners. [Exact attribution, caveats and resolution](failure-attribution.md).
No test assertion was changed. The full node battery and engine pin stay with
the drain.

Four fresh runs per arm/viewport at **each** location, 180 retained rAF intervals
per boot, normal HUD and frozen full-tier diagnostic, one comparable timing mode:

| View | Desktop median p95 | Phone median p95 | Draw calls desktop / phone |
| --- | --- | --- | --- |
| Entry | **8.90→8.90 ms (0%)** | **9.80→9.45 ms (−3.57%)** | **78→78 / 56→56** |
| North gate (0,57) | **9.00→9.65 ms (+7.22%)** | **9.30→9.45 ms (+1.61%)** | **57→57 / 45→45** |

All four comparisons pass the **15%** limits. Entry triangles are
**101,548→102,856 desktop / 99,466→100,774 phone**; north-gate triangles are
**99,876→101,244 / 97,948→99,316**. All **32** timing runs have zero console/page
errors. [Entry samples/modes](performance-summary.json) ·
[North-gate samples/modes](north-performance/performance-summary.json).

Engine **`e7c87a88d08517d84983d408a876cfa994068807fa51b3c54ee96bbe24710e32` → `6655ba7569775a529216d58cf8f288556ca9fc19cfd7bbeae41dbeb9a99adf33`**;
pin unchanged. Store **`892b7f6f993cfb79dcee9c96d82c32efe32ea20f`**, pushed and read back on
`astra/fidelity-2`; [receipt](store-commit.json). The game commit carrying this
review contains only the E7 evidence, status rows and appended report section.
Test-generated evidence outside this slice was restored or parked under raw,
with all generated bytes retained; [inventory](evidence-churn.json).

**READY-FOR-GATES. Remaining E7 map list: none.** Relay Rush is skipped under
the no-art-owned-hold rule; [selection evidence](../e7-scope-selection.json).
E8/E9 remain separate owner-queued legs. No main branch, engine pin, gameplay
contract, height/mask truth, collision footprint or other map asset was edited.
