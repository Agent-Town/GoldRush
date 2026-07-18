# SOL 3D-C Craftbook

The last commission records how the landmark campaign actually worked. This file is append-only by session: 3D-C-ALPHA authors this first half; 3D-C-BETA appends its half without rewriting ALPHA's account.

## 3D-C-ALPHA — the new eras and County Relief

Base: `ea75202bb4c8903dc3041695c6aa3ce790c60f6d` · 2026-07-18

### 1. The numbers

| Measure | ALPHA authored | Winning on current main |
| --- | ---: | ---: |
| Landmark packs | 24 | 22 |
| Production landmark GLBs | 135 | 125 |
| Source tier: reuse | 48 | 43 |
| Source tier: derive | 87 | 82 |
| Source tier: build-new | 0 | 0 |
| Aggregate triangles | 117,820 | 106,348 |
| Triangle range per body | 156–2,592 | 156–2,592 |

The 24 authored packs were Regatta plus 18 E6–E10 maps, then five County Relief maps. Fairground and Dust Flats were valid five-body deliveries but were superseded at the attended drain by BETA's coherent county arc. ALPHA's winning share is therefore 22 of the program's 29 packs and 125 of its 160 mounted bodies. Every authored body stayed below the 3,000-triangle ceiling, used one mesh/primitive/material/image, and passed byte-identical re-export at delivery. Every pack used one shared 1024² atlas; the allowed 2048² ceiling was never needed.

### 2. The craft

The source ladder is an economic rule, not a virtue ranking:

1. **Reuse paid when an existing body already carried the right job and silhouette.** Import it, remap it to the pack atlas, preserve the useful proportions, and spend new triangles only on the map-specific read. Regatta's course furniture and Long Road's station/railhead vocabulary are the clearest wins. Reuse does not mean an unchanged copy; it means the expensive identity already exists.
2. **Derive paid when the era vocabulary existed but the exact landmark did not.** Combine shipped bodies, plates, and primitive construction into one new silhouette. This was ALPHA's normal case: 87 of 135 bodies. It kept the world coherent while allowing a seed vault, relay array, debris catcher, oil rig, or motor caravan to own a specific story role.
3. **Build-new pays only when neither rung can survive the run camera.** ALPHA paid this cost zero times. By E6 the project already had enough buildings, era props, boss parts, and construction grammar to derive every required body. Adding a new source family would have duplicated the world rather than enriched it.

The practical discipline was simple:

- Paint the atlas once per pack, then force every imported and derived part through that one material. Palette unity is cheaper and more legible than individually clever textures.
- Spend triangles on silhouette, support, and contact. Hidden tessellation, tiny fasteners, and detail below gameplay-pixel size are the first cuts. The median ALPHA body was 740 triangles.
- Treat the `.blend` as a reproducible authoring artifact. A GLB was not done until reopening the saved blend and exporting again produced the same bytes and the semantic verifier still found one material, no lights/cameras/animation, a base-centred origin, and the expected bounds.
- Render the locked camera, overview, four angles, and clearance truth from the same build. A numerical pass without a readable board is not evidence.

A pack took about nine minutes when the IDs and mounts were already published, the source parts existed, the per-map recipe was data-only, and the first mounted render read correctly. It took nearer ninety when composition was still open, a shared builder needed extension, the run camera erased the intended differences, or the evidence itself lied. Gusher County needed several blind revisions before four rig families, the camp, the outhouse, and complete crossed AABBs all read. Long Road was mechanically green while four clearance crosses were hidden by their own models; lifting the evidence-only AABB curves above the tallest body fixed the proof without touching a mount.

### 3. The ID contract

An ID is the handshake between composition and production. It names the landmark's story job, not its current mesh: `convoy-lead-hauler-start` survives a model replacement better than `wagon-01`.

There were two legal flows:

- **Bodies first:** when a merged sculpt had no mounts, ALPHA proposed the complete semantic ID list, built base-centred bodies, and left the terrain contract untouched. The pack declared the mount interlock pending; 3D-D later supplied canonical positions, rotations, scales, and asset paths.
- **Mounts first:** when terrain records already contained IDs with empty `asset` fields, ALPHA consumed those IDs exactly, built straight to them, and filled only the asset seam plus pack metadata. Position, rotation, scale, order, mask truth, terrain, and simulation remained byte-for-byte source truth.

The gate is set equality plus transform identity, not “the count looks right.” Base-centred origins matter because the mount owns placement and `Terrain.visualY` owns visual height. Preview composition is useful evidence, but it never silently becomes canonical placement.

The interlock taught one durable division of authority: the terrain session owns **where**; the body session owns **what**; the shared ID owns the join. Parallel work stayed safe whenever that sentence remained literally true.

### 4. The collision

Fairground and Dust Flats were double-built because the territory split changed while BETA's continuous loop was already in flight. ALPHA received a valid new assignment and started both maps; BETA continued a previously valid coherent county arc. Different branch prefixes prevented Git confusion but could not prevent duplicate intent. The drain chose BETA's pair and archived ALPHA's work. That was a coordination fault, not a modeling fault.

**Factory law — claim before build:** every map row in the campaign ledger must carry one main-merged `landmarkOwner` and `landmarkBranch`. A session fetches main and checks that row at the wave boundary before its first write. Reassignment is not active until the ledger change lands on main; chat, a local queue edit, or a goal trim cannot revoke an in-flight claim. The attended drain clears or transfers the claim. Had that one durable signal existed, ALPHA would have skipped both maps before opening Blender.

### 5. What I would change

1. Keep the builder core stable and move each map's recipe into its own small record. Two co-agents appending map functions to one large Python file created avoidable merge arbitration.
2. Give the Foundry one scoped command: build, render, deterministic re-export, mount-identity check, and board-dimension check for one map. The components already exist; the chapter should teach the single path, not five manual invocations.
3. Run blind visual review on the first mounted frame, before polishing the turntable. Gameplay distance rejected more bad ideas than topology checks did.
4. Ship an era vocabulary index with source path, bounds, triangle count, and semantic roles. Source selection should be a lookup before it becomes an archaeology session.
5. Make complete transformed AABBs the default clearance proof. A base marker or a line hidden beneath the body proves nothing.
6. Record claims in one main-tree ledger. Do not ask branch naming, chat memory, or merge-time goodwill to solve ownership.

### 6. Recall triggers

3D-C-ALPHA is dormant after this commission. Recall it only when one of these inputs exists:

| Trigger | Required input | First action on recall |
| --- | --- | --- |
| New map | Merged sculpt plus published mounts, or an explicit mount-agnostic grant | Pull main, verify the ledger claim, read mask truth and the locked camera, then climb the source ladder before proposing IDs. |
| Era-props arc | A ratified era/site transform and the runtime manifest seam | Apply Accretion/Cadence for continuous eras or Flood Break for a rebuild; author props and anchors without stealing building, pathing, or simulation authority. |
| Owner playthrough model revision | A named GLB/path plus screenshot or precise play context | Re-render fresh references from current main, inspect all four sides and the gameplay camera, then replace the file in place with the smallest geometry or atlas correction. |

Do not recall this session for registry wiring, collision, terrain masks, particles, lighting, or speculative polish. Those have other owners. A new body without a plate, contract, or owner-observed defect waits.

**ALPHA status: READY-FOR-GATES, then DORMANT WITH HONOR.**

## 3D-C-BETA — the County Backfill

Append base: `8b20d464e2bdba4f6b850aaf544001da4646ffd5` · 2026-07-18

### 1. The numbers

| Measure | BETA delivered |
| --- | ---: |
| Landmark packs | 7 |
| Production landmark GLBs | 35 |
| Source tier: reuse | 25 |
| Source tier: derive | 10 |
| Source tier: build-new | 0 |
| Aggregate triangles | 54,216 |
| Mean triangles per body | 1,549 |
| Triangle range per body | 348–2,728 |
| Shared pack atlases | 7 × 1024² |
| IDs resolved into canonical mounts | 35 |

All seven packs won their drains. Each shipped on its own fresh-reference branch with five separate, base-centred, render-only bodies. Every body used one mesh, primitive, material, and embedded pack atlas; every source blend re-exported byte-identically and semantically identically. Pressure Garden preceded the final continuous goal; that goal recorded 6.6 million tokens and 5 hours 37 minutes for the remaining six packs.

### 2. The craft

The first authoring act was not modeling. It was reducing the sculpt and verdict boards to a short journey: water becomes pressure, stored current crosses a ridge, a migration passes between exhausted lamp yards, or a motor circuit meets a sparse service chain. That journey chose the set. A collection of individually plausible props without a map-length sentence became generic dressing.

The source ladder paid as follows:

1. **Reuse paid when a shipped family already expressed the job at run-camera distance.** Pressure Garden and Incline used reuse for all ten bodies. Existing pumps, winches, rail furniture, and steam fittings already carried the expensive identity; recomposition and one era atlas made them belong to the new sculpt.
2. **Derive paid when the parts existed but the story role needed a new silhouette.** The later five packs each used three reused and two derived bodies. Moth Season's two gates had to become a high watch cabin and a low hush barrier, not tall and short copies. Dust Flats' wrecker had to become an open salvage shed after the first version read as a gun carriage. Those were production-geometry changes, not lighting fixes.
3. **Build-new never paid in this territory.** The county already had enough structural and era vocabulary. Zero build-new bodies is evidence that the library covered the brief, not a target future packs must imitate.

The 3,000-triangle ceiling was generous. The useful spend was broad silhouette, visible support, and ground contact; tiny fittings hidden by the locked camera were waste. A single 1024² atlas per pack was sufficient in every case. Palette and value grouping did more for era identity than doubling texture resolution.

Byte-identical re-export worked only when treated as an authoring method: edit the recipe, regenerate the blend and GLBs, reopen the saved blend, and export again. Never repair the delivered GLB by hand. Deterministic naming, object order, atlas packing, and export settings then make the gate routine instead of ceremonial.

The fast pack had an authoritative mask source, reusable body families, an established board path, and five silhouettes that read on the first locked-camera render. The slow pack made the evidence earn trust. Incline exposed missing rail context and hand-copied bounds. Fairground exposed a generic renderer inventing water on a dry map and preview bodies crossing spawn lines. Dust Flats exposed a stale-able clearance report, an incorrect spawn proxy, and a clipped turntable. The model was rarely the ninety-minute problem; ambiguous authority and dishonest proof were.

### 3. The ID contract

BETA exercised the bodies-first half of the interlock seven times. Each pack published five ordered semantic IDs before body construction, then delivered `mounts: []` with `mountInterlock: pending-3d-d`. The ID described the map role well enough for 3D-D to compose it without depending on BETA's preview transform.

3D-D's mount sweeps consumed all 35 IDs; the final sweep closed the last five BETA packs. Current main holds five canonical terrain-owned mount records per BETA pack and marks each interlock `resolved-3d-d`; the body assets did not need to change. That is the success condition: terrain can revise position, rotation, scale, and grounding without reopening body production, while a model can be replaced in place without renaming the terrain's story role.

The boundary is literal:

- terrain owns masks, coordinates, transforms, visual height, and placement truth;
- the pack owns geometry, atlas, bounds, and source provenance;
- the ID joins them;
- evidence-only transforms and lights own nothing.

BETA did not exercise the mounts-first flow in this arc and should not claim otherwise. For future mounts-first work, consume the published IDs exactly and fill the asset seam without rewriting transform or mask truth.

### 4. The collision

From BETA's side, Fairground and Dust Flats remained inside a direct owner goal covering E2–E5. A later main commit reassigned them while the continuous loop was already active. Pulling fresh main refreshed sculpts and boards, but it did not cancel or replace the session's live grant. BETA therefore followed the direct instruction, disclosed the overlap in both handoffs, and never touched ALPHA's worktree. Both sessions acted on valid but different authority snapshots.

ALPHA's durable `landmarkOwner` and `landmarkBranch` row would have prevented the initial double claim. BETA adds one necessary transfer rule: **a reassignment is inactive until the current claimant acknowledges release or its active goal is explicitly cancelled.** Give every claim a revision. A wave starts only when its task names the current revision; a transfer increments it; the old claimant must stop at the next boundary before the new claimant writes bodies. The drain rejects two live claims rather than choosing after both packs exist.

Fresh reference and fresh authority are separate checks. Pulling the latest files cannot be treated as proof that an older task grant was revoked.

### 5. What I would change

1. Put map ownership, branch, claim revision, and release state in one main-tree ledger. Make branch creation fail when the map already has a live claimant.
2. Make map facts declarative inputs to the shared board path. Dryness, authoritative mask source, spawn form, and reserved fixtures should never be guessed by a generic renderer.
3. Recompute clearance from current mask truth, preview transforms, and exported GLB bounds during verification. A stored positive report or hash alone is not a gate.
4. Run one cheap unprimed review on the locked-camera frame and neutral four-angle lineup before producing the full evidence suite. Fix collapsed silhouettes in geometry; do not brighten them into false readability.
5. Run independent code review after the final rerender, then allow one narrow correction review. Recursive reviews and pre-rerender manifests spend time without increasing confidence.
6. Keep preview placement explicitly non-canonical in contracts and handoffs. Render bodies must never acquire collision, pathing, light, spawn, or damage authority by implication.

### 6. Recall triggers

3D-C-BETA is dormant after this commission. Recall it only for:

| Trigger | Required input | First action on recall |
| --- | --- | --- |
| New map | Merged sculpt and mask truth, plus either published mounts or an explicit mount-agnostic grant | Pull main, verify the current claim revision, read the sculpt and boards, reduce the map to one journey, then publish or consume the ID set before modeling. |
| Era-props arc | Ratified era vocabulary and a named prop-manifest seam | Search the shipped source library first, apply the era's cadence/accretion law, and add only the silhouettes the run camera can read. |
| Owner playthrough model revision | Named body plus screenshot or precise camera context | Re-render from current main, change the smallest recipe-owned geometry or atlas surface that fixes the read, then repeat deterministic export and the scoped boards. |

Do not recall BETA for mount-only adjustments, terrain masks, collision, lighting, particles, simulation behavior, or speculative polish. Those remain with terrain/runtime owners or wait for owner evidence.

**BETA status: READY-FOR-GATES, then DORMANT WITH HONOR.**
