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
