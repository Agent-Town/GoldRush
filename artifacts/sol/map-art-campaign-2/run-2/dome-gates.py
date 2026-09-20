from pathlib import Path
import subprocess,os,time,json,shutil
root=Path('artifacts/sol/map-art-campaign-2');out=root/'run-2/e8-mare-claim';raw=root/'_raw/run-2';rows=[]
env={**os.environ,'PATH':'/opt/homebrew/bin:'+os.environ['PATH'],'PROBE_BASE':'http://127.0.0.1:5303','GR_GUARD_NO_ARTIFACT':'1'}
commands=[('builds',['python3',str(root/'run-2/build-map.py'),'e8-mare-claim']),('plain',['node',str(root/'run-2/capture.mjs')]),('repeat',['node','scripts/map-landmark-repeat-check.mjs']),('loading',['node','scripts/map-landmark-loading-check.mjs']),('own-collision',['python3',str(root/'run-2/map-gates.py'),'e8-mare-claim','e8-own-collision','e2e/e8-mare-claim-physics-parity.spec.ts','e2e/landmark-collision.spec.ts','e2e/fort-landmark-collision.spec.ts']),('glb-contract',['node','scripts/glb-contract-guard.mjs']),('named',['node','scripts/run-guards.mjs','--only','test:task-guards,test:citations,test:gate-callers'])]
# Only names the known loading probe writes; preserve generated versions and restore each exact tracked path.
churn=Path('artifacts/map-art-repairs-20260908/deepwater');before={p: p.read_bytes() for p in churn.glob('*') if p.is_file()}
for label,cmd in commands:
 e={**env};
 if label=='plain':e.update(PHASE='after',MAPS='e8-mare-claim,e8-eclipse',PLAIN_ONLY='1')
 log=raw/f'dome-{label}.log';start=time.time()
 with log.open('w') as f:
  try:rc=subprocess.run(cmd,env=e,stdout=f,stderr=subprocess.STDOUT,timeout=900).returncode
  except subprocess.TimeoutExpired:rc='timeout'
 rows.append({'name':label,'command':cmd,'exit':rc,'seconds':time.time()-start,'log':str(log)});(out/'gates.json').write_text(json.dumps(rows,indent=2)+'\n');print(label,rc,flush=True)
 if label=='loading':
  saved=raw/'dome-loading-churn';saved.mkdir(exist_ok=True)
  for p in churn.glob('*'):
   if p.is_file() and (p not in before or p.read_bytes()!=before[p]):
    shutil.copy2(p,saved/p.name)
    if p in before:p.write_bytes(before[p])
    else:p.unlink()
