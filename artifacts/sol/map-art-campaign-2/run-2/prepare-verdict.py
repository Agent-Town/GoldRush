"""Capture one unchanged map, then prepare boards and its actual sculpt budget inventory."""
from pathlib import Path
import subprocess,os,sys,json,re
id=sys.argv[1];root=Path('artifacts/sol/map-art-campaign-2');out=root/'run-2'/id;out.mkdir(exist_ok=True)
env={**os.environ,'PATH':'/opt/homebrew/bin:'+os.environ['PATH'],'MAP':id}
log=root/'_raw/run-2'/f'{id}-verdict.log'
with log.open('w') as f:subprocess.run(['node',str(root/'run-2/verdict-capture.mjs')],env=env,stdout=f,stderr=subprocess.STDOUT,check=True,timeout=480)
subprocess.run([sys.executable,str(root/'run-2/boards.py'),id],env={**env,'BEFORE_LABEL':'CURRENT / BOOT A','AFTER_LABEL':'UNCHANGED / BOOT B'},check=True)
r=json.loads((out/'verdict-captures.json').read_text());ds=r[0]['plain'][0]['dataset']
name=ds.get('terrain3dPilotPanorama','').removesuffix('-panorama')
if ds.get('terrain3dPilotState')=='ready':
 assert name;subprocess.run(['python3',str(root/'run-2/asset-budgets.py'),name,id],check=True)
else:
 (out/'asset-budgets.json').write_text(json.dumps({'state':ds.get('terrain3dPilotState','absent'),'sculptTerrainTriangles':ds.get('terrain3dPilotTriangles',0),'reason':'Actual plain boot uses a fallback. No mounted sculpt pack or authored sculpt budget is claimed.'},indent=2)+'\n')
print('Prepared',id,flush=True)
