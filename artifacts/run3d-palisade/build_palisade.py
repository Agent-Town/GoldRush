import bpy
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "assets/processed/bld-palisade.png"
OUT = ROOT / "assets/pilots/run3d"

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)

image = bpy.data.images.load(str(SOURCE))
image.scale(512, 512)
pixels = list(image.pixels)
opaque = [pixels[i:i + 3] for i in range(0, len(pixels), 4) if pixels[i + 3] > 0.5]
timber = [sum(color[channel] for color in opaque) / len(opaque) for channel in range(3)]
source = pixels[:]
for y in range(512):
    for x in range(512):
        sample = ((240 + y % 40) * 512 + 150 + x * 240 // 512) * 4
        color = source[sample:sample + 4]
        i = (y * 512 + x) * 4
        pixels[i:i + 4] = color if color[3] > 0.5 else [*timber, 1]
image.pixels = pixels
image.pack()
material = bpy.data.materials.new("PalisadePaint")
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

def log(name, location, radius, depth, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=radius, depth=depth, location=location, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    parts.append(obj)
    return obj

for y in (-1.27, 1.27):
    log("PalisadePost", (0, y, 0.52), 0.18, 1.04)
for z in (0.25, 0.52, 0.79):
    log("PalisadeRail", (0, 0, z), 0.13, 2.6, (math.pi / 2, 0, 0))
for y in (-1.27, 1.27):
    for z in (0.28, 0.76):
        bpy.ops.mesh.primitive_torus_add(major_radius=0.205, minor_radius=0.025, major_segments=8, minor_segments=4, location=(0, y, z))
        parts.append(bpy.context.object)

for obj in parts:
    obj.data.materials.append(material)
    obj.select_set(True)
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.object.join()
model = bpy.context.object
model.name = "Palisade"
bpy.context.scene.cursor.location = (0, 0, 0)
bpy.ops.object.origin_set(type="ORIGIN_CURSOR")
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
model.data.uv_layers.active.name = "UVMap"

OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT / "palisade.blend"))
bpy.ops.export_scene.gltf(filepath=str(OUT / "palisade.glb"), export_format="GLB", use_selection=True, export_cameras=False, export_lights=False, export_apply=True)
