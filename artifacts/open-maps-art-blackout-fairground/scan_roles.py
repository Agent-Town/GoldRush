"""Recover each pack body's per-face atlas ROLE from its UVs and report the face-area split.

build_landmark_packs.py:map_uv writes every loop into its role's tile of the 4x4 atlas
(u in [(col+0.08)/4,(col+0.92)/4], v likewise for row; ROLE_INDEX order), so the tile a
polygon's UV centroid lands in IS its role. The joined body keeps those UVs.

  Blender --background <pack>.blend --python artifacts/open-maps-art-blackout-fairground/scan_roles.py
"""
import json

import bpy

ROLES = ["timber", "iron", "stone", "earth", "water", "cactus", "bone", "cloth", "brass", "soot", "parchment", "rust"]

report = {}
for obj in bpy.data.objects:
    if obj.type != "MESH":
        continue
    uv = obj.data.uv_layers.active
    by_role = {}
    for poly in obj.data.polygons:
        u = sum(uv.data[i].uv[0] for i in poly.loop_indices) / len(poly.loop_indices)
        v = sum(uv.data[i].uv[1] for i in poly.loop_indices) / len(poly.loop_indices)
        col = min(3, max(0, int(u * 4)))
        row = min(3, max(0, int(v * 4)))
        index = row * 4 + col
        role = ROLES[index] if index < len(ROLES) else f"tile{index}"
        entry = by_role.setdefault(role, {"faces": 0, "area": 0.0, "zmax": 0.0})
        entry["faces"] += 1
        entry["area"] += poly.area
        entry["zmax"] = max(entry["zmax"], max(obj.data.vertices[i].co.z for i in poly.vertices))
    total = sum(e["area"] for e in by_role.values()) or 1.0
    report[obj.name] = {
        "extras": {k: obj[k] for k in obj.keys()},
        "zmax": round(max(v.co.z for v in obj.data.vertices), 3),
        "roles": {r: {"faces": e["faces"], "area_pct": round(100 * e["area"] / total, 1), "zmax": round(e["zmax"], 2)}
                  for r, e in sorted(by_role.items(), key=lambda kv: -kv[1]["area"])},
    }

print("ROLES_JSON_START")
print(json.dumps(report, indent=1, default=str))
print("ROLES_JSON_END")
