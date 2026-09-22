"""Serial map gates; rendering/timing never overlaps another browser or build."""
from pathlib import Path
import os,sys,subprocess,json,time
cid=sys.argv[1];root=Path('artifacts/sol/map-art-campaign-2');out=root/'run-7'/cid;raw=root/'_raw/run-7';cfg=json.loads((out/'capture-config.json').read_text());env={**os.environ,'PATH':'/opt/homebrew/bin:'+os.environ['PATH']}
base={'code':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'store':subprocess.check_output(['git','-C','/Users/robin/Claude/Projects/GoldRush-assets','rev-parse','HEAD'],text=True).strip()}
(out/'commit-base.json').write_text(json.dumps(base,indent=2)+'\n')
(out/'engine-before.txt').write_text(subprocess.check_output(['node','--input-type=module','-e',"import {computeEngineHash} from './scripts/assay-replay-agent.mjs';console.log(await computeEngineHash(process.cwd()))"],env=env,text=True))
script=lambda name:str(root/'run-7'/name)
commands=[
 ('select',['python3',script('select-map.py'),cid],{}),
 ('invariants',['node',script('verify-invariants.mjs'),cid],{}),
 ('budgets',['python3',script('asset-budgets.py'),cfg['parent'],cid,cfg['variant']],{}),
 ('builds',['python3',script('gates.py'),cid,'build'],{}),
 ('walk',['node',script('walk-proof.mjs'),cid],{}),
 ('plain',['node',script('paired-capture.mjs')],{'MAP':cid,'MODE':'plain'}),
 ('performance',['node',script('paired-capture.mjs')],{'MAP':cid,'MODE':'performance','FRESH_BROWSER_PER_RUN':'1'}),
 ('performance-summary',['python3',script('performance-summary.py'),cid],{}),
 ('boards',[os.environ.get('BOARDS_PYTHON','/Users/robin/.hermes/hermes-agent/venv/bin/python3'),script('boards.py'),cid],{}),
 ('scoped-guards',['node','--test','scripts/glb-contract-guard.test.mjs','scripts/terrain-height-sampler.test.mjs','scripts/landmark-walk-surfaces.test.mjs','scripts/open-sea-water.test.mjs','scripts/shared-atlas-plugin.test.mjs','scripts/landmark-collision.test.mjs'],{}),
 ('named-guards',['node','scripts/run-guards.mjs','--only','test:task-guards,test:citations,test:gate-callers'],{'GR_GUARD_NO_ARTIFACT':'1'}),
 ('probes',['python3',script('gates.py'),cid,'probes'],{}),
]
specs=sorted(str(p) for p in Path('e2e').glob('*.spec.ts') if cid in p.read_text())
for p in ['e2e/landmark-collision.spec.ts','e2e/fort-landmark-collision.spec.ts']:
 if p not in specs:specs.append(p)
(out/'own-specs.json').write_text(json.dumps(specs,indent=2)+'\n')
commands.append(('e2e',['python3',script('gates.py'),cid,'e2e','own',*specs],{}))
rows=[]
for label,cmd,extra in commands:
 log=(out if label.endswith('guards') else raw)/((label if label.endswith('guards') else cid+'-'+label)+'.log')
 assert not log.exists(),str(log)
 start=time.time()
 with log.open('w') as f:rc=subprocess.run(cmd,env={**env,**extra},stdout=f,stderr=subprocess.STDOUT).returncode
 rows.append({'label':label,'command':cmd,'environment':extra,'exit':rc,'seconds':round(time.time()-start,2),'log':str(log)});(out/'check-receipts.json').write_text(json.dumps(rows,indent=2)+'\n');print(cid,label,rc,flush=True)
 if rc and label != 'named-guards':sys.exit(rc)
 if label=='performance-summary':assert all(r['within15Percent'] for r in json.loads((out/'performance-summary.json').read_text())['rows'])

sys.exit(1 if any(r["exit"] != 0 for r in rows) else 0)
