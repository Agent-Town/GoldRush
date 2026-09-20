import bpy
import math
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "assets/processed/bld-claim-office.png"
OUT = ROOT / "assets/pilots/run3d"

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.scene.unit_settings.system = "METRIC"

image = bpy.data.images.load(str(SOURCE), check_existing=False)
image.scale(512, 512)
pixels = list(image.pixels)
opaque = [pixels[i:i + 3] for i in range(0, len(pixels), 4) if pixels[i + 3] > 0.5]
timber = [sum(color[channel] for color in opaque) / len(opaque) for channel in range(3)]
for i in range(0, len(pixels), 4):
    if pixels[i + 3] <= 0.5:
        pixels[i:i + 4] = timber + [1]
image.pixels = pixels
image.pack()
material = bpy.data.materials.new("AssayBenchPaint")
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

def cube(name, scale, location, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(location=location, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    parts.append(obj)
    return obj

def cylinder(name, radius, depth, location, vertices=10, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=location, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    parts.append(obj)
    return obj

# Covered frontier assay station: timber cabinet, brass hood, scales, and crucible.
cube("TimberCabinet", (0.78, 0.48, 0.34), (0, 0, 0.34))
cube("BenchTop", (0.9, 0.59, 0.07), (0, 0, 0.73))
cube("BackBoard", (0.82, 0.06, 0.28), (0, 0.48, 1.02))
for x in (-0.75, 0.75):
    cube("CanopyPost", (0.045, 0.045, 0.42), (x, 0.47, 1.12))
cube("BrassCanopy", (0.92, 0.62, 0.07), (0, 0, 1.55), rotation=(0.03, 0, 0))
cube("DrawerLine", (0.67, 0.012, 0.025), (0, -0.492, 0.4))

cylinder("ScaleStem", 0.025, 0.36, (0.2, -0.08, 0.97), 8)
cube("ScaleBeam", (0.28, 0.025, 0.025), (0.2, -0.08, 1.13), rotation=(0, 0.03, 0))
for x in (-0.06, 0.46):
    cylinder("ScalePan", 0.1, 0.025, (x, -0.08, 1.02), 12)
cylinder("Crucible", 0.12, 0.18, (-0.38, -0.12, 0.89), 10)
cylinder("OreDish", 0.16, 0.035, (0.55, 0.2, 0.82), 12)

for obj in parts:
    obj.data.materials.append(material)
    obj.select_set(True)
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.object.join()
model = bpy.context.object
model.name = "AssayBench"
model.scale.z = 0.75
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
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.mesh.normals_make_consistent(inside=False)
bpy.ops.uv.smart_project(island_margin=0.03)
bpy.ops.object.mode_set(mode="OBJECT")
model.data.uv_layers.active.name = "UVMap"

OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT / "assay-bench.blend"))
bpy.ops.export_scene.gltf(filepath=str(OUT / "assay-bench.glb"), export_format="GLB", use_selection=True,
                          export_cameras=False, export_lights=False, export_apply=True)
