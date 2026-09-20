import bpy
import math
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "artifacts/run3d-palisade"

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
image = bpy.data.images.load(str(ROOT / "assets/processed/bld-palisade.png"), check_existing=False)
image.name = "PaintedSpriteReference"
bpy.ops.import_scene.gltf(filepath=str(ROOT / "assets/pilots/run3d/palisade.glb"))
model = next(obj for obj in bpy.context.scene.objects if obj.type == "MESH")
model.location.y = -2

mesh = bpy.data.meshes.new("SpritePlane")
mesh.from_pydata([(0, -1.5, 0), (0, 1.5, 0), (0, 1.5, 1.04), (0, -1.5, 1.04)], [], [(0, 1, 2, 3)])
sprite = bpy.data.objects.new("PaintedSprite", mesh)
bpy.context.collection.objects.link(sprite)
sprite.location.y = 2
uv = mesh.uv_layers.new(name="UVMap")
for loop, value in zip(uv.data, [(0, 0), (1, 0), (1, 1), (0, 1)]):
    loop.uv = value
material = bpy.data.materials.new("Sprite")
material.use_nodes = True
material.surface_render_method = "DITHERED"
nodes = material.node_tree.nodes
texture = nodes.new("ShaderNodeTexImage")
texture.image = image
bsdf = nodes.get("Principled BSDF")
material.node_tree.links.new(texture.outputs["Color"], bsdf.inputs["Base Color"])
material.node_tree.links.new(texture.outputs["Alpha"], bsdf.inputs["Alpha"])
mesh.materials.append(material)

bpy.ops.object.light_add(type="AREA", location=(-4, -2, 7))
bpy.context.object.data.energy = 900
bpy.context.object.data.shape = "DISK"
bpy.context.object.data.size = 5
bpy.ops.object.camera_add(location=(-9, 0, 4.5))
camera = bpy.context.object
direction = Vector((0, 0, 0.52)) - camera.location
camera.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
camera.data.type = "ORTHO"
camera.data.ortho_scale = 8
bpy.context.scene.camera = camera
bpy.context.scene.world.color = (0.08, 0.055, 0.035)
bpy.context.scene.render.engine = "BLENDER_EEVEE"
bpy.context.scene.render.resolution_x = 1200
bpy.context.scene.render.resolution_y = 600
bpy.context.scene.render.resolution_percentage = 100
bpy.context.scene.render.image_settings.file_format = "PNG"
bpy.context.scene.render.filepath = str(OUT / "palisade-sprite-vs-3d-contact-sheet.png")
bpy.ops.render.render(write_still=True)
