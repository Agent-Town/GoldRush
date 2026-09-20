"""Inspect actual saved mesh intersections between hold lids and cloth groups."""
from pathlib import Path
import bpy,json,hashlib
from mathutils.bvhtree import BVHTree
HERE=Path(__file__).resolve().parent
asset=HERE/'candidate-model/dredge-queen-detail-opus5.blend'
bpy.ops.wm.open_mainfile(filepath=str(asset))
obj=bpy.data.objects['hold'];obj.data.calc_loop_triangles()
names=('DamageMainFlag','DamageAftFlag','DamageHoldPortLid','DamageHoldStarboardLid')
indices={name:{v.index for v in obj.data.vertices if any(g.group==obj.vertex_groups[name].index for g in v.groups)} for name in names}
faces={name:[tuple(t.vertices) for t in obj.data.loop_triangles if set(t.vertices)<=indices[name]] for name in names}
records=[]
for key in obj.data.shape_keys.key_blocks:
 vertices=[tuple(p.co) for p in key.data]
 trees={name:BVHTree.FromPolygons(vertices,faces[name],all_triangles=True) for name in names}
 for flag in names[:2]:
  for lid in names[2:]:
   overlaps=trees[flag].overlap(trees[lid])
   records.append(dict(shape=key.name,flag=flag,lid=lid,triangleIntersections=len(overlaps)))
out={'blendSha256':hashlib.sha256(asset.read_bytes()).hexdigest(),'records':records,
     'scope':'Triangle intersections between authored flag and lid groups; excludes projection overlap and clearance of other parts.'}
(HERE/'candidate-validation/hold-clearance.json').write_text(json.dumps(out,indent=2)+'\n')
print(json.dumps(out,indent=2))

assert all(record["triangleIntersections"]==0 for record in records), "Flag intersects a hold lid"
