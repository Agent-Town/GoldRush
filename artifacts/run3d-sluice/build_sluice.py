import bpy
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "assets/processed/bld-sluice-works.png"
OUT = ROOT / "assets/pilots/run3d"

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)

image = bpy.data.images.load(str(SOURCE))
image.scale(512, 512)
image.pack()
material = bpy.data.materials.new("SluicePaint")
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

def cube(name, location, scale, bevel=0.025):
    bpy.ops.mesh.primitive_cube_add(location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = (scale[0] / 2, scale[1] / 2, scale[2] / 2)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        modifier = obj.modifiers.new("Painted edges", "BEVEL")
        modifier.width = bevel
        modifier.segments = 1
    parts.append(obj)
    return obj

cube("Trough", (0, 0, 0.67), (1.86, 0.72, 0.34), 0.06)
cube("WaterChannel", (0, 0, 0.86), (1.55, 0.42, 0.05), 0.015)
for x in (-0.78, 0.78):
    for y in (-0.25, 0.25):
        cube("TimberLeg", (x, y, 0.32), (0.12, 0.12, 0.64), 0.02)
for y in (-0.34, 0.34):
    cube("SideRail", (0, y, 0.96), (1.98, 0.1, 0.16), 0.025)
for x in (-0.72, 0, 0.72):
    cube("Riffle", (x, 0, 0.89), (0.08, 0.5, 0.1), 0.015)

bpy.ops.mesh.primitive_torus_add(major_radius=0.27, minor_radius=0.035, major_segments=16, minor_segments=6, location=(-0.62, -0.42, 0.72), rotation=(math.pi / 2, 0, 0))
wheel = bpy.context.object
wheel.name = "BrassWaterWheel"
parts.append(wheel)
for angle in (0, math.pi / 2):
    spoke = cube("WheelSpoke", (-0.62, -0.42, 0.72), (0.54, 0.055, 0.055), 0.01)
    spoke.rotation_euler.y = angle

for obj in parts:
    obj.data.materials.append(material)
    obj.select_set(True)
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.object.convert(target="MESH")
bpy.ops.object.join()
model = bpy.context.object
model.name = "SluiceWorks"
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.uv.smart_project(island_margin=0.03)
bpy.ops.object.mode_set(mode="OBJECT")
model.data.uv_layers.active.name = "UVMap"

OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT / "sluice.blend"))
bpy.ops.export_scene.gltf(filepath=str(OUT / "sluice.glb"), export_format="GLB", use_selection=True, export_cameras=False, export_lights=False, export_apply=True)
