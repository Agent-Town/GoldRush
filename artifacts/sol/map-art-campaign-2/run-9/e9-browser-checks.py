"""Re-run the prior campaign's own and adjacent suites serially, then exact-base reds."""
from pathlib import Path
import os,sys,json,subprocess,re,time
root=Path('artifacts/sol/map-art-campaign-2/run-9');name=sys.argv[1];out=root/name;raw=root.parent/'_raw/run-9'
env={**os.environ,'PATH':'/opt/homebrew/bin:'+os.environ['PATH']}
def run(label,args,check=True):
 log=raw/f'{name}-{label}-driver.log';i=2
 while log.exists():log=raw/f'{name}-{label}-driver-{i}.log';i+=1
 with log.open('w') as f:r=subprocess.run(args,env=env,stdout=f,stderr=subprocess.STDOUT,timeout=2400)
 print(label,r.returncode,flush=True)
 if check:assert r.returncode==0,(label,str(log))
 return log
common=['e2e/e9-roster.spec.ts','e2e/ss-10-e9-beats.spec.ts','e2e/landmark-brightness.spec.ts','e2e/landmark-collision.spec.ts','e2e/fort-landmark-collision.spec.ts']
own={'e9-dome-basin':['e2e/e9-canal-stages.spec.ts','e2e/e9-arsenal.spec.ts','e2e/e9-boss-old-digger.spec.ts'], 'e9-seed-run':['e2e/e9-seed-run-caravan.spec.ts','e2e/seam-visual-follows-sculpt.spec.ts','e2e/board-gating-and-profiles.spec.ts'], 'e9-devils-alley':['e2e/e9-devils-alley-relocation.spec.ts'], 'e9-old-canal':['e2e/e9-old-canal-choices.spec.ts']}[name]
if '--resume' not in sys.argv:run('own-driver',[sys.executable,str(root/'e4-gates.py'),name,'e2e','own-and-shared',*own,*common],False)
gate=json.loads((out/'e2e-own-and-shared-gates.json').read_text())[0]
run('parse-own',[sys.executable,str(root/'e4-failures.py'),name,'own',gate['log']])
candidate=json.loads((out/'own-failures.json').read_text());base=json.loads((out/'base.json').read_text())
if candidate['failures']:
 titles=sorted({r['title'] for r in candidate['failures']});specs=sorted({r['spec'] for r in candidate['failures']})
 run('attribution-driver',[sys.executable,str(root/'base-attribution.py'),name,base['code'],base['store'],'failures','|'.join(re.escape(t) for t in titles),*specs])
 run('parse-base',[sys.executable,str(root/'e4-failures.py'),name,'baseline',str(raw/(name+'-base-failures/tests.log'))])
 prior=json.loads((out/'baseline-failures.json').read_text());receipt=json.loads((out/'base-failures.json').read_text());assert receipt['baseEngine']==base['engine'] and receipt['candidateRestoredExactly']
 rows=[]
 for a in candidate['failures']:
  hits=[b for b in prior['failures'] if all(a[k]==b[k] for k in ['project','spec','title'])];b=hits[0] if len(hits)==1 else None
  rows.append({'project':a['project'],'spec':a['spec'],'title':a['title'],'baseAlsoFails':bool(b),'exactFingerprint':bool(b and a['fingerprint']==b['fingerprint'] and a['assertionLocations']==b['assertionLocations']),'candidate':a,'base':b})
 result={'candidateCounts':candidate['counts'],'baseCounts':prior['counts'],'exactBaseEngine':base['engine'],'restoredCandidateEngine':receipt['restoredEngine'],'allCasesAlsoFailOnBase':all(r['baseAlsoFails'] for r in rows),'exactFingerprintCount':sum(r['exactFingerprint'] for r in rows),'failures':rows}
 (out/'browser-failure-attribution.json').write_text(json.dumps(result,indent=2)+'\n');assert result['allCasesAlsoFailOnBase'],'New or unstable failure needs investigation'
run('census',[sys.executable,str(root/'e4-gates.py'),name,'e2e','census','--grep',name,'e2e/er01-e9-census.spec.ts','e2e/map-census.spec.ts'])
run('probes',[sys.executable,str(root/'e4-gates.py'),name,'probes'])
d=json.loads(Path('assets/pilots/map-rebuild-spike',name.removeprefix('e9-')+'-terrain-contract.json').read_text())
run('mount',['node',str(root/'e9-mount-proof.mjs'),name,d['tileId'],str(len(d['landmarkMounts']))])
(out/'browser-complete.json').write_text(json.dumps({'complete':True,'candidateCounts':candidate['counts']},indent=2)+'\n');print('BROWSER COMPLETE',name,flush=True)
