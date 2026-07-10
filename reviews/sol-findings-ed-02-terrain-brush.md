# Sol finding — ED-02 terrain brush substrate is outside Session B territory

- **Slice:** B1 / ED-02 (`docs/SOL-B-QUEUE-2026-07-11.md`)
- **Branch:** `sol/ed-02-terrain-brush`
- **Verdict:** **BLOCKED — file-and-move-on.** A genuine spatial brush requires descriptor and terrain-consumer seams that Session B is explicitly forbidden to own. No product code was changed.

## Evidence

| Required behavior | Current seam | Why the editor chunk alone cannot supply it |
| --- | --- | --- |
| Raise/lower/smooth an authored heightfield | `ContractHeightfieldDescriptor` exposes only a spring basin, wash channels, and bank relief (`src/meta/ContractFamilies.ts:293-315`); the visual sampler consumes only those primitives (`src/world/Terrain.ts:1200-1219`). | There is no authored grid or spatial delta layer to mutate or sample. Tweaking a nearby analytic scalar would not be a terrain brush. |
| Persist spatial paint in the descriptor | `TileElevationDescriptor` advertises `grid` and `heightsRef` (`src/meta/ContractFamilies.ts:428-437`), but `TileHeight.simHeight()` ignores both and samples only `elevation.analytic` (`src/sim/TileHeight.ts:31-60`). | Adding cells under `src/editor/` would export inert data; the derived renderer probe could not change. |
| Add zone/water/lane marks | Zones are rectangles, water sources are circles, and lanes are spawn-edge enums (`src/meta/ContractFamilies.ts:267-274,370-397`). | Painting needs to add/remove entries. The shipped import boundary requires every array to retain the template length (`src/meta/ContractFamilies.ts:956-959`). |
| Import safely through the 069 boundary | `parseContractDescriptor()` delegates to exact template-shape validation (`src/meta/ContractFamilies.ts:638-649,945-964`). | Every new brush key is rejected and every variable stroke/feature list is rejected before the editor sees it. Weakening this inside the UI would bypass the one atomic validation boundary. |
| Rebuild and retain undo/redo | ED-01 applies through `location.replace()` (`src/editor/DescriptorInspector.ts:238-244`); terrain and contract values are captured at module load (`src/world/Terrain.ts:71-88`). | Reload does rebuild safely, but it destroys an in-memory snapshot stack. History must be a validated document seam available before the game modules construct, not an editor-only afterthought. |

The earlier architecture review already requires ED-02 to establish an **authored base-grid layer** shared later with E4 road grading and E9 persistent deltas (`reviews/sol-findings-masterplan.md:291-295`). A UI that merely changes the existing basin/wash scalars could make a narrow test green while violating that requirement.

## Minimal unblock

Ratify and assign two small cross-territory seams before re-queueing B1:

1. **Descriptor document:** add a bounded, versioned authored terrain layer to `ContractManifest` plus one normalize-or-reject decoder in `src/meta/ContractFamilies.ts`. It must cap dimensions/cell count, require finite values and known paint enums, and preserve unknown/untouched descriptor fields byte-stably.
2. **Terrain consumer:** sample that authored layer from `src/world/Terrain.ts` for visual height. Define whether zone/water/lane paint compiles to the existing rectangle/circle/spawn-edge descriptors or gains its own sampled masks; do not leave those fields editor-only.
3. **Reload-safe history:** let `src/editor/` own the undo/redo snapshots, but make the validated active document available before game construction. Avoid putting a dense grid plus the whole descriptor into `editorDescriptor`: the current transport is already URL-sized JSON.

With those seams ratified, Session B can keep the actual brush UI, snapshot stack, import/export, and e2e entirely in its assigned editor/e2e territory. A top-down editor canvas can map pointer coordinates from the contract size without exposing `Game` or camera internals.

## Static checks performed

- Traced ED-01 install/apply/import end-to-end.
- Traced descriptor validation, height sampling, zone/water/lane consumers, and the debug probe surface.
- Confirmed no existing authored-grid sampler or variable paint decoder exists.

**READY-FOR-RULING:** expand B1 only to the named descriptor + terrain-consumer seams (recommended), or explicitly reduce ED-02 to analytic-primitive tuning and rename it so it is not mistaken for the authored terrain substrate.
