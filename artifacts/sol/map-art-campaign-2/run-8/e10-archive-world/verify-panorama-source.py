from pathlib import Path
import bpy,json,hashlib
pilot=Path.cwd()/'assets/pilots/map-rebuild-spike';raw=Path.cwd()/'artifacts/sol/map-art-campaign-2/_raw/run-8/archive-world-panorama-reexport';raw.mkdir(exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(pilot/'archive-world-panorama.blend'))
meshes=[o for o in bpy.data.objects if o.type=='MESH'];assert len(meshes)==1
bpy.ops.object.select_all(action='DESELECT');o=meshes[0];o.hide_set(False);o.select_set(True);bpy.context.view_layer.objects.active=o;target=raw/'archive-world-panorama.glb'
bpy.ops.export_scene.gltf(filepath=str(target),export_format='GLB',use_selection=True,export_apply=True,export_cameras=False,export_lights=False,export_animations=False,export_materials='EXPORT',export_extras=True)
assert target.read_bytes()==(pilot/target.name).read_bytes()
(Path(__file__).parent/'panorama-source-verification.json').write_text(json.dumps({'savedSourceReexportByteIdentical':True,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'recipe':'fidelity_archive_panorama.py'},indent=2)+'\n');print('ARCHIVE PANORAMA SOURCE PASS')
