"""Read-only inspection of a landmark pack .blend + its atlas.

  /Applications/Blender.app/Contents/MacOS/Blender --background \
    assets/pilots/map-rebuild-spike/landmarks/<pack>/<pack>-landmarks.blend \
    --python artifacts/open-maps-art-blackout-fairground/inspect_pack.py
"""
import json
import sys
from pathlib import Path

import bpy
import numpy as np

ROOT = Path(bpy.path.abspath("//")).resolve()
report = {"blend": bpy.data.filepath, "objects": [], "materials": [], "images": []}

for obj in bpy.data.objects:
    entry = {
        "name": obj.name,
        "type": obj.type,
        "role": obj.get("landmark_role"),
        "parent": obj.parent.name if obj.parent else None,
        "loc": [round(v, 4) for v in obj.location],
        "scale": [round(v, 4) for v in obj.scale],
    }
    if obj.type == "MESH":
        entry["tris"] = sum(len(p.vertices) - 2 for p in obj.data.polygons)
        entry["materials"] = [m.name if m else None for m in obj.data.materials]
        entry["children"] = len(obj.children)
    report["objects"].append(entry)

for mat in bpy.data.materials:
    node = mat.node_tree.nodes.get("Principled BSDF") if mat.use_nodes else None
    report["materials"].append({
        "name": mat.name,
        "roughness": round(node.inputs["Roughness"].default_value, 4) if node else None,
        "metallic": round(node.inputs["Metallic"].default_value, 4) if node else None,
        "emission_strength": round(node.inputs["Emission Strength"].default_value, 4) if node and "Emission Strength" in node.inputs else None,
        "base_color_linked": bool(node.inputs["Base Color"].links) if node else None,
    })

for image in bpy.data.images:
    report["images"].append({"name": image.name, "size": list(image.size), "packed": bool(image.packed_file), "filepath": image.filepath})

# Role tile means of the shared atlas PNG on disk (4x4 grid, builder ROLE_INDEX order).
atlas_path = Path(sys.argv[-1]) if sys.argv[-1].endswith(".png") else None
if atlas_path and atlas_path.exists():
    img = bpy.data.images.load(str(atlas_path))
    w, h = img.size
    px = np.empty(w * h * 4, dtype=np.float32)
    img.pixels.foreach_get(px)
    px = px.reshape(h, w, 4)[:, :, :3]
    tile = w // 4
    roles = ["timber", "iron", "stone", "earth", "water", "cactus", "bone", "cloth", "brass", "soot", "parchment", "rust"]
    tiles = {}
    for index, role in enumerate(roles):
        row, col = divmod(index, 4)
        patch = px[row * tile:(row + 1) * tile, col * tile:(col + 1) * tile]
        mean = patch.reshape(-1, 3).mean(axis=0)
        luma = float((patch[:, :, 0] * 0.2126 + patch[:, :, 1] * 0.7152 + patch[:, :, 2] * 0.0722).mean())
        tiles[role] = {"mean_rgb": [round(float(v), 4) for v in mean], "mean_luma": round(luma, 4),
                       "p95_luma": round(float(np.percentile(patch[:, :, 0] * 0.2126 + patch[:, :, 1] * 0.7152 + patch[:, :, 2] * 0.0722, 95)), 4)}
    report["atlas_tiles"] = tiles

print("INSPECT_JSON_START")
print(json.dumps(report, indent=1))
print("INSPECT_JSON_END")
