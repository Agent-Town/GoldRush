from pathlib import Path
import json,hashlib,subprocess,struct
out=Path(__file__).parent; pilot=Path('assets/pilots/map-rebuild-spike');store=Path('/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets');base=json.loads((out/'base.json').read_text())
def old(p):return subprocess.check_output(['git','-C',str(store),'show',base['store']+':pilots/map-rebuild-spike/'+p])
def doc(p):return json.loads((pilot/p).read_text())
terrain=doc('last-claim-terrain-contract.json'); prior=json.loads(old('last-claim-terrain-contract.json'));pack=doc('landmarks/last-claim/last-claim-landmark-pack-contract.json')
for key in ['landmarkMounts','landmarkAcceptanceStations','panoramaMount','boundsMeters','heightDerivation','maskTable','buildZones','riverBands','fords','spawnLanes','claimStake']:
 assert terrain.get(key)==prior.get(key),key
assert terrain['landmarkMounts']==pack['mounts'] and terrain['landmarkAcceptanceStations']==pack['landmarkAcceptanceStations']
# Decode POSITION accessors and compare exact coordinate bytes, not only bounds.
def positions(data):
 n=struct.unpack_from('<I',data,12)[0];d=json.loads(data[20:20+n]);binary=data[28+n:];result=[]
 for mesh in d['meshes']:
  for p in mesh['primitives']:
   a=d['accessors'][p['attributes']['POSITION']];v=d['bufferViews'][a['bufferView']];start=v.get('byteOffset',0)+a.get('byteOffset',0);stride=v.get('byteStride',12)
   result += [struct.unpack_from('<fff',binary,start+i*stride) for i in range(a['count'])]
 return sorted(set(result))
def surface(data):
 n=struct.unpack_from('<I',data,12)[0];d=json.loads(data[20:20+n]);binary=data[28+n:];triangles=[]
 def access(i):
  a=d['accessors'][i];v=d['bufferViews'][a['bufferView']];kind={5126:'f',5125:'I',5123:'H'}[a['componentType']];count={'SCALAR':1,'VEC3':3}[a['type']];fmt='<'+kind*count;size=struct.calcsize(fmt);offset=v.get('byteOffset',0)+a.get('byteOffset',0)
  return [struct.unpack_from(fmt,binary,offset+j*v.get('byteStride',size)) for j in range(a['count'])]
 for mesh in d['meshes']:
  for p in mesh['primitives']:
   vertices=access(p['attributes']['POSITION']);indices=[a[0] for a in access(p['indices'])]
   triangles.extend(tuple(sorted(vertices[j] for j in indices[i:i+3])) for i in range(0,len(indices),3))
 return sorted(triangles)
assert surface(old('last-claim-terrain.glb'))==surface((pilot/'last-claim-terrain.glb').read_bytes())
assert positions(old('last-claim-terrain.glb'))==positions((pilot/'last-claim-terrain.glb').read_bytes())
unchanged=['src/game','src/sim','assets/contracts','src/world/Terrain.ts','src/world/LandmarkCollision.ts','src/systems','e2e','assets/engine-era.json']
for path in unchanged:assert not subprocess.check_output(['git','diff',base['code'],'--',path]),path
assert not subprocess.check_output(['git','-C',str(store),'diff',base['store'],'--','pilots/map-rebuild-spike/landmark-collision-contract.json'])
current=Path('src/world/Terrain3dClaimPilot.ts').read_text();before=subprocess.check_output(['git','show',base['code']+':src/world/Terrain3dClaimPilot.ts'],text=True)
start='function paintLastClaimDeck(';end='/** The raw River keeps'
def exclude(s):a=s.index(start);b=s.index(end,a);return s[:a]+s[b:]
assert exclude(current)==exclude(before)
rows=[]
for line in current.splitlines():
 if line.lstrip().startswith(tuple("'e%d-"%i for i in range(2,11))) and ': entry(' in line:
  assert line.rstrip().endswith('),'),line;rows.append(line.split("'")[1])
# Existing bodies retain geometry, bounds and mounts; source export may change metadata ordering.
for name,a in pack['assets'].items():assert positions(old(a['asset']))==positions((pilot/a['asset']).read_bytes()),name
report={'terrainPositionCoordinatesByteEquivalent':True,'triangleSurfacesExact':True,'heightAndMaskTruthUnchanged':True,'landmarkGeometryBoundsAndMountsUnchanged':True,'mirroredMountsAndStations':True,'unchangedAuthorities':unchanged,'onlyNamedRenderFunctionChanged':True,'singleLineRegistryEntries':len(rows),'perimeter':'32 bays; centerline at max(abs(x),abs(z)) = 64.6 m, outside all playable points; no colliders','nativeSources':'assets/pilots/map-rebuild-spike/sources/last-claim-fidelity-1/provenance.json'}
(out/'invariants.json').write_text(json.dumps(report,indent=2)+'\n');print('INVARIANTS PASS')
