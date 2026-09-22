from pathlib import Path
import json,hashlib,subprocess
out=Path(__file__).parent;pilot=Path('assets/pilots/map-rebuild-spike');base=json.loads((out/'base.json').read_text());store='/Users/robin/Claude/Projects/GoldRush-assets'
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
terrain=json.loads((pilot/'river-terrain-contract.json').read_text());pack=json.loads((pilot/'landmarks/river/river-landmark-pack-contract.json').read_text());truth=json.loads(Path('assets/contracts/epoch-10-deepsky/mask-tables/e10-river.json').read_text())
assert all(terrain[k]==v for k,v in truth.items());assert terrain['landmarkMounts']==pack['mounts'];assert terrain['landmarkAcceptanceStations']==pack['landmarkAcceptanceStations']
assert len(pack['mounts'])==5
assert all(m['rotation']==[0,0,0] and m['scale']==[1,1,1] and m['position'][1]==0 for m in pack['mounts'])
assert all(not any(k in a for k in ['footprint','footprints','walkSurfaces']) for a in pack['assets'].values())
assert all(a['blocking'].startswith('none;') for a in pack['assets'].values())
for key,value in [('min',-64),('max',64)]:assert terrain['boundsMeters'][key][:2]==[value,value]
unchanged=[]
for prefix in ['src/game','src/sim','src/meta','src/story','src/systems/E10FinaleSystem.ts','src/world/Terrain.ts','src/world/Water.ts','src/world/LandmarkCollision.ts','assets/engine-era.json','e2e']:
 assert not subprocess.check_output(['git','diff',base['code'],'--',prefix]),prefix;unchanged.append(prefix)
assert not subprocess.check_output(['git','-C',store,'diff',base['store'],'--','pilots/map-rebuild-spike/landmark-collision-contract.json'])
changes=subprocess.check_output(['git','-C',store,'diff','--diff-filter=M','--name-only',base['store']],text=True).splitlines();assert changes==['pilots/map-rebuild-spike/landmarks/landmark-source-ledger.json'],changes
ledgerPath='pilots/map-rebuild-spike/landmarks/landmark-source-ledger.json';prior=json.loads(subprocess.check_output(['git','-C',store,'show',base['store']+':'+ledgerPath]));current=json.loads((Path(store)/ledgerPath).read_text());current['packs'].pop('river');assert current==prior
rasters={}
for copy in json.loads((pilot/'river-source-provenance.json').read_text())['copies']:
 assert (pilot/copy['target']).read_bytes()==Path(copy['source']).read_bytes()
 rasters[copy['target']]={**copy,'byteIdentical':True}
prior=(out/'before-source/contracts.json').read_text();now=Path('assets/contracts/epoch-10-deepsky/contracts.json').read_text()
expected=prior.replace('at dawn with no new sculpt;', 'at dawn with a dedicated render-only River pack;')
assert now==expected
result={'canonicalMasksByteEquivalent':True,'contractOnlyDescriptionChanged':True,'terrainMeshFlagUnchanged':'off; renderer registry mount does not need a descriptor flag','mountsMirrored':True,'zeroNewCollisionsOrWalkSurfaces':True,'unchangedCodeAndGameplay':unchanged,'existingStoreAssetsUnchangedExceptAdditiveSourceLedger':True,'rasters':rasters}
(out/'invariants.json').write_text(json.dumps(result,indent=2)+'\n');print('INVARIANTS PASS')
