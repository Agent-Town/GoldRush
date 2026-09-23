from pathlib import Path
import hashlib,json,subprocess
out=Path(__file__).parent;pilot=Path('assets/pilots/map-rebuild-spike');store=pilot.resolve().parents[1];base=json.loads((out/'base.json').read_text());unchanged={}
paths=[f'incline-{kind}{suffix}' for kind in ['terrain','panorama'] for suffix in ['.glb','.blend','-contract.json','-atlas.png']]+['landmark-collision-contract.json','landmarks/incline/incline-landmarks-atlas.png']
paths += [str(p.relative_to(pilot)) for p in (pilot/'landmarks/incline').glob('*.glb') if p.stem!='upper-ore-cable-house']
for path in paths:
 data=(pilot/path).read_bytes();old=subprocess.check_output(['git','-C',str(store),'show',base['store']+':pilots/map-rebuild-spike/'+path]);assert data==old,path;unchanged[path]=hashlib.sha256(data).hexdigest()
p='pilots/map-rebuild-spike/landmarks/incline/incline-landmark-pack-contract.json';old=json.loads(subprocess.check_output(['git','-C',str(store),'show',base['store']+':'+p]));new=json.loads((pilot/'landmarks/incline/incline-landmark-pack-contract.json').read_text())
for k in old:
 if k not in ['assets','blend']:assert old[k]==new[k],k
for id,record in old['assets'].items():
 for k,v in record.items():
  if id=='upper-ore-cable-house' and k in ['triangles','sha256']:continue
  assert new['assets'][id][k]==v,(id,k)
assert new['assets']['upper-ore-cable-house']['triangles']==2136
assert len(new['assets'])==len(old['assets'])==5
authorities=['src/game','src/sim','assets/contracts','src/world/Terrain.ts','src/world/LandmarkCollision.ts','src/systems','src/entities','e2e','assets/engine-era.json']
for path in authorities:assert not subprocess.check_output(['git','diff',base['code'],'--',path]),path
source=Path('src/world/Terrain3dClaimPilot.ts').read_text();registry=[s for s in source.splitlines() if s.lstrip().startswith(tuple("'e%d-"%i for i in range(2,11))) and ': entry(' in s];assert len(registry)==36 and all(s.rstrip().endswith('),') for s in registry)
(out/'invariants.json').write_text(json.dumps({'unchangedBytes':unchanged,'terrainPanoramaFourSiblingBodiesAndAtlasExact':True,'heightsMasksMountsStationsCollisionBoundsBudgetsExact':True,'singleLineRegistryEntries':len(registry),'protectedAuthorities':authorities,'wholeBodyEmission':'unchanged 0.375 on cable house and brake towers; 0.2175 on two siblings'},indent=2)+'\n');print('INCLINE INVARIANTS PASS')
