from pathlib import Path
import bpy,json,hashlib
pilot=Path.cwd()/'assets/pilots/map-rebuild-spike';raw=Path.cwd()/'artifacts/sol/map-art-campaign-2/_raw/run-6/last-claim-source';raw.mkdir(exist_ok=True);rows=[]
for part in ['terrain','panorama']:
 stem='last-claim-'+part;bpy.ops.wm.open_mainfile(filepath=str(pilot/(stem+'.blend')));meshes=[o for o in bpy.data.objects if o.type=='MESH'];assert len(meshes)==1
 bpy.ops.object.select_all(action='DESELECT');o=meshes[0];o.hide_set(False);o.select_set(True);bpy.context.view_layer.objects.active=o;p=raw/(stem+'.glb')
 bpy.ops.export_scene.gltf(filepath=str(p),export_format='GLB',use_selection=True,export_apply=True,export_cameras=False,export_lights=False,export_animations=False,export_materials='EXPORT',export_extras=True)
 assert p.read_bytes()==(pilot/(stem+'.glb')).read_bytes();rows.append({'asset':stem+'.glb','savedSourceReexportByteIdentical':True,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
(Path(__file__).parent/'terrain-source-verification.json').write_text(json.dumps(rows,indent=2)+'\n');print('TERRAIN AND PANORAMA SOURCES PASS')
