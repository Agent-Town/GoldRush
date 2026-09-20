from pathlib import Path
import bpy,json
HERE=Path(__file__).resolve().parent
bpy.ops.wm.open_mainfile(filepath=str(HERE/'candidate-model/homemaker-9000.blend'))
o=bpy.data.objects['core'];key=o.data.shape_keys.key_blocks['Damage_ChairPose'];group=o.vertex_groups['ChairDebris'].index
remaining={v.index for v in o.data.vertices if any(g.group==group and g.weight>.5 for g in v.groups)}
adj={i:set() for i in remaining}
for edge in o.data.edges:
 a,b=edge.vertices
 if a in adj and b in adj:adj[a].add(b);adj[b].add(a)
islands=[]
while remaining:
 stack=[remaining.pop()];island=[]
 while stack:
  i=stack.pop();island.append(i)
  for j in adj[i]&remaining:remaining.remove(j);stack.append(j)
 points=[key.data[i].co for i in island]
 islands.append({'vertices':len(island),'min':[min(p[a] for p in points) for a in range(3)],'max':[max(p[a] for p in points) for a in range(3)]})
legs=[i for i in islands if i['min'][2]<.05 and i['max'][2]>.8]
report={'scope':'Four disconnected authored chair-leg meshes in the final chair morph. Neutral renderer ground top is -0.05; actual game uses sampled visual terrain and support clearance.','legs':legs,'passed':len(legs)==4 and all(0<=i['min'][2]<=.025 for i in legs)}
(HERE/'chair-support-12.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report));assert report['passed']
