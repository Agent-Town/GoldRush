"""Check source geometry and unchanged sibling exports against the map's store base."""
from pathlib import Path
import bpy, hashlib, json, subprocess
root=Path.cwd();pack=root/'assets/pilots/map-rebuild-spike/landmarks/incline';store=pack.resolve().parents[3]
raw=root/'artifacts/sol/map-art-campaign-2/_raw/run-4/incline-source-check';raw.mkdir(exist_ok=True)
base='9fa06cc';prefix='pilots/map-rebuild-spike/landmarks/incline/'
(raw/'base.blend').write_bytes(subprocess.check_output(['git','show',base+':'+prefix+'incline-landmarks.blend'],cwd=store))
def meshes():
 return {o.name: {'vertices':[tuple(v.co) for v in o.data.vertices], 'polygons':[tuple(p.vertices) for p in o.data.polygons], 'uv':[tuple(v.uv) for v in o.data.uv_layers.active.data], 'bounds':[tuple(v) for v in o.bound_box]} for o in bpy.data.objects if o.type=='MESH'}
bpy.ops.wm.open_mainfile(filepath=str(raw/'base.blend'));before=meshes()
bpy.ops.wm.open_mainfile(filepath=str(pack/'incline-landmarks.blend'));after=meshes();assert before.keys()==after.keys()
rows=[]
for name,a in before.items():
 b=after[name];assert a['bounds']==b['bounds']
 for k in ('vertices','polygons','uv'):
  assert a[k]==b[k][:len(a[k])],(name,k)
  if name!='upper-ore-cable-house':assert a[k]==b[k]
 bpy.ops.object.select_all(action='DESELECT');o=bpy.data.objects[name];o.select_set(True);bpy.context.view_layer.objects.active=o
 path=raw/(name+'.glb')
 bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,export_apply=True,export_cameras=False,export_lights=False,export_animations=False,export_materials='EXPORT',export_extras=True)
 assert path.read_bytes()==(pack/(name+'.glb')).read_bytes(),name
 if name!='upper-ore-cable-house':assert path.read_bytes()==subprocess.check_output(['git','show',base+':'+prefix+name+'.glb'],cwd=store)
 rows.append({'body':name,'originalGeometryAndUVsPreserved':True,'boundsUnchanged':True,'sourceReexportByteIdentical':True,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
(root/'artifacts/sol/map-art-campaign-2/run-4/e2-incline/source-verification.json').write_text(json.dumps(rows,indent=2)+'\n')
print('SOURCE_VERIFIED',len(rows))
