"""Matched E5 asset inspection using the existing renderer; run after the source freeze."""
from pathlib import Path
import argparse
import hashlib
import importlib.util
import json
import sys

import bpy
from mathutils import Vector

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
helper = ROOT / 'assets/pilots/dredge-queen-3d/render_dredge_queen_detail_opus5.py'
spec = importlib.util.spec_from_file_location('e5_candidate_renderer', helper)
renderer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(renderer)
parser = argparse.ArgumentParser()
parser.add_argument('--out', default='candidate-neutral')
parser.add_argument('--candidate-only', action='store_true')
args = parser.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
OUT = HERE / args.out
OUT.mkdir(exist_ok=True)
renderer.OUT = OUT
original_configure = renderer.configure


def configure(resolution):
    camera = original_configure(resolution)
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    scene.render.threads_mode = 'FIXED'
    scene.render.threads = 1
    scene.cycles.device = 'CPU'
    scene.cycles.samples = 16
    scene.cycles.use_denoising = True
    scene.world.node_tree.nodes['Background'].inputs['Color'].default_value = (.08, .08, .08, 1)
    for light in (obj for obj in scene.objects if obj.type == 'LIGHT'):
        light.data.color = (1, 1, 1)
    return camera


renderer.configure = configure
sha = lambda path: hashlib.sha256(path.read_bytes()).hexdigest()
records = []
for label, asset in (
    ('before', ROOT / 'assets/pilots/dredge-queen-3d/dredge-queen-detail-opus5.glb'),
    ('candidate', HERE / 'candidate-model/dredge-queen-detail-opus5.glb'),
):
    if args.candidate_only and label == 'before':
        continue
    assert asset.is_file(), f'Build the isolated candidate first: {asset}'
    turntable = OUT / f'{label}-turntable.png'
    renderer.render_turntable(asset, turntable, tile=660, ortho=11.5)
    images = [turntable]
    for state, morphs in [('intact', set()), *[(name, {name}) for name in renderer.COMPONENTS],
                           ('all-damaged', set(renderer.COMPONENTS))]:
        image = OUT / f'{label}-{state}.png'
        renderer.render_single(asset, image, morphs, resolution=(960, 640), ortho=11.5)
        images.append(image)
    # The reference-facing camera hides the far paddle; show its actual damaged geometry.
    renderer.shared.reset_scene()
    objects = renderer.import_glb(asset)
    renderer.review_ground()
    camera = configure((960, 640))
    camera.data.type = 'ORTHO'
    camera.data.ortho_scale = 11.5
    renderer.shared.aim(camera, Vector((-8.4,10.6,5.6)), Vector((0,0,2.2)))
    for state, morphs in [('paddle_starboard', {'paddle_starboard'}), ('all-damaged', set(renderer.COMPONENTS))]:
        renderer.set_morphs(objects, morphs)
        image = OUT / f'{label}-{state}-opposite.png'
        renderer.shared.render(image)
        images.append(image)
    records.append({'label': label, 'asset': str(asset.relative_to(ROOT)), 'assetSha256': sha(asset),
                    'images': {image.name: sha(image) for image in images}})
(OUT / 'receipt.json').write_text(json.dumps({
    'rendererSha256': sha(Path(__file__)), 'helperSha256': sha(helper),
    'sharedHelperSha256': sha(Path(renderer.shared.__file__)),
    'lighting': 'Existing three area lights with neutral white colour; original material unchanged.',
    'engine': 'Cycles CPU, one thread, 16 samples, denoising',
    'cameraScale': 11.5, 'records': records,
    'matchedBeforeReceipt': str(HERE / 'candidate-neutral/receipt.json') if args.candidate_only else None,
    'scope': 'Matched asset previews only. Actual game loading, camera, target fit and damage remain separate.'
}, indent=2) + '\n')
