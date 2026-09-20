from pathlib import Path
import bpy,json
from mathutils.bvhtree import BVHTree
HERE=Path(__file__).resolve().parent
bpy.ops.wm.open_mainfile(filepath=str(HERE/'candidate-model/homemaker-9000.blend'))
obj=bpy.data.objects['core'];points=[v.co.copy() for v in obj.data.shape_keys.key_blocks['Damage_ChairPose'].data]
def tree(group):
 number=obj.vertex_groups[group].index
 indices={v.index for v in obj.data.vertices if any(g.group==number and g.weight>.5 for g in v.groups)}
 faces=[list(p.vertices) for p in obj.data.polygons if all(i in indices for i in p.vertices)]
 assert faces,group
 return BVHTree.FromPolygons(points,faces,all_triangles=False),faces
a,body_faces=tree('ChairBody');b,back_faces=tree('ChairBackPanel');pairs=a.overlap(b)
current_polygons=[list(p.vertices) for p in obj.data.polygons]
bpy.ops.wm.open_mainfile(filepath=str(HERE/'iterations/11/homemaker-9000.blend'))
old=bpy.data.objects['core'];assert [list(p.vertices) for p in old.data.polygons]==current_polygons,'Positive control requires identical vertex topology'
old_points=[v.co.copy() for v in old.data.shape_keys.key_blocks['Damage_ChairPose'].data]
old_pairs=BVHTree.FromPolygons(old_points,body_faces).overlap(BVHTree.FromPolygons(old_points,back_faces))
report={'scope':'Final chair morph, authored rounded body versus chair back panel surface intersection. This does not certify all unrelated mesh intersections.','bodyFaces':len(body_faces),'backFaces':len(back_faces),'positiveControlV11Pairs':len(old_pairs),'intersectionPairs':len(pairs),'passed':not pairs}
(HERE/'chair-back-12.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report));assert old_pairs,'Positive control must reproduce the V11 chair intersection';assert not pairs,'Chair back intersects body'
