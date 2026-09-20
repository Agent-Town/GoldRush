# Maps, objects, and concept art — inventory and verification

> Historical baseline audit. Current counts and repairs are summarized in [the current 42-map report](sol-map-art-current-status-20260909.md) and tracked in [the readiness ledger](../artifacts/map-art-repairs-20260908/readiness.json), [inventory13](../artifacts/map-art-repairs-20260908/current-inventory-13/inventory.json), and [repair evidence](sol-map-art-repairs-20260908.md). The original counts and findings below are retained as the starting snapshot.

**Date:** 2026-09-08. **Source:** `e6c0656183d7355a357ee57abeb9b2e0b661ed47 (archive: pruned by the A3 rewrite)`. **Branch:** `sol/map-art-inventory-20260908`.

**Verdict: substantial artwork and model coverage; not a concept-fidelity sign-off.** All 42 requested map IDs opened on desktop and mobile emulation. Three maps omit their entire four-building landmark set. Five other maps reuse host-map landmarks despite having their own body packs. Twenty-five early body contracts describe obsolete binaries. These should be resolved or explicitly accounted for before the next art commission.

Start with the [visual catalog](../artifacts/map-art-inventory-20260908/index.html). It links every map concept to fresh game images, its terrain contract, GLBs, named bodies and declared sources. The [42-row map matrix](../artifacts/map-art-inventory-20260908/maps.md), [196-body landmark ledger](../artifacts/map-art-inventory-20260908/landmarks.md), and [444-file model ledger](../artifacts/map-art-inventory-20260908/models.md) provide the detailed inventory. [Machine-readable data](../artifacts/map-art-inventory-20260908/inventory.json) preserves the joins and discrepancies.

## Scope and counting rules

This is the local factory-rich checkout, not an audit of a deployed build or another task's checkout. Code, assets, contracts and the existing factory documents were read. Gameplay, animations, canonical art, STATUS, BACKLOG, specs and existing tests were not changed; nothing was queued, committed, pushed or generated through an art service.

A **map contract**, **unique terrain sculpt**, **landmark asset file**, **placed instance**, **concept plate**, and **processed derivative** are different units. A GLB can contain several objects; a sheet can depict several designs. Counts below do not turn these into equivalent units or sum them into a fictional unique-artwork total.

| Inventory layer | Measured amount | Meaning |
|---|---:|---|
| Gameplay contract maps | **42** | Six E1 contracts; four in each E2–E10. Includes the Drill Yard and two E10 special cases. |
| Matching raw map concept plates | **42 / 42** | One existing `plate-contract-*` PNG per contract, matched by contract ID or established short slug. |
| Runtime sculpt routes | **39** | 32 distinct sculpts plus seven deliberate aliases. |
| Terrain contract files | **37** | 32 sculpt contracts plus five earlier alias-specific contracts not selected by the renderer. |
| Terrain GLBs | **32** | 32 matching saved terrain blends and terrain export sidecars. |
| Panorama GLBs and contracts | **32 + 32** | Separate surrounding scenery, not playable terrain. |
| Landmark packs | **36** | Every pack is populated. |
| Landmark body records / GLB files | **196 / 196** | File set and declared asset set agree. |
| Landmark-pack bodies selected by runtime routes | **171** | Actual mounted bodies verified in browser; 25 others are not selected. |
| Additional declared non-pack mount files | **4** | E4 town buildings intended as Deepwater ruins; all four are skipped. |
| Distinct mount-file references across selected sculpts | **175** | 171 valid landmark bodies + those four unavailable-to-loader references. |
| Town/building GLBs in the existing guard manifest | **82** | Eight base building models + one town plate + 73 era variants. |
| Prop/rail GLBs in the manifest | **62** | 48 plaza props, 13 run props including rail, one Baron prop model. |
| Finale scenery GLBs in the manifest | **2** | Ark plaza and Ark era dressing. |
| Boss GLBs in the manifest | **6** | Counted separately; animation/behavior review belongs to the other task. |
| GLBs selected by the existing guard | **412** | 406 environment/building/prop files plus six bosses. Manifest selection is not proof of runtime reachability. |
| All pilot GLBs on disk | **444** | The above plus 32 files outside that manifest, including alternative exports, additional building pilots and the hero pilot. Approximately 904 MB of source GLB bytes. |

The 73 town variants are nine era variants for each of Tavern, General Store, Claim Office, Assay Office, Chapel, Schoolhouse, Stamp Mill and Dynamo Hall, plus one Catalog Warehouse variant. `TownTavernPilot.ts` selects buildings and era variants; the counts should not be described as 82 distinct architectural designs. Seven plaza era-prop manifests contain **35 placement records using 25 distinct GLB files**: E2 8 placements, E3 5, E4 5, E5 5, E8 3, E9 6, E10 3. Flood-reset entries change which earlier placements survive. These placements are not additional models.

`buildables.ts` declares ten buildable types. The run model registry contains eight buildable models plus gold seam and rail element; Decoy Shed and Capacitor Bank are not entries in that registry. Existing procedural/sprite paths and scene fixtures therefore remain part of the object estate. The catalog's GLB totals are not a census of every procedural mesh, particle, pickup or gameplay instance.

## Artwork volume

The raw library contains **649 PNG files**. The catalog indexes **203 explicitly selected world-art reference files**, in these non-overlapping filename groups:

| Reference group | Files |
|---|---:|
| Map concept plates | 42 |
| Era/valley kits, including alternatives | 17 |
| Building artwork and facades | 72 |
| Terrain artwork | 23 |
| Props, landmarks and gold-node artwork | 25 |
| Era building plates | 16 |
| E10 place/object plates | 5 |
| Town concepts, kit and interior | 3 |
| **Scoped reference total** | **203** |

This is a reproducible discovery set, not a claim that exactly 203 unique designs exist. Additional illustrations appear on character/boss/arsenal/mixed-content sheets. The full raw filename census and all grouping rules are retained in `inventory.py` and `inventory.json`. The source library also has 27 reference images, 430 pilot PNGs (many atlases and retained renders), 1,400 processed PNGs plus 14 processed WebPs, and 526 full-resolution processed PNGs. Raw, processed, full-resolution, atlas and screenshot counts must not be added as separate designs. Folder counts and byte totals are in the JSON.

All 196 landmark records declare source tiers: **101 derive, 83 reuse, 12 build-new**. Their referenced source paths exist. Their declarations are useful lineage evidence, but the stale early contracts below mean that they cannot universally certify the current exported shape. For non-landmark models, the complete model ledger links immediate-folder builders/contracts containing image references; these are explicitly research pointers, not an invented one-to-one provenance mapping.

## Findings

### F-MAPART-1 — Deepwater's four drowned buildings never reach the scene

**Confirmed runtime defect; first corrective candidate.** Deepwater Claim, Stillwater and Flotilla each report expected `4`, mounted `0`, skipped `4`, with all four diagnostics reading `asset unavailable`, on desktop and 390px mobile. Terrain and panorama still report ready; no console/page error is emitted. A generic “ready + zero errors” gate misses this failure.

The source records at `assets/pilots/map-rebuild-spike/deepwater-claim-terrain-contract.json:348` name `assets/pilots/<building>-3d/<building>.e4.glb`. Those files exist. But `Terrain3dClaimPilot.ts:196` discovers only GLBs inside `map-rebuild-spike/landmarks/`, and `:2227` prefixes every mount path with `../../assets/pilots/map-rebuild-spike/`. Neither the discoverable set nor the resulting key can resolve these four root-relative town paths.

Affected IDs: `drowned-claim-office`, `drowned-chapel`, `drowned-general-store`, `drowned-stamp-mill`. The contract explicitly says they are absent from the terrain GLB (`:424`), so the baked terrain does not rescue them.

Evidence: [desktop measurements](../artifacts/map-art-inventory-20260908/browser.json), [mobile measurements](../artifacts/map-art-inventory-20260908/browser-mobile.json), and the three E5 gallery rows. Future gate: assert **exact mounted IDs and paths**, `4/4`, zero skips, on all three contracts. Preserve existing mask and collision authority.

### F-MAPART-2 — Five early packs have stale model hashes and geometry counts

**Confirmed provenance/rebuild risk.** All five bodies in each of The Claim, Dry Gulch, Night Shift, Twin Banks and Baron have SHA-256 mismatches against their pack declarations: **25 of 196 bodies**. The same 25 also disagree with their declared triangle counts. Example: Baron's `fortified_far_bank` declares 2,004 triangles; the current GLB contains 1,508. `seized_headframe` declares 220; the GLB contains 868.

The remaining 171 hashes match; all 196 body files and all declared body source paths exist. Terrain and corresponding pack mount records agree in this inventory. This is not evidence of missing files or a reason to overwrite a newer model with an older export.

The [body ledger](../artifacts/map-art-inventory-20260908/landmarks.md) lists every declared/actual count and hash result. `docs/3d/PIPELINE.md` and `Terrain3dClaimPilot.ts:282` independently record that Twin Banks' builder no longer regenerates faithfully. The 25 current early bodies also constitute the existing missing-extras baseline in the GLB guard.

Future gate: identify the intended current binary and its source recipe before re-exporting; then reconcile bounds, triangles, sources and hashes in the same scoped slice. Verify both saved-blend re-export and full builder regeneration where claimed. Do not simply refresh hashes to hide unexplained geometry drift.

### F-MAPART-3 — Five alias-map body packs exist but are not selected

**Confirmed inventory divergence; terrain reuse is intentional.**

| Contract | Sculpt/mount source used at runtime | Own unused pack |
|---|---|---:|
| The Picnic | Glow Mesa | 5 bodies |
| The Dead Band | Relay Valley | 5 bodies |
| Relay Rush | Relay Valley | 5 bodies |
| The Far Side | Mare Claim | 5 bodies |
| The Eclipse | Mare Claim | 5 bodies |
| **Total** | | **25 bodies** |

All 25 files have matching recorded hashes and exist. They are not selected by any current sculpt route. Their own earlier terrain contracts also remain on disk. Stillwater and Flotilla deliberately share Deepwater but have no separate own body packs.

`docs/MAP-CAMPAIGN-LEDGER.md` explicitly records the seven reuse rulings; preserve them. It does not follow that each alias visibly presents its own concept-specific landmarks. A future commission must specify whether to preserve shared dressing or adopt selected existing bodies without changing the shared sculpt. No new body generation is necessary merely to discover this decision.

### F-MAPART-4 — Structural coverage substantially overstates visible concept fidelity

**Visual triage, not a blanket per-object rejection.** The 42 paired concept/spawn frames and the 171 body-side frames were inspected as contact sheets. Concepts use wide illustrative viewpoints; the game uses a close player-following camera. No pixel-distance score or percentage-fidelity claim is appropriate.

Observed recurring gaps:

- Many E4/E6/E7/E8/E10 spawn views are dominated by textured ground, haze and UI. The defining rigs, domes, plazas, relay lines or cliffs of their plates are not readable from that initial view. Object-side views confirm that many bodies do exist elsewhere; absence from the spawn image alone is not a missing-model finding.
- E3 Blackout Ridge/Moth Season retain the darkness motif, but the immediate view can reduce the setting to a bright cyan light circle inside nearly opaque haze. Several object-side views remain difficult to read.
- The Fairground concept's dominant Ferris wheel is not in its five-body landmark pack. The actual pack is an admission arch, calliope wagon, prize cage, rostrum and bell kiosk. This is a concrete concept-to-pack scope difference, not a failed GLB load.
- E5 concepts promise a readable sea/boat/drowned-world composition. The current initial frames read predominantly as dark shelf ground; the drowned-building omission is separately proved in F-MAPART-1. A complete water/camera assessment needs sea-state and boat-travel stations as well as these boot frames.
- Several close-up landmark forms are sparse reused frames, small gantries or simple roofed structures compared with the richer conceptual architecture. This can be a deliberate gameplay-distance simplification; the current records do not constitute a fresh visual acceptance of it.
- Near several map-edge stations, the bright horizon/apron and hard terrain boundaries compete with the model. These are captured observations from debug teleport stations, not proof of a traversal defect.

The next fidelity work should begin from the catalog and select named maps/objects. For each, write the expected silhouette and geography from its plate, compare a whole-map composition and player-scale views, then record what is intentionally simplified. Do not infer model quality from “five mounted” or polish lighting to conceal a missing shape.

### F-MAPART-5 — Three contracts intentionally have no entry in the sculpt registry

The Drill Yard, The Last Claim and The River opened as themselves on both viewports, but the sculpt pilot reports `failed / painted` with `pilot-contract-unavailable`. The two E10 cases are explicitly excluded from the original sculpt campaign; Drill Yard is the practice contract. They should be tracked as **separate painted/procedural/special presentation paths**, not counted as three absent terrain GLB files to generate automatically.

The Last Claim's wide Ark-deck concept is not reproduced by its current direct debug boot frame, which shows the simpler ground/vent presentation. That observation is not a verification of all finale/Charter Press story states. The separate Ark staging models are counted in the inventory, but their presence on disk does not prove this contract mounts them.

### F-MAPART-6 — The current validator is valuable but does not close the art audit

The existing `node scripts/glb-contract-guard.mjs` completed successfully: **412 selected GLBs, 69 violations grandfathered, zero live violations, zero stale baseline entries**. All 64 contracted terrain/panorama assets passed that guard's metrics/topology checks. See [saved audit](../artifacts/map-art-inventory-20260908/glb-audit.json) and [census](../artifacts/map-art-inventory-20260908/glb-census.txt).

The 69 baseline violations are 43 texture-cap violations and 26 missing-extra violations. The 32 files outside its manifest are not inspected by that guard. It does not reconcile early landmark hashes/triangle declarations, prove runtime path selection, or compare a model's silhouette with its concept. Its success and F-MAPART-1/F-MAPART-2 can therefore coexist.

Source GLBs being double-sided is also not the same as every runtime mesh being double-sided: the current terrain loader applies verified-closure culling. This audit observed runtime side-census data, so the older blanket rendering-cost conclusion should not be copied unchanged.

### F-MAPART-7 — Historical dossiers are useful evidence, not current completion state

The 27-map campaign ledger remains an owner-commission scope, not the whole game roster. The craftbooks explicitly distinguish that program from the larger file estate. The August 6 Surveyor's Dossier's “13 of 25 maps will not open” headline is now stale for this source revision: **all 42 current contracts opened correctly** in this audit. Conversely, the campaign ledger's “build side done / only owner verdicts remain” misses the present Deepwater omission and lineage drift.

The older run recipe describes flag-only 3D pilots; current `Game.ts:2170` installs Run3dPilot directly and the browser probes confirm it. Read the living consumer before following old wiring recipes. Preserve the old documents as historical evidence and update the controlling work item/ledger through the orchestrator after the findings are triaged.

## Factory process to retain

Use the existing system, with stronger joins at its existing gates:

1. **Claim a bounded map/object slice.** Respect the orchestrator's work ledger, branch ownership, one writer per surface and explicit transfer acknowledgement. Animation work remains separate. Do not regenerate another task's shared body.
2. **Identify the actual target.** Read `docs/CONTENT-MAP.md`, the relevant contract/plate and `assets/LEDGER.md`. Terrain aliases, render-only placement and existing owner rulings are inputs, not suggestions to silently change.
3. **Use the source ladder:** reuse → derive → build-new. The 101/83/12 body distribution makes this a substantial existing library. Still-image generation, when later authorized and needed, uses native `image_gen` only under the current owner directive; no paid substitute. This inventory generated no artwork.
4. **Keep ownership separate.** Terrain owns masks, coordinates, transforms and visual-height placement. Landmark packs own geometry, atlas, bounds and source provenance. IDs join them; preview transforms do not acquire runtime authority. Collision/placement rules remain with their existing gameplay owners.
5. **Follow the actual export contract.** `docs/3d/PIPELINE.md` pins Blender 5.1.2 and glTF exporter 5.1.20. Saved-blend re-export, full recipe regeneration, and compressed runtime validation are three separate claims. Use the appropriate sidecar/profile and scratch output for checks.
6. **Gate identity and visibility.** In addition to the current binary validator, compare declared vs loaded IDs, exact sources and transforms, zero skipped mounts, hashes/metrics, and matching terrain/pack records. Review locked camera, whole-map view, object sides and 390px presentation. Preserve the Grit Law, regional landform identity and mask agreement.
7. **Drain and record.** Owner visual verdict and orchestrator integration remain separate from generated-file existence or a runner's done-move. Record the exact accepted binary, evidence and scope. This report is an input to that process, not an approval or queue instruction.

Factory references: [3D pipeline](../docs/3d/PIPELINE.md), [terrain craftbook](../docs/SOL-3D-D-CRAFTBOOK.md), [landmark craftbook](../docs/SOL-3D-C-CRAFTBOOK.md), [modeling recipe](../specs/town-3d/RECIPE.md), [asset ledger](../assets/LEDGER.md), [campaign ledger](../docs/MAP-CAMPAIGN-LEDGER.md).

## Verification performed and limits

- Reconciled all ten gameplay bundles, 42 concept matches, 37 terrain contracts, 32 panorama contracts, 36 packs and 196 body files. Checked all declared landmark sources, hashes, triangles and terrain/pack mount-record identity.
- Ran the existing GLB guard against all 412 manifest-selected assets. Retained its per-file metrics and grandfathered violations.
- Installed the lockfile dependencies locally with `npm ci --ignore-scripts --no-audit --no-fund`. Served this exact checkout on scratch port 5267; `resolveBase` verified the listener's working directory.
- Ran **84 fresh map boots**: 42 at 1280×800 and 42 with 390×844 mobile emulation, full tier, debug selection, fixed seed, waves disabled. All selected the requested map; no captured console/page errors. Three intentional no-sculpt routes emit demotion warnings; the retained warning lists also include a `THREE.Clock` deprecation.
- Ran 32 additional distinct-sculpt sessions and captured **171 body-side views** using the existing dossier's debug teleport method. This is visual inspection, not pathfinding/collision proof. All sessions completed without captured console/page errors.
- Inspected all ten concept/spawn sheets and all ten landmark sheets. Full individual images are retained in the catalog. Small contact-sheet inspection does not verify every texture seam, rear surface or ground contact.
- These are short dev-mode sessions, not release-build, normal unlock/progression, complete-map traversal, long-run performance, actual-phone GPU, or exhaustive town-era/Charter Press story-state tests. No blend regeneration, compressed build or animation gates were run. Town/prop/finale binaries were inventoried and structurally checked where covered by the manifest; this is not a fresh visual verdict for every town variant.

The initial desktop probe's `status: mounted` label meant the loader finished, not that every requested landmark appeared. Its original JSON is retained unaltered. Use its expected/actual/skipped fields; the later mobile/station probe explicitly labels the three incomplete sets. The report and catalog show **0/4**, not a false pass.

## Next work, in order

1. Fix and gate Deepwater's exact four ruin mounts across all three consumers.
2. Reconcile the five early packs with the accepted current binaries and reproducible recipes.
3. Record whether the five alias-map body packs are intentionally dormant or should supply distinct dressing while keeping the approved shared terrain.
4. Review one map at a time for concept fidelity, starting with The Fairground, the E5 sea maps, and the low-readability E3 views. Use existing bodies and capture whole-map composition before commissioning new art.
5. Review town-era and finale presentation separately using the linked 82-model inventory, then pay down the existing texture/extras baseline in scoped slices.

**READY-FOR-GATES — inventory/report only.** No implementation or owner art verdict is claimed.


## 2026-09-09 clarification — Fairground procedural centerpiece

F-MAPART-4 reports absence from the five-body GLB pack, not absence from the game. Current desktop/mobile controlled renders verify the existing procedural FerrisWheel (one wheel, eight cabins, active 24 W), implemented in `src/entities/FerrisWheel.ts`. Evidence: `artifacts/map-art-repairs-20260908/fairground-presence-01/`. Do not commission a duplicate wheel from the GLB inventory alone. Native presentation, objective and animation acceptance remain separate; debug mobile overlays obscure the captured wheel. Original inventory counts remain historical.


## Current census142 — after Ember fixture integration139

Reconciled from the current working tree; detailed machine-readable inventory: `artifacts/map-art-repairs-20260908/current-inventory-142/inventory.json`. No missing source files, mismatched landmark hashes, or conflicting mount records.

| Inventory | Count |
|---|---:|
| Map contracts | 42 |
| Map concept plates | 42 |
| Renderer routes | 39 |
| Terrain contracts | 37 |
| Terrain GLBs | 32 |
| Panorama GLBs | 32 |
| Landmark packs | 37 |
| Landmark records and GLBs | 197 |
| Selected pack bodies | 172 |
| Dormant pack bodies | 25 |
| Distinct referenced mount files, including external Deepwater | 176 |
| Derived landmark records | 108 |
| Reused landmark records | 77 |
| New-build landmark records | 12 |

Source artwork groups (filename-based categories, not a claim of exhaustive or mutually exclusive coverage): map concept plates: 42, era and valley kits: 17, building art: 72, terrain art: 26, prop and landmark art: 25, era building plates: 16, E10 place and object plates: 5, town concepts and kits: 3, object material atlases: 8.

The 417-model guard has seven grandfathered violations, zero live violations and no stale baseline entries. These are asset integrity results; per-map objective, persistence and concept fidelity remain separately tracked in current-map-readiness.md and readiness.json.


## Current census163 — factory and source reconciliation

Fresh `artifacts/map-art-repairs-20260908/current-inventory-163/inventory.json` and adjacent `glb-audit.json` retain42 maps/plates,39 renderer routes,37 terrain contracts,32 terrain GLBs/panoramas,37 landmark packs and197 landmark records/files.172 pack bodies are mounted and25 remain dormant;176 distinct mount files include external Deepwater bodies. Source tiers108 derive,77 reuse,12 build-new. All417 production GLBs reconcile;7 existing grandfathered violations,0 live violations,0 stale waivers. Source-file/hash/mount disagreements:0.

Filename groups additionally identify2 dedicated ground/floor material sources (Archive and Ember), alongside8 object material atlases. These are artwork counts, not accepted-runtime or concept-fidelity verdicts. Counts by filename group are not an exhaustive partition. Ember's latest ground source and all titan/terrain/panorama candidates remain unaccepted unless their separate readiness evidence says otherwise.

### Showroom follow-up171 (2026-09-10)

The inventory distinguishes existing files from required missing content: five display-home rectangles and six catalog-goods anchors have preview-only helper geometry in `build_e6_extra_terrains.py:add_showroom_preview`; the terrain contract explicitly lists them under `runtimeVisualsAbsent`. The five mounted peripheral landmarks are separate objects and deliberately remain outside those house rectangles. The concept shows furnished open display houses, while the playable map has no matching bodies. Existing counts stay197 landmark bodies and417 production GLBs. Exact missing IDs/positions are in `artifacts/map-art-repairs-20260908/showroom-persistence-171/missing-art.json`.

Showroom desktop170 passes20 waves/600s,89captures,bank/reload and board return; full mobile and visual acceptance remain open. Source171 repairs the run-local capture counter across new saves and shared snapshot hashes, following an explicit additive-v2 compatibility contract. Legacy saves without the lost counter remain readable at zero; the cross-run pen cannot reconstruct it.
