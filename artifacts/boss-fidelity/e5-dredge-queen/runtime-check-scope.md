# E5 runtime evidence to retain

Source inspection while E4's full regression owns the live runtime. No E5 browser test has been run against the isolated candidate.

The existing `e2e/e5-boss-dredge-queen.spec.ts` covers arrival, two-paddle Act 2 gating, loot count, escort departure, ceremony and next-run wreck persistence, profile isolation, interrupted claw cycles and the defensive swat arc. It also waits for a real ready/mounted GLB and published damaged-component states. Reuse it unchanged after candidate integration. Its screenshot destinations are `reviews/shots-e5-boss-dredge-queen` and `reviews/shots-wire-dq-3d`; bank and restore existing evidence around the run.

Those published states do not inspect actual vertex displacement, material appearance or screen-space target fit. Supplement them with the actual loaded four meshes, morph weights and rendered frames for each individual component, Act 3 and the next-run wreck. Check the real game camera on desktop and mobile, including approach/reposition and a sole surviving component. The candidate's neutral asset renders alone cannot establish these properties.

The existing performance comparison uses a persistent wreck as its “non-boss” case (`e2e/e5-boss-dredge-queen.spec.ts:237`). The wreck also mounts the model. It measures active-fight overhead versus a wreck, not the cost of adding the new mesh to an otherwise empty tile; report that scope accurately.

`e2e/tp01-w6-migration.spec.ts` covers legacy wreck conversion and substrate/profile ownership. `e2e/ss-06-e5-beats.spec.ts` covers Deepwater story presentation and epoch isolation. `e2e/er01-e5-census.spec.ts` exercises declared consumers and browser/headless admission. The real headless implementation is `src/sim/HeadlessContractSim.ts`; it constructs the same DredgeQueenBossSystem, while its model loader exits without a document. Headless admission does not render the GLB.

The runtime asset admission at `src/systems/DredgeQueenBossSystem.ts:568` currently requires four named meshes with their exact morph bindings, one material and the exact 33,124-triangle count. Update the triangle pin only from the verified candidate export. Existing material clones share the atlas as base/emissive map; intact emission is 2 and damaged emission 3 with component colour. Calibrate against actual game frames before changing these values. Preserve existing gameplay, persistence and component offsets unless a measured visual defect requires a focused presentation correction.
