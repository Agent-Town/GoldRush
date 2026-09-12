# Final boss fidelity programme

Owner authorization, 2026-09-08: "Go one by one - each epoch (1 to 10) has a final boss ... focus first on the bosses ... start with the Baron of epoch one and work through them."

Completed scoped programme: improve all ten final boss presentations in epoch order, preserving their gameplay and story contracts. Work stays on `sol/boss-art-fidelity-review`; no commits, queue changes, STATUS edits or deployments are authorized by this programme. The prior [comparison review](../../reviews/sol-findings-boss-art-fidelity.md) and [gallery](../../artifacts/boss-art-fidelity-2026-09-08/index.html) establish the starting evidence.

| Epoch | Final boss | State | Required focus |
|---|---|---|---|
| 1 | Baron | **Verified E1 pass** | Approved illustrated body stays. Improve 3D prop materials and crafted finish, launcher attachment, telegraph and rocket origin; prove in-game appearance. |
| 2 | Armored Railcar | **Verified E2 pass** | Armored cab, running gear and underbody detail; retain rail fit and component damage. |
| 3 | Dynamo Crawler | **Fidelity verified; regression exceptions** | Tall coils, articulated insulators, drive machinery; retain three damage components. |
| 4 | Land Yacht | **Fidelity verified; regression exceptions** | Integrated wheeled ship, open grapple, coherent targets, terrain grounding and encounter resume. |
| 5 | Dredge Queen | **Fidelity verified; regression exceptions** | Wheelhouse, armored hold, hull width, cloth sail and selective material treatment. |
| 6 | Homemaker-9000 | **V12 adopted; handoff with regression exceptions** | Rounded body, flared apron, deep lens, curved vacuum; retain final chair state. |
| 7 | Echo | **Scoped fidelity verified; limitations recorded** | Mirrored settlement forms and signal identity; this is an encounter presentation, not a mechanical monster. |
| 8 | Salvage King's Claw | **Scoped fidelity verified; limitations recorded** | Suspended crescent claws, hanging machinery and crown hierarchy; retain airborne and civic landing states. |
| 9 | Old Digger | **Scoped fidelity verified; limitations recorded** | Deep bucket wheels, industrial center and substantial trusses; retain intact gentle reprogramming. |
| 10 | Quiet | **Scoped fidelity verified; limitations recorded** | Environmental absence and loss-of-meaning presentation consistent with its art; preserve encounter/site mechanics. |

Only the current epoch is implemented at a time. Subagents may examine or verify separate parts of that boss. A completed epoch requires an actual visible improvement against its reference, source/asset validation, unchanged gameplay invariants, desktop and 390px mobile evidence, relevant existing tests, and a durable review naming limitations. A loader flag or a showroom render alone is insufficient.

Each epoch's evidence lives under `artifacts/boss-fidelity/e<N>-<boss>/`, with a report in `reviews/sol-boss-fidelity-e<N>-<boss>.md`. Update this table only after inspecting that evidence. Do not call the ten-epoch goal complete until all rows have verified outcomes.

## Historical handoff: E6 Homemaker — scoped verification complete with exceptions

E1 and E2 completed verified fidelity passes. E3's asset, focused desktop/mobile presentation, component coverage, movement/resume checks, final build and independent review pass. The full collection and exact 345-test outage recovery are terminal, with all historical outputs restored and source hashes unchanged. Latest reconciled coverage is 2,819 passed / 331 failed / 198 skipped; this is not a green full run. Crawler absolute texture pins retain the identified hero-atlas startup-state discrepancy, and Baron direction has mixed outcomes with no confirmed root cause. Other residual failures are preserved, not broadly declared baseline defects. See [E3 review](../../reviews/sol-boss-fidelity-e3-crawler.md) and [full regression report](../../artifacts/boss-fidelity/e3-crawler/full-regression/REPORT.md).

E4 now uses its GLB in actual FULL encounters and salvage, with coherent rotating targets, wheel grounding, surviving-component anchoring and complete encounter resume. Production source/re-export, final build, 22 unchanged E4 tests, all desktop death orders, mobile resume, real loader/fallback/disposal and 18 optimized visual states pass. The 462 KB optimized asset is verified through the actual loader. Roof atlas seams are corrected; damage and materials remain visibly simpler than the concept, and mobile whole-ship framing uses existing maximum zoom-out. [E4 review](../../reviews/sol-boss-fidelity-e4-landyacht.md) records exact boundaries.

E4's broad run and focused confirmations are terminal, with historical files and source hashes restored. Latest reconciled E4 outcomes are 2,834 passed / 316 failed / 198 skipped, not a green full run. The [regression report](../../artifacts/boss-fidelity/e4-landyacht/full-regression/REPORT.md) retains the unresolved river-placement source correlation and all other exceptions. E4's fidelity handoff is closed with those limits.

E5 V10 is adopted with export/build, focused loader/movement/visual checks and a corrected bounds-query reset regression. Its broad run, 57 quiet confirmations, 13 two-source controls and five restored-source rechecks are complete. Latest actual E5 outcomes are 2,838 passed / 312 failed / 198 skipped. Three original boot tests still fail; exact early/settled height values and a supplemental settled-loading diagnostic expose the readiness boundary without relabeling those tests as passing. The [E5 handoff](../../artifacts/boss-fidelity/e5-dredge-queen/full-regression/REPORT.md) records all exceptions and the earlier scratch-file reload interference. The source freeze is released with those limits.

E6 V12 is verified in an isolated full bundle, including unchanged encounter tests and actual bundled desktop/mobile frames, plus damage, geometry, loader, reset, persistence and movement evidence. Its [candidate state](../../artifacts/boss-fidelity/e6-homemaker/candidate-state.md) and prepared adoption checklist retain exact hashes and known fidelity limits. Main production adoption, export/build, two unchanged encounter tests and targeted runtime checks now pass. Broad reconciliation completed: latest actual-source results are 2,839 expected, 311 unexpected and 198 skipped. Two differential failures remain unresolved (E9 caravan planting desktop and Dry Gulch diagnostics mobile); the suite is not green. All 8,495 frozen source/asset hashes were restored and matched. See the E6 review and final-reconciliation.json for the retained evidence. E7 has only a read-only reference/source preflight; E8–E10 implementation remains pending. No gate ports, commits, STATUS edits or existing e2e source changes. Vite 5246 remains the scratch server; concurrent work must stay outside an active test server's watched tree.

## E7 handoff and E8 continuation

[E7 review](../../reviews/sol-boss-fidelity-e7-echo.md) closes the scoped Echo pass: actual mirrored building forms, preserved formation spacing, clearer signal contours and kept jar. Final combined checks were 15/16; the single unchanged desktop playbook case passed in isolation. Production, lifecycle, source review correction and visual evidence are retained with fidelity and broad regression limits. E8 Salvage King's Claw is next.

## E8 handoff and E9 continuation

[E8 review](../../reviews/sol-boss-fidelity-e8-salvage-claw.md) closes the scoped Claw pass. V10 is adopted with byte-identical re-export, green build, four unchanged encounter tests, optimized desktop/mobile production and persisted-yard views, sampled grounding and resource lifecycle checks. Simplified architecture, mobile HUD occlusion and earlier broad regression exceptions remain explicit. E9 Old Digger is current; source/reference preflight identified bucket depth, central industrial mass, conveyor trusses and metallic material identity as the next corrections. Its intact gentle reprogramming contract remains binding.

## E9 handoff and E10 continuation

[E9 review](../../reviews/sol-boss-fidelity-e9-old-digger.md) closes the scoped Old Digger pass. V6 restores industrial mass, bucket depth, material identity and gentle access, fixes major terrain burial, and keeps the teal chamber behind its cage. Final rebuild/re-export, eight unchanged tests, optimized production/reload, twelve-position contact and resource lifecycle checks pass. Simplified detail, rigid terrain contact and existing broad regression limits remain explicit. E10 Quiet is current: its reference is a spreading un-inked heart-shaped absence, not a mechanical creature.

## Final scoped handoff — E1 through E10

All ten rows now have implemented improvements, runtime evidence and individual reviews. [E10 Quiet](../../reviews/sol-boss-fidelity-e10-quiet.md) closes the sequence with a feathered heart-shaped absence and layered rings. Final build, eight production states and three lifecycle cases pass; six unchanged encounter checks pass and two finale checks fail identically with the original E10 source. The programme is a completed fidelity pass, not 1:1 replication or release approval. Existing broad regression exceptions, mobile occlusion and scene-level fidelity gaps remain recorded in each review. No commits or deployments were made.

## Publication authorization — 2026-09-09

Robin explicitly requested committing and pushing this work after the scoped handoff. Publish on `sol/boss-art-fidelity-review`; this does not authorize merging to main or deployment. Earlier no-commit statements record the implementation phase. [Published evidence boundary](../../artifacts/boss-fidelity/PUBLISHED-EVIDENCE.md) explains which large local investigation files are omitted from Git.
