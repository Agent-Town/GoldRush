from pathlib import Path
import bpy,json,os
from mathutils.bvhtree import BVHTree
out=Path.cwd()/os.environ.get('DIGGER_CANDIDATE','artifacts/boss-fidelity/e9-old-digger/candidate-v4')
bpy.ops.wm.open_mainfile(filepath=str(out/'old-digger.blend'))
g=bpy.data.objects['gantry'];body=bpy.data.objects['tape_deck']
coords=lambda o:[v.co.copy() for v in o.data.shape_keys.key_blocks[1].data]
gc=coords(g);bc=coords(body);group=g.vertex_groups['RedemptionBoardingSteps'].index
ids={v.index for v in g.data.vertices if any(x.group==group and x.weight>0 for x in v.groups)}
low=min(gc[i].z for i in ids);high=max(gc[i].z for i in ids)
polys=[list(p.vertices) for p in g.data.polygons if all(i in ids for i in p.vertices) and max(gc[i].z for i in p.vertices)<high-.15]
ladder=BVHTree.FromPolygons(gc,polys);hull=BVHTree.FromPolygons(bc,[list(p.vertices) for p in body.data.polygons])
overlap=ladder.overlap(hull)
report={'ladderMinZ':low,'ladderMaxZ':high,'ladderBodyIntersectionsBelowTopJoint':len(overlap),'excludedTopJointDepth':.15}
(out/'access-check.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
assert abs(low-.1)<1e-4 and high>3.5
assert not overlap,report
