# SOL 3D-B — Hero-in-3D Blender decision proof, Iteration 2

**Status:** READY-FOR-GATES

**Verdict:** **KEEP THE HERO AND CAST 2D OVER 3D BUILDINGS (HD-2D).** Iteration 2 exhausted the supplied high-resolution route: the face is now present, the actual paintings are baked into one unlit atlas, parchment leakage is eliminated, and the Seedance gait phases are represented. The equal-size game-camera comparison still favors the authored 2D sprite decisively. This is a successful decision proof, not a request for another automatic pass.

## Slice identity

| Field | Value |
|---|---|
| Slice | SOL Session 3D-B — THE HERO only |
| Branch | `sol/hero-3d-proof` |
| Fresh-cut base | `d1d301331058a6347a6e567081d9f6928dfa7d1b` |
| Latest fetched `origin/main` | `1daea09e6690f33a5920a27eb1333cfc23b5fb01` — 15 commits ahead at final fetch |
| Territory | `assets/pilots/hero-3d/*`, this findings file |
| Integration | Attended session merges; this session does not rebase onto moving `main` or self-merge |

No `src/`, layer-contract, e2e, spec, STATUS, BACKLOG, LEDGER, 3D-A, or `assets/pilots/tavern-3d/*` path changed.

## Delivered proof

| Artifact | Purpose |
|---|---|
| `assets/pilots/hero-3d/hero-3d.blend` | Packed Blender 5.1.2 source: mesh, 16-bone rig, walk action, high-resolution reference planes, atlas, and judgment scene |
| `assets/pilots/hero-3d/hero-3d.glb` | One-mesh skinned GLB with one embedded 4096×2048 texture and one walk action |
| `assets/pilots/hero-3d/hero-painted-atlas.png` | Single painterly bake assembled from the high-resolution v4 turnaround plus the supplied `codex-hero-e1` portrait |
| `assets/pilots/hero-3d/judgment-idle.png` | 2D-versus-3D idle judgment at the game camera |
| `assets/pilots/hero-3d/judgment-mid-stride.png` | Corresponding mid-stride judgment |
| `assets/pilots/hero-3d/walk-cycle-frame-strip.png` | Eight distinct Seedance-referenced gait poses |
| `assets/pilots/hero-3d/hero-turntable.png` | Front/right/back/left close-view material, silhouette, and gear proof |

## Iteration 2 reference upgrade

Iteration 1's processed sprite-cell input was replaced, not merely enlarged:

- Orthographic proportion and gear truth: `assets/raw/turn-hero-v4-belt-pan.png`, the QA-passed four-view v4. The `.blend` contains locked `REF_V4_FRONT`, `REF_V4_LEFT`, `REF_V4_RIGHT`, and `REF_V4_BACK` planes sourced from that 1672×941 painting.
- Face and front detail: `assets/raw/codex-hero-e1.png`. Its large portrait was fitted directly to the frontal head islands using the actual eye, nose, mouth, and chin landmarks. Eyes, brows, nose, mouth, freckles, hairline, collar, and expression now survive the close render.
- Motion: `assets/motion-pilot/production-hero-v3/videos/*` and the extracted right/down contact sheets. Only body timing was copied because those videos still show a hand-held pan; current canon requires the pan belt-hung at anatomical RIGHT with both hands free.
- Material: the four foreground figures and portrait were alpha-extracted, edge-dilated, and packed into one 4096×2048 atlas. UVs map connected mesh components into contiguous painted runs. The material is unlit emission: source hatching and painted AO/form remain in color, with zero metallic, specular, or glossy response.

The foreground-projection validation hit original painted pixels on **6,378 / 6,456 UV loops (98.79%)**. The remaining edge samples read edge-dilated paint, not parchment. This closes the Iteration 1 background-leak failure and establishes that the verdict below is not caused by using low-resolution sprite cells.

## Technical gates

| Gate | Result | Verdict |
|---|---:|---|
| Exported Hero meshes | **1** (`HeroMesh`) | PASS |
| Triangles | **3,288 / 8,000** | PASS |
| Materials | **1** (`Hero_PaintedBake`) | PASS |
| Embedded texture | **1**, PNG, **4096×2048** | PASS |
| GLB size | **3,655,664 bytes** | PASS |
| Blender source size | **6,732,035 bytes** | PASS |
| Armatures / bones | **1 / 16** | PASS |
| Animation | `Hero_Walk_8_Seedance`, **0.500 s** | PASS |
| Walk keys | **8 distinct poses + frame-8 closure**, 16 fps | PASS |
| Exported cameras / lights | **0 / 0** | PASS |

Direct GLB JSON inspection reported:

```text
mesh_count=1 mesh=HeroMesh triangles=3288 materials=1
image=hero-painted-atlas image/png animation=Hero_Walk_8_Seedance
cameras=0 glTF_version=2
```

A clean Blender import also recovered the 16-bone armature, 0.500-second action, embedded 4096×2048 image, and 3,288-triangle `HeroMesh`.

## Canon and silhouette gates

| Requirement | Evidence | Verdict |
|---|---|---|
| Present stylized face | High-resolution portrait landmarks fitted to dedicated face, nose, mouth, and eye geometry | PASS |
| Brimmed hat | Separate crown, band, and broad brim | PASS inventory; FAIL exact sprite proportion |
| Tan coat | Modeled torso, sleeves, lapels, belt, and split tails with painted coat detail | PASS inventory; FAIL close-view cohesion |
| Satchel LEFT | Bag at anatomical `-X`, cross-body strap | PASS |
| Teal charm | Dedicated cage and glass islands, mapped to the portrait's painted teal charm | PASS |
| Pan RIGHT hip | Belt-hung bowl/rim/handle at anatomical `+X`; both hand bones free | PASS |
| Braid / hair | Modeled and painted front/side/back | PASS close; weak at game size |
| One coherent Hero silhouette | All anchors are present, but hat/props are bulky, forearms tangle with the torso, and side views collapse paper-thin | FAIL adoption |

## Judgment calibration

- Perspective vertical FOV: 42°.
- Three.js camera offset `(0, 26.2, 18.3)` mapped to Blender `(0, 18.3, 26.2)` with Z-up; look target `(0, -3.35, 0.45)`.
- Both images were rendered at 3840×2160 and center-cropped without resizing.
- The comparison locks opaque/projected **height**, the stable runtime sizing axis. It does not force width: a true 3D brim, shoulders, pan, and satchel have depth and therefore a larger camera footprint than a billboard.

| Judgment | 2D opaque height | 3D projected height | Delta |
|---|---:|---:|---:|
| Idle | 145.20 px | 145.20 px | **0.00 px** |
| Mid-stride | 154.11 px | 154.11 px | **0.00 px** |

Independent screenshot telemetry estimated the 3D footprint at roughly 95–98 px wide versus 63–67 px for the same-height sprite. Scaling the mesh down to match width would make its face and legs smaller and would evade rather than answer the silhouette question.

## Findings

### F-3DB-1 — BLOCKING ADOPTION — high-resolution painting cannot hide the disconnected low-poly construction

The upgrade succeeds on the face: it is specific, readable, and recognizably based on the supplied portrait. Across the body, the same source paintings expose the mesh's construction. Sleeves, boots, brim, coat panels, pan, and satchel show stretching, banding, discontinuous line direction, and abrupt value changes at component seams. At close range the result reads as painted cut-out parts, not one illustrated woman wrapped around a coherent form.

This is no longer a missing-resolution problem. The proof uses the full-resolution inputs, one edge-safe atlas, component-aware UVs, and no glossy shader. Closing the remaining gap requires a new sculpt/retopology and a hand-authored character UV paint pass, not another automatic projection tweak.

### F-3DB-2 — BLOCKING ADOPTION — the true 3D silhouette is less legible than the authored billboard

At equal projected height the mesh's hat, gear, shoulders, and arm volume make it much wider, while its side view becomes extremely thin. The game camera also looks down onto the brim and compresses the torso/legs. The sprite intentionally cheats all of this: it keeps the face, coat, leg separation, and signature props readable to the camera. Every named item exists in 3D, but the combined silhouette is not exact and is slower to parse.

### F-3DB-3 — BLOCKING ADOPTION — eight key poses do not produce her convincing weight transfer

The walk has eight distinct alternating contact/passing poses, a longer Seedance-style stride, visible lateral root shift, hip counter-rotation, and a quieter/wider anatomical-right arm guarding the belt pan. The still strip nevertheless reads as legs exchanging beneath a comparatively locked torso, hat, and gear mass. It is materially better than Iteration 1's near-static bob, but it does not preserve the natural, grounded gait visible in the Seedance source.

A production-quality result would need rig deformation, planted-foot cleanup, shoulder/torso counter-motion, braid/coat/satchel overlap, and pan secondary motion. Those are a character-animation production pass, not evidence that the current 3D replacement is ready.

### F-3DB-4 — STRUCTURAL — the fixed camera rewards 2D face cheats

The 2D sprite always presents its authored face and torso because it billboards. The real model foreshortens under the same 42° camera and loses face/leg area behind the brim and upper body. Tilting, enlarging, or turning components toward camera can improve a single shot, but each cheat moves the model away from the supplied orthographic turnaround. Under this camera, HD-2D is not a consolation; it is the stronger rendering strategy.

### F-3DB-5 — SOURCE DEBT — motion references and current pan canon still disagree

The Seedance/right/down sources carry or swing the pan in a hand. Current lore and the v4 turnaround require it belt-hung on anatomical RIGHT, satchel LEFT, both hands free. The proof follows current canon and uses the videos only for gait timing. A future 2D motion regeneration should resolve that source contradiction so animation and gear truth no longer need to be separated manually.

## Independent visual gate

A fresh unprimed reviewer returned **FAIL — keep the painterly 2D sprite**:

- face present: pass;
- all named gear present and correctly sided: pass inventory;
- painterly cohesion: fail because the smooth portrait and stretched amber body do not form one surface language;
- exact silhouette: fail because the hat/props are oversized, arms merge into the torso, and side views are paper-thin;
- equal height: pass, but width footprint is not equal;
- weighted gait: fail because pelvis/torso/hat/props remain too locked;
- close texture: fail due visible UV stretching, banding, boot smears, and discontinuities.

## Decision

**Keep the Hero and cast as 2D billboards over 3D buildings. Do not batch another character from this proof.**

Iteration 2 establishes both sides of the decision honestly:

1. Blender can deliver a technically small, valid, rigged Hero GLB with exact canon inventory, a recognizable high-resolution face, one baked material, and an eight-pose action.
2. Even after raising the source ceiling, the equal-size game-camera result loses painterly cohesion, silhouette clarity, and grounded motion relative to the existing sprite.

Retain the `.blend`, `.glb`, atlas, and renders as the evidence artifact. Revisit full 3D characters only if the project deliberately funds a bespoke sculpt/retopo, hand-painted UV set, deformation rig, and animation pass—or changes the camera/visual language enough for real character volume to earn its cost.

## Provider and merge classification

| Item | Used | Reason |
|---|---|---|
| Local Blender 5.1.2 | YES | Owner requested a Blender-authored full poly proof |
| Tripo or external 3D provider | NO | Exact source/canon control was the experiment; no provider credentials were available or needed |
| Native image generation | NO | Existing high-resolution owner art was used directly; no new still art was generated |

- Granted paths only: `assets/pilots/hero-3d/*`, `reviews/sol-3d-b-findings.md`.
- Classification: additive render/model decision proof; no code, sim, registry, test, or 3D-A merge surface.
- `origin/main` moved 15 commits after branch cut; no rebase was attempted because the attended session owns integration and the granted paths are isolated.
