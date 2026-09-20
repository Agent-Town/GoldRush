"""Planar target-to-authored-component distance from the saved candidate mesh."""
from pathlib import Path
import bpy,json,math,hashlib
from mathutils import Vector
HERE=Path(__file__).resolve().parent
blend=HERE/'candidate-model/dredge-queen-detail-opus5.blend'
bpy.ops.wm.open_mainfile(filepath=str(blend))
alignment=json.loads((HERE/'candidate-runtime/alignment-before.json').read_text())
def segment_distance(p,a,b):
 d=b-a;t=max(0,min(1,(p-a).dot(d)/d.length_squared)) if d.length_squared else 0
 return (p-a-d*t).length
def distance(p,triangle):
 a,b,c=triangle
 cross=lambda v,w:v.x*w.y-v.y*w.x
 area=cross(b-a,c-a)
 signs=[cross(y-x,p-x) for x,y in ((a,b),(b,c),(c,a))]
 if abs(area)>1e-10 and (min(signs)>=0 or max(signs)<=0):return 0
 return min(segment_distance(p,x,y) for x,y in ((a,b),(b,c),(c,a)))
tri=[Vector((0,0)),Vector((1,0)),Vector((0,1))]
assert distance(Vector((.2,.2)),tri)==0
assert math.isclose(distance(Vector((-1,0)),tri),1)
rows=[]
for node,group_name in [('claw','DamageGrab'),('paddle_port','DamagePortForePaddle'),('paddle_starboard','DamageStarboardForePaddle'),('hold','DamageHoldRear')]:
 obj=bpy.data.objects[node];obj.data.calc_loop_triangles();group=obj.vertex_groups[group_name]
 indices={v.index for v in obj.data.vertices if any(g.group==group.index for g in v.groups)}
 faces=[tuple(t.vertices) for t in obj.data.loop_triangles if set(t.vertices)<=indices]
 assert faces
 target=next(t for row in alignment['rows'] for t in row['targets'] if t['id']==node)['declared']
 tests=[('declared-offset',Vector((target['x'],target['z'])))]
 if node=='hold':tests.append(('current-act2-center',Vector((0,0))))
 for key in obj.data.shape_keys.key_blocks:
  points=[Vector((p.co.x,p.co.y)) for p in key.data]
  for label,point in tests:
   nearest=min(distance(point,[points[i] for i in f]) for f in faces)
   bounds=[[min(points[i][axis] for i in indices),max(points[i][axis] for i in indices)] for axis in (0,1)]
   rows.append({'node':node,'group':group_name,'shape':key.name,'pointKind':label,'point':list(point),'footprintDistance':nearest,'planarBounds':bounds})
report={'blendSha256':hashlib.sha256(blend.read_bytes()).hexdigest(),'alignmentSourceSha256':alignment['sourceSha256'],'rows':rows,
 'scope':'Distance in x/z ground plane to triangle footprints of the named authored subgroup. Does not prove screen-space targeting, ray selection, collision, runtime pose or material visibility.'}
(HERE/'candidate-validation/target-fit.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps([{'node':r['node'],'shape':r['shape'],'point':r['pointKind'],'distance':round(r['footprintDistance'],6)} for r in rows],indent=2))
