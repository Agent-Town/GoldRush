import bpy
import math
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "assets/processed/bld-sentry-beacon.png"
OUT = ROOT / "assets/pilots/run3d"

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.scene.unit_settings.system = "METRIC"

image = bpy.data.images.load(str(SOURCE), check_existing=False)
image.scale(512, 512)
pixels = list(image.pixels)
opaque = [pixels[i:i + 3] for i in range(0, len(pixels), 4) if pixels[i + 3] > 0.5]
teal = [color for color in opaque if color[1] > color[0] * 1.15 and color[2] > color[0] * 1.1]
brass = [sum(color[channel] for color in opaque) / len(opaque) for channel in range(3)]
teal_color = [sum(color[channel] for color in teal) / len(teal) for channel in range(3)]
source = pixels[:]
for y in range(512):
    for x in range(512):
        sample = ((y * 3) % 512 * 512 + (x * 5) % 512) * 4
        luma = sum(source[sample:sample + 3]) / 3
        base = brass if x < 256 else teal_color
        shade = 0.72 + luma * 0.45
        i = (y * 512 + x) * 4
        pixels[i:i + 4] = [min(1, channel * shade) for channel in base] + [1]
image.pixels = pixels
image.pack()
material = bpy.data.materials.new("SentryBeaconPaint")
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

def cylinder(name, radius, depth, location, vertices=10, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=location, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    parts.append(obj)
    return obj

for angle in (0, math.tau / 3, math.tau * 2 / 3):
    x, y = math.cos(angle) * 0.27, math.sin(angle) * 0.27
    leg = cylinder("TripodLeg", 0.045, 0.78, (x, y, 0.37), 8)
    leg.rotation_euler.x = math.sin(angle) * 0.28
    leg.rotation_euler.y = -math.cos(angle) * 0.28

cylinder("BrassMast", 0.085, 0.7, (0, 0, 0.65), 10)
cylinder("LowerCap", 0.24, 0.1, (0, 0, 0.78), 12)
cylinder("PaintedTealCore", 0.18, 0.28, (0, 0, 0.94), 12)
cylinder("UpperCap", 0.22, 0.1, (0, 0, 1.12), 12)
for z, radius in ((0.81, 0.25), (1.08, 0.23)):
    bpy.ops.mesh.primitive_torus_add(major_radius=radius, minor_radius=0.025, major_segments=12, minor_segments=4, location=(0, 0, z))
    bpy.context.object.name = "CoilGuard"
    parts.append(bpy.context.object)

for obj in parts:
    obj.data.materials.append(material)
    for uv in obj.data.uv_layers.active.data:
        uv.uv.x = uv.uv.x * 0.5 + (0.5 if obj.name == "PaintedTealCore" else 0)
    obj.select_set(True)
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.object.join()
model = bpy.context.object
model.name = "SentryBeacon"
model.scale = (0.85, 0.85, 0.8)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
bounds = [Vector(corner) for corner in model.bound_box]
center_x = (min(point.x for point in bounds) + max(point.x for point in bounds)) / 2
center_y = (min(point.y for point in bounds) + max(point.y for point in bounds)) / 2
base_z = min(point.z for point in bounds)
for vertex in model.data.vertices:
    vertex.co.x -= center_x
    vertex.co.y -= center_y
    vertex.co.z -= base_z
bpy.context.scene.cursor.location = (0, 0, 0)
bpy.ops.object.origin_set(type="ORIGIN_CURSOR")
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.mesh.normals_make_consistent(inside=False)
bpy.ops.object.mode_set(mode="OBJECT")
model.data.uv_layers.active.name = "UVMap"

OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT / "sentry-beacon.blend"))
bpy.ops.export_scene.gltf(filepath=str(OUT / "sentry-beacon.glb"), export_format="GLB", use_selection=True,
                          export_cameras=False, export_lights=False, export_apply=True)
