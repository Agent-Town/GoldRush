from pathlib import Path
import json,hashlib,subprocess
out=Path(__file__).parent;pilot=Path('assets/pilots/map-rebuild-spike');base=json.loads((out/'base.json').read_text());store='/Users/robin/Claude/Projects/GoldRush-assets'
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
terrain=json.loads((pilot/'last-claim-terrain-contract.json').read_text());pack=json.loads((pilot/'landmarks/last-claim/last-claim-landmark-pack-contract.json').read_text());truth=json.loads(Path('assets/contracts/epoch-10-deepsky/mask-tables/e10-last-claim.json').read_text())
assert all(terrain[k]==v for k,v in truth.items());assert terrain['landmarkMounts']==pack['mounts'];assert terrain['landmarkAcceptanceStations']==pack['landmarkAcceptanceStations']
assert len(pack['mounts'])==5
assert all(m['rotation']==[0,0,0] and m['scale']==[1,1,1] and m['position'][1]==0 for m in pack['mounts'])
assert all(not any(k in a for k in ['footprint','footprints','walkSurfaces']) for a in pack['assets'].values())
for m,x in zip(pack['mounts'][:3],[-10,0,10]):assert m['position']==[x,0,47]
for key,value in [('min',-64),('max',64)]:assert terrain['boundsMeters'][key][:2]==[value,value]
unchanged=[]
for prefix in ['src/game','src/sim','assets/contracts','src/world/Terrain.ts','src/world/LandmarkCollision.ts','assets/engine-era.json']:
 assert not subprocess.check_output(['git','diff',base['code'],'--',prefix]),prefix;unchanged.append(prefix)
assert not subprocess.check_output(['git','-C',store,'diff',base['store'],'--','pilots/map-rebuild-spike/landmark-collision-contract.json'])
changes=subprocess.check_output(['git','-C',store,'diff','--diff-filter=M','--name-only',base['store']],text=True).splitlines();assert changes==['pilots/map-rebuild-spike/landmarks/landmark-source-ledger.json'],changes
ledgerPath='pilots/map-rebuild-spike/landmarks/landmark-source-ledger.json';prior=json.loads(subprocess.check_output(['git','-C',store,'show',base['store']+':'+ledgerPath]));current=json.loads((Path(store)/ledgerPath).read_text());current['packs'].pop('last-claim');assert current==prior
rasters={}
for dest,source in [('last-claim-terrain-atlas.png',Path('assets/raw/archive-world-floor-material-v1.png')),('last-claim-panorama-atlas.png',pilot/'archive-world-panorama-atlas.png'),('landmarks/last-claim/last-claim-landmarks-atlas.png',pilot/'landmarks/archive-world/archive-world-landmarks-atlas.png')]:
 assert (pilot/dest).read_bytes()==source.read_bytes();rasters[dest]={'source':str(source),'sha256':sha(source),'byteIdentical':True}
result={'newDedicatedPack':True,'activeAdditionalMounts':[m['id'] for m in pack['mounts']],'maskTruthExactCanonical':True,'mountsAndStationsMirrored':True,'fullSquareGameplayFloorRetained':True,'noNewCollisionOrWalkSurface':True,'preserveSitesUnchanged':'monuments offset 3 m behind sites, on original radius boundary','unchangedCodeAndGameplay':unchanged,'allExistingStoreAssetsUnchangedExceptAdditiveSourceLedger':True,'rasters':rasters,'newPackBudgetProof':'asset-budgets.json','heightProof':'height-proof.json'}
(out/'invariants.json').write_text(json.dumps(result,indent=2)+'\n');print('INVARIANTS PASS')
