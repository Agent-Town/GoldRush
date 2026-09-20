# E3 Dynamo Crawler — fidelity preflight

Status: READ-ONLY PREFLIGHT, 2026-09-08. E3 implementation has not begun. Inspected checkout: `d41ab98ce`, with concurrent E1/E2 working changes left untouched. This document is the only file written for this subtask.

The target is the approved plate's recognizable electrical-machine silhouette: a tall segmented drain mast, substantial cylindrical dynamo with a framed teal window, two unequal exhaust stacks, and a bank of wound copper capacitors. Preserve the gameplay Crawler's tracked chassis and three component identities; improve those major forms before adding tiny engraved detail.

## Source and current asset

| Surface | Exact path / evidence |
| --- | --- |
| Approved reference | `assets/raw/plate-e3-boss-dynamo-crawler.png` — 1672 × 941; SHA-256 `eb52e2b77695536c2216958daae45028f044c6a80757ff4450424f59a3dae086` |
| Runtime source GLB | `assets/pilots/crawler-3d/crawler.glb` — SHA-256 `a336f7574d42ae6e1d69d13310fd549411c442e93073fec6a64ea0128f4f75f9`; 2,391,052 bytes |
| Authoring source | `assets/pilots/crawler-3d/build_crawler.py`; saved editable scene `assets/pilots/crawler-3d/crawler.blend` |
| Contract verifier | `assets/pilots/crawler-3d/verify_crawler.py`; report `assets/pilots/crawler-3d/renders/crawler-asset-contract.json` |
| Existing render recipe | `assets/pilots/crawler-3d/render_crawler.py` |
| Package rationale | `assets/pilots/crawler-3d/README.md` |
| Runtime import | `src/systems/CrawlerBossSystem.ts:12` imports that exact GLB; `ensureCrawler3d():394` loads it using `createGltfLoader()` from `src/assets/AssetLoading.ts:9` |
| Build/deploy inclusion | `scripts/asset-diet.manifest.json:62`; `scripts/deploy.sh:384` |
| Prior same-session captures | `artifacts/boss-art-fidelity-2026-09-08/crawler-comparison.png`, `crawler-front.png`, `crawler-three-quarter.png`; provenance in `asset-manifest.json` |

The current reference and GLB hashes were re-read directly and match the earlier neutral-render manifest. Therefore those captures still depict the current E3 binary. This checks the local asset import and build inclusion; it does not claim to have verified a deployed site's bytes.

The approved plate is also identified by `assets/LEDGER.md:131,250`. `specs/epoch-saga/e3-voltage-bundle.md:30` calls for a rolling power plant on cart tracks, three zones (drain mast / track assembly / capacitor bank), and a mast that visibly points. The plate itself depicts rail wheels and coupling rods. That is an existing art-versus-gameplay discrepancy, not permission to turn the Crawler into another Railcar. Keep treads in this fidelity pass.

## What the inspected images show

Viewed the raw plate, the prior neutral comparison, and the existing turntable and damage-state boards. The plate and renders have different cameras and lighting, so these observations concern feature identity and proportions, not pixel matching. No new render, screenshot, image generation, or runtime test was run for this preflight.

| Finding | Visible evidence | Smallest useful correction / existing builder seam |
| --- | --- | --- |
| E3-F1: the undercarriage reads as a rectangular box | In the neutral render and all four turntable angles, broad continuous skirts conceal the drive wheels already present in the mesh. The plate has a strong sequence of readable wheel circles and openings. | Shorten/open the existing `Track armored skirt` panels and reduce broad end blocks, exposing the existing wheels while retaining continuous tread belts. `build_tracks():331`, especially skirt/strap construction at `345–368`. This can remove geometry rather than add it. |
| E3-F2: the electrical mast reads as a ladder with a teal sign | The plate repeats large collared electrical chambers at several heights and two horizontal connections. The current repeated ceramic pieces are small buttons; a large isolated teal crown dominates. | Reshape/re-proportion the existing five insulator assemblies and collector/collar, then make the existing drain-arm glass and paired arm structure read as electrical connections. `build_drain_mast():398`, repeated cores/discs at `407–411`, crown/collector at `411–413`, arm at `415–418`. Keep the tallest feature and pointing direction. |
| E3-F3: the central skyline loses the paired stacks | The plate has two conspicuous unequal-height smokestacks; the baseline has a short capped cylinder, a small pressure outlet, and a chunky box. | Lengthen and differentiate the existing exhaust and pressure stacks; reduce the visual dominance of the rectangular arm-pivot box. Stack primitives already exist in `build_capacitor_bank():456–459`; pivot is `build_drain_mast():418`. This is primarily repositioning/resizing. |
| E3-F4: capacitors read as red canisters with tan lids | The plate's bank is defined by dense copper windings, dark/brass collars, and upper curved connections. The current six jars have sparse trim and broad red/tan areas. | Keep the two-by-three jar arrangement and damage groups. Make coil grooves and collars legible through atlas content/UV placement first; adjust existing crowns and ring spacing. Only add a few connecting pipe silhouettes if the existing triangle budget can be reallocated. `build_capacitor_bank():439–454`; atlas copper/brass regions in `create_atlas():54`. |
| E3-F5: the boiler loses its framed mechanical face and window | The current cylindrical mass is recognizable, but its side glass resembles a small protruding teal puck and large faces carry broad brown mottling. | Reuse the existing side viewport and collar: enlarge/deepen the frame and give the glass a simple structural division; reinforce existing armor-band contrast. Avoid rebuilding the whole boiler. `build_capacitor_bank():429–436`. |
| E3-F6: broad surfaces read as wood/cardboard | Both the neutral render and turntable show tan fittings, brown block mottling, red cylinders, and repeated diagonal scratches. The plate separates near-black iron, brass edging, copper windings, and teal glass. | Correct the existing atlas/material treatment alongside the silhouette changes. Keep illustrated warm metal; avoid photoreal polish or global saturation. `create_atlas():54–123`, `create_material():126–143`, `prepare_part():467–487`. |

An independent visual reader, given only the plate and baseline images, agreed on mast segmentation, paired exhaust stacks, capacitor windings, framed boiler window, and clearer metal identity. It separately flagged the rail-wheel/tracked-chassis ambiguity. There is no disputed visual verdict requiring a design decision before this preflight can be used.

## Geometry, state, and material boundaries

Direct parsing of the current GLB confirms:

| Contract | Current value / preservation requirement |
| --- | --- |
| Named mesh nodes | Exactly `drain_mast`, `tracks`, `capacitor_bank`, all identity transforms |
| Morphs | Respectively `Damage_ToppledDrainMast`, `Damage_ShatteredTracks`, `Damage_RupturedCapacitorBank`; exactly one morph per mesh, index 0, default weight 0 |
| Geometry | 3 meshes / 3 primitives; **11,980 triangles**; builder and verifier ceiling **12,000**, leaving only **20 triangles** of headroom |
| Material/images | One shared material, all primitives using material 0; one embedded 1024 × 1024 PNG atlas; no external textures |
| Authored material | `RivalDynamoCrawlerMaterial`, double-sided, metallic 0.18, roughness 0.82, no authored emissive texture/factor, no normal map or roughness/metalness texture |
| glTF bounds (X length, Y height, Z width) | min `[-1.600000, 0, -0.694500]`, max `[1.600000, 2.677500, 0.694500]`; size **3.20 × 2.6775 × 1.389** |
| Anchoring | Base at Y=0; X/Z centered. Exact length 3.20 is asserted; current height/width are documented measurements, not equality assertions in the verifier. Keep the current envelope unless the next slice explicitly changes and proves it. |
| Animation | Zero clips, skins, lights, or cameras. Components are joined by damage role, not independent mechanical joints. |
| Reproducibility | Existing verifier requires byte-identical saved-BLEND re-export and matching semantic fields; it writes its report before the final assertions, so report existence alone is not proof of success. |

`verify_crawler.py:207–237` enforces names, bindings/default weights, identity transforms, primitive/material count, triangle ceiling, atlas dimensions, bounds anchors, no lights/cameras/animations, and re-export identity. `build_crawler.py:642–670` constructs and checks the asset. The generic production GLB guard also caps boss textures at 1024 (`scripts/glb-contract-guard.mjs:60`); no Crawler exception appears in its baseline.

**Do not silently raise budgets.** First reclaim skirt/block or hidden-detail geometry for the more useful silhouette features. Any geometry change also changes the runtime equality pin `CRAWLER_3D_TRIANGLES` at `CrawlerBossSystem.ts:13`; keeping under 12,000 alone does not make a revised GLB load. Adding an emission/surface map would also change the existing one-image contract and must be deliberate, verified, and described in the eventual implementation.

**Morph pivot caution:** `normalize_base_center():610` runs before `add_damage_shapes():518`. The latter contains explicit pivot/coordinate constants and vertex-group selections. Moving the mast foot, changing outer bounds, or moving capacitor jars requires re-deriving those damage transforms in normalized coordinates; do not assume the old hard-coded pivot still matches a revised shape. Inspect all three damage states after any geometry edit. Retain the damage-only fragments' hidden intact state and their owning vertex groups.

## Runtime presentation seam

The smallest runtime surface is `src/systems/CrawlerBossSystem.ts`, not the shared enemy pool or simulation model.

- `inspectCrawler3d():433–458` rejects any mismatch in exact mesh count, node names, morph at index 0, one source material, or exact triangle count. Rejection retains the procedural fallback. It clones the material per component and replaces `emissiveMap` with the diffuse map at line 454.
- `updateCrawler3d():461–490` anchors the full asset from surviving component positions and cached group offsets, grounds it with `Terrain.visualY`, and sets heading to `Math.PI / 2 - anchor.group.rotation.y`. Preserve these transforms.
- Each component morph switches to 1 at HP <= 50% or when destroyed. Intact emission is warm `#fff8e8` at intensity 2; damaged emission uses component colors at intensity 3. This makes every textured surface glow, including metal. Any surface-fidelity revision must be checked in runtime as well as with original-material neutral renders.
- `syncPresentation():167–210` owns the separate drain beam, burst dial, fallback component visibility, and final wreck. Beam endpoint height is a separate fixed 3.2 above sampled terrain (`:187`), so its attachment/readability must still be checked if the mast silhouette changes.
- When every component is gone, the GLB is disposed and the separate procedural `CrawlerWreck.Roost` remains (`:112–119`, `:200–210`). An improved GLB does **not** automatically improve that wreck; changing it is outside this preflight's proposed minimal asset slice.
- Lite tier intentionally keeps the procedural placeholder (`:97`, `:395`); no GLB fidelity claim applies to it. Revisit/reset/dispose logic and failed-load behavior must remain intact.
- Game wiring is already established: constructor `src/game/Game.ts:1081`, killed-component forwarding `:2036`, wave forwarding `:2077`, scene mount `:4992`. Those integration calls and boss mechanics do not need changes for a geometry/atlas replacement.

## Existing evidence and checks for the next slice

The render script imports the actual GLB (`render_crawler.py:259`) and owns three useful outputs:

- Four-view intact board: `renders/crawler-turntable.png` (`render_turntable():452`).
- Three independent damage states: `renders/crawler-damage-states.png` (`render_damage_states():496`).
- Context image and plate A/B: `renders/crawler-canyon-run-camera.png` and `renders/crawler-reference-ab.png` (`render_canyon_run_camera():478`). Its 42-degree FOV and offset direction match the documented production intent, but its distance is shortened to 7.8 for review; it is a Blender context illustration, **not a live game screenshot**.

Relevant existing tests, identified but not run:

| Check | Coverage |
| --- | --- |
| `e2e/wire-crawler-3d.spec.ts` | GLB mount, all three damage morphs, final disposal/restart, lite tier making no GLB request, invalid-GLB fallback; existing tests at lines 115, 158, 174 |
| `e2e/e3-crawler-boss.spec.ts` | Four acts and persistent wreck; deferred component effects; restored act timers; failed CONNECT objective staying failed; tests at lines 73, 178, 209, 257 |
| `e2e/e3-canyon-works.spec.ts` | Adjacent gorge/power/era behavior; tests at lines 34, 116 |
| `assets/pilots/crawler-3d/verify_crawler.py` | Exact asset contracts and deterministic saved-BLEND re-export |
| `scripts/glb-contract-guard.mjs` / `.test.mjs` | Production asset contract audit; finite/transformed geometry and family texture rules |
| `npm run build` | TypeScript + Vite + asset-diet inclusion |

A later implementation should demonstrate the same revised binary in the neutral view and in full-tier gameplay with `crawler3dState=ready`, `crawler3dMounted=true`, all three damage states, and zero console/page errors. Use the existing desktop and mobile projects; do not edit established e2e expectations merely to accept an asset. No test result is claimed here.

## Proposed next boundary

Begin with E3-only builder/asset changes that expose existing wheel forms, restore mast and stack silhouette, and clarify copper/iron/brass/teal surfaces. Keep the current three nodes and morph contracts. The likely eventual changes are the Crawler builder, saved BLEND/GLB, verifier/report if its contract changes, Crawler evidence/README, and the narrow runtime triangle/material presentation lines if required. Ledger/layer-contract updates belong to that authorized implementation, not this read-only preflight.

Do not touch E1/E2 work, other bosses, simulation balances, target positions, damage resolution, power graph, gameplay VFX timing, `STATUS.md`, ratified specs, existing e2e specs, or git history. No new framework, general boss loader, paid generation, joint-animation system, or broad renderer refactor is needed for this correction.
