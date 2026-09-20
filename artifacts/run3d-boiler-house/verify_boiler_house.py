import bpy
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
GLB = ROOT / "assets/pilots/run3d/boiler-house.glb"
REEXPORT = ROOT / "artifacts/run3d-boiler-house/boiler-house-reexport.glb"

def inspect(path):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(path))
    meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    vertices = [obj.matrix_world @ vertex.co for obj in meshes for vertex in obj.data.vertices]
    mins = [min(vertex[i] for vertex in vertices) for i in range(3)]
    maxs = [max(vertex[i] for vertex in vertices) for i in range(3)]
    return {
        "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
        "bytes": path.stat().st_size,
        "meshes": len(meshes),
        "primitives": sum(len(obj.data.materials) for obj in meshes),
        "triangles": sum(len(obj.data.loop_triangles) for obj in meshes),
        "materials": len(bpy.data.materials),
        "images": len([image for image in bpy.data.images if image.source != "VIEWER"]),
        "bounds": {"min": mins, "size": [maxs[i] - mins[i] for i in range(3)]},
        "cameras": len([obj for obj in bpy.context.scene.objects if obj.type == "CAMERA"]),
        "lights": len([obj for obj in bpy.context.scene.objects if obj.type == "LIGHT"]),
        "animations": len(bpy.data.actions),
    }

checked = inspect(GLB)
bpy.ops.export_scene.gltf(filepath=str(REEXPORT), export_format="GLB", use_selection=False, export_apply=True,
                          export_cameras=False, export_lights=False, export_animations=False)
reexported = inspect(REEXPORT)
keys = ("meshes", "primitives", "triangles", "materials", "images", "bounds", "cameras", "lights", "animations")
evidence = {"blender": bpy.app.version_string, "checked": checked, "reexported": reexported,
            "byteIdentical": checked["sha256"] == reexported["sha256"],
            "semanticIdentical": all(checked[key] == reexported[key] for key in keys)}
(ROOT / "artifacts/run3d-boiler-house/model-contract.json").write_text(json.dumps(evidence, indent=2) + "\n")
assert checked["meshes"] == checked["primitives"] == checked["materials"] == checked["images"] == 1
assert checked["triangles"] <= 8000 and checked["bounds"]["min"][2] == 0
assert evidence["semanticIdentical"]
