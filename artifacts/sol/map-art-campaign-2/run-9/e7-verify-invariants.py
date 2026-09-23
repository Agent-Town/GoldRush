"""E7 visual-only boundary proof against the immutable map-start store commit."""
from pathlib import Path
import hashlib,json,subprocess
out=Path('artifacts/sol/map-art-campaign-2/run-9/e7-dead-band')
p=Path('assets/pilots/map-rebuild-spike');store=p.resolve().parents[1]
base=json.loads((out/'base.json').read_text());unchanged={}
changed={'iron-shadow-warning-frame','north-silence-gate'}
def old(path):return subprocess.check_output(['git','-C',str(store),'show',base['store']+':pilots/map-rebuild-spike/'+path])
paths=[f'relay-valley-{kind}{suffix}' for kind in ['terrain','panorama'] for suffix in ['.glb','.blend','-contract.json','-atlas.png']]
paths+=['dead-band-terrain-contract.json','relay-rush-terrain-contract.json','landmark-collision-contract.json']
for pack in ['relay-valley','dead-band','relay-rush']:
    paths+= [str(x.relative_to(p)) for x in (p/f'landmarks/{pack}').glob('*') if x.is_file() and (pack!='dead-band' or x.suffix=='.png' or (x.suffix=='.glb' and x.stem not in changed))]
for path in paths:
    data=(p/path).read_bytes();assert data==old(path),path
    unchanged[path]=hashlib.sha256(data).hexdigest()
contract='landmarks/dead-band/dead-band-landmark-pack-contract.json'
a=json.loads(old(contract));b=json.loads((p/contract).read_text())
for k in a:
    if k not in ['assets','blend']:assert a[k]==b[k],k
for id,record in a['assets'].items():
    for k,v in record.items():
        if id in changed and k in ['triangles','sha256']:continue
        assert b['assets'][id][k]==v,(id,k)
assert a['assets'].keys()==b['assets'].keys()
t=json.loads((p/'dead-band-terrain-contract.json').read_text())
assert t['landmarkMounts']==b['mounts']
assert t['landmarkAcceptanceStations']==b['landmarkAcceptanceStations']
authorities=['src','assets/contracts','e2e','scripts','assets/engine-era.json','specs','STATUS.md','tasks']
for path in authorities:assert not subprocess.check_output(['git','diff',base['code'],'--',path]),path
registry=[s for s in Path('src/world/Terrain3dClaimPilot.ts').read_text().splitlines() if s.lstrip().startswith(tuple("'e%d-"%i for i in range(2,11))) and ': entry(' in s]
assert len(registry)==36 and all(s.rstrip().endswith('),') for s in registry)
(out/'invariants.json').write_text(json.dumps({'unchangedBytes':unchanged,'terrainHeightsMasksRoutesSpawnsCollisionMountsStationsBudgetsExact':True,'siblingModelsExact':True,'relayRushUntouched':True,'singleLineRegistryEntries':len(registry),'protectedAuthorities':authorities},indent=2)+'\n')
print('E7 INVARIANTS PASS')
