"""Verify the apron repair changed only its 97 inner-ring positions."""
from pathlib import Path
import bpy,hashlib,json,subprocess
root=Path.cwd();out=root/'assets/pilots/map-rebuild-spike';store=out.resolve().parents[1]
raw=root/'artifacts/sol/map-art-campaign-2/_raw/run-4/canyon-panorama-verification';raw.mkdir(exist_ok=True)
(raw/'base.blend').write_bytes(subprocess.check_output(['git','show','213e677:pilots/map-rebuild-spike/canyon-works-panorama.blend'],cwd=store))
def read():
 o=next(o for o in bpy.data.objects if o.type=='MESH' and 'Panorama' in o.name)
 return o,{'positions':[tuple(v.co) for v in o.data.vertices],'faces':[tuple(p.vertices) for p in o.data.polygons],'uv':[tuple(v.uv) for v in o.data.uv_layers.active.data],'colors':{a.name:[tuple(v.color) for v in a.data] for a in o.data.color_attributes},'bounds':[tuple(v) for v in o.bound_box]}
bpy.ops.wm.open_mainfile(filepath=str(raw/'base.blend'));_,a=read()
bpy.ops.wm.open_mainfile(filepath=str(out/'canyon-works-panorama.blend'));o,b=read()
for k in ['faces','uv','colors','bounds']:assert a[k]==b[k],k
changed=[i for i,(x,y) in enumerate(zip(a['positions'],b['positions'])) if x!=y];assert len(changed)==97
for i in changed:
 x,y,z=a['positions'][i];assert abs(max(abs(x)/49,abs(y)/57)-1)<1e-5
bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
p=raw/'reexport.glb';bpy.ops.export_scene.gltf(filepath=str(p),export_format='GLB',use_selection=True,export_apply=True,export_cameras=False,export_lights=False,export_animations=False,export_materials='EXPORT',export_extras=True)
assert p.read_bytes()==(out/'canyon-works-panorama.glb').read_bytes()
(root/'artifacts/sol/map-art-campaign-2/run-4/e3-canyon-works/panorama-verification.json').write_text(json.dumps({'changedVertices':changed,'unchanged':['topology','UVs','vertex colors','outer bounds'],'originalRingHalfExtents':[49,57],'newRingHalfExtents':[47.92,55.92],'terrainHalfExtents':[48,56],'sourceReexportByteIdentical':True,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()},indent=2)+'\n')
print('PANORAMA_VERIFIED',len(changed))
