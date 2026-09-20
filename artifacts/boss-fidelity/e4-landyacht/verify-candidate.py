"""Reuse the E4 GLB parser; verify candidate format and its explicit new surface."""
from pathlib import Path
import importlib.util
import sys
import json
import math
import bpy

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
path = ROOT / "assets/pilots/land-yacht-3d/verify_land_yacht.py"
spec = importlib.util.spec_from_file_location("land_yacht_candidate_verifier", path)
verifier = importlib.util.module_from_spec(spec)
spec.loader.exec_module(verifier)
verifier.HERE = HERE / "candidate-model"
verifier.BLEND = verifier.HERE / "land-yacht.blend"
verifier.GLB = verifier.HERE / "land-yacht.glb"
verifier.OUT = HERE / "candidate-validation"
verifier.OUT.mkdir(exist_ok=True)
verifier.REEXPORT = verifier.OUT / "reexport.glb"
baseline = verifier.shared.contract(HERE / 'production-handoff/before/assets/pilots/land-yacht-3d/land-yacht.glb')
assert baseline['sha256'] == '902191310b8cf604a1196902696ff14de78811f81bb30dd4bb5a3011f5ce7a01'
checked = verifier.shared.contract(verifier.GLB)
for key in ('nodes', 'nodeCount', 'bindings', 'nodeTransforms', 'meshes', 'meshNames',
            'primitives', 'primitiveMaterials', 'morphTargets', 'targetCounts', 'materials',
            'materialTextureBindings', 'textureSources', 'images', 'embeddedImages',
            'imageDimensions', 'cameras', 'lights', 'animations'):
    assert checked[key] == baseline[key], key
assert checked['triangles'] <= 12_000
assert abs(checked['bounds']['size'][0] - 9.4) < 0.001
assert abs(checked['bounds']['min'][1]) < 0.001
assert abs(checked['bounds']['center'][0]) < 0.001
assert abs(checked['bounds']['center'][2]) < 0.001
surface = checked['materialContract'][0]
assert math.isclose(surface['metallicFactor'], 0.35, abs_tol=1e-6)
assert math.isclose(surface['roughnessFactor'], 0.65, abs_tol=1e-6)
assert {k: v for k, v in surface.items() if k not in ('metallicFactor', 'roughnessFactor')} == {
    k: v for k, v in baseline['materialContract'][0].items() if k not in ('metallicFactor', 'roughnessFactor')}
bpy.ops.wm.open_mainfile(filepath=str(verifier.BLEND))
meshes = [obj for obj in bpy.data.objects if obj.type == 'MESH']
assert sorted(obj.name for obj in meshes) == sorted(verifier.EXPECTED_NODES)
assert not any(obj.type in ('CAMERA', 'LIGHT') for obj in bpy.data.objects)
assert not bpy.data.actions
by_name = {obj.name: obj for obj in meshes}
wheels, crane = by_name['wheels'], by_name['crane']
wheel_damage = wheels.data.shape_keys.key_blocks['Damage_BeachedWheels']
assert min(point.co.z for point in wheel_damage.data) >= -1e-6, 'damaged wheel assembly goes underground'
grab_group = crane.vertex_groups['DamageCraneGrab'].index
grab_vertices = [v.index for v in crane.data.vertices if any(g.group == grab_group for g in v.groups)]
assert grab_vertices, 'missing grab vertices'
crane_damage = crane.data.shape_keys.key_blocks['Damage_SlackCrane']
grab_clearance = min(crane_damage.data[i].co.z for i in grab_vertices) - max(v.co.z for v in wheels.data.vertices)
assert grab_clearance > 0.1, f'damaged grab crowds the highest deck railing: {grab_clearance}'
bpy.ops.object.select_all(action='DESELECT')
for obj in meshes:
    obj.select_set(True)
bpy.context.view_layer.objects.active = meshes[0]
bpy.ops.export_scene.gltf(filepath=str(verifier.REEXPORT.with_suffix('')), export_format='GLB',
    use_selection=True, export_apply=True, export_cameras=False, export_lights=False,
    export_animations=False, export_materials='EXPORT', export_morph=True)
exported = verifier.shared.contract(verifier.REEXPORT)
assert checked['sha256'] == exported['sha256'], 'saved Blend re-export differs'
(verifier.OUT / 'candidate-contract.json').write_text(json.dumps({
    'passed': True, 'checked': checked, 'byteIdentical': True,
    'baselineSha256': baseline['sha256'],
    'damagedGrabAboveHighestDeckRail': grab_clearance,
    'damagedWheelAssemblyGrounded': True,
    'intentionalMaterialChange': {'metallic': 0.35, 'roughness': 0.65},
    'scope': 'Asset contract and saved Blend re-export; fresh-build determinism and runtime remain unproved.'
}, indent=2) + '\n')
verifier.REEXPORT.unlink()
print('Candidate contract and saved Blend re-export passed.')
