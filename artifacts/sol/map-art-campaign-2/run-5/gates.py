"""Sequential gates with explicit exit receipts; raw output is never staged."""
from pathlib import Path
import os, sys, json, subprocess, time
root=Path('artifacts/sol/map-art-campaign-2'); name, mode=sys.argv[1:3]
out=root/'run-5'/name; out.mkdir(exist_ok=True)
raw=root/'_raw/run-5'; raw.mkdir(parents=True,exist_ok=True)
env={**os.environ,'PATH':'/opt/homebrew/bin:'+os.environ['PATH'],'GR_CAPTURE_EXTERNAL_SERVER':'1','GR_CAPTURE_BASE_URL':'http://127.0.0.1:5303','GR_GUARD_NO_ARTIFACT':'1'}
if mode=='build':
    commands=[('tsc',['npx','tsc','--noEmit'],{}),('default-build',['npm','run','build'],{}),('full-build',['npm','run','build'],{'GR_RELEASE':'full'})]
    if name.startswith('e1-'):commands += [('e1-build',['npm','run','build'],{'GR_RELEASE':'e1'}),('payload',['node','scripts/first-town-payload.mjs','--json'],{})]
elif mode=='e2e':
    commands=[(sys.argv[3],['npx','playwright','test','--workers=1','--project=desktop-chrome','--project=mobile-chrome','--trace=off','--reporter=line','--output='+str(raw/(name+'-'+sys.argv[3])),*sys.argv[4:]],{})]
elif mode=='probes':
    commands=[(label,['node',f'scripts/map-landmark-{label}-check.mjs'],{'PROBE_BASE':'http://127.0.0.1:5303'}) for label in ['loading','repeat']]
else:raise ValueError(mode)
rows=[]
for label,cmd,extra in commands:
    log=raw/f'{name}-{label}.log'; start=time.time()
    with log.open('w') as f:
        try:rc=subprocess.run(cmd,env={**env,**extra},stdout=f,stderr=subprocess.STDOUT,timeout=1800).returncode
        except subprocess.TimeoutExpired:rc='timeout'
    row={'label':label,'command':cmd,'environment':extra,'exit':rc,'seconds':round(time.time()-start,2),'log':str(log)}
    if label=='payload' and rc==0:row['payload']=json.loads(log.read_text())
    rows.append(row);(out/(mode+('-'+sys.argv[3] if mode=='e2e' else '')+'-gates.json')).write_text(json.dumps(rows,indent=2)+'\n');print(name,label,rc,flush=True)
    if rc and mode=='build':sys.exit(1)
sys.exit(0 if all(r['exit']==0 for r in rows) else 1)
