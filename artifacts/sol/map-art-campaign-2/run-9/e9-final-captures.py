"""Final paired captures run after exact-base tests restore the candidate."""
from pathlib import Path
import os,sys,json,subprocess,time
root=Path('artifacts/sol/map-art-campaign-2/run-9');name=sys.argv[1];out=root/name;raw=root.parent/'_raw/run-9';env={**os.environ,'PATH':'/opt/homebrew/bin:'+os.environ['PATH'],'MAP':name}
deadline=time.monotonic()+2400
while not (out/'browser-complete.json').exists():
 assert time.monotonic()<deadline,'Browser checks incomplete';time.sleep(3)
def run(label,args,extra=None):
 log=raw/f'{name}-{label}-closing.log';i=2
 while log.exists():log=raw/f'{name}-{label}-closing-{i}.log';i+=1
 with log.open('w') as f:r=subprocess.run(args,env={**env,**(extra or {})},stdout=f,stderr=subprocess.STDOUT,timeout=1200)
 print(label,r.returncode,flush=True);assert r.returncode==0,(label,str(log))
for mode in ['stations','plain']:run(mode,['node',str(root/'paired-capture.mjs')],{'MODE':mode})
for script in ['metrics','boards','e9-prior-comparison']:run(script,[sys.executable,str(root/(script+'.py')),name])
# Timing is deliberately after browser/build workloads, not concurrent with them.
run('performance',['node',str(root/'paired-capture.mjs')],{'MODE':'performance','FRESH_BROWSER_PER_RUN':'1'})
run('performance-summary',[sys.executable,str(root/'performance-summary.py'),name])
run('invariants',[sys.executable,str(root/'e9-verify-invariants.py'),name])
engine=subprocess.check_output(['node','--input-type=module','-e',"import {computeEngineHash} from './scripts/assay-replay-agent.mjs';console.log(await computeEngineHash(process.cwd()))"],env=env,text=True).strip();b=json.loads((out/'base.json').read_text());(out/'engine-hashes.json').write_text(json.dumps({'before':b['engine'],'after':engine,'pinUntouched':True},indent=2)+'\n')
(out/'closing-complete.json').write_text(json.dumps({'complete':True},indent=2)+'\n');print('CLOSING COMPLETE',name,flush=True)
