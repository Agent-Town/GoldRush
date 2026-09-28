"""Close the render-only apron join with a half-metre underlap; preserve sky and relief."""
from pathlib import Path
import bpy,json,hashlib,subprocess,math
root=Path.cwd();out=root/'assets/pilots/map-rebuild-spike';store=out.resolve().parents[1]
raw=root/'artifacts/sol/map-art-campaign-2/_raw/run-5/long-panorama';raw.mkdir(exist_ok=True)
base=json.loads((root/'artifacts/sol/map-art-campaign-2/run-5/e4-long-road/base.json').read_text())['store']
(raw/'base.blend').write_bytes(subprocess.check_output(['git','show',base+':pilots/map-rebuild-spike/long-road-panorama.blend'],cwd=store))
bpy.ops.wm.open_mainfile(filepath=str(raw/'base.blend'));o=next(o for o in bpy.data.objects if o.type=='MESH' and 'Panorama' in o.name)
before=[tuple(v.co) for v in o.data.vertices];faces=[tuple(p.vertices) for p in o.data.polygons];uv=[tuple(v.uv) for v in o.data.uv_layers.active.data]
for v in o.data.vertices:
 if abs(v.co.z + .13)<.001 and (abs(abs(v.co.x)-200.01)<.003 or abs(abs(v.co.y)-48.01)<.003):
  v.co.x*=199.5/200.01;v.co.y*=47.5/48.01
o.data.update();bpy.context.view_layer.update();after=[tuple(v.co) for v in o.data.vertices];changed=[i for i,(a,b) in enumerate(zip(before,after)) if a!=b]
assert changed and all(before[i][2]==after[i][2] for i in changed)
assert faces==[tuple(p.vertices) for p in o.data.polygons] and uv==[tuple(v.uv) for v in o.data.uv_layers.active.data]
bpy.context.preferences.filepaths.save_version=0;bpy.ops.wm.save_as_mainfile(filepath=str(out/'long-road-panorama.blend'))
bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
export=lambda p:bpy.ops.export_scene.gltf(filepath=str(p),export_format='GLB',use_selection=True,export_apply=True,export_cameras=False,export_lights=False,export_animations=False,export_materials='EXPORT',export_extras=True)
export(out/'long-road-panorama.glb')
bpy.ops.wm.open_mainfile(filepath=str(out/'long-road-panorama.blend'));o=next(o for o in bpy.data.objects if o.type=='MESH' and 'Panorama' in o.name);bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
export(raw/'reexport.glb');assert (raw/'reexport.glb').read_bytes()==(out/'long-road-panorama.glb').read_bytes()
p=out/'long-road-panorama-contract.json';d=json.loads(p.read_text());d['projection']['apronJoinUnderlap']={'innerHalfExtentsBeforeMeters':[200.01,48.01],'innerHalfExtentsAfterMeters':[199.5,47.5],'preserves':'all heights, faces, UVs, atlas, outer scenery, terrain and collision'}
for kind in ['blend','glb']:
 f=out/f'long-road-panorama.{kind}';d['files'][kind]={'bytes':f.stat().st_size,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()}
p.write_text(json.dumps(d,indent=2)+'\n')
(root/'artifacts/sol/map-art-campaign-2/run-5/e4-long-road/panorama-verification.json').write_text(json.dumps({'storeBase':base,'changedVertices':len(changed),'totalVertices':len(before),'triangles':len(faces),'unchanged':['heights','topology','UVs','atlas','outer scenery','terrain and height sampler','landmark mounts and collision'],'beforeXBounds':[min(v[0] for v in before),max(v[0] for v in before)],'afterXBounds':[min(v[0] for v in after),max(v[0] for v in after)],'sourceReexportByteIdentical':True},indent=2)+'\n')
print('VERIFIED',len(changed),'vertices')
