"""Verify protected E9 truth byte-for-byte and all pack metadata except art hashes."""
from pathlib import Path
import hashlib,json,subprocess,sys
name=sys.argv[1];pack=name.removeprefix('e9-');out=Path('artifacts/sol/map-art-campaign-2/run-9')/name
p=Path('assets/pilots/map-rebuild-spike');store=p.resolve().parents[1];base=json.loads((out/'base.json').read_text());unchanged={}
def old(path):return subprocess.check_output(['git','-C',str(store),'show',base['store']+':pilots/map-rebuild-spike/'+path])
for path in ['landmark-collision-contract.json',pack+'-terrain-contract.json',pack+'-terrain.glb',pack+'-panorama.glb',pack+'-panorama-contract.json',pack+'-terrain-atlas.png',pack+'-panorama-atlas.png']:
 data=(p/path).read_bytes();assert data==old(path),path;unchanged[path]=hashlib.sha256(data).hexdigest()
path=f'landmarks/{pack}/{pack}-landmark-pack-contract.json';a=json.loads(old(path));b=json.loads((p/path).read_text())
for k in a:
 if k not in ['assets','blend','atlas']:assert a[k]==b[k],k
for id,record in a['assets'].items():
 for k,v in record.items():
  if k in ['sha256','triangles','artRevision']:continue
  assert b['assets'][id][k]==v,(id,k)
assert a['assets'].keys()==b['assets'].keys()
authorities=['src/sim','src/game','src/collision','assets/contracts','e2e','scripts','assets/engine-era.json','specs','STATUS.md','tasks']
for path in authorities:assert not subprocess.check_output(['git','diff',base['code'],'--',path]),path
allowed=[] if name!='e9-old-canal' else ['src/systems/CanalFlowPresentation.ts','src/world/Terrain3dClaimPilot.ts']
changed=subprocess.check_output(['git','diff','--name-only',base['code'],'--','src'],text=True).splitlines();assert set(changed)<=set(allowed),changed
registry=[s for s in Path('src/world/Terrain3dClaimPilot.ts').read_text().splitlines() if s.lstrip().startswith(tuple("'e%d-"%i for i in range(2,11))) and ': entry(' in s];assert len(registry)==36 and all(s.rstrip().endswith('),') for s in registry)
(out/'invariants.json').write_text(json.dumps({'unchangedBytes':unchanged,'terrainHeightsMasksRoutesSpawnsCollisionMountsStationsBudgetsExact':True,'sourceBoundsAndSiblingGeometry':'source-verification.json','singleLineRegistryEntries':len(registry),'protectedAuthorities':authorities,'renderSourceChanges':changed},indent=2)+'\n');print('E9 INVARIANTS PASS',name)
