"""Rebuild the E3 Blackout Ridge / Fairground landmark packs through Astra's own builder.

Why this file exists instead of an edit to build_landmark_packs.py: the task firewall allows
`.py` inside `landmarks/{blackout-ridge,fairground}/**` and `artifacts/...`, not the shared
builder. It also could not be an edit anyway — the E3 pack recipes (PACKS/SPECS/E3_ROLE_COLORS)
were dropped from the tracked builder before Astra's campaign commit 883a3521e (its parent
already greps zero "blackout"), so era 3 now falls through `make_atlas`'s colour ladder to the
default near-black proxy palette. This script restores the E3 palette as a module-level patch —
exactly the branch the builder used to carry — and calls the builder's own `make_atlas` and
`export_asset`. Verified by reproduction: mode=verify rebuilds the shipped atlas byte-for-byte.

  Blender --background --python artifacts/open-maps-art-blackout-fairground/rebuild_pack.py \
    -- <pack> <verify|build>
"""
import hashlib
import importlib.util
import json
import shutil
import sys
from pathlib import Path

import bpy
import numpy as np

ARGS = sys.argv[sys.argv.index("--") + 1:]
PACK = ARGS[0]
MODE = ARGS[1] if len(ARGS) > 1 else "verify"

REPO = Path(__file__).resolve().parents[2]
SPIKE = REPO / "assets/pilots/map-rebuild-spike"
PACK_DIR = SPIKE / "landmarks" / PACK
WORK = REPO / "artifacts/open-maps-art-blackout-fairground/work"
WORK.mkdir(parents=True, exist_ok=True)

# Recovered from the builder as it stood when these two packs were built:
#   f063fa403 "art: build E3 Blackout Ridge landmark pack" (2026-07-18) and
#   7b930acc1 "art: build E3 Fairground landmark pack" — `PACKS[<key>]["plate"]`.
PLATES = {
    "blackout-ridge": REPO / "assets/raw/plate-e3-bld-pylon-set.png",
    "fairground": REPO / "assets/raw/plate-e3-bld-arc-lamp.png",
}

# TWO E3 palettes shipped, and that is the measured cause of defect D2.
# `E3_ROLE_COLORS_V1` is f063fa403:~400, the palette Blackout Ridge was baked with on 2026-07-18.
# `E3_ROLE_COLORS_V2` is 7b930acc1:426, the LIFTED palette every later E3 pack (the Fairground
# included) was baked with. Blackout Ridge's atlas was never re-baked, so it alone still carries
# the pre-lift values — verified by reproduction below (V1 reproduces Blackout Ridge's shipped
# atlas byte-for-byte; V2 reproduces the Fairground's).
E3_ROLE_COLORS_V1 = {
    "timber": (0.25, 0.17, 0.085),
    "iron": (0.105, 0.13, 0.14),
    "stone": (0.14, 0.17, 0.18),
    "earth": (0.22, 0.18, 0.13),
    "water": (0.035, 0.46, 0.44),
    "cactus": (0.08, 0.32, 0.30),
    "bone": (0.64, 0.56, 0.38),
    "cloth": (0.24, 0.08, 0.045),
    "brass": (0.63, 0.40, 0.10),
    "soot": (0.020, 0.030, 0.034),
    "parchment": (0.68, 0.54, 0.30),
    "rust": (0.37, 0.12, 0.045),
}

E3_ROLE_COLORS = {
    "timber": (0.36, 0.205, 0.080),
    "iron": (0.155, 0.205, 0.225),
    "stone": (0.260, 0.285, 0.300),
    "earth": (0.37, 0.205, 0.080),
    "water": (0.045, 0.50, 0.46),
    "cactus": (0.070, 0.25, 0.18),
    "bone": (0.69, 0.58, 0.37),
    "cloth": (0.29, 0.050, 0.025),
    "brass": (0.65, 0.405, 0.095),
    "soot": (0.035, 0.050, 0.070),
    "parchment": (0.75, 0.59, 0.32),
    "rust": (0.42, 0.130, 0.040),
}

# THE NIGHT REPAIR (defect D2 "dark machinery"; the landmark half of D1 "pale terrain boundaries").
# Two measured causes:
#   1. Blackout Ridge is the ONLY E3 pack still baked with palette V1; every later E3 pack got V2.
#      Adopting V2 alone is timber x1.44, iron x1.48-1.61, earth x1.68 on the structural roles.
#   2. `stone` is 21-54% of every body's face area and its faces sit at z~0.3 — it IS the base pad —
#      and both E3 palettes make it a light BLUE-GREY (V1 0.14/0.17/0.18, V2 0.26/0.285/0.30).
#      Routed through the pilot's emissive map (Terrain3dClaimPilot.ts:983 sets
#      material.emissiveMap = material.map), a flat grey slab is exactly the pale plate the
#      five-landmark review saw sitting on night ground.
# So: adopt V2, drop `stone` to a warm grounded dirt value, and lift `brass` ~20% toward the lit
# brass domes of assets/raw/plate-contract-e3-blackout-ridge.png.
E3_NIGHT_ROLE_COLORS = {
    **E3_ROLE_COLORS,
    "stone": (0.115, 0.098, 0.078),
    "brass": (0.78, 0.500, 0.120),
}

ROLES = ["timber", "iron", "stone", "earth", "water", "cactus", "bone", "cloth", "brass", "soot", "parchment", "rust"]


def sha256(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


spec = importlib.util.spec_from_file_location("landmark_pack_builder", SPIKE / "build_landmark_packs.py")
B = importlib.util.module_from_spec(spec)
spec.loader.exec_module(B)

atlas_path = PACK_DIR / f"{PACK}-landmarks-atlas.png"
blend_path = PACK_DIR / f"{PACK}-landmarks.blend"
backup = WORK / f"{PACK}-landmarks-atlas.original.png"
if not backup.exists():
    shutil.copy2(atlas_path, backup)
original_sha = sha256(backup)

SHIPPED_PALETTE = {"blackout-ridge": E3_ROLE_COLORS_V1, "fairground": E3_ROLE_COLORS}
profile = {"era": 3, "plate": PLATES[PACK]}
result = {"pack": PACK, "mode": MODE, "original_atlas_sha256": original_sha}

if MODE == "verify":
    B.ROLE_COLORS = SHIPPED_PALETTE[PACK]
    _, path = B.make_atlas(PACK, profile)
    rebuilt = sha256(path)
    result["rebuilt_atlas_sha256"] = rebuilt
    result["reproduced_bytes"] = rebuilt == original_sha

    def pixels(p):
        image = bpy.data.images.load(str(p))
        buffer = np.empty(image.size[0] * image.size[1] * 4, dtype=np.float32)
        image.pixels.foreach_get(buffer)
        bpy.data.images.remove(image)
        return buffer

    a, b = pixels(path), pixels(backup)
    delta = np.abs(a - b)
    result["pixel_max_delta"] = round(float(delta.max()), 6)
    result["pixel_mean_delta"] = round(float(delta.mean()), 8)
    result["reproduced_pixels"] = bool(delta.max() <= 1.0 / 255.0)
    shutil.copy2(backup, atlas_path)  # verify never leaves a changed file behind
    result["restored_sha256"] = sha256(atlas_path)
    print("REBUILD_JSON_START"); print(json.dumps(result, indent=1)); print("REBUILD_JSON_END")
    sys.exit(0)

# ---- build ----------------------------------------------------------------------------------
# The pack keeps ONE material and ONE texture. A per-role emissive material was considered and
# REJECTED by reading the runtime: Terrain3dClaimPilot.keepLandmarkPaintReadable (:965-:989) sets
# material.emissive and material.emissiveMap on every mounted landmark material that carries a map,
# so an authored emissiveFactor would be overwritten on install — a no-op that would also red the
# guard's materialCount check. The atlas IS the lever here, because it is also the emissive map.
B.ROLE_COLORS = E3_NIGHT_ROLE_COLORS
bpy.ops.wm.open_mainfile(filepath=str(blend_path))
before_images = {image.name for image in bpy.data.images}
atlas_name = next(name for name in before_images if name.endswith("LandmarkAtlas"))

_, path = B.make_atlas(PACK, profile)
result["new_atlas_sha256"] = sha256(path)

# make_atlas leaves its own datablock behind; point the pack material at the NEW image and drop the
# old one. (A packed image cannot be refreshed with reload() — it reloads from the packed bytes —
# so the datablock is replaced rather than reloaded.)
old_atlas = bpy.data.images[atlas_name]
new_atlas = next(image for image in bpy.data.images if image.name not in before_images)
new_atlas.colorspace_settings.name = "sRGB"
new_atlas.filepath = f"//{PACK}-landmarks-atlas.png"
new_atlas.pack()
swapped = 0
for material in bpy.data.materials:
    if not material.use_nodes:
        continue
    for node in material.node_tree.nodes:
        if node.type == "TEX_IMAGE" and node.image == old_atlas:
            node.image = new_atlas
            swapped += 1
bpy.data.images.remove(old_atlas)
new_atlas.name = atlas_name
result["texture_nodes_repointed"] = swapped
assert swapped >= 1, "no material texture node pointed at the pack atlas"

bodies = {}
for obj in [o for o in bpy.data.objects if o.type == "MESH"]:
    mesh = obj.data
    assert len(mesh.materials) == 1, f"{obj.name}: expected the single shared pack material"
    out = PACK_DIR / f"{obj.name}.glb"
    before = sha256(out) if out.exists() else None
    B.export_asset(obj, out)
    after = sha256(out)
    assert after != before, f"{obj.name}: re-export produced an identical GLB — the atlas did not swap"
    bodies[obj.name] = {"glb": out.name, "sha256": after, "previous_sha256": before,
                        "bytes": out.stat().st_size,
                        "triangles": sum(len(poly.vertices) - 2 for poly in mesh.polygons),
                        "bounds": B.glb_bounds(obj), "materials": len(mesh.materials),
                        "extras": {k: obj[k] for k in obj.keys()}}

bpy.ops.wm.save_mainfile(filepath=str(blend_path))
result["blend_sha256"] = sha256(blend_path)
result["bodies"] = bodies
result["palette"] = {k: list(v) for k, v in E3_NIGHT_ROLE_COLORS.items()}
(WORK / f"{PACK}-rebuild.json").write_text(json.dumps(result, indent=1, default=str), encoding="utf-8")
print("REBUILD_JSON_START"); print(json.dumps(result, indent=1, default=str)); print("REBUILD_JSON_END")
