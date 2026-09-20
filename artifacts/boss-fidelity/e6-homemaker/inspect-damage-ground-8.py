from pathlib import Path
import bpy,json
HERE=Path(__file__).resolve().parent
bpy.ops.wm.open_mainfile(filepath=str(HERE/'candidate-model/homemaker-9000.blend'))
rows=[]
for obj in [o for o in bpy.data.objects if o.type=='MESH']:
 key=obj.data.shape_keys.key_blocks[1]
 for group in obj.vertex_groups:
  indices=[v.index for v in obj.data.vertices if any(g.group==group.index for g in v.groups)]
  if not indices:continue
  z=min(key.data[i].co.z for i in indices)
  rows.append({'component':obj.name,'group':group.name,'minZ':z,'vertices':len(indices)})
(HERE/'damage-ground-groups-8.json').write_text(json.dumps(rows,indent=2)+'\n')
print(json.dumps([r for r in rows if r['group'] in ['ChairDebris','RackUpper','VacHead','ChairLeftLeg','ChairRightLeg']],indent=2))
