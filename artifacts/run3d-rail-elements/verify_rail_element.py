import bpy
import hashlib
import json
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "artifacts/run3d-rail-elements"
BLEND = ROOT / "assets/pilots/run3d/rail-element.blend"
GLB = ROOT / "assets/pilots/run3d/rail-element.glb"
REEXPORT = OUT / "rail-element-reexport.glb"

bpy.ops.wm.open_mainfile(filepath=str(BLEND))
model = next(obj for obj in bpy.context.scene.objects if obj.type == "MESH")
model.select_set(True)
bpy.context.view_layer.objects.active = model
bpy.ops.export_scene.gltf(filepath=str(REEXPORT), export_format="GLB", use_selection=True,
                          export_cameras=False, export_lights=False, export_animations=False, export_apply=True)

def inspect(path):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(path))
    meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    points = [obj.matrix_world @ Vector(corner) for obj in meshes for corner in obj.bound_box]
    minimum = [min(point[i] for point in points) for i in range(3)]
    maximum = [max(point[i] for point in points) for i in range(3)]
    images = [image for image in bpy.data.images if image.source != "VIEWER"]
    return {
        "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
        "bytes": path.stat().st_size,
        "meshes": len(meshes),
        "primitives": sum(len(obj.data.materials) for obj in meshes),
        "triangles": sum(len(obj.data.loop_triangles) for obj in meshes),
        "materials": len(bpy.data.materials),
        "images": len(images),
        "imageSizes": [list(image.size) for image in images],
        "bounds": {"min": minimum, "size": [maximum[i] - minimum[i] for i in range(3)]},
        "cameras": len([obj for obj in bpy.context.scene.objects if obj.type == "CAMERA"]),
        "lights": len([obj for obj in bpy.context.scene.objects if obj.type == "LIGHT"]),
        "animations": len(bpy.data.actions),
    }

checked = inspect(GLB)
reexported = inspect(REEXPORT)
semantic_keys = ("meshes", "primitives", "triangles", "materials", "images", "imageSizes", "bounds", "cameras", "lights", "animations")
evidence = {
    "source": "assets/processed/ter-rail-elements-r0c0.png",
    "blender": bpy.app.version_string,
    "checked": checked,
    "reexported": reexported,
    "byteIdentical": checked["sha256"] == reexported["sha256"],
    "semanticIdentical": all(checked[key] == reexported[key] for key in semantic_keys),
}
(OUT / "model-contract.json").write_text(json.dumps(evidence, indent=2) + "\n")
size = checked["bounds"]["size"]
assert checked["meshes"] == checked["primitives"] == checked["materials"] == checked["images"] == 1
assert checked["imageSizes"] == [[256, 256]] and checked["triangles"] <= 800
assert abs(checked["bounds"]["min"][2]) < 1e-6
assert abs(size[0] - 1.32) < 1e-5 and abs(size[1] - 0.22) < 1e-5
assert evidence["byteIdentical"] and evidence["semanticIdentical"]
