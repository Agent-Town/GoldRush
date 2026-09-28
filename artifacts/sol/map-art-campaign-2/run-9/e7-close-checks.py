"""Finish exact-base attribution and sequential browser/performance evidence."""
from pathlib import Path
import os,json,re,subprocess,time
root=Path('artifacts/sol/map-art-campaign-2/run-9');name='e7-dead-band';p=root/name
raw=Path('artifacts/sol/map-art-campaign-2/_raw/run-9')
env={**os.environ,'PATH':'/opt/homebrew/bin:'+os.environ['PATH']}
gate=p/'e2e-own-and-shared-gates.json'
deadline=time.monotonic()+2400
while not gate.exists():
    assert time.monotonic()<deadline,'Browser batch did not finish'
    time.sleep(2)

def run(label,cmd,extra=None):
    path=raw/(name+'-'+label+'.log');assert not path.exists(),path
    start=time.monotonic()
    with path.open('w') as f:r=subprocess.run(cmd,env={**env,**(extra or {})},stdout=f,stderr=subprocess.STDOUT,timeout=2400)
    print(label,r.returncode,round(time.monotonic()-start,1),flush=True)
    assert r.returncode==0,(label,str(path))

run('parse-candidate',['python3',str(root/'e4-failures.py'),name,'own',str(raw/(name+'-own-and-shared.log'))])
candidate=json.loads((p/'own-failures.json').read_text());base=json.loads((p/'base.json').read_text())
assert sum(candidate['counts'].values())==120,candidate['counts']
if candidate['failures']:
    titles=sorted({r['title'] for r in candidate['failures']});specs=sorted({r['spec'] for r in candidate['failures']})
    run('attribution-driver',['python3',str(root/'base-attribution.py'),name,base['code'],base['store'],'failures','|'.join(re.escape(t) for t in titles),*specs])
    run('parse-baseline',['python3',str(root/'e4-failures.py'),name,'baseline',str(raw/(name+'-base-failures/tests.log'))])
    prior=json.loads((p/'baseline-failures.json').read_text());receipt=json.loads((p/'base-failures.json').read_text())
    assert receipt['baseEngine']==base['engine'] and receipt['candidateRestoredExactly']
    rows=[]
    for a in candidate['failures']:
        hits=[b for b in prior['failures'] if all(a[k]==b[k] for k in ['project','spec','title'])]
        b=hits[0] if len(hits)==1 else None
        rows.append({'project':a['project'],'spec':a['spec'],'title':a['title'],'baseAlsoFails':bool(b),'exactFingerprint':bool(b and a['fingerprint']==b['fingerprint'] and a['assertionLocations']==b['assertionLocations']),'candidate':a,'base':b})
    result={'candidateCounts':candidate['counts'],'baseCounts':prior['counts'],'exactBaseEngine':base['engine'],'restoredCandidateEngine':receipt['restoredEngine'],'allCasesAlsoFailOnBase':all(r['baseAlsoFails'] for r in rows),'exactFingerprintCount':sum(r['exactFingerprint'] for r in rows),'failures':rows}
    (p/'browser-failure-attribution.json').write_text(json.dumps(result,indent=2)+'\n')
    assert result['allCasesAlsoFailOnBase'],'A new failure needs investigation'

run('generic-probes',['python3',str(root/'e4-gates.py'),name,'probes'])
run('mount-proof',['node',str(root/'e7-mount-proof.mjs'),name,'e7-relay-valley','10'])
run('entry-performance',['node',str(root/'paired-capture.mjs')],{'MAP':name,'MODE':'performance','FRESH_BROWSER_PER_RUN':'1'})
run('entry-performance-summary',['python3',str(root/'performance-summary.py'),name])
station=p/'north-performance';station.mkdir(exist_ok=True)
config=json.loads((p/'capture-config.json').read_text());config['performanceViewpoint']=[0,57]
(station/'capture-config.json').write_text(json.dumps(config,indent=2)+'\n')
run('north-performance',['node',str(root/'paired-capture.mjs')],{'MAP':name,'MODE':'performance','FRESH_BROWSER_PER_RUN':'1','CAPTURE_OUT':str(station)})
run('north-performance-summary',['python3',str(root/'performance-summary.py'),name+'/north-performance'])
run('final-invariants',['python3',str(root/'e7-verify-invariants.py')])
print('CLOSING CHECKS COMPLETE',flush=True)
