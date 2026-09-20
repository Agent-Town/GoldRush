import bpy
import hashlib
import json
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "artifacts/run3d-assay-bench"
GLB = ROOT / "assets/pilots/run3d/assay-bench.glb"
REEXPORT = OUT / "assay-bench-reexport.glb"

bpy.ops.wm.open_mainfile(filepath=str(ROOT / "assets/pilots/run3d/assay-bench.blend"))
model = next(obj for obj in bpy.context.scene.objects if obj.type == "MESH")
model.select_set(True)
bpy.context.view_layer.objects.active = model
bpy.ops.export_scene.gltf(filepath=str(REEXPORT), export_format="GLB", use_selection=True,
                          export_cameras=False, export_lights=False, export_apply=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(GLB))
model = next(obj for obj in bpy.context.scene.objects if obj.type == "MESH")
triangles = sum(len(obj.data.loop_triangles) for obj in bpy.context.scene.objects if obj.type == "MESH")
bounds = [model.matrix_world @ Vector(corner) for corner in model.bound_box]
minimum = [min(point[i] for point in bounds) for i in range(3)]
maximum = [max(point[i] for point in bounds) for i in range(3)]

image = bpy.data.images.load(str(ROOT / "assets/processed/bld-claim-office.png"), check_existing=False)
mesh = bpy.data.meshes.new("SpritePlane")
mesh.from_pydata([(0, -0.55, 0), (0, 0.55, 0), (0, 0.55, 1.1), (0, -0.55, 1.1)], [], [(0, 1, 2, 3)])
sprite = bpy.data.objects.new("PaintedSprite", mesh)
bpy.context.collection.objects.link(sprite)
sprite.location.y = 1.2
model.location.y = -1.2
uv = mesh.uv_layers.new(name="UVMap")
for loop, value in zip(uv.data, [(0, 0), (1, 0), (1, 1), (0, 1)]):
    loop.uv = value
sprite_material = bpy.data.materials.new("Sprite")
sprite_material.use_nodes = True
nodes = sprite_material.node_tree.nodes
texture = nodes.new("ShaderNodeTexImage")
texture.image = image
bsdf = nodes.get("Principled BSDF")
sprite_material.node_tree.links.new(texture.outputs["Color"], bsdf.inputs["Base Color"])
sprite_material.node_tree.links.new(texture.outputs["Alpha"], bsdf.inputs["Alpha"])
mesh.materials.append(sprite_material)

bpy.ops.object.light_add(type="AREA", location=(-4, -3, 6))
bpy.context.object.data.energy = 900
bpy.context.object.data.size = 5
bpy.ops.object.camera_add(location=(-7, -5, 3.8))
camera = bpy.context.object
camera.rotation_euler = (Vector((0, 0, 0.7)) - camera.location).to_track_quat("-Z", "Y").to_euler()
camera.data.type = "ORTHO"
camera.data.ortho_scale = 3.4
bpy.context.scene.camera = camera
bpy.context.scene.world = bpy.data.worlds.new("World")
bpy.context.scene.world.color = (0.08, 0.055, 0.035)
bpy.context.scene.render.engine = "BLENDER_EEVEE"
bpy.context.scene.render.resolution_x = 1200
bpy.context.scene.render.resolution_y = 600
bpy.context.scene.render.resolution_percentage = 100
bpy.context.scene.render.image_settings.file_format = "PNG"
bpy.context.scene.render.filepath = str(OUT / "assay-bench-sprite-vs-3d-contact-sheet.png")
bpy.ops.render.render(write_still=True)

materials = [material for material in bpy.data.materials if material.name.startswith("AssayBenchPaint")]
contract = {
    "source": "assets/processed/bld-claim-office.png",
    "meshes": 1,
    "primitives": 1,
    "materials": len(materials),
    "embeddedImages": 1,
    "textureSize": [512, 512],
    "triangles": triangles,
    "boundsMin": [round(value, 4) for value in minimum],
    "boundsMax": [round(value, 4) for value in maximum],
    "footprint": [round(maximum[0] - minimum[0], 4), round(maximum[1] - minimum[1], 4)],
    "placementFootprint": [2, 1.5],
    "origin": "base-center",
    "metallic": 0,
    "roughness": 0.9,
    "emissiveTexture": False,
    "animations": 0,
    "cameras": 0,
    "lights": 0,
    "checkedSha256": hashlib.sha256(GLB.read_bytes()).hexdigest(),
    "reexportSha256": hashlib.sha256(REEXPORT.read_bytes()).hexdigest(),
}
contract["reexportShaMatches"] = contract["checkedSha256"] == contract["reexportSha256"]
(OUT / "asset-contract.json").write_text(json.dumps(contract, indent=2) + "\n")
