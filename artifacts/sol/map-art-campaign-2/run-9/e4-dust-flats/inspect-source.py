from pathlib import Path
import bpy,json
p=Path.cwd()/'assets/pilots/map-rebuild-spike';out=Path('artifacts/sol/map-art-campaign-2/run-9/e4-dust-flats');rows=[]
for src in ['landmarks/dust-flats/dust-flats-landmarks.blend']:
 bpy.ops.wm.open_mainfile(filepath=str(p/src))
 for o in bpy.data.objects:
  if o.type!='MESH':continue
  m=o.data;links=[set() for _ in m.vertices]
  for e in m.edges:a,b=e.vertices;links[a].add(b);links[b].add(a)
  seen=set();parts=[]
  for v in m.vertices:
   if v.index in seen:continue
   stack=[v.index];ids=set()
   while stack:
    i=stack.pop()
    if i in seen:continue
    seen.add(i);ids.add(i);stack.extend(links[i]-seen)
   faces=[f for f in m.polygons if f.vertices[0] in ids];uv=m.uv_layers.active
   parts.append({'vertices':len(ids),'faces':[f.index for f in faces],'triangles':sum(len(f.vertices)-2 for f in faces),'min':[round(min(m.vertices[i].co[a] for i in ids),3) for a in range(3)],'max':[round(max(m.vertices[i].co[a] for i in ids),3) for a in range(3)],'uv':[[round(x,3) for x in uv.data[i].uv] for f in faces[:1] for i in f.loop_indices]})
  rows.append({'source':src,'name':o.name,'materials':[m.name for m in o.data.materials],'uvLayers':[u.name for u in o.data.uv_layers],'parts':parts,'colors':[c.name for c in o.data.color_attributes]})
(out/'source-inventory.json').write_text(json.dumps(rows,indent=2)+'\n')
for r in rows:
 print(r['name'],r['materials'],r['uvLayers'],r['colors'])
 for i,s in enumerate(r['parts']):print(i,s['triangles'],s['min'],s['max'],[min(s['faces']),max(s['faces'])])
