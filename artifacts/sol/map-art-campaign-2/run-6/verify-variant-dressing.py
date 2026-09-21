"""Prove variant dressing retains the base bodies and every collision-bearing byte."""
from pathlib import Path
import json,subprocess,hashlib,sys
name,variant,base_pack=sys.argv[1:];p=Path('assets/pilots/map-rebuild-spike');out=Path('artifacts/sol/map-art-campaign-2/run-6')/name;base=json.loads((out/'base.json').read_text());store='/Users/robin/Claude/Projects/GoldRush-assets';original=lambda f:subprocess.check_output(['git','-C',store,'show',base['store']+':pilots/map-rebuild-spike/'+f]);rows={}
for pack in [base_pack,variant]:
 rel=f'landmarks/{pack}/{pack}-landmark-pack-contract.json';old=json.loads(original(rel));new=json.loads((p/rel).read_text());assert old['assets']==new['assets'];assert old['atlas']==new['atlas'];assert old['blend']==new['blend']
 for r in new['assets'].values():
  data=(p/r['asset']).read_bytes();assert data==original(r['asset']);rows[r['asset']]=hashlib.sha256(data).hexdigest()
 if pack==base_pack:assert old==new
 else:
  for b,a in zip(old['mounts'],new['mounts']):
   a=a.copy();a.pop('contractIds');assert a==b
for rel in [f'{base_pack}-terrain.glb',f'{base_pack}-panorama.glb',f'{base_pack}-terrain-contract.json',f'{base_pack}-panorama-contract.json','landmark-collision-contract.json']:
 data=(p/rel).read_bytes();assert data==original(rel);rows[rel]=hashlib.sha256(data).hexdigest()
assert subprocess.check_output(['git','show',base['code']+':src/world/LandmarkCollision.ts'])==Path('src/world/LandmarkCollision.ts').read_bytes()
a=json.loads((p/f'{variant}-terrain-contract.json').read_text());b=json.loads(original(f'{variant}-terrain-contract.json'));assert a['maskTruth']==b['maskTruth'];assert a['sculptVerdict']==b['sculptVerdict'];pack=json.loads((p/f'landmarks/{variant}/{variant}-landmark-pack-contract.json').read_text());assert a['landmarkMounts']==pack['mounts'];assert a['landmarkAcceptanceStations']==pack['landmarkAcceptanceStations'];active=[m for m in pack['mounts'] if m['contractIds']];assert active and all('footprint' not in pack['assets'][m['id']] for m in active)
(out/'invariants.json').write_text(json.dumps({'unchangedAssetSha256':rows,'baseBodiesRetained':True,'collisionCodeAndRegistryUnchanged':True,'activeAdditionalMounts':[m['id'] for m in active],'additionalBodiesHaveNoAuthoredBlocker':True,'heldForCollisionAlias':[m['id'] for m in pack['mounts'] if not m['contractIds']],'allSourceMountTransformsUnchanged':True,'mirroredMountFiltersAndStations':True},indent=2)+'\n');print(name,'invariant checks pass')
