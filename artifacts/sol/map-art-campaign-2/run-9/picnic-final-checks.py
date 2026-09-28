"""Sequential final candidate capture, four-boot timing and required browser checks."""
from pathlib import Path
import subprocess,os,json,sys
R=Path('artifacts/sol/map-art-campaign-2/run-9');M='e6-picnic';O=R/M
E={**os.environ,'PATH':'/opt/homebrew/bin:'+os.environ['PATH'],'MAP':M,'GR_CAPTURE_EXTERNAL_SERVER':'1','GR_CAPTURE_BASE_URL':'http://127.0.0.1:5303','FRESH_BROWSER_PER_RUN':'1'}
PYTHON='/Users/robin/.hermes/hermes-agent/venv/bin/python3';B='/Applications/Blender.app/Contents/MacOS/Blender';ids=['center-picnic-blanket','west-picnic-blanket','east-picnic-blanket','mesa-civilian-shade'];rows=[]
def run(label,cmd,extra={},allow=False,proof=None):
 log=Path('artifacts/sol/map-art-campaign-2/_raw/run-9')/('picnic-final-'+label+'.log')
 with log.open('w') as f:rc=subprocess.run(cmd,env={**E,**extra},stdout=f,stderr=subprocess.STDOUT).returncode
 valid=rc==0 and (proof is None or proof in log.read_text())
 rows.append({'label':label,'exit':rc,'proof':proof,'valid':valid,'log':str(log)});(O/'final-checks.json').write_text(json.dumps(rows,indent=2)+'\n');print(label,rc,valid,flush=True)
 if not valid and not allow:sys.exit(1)
run('build',['python3',str(R/'e4-gates.py'),M,'build'])
run('source',[B,'--background','--python',str(R/'e6-verify-source.py'),'--',M,*ids],proof='SOURCE PROOF PASS')
run('recipe',[B,'--background','--python',str(R/'e6-verify-recipe.py'),'--',M,'refine-picnic-props.py',*ids],proof='RECIPE PROOF PASS')
run('invariants',['python3',str(R/'e6-verify-invariants.py'),M,*ids])
run('budgets',['python3',str(R/'asset-budgets.py'),'glow-mesa',M,'picnic'])
run('stations',['node',str(R/'paired-capture.mjs')],{'MODE':'stations'})
run('plain',['node',str(R/'paired-capture.mjs')],{'MODE':'plain'})
run('metrics',[PYTHON,str(R/'metrics.py'),M])
run('boards',[PYTHON,str(R/'boards.py'),M])
run('entry-performance',['node',str(R/'paired-capture.mjs')],{'MODE':'performance'})
run('entry-performance-summary',['python3',str(R/'performance-summary.py'),M])
S=O/'blanket-performance';S.mkdir(exist_ok=True);c=json.loads((O/'capture-config.json').read_text());c['performanceViewpoint']=[0,34];(S/'capture-config.json').write_text(json.dumps(c,indent=2)+'\n')
run('blanket-performance',['node',str(R/'paired-capture.mjs')],{'MODE':'performance','CAPTURE_OUT':str(S)})
run('blanket-performance-summary',['python3',str(R/'performance-summary.py'),M+'/blanket-performance'])
run('own-browser',['python3',str(R/'e4-gates.py'),M,'e2e','own','e2e/e6-picnic-opening.spec.ts','e2e/e6-roster.spec.ts','e2e/er01-e6-census.spec.ts','e2e/terrain3d-registry.spec.ts','e2e/landmark-brightness.spec.ts','e2e/landmark-collision.spec.ts','e2e/fort-landmark-collision.spec.ts'],allow=True)
run('loading-repeat',['python3',str(R/'e4-gates.py'),M,'probes'])
run('picnic-mount-dispose',['node',str(O/'mount-repeat-proof.mjs')])
