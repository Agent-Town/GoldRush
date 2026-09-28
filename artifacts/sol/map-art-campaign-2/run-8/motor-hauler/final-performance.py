"""Four fresh browsers per arm and width on each Motor map, with no overlapping gates."""
from pathlib import Path
import json,os,subprocess

root=Path('artifacts/sol/map-art-campaign-2')
out=root/'run-8/motor-hauler'
raw=root/'_raw/run-8/motor-final-performance'
raw.mkdir(exist_ok=True)
env={**os.environ,'PATH':'/opt/homebrew/bin:'+os.environ['PATH'],'MODE':'performance','FRESH_BROWSER_PER_RUN':'1'}
engine=subprocess.check_output(['node','--input-type=module','-e',"import {computeEngineHash} from './scripts/assay-replay-agent.mjs'; console.log(await computeEngineHash(process.cwd()))"],env=env,text=True).strip()
assert engine==json.loads((out/'engine-pair.json').read_text())['after']
rows=[]
for name in ['e4-boneyard','e4-dust-flats','e4-long-road','e4-gusher-county']:
    path=raw/(name+'.log');attempt=1
    while path.exists():
        attempt+=1;path=raw/f'{name}-{attempt}.log'
    with path.open('w') as log:
        capture=subprocess.run(['node',str(out/'paired-capture.mjs')],env={**env,'MAP':name},stdout=log,stderr=subprocess.STDOUT).returncode
        assert capture==0,(name,capture)
        summary=subprocess.run(['python3',str(root/'run-8/performance-summary.py'),name],stdout=log,stderr=subprocess.STDOUT).returncode
        assert summary==0,(name,summary)
    comparisons=json.loads((root/'run-8'/name/'performance-summary.json').read_text())['rows']
    passed=all(r['singleMode'] and r['within15Percent'] and max(r['after']['calls'])<=min(r['before']['calls'])*1.15 for r in comparisons)
    row={'map':name,'engine':engine,'log':str(path),'within15Percent':passed,'comparisons':comparisons}
    rows.append(row);(out/'final-performance.json').write_text(json.dumps(rows,indent=2)+'\n')
    print(name,'PASS' if passed else 'REVIEW',[(r['width'],r['before']['median'],r['after']['median'],r['before']['calls'],r['after']['calls']) for r in comparisons],flush=True)
assert all(r['within15Percent'] for r in rows)
