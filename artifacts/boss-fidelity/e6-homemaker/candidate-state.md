> Main adoption update: V12 is now adopted. Actual main build/export and all targeted runtime checks passed; broad regression is next. See `production-adoption/` and `reviews/sol-boss-fidelity-e6-homemaker.md`. Historical isolation/freeze notes below describe their recorded stage.

# Homemaker V12: isolated candidate, not adopted

Production E6 is unchanged. E5's full regression is still running; [freeze receipt](e5-freeze-check.json) confirms 8,493 production files unchanged. This is preparation for the next sequential boss, not a completed E6 handoff.

## Current asset and provenance

Raw SHA `d81454a11c49f963251563812a70883e84822092fd6f6482ef8d994ddd4d42d5`, 2,945,404 bytes, **11,960 triangles**. Standalone optimized SHA `40f92bc5c6128e3cbd7b7f144b59d96435238aeeb55fd93e9af596a7c10f61eb`, 497,136 bytes. Immutable bytes and builder are in [iterations/12](iterations/12/). One embedded 1024 atlas, one original painted material, VAC/RACK/CORE nodes and their three original damage morph names remain intact. Export/re-export is byte-identical. The verifier's inherited `baseSha` is historical metadata, not current checkout HEAD.

The reference's rounded silver body, flared teal skirt/apron, ribbed vacuum, arched toast rack, radial amber eye and armored feet replace the original box-like forms. Floor-height corrections apply to individual feet, dropped rack and debris. Rivets mount to supported rails. The shutdown shutter covers the iris. The existing chair extends behind the rounded body; the mesh test reproduces 88 V11 body/back intersections and zero in V12.

Atlas came only from native image generation: [initial provenance](candidate-material/provenance.json), [amber edit](candidate-material/amber-edit-provenance.json), [silver edit](candidate-material/silver-edit-provenance.json). Current input is `candidate-material/atlas-silver-v5.png`; original native outputs are retained. No paid generation or outside-cell pixel-identity claim.

The intended production atlas filename was also rebuilt in an isolated project. Its raw SHA is `ff2fe72dcc72bb9415de5afefacdf2794f0b81d02a16a051b3527ae53dbf5400` and its actual full-build optimized SHA is `85379230e24492721ae22dc3fb738541210db56b1013cd63e5b26a2865528567` (497,148 bytes). The only GLB difference from the banked candidate is `/images/0/name`; geometry, morph, UV and texture BIN bytes are identical. [Raw equivalence](bundle-preview-v12/rebuild-receipt.json), [optimized equivalence](bundle-preview-v12/optimized-equivalence.json).

## Runtime changes awaiting adoption

- Subtract declared component offsets before averaging live actors, preventing body drift when RACK dies. Use existing EnemyPool interpolation and sync presentation after actor interpolation.
- Cache morph hulls/support points in model coordinates, including mesh node transforms introduced by asset compression. The raw-only prototype missed this; optimized inspection found the state label inside the eye. The corrected bounds match actual morphed vertex maxima.
- Ground the whole model against low authored supports and actual visual terrain. The original arrival/seat buried up to 2,260 sampled vertices.
- Fresh arrival is **(8,4)**, moving targets and eventual chair together onto the surveyed plateau. The old **(0,-8)** arrival overlapped the `six-vein-control-pylon` mounted at (0,-7) and a four-metre terrace transition. [Object ownership proof](runtime-draft-occluder-owner/report.json), [terrain survey](runtime-stage-survey/report.json). Existing saved coordinates are preserved verbatim; legacy chairs can retain that overlap.
- Reduce broad emission, use a smaller canonical state pictogram above actual model height, and append the existing boss HP bounds provider. The bounds query checks readiness before render sync, preventing the reset/reload re-entry defect found during E5 work.

Primary close frames place the player four units away; default-distance frames are retained. Earlier +1Z probes placed the player inside the footprint and exposed mobile HUD obstruction. No global camera, scenery or HUD fix is claimed.

## Evidence and remaining requirements

| Requirement | Evidence / status |
|---|---|
| Export contract and re-export | [V12 contract](iterations/12/homemaker-9000-asset-contract.json), pass |
| Floor geometry | [All groups](damage-ground-groups-12.json), [four chair legs](chair-support-12.json), pass |
| Chair/body fit | [Positive-control mesh intersection check](chair-back-12.json), 88 pairs before / zero after |
| Raw and compressed actual Game presentation | [Raw](runtime-v12-raw/report.json), [optimized](runtime-v12-optimized/report.json): 20 desktop/mobile states, two death orders, zero console/page errors and zero sampled terrain penetration; actual hull heights and label/bar gaps pass |
| Moving encounter + serialized full RunSuspend | [Report](runtime-v12-motion-suspend/report.json): three phases, alpha 0/.5/1, exact restored boss state and live actors, no render-side encounter mutation |
| Full virtual TypeScript check | [Report](typecheck-draft.json): 1,646 source files, zero diagnostics; exact current runtime source, no production emit |
| Loader, invalid/lite/delayed/reset/disposal | [V12 report](runtime-v12-lifecycle/report.json): nine cases pass, including all seven unique GPU resources disposed |
| Kept chair on fresh page | [V12 report](runtime-v12-persistence/report.json): fresh-page kept chair at (8,4), all morphs active, no live boss components |
| Legacy kept coordinates | [Earlier isolated runtime proof](runtime-draft-legacy-kept/report.json): (0,-8) retained; known scenery overlap remains |
| Fresh exact visual review | [V12 findings](visual-review-12/findings.md): improved; residual material/tool simplification and minor damage-chip ambiguity retained |
| Independent static review | [V8–V11 review](source-review-11/review.log): no concrete defect; [V11–V12 chair delta review](source-review-12/review.log): no concrete defect, static-only. Runtime review 3 found no concrete defect after compression fix. |
| Isolated full build and unchanged encounter tests | [Bundle gates](bundle-preview-v12/gates.json): `npm run build` passes; unchanged E6 encounter test passes desktop/mobile (2/2) through the official preview configuration |
| Exact bundled runtime | [Report](bundle-preview-v12/runtime-clean/report.json): ten states, both death orders, exact downloaded GLB hash, zero console/page errors, no source/asset routing; surrounding HUD defects separately recorded |
| Main-worktree production adoption and checks | **Pending E5 terminal result, restoration, reconciliation and freeze release** |
| Post-adoption optimized build, final lifecycle/save/runtime proof, broad regression | **Pending**; isolated browser routing is not whole production bundle verification |

The `runtime-v12-*` development probes route only the artifact source/GLB and two Game calls. The separate `bundle-preview-v12` build uses the actual intended source and asset paths in an isolated APFS copy and serves the resulting bundle without request substitution. All main-worktree production E6 files remain original. Model dimensions and terrain bounds pass at the fresh stage; legacy staging is deliberately not migrated. Full progression and performance acceptance remain post-adoption work.

## Candid fidelity boundary

This is an improvement, not a 1:1 reproduction. Metal remains rough/mottled, the eye lacks the reference's depth, articulated tools are simplified, and the chair back is plain. The mobile debug tuning strip obscures HP/gold independently of this boss pass. Exact review triage is in the linked visual report. Historical iterations and failures remain in their own evidence directories.

Isolated renders/browser probes ran concurrently with the E5 broad suite. Any broad performance failures need controlled confirmation without ancillary workloads; source freeze does not establish timing isolation. Vite also watched the E6 scratch tree: five artifact TypeScript edits and the nested bundle tsconfig triggered all-client reloads during E5. Three desktop navigation errors occurred within 0.7 seconds of those reloads ([log mechanism](../e5-dredge-queen/full-regression/vite-reload-interference.json), [trace correlation](../e5-dredge-queen/full-regression/desktop-navigation-reload-correlation.json)). The E6 isolated bundle remains separately verified, but E5 affected outcomes require quiet confirmation. Future concurrent scratch work must be outside the active server watch root.

[Prepared source patches and adoption checklist](adoption-draft/README.md) preserve the exact virtual TypeScript-checked Game integration. The artifact-relative atlas path must change at production adoption.

## Full-bundle visual follow-up

[Fresh bundle critique](bundle-preview-v12/visual-review/findings.md) confirms coherent boss assembly and distinct shutdown. The suspected loose tray is the world gold seam `night-vein-6`, proven by [raycast and boss-only scene isolation](runtime-v12-side-prop-owner/report.json); it is not a boss attachment defect. The actual bundle also exposes a broken HUD portrait (`src="undefined"`, naturalWidth zero, HTML fallback), debug-panel overlap and a desktop badge overlap. These are outside the boss change and have not been baseline-reproduced or fixed. Console-error absence is not whole-UI acceptance. Clean frames dismiss story cards through their normal controls; initial unclean frames are retained as evidence.
