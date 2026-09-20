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
under Blender. Pin the inputs as well as the builder: current concept plates and terrain helpers can
change the result. A saved `.blend` can also have drifted from the GLB beside it — see §6.

**E1 landmark source correction, 2026-09-08.** The owner-approved replacement (`d8603c908 (archive: pruned by the A3 rewrite)`, from
`7c01afa5`) imported 25 per-body `.blend`/GLB pairs but left pre-verdict aggregate blends and body
metadata. Each pack now identifies the authoritative source as `assets[id].blend`; its root `blend`
is explicitly historical. All 25 saved sources re-export byte-identically. Full regeneration also
reproduces all 25 bytes with the original concept plates, terrain contracts and helper code,
plus the explicit metadata/export patch recorded in the reproduction proof:

```
python3 scripts/rebuild-accepted-e1-landmarks.py artifacts/e1-reproduction-new
```

The destination must be new; generation stays in scratch. The script writes the exact source
revision, input hashes and 25 comparison results to `proof.json`. Use the existing per-body blend
with `scripts/reexport-pilot.sh` for authoring. The generic `build_landmark_packs.py` now refuses its
superseded E1 recipes before writing any E1 files. Current-input regeneration is an intentional
visual update, not reproduction. Commission source-ladder assessments remain in each record;
the pack's provenance identifies the actual replacement-generation inputs.

Required landmark metadata is also present in the saved sources and retained by their export
profiles. The archived recipe is patched only to add these properties and enable extras export;
`proof.json` separates original input hashes from the patched builder hash. The metadata repair
preserves geometry and embedded texture bytes. Its source and full-regeneration proofs live in
`artifacts/map-art-repairs-20260908/e1-landmark-extras-01/` and the adjacent reproduction folder.

**Check 3 — validate the compressed runtime derivative.** `npm run build` runs
`scripts/asset-diet.mjs` (meshopt + WebP per `scripts/asset-diet.manifest.json`), and
`npm run test:asset-diet` exercises the bundled result. Delayed image consumers resolve their URL strings with
`new URL(..., import.meta.url)` while retaining the existing texture-load gates. A delayed `?url`
module shared with an eager entry table can lose its default export in the current split build;
`node --test scripts/sprite-cell-url-inlining.test.mjs` executes the actual loaders across that
boundary and deployment bases. Image probes must check decoded dimensions, since `/undefined`
can receive HTML fallback without a request or console error. The panoramas family opts out of position
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
- **static** — for an unrigged building, prop or panorama. Panorama profiles under
  `assets/pilots/map-rebuild-spike/*-panorama.export.json` explicitly keep extras: their
  render-only identity and panorama-law fields are part of the validated contract. A static
  mesh does not imply that its custom properties are disposable. Saved-source profile proofs
  live in `artifacts/map-art-repairs-20260908/panorama-profiles-01/`; these are distinct from
  full builder regeneration.

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
All 64 contracted terrain/panorama assets agree to the last integer. The guard also resolves all
196 bodies through their landmark pack records and checks SHA-256, triangle count and bounds.
Pack bounds use Blender XYZ (Blender Y is negative game Z); this conversion is separate from the
terrain contract's axis order. A silently replaced body now fails the existing guard.

The same test command checks the shared `landmark-source-ledger.json` against every shipped
pack's source declarations. Scoped landmark builds refresh this ledger from all pack contracts,
including packs authored by other builders; a builder's recipe list is not the estate inventory.

**Terrain grid topology.** `bakeHeightGrid` (`Terrain3dClaimPilot.ts:527`) infers
`segments = round(sqrt(POSITION.count)) - 1` and throws if any lattice cell is empty or occupied
twice. F-ASTRA-10: *"applying arbitrary Blender decimation or replacing the mesh with a general LOD
will fail installation."* The guard runs that same lattice test on all 32 terrains, so a decimated
terrain reddens the board instead of a player's screen. This is also why `grid_segments` is not a
required extra — only one terrain carries it, and the topology itself is the stronger check.

## 5. The baseline — `scripts/glb-contract-guard.baseline.json`

69 violations existed when the guard landed. They are grandfathered by exact
`path::rule::detail` key so the guard can red on *new* breakage today.

Read the current exact exceptions from the baseline file and the guard output. The dated
map-repair inventory records progress separately from the original 69-exception snapshot;
passing with a baseline is not acceptance of those remaining assets.

For prop atlases, retain the authored 1024px master and embed the existing 512px prop tier.
The shared `build_era_props_e2.py` material loader performs that reduction before packing.
The E8/E9/E10 verifiers record both the master hash and the derived embedded-image hash,
then require each body's image to match the derivative. Geometry, placement, material and
saved-source export checks still apply. The map-repair receipt under
`artifacts/map-art-repairs-20260908/prop-textures-01/` separates saved-source export,
master-to-embedded derivation and compressed runtime checks; it does not claim full recipe regeneration.

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
| landmarks | 196 | per-body `.blend` + pinned E1 recipe for 25 accepted E1 bodies; `build_landmark_packs.py` for later packs | `landmarks/<map>/*-landmark-pack-contract.json` |
| town-buildings / era variants | 82 | `assets/pilots/schoolhouse-3d/build_schoolhouse.py`, `assets/pilots/build_town_e9_wardrobe.py` | — |
| props / rail-element | 63 | per-pilot builders under `assets/pilots/*/` | — |
| bosses / finale | 8 | per-pilot builders under `assets/pilots/*/` | — |

Per-family Blender verifiers (`verify_*.py`, 60 of them under `assets/pilots/`) still exist and still
need Blender; the node guard is the one that runs in CI.

**Known-broken, filed 2026-09-05:**

- `hero-3d.blend` does not reproduce `hero-3d.glb` (check 2 fails while check 1 passes). The saved
  file holds `HeroMesh` at 1,744 Blender vertices plus `RenderGround` and four `REF_V4_*` planes; the
  shipped GLB has one mesh at 1,734 welded vertices / 3,288 triangles. The `rigged` profile
  reproduces the shipped geometry exactly, but the shipped GLB carries no extras while a re-export
  now adds 17. Re-exporting the hero is therefore a deliberate act with a visible diff, not a no-op.
- The generic Twin Banks landmark recipe predates the owner-approved replacements. The pinned
  recipe above resolves reproduction; substituting today's plates/helpers does not reproduce
  accepted bytes. `verify_landmark_packs.py` now follows the current source ledger and each
  replacement body's declared scene/profile, preserving approved origins and metadata. It checks
  exact saved-source exports across all declared packs; this does not replace the pinned full-recipe
  proof or current visual review. Use `-- --output <fresh-directory>` after Blender's script argument.
  Add `--historical-boards` only when explicitly checking the original screenshot inventory.
- All 412 production GLBs are double-sided (F-ASTRA-9). The guard censuses this; it does not yet
  enforce backface culling, which needs the per-mesh closed-surface verdict Astra asks for.
