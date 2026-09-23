"""E8 serial browser evidence, exact-base attribution, and four-run timings."""
from pathlib import Path
import os,json,re,subprocess,time,sys
root=Path('artifacts/sol/map-art-campaign-2/run-9');name=sys.argv[1];p=root/name
raw=Path('artifacts/sol/map-art-campaign-2/_raw/run-9');env={**os.environ,'PATH':'/opt/homebrew/bin:'+os.environ['PATH']}
def run(label,cmd,extra=None,check=True):
 path=raw/(name+'-'+label+'.log');i=2
 while path.exists():path=raw/(name+'-'+label+f'-{i}.log');i+=1
 start=time.monotonic()
 with path.open('w') as f:r=subprocess.run(cmd,env={**env,**(extra or {})},stdout=f,stderr=subprocess.STDOUT,timeout=2400)
 print(label,r.returncode,round(time.monotonic()-start,1),str(path),flush=True)
 if check:assert r.returncode==0,(label,str(path))
 return path
if '--finish-only' in sys.argv:pass
elif name=='e8-far-side':
 gate=p/'e2e-own-and-shared-gates.json';deadline=time.monotonic()+2400
 while not gate.exists():
  assert time.monotonic()<deadline,'Browser batch did not finish';time.sleep(2)
 run('parse-own',[sys.executable,str(root/'e4-failures.py'),name,'own',str(raw/(name+'-own-and-shared.log'))])
 candidate=json.loads((p/'own-failures.json').read_text());base=json.loads((p/'base.json').read_text())
 if candidate['failures']:
  titles=sorted({r['title'] for r in candidate['failures']});specs=sorted({r['spec'] for r in candidate['failures']})
  run('attribution-driver',[sys.executable,str(root/'base-attribution.py'),name,base['code'],base['store'],'failures','|'.join(re.escape(t) for t in titles),*specs])
  run('parse-baseline',[sys.executable,str(root/'e4-failures.py'),name,'baseline',str(raw/(name+'-base-failures/tests.log'))])
  prior=json.loads((p/'baseline-failures.json').read_text());receipt=json.loads((p/'base-failures.json').read_text());assert receipt['baseEngine']==base['engine'] and receipt['candidateRestoredExactly']
  rows=[]
  for a in candidate['failures']:
   hits=[b for b in prior['failures'] if all(a[k]==b[k] for k in ['project','spec','title'])];b=hits[0] if len(hits)==1 else None
   rows.append({'project':a['project'],'spec':a['spec'],'title':a['title'],'baseAlsoFails':bool(b),'exactFingerprint':bool(b and a['fingerprint']==b['fingerprint'] and a['assertionLocations']==b['assertionLocations']),'candidate':a,'base':b})
  result={'candidateCounts':candidate['counts'],'baseCounts':prior['counts'],'exactBaseEngine':base['engine'],'restoredCandidateEngine':receipt['restoredEngine'],'allCasesAlsoFailOnBase':all(r['baseAlsoFails'] for r in rows),'exactFingerprintCount':sum(r['exactFingerprint'] for r in rows),'failures':rows}
  (p/'browser-failure-attribution.json').write_text(json.dumps(result,indent=2)+'\n');assert result['allCasesAlsoFailOnBase'],'New or unstable failure needs investigation'
 # The final local material/brace refinement happened during the broad batch.
 # Re-run all directly affected map and landmark cases on immutable final bytes.
 run('final-impact-driver',[sys.executable,str(root/'e4-gates.py'),name,'e2e','final-impact','e2e/e8-far-side-probe.spec.ts','e2e/landmark-brightness.spec.ts','e2e/landmark-collision.spec.ts','e2e/fort-landmark-collision.spec.ts'])
 run('parity-driver',[sys.executable,str(root/'e4-gates.py'),name,'e2e','parity-census','--grep',name,'e2e/e8-remaining-maps-parity.spec.ts','e2e/er01-e8-census.spec.ts','e2e/map-census.spec.ts'])
else:
 run('own-driver',[sys.executable,str(root/'e4-gates.py'),name,'e2e','own-and-shared','e2e/e8-low-orbit-momentum.spec.ts','e2e/e8-physics.spec.ts','e2e/landmark-brightness.spec.ts','e2e/landmark-collision.spec.ts','e2e/fort-landmark-collision.spec.ts'])
 run('parity-driver',[sys.executable,str(root/'e4-gates.py'),name,'e2e','parity-census','--grep',name,'e2e/e8-remaining-maps-parity.spec.ts','e2e/er01-e8-census.spec.ts','e2e/map-census.spec.ts'])
if '--finish-only' not in sys.argv:run('final-stations',['node',str(root/'paired-capture.mjs')],{'MAP':name,'MODE':'stations'})
if '--finish-only' not in sys.argv:run('final-plain',['node',str(root/'paired-capture.mjs')],{'MAP':name,'MODE':'plain'})
run('final-metrics',[sys.executable,str(root/'metrics.py'),name])
run('final-boards',[sys.executable,str(root/'boards.py'),name])
run('generic-probes',[sys.executable,str(root/'e4-gates.py'),name,'probes'])
run('entry-performance',['node',str(root/'paired-capture.mjs')],{'MAP':name,'MODE':'performance','FRESH_BROWSER_PER_RUN':'1'})
run('entry-performance-summary',[sys.executable,str(root/'performance-summary.py'),name])
run('final-invariants',[sys.executable,str(root/'e8-verify-invariants.py'),name])
(p/'closing-complete.json').write_text(json.dumps({'completed':True,'time':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())},indent=2)+'\n');print('CLOSING CHECKS COMPLETE',flush=True)
