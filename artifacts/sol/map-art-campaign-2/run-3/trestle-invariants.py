"""Read-only saved-source, route and terrain invariants for the Trestle correction."""
from pathlib import Path
import bpy,hashlib,json,subprocess,math
root=Path.cwd();base='ddfb210f5e8dacdc3595a9370d8498a7934427a8'
def read(path):
 bpy.ops.wm.open_mainfile(filepath=str(path))
 return {o.name:{'vertices':[tuple(v.co) for v in o.data.vertices],'faces':[tuple(p.vertices) for p in o.data.polygons],'uv':[tuple(l.uv) for l in o.data.uv_layers.active.data],'matrix':[list(row) for row in o.matrix_world]} for o in bpy.data.objects if o.type=='MESH'}
before=read(root/'artifacts/sol/map-art-campaign-2/_raw/run-3/e2-trestle-before/trestle-landmarks.blend')
after=read(root/'assets/pilots/map-rebuild-spike/landmarks/trestle/trestle-landmarks.blend')
assert set(before)==set(after);rows=[]
for key,b in before.items():
 a=after[key];assert a['faces']==b['faces'] and a['uv']==b['uv'] and a['matrix']==b['matrix']
 assert len(a['vertices'])==len(b['vertices'])
 changed=[i for i,(v,w) in enumerate(zip(a['vertices'],b['vertices'])) if v!=w]
 assert len(changed)==(104 if key=='mine-spur-kit' else 0)
 for axis in range(3):
  for fn in [min,max]:assert fn(v[axis] for v in a['vertices'])==fn(v[axis] for v in b['vertices'])
 rows.append({'id':key,'vertices':len(b['vertices']),'faces':len(b['faces']),'uvLoops':len(b['uv']),'movedVertices':len(changed),'topologyUvsBoundsAndTransformUnchanged':True})
paths=['assets/pilots/map-rebuild-spike/trestle-terrain.glb','assets/pilots/map-rebuild-spike/trestle-panorama.glb','assets/pilots/map-rebuild-spike/landmarks/trestle/trestle-landmarks-atlas.png','assets/pilots/map-rebuild-spike/landmark-collision-contract.json']
for key in before:
 if key!='mine-spur-kit':paths.append(f'assets/pilots/map-rebuild-spike/landmarks/trestle/{key}.glb')
unchanged={}
for path in paths:
 data=(root/path).read_bytes();assert data==subprocess.check_output(['git','show',f'{base}:{path}']);unchanged[path]=hashlib.sha256(data).hexdigest()
subprocess.run(['git','diff','--exit-code',base,'--','assets/contracts','src/sim','src/game','src/world/Terrain.ts','src/world/RailPath.ts','src/world/LightRig.ts'],check=True)
# Project only the 13 moved components onto the unchanged declared rail paths.
factory=json.loads((root/'assets/contracts/epoch-2-steamworks/contracts.json').read_text())
contract=next(c for c in factory['contracts'] if c['id']=='e2-trestle')
paths=[[(p['x'],p['z']) for p in row['points']] for row in contract['tileParams']['rails']]
changed={i for i,(v,w) in enumerate(zip(before['mine-spur-kit']['vertices'],after['mine-spur-kit']['vertices'])) if v!=w}
faces=[f for f in before['mine-spur-kit']['faces'] if set(f)<=changed]
edges={tuple(sorted((a,b))) for f in faces for a,b in zip(f,f[1:]+f[:1])}
c,s=math.cos(-.1),math.sin(-.1)
def world(v):return (-14+c*v[0]-s*v[1],-18-s*v[0]-c*v[1])
def cross(a,b,c):return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
def point_segment(p,a,b):
 dx,dz=b[0]-a[0],b[1]-a[1];t=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(dx*dx+dz*dz)))
 return math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz)
def distance(a,b,c,d):
 if cross(a,b,c)*cross(a,b,d)<0 and cross(c,d,a)*cross(c,d,b)<0:return 0
 return min(point_segment(a,c,d),point_segment(b,c,d),point_segment(c,a,b) if a!=b else math.dist(c,a),point_segment(d,a,b) if a!=b else math.dist(d,a))
clearance={}
for name,body in [('before',before['mine-spur-kit']),('after',after['mine-spur-kit'])]:
 vertices=[world(v) for v in body['vertices']]
 clearance[name]=min(distance(vertices[a],vertices[b],u,v) for a,b in edges for path in paths for u,v in zip(path,path[1:]))
assert clearance['before']==0 and clearance['after']>2
report={'base':base,'bodies':rows,'unchangedBytes':unchanged,'gameplayAndRailRouteDiffEmpty':True,'movedStockFootprintDistanceToDeclaredRailCenterlines':clearance,'railClearanceMethod':'Minimum 2D distance from edges of the 13 moved components to both unchanged factory rail polylines, using the original mount yaw and position. This measures scenery separation, not a new collision footprint.'}
(root/'artifacts/sol/map-art-campaign-2/run-3/e2-trestle/geometry-invariants.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
