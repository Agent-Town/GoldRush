import bpy
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "assets/processed/bld-signal-turret.png"
OUT = ROOT / "assets/pilots/run3d"

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)

image = bpy.data.images.load(str(SOURCE))
image.scale(512, 512)
image.pack()
material = bpy.data.materials.new("TurretPaint")
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
    obj.scale = tuple(value / 2 for value in scale)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        modifier = obj.modifiers.new("Painted edges", "BEVEL")
        modifier.width = bevel
        modifier.segments = 1
    parts.append(obj)
    return obj

cube("TimberBase", (0, 0, 0.16), (1.35, 1.35, 0.2), 0.06)
for angle in (0, math.tau / 3, math.tau * 2 / 3):
    x, y = math.cos(angle) * 0.42, math.sin(angle) * 0.42
    leg = cube("TripodLeg", (x, y, 0.56), (0.13, 0.13, 0.92), 0.025)
    leg.rotation_euler.x = math.sin(angle) * 0.18
    leg.rotation_euler.y = -math.cos(angle) * 0.18

bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.23, depth=1.18, location=(0, 0, 1.08))
mast = bpy.context.object
mast.name = "BrassResonatorMast"
parts.append(mast)

for z, radius in ((0.74, 0.36), (1.04, 0.4), (1.34, 0.34)):
    bpy.ops.mesh.primitive_torus_add(major_radius=radius, minor_radius=0.055, major_segments=16, minor_segments=6, location=(0, 0, z))
    coil = bpy.context.object
    coil.name = "InductionCoil"
    parts.append(coil)

bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, location=(0, 0, 1.72), scale=(0.42, 0.42, 0.3))
lens = bpy.context.object
lens.name = "SignalLens"
parts.append(lens)
cube("LensCap", (0, 0, 1.99), (0.38, 0.38, 0.12), 0.04)
for angle in (0, math.pi / 2):
    arm = cube("SteamArc", (0, 0, 1.52), (0.9, 0.08, 0.08), 0.02)
    arm.rotation_euler.z = angle

for obj in parts:
    obj.data.materials.append(material)
    obj.select_set(True)
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.object.convert(target="MESH")
bpy.ops.object.join()
model = bpy.context.object
model.name = "SignalTurret"
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
bpy.context.scene.cursor.location = (0, 0, 0)
bpy.ops.object.origin_set(type="ORIGIN_CURSOR")
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.uv.smart_project(island_margin=0.03)
bpy.ops.object.mode_set(mode="OBJECT")
model.data.uv_layers.active.name = "UVMap"

OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT / "turret.blend"))
bpy.ops.export_scene.gltf(filepath=str(OUT / "turret.glb"), export_format="GLB", use_selection=True, export_cameras=False, export_lights=False, export_apply=True)
