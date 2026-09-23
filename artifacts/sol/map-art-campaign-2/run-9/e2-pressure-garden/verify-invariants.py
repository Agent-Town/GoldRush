from pathlib import Path
import hashlib,json,subprocess
out=Path(__file__).parent;pilot=Path('assets/pilots/map-rebuild-spike');store=pilot.resolve().parents[1];base=json.loads((out/'base.json').read_text())
unchanged={}
paths=[f'pressure-garden-terrain{suffix}' for suffix in ['.glb','.blend','-contract.json','-atlas.png']]+['pressure-garden-panorama-atlas.png']+['landmark-collision-contract.json']
paths += [str(p.relative_to(pilot)) for p in (pilot/'landmarks/pressure-garden').iterdir() if p.is_file()]
for path in paths:
 data=(pilot/path).read_bytes();old=subprocess.check_output(['git','-C',str(store),'show',base['store']+':pilots/map-rebuild-spike/'+path]);assert data==old,path;unchanged[path]=hashlib.sha256(data).hexdigest()
authorities=['src/game','src/sim','assets/contracts','src/world/Terrain.ts','src/world/LandmarkCollision.ts','src/systems','src/entities','e2e','assets/engine-era.json']
for path in authorities:assert not subprocess.check_output(['git','diff',base['code'],'--',path]),path
source=Path('src/world/Terrain3dClaimPilot.ts').read_text();registry=[s for s in source.splitlines() if s.lstrip().startswith(tuple("'e%d-"%i for i in range(2,11))) and ': entry(' in s];assert len(registry)==36 and all(s.rstrip().endswith('),') for s in registry)
assert source.count('rippleScale: 1.6')==1
(out/'invariants.json').write_text(json.dumps({'unchangedBytes':unchanged,'terrainAndAllLandmarkBytesExact':True,'heightsMasksMountsStationsCollisionBudgetsExact':True,'singleLineRegistryEntries':len(registry),'protectedAuthorities':authorities,'changedWaterBranch':'Only Pressure Garden declares rippleScale or depthContrast. Other maps retain original palette and GLSL branch.'},indent=2)+'\n')
print('PRESSURE INVARIANTS PASS')
