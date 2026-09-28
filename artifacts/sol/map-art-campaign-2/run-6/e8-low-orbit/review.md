# Low Orbit — run 6 correction

**IMPROVED / HELD.** The sparse claw gains a recessed recovery housing, pressure cells, an open service ring and suspension braces. The black rectangular stage becomes a chamfered base. This is a clearer salvage machine, but the plate's suspended station and debris field are not fully accepted.

| Original defect | Result |
| --- | --- |
| Suspended salvage-station architecture absent | IMPROVED with **2,360→2,972 / 3,000 triangles**, retaining the original crane and claws, one mesh/material and atlas. The dark recess and structural couplings improve machine identity. HELD full station scale and suspension composition by layout/contract owners via Claude; material refinement remains with art. |
| Debris depth absent | HELD by layout/contract/camera owners. All five original transforms, terrain geometry, sampler and collision meaning remain unchanged; no arbitrary floating blocking debris is introduced. |
| Sparse claw on conspicuous black rectangular base | FIXED rectangular silhouette: eight-sided base, **29.29% less plan area**, exact original extrema and height. IMPROVED body separation: at the same 3 m inspection, body pixels below 0.1 display luminance fall **81.17→7.74% desktop / 80.85→7.83% phone**, including the deliberate dark cavity. Entry body median **0.056→0.317 / 0.064→0.316**, whole-body emission **0.45**, below 0.6 cap. |
| Dim ground | IMPROVED clear-ground median **0.076→0.255 desktop / 0.085→0.256 phone**. Desktop RMS **0.00629→0.00254 (−59.55%)**; phone **0.00599→0.00999 (+66.79%)**, so quieter texture is not claimed on phone. Dark-pixel share falls **100→0% / 98.96→0%**. Smooth ground and weak contact remain an art refinement. |
| Portrait hides much of rig | IMPROVED declared inspection from **14 m to 3 m**: phone persistent HUD **54.376→0.998%**, full body bbox inside the viewport. HELD ordinary entry by UI/layout/camera owners: **44.195→47.291%** persistent phone coverage; desktop entry 0%. The larger filled body increases entry overlap. Story-dialog overlap is separate and unchanged. |

[Desktop plain board](board-1280.png) · [Phone plain board](board-390.png) · [Measurements](visual-metrics.json) · [Body separation](body-separation.json) · [Independent review](independent-review.md). The independent reviewer confirms clearer machine structure while retaining low reference fidelity, stretched material detail, competing hoops and phone occlusion as unfinished. No full concept acceptance is claimed.

The saved Blender source reexports all five canonical GLBs byte-identically; four peer bodies and every atlas are unchanged. Terrain **32,768/60,000**, panorama **2,688/4,000**, all landmarks within **3,000**. Collision footprint, bounds, mounts and gameplay truth remain unchanged. [Source proof](source-verification.json) · [Invariants](invariants.json) · [Budgets](asset-budgets.json).

TypeScript/default/full builds, scoped render guards **34/34**, named guards **3/3**, own momentum/physics **16/16**, parity/census **6/6**, shared brightness/collision **16 pass / four opt-in skips**, loading **8/8**, repeat **2/2**, and six dedicated mount/dispose cycles pass. Movement checks **10/10** and story/profile **six pass / two base-attributed failures** were checked before the final 28-triangle cavity/coupling refinement; final geometry was then covered by the own, shared, census and mount checks. [Failure attribution](failure-attribution.md).

Four timing runs per arm/viewport: p95 **9.80→9.50 ms desktop / 9.90→10.10 ms phone**, single comparable modes, within 15%. Draw calls **77/55 unchanged**, triangles **+612**. [Samples](performance-summary.json). All four ordinary boots record zero console/page errors and no debug test hook.

Engine `37a425e8df7634b36005ac5712ccee589eba59ab7aac41f7033a2949d203c146` → `d7cad8f8bd1ebb800b36fff3531b8726760b5430fcb516cd39d32a71bb420bcf`; pin untouched. Store `2a1c3e11ec470fb3761cb9e462d39b025b61f24f` on `astra/corrections-4`.
