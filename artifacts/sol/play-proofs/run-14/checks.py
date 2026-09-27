"""Run closeout checks serially with direct return-code receipts."""
import os,subprocess,json
from pathlib import Path
root=Path(__file__).parent
external=Path.home()/'.goldrush/play-proofs/run-14'
external.mkdir(parents=True,exist_ok=True)
env=dict(os.environ,GR_CAPTURE_EXTERNAL_SERVER='1',GR_CAPTURE_BASE_URL='http://127.0.0.1:5303')
for k in ['GR_NATIVE_PROOF','GR_NATIVE_RUN','GR_NATIVE_STRATEGY','GR_NATIVE_DIAG']:env.pop(k,None)
ids=['e7-relay-valley','e8-mare-claim','e10-archive-world','e10-ember-shore']
checks=[('tsc-final',['npx','tsc','--noEmit']),('build-final',['npm','run','build']),
 ('gate-unset',['npx','playwright','test',*[f'e2e/native-proofs/{id}.spec.ts' for id in ids],'--project=desktop-chrome','--project=mobile-chrome','--workers=1','--reporter=line',f'--output={external}/skip-results']),
 ('adjacent',['npx','playwright','test','e2e/locked-win.spec.ts','--grep','The Claim card names','--project=desktop-chrome','--project=mobile-chrome','--workers=1','--trace=off','--reporter=line',f'--output={external}/adjacent-results'])]
results=[]
for name,cmd in checks:
 with (external/f'{name}-full.log').open('w') as log:r=subprocess.run(cmd,env=env,stdout=log,stderr=subprocess.STDOUT)
 (root/f'{name}.exit').write_text(str(r.returncode)+'\n')
 lines=(external/f'{name}-full.log').read_text().splitlines()
 if name=='build-final':lines=[x for x in lines if 'built in' in x or 'error' in x.lower() or 'warning' in x.lower() or x.startswith('>')][-20:]
 else:lines=lines[-35:]
 (root/f'{name}.log').write_text('\n'.join(x.rstrip() for x in lines)+'\n' if lines else '')
 results.append(dict(name=name,argv=cmd,exit=r.returncode))
 print(json.dumps(results[-1]),flush=True)
 if r.returncode:break
(root/'checks.json').write_text(json.dumps(results,indent=2)+'\n')
raise SystemExit(any(r['exit'] for r in results))
