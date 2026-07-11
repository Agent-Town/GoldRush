# Sol finding — ED-05 palette

Branch: `sol/ed-05-palette`  
Base: `origin/main@4231c0be`  
Scope: descriptor-backed color/material identity in the contract editor

## F-ED05-01 — water and scatter colors are not descriptor fields

**Severity:** blocker for the full ED-05 brief; not a blocker for terrain tint-band pickers.

The current canonical descriptor carries two terrain color tuples only: `tileParams.palette.tint` and `tileParams.palette.dampTint` (`src/meta/ContractFamilies.ts:330-342`). `ContractWaterDescriptor` carries width, bars, depths, speed, and wading rules but no color (`:359-366`); `ContractScatterDescriptor` carries density, counts, and near-water bias but no color palette (`:343-349`). Their `id` strings have no runtime lookup and are labels, not editable material references.

The consumers confirm the boundary:

- terrain sends `tint` and `dampTint` into shader uniforms (`src/world/Terrain.ts:743-761`);
- river shallow/mid/deep/ford colors are shader constants (`src/world/Water.ts:170-180`), and spring-pond colors are also fixed in `Terrain.ts`;
- scatter class materials use hard-coded colors (`src/world/Scatter.ts:194-270`), while the descriptor affects counts/density/bias only.

Adding water/scatter picker rows in `src/editor` would therefore either write unknown fields rejected by the 069 boundary or edit inert labels. Neither is an ED-05 implementation.

**Recommendation:** grant and ratify canonical RGB tuple names plus their visual consumers before the full slice proceeds. The minimum territory is the narrow descriptor boundary in `src/meta/ContractFamilies.ts`, the affected contract data, and render-only consumers in `src/world/Water.ts`, `src/world/Scatter.ts`, and the spring-pond material in `src/world/Terrain.ts`. Keep simulation untouched. Decide whether missing color tuples inherit defaults or must be present in each editable template; the current boundary is template-shape strict.

## F-ED05-02 — the second existing tint band is not a picker

**Severity:** ED-05-owned and implementable now.

The generic inspector recognizes only a field named exactly `tint` as a color tuple (`src/editor/DescriptorInspector.ts:504-505`). `dampTint` is currently rendered as three component sliders. The existing native color control already commits through the single history/validator seam (`:366-385`), so the smallest correct editor change is an explicit allowlist for the two canonical terrain tint paths and a 44px picker target. One `change` event remains one descriptor/history commit.

The picker converts through 8-bit sRGB and the Dry Gulch base tint contains an overbright `1.1`. A changed tuple may be quantized by the picker; every untouched field, including an untouched overbright tuple, must remain byte-identical. The slice gate should construct the expected descriptor by replacing only the selected tuple and compare the full exported bytes.

## Proposed disposition

Implement F-ED05-02 now with exact-byte and undo/redo coverage. Hold independent water/scatter color controls behind F-ED05-01 rather than inventing dead descriptor fields or crossing ungranted runtime territory.

## Implemented checkpoint

F-ED05-02 is implemented on `sol/ed-05-palette`: the two canonical terrain tint tuples are explicitly recognized as native color controls, picker targets are 44px, and the existing single `change` event still crosses the shared validator/history/document seam. `e2e/ed-05-palette.spec.ts` compares the complete serialized descriptor after changing only `dampTint`, asserts the untouched overbright base tint remains exact, and proves one history mark plus byte-exact undo/redo in both configured browser projects.

Session B static gates: `npm run build` green; `npx tsc --noEmit` green; Playwright discovery lists 2/2 intended gates (desktop + mobile); independent diff review reports no P1/P2. Browser execution remains Fable-owned. F-ED05-01 remains open, so this checkpoint does not claim independent water/scatter color editing.
