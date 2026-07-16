# SOL SESSION 3D-C — queue + territory (THE TOWN PLATE)
Read this first, every session start. Owner-ordered 2026-07-13 ("a Town plate to place the town on in Blender"); Fable-coordinated. Protocol: AGENTS.md §Interactive co-agent sessions.

## Identity & territory
- You are **Session 3D-C**: the TOWN GROUND PLATE — the terrain the 3D town stands on.
- Branch: `sol/town-plate`. TOUCH-ONLY: `assets/pilots/town-plate-3d/*` (.blend/.glb/renders/build scripts), `reviews/sol-3d-c-findings.md`, `artifacts/town-plate-3d/*`. When the wire seam is granted (attended will say so): ONE additive mount in the ?town3dPilot set only.
- Parallel sessions exist (3D-D map rebuilds; the factory's lanes run daily slices). NEVER write outside your territory. Read their queue files for awareness only.

## THE BRIEF
A ground plate under the town plaza: the packed-earth square, the ring road, approach paths, riverbank edge — real relief where the painting implies it (wagon ruts, the well mound, bank slopes), REPLACING the current flat painted ground WHEN the flag is on. The nine 3D buildings + props mount on top; their base-center origins sit at y=0 on your plate's surface at their townLayout positions — your plate must present a surface that makes that true (flat pads at every building slot; relief lives BETWEEN pads).

## Hard laws
1. **Coordinates are canon**: src/town/townLayout.ts positions/footprints/approach points change for NOBODY. The plate conforms to them.
2. **Actors stay planar**: the 2D cast walks at y≈0 on their loop paths — your relief along ALL walk loops + hero paths stays within ±0.05 units of 0 (the flat-walk law) so no one floats or sinks. Decorative relief goes where nobody walks.
3. Style: the plaza painting + kit plates are the texture bible — engraved warm earth, never photoreal. ONE baked material ≤2048².
4. Budgets: ≤20k tris (it is the biggest single piece in town — earned, not default), no lights/cameras, base-center origin, RECIPE.md export contract (scripts/reexport-pilot.sh must reproduce your GLB byte-identically).
5. Painted flat ground stays FOREVER as LITE tier + flag-off + load-failure fallback.

## Deliverables (one commit per wave, READY-FOR-GATES)
1. `assets/pilots/town-plate-3d/town-plate.blend` + `.glb` + build script.
2. The locked ts-04-camera A/B: painted ground vs plate, same framing, plus a walk-loop overlay render proving the flat-walk law (paths drawn on the relief).
3. Findings file: what the plate wants from the buildings (skirts? contact shadows?) — observations only, no cross-territory edits.
4. The attended session gates and merges — never self-merge, never push main.

## WAVE 1 — ACCEPTED + MERGED (attended, 2026-07-13)
Tip 2b81dd4f merged to main. Gates verified: 8,192 tris · one 2048² material · zero lights/cameras · byte-identical re-export · flat-walk 0.037/0.034/0.0001 vs the 0.05 law · owner verdict: "the foundation is good."
## WAVE 2 — DETAIL + DECORATION (owner-directed, in progress; scope expanded 2026-07-13)
Surface detail AND town decoration per the owner's direct ask, all baked into the SAME single GLB (one file, one material — the factory's wire mounts whatever lives at town-plate.glb; keep that interface).
- BUDGET RAISED for decoration: ≤30,000 tris, material may go 2048² (unchanged). Still ONE mesh-tree, ONE material, zero lights/cameras, byte-identical re-export.
- DECOR VOCABULARY (era-1 frontier, painted-warm): barrels, crates, sacks, hitching posts, rope coils, buckets, lantern posts (unlit geometry — light belongs to the rig), a notice-board, planks, small planters, laundry line between buildings ONLY if it clears actor heads. Signage stays PICTOGRAM-ONLY (zero readable letters — house law).
- EXCLUSIONS (already shipped separately — do NOT model): the covered wagons, the water trough, the Pan Monument (plaza-props pilot owns them), all nine buildings (their GLBs mount on your flat pads), the townsfolk.
- PLACEMENT LAWS: building pads stay FLAT and CLEAR (nothing on them, nothing overhanging them); walk loops + approach paths stay clear and ≤0.05 relief (decor lives between the paths — the cast must never visually clip a barrel); the plaza CENTER ring stays open (it is the town's stage).
- Deliver the same way: READY-FOR-GATES + tip; the attended session gates (tri/material/re-export + pad-flatness + loop-clearance) and merges.
NOTE: the wire seam is FACTORY-SIDE (tasks/wire-town-plate.md) — you never need src/ access; keep modeling.

## WAVE 2 — ACCEPTED + MERGED (attended, 2026-07-13)
Tip f2d9a8d8 merged. 17,596 tris / 30k · flat-walk 0.037 · clearance 3.68 · pads clear · byte-identical. Owner-visible in-game via the factory wire (mounted, gated 18/18, deployed).
**F-3DC-1 — RECLASSIFIED (owner: "I allowed it to make a modified version - I did not want to break protocol.")**: the Pan Monument replacement was OWNER-DIRECTED, not a breach. Your variant is now ADOPTED on main (props spec 6/6, deployed). Standing rule going forward unchanged: shared-asset changes ride an explicit owner/attended grant, exactly as this one did.
**Your tavern finding is accepted**: the dark side planes on the Tavern model (full-wrap repair) — logged for session 3D-A / the factory. Good catch, correctly reported not fixed.
## WAVE 3 — THE TAVERN FULL-WRAP REPAIR (granted 2026-07-13; owner: "it is waiting for work")
Your own wave-2 finding becomes your assignment: the Tavern model's unfinished dark side planes. TERRITORY EXTENSION for this wave only: `assets/pilots/tavern-3d/*` (the .blend/.glb + renders). THE JOB: bring every face of the tavern to full-wrap standard — sides/back/roof textured as the same illustration continued around the corner (the facade painting `assets/processed/bld-tavern.png` is the style bible; the general-store/chapel GLBs are the quality bar). CONTRACT: ≤15k tris, ONE baked material ≤1024² (2048 max if the wrap truly needs it — say so), zero lights/cameras, byte-identical re-export, same slot footprint (the mount must not move: townLayout is canon). Keep the current silhouette from the town camera — this is a REPAIR, not a redesign. Deliver: READY-FOR-GATES + tip + a 4-angle turntable + the ts-04 A/B (current vs repaired). e2e/town-tavern-blender.spec.ts must stay green (the attended session runs it at the gate).

## WAVE 3 — ACCEPTED + MERGED (attended, 2026-07-13 evening)
Tip 6929c16e merged: the tavern is full-wrap (10,864 tris, 1024² material, exact former bounds, byte-identical re-export; tavern+plate battery 10/10 at the gate). The set's oldest model now matches its youngest. NO WAVE 4 QUEUED — awaiting owner direction.

## WAVE 3.1 POLISH — ACCEPTED + MERGED + DEPLOYED (attended, 2026-07-14)
Tip 2587c0b8: crest rear gap closed, sign straps added, lived-in asymmetry preserved (10,988 tris, contract clean, tavern suite green at the gate). **THE 3D TOWN SET IS COMPLETE AND POLISHED — all nine buildings + plate + decoration + props at full-wrap standard.** Session 3D-C's ledger closes with distinction; no further waves queued. Next Sol targets (owner's call): terrain program (3D-D's masks-first flow) or E3-era building models when the Canyon Works approaches.

## WAVE 4 — THE ARMORED RAILCAR MODEL (granted 2026-07-14; owner: "It does not really look like a real train... maybe have GPT work on it?")
The billboard train reads flat in the ¾ camera. Build the REAL one: a 3D armored locomotive GLB textured FROM the owner-loved plate (`assets/raw/plate-e2-boss-component.png` — side elevation + three damage states: wheels/boiler/cabin).
- TERRITORY: `assets/pilots/railcar-3d/*` (.blend/.glb/renders/build script) + your findings file. NO src (the factory wires it; the presentation seam exists).
- CONTRACT: ≤12k tris, ONE ≤1024² material baked from the plate (2048 if truly needed), THREE separable component zones (wheels/boiler/cabin) as named sub-meshes so damage states can swap/tint per component, base-center origin, length ≈ 3 rail-gauge units (read the rail tile spacing from a run screenshot; report the size you chose), zero lights/cameras, byte-identical re-export.
- STYLE: the plate IS the bible — riveted iron, teal portholes, cow-catcher prow; damage states = bent wheels / venting boiler / cracked cabin as swappable named nodes or morphable sub-meshes (document which).
- Deliver: READY-FOR-GATES + tip + a 4-angle turntable + an on-rail composition render at the REAL run camera angle (~top-down ¾ — check a gameplay screenshot; the side elevation must read as a TRAIN from above).

## WAVE 4 — ACCEPTED + MERGED (attended, 2026-07-14). Tip 5bee3db7: the Armored Railcar model (10,948 tris, three damage components + morphs, blind SHIP). Factory wiring + the full storybook choreography are queued (wire-railcar-3d, railcar-choreography). No wave 5 queued — awaiting owner direction (candidates: landmark packs under the mounted-landmarks ruling, E3 building models as Canyon Works approaches).

## WAVE 5 — THE DYNAMO CRAWLER MODEL (granted 2026-07-14, owner GO). Reference plate `plate-e3-boss-crawler.png` is generating (art slot) — START from the bundle text + storybook choreography (tracked chassis, DRAIN-MAST, capacitor bank; components as named sub-meshes + damage morphs, the railcar contract: ≤12k tris, ONE material, byte-identical re-export, run-camera render); TEXTURE once the plate lands (bake FROM it, the railcar way). Territory: assets/pilots/crawler-3d/*.

## WAVE 6 — TOWN CONSISTENCY AUDIT (owner-directed, in progress 2026-07-14)
Owner: inspect and fix the town houses + objects — color, inconsistencies. Contract: same per-building GLB paths (replace in place; the mounts survive), RECIPE budgets hold, tonal law ≤5% vs painted neighbors PER BUILDING, byte-identical re-exports. Deliver one wave with a per-building findings table (what was off, what changed).
## WAVE 7 — EPOCH STYLE VARIATIONS (owner-directed, NEXT)
Buildings gain era variants (the 3D descendant of the era-transform law: EDIT the base, never regenerate the identity). NAMING CONVENTION (factory contract): `assets/pilots/<building>-3d/<building>.e<N>.glb` — the base file stays E1/current; variants are siblings. Start with E2 variants of 2-3 buildings (tavern → Harbor-bound growth comes LATER eras; follow the bundle A2 transform notes per era). The factory authors the era-switching mount seam when the first variants land. Same budgets per variant.

## WAVE 6 — ACCEPTED + MERGED + DEPLOYED (attended, 2026-07-14 afternoon). Tip 76a6f591: chapel cross truly seated (the audit caught a 0.42 internal offset the earlier visual fix missed — good eyes), claim office tone corrected (4.37% — closes F-claim-tone, owner delegated it here), wagon/trough rebuilt grounded, pan roughness normalized; 11/11 byte-identical; 28/28 at the attended gate. **THUMBS UP — WAVE 7 (EPOCH VARIATIONS) IS GO** per the standing contract (.eN.glb siblings, edit-identity-forward, start with 2-3 E2 buildings for verdict before going wide).

## WAVE 7 PILOT — RETURNED FOR REVISION (attended + owner, 2026-07-14: "these don't look too different? I am not sure myself")
Tip 42607059 NOT merged. The A/Bs are near-identical at the town camera — the variants pass every correctness gate and fail the PURPOSE gate. Two laws land from this:
1. **THE ACROSS-THE-PLAZA TEST (the era-variant gate)**: an era variant must be identifiable AT GAMEPLAY CAMERA DISTANCE by someone who doesn't know which is which. If the owner squints, the player sees nothing. Every variant A/B must pass a blind "which is E2?" check at the town camera before delivery.
2. **THE BUNDLE TRANSFORM LIST IS REQUIRED CONTENT, not inspiration**: e2-steamworks-bundle §A2 SPECIFIES each building's E2 growth — tavern → saloon face: COVERED PORCH, HANGING OIL LAMPS (one teal), SWING DOORS (footprint/roofline unchanged). Build THOSE. Silhouette-adjacent additions (porches, stacks, awnings, signage rigs) are what read at distance; texture-level touches (soot, trim) are seasoning, never the meal.
Same contract otherwise (.e2.glb siblings, budgets, envelopes, byte-identical). Re-deliver the same two buildings.

## WAVE 7 SCOPE RAISED — THE ERA TOWN TRANSFORMATION (owner ruling 2026-07-14, verbatim: "I would have expected all the houses using some form of steam and the change to E2 showing in town as well, similar for the other epochs later. The player should now that a new time is starting - also visually.")
The era variant program is NOT per-building decoration — it is the town announcing the age. Phasing:
- **7a (the returned revision)**: the two pilot buildings redone to the ACROSS-THE-PLAZA TEST + bundle transform lists. Verdict gate before 7b.
- **7b (GO WIDE, after 7a passes)**: ALL NINE buildings get their E2 face per the bundle's §A2 transforms — every one visibly steam-touched (stacks, pipework, gauges, tanks — silhouette-level additions).
- **STEAM ANCHORS (new deliverable, every E2 variant)**: each .e2.glb includes NAMED EMPTY NODES `steam_anchor_1..N` at its stack/vent positions — the FACTORY mounts live steam-plume emitters there (the town breathes; models stay static). Anchor naming is the contract.
- Later eras repeat the pattern per their bundles (E3: wires/insulators/lamps + arc-flicker anchors; etc.) — one era at a time, always behind the same verdict gate.

## WAVE 7b EXTENDED — THE ACCESSORY PACK (owner ruling 2026-07-14: "also the town itself should change, not just the buildings? Accessories and so on.")
The era transformation covers the WHOLE town surface. 7b delivers, alongside the nine building faces:
- **ERA VARIANTS of existing props** (.e2.glb siblings, same convention): covered wagons gain boiler fittings/iron strapping; the water trough gains a pipe feed; fence sections may iron-cap.
- **NEW E2-ONLY ACCESSORIES** (small GLBs, ≤1k tris each, one shared 1024² atlas for the pack): coal bins, pipe runs along the ring road, gauge posts, iron lamp posts (unlit geometry — light rig owns light), a small pressure manifold near the plaza edge. PLACEMENT: propose positions in `assets/pilots/plaza-props-3d/era-props.e2.json` (id, glb, position, rotation, scale) — the factory ratifies and mounts from that manifest; walk loops and building pads stay clear (flat-walk law).
- **THE HERITAGE LAW (canon)**: the PAN MONUMENT NEVER CHANGES, in any era — like the pan itself, it is the through-line the whole saga refuses to upgrade. Let the town transform around it; the contrast IS the story.
- Steam anchors on props too where sensible (the manifold, the pipe runs).

## WAVE 7a — ACCEPTED + MERGED (attended, 2026-07-14 evening). Tip 31fc2d50: both variants pass the ACROSS-THE-PLAZA TEST (blind review identified them unlabeled); steam anchors present. **WAVE 7b + THE ACCESSORY PACK: GO** — all nine buildings' E2 faces + era props per the standing contract.

## WAVE 7b — ACCEPTED + MERGED + DEPLOYED (attended, 2026-07-14 night). Tip 3b73b2aa: all eight production buildings' E2 faces (blind-identified), steam anchors, wagon/trough variants, five accessories + the placement manifest. The ninth-building honesty (documented mismatch, no fabrication) is exactly the house standard. **THE ERA TRANSFORMATION IS ART-COMPLETE for E2** — the factory's era-switch loader mounts it all when the Steamworks is active. NEXT (owner's direction pending): E3 faces after the Canyon Works ships, or the landmark packs for 3D-D's county.

## WAVE 5 (CRAWLER MODEL) — TRANSFERRED TO 3D-D (attended, 2026-07-15; never started here, 3D-D idle-blocked — no double-delivery: this doc's grant is CLOSED). **YOUR NEXT WAVE: E3 BUILDING FACES** — Canyon Works SHIPPED, the Voltage era is real: all nine buildings + wagon/trough get `.e3.glb` siblings per e3-voltage-bundle §A2 (wires, insulator stacks, lamp arms, the schoolhouse orrery dome — silhouette-level, ACROSS-THE-PLAZA TEST applies) + `arc_anchor_*` named nodes where the era flickers (the factory mounts arc-glow emitters — the steam-anchor pattern, E3 voltage flavor) + era-props.e3.json accessories (wire runs, insulator posts, a transformer shed). Same budgets/laws as 7b. Deliver 2-3 buildings for verdict first, then wide.

## WAVE 8 E3 PILOT — ACCEPTED + MERGED + DEPLOYED (attended, 2026-07-15). Tip 41ddb5c3 (schoolhouse 98% / stamp mill 88% / tavern 70% blind recognition). **WIDE WAVE: GO** — the remaining six buildings + wagon/trough + the E3 accessory pack. RIDER: STRENGTHEN THE TAVERN's E3 read to the 7a bar (70% is above chance, below house standard — silhouette-level: lamp arms + a wire drop to the roofline per the bundle; redeliver it WITH the wide wave).

## WAVE 9 — E4 MOTOR FACES (granted 2026-07-16; the Motor era is PLAYABLE — dust-flats + Land-Yacht shipped). All buildings + wagon/trough get `.e4.glb` siblings per e4-motor-bundle §A2 (garages, fuel drums, road-sign rigs, rubber-and-brass motor trim); anchors: `exhaust_anchor_*` (the factory mounts LIGHT DUST-PUFF emitters — NEVER black smoke, the E4 style anchor law) + era-props.e4.json (fuel racks, road markers, a small filling shed). Plaza test + all standing laws. 2-3 buildings for verdict, then wide.

## WAVE 9 E4 PILOT — ACCEPTED + MERGED + DEPLOYED (2026-07-16). Motor Inn + Polytechnic (SHIP/SHIP, dust-only anchors, <1% tonal). **WIDE WAVE GO**: remaining buildings + wagon/trough + era-props.e4 per the standing contract.
