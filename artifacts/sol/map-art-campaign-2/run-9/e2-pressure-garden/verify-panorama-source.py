from pathlib import Path
import bpy,json,hashlib
pilot=Path.cwd()/'assets/pilots/map-rebuild-spike';out=Path(__file__).parent;raw=out.parent.parent/'_raw/run-9/pressure-panorama-reexport';raw.mkdir(exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(pilot/'pressure-garden-panorama.blend'))
meshes=[o for o in bpy.data.objects if o.type=='MESH'];assert len(meshes)==2
bpy.ops.object.select_all(action='DESELECT')
for o in meshes:o.hide_set(False);o.select_set(True)
bpy.context.view_layer.objects.active=meshes[0];target=raw/'pressure-garden-panorama.glb'
bpy.ops.export_scene.gltf(filepath=str(target),export_format='GLB',use_selection=True,export_apply=True,export_cameras=False,export_lights=False,export_animations=False,export_materials='EXPORT',export_extras=True)
assert target.read_bytes()==(pilot/target.name).read_bytes()
rocks=bpy.data.objects['PressureGardenBankStones']; coords=[rocks.matrix_world @ v.co for v in rocks.data.vertices]
assert min(abs(v.x) for v in coords)>6, 'stone enters declared ford'
original=json.loads((pilot/'sources/e2-pressure-garden-fidelity-2/panorama-input-contract.json').read_text())
current=json.loads((pilot/'pressure-garden-panorama-contract.json').read_text())
assert original['mount']==current['mount'] and original['projection']==current['projection']
print('FORD CLEARANCE',min(abs(v.x) for v in coords),'triangles',current['triangles'])
(out/'panorama-source-verification.json').write_text(json.dumps({'savedSourceReexportByteIdentical':True,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'recipe':'sources/e2-pressure-garden-fidelity-2/dress-bank-scenery.py','minimumAbsXOfStones':min(abs(v.x) for v in coords),'fordHalfWidth':6,'sceneryTriangles':current['triangles']-original['triangles'],'panoramaMountAndProjectionUnchanged':True},indent=2)+'\n')
print('GARDEN PANORAMA SOURCE PASS')
