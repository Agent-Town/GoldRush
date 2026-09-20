import bpy
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "assets/processed/bld-boiler-house.png"
OUT = ROOT / "assets/pilots/run3d"

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.scene.unit_settings.system = "METRIC"
image = bpy.data.images.load(str(SOURCE), check_existing=False)
image.pack()
material = bpy.data.materials.new("BoilerHousePaint")
material.use_nodes = True
nodes = material.node_tree.nodes
texture = nodes.new("ShaderNodeTexImage")
texture.image = image
texture.interpolation = "Linear"
texture.extension = "REPEAT"
bsdf = nodes.get("Principled BSDF")
bsdf.inputs["Metallic"].default_value = 0
bsdf.inputs["Roughness"].default_value = 0.9
material.node_tree.links.new(texture.outputs["Color"], bsdf.inputs["Base Color"])
parts = []

def cube(name, at, size, bevel=0.025):
    bpy.ops.mesh.primitive_cube_add(location=at)
    obj = bpy.context.object
    obj.name = name
    obj.scale = tuple(v / 2 for v in size)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        mod = obj.modifiers.new("Painted edges", "BEVEL")
        mod.width = bevel
        mod.segments = 1
    parts.append(obj)

def cylinder(name, at, radius, depth, vertices=12, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=at, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    parts.append(obj)

cube("BoilerHouseBody", (0, 0, 0.55), (1.62, 1.22, 1.1), 0.04)
cube("BoilerHouseRoof", (0, 0, 1.18), (1.72, 1.32, 0.22), 0.04)
cube("FrontAwning", (0, -0.66, 0.92), (1.28, 0.22, 0.16), 0.025)
for x in (-0.56, 0.56):
    cube("AwningPost", (x, -0.68, 0.45), (0.1, 0.1, 0.9), 0.015)
cylinder("BrassBoiler", (-0.12, -0.28, 0.82), 0.38, 1.22, 14, (0, math.pi / 2, 0))
cylinder("BoilerBandA", (-0.48, -0.28, 0.82), 0.405, 0.07, 14, (0, math.pi / 2, 0))
cylinder("BoilerBandB", (0.24, -0.28, 0.82), 0.405, 0.07, 14, (0, math.pi / 2, 0))
cylinder("SteamStack", (0.53, 0.24, 1.65), 0.14, 1.05, 12)
cylinder("StackCap", (0.53, 0.24, 2.2), 0.2, 0.12, 12)
cube("TealServicePanel", (0.54, -0.626, 0.65), (0.42, 0.07, 0.52), 0.015)

for obj in parts:
    for mod in list(obj.modifiers):
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.modifier_apply(modifier=mod.name)
    obj.data.materials.append(material)
    obj.select_set(True)
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.object.join()
model = bpy.context.object
model.name = "BoilerHouse"
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.mesh.normals_make_consistent(inside=False)
bpy.ops.uv.smart_project(island_margin=0.03)
bpy.ops.object.mode_set(mode="OBJECT")
model.data.uv_layers.active.name = "UVMap"
bpy.context.scene.cursor.location = (0, 0, 0)
bpy.ops.object.origin_set(type="ORIGIN_CURSOR")

OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT / "boiler-house.blend"))
bpy.ops.export_scene.gltf(filepath=str(OUT / "boiler-house.glb"), export_format="GLB", use_selection=True,
                          export_cameras=False, export_lights=False, export_animations=False, export_apply=True)
