from pathlib import Path
import bpy,json,os
from mathutils.bvhtree import BVHTree
root=Path.cwd();out=root/'artifacts/boss-fidelity/e8-salvage-claw'/os.environ.get('CLAW_CANDIDATE','candidate-v9')
bpy.ops.wm.open_mainfile(filepath=str(out/'salvage-claw.blend'))
crown=bpy.data.objects['crown'];winch=bpy.data.objects['winch'];feet=bpy.data.objects['anchor_feet']
def coords(obj):return [v.co.copy() for v in obj.data.shape_keys.key_blocks[1].data]
def vertices(group):
 index=crown.vertex_groups[group].index
 return {v.index for v in crown.data.vertices if any(g.group==index and g.weight>0 for g in v.groups)}
cc=coords(crown);wc=coords(winch);wb=BVHTree.FromPolygons(wc,[list(p.vertices) for p in winch.data.polygons])
report={'ladders':[]}
for n in range(2):
 ids=vertices(f'LandingLadder{n}');polys=[list(p.vertices) for p in crown.data.polygons if all(i in ids for i in p.vertices)]
 ladder=BVHTree.FromPolygons(cc,polys);overlap=ladder.overlap(wb)
 low=min(cc[i].z for i in ids);high=max(cc[i].z for i in ids)
 assert abs(low-.12)<1e-4 and high>6,'Ladder must reach the floor and promenade'
 assert not overlap,f'Ladder {n} intersects landed winch: {len(overlap)} triangle pairs'
 report['ladders'].append({'index':n,'minZ':low,'maxZ':high,'winchTriangleIntersections':len(overlap)})
report['footMinZ']=min(v.z for v in coords(feet));assert report['footMinZ']>=-1e-5
report['images']=[{'name':i.name,'size':list(i.size)} for i in bpy.data.images if i.size[0]>0]
(out/'access-check.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
