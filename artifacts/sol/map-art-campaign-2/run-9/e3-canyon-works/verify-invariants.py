from pathlib import Path
import hashlib,json,subprocess
out=Path(__file__).parent;p=Path('assets/pilots/map-rebuild-spike');store=p.resolve().parents[1];base=json.loads((out/'base.json').read_text());unchanged={}
paths=[f'canyon-works-terrain{s}' for s in ['.glb','.blend','-contract.json','-atlas.png']]+['canyon-works-panorama-atlas.png','landmark-collision-contract.json','landmarks/canyon-works/canyon-works-landmarks-atlas.png']
paths += [str(x.relative_to(p)) for x in (p/'landmarks/canyon-works').glob('*.glb') if x.stem!='sub-hall-dynamo-house']
for path in paths:
 data=(p/path).read_bytes();old=subprocess.check_output(['git','-C',str(store),'show',base['store']+':pilots/map-rebuild-spike/'+path]);assert data==old,path;unchanged[path]=hashlib.sha256(data).hexdigest()
c='landmarks/canyon-works/canyon-works-landmark-pack-contract.json';old=json.loads(subprocess.check_output(['git','-C',str(store),'show',base['store']+':pilots/map-rebuild-spike/'+c]));new=json.loads((p/c).read_text())
for k in old:
 if k not in ['assets','blend']:assert old[k]==new[k],k
for name,record in old['assets'].items():
 for k,v in record.items():
  if name=='sub-hall-dynamo-house' and k in ['triangles','sha256']:continue
  assert new['assets'][name][k]==v,(name,k)
assert len(new['assets'])==len(old['assets'])==5
terrain=json.loads((p/'canyon-works-terrain-contract.json').read_text());assert terrain['landmarkMounts']==new['mounts'];assert terrain['landmarkAcceptanceStations']==new['landmarkAcceptanceStations']
authorities=['src/game','src/sim','assets/contracts','src/world/Terrain.ts','src/world/LandmarkCollision.ts','src/systems','src/entities','e2e','assets/engine-era.json']
for path in authorities:assert not subprocess.check_output(['git','diff',base['code'],'--',path]),path
source=Path('src/world/Terrain3dClaimPilot.ts').read_text();registry=[s for s in source.splitlines() if s.lstrip().startswith(tuple("'e%d-"%i for i in range(2,11))) and ': entry(' in s];assert len(registry)==36 and all(s.rstrip().endswith('),') for s in registry)
(out/'invariants.json').write_text(json.dumps({'unchangedBytes':unchanged,'terrainHeightsMasksRoutesSpawnsCollisionMountsStationsBudgetsExact':True,'primaryBoundsExact':True,'fourSiblingModelsExact':True,'singleLineRegistryEntries':len(registry),'protectedAuthorities':authorities},indent=2)+'\n');print('CANYON INVARIANTS PASS')
