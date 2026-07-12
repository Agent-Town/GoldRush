#!/usr/bin/env bash
# Re-export a 3D pilot .blend → .glb with the RECIPE.md contract settings.
# Usage: bash scripts/reexport-pilot.sh assets/pilots/chapel-3d/chapel.blend
# For owner hand-edits: edit the .blend in Blender, save, run this, refresh the game.
set -euo pipefail
BLEND="${1:?usage: reexport-pilot.sh <path/to/building.blend>}"
[ -f "$BLEND" ] || { echo "no such file: $BLEND"; exit 1; }
GLB="${BLEND%.blend}.glb"
BLENDER="${BLENDER:-/Applications/Blender.app/Contents/MacOS/Blender}"
[ -x "$BLENDER" ] || { echo "Blender not found at $BLENDER (set BLENDER=...)"; exit 1; }

"$BLENDER" --background "$BLEND" --python-expr "
import bpy, sys
meshes = [o for o in bpy.data.objects if o.type == 'MESH']
mats = {m.name for o in meshes for m in (s.material for s in o.material_slots) if m}
tris = sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in meshes)
cams = [o for o in bpy.data.objects if o.type == 'CAMERA']
lights = [o for o in bpy.data.objects if o.type == 'LIGHT']
print(f'[reexport] meshes={len(meshes)} materials={len(mats)} triangles={tris} cameras={len(cams)} lights={len(lights)}')
if cams or lights:
    print('[reexport] WARNING: cameras/lights present — they are excluded from export, but the RECIPE wants none in the file')
bpy.ops.object.select_all(action='DESELECT')
for o in meshes: o.select_set(True)
bpy.context.view_layer.objects.active = meshes[0]
bpy.ops.export_scene.gltf(filepath='$GLB'.removesuffix('.glb'), export_format='GLB', use_selection=True,
    export_apply=True, export_cameras=False, export_lights=False,
    export_animations=False, export_materials='EXPORT')
print('[reexport] wrote $GLB')
" 2>/dev/null | grep '\[reexport\]'
echo "[reexport] done — hard-refresh the ?town3dPilot page (dev server picks it up; deployed site needs a deploy)"
