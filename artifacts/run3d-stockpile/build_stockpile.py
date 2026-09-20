import bpy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "assets/processed/bld-stockpile-yard.png"
OUT = ROOT / "assets/pilots/run3d"

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.scene.unit_settings.system = "METRIC"

image = bpy.data.images.load(str(SOURCE), check_existing=False)
image.scale(512, 512)
image.pack()
material = bpy.data.materials.new("StockpilePaint")
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

cube("TimberCrib", (0, 0, 0.11), (1.38, 1.38, 0.22), 0.035)
for x in (-0.58, 0.58):
    for y in (-0.58, 0.58):
        cube("CornerPost", (x, y, 0.39), (0.11, 0.11, 0.78), 0.018)
for y in (-0.62, 0.62):
    for z in (0.3, 0.58):
        cube("CribRail", (0, y, z), (1.38, 0.1, 0.13), 0.018)
for x in (-0.62, 0.62):
    for z in (0.3, 0.58):
        cube("CribRail", (x, 0, z), (0.1, 1.38, 0.13), 0.018)
cube("Strongbox", (-0.35, -0.24, 0.43), (0.58, 0.46, 0.46), 0.045)
cube("StrongboxLid", (-0.35, -0.24, 0.69), (0.62, 0.5, 0.1), 0.025)
for x, y, z, scale in ((0.18, 0.12, 0.38, 0.29), (0.38, -0.1, 0.34, 0.25),
                       (0.2, -0.28, 0.3, 0.22), (0.46, 0.26, 0.28, 0.2),
                       (-0.02, 0.34, 0.27, 0.2), (0.05, -0.02, 0.58, 0.2)):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=scale, location=(x, y, z))
    nugget = bpy.context.object
    nugget.name = "PaintedGoldNugget"
    nugget.scale.z = 0.65
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    parts.append(nugget)

for obj in parts:
    for modifier in list(obj.modifiers):
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.modifier_apply(modifier=modifier.name)
    obj.data.materials.append(material)
    obj.select_set(True)
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.object.join()
model = bpy.context.object
model.name = "StockpileYard"
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.mesh.normals_make_consistent(inside=False)
bpy.ops.uv.smart_project(island_margin=0.03)
bpy.ops.object.mode_set(mode="OBJECT")
model.data.uv_layers.active.name = "UVMap"

OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT / "stockpile.blend"))
bpy.ops.export_scene.gltf(filepath=str(OUT / "stockpile.glb"), export_format="GLB", use_selection=True,
                          export_cameras=False, export_lights=False, export_apply=True)
