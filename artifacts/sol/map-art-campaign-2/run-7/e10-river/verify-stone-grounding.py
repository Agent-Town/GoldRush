"""Read the saved Blender bodies; verify each disconnected stone intersects the grid."""
from pathlib import Path
from array import array
import bpy, json, math
out=Path(__file__).parent
pilot=Path.cwd()/'assets/pilots/map-rebuild-spike'
grid=json.loads((pilot/'river-fallback-height-grid.json').read_text())
heights=array('f',grid['heights'])
contract=json.loads((pilot/'river-terrain-contract.json').read_text())
mounts={m['id']:m['position'] for m in contract['landmarkMounts']}
def height(x,z):
    x=max(0,min(127.99999,x+64));z=max(0,min(127.99999,z+64))
    ix,iz=math.floor(x),math.floor(z);u,v=x-ix,z-iz
    a,b=heights[iz*129+ix:iz*129+ix+2];c,d=heights[(iz+1)*129+ix:(iz+1)*129+ix+2]
    return a+(b-a)*u+(d-b)*v if u>=v else a+(d-c)*u+(c-a)*v
bpy.ops.wm.open_mainfile(filepath=str(pilot/'landmarks/river/river-landmarks.blend'))
rows=[]
for obj in [o for o in bpy.data.objects if o.type=='MESH']:
    mx,_,mz=mounts[obj.name]
    neighbors=[set() for _ in obj.data.vertices]
    for edge in obj.data.edges:
        a,b=edge.vertices;neighbors[a].add(b);neighbors[b].add(a)
    remaining=set(range(len(neighbors)));stones=[]
    while remaining:
        start=remaining.pop();component=[start];queue=[start]
        while queue:
            for v in neighbors[queue.pop()] & remaining:
                remaining.remove(v);component.append(v);queue.append(v)
        points=[obj.matrix_world @ obj.data.vertices[i].co for i in component]
        clearances=[p.z+height(mx,mz)-height(mx+p.x,mz-p.y) for p in points]
        stone={'vertices':len(points),'lowestClearance':min(clearances),'highestClearance':max(clearances)}
        assert stone['lowestClearance']<0<stone['highestClearance'],(obj.name,stone)
        if obj.name=='ford-wet-stones':
            stone['nearestCenterlineX']=min(abs(p.x) for p in points)
            assert stone['nearestCenterlineX']>1.1,stone
        stones.append(stone)
    rows.append({'id':obj.name,'stones':stones,'allIntersectGround':True})
assert sum(len(r['stones']) for r in rows)==132
(out/'stone-grounding.json').write_text(json.dumps({'method':'Saved source connected components against the exported Float32 triangle grid. Negative lowest and positive highest clearance prove embedded bases, not visible shadow quality.','rows':rows,'stones':132,'centerFordClearHalfWidth':1.1},indent=2)+'\n')
print('132 stones intersect the drawn grid; centre ford clear at |x| <= 1.1 m')
