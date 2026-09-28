from pathlib import Path
import json, os, subprocess, sys, time
root=Path('artifacts/sol/map-art-campaign-2/run-8/entry-framing')
name,mode=sys.argv[1:3]; out=root/name;out.mkdir(exist_ok=True)
env={**os.environ,'PATH':'/opt/homebrew/bin:'+os.environ['PATH'],'GR_CAPTURE_EXTERNAL_SERVER':'1','GR_CAPTURE_BASE_URL':'http://127.0.0.1:5303','GR_GUARD_NO_ARTIFACT':'1'}
if mode=='build':
 commands=[('tsc',['npx','tsc','--noEmit'],{}),('default',['npm','run','build'],{}),('full',['npm','run','build'],{'GR_RELEASE':'full'}),('e1',['npm','run','build'],{'GR_RELEASE':'e1'}),('payload',['node','scripts/first-town-payload.mjs','--json'],{})]
elif mode=='guards':
 commands=[('scoped',['node','--test',*[f'scripts/{s}.test.mjs' for s in ['glb-contract-guard','terrain-height-sampler','landmark-walk-surfaces','open-sea-water','shared-atlas-plugin','same-game-audit','view-schema-guard','skillmd-guard']]],{}),('named',['node','scripts/run-guards.mjs','--only','test:task-guards,test:citations,test:gate-callers'],{})]
elif mode=='e2e':
 commands=[(sys.argv[3],['npx','playwright','test','--workers=1','--project=desktop-chrome','--project=mobile-chrome','--trace=off','--reporter=line',f'--output={out}/{sys.argv[3]}-results',*sys.argv[4:]],{})]
elif mode=='probes':
 commands=[(s,['node',f'scripts/map-landmark-{s}-check.mjs'],{'PROBE_BASE':'http://127.0.0.1:5303'}) for s in ['loading','repeat']]
else:raise ValueError(mode)
rows=[]
for label,cmd,extra in commands:
 log=out/f'{mode}-{label}.log';assert not log.exists(),log
 start=time.time()
 with log.open('w') as f:
  try: rc=subprocess.run(cmd,env={**env,**extra},stdout=f,stderr=subprocess.STDOUT,timeout=1800).returncode
  except subprocess.TimeoutExpired:rc='timeout'
 row={'command':cmd,'environment':extra,'exit':rc,'seconds':round(time.time()-start,2),'log':str(log)}
 if label=='payload' and rc==0:row['payload']=json.loads(log.read_text())
 rows.append(row);(out/f'{mode}-{sys.argv[3] if mode=="e2e" else "gates"}.json').write_text(json.dumps(rows,indent=2)+'\n');print(name,label,rc,flush=True)
sys.exit(0 if all(r['exit']==0 for r in rows) else 1)
