"""Compare all render asset bytes and gameplay-bearing contract fields to this map's base."""
from pathlib import Path
import json,sys,subprocess,hashlib
name,pack=sys.argv[1:];root=Path('artifacts/sol/map-art-campaign-2/run-6')/name;pilot=Path('assets/pilots/map-rebuild-spike');store='/Users/robin/Claude/Projects/GoldRush-assets';base=json.loads((root/'base.json').read_text())['store'];rows={}
original=lambda f:subprocess.check_output(['git','-C',store,'show',base+':pilots/map-rebuild-spike/'+f])
terrain=json.loads((pilot/(pack+'-terrain-contract.json')).read_text())
for f in [pack+'-terrain-contract.json','landmarks/'+pack+'/'+pack+'-landmark-pack-contract.json']:
 before=json.loads(original(f));after=json.loads((pilot/f).read_text());before.pop('landmarkAcceptanceStations',None);after.pop('landmarkAcceptanceStations',None);assert before==after,f;rows[f]='unchanged except render-only acceptance stations'
for f in [terrain['asset'],terrain['panoramaMount']['asset'],*[m['asset'] for m in terrain['landmarkMounts']]]:
 data=(pilot/f).read_bytes();assert original(f)==data,f;rows[f]={'unchanged':True,'sha256':hashlib.sha256(data).hexdigest()}
(root/'invariants.json').write_text(json.dumps(rows,indent=2)+'\n');print(name,'unchanged geometry, atlas, mounts, mask truth, collision footprint and budgets')
