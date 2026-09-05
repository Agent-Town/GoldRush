#!/usr/bin/env bash
# Re-export a 3D pilot .blend → .glb with the RECIPE.md contract settings.
# Usage: bash scripts/reexport-pilot.sh assets/pilots/chapel-3d/chapel.blend
# For owner hand-edits: edit the .blend in Blender, save, run this, refresh the game.
#
# EXPORT PROFILES (Astra F-ASTRA-8, docs/reviews/2026-09-05-astra-3d-review.md:137): this helper
# used to impose ONE recipe on every family — no `export_extras`, `export_animations=False` always —
# which silently strips what two families depend on. The Claim terrain carries extras
# (`height_socket`, `grid_segments`, water/ford metadata) that its own builder exports on purpose;
# the hero carries a skin and a walk cycle. Running the old helper over either was a quiet
# downgrade that nothing caught.
#
# So: if `<blend-stem>.export.json` exists beside the .blend, its fields override the defaults.
#   profile         static | rigged | terrain   (documentation; the fields below do the work)
#   extras          bool  → export_extras
#   animations      bool  → export_animations (rigged also needs the armature in `selection`)
#   applyTransforms bool  → export_apply       (false for rigs: applying the armature modifier
#                                               freezes the pose into the mesh)
#   selection       "meshes+anchors" (default) | "all" | ["ObjectName", ...]
# NO SIDECAR = the previous behaviour, unchanged. That is deliberate: 268 .blend files in this repo
# have no sidecar, and a helper that quietly changed all of them would be the same bug with a
# different sign.
#
# Sidecars live beside the .blend, are validated by scripts/glb-contract-guard.mjs's downstream
# checks, and are documented in docs/3d/PIPELINE.md.
set -euo pipefail
BLEND="${1:?usage: reexport-pilot.sh <path/to/building.blend>}"
[ -f "$BLEND" ] || { echo "no such file: $BLEND"; exit 1; }
GLB="${BLEND%.blend}.glb"
SIDECAR="${BLEND%.blend}.export.json"
OUT_DIR="${REEXPORT_OUT_DIR:-}"
if [ -n "$OUT_DIR" ]; then
  # Proof/dry-run mode: write beside nothing production. Used by the PIPELINE.md profile proof.
  mkdir -p "$OUT_DIR"
  GLB="$OUT_DIR/$(basename "$GLB")"
fi
BLENDER="${BLENDER:-/Applications/Blender.app/Contents/MacOS/Blender}"
[ -x "$BLENDER" ] || { echo "Blender not found at $BLENDER (set BLENDER=...)"; exit 1; }

"$BLENDER" --background "$BLEND" --python-expr "
import bpy, json, os, sys
meshes = [o for o in bpy.data.objects if o.type == 'MESH']
anchors = sorted((o for o in bpy.data.objects if o.type == 'EMPTY' and o.name.startswith(('steam_anchor_', 'arc_anchor_', 'exhaust_anchor_'))), key=lambda o: o.name)
mats = {m.name for o in meshes for m in (s.material for s in o.material_slots) if m}
tris = sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in meshes)
cams = [o for o in bpy.data.objects if o.type == 'CAMERA']
lights = [o for o in bpy.data.objects if o.type == 'LIGHT']
print(f'[reexport] meshes={len(meshes)} materials={len(mats)} triangles={tris} anchors={[o.name for o in anchors]} cameras={len(cams)} lights={len(lights)}')
if cams or lights:
    print('[reexport] WARNING: cameras/lights present — they are excluded from export, but the RECIPE wants none in the file')

# The pre-sidecar recipe, unchanged. Overridden only by fields a sidecar actually names.
options = dict(export_format='GLB', use_selection=True,
    export_apply=True, export_cameras=False, export_lights=False,
    export_animations=False, export_materials='EXPORT')
selection = 'meshes+anchors'
profile = 'legacy (no sidecar)'
sidecar_path = '$SIDECAR'
if os.path.isfile(sidecar_path):
    with open(sidecar_path, encoding='utf-8') as handle: sidecar = json.load(handle)
    profile = sidecar.get('profile', 'unspecified')
    if profile not in ('static', 'rigged', 'terrain'):
        print(f'[reexport] ERROR: unknown profile {profile!r} in {sidecar_path}'); sys.exit(1)
    if 'extras' in sidecar: options['export_extras'] = bool(sidecar['extras'])
    if 'animations' in sidecar: options['export_animations'] = bool(sidecar['animations'])
    if 'applyTransforms' in sidecar: options['export_apply'] = bool(sidecar['applyTransforms'])
    selection = sidecar.get('selection', selection)

if selection == 'all':
    selected = [o for o in bpy.data.objects if o.type not in ('CAMERA', 'LIGHT')]
elif isinstance(selection, list):
    by_name = {o.name: o for o in bpy.data.objects}
    missing = [name for name in selection if name not in by_name]
    if missing:
        print(f'[reexport] ERROR: sidecar selection names absent objects: {missing}'); sys.exit(1)
    selected = [by_name[name] for name in selection]
elif selection == 'meshes+anchors':
    selected = [*meshes, *anchors]
else:
    print(f'[reexport] ERROR: unknown selection {selection!r}'); sys.exit(1)
if not selected:
    print('[reexport] ERROR: selection is empty'); sys.exit(1)

print(f'[reexport] profile={profile} selection={selection if isinstance(selection, str) else len(selection)} objects={len(selected)} extras={options.get(\"export_extras\", False)} animations={options[\"export_animations\"]} apply={options[\"export_apply\"]}')
bpy.ops.object.select_all(action='DESELECT')
for o in selected: o.select_set(True)
bpy.context.view_layer.objects.active = selected[0]
bpy.ops.export_scene.gltf(filepath='$GLB'.removesuffix('.glb'), **options)
print('[reexport] wrote $GLB')
" 2>/dev/null | grep '\[reexport\]'
echo "[reexport] done — hard-refresh the ?town3dPilot page (dev server picks it up; deployed site needs a deploy)"
