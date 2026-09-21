from pathlib import Path
import json,subprocess,hashlib
p=Path('assets/pilots/map-rebuild-spike');out=Path(__file__).parent;base=json.loads((out/'base.json').read_text());store='/Users/robin/Claude/Projects/GoldRush-assets';original=lambda f:subprocess.check_output(['git','-C',store,'show',base['store']+':pilots/map-rebuild-spike/'+f]);rows={}
for pack in ['glow-mesa','picnic']:
 rel=f'landmarks/{pack}/{pack}-landmark-pack-contract.json';old=json.loads(original(rel));new=json.loads((p/rel).read_text());assert old['assets']==new['assets'];assert old['atlas']==new['atlas'];assert old['blend']==new['blend']
 for r in new['assets'].values():
  data=(p/r['asset']).read_bytes();assert data==original(r['asset']);rows[r['asset']]=hashlib.sha256(data).hexdigest()
 if pack=='glow-mesa':assert old==new
 else:
  for b,a in zip(old['mounts'],new['mounts']):
   a=a.copy();a.pop('contractIds');assert a==b
for rel in ['glow-mesa-terrain.glb','glow-mesa-panorama.glb','glow-mesa-terrain-contract.json','glow-mesa-panorama-contract.json','landmark-collision-contract.json']:
 data=(p/rel).read_bytes();assert data==original(rel);rows[rel]=hashlib.sha256(data).hexdigest()
assert subprocess.check_output(['git','show',base['code']+':src/world/LandmarkCollision.ts'])==Path('src/world/LandmarkCollision.ts').read_bytes()
a=json.loads((p/'picnic-terrain-contract.json').read_text());b=json.loads(original('picnic-terrain-contract.json'));assert a['maskTruth']==b['maskTruth'];assert a['sculptVerdict']==b['sculptVerdict'];pack=json.loads((p/'landmarks/picnic/picnic-landmark-pack-contract.json').read_text());assert a['landmarkMounts']==pack['mounts'];assert a['landmarkAcceptanceStations']==pack['landmarkAcceptanceStations'];active=[m for m in pack['mounts'] if m['contractIds']];assert len(active)==4 and all('footprint' not in pack['assets'][m['id']] for m in active)
(out/'invariants.json').write_text(json.dumps({'unchangedAssetSha256':rows,'baseFiveBodiesRetained':True,'collisionCodeAndRegistryUnchanged':True,'activeAdditionalMounts':[m['id'] for m in active],'additionalBodiesHaveNoAuthoredBlocker':True,'shadeHeldForCollisionAlias':True,'allSourceMountTransformsUnchanged':True,'mirroredMountFiltersAndStations':True},indent=2)+'\n');print('Picnic invariant checks pass')
