"""Replay only failing existing cases on this map's exact source/store baseline."""
from pathlib import Path
import json,re,subprocess,sys
name=sys.argv[1];root=Path('artifacts/sol/map-art-campaign-2/run-9');p=root/name
candidate=json.loads((p/'own-failures.json').read_text());base=json.loads((p/'base.json').read_text())
gate=json.loads((p/'e2e-own-gates.json').read_text())[0];assert gate['exit']==0 or candidate['failures'], 'Unparsed browser gate failure'
if not candidate['failures']:
 (p/'browser-failure-attribution.json').write_text(json.dumps({'candidateCounts':candidate['counts'],'failures':[]},indent=2)+'\n');sys.exit()
pattern='|'.join(re.escape(t) for t in sorted({r['title'] for r in candidate['failures']}))
specs=sorted({r['spec'] for r in candidate['failures']})
log=Path('artifacts/sol/map-art-campaign-2/_raw/run-9')/(name+'-attribution-driver.log')
with log.open('w') as f:
 subprocess.run(['python3',str(root/'base-attribution.py'),name,base['code'],base['store'],'failures',pattern,*specs],stdout=f,stderr=subprocess.STDOUT,check=True)
 subprocess.run(['python3',str(root/'e4-failures.py'),name,'baseline',str(Path('artifacts/sol/map-art-campaign-2/_raw/run-9')/(name+'-base-failures/tests.log'))],stdout=f,stderr=subprocess.STDOUT,check=True)
receipt=json.loads((p/'base-failures.json').read_text());assert receipt['baseEngine']==base['engine'];assert receipt['candidateRestoredExactly']
prior=json.loads((p/'baseline-failures.json').read_text());rows=[]
for a in candidate['failures']:
 hits=[b for b in prior['failures'] if all(a[k]==b[k] for k in ['project','spec','title'])]
 b=hits[0] if len(hits)==1 else None
 rows.append({'project':a['project'],'spec':a['spec'],'title':a['title'],'baseAlsoFails':bool(b),'exactFingerprint':bool(b and a['fingerprint']==b['fingerprint'] and a['assertionLocations']==b['assertionLocations']),'candidate':a,'base':b})
result={'candidateCounts':candidate['counts'],'baseCounts':prior['counts'],'exactBaseEngine':base['engine'],'restoredCandidateEngine':receipt['restoredEngine'],'allCasesAlsoFailOnBase':all(r['baseAlsoFails'] for r in rows),'exactFingerprintCount':sum(r['exactFingerprint'] for r in rows),'failures':rows}
(p/'browser-failure-attribution.json').write_text(json.dumps(result,indent=2)+'\n')
print({k:v for k,v in result.items() if k!='failures'})
