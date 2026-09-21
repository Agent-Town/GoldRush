"""Verify one rebuilt landmark while all other pack and gameplay-bearing bytes stay fixed."""
from pathlib import Path
import json,subprocess,hashlib,sys
name,pack,mount=sys.argv[1:];pilot=Path('assets/pilots/map-rebuild-spike');out=Path('artifacts/sol/map-art-campaign-2/run-6')/name
base=json.loads((out/'base.json').read_text());store='/Users/robin/Claude/Projects/GoldRush-assets'
original=lambda f:subprocess.check_output(['git','-C',store,'show',base['store']+':pilots/map-rebuild-spike/'+f])
rel=f'landmarks/{pack}/{pack}-landmark-pack-contract.json';old=json.loads(original(rel));new=json.loads((pilot/rel).read_text());rows={}
assert old['mounts']==new['mounts'];assert old['atlas']==new['atlas']
for key,record in new['assets'].items():
 if key==mount:
  before=old['assets'][key].copy();after=record.copy()
  for d in [before,after]:
   for k in ['triangles','sha256','artRevision']:d.pop(k,None)
  assert before==after,(key,'bounds/footprint/provenance drift')
 else:
  assert old['assets'][key]==record
  assert original(record['asset'])==(pilot/record['asset']).read_bytes();rows[key]=True
terrain=json.loads((pilot/f'{pack}-terrain-contract.json').read_text());before=json.loads(original(f'{pack}-terrain-contract.json'))
for d in [terrain,before]:d.pop('landmarkAcceptanceStations',None)
assert before==terrain,'terrain truth, mounts or sampler drift'
assert new['landmarkAcceptanceStations']==json.loads((pilot/f'{pack}-terrain-contract.json').read_text())['landmarkAcceptanceStations']
for f in [terrain['asset'],terrain['panoramaMount']['asset'],f'{pack}-terrain-atlas.png',f'{pack}-panorama-atlas.png',f'{pack}-panorama-contract.json','landmark-collision-contract.json',f'landmarks/{pack}/{pack}-landmarks-atlas.png']:
 data=(pilot/f).read_bytes();assert data==original(f),f;rows[f]=hashlib.sha256(data).hexdigest()
assert subprocess.check_output(['git','show',base['code']+':src/world/LandmarkCollision.ts'])==Path('src/world/LandmarkCollision.ts').read_bytes()
(out/'invariants.json').write_text(json.dumps({'unchanged':rows,'originalBodyBoundsAndFootprint':True,'mountsAndGameplayTruthUnchanged':True,'collisionCodeAndRegistryUnchanged':True,'stationMetadataMirrored':True,'terrainSamplerUnchanged':True},indent=2)+'\n')
print(name,'rebuilt-body invariants pass')
