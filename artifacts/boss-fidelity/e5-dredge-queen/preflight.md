# E5 Dredge Queen — inspection before changes

E4 has passed focused gates and its broad regression is running. This is read-only E5 preparation; no E5 asset or production source has changed.

The adopted model is `dredge-queen-detail-opus5.glb`, pinned to 33,124 triangles in DredgeQueenBossSystem, with four component meshes and one 2048-square atlas. Existing authored and fresh audit renders show a solid foundation: curved hull and grab, lattice derrick and detailed paddle wheels. The source plate instead has a substantial domed multi-level wheelhouse, a broad armored hold and a ragged cloth sail. Current model's low dome, plain hold and rigid rectangular sail are the largest shape discrepancies.

The prior author's own report identifies the same wheelhouse/hold gaps and a narrower-than-target beam (4.52 vs prior 4.98). Do not spend another pass adding indiscriminate small detail. Focus on silhouette and the missing architecture first, preserve four node/morph bindings and the final damaged hulk/harbor contract.

Runtime aliases the albedo into emission with intact intensity 2 and damaged intensity 3. That needs actual game-camera calibration, not blind removal. Current source atlas is procedurally generated; any replacement still image must come from native image_gen. The shared detail_opus5_kit is also an E4 dependency and must remain unchanged during the E4 source freeze.

Next: trace the existing E5 update/save/target flow before proposing source changes, inspect intact/damage source plates at full scale and prepare an isolated candidate builder under this evidence directory. No dev server, production edits or heavy rendering while the E4 regression owns the runtime.
