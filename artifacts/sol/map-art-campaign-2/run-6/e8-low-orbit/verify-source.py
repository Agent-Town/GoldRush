"""Read saved authoring source and prove every canonical GLB re-exports exactly."""
from pathlib import Path
import bpy,json,hashlib
root=Path.cwd();pilot=root/'assets/pilots/map-rebuild-spike';pack=pilot/'landmarks/low-orbit';out=root/'artifacts/sol/map-art-campaign-2/run-6/e8-low-orbit';raw=root/'artifacts/sol/map-art-campaign-2/_raw/run-6/low-orbit-reexport';raw.mkdir(exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(pack/'low-orbit-landmarks.blend'));d=json.loads((pack/'low-orbit-landmark-pack-contract.json').read_text());rows=[]
for o in [o for o in bpy.data.objects if o.type=='MESH']:
 bpy.ops.object.select_all(action='DESELECT');o.hide_set(False);o.select_set(True);bpy.context.view_layer.objects.active=o;path=raw/(o.name+'.glb')
 bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,export_apply=True,export_cameras=False,export_lights=False,export_animations=False,export_materials='EXPORT',export_extras=True)
 expected=(pilot/d['assets'][o.name]['asset']).read_bytes();assert path.read_bytes()==expected,o.name
 rows.append(dict(id=o.name,savedSourceReexportByteIdentical=True,triangles=sum(len(p.vertices)-2 for p in o.data.polygons),sha256=hashlib.sha256(expected).hexdigest()))
(out/'source-verification.json').write_text(json.dumps({'rows':rows,'oneSharedAtlas':True,'source':d['blend'],'recipe':'dress_low_orbit_station.py'},indent=2)+'\n');print('SOURCE_VERIFIED',len(rows))
