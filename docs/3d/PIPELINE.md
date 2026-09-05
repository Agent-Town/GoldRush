# The 3D asset pipeline — one page

Status: LIVE, 2026-09-05. Written for task `glb-export-contract-and-validator` against Astra
F-ASTRA-7 and F-ASTRA-8 (`docs/reviews/2026-09-05-astra-3d-review.md:114`, `:137`).
Craft notes live in `docs/SOL-3D-C-CRAFTBOOK.md` and `docs/SOL-3D-D-CRAFTBOOK.md`; this page is the
mechanism.

## 1. The pinned toolchain

| Thing | Pin | Where |
| --- | --- | --- |
| Blender | **5.1.2** (`ec6e62d40fa9`, built 2026-05-19) | `/Applications/Blender.app/Contents/MacOS/Blender`, override with `BLENDER=` |
| glTF exporter | Khronos glTF Blender I/O **v5.1.20** (ships with that Blender) | recorded in every GLB's `asset.generator` |
| Node | 26 (`/opt/homebrew/bin/node`) | the guard and `test:node-guards` |

`asset.generator` is the audit trail: an asset re-exported on a different Blender says so in its own
bytes. If it disagrees with the row above, the re-export was done on an unpinned machine.

## 2. Three reproducibility checks — and the order they fail in

F-ASTRA-7: *"Success at the first does not prove the second."* They are separate claims, so name
which one you ran.

**Check 1 — re-export a saved `.blend`.** `bash scripts/reexport-pilot.sh <path>.blend`. Cheap,
runs in seconds, proves the export profile. Set `REEXPORT_OUT_DIR=<dir>` to write the GLB into a
scratch directory instead of over the production file — that is how the profile proof is taken
without touching a shipped binary.

*Measured 2026-09-05:* `the-claim-terrain.blend` re-exports **byte-identical** to the shipped
`the-claim-terrain.glb` (sha256 `e240e7eb…`) under the `terrain` profile. Under the old profile-less
recipe it did not (`d5e4ead7…`), because all ten extras were dropped.

**Check 2 — regenerate the `.blend` from its builder and inputs.** `assets/pilots/map-rebuild-spike/build_*.py`
under Blender. Expensive, and *not* guaranteed: `Terrain3dClaimPilot.ts:281-:285` records that the Twin
Banks landmark pack stopped regenerating faithfully, which is why that map is dressed at runtime.
A saved `.blend` can also have drifted from the GLB beside it — see the finding in §6.

**Check 3 — validate the compressed runtime derivative.** `npm run build` runs
`scripts/asset-diet.mjs` (meshopt + WebP per `scripts/asset-diet.manifest.json`), and
`npm run test:asset-diet` exercises the bundled result. The panoramas family opts out of position
quantization because the terrain loader validates exact authored unique-vertex counts.

## 3. Export profiles — `<blend-stem>.export.json`

`scripts/reexport-pilot.sh` reads a sidecar beside the `.blend`. **No sidecar = the pre-2026-09-05
behaviour, unchanged**, so the 268 `.blend` files without one are unaffected.

| Field | Meaning | Maps to |
| --- | --- | --- |
| `profile` | `static` · `rigged` · `terrain` — documentation; the fields below do the work | — |
| `extras` | keep Blender custom properties | `export_extras` |
| `animations` | keep actions (a rig also needs its armature in `selection`) | `export_animations` |
| `applyTransforms` | apply modifiers — **false for rigs**, or the armature modifier bakes the rest pose into the mesh | `export_apply` |
| `selection` | `"meshes+anchors"` (default) · `"all"` · an explicit `["Object", ...]` list | which objects are selected |
| `why` | one paragraph naming the evidence for this profile | read by humans, asserted by the guard's test |

Anchor empties named `steam_anchor_*`, `arc_anchor_*`, `exhaust_anchor_*` are always selected under
`meshes+anchors`; the guard shares that prefix list (`ANCHOR_PREFIXES`) and its test fails if the two
drift apart.

Cameras and lights are never exported, on any profile.

### Which profile, and why

- **terrain** (32 sidecars, `assets/pilots/map-rebuild-spike/*-terrain.export.json`) — `extras: true`.
  The GLB extras *are* a contract: `render_only`, `height_socket`, `tile_id` on every terrain, plus
  `water_mask` / `ford_mask` where the sibling `*-terrain-contract.json` declares `waterTruth`. The
  builders already export with `export_extras=True`; the sidecar makes a hand re-export match.
- **rigged** (`assets/pilots/hero-3d/hero-3d.export.json`) — `animations: true`,
  `applyTransforms: false`, and an explicit two-object `selection`. `hero-3d.blend` also contains a
  turntable floor and four reference planes; `"all"` swept them in (measured: 2 meshes, bounds ±40
  instead of ±0.57), so the rigged profile names `HeroMesh` and `HeroRig`.
- **static** — the default recipe, for a building or prop with no extras and no rig.

### The proof (headless, 2026-09-05, both profiles)

Full table and JSON in `artifacts/glb-export-contract/blender-profile-proof.{md,json}`.

| | terrain shipped | terrain LEGACY | terrain PROFILED | hero shipped | hero LEGACY | hero PROFILED |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| extras | 10 | **0** | 10 | 0 | 0 | 17 |
| animations | 0 | 0 | 0 | 1 | **0** | 1 |
| skins | 0 | 0 | 0 | 1 | **0** | 1 |
| meshes / materials | 1 / 1 | 1 / 1 | 1 / 1 | 1 / 1 | **2 / 2** | 1 / 1 |
| triangles | 32,768 | 32,768 | 32,768 | 3,288 | 3,290 | 3,288 |
| sha256 vs shipped | — | **differs** | **identical** | — | differs | differs (adds extras) |

The bolded cells are F-ASTRA-8 exactly: the profile-less helper drops the terrain's whole extras
block, and drops the hero's skin *and* its walk cycle.

## 4. The validator — `scripts/glb-contract-guard.mjs`

Node only, no Blender, ~3 s over the whole corpus. It parses each GLB's JSON chunk and decodes
POSITION from the BIN chunk.

```
node scripts/glb-contract-guard.mjs        # census table + violations, exit 1 if any are live
node --test scripts/glb-contract-guard.test.mjs
npm run test:node-guards                   # the guard's test runs here
```

**Corpus:** every `assets/pilots/**/*.glb` matching a family in `scripts/asset-diet.manifest.json` —
412 files at time of writing. A GLB in no family does not ship, so the guard does not judge it.

**Checks:** transformed world bounds (finite, and against the contract) · finite attributes ·
primitive/triangle counts · welded vertex counts · actual texture dimensions from the image header
against a per-family cap · permitted material alpha modes · named anchors where a contract declares
them · required extras per family · water/ford extras where the contract declares `waterTruth` ·
external-resource policy (buffers and images must be embedded) · **terrain grid topology**.

**The contract table is not duplicated.** `src/world/Terrain3dClaimPilot.ts` imports
`assets/pilots/map-rebuild-spike/*-contract.json` with `?raw` and enforces
`meshCount` / `triangles` / `materialCount` / `vertices` / `boundsMeters` at load
(`validTerrain:512`, `validPanorama:521`). The guard reads **the same JSON files** and reproduces
those metric definitions exactly — including the `BOUNDS_EPSILON = 0.03` from
`Terrain3dClaimPilot.ts:302` and the float32 weld the runtime does when it counts unique vertices.
All 64 contracted assets agree to the last integer.

**Terrain grid topology.** `bakeHeightGrid` (`Terrain3dClaimPilot.ts:527`) infers
`segments = round(sqrt(POSITION.count)) - 1` and throws if any lattice cell is empty or occupied
twice. F-ASTRA-10: *"applying arbitrary Blender decimation or replacing the mesh with a general LOD
will fail installation."* The guard runs that same lattice test on all 32 terrains, so a decimated
terrain reddens the board instead of a player's screen. This is also why `grid_segments` is not a
required extra — only one terrain carries it, and the topology itself is the stronger check.

## 5. The baseline — `scripts/glb-contract-guard.baseline.json`

69 violations existed when the guard landed. They are grandfathered by exact
`path::rule::detail` key so the guard can red on *new* breakage today.

| Class | Count | What paying it down means |
| --- | ---: | --- |
| `texture-over-cap` | 43 | 41 plaza props at 1024² against the 512² props cap, plus `town-plate.glb` and `salvage-claw-detail-opus5.glb` at 2048². Re-bake the atlas; do not raise the cap. |
| `missing-extra` | 26 | The 25 landmark GLBs of the five earliest packs (baron, dry-gulch, night-shift, the-claim, twin-banks) predate the extras convention the other 171 follow; `low-orbit-panorama.glb` is missing only the `panorama` flag. Re-export with the sidecar. |

**PAY DOWN BY DELETING ENTRIES, NEVER BY REGENERATING.** There is deliberately no
`--write-baseline` flag, and the guard writes no files at all — its test asserts both. The guard
*also* fails on a **stale** entry (one whose violation no longer occurs), so a fix cannot land
without deleting its line. A guard that can regenerate its own baseline reports whatever is true
today, which is not a guard.

## 6. Where each family's builder lives, and what is known-broken

| Family | Assets | Builder | Contract |
| --- | ---: | --- | --- |
| terrain | 32 | `assets/pilots/map-rebuild-spike/build_*_terrain*.py` | `*-terrain-contract.json` |
| panoramas | 32 | `build_*_panorama*.py`, `build_contract_panoramas.py` | `*-panorama-contract.json` |
| landmarks | 196 | `build_landmark_packs.py` | `landmarks/<map>/*-landmark-pack-contract.json` |
| town-buildings / era variants | 82 | `assets/pilots/schoolhouse-3d/build_schoolhouse.py`, `assets/pilots/build_town_e9_wardrobe.py` | — |
| props / rail-element | 62 | per-pilot builders under `assets/pilots/*/` | — |
| bosses / finale | 8 | per-pilot builders under `assets/pilots/*/` | — |

Per-family Blender verifiers (`verify_*.py`, 60 of them under `assets/pilots/`) still exist and still
need Blender; the node guard is the one that runs in CI.

**Known-broken, filed 2026-09-05:**

- `hero-3d.blend` does not reproduce `hero-3d.glb` (check 2 fails while check 1 passes). The saved
  file holds `HeroMesh` at 1,744 Blender vertices plus `RenderGround` and four `REF_V4_*` planes; the
  shipped GLB has one mesh at 1,734 welded vertices / 3,288 triangles. The `rigged` profile
  reproduces the shipped geometry exactly, but the shipped GLB carries no extras while a re-export
  now adds 17. Re-exporting the hero is therefore a deliberate act with a visible diff, not a no-op.
- Twin Banks landmarks no longer regenerate faithfully (`Terrain3dClaimPilot.ts:285`: "the landmark
  pack no longer regenerates faithfully"), pre-existing.
- All 412 production GLBs are double-sided (F-ASTRA-9). The guard censuses this; it does not yet
  enforce backface culling, which needs the per-mesh closed-surface verdict Astra asks for.
