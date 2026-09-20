import bpy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "assets/processed/ter-rail-elements-r0c0.png"
OUT = ROOT / "assets/pilots/run3d"

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.scene.unit_settings.system = "METRIC"

source = bpy.data.images.load(str(SOURCE), check_existing=False)
pixels = list(source.pixels)
usable = [pixels[i:i + 3] for i in range(0, len(pixels), 4)
          if pixels[i + 3] > 0.5 and not (pixels[i] > 0.8 and pixels[i + 2] > 0.8 and pixels[i + 1] < 0.25)
          and sum(pixels[i:i + 3]) > 0.08]
wood = [color for color in usable if color[0] > color[1] * 1.1 and color[1] > color[2] * 1.1]
metal = [color for color in usable if max(color) - min(color) < 0.18]
assert wood and metal

def average(colors):
    return [sum(color[channel] for color in colors) / len(colors) for channel in range(3)]

wood_color = average(wood)
metal_color = average(metal)
texture = bpy.data.images.new("RailElementPaint256", width=256, height=256, alpha=False)
paint = [0.0] * (256 * 256 * 4)
for y in range(256):
    for x in range(256):
        base = wood_color if x < 128 else metal_color
        source_index = (((y * 3) % source.size[1]) * source.size[0] + (x * 5) % source.size[0]) * 4
        shade = 0.72 + sum(pixels[source_index:source_index + 3]) / 9
        index = (y * 256 + x) * 4
        paint[index:index + 4] = [min(1, channel * shade) for channel in base] + [1]
texture.pixels = paint
texture.pack()

material = bpy.data.materials.new("RailElementPaint")
material.use_nodes = True
nodes = material.node_tree.nodes
image_node = nodes.new("ShaderNodeTexImage")
image_node.image = texture
image_node.interpolation = "Linear"
image_node.extension = "REPEAT"
bsdf = nodes.get("Principled BSDF")
bsdf.inputs["Metallic"].default_value = 0.08
bsdf.inputs["Roughness"].default_value = 0.82
material.node_tree.links.new(image_node.outputs["Color"], bsdf.inputs["Base Color"])

parts = []

def box(name, location, dimensions, metal_part=False):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = dimensions
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(material)
    bevel = obj.modifiers.new("PaintedEdge", "BEVEL")
    bevel.width = 0.008 if metal_part else 0.012
    bevel.segments = 1
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier=bevel.name)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(island_margin=0.03)
    bpy.ops.object.mode_set(mode="OBJECT")
    for uv in obj.data.uv_layers.active.data:
        uv.uv.x = uv.uv.x * 0.5 + (0.5 if metal_part else 0)
    parts.append(obj)

box("Tie", (0, 0, 0.035), (1.32, 0.22, 0.07))
box("RailWest", (-0.39, 0, 0.115), (0.08, 0.22, 0.09), True)
box("RailEast", (0.39, 0, 0.115), (0.08, 0.22, 0.09), True)

bpy.ops.object.select_all(action="DESELECT")
for obj in parts:
    obj.select_set(True)
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.object.join()
model = bpy.context.object
model.name = "RailElement"
model.data.uv_layers.active.name = "UVMap"
bpy.context.scene.cursor.location = (0, 0, 0)
bpy.ops.object.origin_set(type="ORIGIN_CURSOR")

OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT / "rail-element.blend"))
bpy.ops.export_scene.gltf(
    filepath=str(OUT / "rail-element.glb"),
    export_format="GLB",
    use_selection=True,
    export_cameras=False,
    export_lights=False,
    export_animations=False,
    export_apply=True,
)
