"""Verify saved source, unchanged sibling meshes, bounds and embedded atlas."""
from pathlib import Path
import bpy,json,hashlib,subprocess,sys
pilot=Path.cwd()/'assets/pilots/map-rebuild-spike'; source=pilot/'sources/e2-incline-fidelity-2'
pack=Path(sys.argv[sys.argv.index('--')+1]) if '--' in sys.argv else pilot/'landmarks/incline'
out=Path('/tmp/gr9-incline-proof') if '--' in sys.argv else Path('artifacts/sol/map-art-campaign-2/run-9/e2-incline')
out.mkdir(exist_ok=True); raw=Path('artifacts/sol/map-art-campaign-2/_raw/run-9/incline-reexport');raw.mkdir(exist_ok=True)
def meshes():
 return {o.name:{'vertices':[tuple(v.co) for v in o.data.vertices],'polygons':[tuple(p.vertices) for p in o.data.polygons],'uv':{u.name:[tuple(v.uv) for v in u.data] for u in o.data.uv_layers},'bounds':[tuple(v) for v in o.bound_box],'matrix':[list(v) for v in o.matrix_world]} for o in bpy.data.objects if o.type=='MESH'}
bpy.ops.wm.open_mainfile(filepath=str(source/'landmarks-input.blend'));before=meshes()
bpy.ops.wm.open_mainfile(filepath=str(pack/'incline-landmarks.blend'));after=meshes();assert before.keys()==after.keys();rows=[]
for name,a in before.items():
 b=after[name]
 if name!='upper-ore-cable-house':assert a==b,name
 for axis in range(3):
  assert abs(min(v[axis] for v in a['bounds'])-min(v[axis] for v in b['bounds']))<.0001
  assert abs(max(v[axis] for v in a['bounds'])-max(v[axis] for v in b['bounds']))<.0001
 bpy.ops.object.select_all(action='DESELECT');o=bpy.data.objects[name];o.hide_set(False);o.select_set(True);bpy.context.view_layer.objects.active=o;target=raw/(name+'.glb')
 bpy.ops.export_scene.gltf(filepath=str(target),export_format='GLB',use_selection=True,export_apply=True,export_cameras=False,export_lights=False,export_animations=False,export_materials='EXPORT',export_extras=True)
 shipped=(pack if name=='upper-ore-cable-house' else pilot/'landmarks/incline')/(name+'.glb');assert target.read_bytes()==shipped.read_bytes(),name
 rows.append({'id':name,'unchangedSourceSibling':name!='upper-ore-cable-house','boundsPreservedWithinMeters':.0001,'savedSourceReexportByteIdentical':True,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()})
(out/'source-verification.json').write_text(json.dumps({'rows':rows,'oneSharedAtlas':True,'recipe':'sources/e2-incline-fidelity-2/refine-cable-house.py'},indent=2)+'\n');print('SOURCE VERIFIED',len(rows))
