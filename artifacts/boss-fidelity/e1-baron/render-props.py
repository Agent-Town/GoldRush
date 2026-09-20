"""Matched before/after neutral GLB inspection, no asset writes."""
from pathlib import Path
import bpy
from mathutils import Vector

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[2]
for label, path in (("before", OUT / "before/assets/baron-props.glb"), ("after", ROOT / "assets/pilots/baron-props-3d/baron-props.glb")):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(path))
    for name, x in (("launcher", -1.5), ("rocket", 0), ("powder_keg", 1.4)):
        bpy.data.objects[name].location.x = x
    bpy.context.view_layer.update()
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.samples = 24
    scene.cycles.use_denoising = True
    scene.render.resolution_x, scene.render.resolution_y = 1400, 800
    scene.render.resolution_percentage = 100
    scene.view_settings.view_transform = "AgX"
    scene.world = bpy.data.worlds.new("Neutral world")
    scene.world.use_nodes = True
    scene.world.node_tree.nodes["Background"].inputs[0].default_value = (.17, .17, .17, 1)
    scene.world.node_tree.nodes["Background"].inputs[1].default_value = .7
    for name, location, power in (("Key", (-3, -4, 5), 700), ("Fill", (4, -1, 3), 400)):
        data = bpy.data.lights.new(name, "AREA")
        data.energy, data.size = power, 4
        obj = bpy.data.objects.new(name, data)
        scene.collection.objects.link(obj)
        obj.location = location
        obj.rotation_euler = (-obj.location).to_track_quat("-Z", "Y").to_euler()
    camera = bpy.data.objects.new("Camera", bpy.data.cameras.new("Camera"))
    scene.collection.objects.link(camera)
    camera.location = (2, -7, 4)
    camera.rotation_euler = (-camera.location).to_track_quat("-Z", "Y").to_euler()
    camera.data.type, camera.data.ortho_scale = "ORTHO", 5
    scene.camera = camera
    scene.render.filepath = str(OUT / f"{label}-props-neutral.png")
    bpy.ops.render.render(write_still=True)
