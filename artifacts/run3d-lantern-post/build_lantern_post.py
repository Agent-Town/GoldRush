import bpy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "assets/raw/prop-lantern-post.png"
OUT = ROOT / "assets/pilots/run3d"

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.scene.unit_settings.system = "METRIC"
image = bpy.data.images.load(str(SOURCE), check_existing=False)
image.scale(512, 512)
pixels = list(image.pixels)
for i in range(0, len(pixels), 4):
    if pixels[i] > 0.8 and pixels[i + 1] < 0.2 and pixels[i + 2] > 0.8:
        pixels[i:i + 4] = (0.28, 0.18, 0.08, 1)
image.pixels[:] = pixels
image.name = "LanternPostPaint512"
image.pack()
material = bpy.data.materials.new("LanternPostPaint")
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

def cube(name, at, size, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(location=at, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    obj.scale = tuple(v / 2 for v in size)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    bevel = obj.modifiers.new("Painted edges", "BEVEL")
    bevel.width = 0.018
    bevel.segments = 1
    parts.append(obj)

def cylinder(name, at, radius, depth, vertices=8):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=at)
    obj = bpy.context.object
    obj.name = name
    parts.append(obj)

cylinder("Foot", (0, 0, 0.06), 0.18, 0.12, 10)
cylinder("Post", (0, 0, 0.72), 0.065, 1.32, 8)
cube("CrossArm", (0.22, 0, 1.27), (0.58, 0.09, 0.09))
cube("Brace", (0.12, 0, 1.13), (0.32, 0.055, 0.055), (0, -0.65, 0))
cube("Lantern", (0.50, 0, 1.04), (0.24, 0.20, 0.30))
cube("LanternCap", (0.50, 0, 1.21), (0.30, 0.25, 0.06))
cube("LanternBase", (0.50, 0, 0.87), (0.28, 0.23, 0.06))

for obj in parts:
    for modifier in list(obj.modifiers):
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.modifier_apply(modifier=modifier.name)
    obj.data.materials.append(material)
    obj.select_set(True)
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.object.join()
model = bpy.context.object
model.name = "LanternPost"
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.mesh.normals_make_consistent(inside=False)
bpy.ops.uv.smart_project(island_margin=0.03)
bpy.ops.object.mode_set(mode="OBJECT")
model.data.uv_layers.active.name = "UVMap"
bpy.context.scene.cursor.location = (0, 0, 0)
bpy.ops.object.origin_set(type="ORIGIN_CURSOR")

OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT / "lantern-post.blend"))
bpy.ops.export_scene.gltf(filepath=str(OUT / "lantern-post.glb"), export_format="GLB", use_selection=True,
                          export_cameras=False, export_lights=False, export_animations=False, export_apply=True)
