# Land Yacht — shared builder boundaries

2026-09-08. Read-only dependency inspection; this note is the only output. No builder, production asset, registry, or E4–E10 implementation changed. The recommendations below are prospective, not a reproducibility claim.

**E4 currently depends on Queen-specific atlas code and mutable globals. The existing `detail_opus5_kit.py` supplies the generic helpers with explicit arguments, so E4 can own its native atlas and export settings without copying the Queen builder. Keep subsequent E5 changes in the Queen's local builder, and treat both shared helper files as frozen dependencies.**

## What E4 imports

`assets/pilots/land-yacht-3d/build_land_yacht.py:24–36` loads `assets/pilots/dredge-queen-3d/build_dredge_queen.py` under a unique module name and replaces `REFERENCE` and `DAMAGE_REFERENCE`. Its geometry uses `beam`, `box`, `cone`, `cylinder`, `ico_sphere`, and `torus`; damage uses `group_vertex_indices` and `rotate_y`.

At `build_land_yacht.py:258–279`, E4 also calls `reset_scene`, `create_atlas`, `create_material`, `join_component`, `normalize_base_center`, `triangle_count`, `world_bounds`, and `export`. It mutates `MODEL_LENGTH` to 9.4 and replaces `BLEND`/`GLB`. It does not own the atlas layout or surface algorithm: shared `create_atlas` reads `REFERENCE`, `DAMAGE_REFERENCE`, `ATLAS_SIZE`, and `REGIONS` (`build_dredge_queen.py:11–31,57`); shared `prepare_part` maps UVs through that same global `REGIONS` (`:582`); normalization and export read the output globals (`:734,747`). Renaming the returned image/material does not isolate their content.

The unique import name prevents another independently loaded module's assignments from changing this Python module instance. It does **not** protect future E4 rebuilds from edits to the shared source file.

## Other consumers of that exact module

Paths below are under `assets/pilots/`. “Assembly” means `reset_scene`, `join_component`, `normalize_base_center`, `export`, and `triangle_count`; “damage math” means `group_vertex_indices` and `rotate_y`.

| Consumer and import evidence | Shared dependencies beyond E4 |
|---|---|
| `homemaker-9000-3d/build_homemaker_9000.py:34` | Assembly, damage math, `beam/box/cylinder/ico_sphere/torus`, and `create_material`. It owns `create_atomic_atlas`, but that function still reads `ATLAS_SIZE`, `REGIONS`, `region_pixels`, and `resized_nearest` from Queen (`:37–73`). Replaces model length and output paths. |
| `salvage-claw-3d/build_salvage_claw.py:35` | Assembly, damage math, `world_bounds`, all six E4 primitives plus `triangle_panel`, `create_atlas`, `create_material`, and `REGIONS` for local atlas tuning. Replaces reference plates, length, and output paths. |
| `old-digger-3d/build_old_digger.py:35` | Assembly, damage math, `world_bounds`, `beam/box/cylinder/ico_sphere/torus`, `create_atlas`, `create_material`, and `REGIONS` for local atlas tuning. Replaces reference plates, length, and output paths. |
| `dredge-queen-3d/build_dredge_queen_detail_sol.py:16–32` | Assembly and `world_bounds`; Queen's `build_claw`, `build_hold`, `build_paddle`, and `add_damage_shapes`; `beam/cone/cylinder/torus/tag`, atlas and material. Replaces atlas size/output paths and monkeypatches primitive tessellation (`:34–73`). |
| `salvage-claw-3d/build_salvage_claw_detail_sol.py:34–35` (transitive) | Loads the base Claw builder, then uses its `base.dq` instance. Inherits Claw's shared dependency and monkeypatches primitive resolution (`:41–57`), atlas size, length, and outputs. |

There are also two non-boss consumers: `dome-population-e8/build_dome_population.py:39` and `basin-population-e9/build_basin_population.py:40`. Both use atlas/material generation, `REGIONS`/`ATLAS_SIZE`/`region_pixels`, `beam/box/cone/cylinder/ico_sphere/torus`, reset/join/export, triangle counts and bounds. They replace reference/output globals but normalize locally. A shared atlas/UV/material change would affect their rebuilds too.

## Separate dependency that matters when E5 begins

The runtime Queen and Claw load `dredge-queen-detail-opus5.glb` and `salvage-claw-detail-opus5.glb` (`src/systems/DredgeQueenBossSystem.ts:17`, `src/systems/SalvageClawBossSystem.ts:16`). Their active source chain differs from the legacy builders above:

- Queen detail loads `detail_opus5_kit.py` (`build_dredge_queen_detail_opus5.py:46–54`).
- Claw detail loads the **Queen detail builder**, aliases its `kit` and `REGIONS` (`build_salvage_claw_detail_opus5.py:55–57`), replaces its reference/size globals, and calls `queen.create_atlas()` (`:508–511`). A Queen-local atlas replacement would therefore change later Claw rebuilds unless this existing caller is preserved or separated deliberately during the relevant pass.
- The verified E1 props already import the same toolkit (`baron-props-3d/build_baron_props.py:34–43`). Do not adjust toolkit behavior casually to serve E4 or E5.

## Smallest durable boundary for the E4 implementation

1. Load the existing toolkit directly. Own E4's native source path, `ATLAS_SIZE`, `REGIONS`, image loading/resizing, material response, names, output paths, and source receipts in the E4 builder. Stop invoking the Queen builder's `create_atlas`; stop assigning Queen globals.
2. Reuse the toolkit primitives and math. Its explicit interfaces already include `join_component(name, parts, material, regions)` (`detail_opus5_kit.py:609`), `normalize_base_center(objects, axis, target)` (`:664`), and `export(objects, blend, glb)` (`:678`). For the existing E4 basis, normalization is `axis=0`, `target=9.4`; the helper scales all coordinates uniformly. The six E4 primitive defaults match the legacy helpers; extra toolkit options for torus minor segments, sphere subdivisions, and beam depth preserve the old defaults. Still verify counts, bounds, names, UV regions, pivots, and damage morphs after changing the import.
3. Keep any E4-specific UV orientation or deterministic topology handling local. The toolkit currently always Smart Projects in `prepare_part` (`:588`) and uses Blender's ico-sphere operator (`:212`); it has no authored-UV bypass. E4's prow search eye uses `ico_sphere` (`build_land_yacht.py:67`). These are verification targets, not proven defects here. E2's local explicit steam topology/UV handling (`build_railcar.py:128,360`) and E3's local cylinder-UV bypass (`build_crawler.py:409`) show why a surface pass must not blindly change shared unwrap behavior.
4. Record the E4 builder, native atlas, toolkit, Blender/exporter versions, and resulting GLB hashes. Run three fresh isolated source builds plus the saved-Blend re-export check; acceptance needs matching final bytes and the measured asset contract. A saved-Blend match alone does not prove source determinism. Do not rebuild other served assets for this check.

This removes the dependency on Queen's art/layout globals without a whole-builder copy. It does not make a mutable shared toolkit immutable: keep toolkit edits out of later E5 work, or explicitly review and reverify every affected consumer when such a change is necessary. Likewise, preserve Claw's existing atlas path when changing Queen's detailed atlas; silently replacing `queen.create_atlas` is unsafe for E8 reproducibility.

Inspected dependency SHA-256 receipts:

- `build_dredge_queen.py`: `659f44c8dd5bbdf9f71d840f229bdc300950a02e0527d04586217facc1998edc`
- `detail_opus5_kit.py`: `62f2e15b2f72cf4930d0d311774419feb59a0d9bd894c0941c1dc50101228637`
- `build_dredge_queen_detail_opus5.py`: `d1e4d043ad1196f764de62177fb5503846ed3e5db702dbbe3be955cc675373c8`
