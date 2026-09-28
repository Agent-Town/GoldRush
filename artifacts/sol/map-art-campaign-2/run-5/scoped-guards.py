"""Run only the render and named checks authorized for this campaign."""
from pathlib import Path
import subprocess,os,json,sys
folder=Path('artifacts/sol/map-art-campaign-2/run-5')/sys.argv[1]
raw=Path('artifacts/sol/map-art-campaign-2/_raw/run-5');env={**os.environ,'PATH':'/opt/homebrew/bin:'+os.environ['PATH'],'GR_GUARD_NO_ARTIFACT':'1'}
commands={'renderGuards':['node','--test',*[f'scripts/{s}.test.mjs' for s in ['glb-contract-guard','terrain-height-sampler','landmark-walk-surfaces','open-sea-water','shared-atlas-plugin']]],'namedGuards':['node','scripts/run-guards.mjs','--only','test:task-guards,test:citations,test:gate-callers']}
rows={}
for name,cmd in commands.items():
 log=raw/f'{sys.argv[1]}-{name}.log'
 with log.open('w') as f:rc=subprocess.run(cmd,env=env,stdout=f,stderr=subprocess.STDOUT).returncode
 rows[name]={'command':cmd,'exit':rc,'log':str(log)};print(name,rc)
rows['changedSince']={'status':'HELD for drain','base':json.loads((folder/'base.json').read_text())['code'],'reason':'scripts/run-guards.mjs:107-113 includes drain-only test:node-guards unconditionally for --changed-since. Scoped checks are not claimed as the whole selector green.'}
(folder/'node-gates.json').write_text(json.dumps(rows,indent=2)+'\n')
assert all(rows[k]['exit']==0 for k in commands)
