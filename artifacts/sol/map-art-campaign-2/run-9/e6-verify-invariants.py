"""Check each E6 source change against its immutable map-start snapshots."""
from pathlib import Path
import hashlib,json,subprocess,sys
name=sys.argv[1];pack=name.removeprefix('e6-');changed=set(sys.argv[2:])
out=Path('artifacts/sol/map-art-campaign-2/run-9')/name;p=Path('assets/pilots/map-rebuild-spike');store=p.resolve().parents[1]
base=json.loads((out/'base.json').read_text());unchanged={}
def old(path):return subprocess.check_output(['git','-C',str(store),'show',base['store']+':pilots/map-rebuild-spike/'+path])
paths=[f'{pack}-{kind}{s}' for kind in ['terrain','panorama'] for s in ['.glb','.blend','-contract.json','-atlas.png']]
paths+=['landmark-collision-contract.json',f'landmarks/{pack}/{pack}-landmarks-atlas.png']
paths += [str(x.relative_to(p)) for x in (p/f'landmarks/{pack}').glob('*.glb') if x.stem not in changed]
for path in paths:
 data=(p/path).read_bytes();assert data==old(path),path;unchanged[path]=hashlib.sha256(data).hexdigest()
c=f'landmarks/{pack}/{pack}-landmark-pack-contract.json';a=json.loads(old(c));b=json.loads((p/c).read_text())
for k in a:
 if k not in ['assets','blend']:assert a[k]==b[k],k
for id,record in a['assets'].items():
 for k,v in record.items():
  if id in changed and k in ['triangles','sha256']:continue
  assert b['assets'][id][k]==v,(id,k)
assert a['assets'].keys()==b['assets'].keys()
t=json.loads((p/f'{pack}-terrain-contract.json').read_text());assert t['landmarkMounts']==b['mounts']
assert t.get('landmarkAcceptanceStations')==b.get('landmarkAcceptanceStations')
authorities=['src/game','src/sim','assets/contracts','src/world/Terrain.ts','src/world/LandmarkCollision.ts','src/systems','src/entities','e2e','assets/engine-era.json']
for path in authorities:assert not subprocess.check_output(['git','diff',base['code'],'--',path]),path
registry=[s for s in Path('src/world/Terrain3dClaimPilot.ts').read_text().splitlines() if s.lstrip().startswith(tuple("'e%d-"%i for i in range(2,11))) and ': entry(' in s]
assert len(registry)==36 and all(s.rstrip().endswith('),') for s in registry)
(out/'invariants.json').write_text(json.dumps({'unchangedBytes':unchanged,'terrainHeightsMasksRoutesSpawnsCollisionMountsStationsBudgetsExact':True,'primaryBoundsExact':True,'siblingModelsExact':True,'singleLineRegistryEntries':len(registry),'protectedAuthorities':authorities},indent=2)+'\n');print('INVARIANTS PASS',name)
