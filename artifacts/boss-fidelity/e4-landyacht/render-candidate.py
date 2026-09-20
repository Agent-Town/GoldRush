"""Matched, CPU-only asset inspection; never writes a served game asset."""
from pathlib import Path
import hashlib
import importlib.util
import json
import sys

import bpy
from mathutils import Vector

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
helper_path = ROOT / "assets/pilots/dredge-queen-3d/render_dredge_queen.py"
spec = importlib.util.spec_from_file_location("land_yacht_candidate_renderer", helper_path)
shared = importlib.util.module_from_spec(spec)
spec.loader.exec_module(shared)
shared.COMPONENTS = {"wheels": "Damage_BeachedWheels", "crane": "Damage_SlackCrane",
                     "wheelhouse": "Damage_CrackedWheelhouse"}
OUT = HERE / "candidate-neutral"
OUT.mkdir(exist_ok=True)
sha = lambda path: hashlib.sha256(path.read_bytes()).hexdigest()
records = []

for label, asset in (
    ("before", ROOT / "assets/pilots/land-yacht-3d/land-yacht.glb"),
    ("candidate", HERE / "candidate-model/land-yacht.glb"),
):
    if '--candidate-only' in sys.argv and label == 'before':
        continue
    shared.reset_scene()
    shared.GLB = asset
    objects = shared.import_dredge_queen()
    ground = shared.material("Neutral review ground", (0.17, 0.15, 0.11, 1), 0.94)
    shared.add_box("Neutral review ground", (22, 22, 0.1), (0, 0, -0.08), ground)
    camera = shared.setup_scene((640, 640))
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    scene.render.threads_mode = 'FIXED'
    scene.render.threads = 1
    scene.cycles.device = 'CPU'
    scene.cycles.samples = 16
    scene.cycles.use_denoising = True
    scene.world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.08, 0.08, 0.08, 1)
    for light, color in zip((obj for obj in scene.objects if obj.type == 'LIGHT'),
                            ((1, 0.91, 0.78), (0.65, 0.82, 1), (1, 0.96, 0.9))):
        light.data.color = color
    camera.data.type = 'ORTHO'
    camera.data.ortho_scale = 12.5
    views = [('front-port', (-12, -12, 8.2), None),
             ('front-starboard', (-12, 12, 8.2), None)]
    if label == 'candidate':
        views.extend((f'{component}-damaged', (-12, 12, 8.2) if component == 'wheelhouse'
                       else (-12, -12, 8.2), component) for component in shared.COMPONENTS)
    for name, location, damaged in views:
        for component, obj in objects.items():
            obj.data.shape_keys.key_blocks[shared.COMPONENTS[component]].value = 1 if component == damaged else 0
        shared.aim(camera, Vector(location), Vector((0, 0, 2.6)))
        image = OUT / f"{label}-{name}.png"
        shared.render(image)
        records.append({"asset": str(asset.relative_to(ROOT)), "assetSha256": sha(asset),
                        "image": str(image.relative_to(HERE)), "imageSha256": sha(image),
                        "cameraPosition": location, "damagedComponent": damaged})

(OUT / 'preview-receipt.json').write_text(json.dumps({
    "rendererSha256": sha(Path(__file__)), "helperSha256": sha(helper_path),
    "engine": "Cycles CPU, one thread, 16 samples, denoising",
    "camera": {"type": "orthographic", "scale": 12.5, "position": [-12, -12, 8.2],
               "target": [0, 0, 2.6], "resolution": [640, 640]},
    "records": records,
    "scope": "Neutral asset previews; no runtime acceptance.",
}, indent=2) + '\n')
