"""Select only the registered variant solids; preserve every authored transform."""
from pathlib import Path
import json, sys
cid=sys.argv[1];name=cid[3:];root=Path('assets/pilots/map-rebuild-spike');out=Path(__file__).parent/cid
registry=json.loads((root/'landmark-collision-contract.json').read_text())['maps'][name]
paths=[root/f'{name}-terrain-contract.json',root/f'landmarks/{name}/{name}-landmark-pack-contract.json']
a,b=[json.loads(p.read_text()) for p in paths];assert a['landmarkMounts']==b['mounts']
for d,key in [(a,'landmarkMounts'),(b,'mounts')]:
 for record in registry:
  m=next(m for m in d[key] if m['id']==record['id'])
  assert [m['position'][0],m['position'][2]]==record['position']
  assert m['rotation']==[0,record['rotation'],0]
  assert [m['scale'][0],m['scale'][2]]==record['scale']
  assert m['contractIds']==[]
  assert (root/m['asset']).is_file()
  m['contractIds']=[cid]
 d['mountInterlock']['heldMounts']={}
 d['mountInterlock']['additionalSolids']='Owner ruling F-CORR4-2, 2026-09-22: '+', '.join(r['id'] for r in registry)+'. Mounted at the registered transforms; variant footprints supplement the unchanged parent blockers.'
 if name=='far-side': d['mountInterlock']['additionalDressing']='The authored nonblocking landing frame remains selected alongside the registered variant solids.'
for p,d in zip(paths,[a,b]):p.write_text(json.dumps(d,indent=2)+'\n')
(out/'selected-solids.json').write_text(json.dumps(registry,indent=2)+'\n')
print(cid,[(r['id'],r['position']) for r in registry])
