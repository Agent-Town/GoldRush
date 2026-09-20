"""Read saved-source connected components, without modifying any production file."""
from pathlib import Path
import bpy,json
root=Path.cwd();bpy.ops.wm.open_mainfile(filepath=str(root/'assets/pilots/map-rebuild-spike/landmarks/trestle/trestle-landmarks.blend'))
report={}
for name in ['mine-spur-kit','trestle-crossing']:
 obj=bpy.data.objects[name];m=obj.data;adj={v.index:set() for v in m.vertices}
 for e in m.edges:
  a,b=e.vertices;adj[a].add(b);adj[b].add(a)
 remaining=set(adj);parts=[]
 while remaining:
  todo=[min(remaining)];ids=set()
  while todo:
   v=todo.pop()
   if v in ids:continue
   ids.add(v);todo.extend(adj[v]-ids)
  remaining-=ids;pts=[obj.matrix_world@m.vertices[i].co for i in ids]
  faces=[p for p in m.polygons if p.vertices[0] in ids]
  parts.append({'vertices':sorted(ids),'triangles':sum(len(f.vertices)-2 for f in faces),'min':[round(min(p[a] for p in pts),5) for a in range(3)],'max':[round(max(p[a] for p in pts),5) for a in range(3)]})
 report[name]={'location':list(obj.location),'rotation':list(obj.rotation_euler),'scale':list(obj.scale),'triangles':sum(len(f.vertices)-2 for f in m.polygons),'components':parts}
p=root/'artifacts/sol/map-art-campaign-2/run-3/e2-trestle/source-components.json';p.write_text(json.dumps(report,indent=2)+'\n')
for name,row in report.items():
 print(name,row['location'],row['rotation'],row['scale'])
 for i,p in enumerate(row['components']):print(i,p['triangles'],p['min'],p['max'])
