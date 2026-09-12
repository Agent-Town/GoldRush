# E5 Dredge Queen fidelity pass — verified with regression exceptions

The production Dredge Queen now has a rounded hull, domed two-level wheelhouse, paired covered wheels, hanging plate grab, vaulted opening hold and torn cloth. Matched neutral views show a closer interpretation of the intact/damaged references. Actual game views retain compact proportions, small foreshortened wheels, weak dark/teal separation and limited wreck distinction. This is partial fidelity; it is not a 1:1 replica or final release approval.

The model preserves four original component/morph bindings at 44,920 triangles and one embedded 1024 atlas. Raw GLB SHA-256 is `f66ba8b7e03fd8997d4c94c18abc6630c9848c0a6d857c38c5ef0f6a594d7c42`; optimized delivery is 1,480,976 bytes, SHA-256 `87f68ec561156ba935fbf044c658c29c18fe5a475d9cd66a76adf7799227ea67`. Native image generation supplies materials; no paid generation or new dependency. Shared helper source is unchanged. Export/re-export and eight flag/lid clearance checks pass.

Runtime uses declared target offsets during approach and one interpolated hull center; Act 2 hold retains +1.8 X and its death leaves the wreck at the hull anchor. Shared cached convex hulls position the health bar above the active geometry. Labels fit their canvases and atlas emission is reduced to preserve color. HP, timers, damage resolution, loot amounts and story contracts are retained within the focused evidence below; broad results retain explicit exceptions.

## Confirmed regression and correction

F-E5-01: `DredgeQueenBossSystem.modelBounds` initially called presentation before checking model readiness. During reset, `EnemyPool.recycle` synchronously refreshes the shared health bar while some components are still alive. That bounds query changed loader state from off to loading inside reset and admitted a new hidden model after reset. The one-line readiness/visibility guard prevents the reentry. `reset-before/report.json` is a failing positive control with exact state transitions; `reset-after/report.json` passes both delayed and already-loaded resets. Independent static review of the guard found no concrete defect. This failure is retained, not folded into a green summary.

## Evidence

- Production Blender verifier passes finite geometry, identity nodes, original damage bindings, triangle/map limits and byte-identical saved-Blend re-export.
- `npm run build` passes on the guarded source. Independent full runtime and subsequent reset-guard source reviews found no concrete issue, with static-only scope.
- 32 unchanged desktop/mobile E5 boss, migration, story and census tests pass immediately before the guard; eight historical output files restored and all source hashes unchanged. This was not a run on the later one-line guard.
- Guarded nine-case actual loader suite passes lite zero-request behavior, invalid and wrong-contract fallback, late-load damage, reset cancellation and loaded reset disposal. Four geometries, four cloned materials and one shared texture are observed; repeated alias disposal events are not independent resources.
- Guarded actual Game movement/interpolation passes approach, automatic reposition, missing-paddle and sole-survivor cases at alpha 0/0.5/1. Sole-survivor reposition is explicitly invoked because dredging stops without the claw.
- Raw and optimized GLBs pass 20 actual desktop/mobile mesh/morph/target states including persistent-wreck reload. Optimized bytes go through the actual development loader; production JavaScript bundle playthrough is not claimed.
- The full E5 encounter is not independently serialized in RunSuspend. In-memory HP restoration and persistent-wreck reload are narrower proofs and do not establish fresh-page full encounter resume equivalence.

[Visual gallery](../artifacts/boss-fidelity/e5-dredge-queen/index.html). [Detailed runtime critique](../artifacts/boss-fidelity/e5-dredge-queen/runtime-visual-review.md). Current source hashes: `candidate-validation/adoption-manifest.json`; initial receipt and subsequent source banks: `production-adoption/`. Loader/movement: `runtime-lifecycle-guarded/`, `runtime-motion-guarded/`. Focused tests: `focused-gates/unchanged-e5/`.

## Broad verification boundary

The full unchanged suite completed with 2,806 passed, 340 failed and 202 skipped; all eight Dredge Queen encounter entries passed on the guarded source. Quiet confirmations and exact two-source controls are complete and restored. Latest actual E5 outcomes across separate runs are 2,838 passed, 312 failed and 198 skipped. This is not a green full run.

[The regression handoff](../artifacts/boss-fidelity/e5-dredge-queen/full-regression/REPORT.md) records the E6 scratch-file reload interference, 57 quiet confirmations, 13 source controls, five restored-E5 rechecks and the remaining exceptions. Three original boot tests retain source-correlated failures. Their traces and an unchanged-source supplemental diagnostic establish unfinished asset loading and exact early/settled terrain values; settled terrain snapshots match and fully loaded navigation has zero texture errors. The original failures remain recorded. No general baseline exoneration, full encounter resume equivalence or release approval is claimed. The scoped E5 fidelity handoff is closed with these limits, ready for orchestrator gates.
