"""Narrow the tall left cabin above the unchanged camp footprint; route rust sheet to existing iron paint."""
from pathlib import Path
import bpy,json,hashlib,subprocess
root=Path.cwd();out=root/'assets/pilots/map-rebuild-spike/landmarks/gusher-county';store=out.resolve().parents[3];proof=root/'artifacts/sol/map-art-campaign-2/run-5/e4-gusher-county';raw=root/'artifacts/sol/map-art-campaign-2/_raw/run-5/gusher-pack';raw.mkdir(exist_ok=True)
base=json.loads((proof/'base.json').read_text())['store'];rel='pilots/map-rebuild-spike/landmarks/gusher-county/'
(raw/'base.blend').write_bytes(subprocess.check_output(['git','-C',str(store),'show',base+':'+rel+'gusher-county-landmarks.blend']))
bpy.ops.wm.open_mainfile(filepath=str(raw/'base.blend'))
export=lambda p:bpy.ops.export_scene.gltf(filepath=str(p),export_format='GLB',use_selection=True,export_apply=True,export_cameras=False,export_lights=False,export_animations=False,export_materials='EXPORT',export_extras=True)
def select(o):
 bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
objects=[o for o in bpy.data.objects if o.type=='MESH'];rows=[]
for o in objects:
 select(o);export(raw/f'{o.name}-base.glb');assert (raw/f'{o.name}-base.glb').read_bytes()==subprocess.check_output(['git','-C',str(store),'show',base+':'+rel+o.name+'.glb'])
 coords=[tuple(v.co) for v in o.data.vertices];faces=[tuple(p.vertices) for p in o.data.polygons];uvs=[tuple(v.uv) for v in o.data.uv_layers.active.data]
 if o.name=='county-camp-rig':
  adjacent=[set() for _ in o.data.vertices]
  for e in o.data.edges:a,b=e.vertices;adjacent[a].add(b);adjacent[b].add(a)
  seen=set();components=[]
  for v in o.data.vertices:
   if v.index in seen:continue
   component={v.index};stack=[v.index]
   while stack:
    i=stack.pop()
    for j in adjacent[i]-component:component.add(j);stack.append(j)
   seen.update(component);components.append(component)
  indices=set().union(*components[388:394])
  assert len(indices)==128
  for i in indices:o.data.vertices[i].co.x=-4.588663578033447+(o.data.vertices[i].co.x+4.588663578033447)*.44
 for v in o.data.uv_layers.active.data:
  if .75<v.uv.x<1 and .5<v.uv.y<.75:v.uv.x-=.5;v.uv.y-=.5
 o.data.update();after=[tuple(v.co) for v in o.data.vertices];afteruv=[tuple(v.uv) for v in o.data.uv_layers.active.data]
 assert faces==[tuple(p.vertices) for p in o.data.polygons]
 beforeBounds=[[min(v[i] for v in coords) for i in range(3)],[max(v[i] for v in coords) for i in range(3)]];afterBounds=[[min(v[i] for v in after) for i in range(3)],[max(v[i] for v in after) for i in range(3)]];assert beforeBounds==afterBounds
 rows.append({'id':o.name,'movedVertices':sum(a!=b for a,b in zip(coords,after)),'changedUVLoops':sum(a!=b for a,b in zip(uvs,afteruv)),'topologyUnchanged':True,'boundsUnchanged':True,'bounds':afterBounds,'baseSourceReexportByteIdentical':True})
bpy.context.preferences.filepaths.save_version=0;bpy.ops.wm.save_as_mainfile(filepath=str(out/'gusher-county-landmarks.blend'))
for o in objects:select(o);export(out/f'{o.name}.glb')
bpy.ops.wm.open_mainfile(filepath=str(out/'gusher-county-landmarks.blend'))
for o in [o for o in bpy.data.objects if o.type=='MESH']:
 select(o);export(raw/f'{o.name}-reexport.glb');assert (raw/f'{o.name}-reexport.glb').read_bytes()==(out/f'{o.name}.glb').read_bytes()
for r in rows:r['candidateSourceReexportByteIdentical']=True
p=out/'gusher-county-landmark-pack-contract.json';d=json.loads(p.read_text());d['blend']['sha256']=hashlib.sha256((out/'gusher-county-landmarks.blend').read_bytes()).hexdigest()
for id,asset in d['assets'].items():asset['sha256']=hashlib.sha256((out/f'{id}.glb').read_bytes()).hexdigest()
p.write_text(json.dumps(d,indent=2)+'\n');(proof/'source-verification.json').write_text(json.dumps({'storeBase':base,'cabinXScale':.44,'cabinXAnchor':-4.588663578033447,'uvReroute':'rust sheet cell (3,2) to existing iron cell (1,0), same atlas, no new material','rows':rows},indent=2)+'\n')
print('VERIFIED',rows)
