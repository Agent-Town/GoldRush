import bpy
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "assets/processed/node-gold-seam.png"
OUT = ROOT / "assets/pilots/run3d"

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.scene.unit_settings.system = "METRIC"

image = bpy.data.images.load(str(SOURCE), check_existing=False)
image.scale(512, 512)
pixels = list(image.pixels)
opaque = [pixels[i:i + 3] for i in range(0, len(pixels), 4) if pixels[i + 3] > 0.5]
rock = [color for color in opaque if sum(color) / 3 < 0.42]
gold = [color for color in opaque if color[0] > color[1] * 1.12 and color[1] > color[2] * 1.15 and sum(color) / 3 > 0.3]
rock_color = [sum(color[channel] for color in rock) / len(rock) for channel in range(3)]
gold_color = [sum(color[channel] for color in gold) / len(gold) for channel in range(3)]
source = pixels[:]
for y in range(512):
    for x in range(512):
        sample = (((y * 3) % 512) * 512 + (x * 5) % 512) * 4
        luma = sum(source[sample:sample + 3]) / 3
        base = rock_color if x < 256 else gold_color
        shade = 0.58 + luma * 0.75
        index = (y * 512 + x) * 4
        pixels[index:index + 4] = [min(1, channel * shade) for channel in base] + [1]
image.pixels = pixels
image.name = "GoldSeamPaint512"
image.pack()
material = bpy.data.materials.new("GoldSeamPaint")
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

def rock(name, location, scale, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=1, location=location, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    parts.append(obj)

rock("BedrockWest", (-0.42, 0.02, 0.18), (0.43, 0.34, 0.22), (0.1, 0.2, -0.25))
rock("BedrockCenter", (0.02, 0.02, 0.23), (0.5, 0.38, 0.28), (-0.1, 0.08, 0.18))
rock("BedrockEast", (0.45, 0.03, 0.17), (0.4, 0.3, 0.2), (0.08, -0.16, -0.1))
rock("BedrockBack", (-0.08, 0.34, 0.13), (0.42, 0.25, 0.17), (0.1, 0, 0.3))
for index, (x, y, z, size) in enumerate((
    (-0.34, -0.12, 0.42, 0.19),
    (-0.08, -0.04, 0.53, 0.24),
    (0.23, -0.08, 0.44, 0.21),
    (0.43, 0.12, 0.34, 0.16),
    (-0.18, 0.25, 0.35, 0.17),
)):
    rock(f"GoldNugget{index + 1}", (x, y, z), (size, size * 0.8, size * 0.72), (0.2, index * 0.31, index * 0.47))

for obj in parts:
    obj.data.materials.append(material)
    bpy.ops.object.select_all(action="DESELECT")
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(island_margin=0.03)
    bpy.ops.object.mode_set(mode="OBJECT")
    for uv in obj.data.uv_layers.active.data:
        uv.uv.x = uv.uv.x * 0.5 + (0.5 if obj.name.startswith("GoldNugget") else 0)
    obj.select_set(False)

for obj in parts:
    obj.select_set(True)
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.object.join()
model = bpy.context.object
model.name = "GoldSeam"
model.scale = (0.95, 1.1, 1.45)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.mesh.normals_make_consistent(inside=False)
bpy.ops.object.mode_set(mode="OBJECT")
model.data.uv_layers.active.name = "UVMap"

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

OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT / "gold-seam.blend"))
bpy.ops.export_scene.gltf(
    filepath=str(OUT / "gold-seam.glb"),
    export_format="GLB",
    use_selection=True,
    export_cameras=False,
    export_lights=False,
    export_animations=False,
    export_apply=True,
)
