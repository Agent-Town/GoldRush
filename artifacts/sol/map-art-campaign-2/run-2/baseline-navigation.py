from pathlib import Path
import subprocess,os,json,hashlib,time
root=Path('artifacts/sol/map-art-campaign-2');out=root/'run-2';raw=root/'_raw/run-2';names=['src/world/Water.ts','src/world/Terrain3dClaimPilot.ts']
env={**os.environ,'PATH':'/opt/homebrew/bin:'+os.environ['PATH'],'GR_CAPTURE_EXTERNAL_SERVER':'1','GR_CAPTURE_BASE_URL':'http://127.0.0.1:5303'}
base='0340775f852153e619e76ba00ce705323e5f19c2'
saved={n:Path(n).read_bytes() for n in names}
for n,b in saved.items(): (raw/('final-'+Path(n).name)).write_bytes(b)
def engine(): return subprocess.check_output(['node','--input-type=module','-e','import {computeEngineHash} from "./scripts/assay-replay-agent.mjs"; console.log(await computeEngineHash(process.cwd()))'],env=env,text=True).strip()
r={'base':base,'candidateEngine':engine()}
try:
 for n in names: Path(n).write_bytes(subprocess.check_output(['git','show',base+':'+n]))
 r['baseEngine']=engine(); assert r['baseEngine']==(out/'base-engine-hash.txt').read_text().strip()
 cmd=['npx','playwright','test','e2e/e5-deepwater-claim.spec.ts','--grep','active run wave','--workers=1','--project=desktop-chrome','--project=mobile-chrome','--trace=off','--reporter=line','--output='+str(raw/'base-navigation')]
 r['command']=cmd;t=time.time()
 with (raw/'base-navigation.log').open('w') as f:
  try:r['exit']=subprocess.run(cmd,env=env,stdout=f,stderr=subprocess.STDOUT,timeout=180).returncode
  except subprocess.TimeoutExpired:r['exit']='timeout'
 r['seconds']=round(time.time()-t,2)
finally:
 for n,b in saved.items():Path(n).write_bytes(b)
 r['restoredEngine']=engine();r['byteExactRestoration']=all(Path(n).read_bytes()==b for n,b in saved.items())
 (out/'baseline-navigation.json').write_text(json.dumps(r,indent=2)+'\n')
 print(json.dumps(r,indent=2))
