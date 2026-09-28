"""Match each final browser failure to the same assertion on the exact base."""
from pathlib import Path
import re,json
p=Path(__file__).parent;raw=p.parent.parent/'_raw/run-9'
def failures(path):
 text=re.sub(r'\x1b\[[0-9;]*m','',path.read_text());rows=[]
 for block in re.split(r'(?m)^\s+\d+\) \[',text)[1:]:
  h=re.match(r'([^]]+)\] › (e2e/[^:]+):(\d+):(\d+) › ([^\n]+)',block);assert h,block[:120]
  expected=re.search(r'(?m)^\s+Expected: (.+)$',block);received=re.search(r'(?m)^\s+Received: (.+)$',block)
  row={'project':h[1],'spec':h[2],'testLine':int(h[3]),'title':h[5].strip()}
  if expected and received:row.update(expected=expected[1].strip(),received=received[1].strip())
  else:
   counter=re.search(r'renderer count (\S+)=(\d+) outside band \[([^]]+)\]',block);assert counter,block[:400]
   row.update(rendererMetric=counter[1],received=int(counter[2]),expectedBand=counter[3])
  rows.append(row)
 return rows,text
candidate,ct=failures(raw/'e3-canyon-works-canyon-final.log');base,bt=failures(raw/'e3-canyon-works-base-failures/tests.log')
key=lambda r:(r['project'],r['spec'],r['testLine'],r['title'])
assert len(candidate)==len(base),(candidate,base)
comparisons=[]
for c,b in zip(sorted(candidate,key=key),sorted(base,key=key)):
 assert key(c)==key(b),(c,b)
 if 'rendererMetric' in c:
  assert c['rendererMetric']==b['rendererMetric']=='coldBaseline.triangles'
  assert c['expectedBand']==b['expectedBand']
  assert c['received']-b['received']==(2552-1768)+(3980-2496),(c,b)
  comparisons.append({'candidate':c,'base':b,'verdict':'same stale count band fails on both; observed +2268 equals authored model and panorama delta'})
 elif c['spec']=='e2e/gt-03-enemy-elevation.spec.ts':
  assert c['expected']==b['expected']=='< 0.85',(c,b)
  assert float(c['received'])>=0.85 and float(b['received'])>=0.85,(c,b)
  comparisons.append({'candidate':c,'base':b,'verdict':'same slope-speed predicate fails on both; wall-clock-polled ratios differ, so no numeric match is claimed; test uses unrelated gt-test-basin tile'})
 else:
  assert c==b,(c,b)
  comparisons.append({'candidate':c,'base':b,'verdict':'exact project and expected/received assertion fingerprint'})
receipt=json.loads((p/'base-failures.json').read_text());frozen=json.loads((p/'base.json').read_text());engine=json.loads((p/'engine.json').read_text());assert receipt['baseEngine']==frozen['engine'];assert receipt['candidateRestoredExactly'];assert receipt['candidateEngine']==engine['after']
counts={k:int(re.findall(r'\b(\d+) '+k+r'\b',ct)[-1]) if re.findall(r'\b(\d+) '+k+r'\b',ct) else 0 for k in ['passed','skipped','failed']}
(p/'browser-failure-attribution.json').write_text(json.dumps({'candidate':counts,'exactBase':receipt['base'],'exactStoreBase':receipt['storeBase'],'exactBaseEngine':receipt['baseEngine'],'restoredCandidateEngine':receipt['restoredEngine'],'allFailuresReproduceOnBase':True,'rendererCountDeltaExplainedByArt':2268,'comparisons':comparisons},indent=2)+'\n');print('ALL',len(candidate),'FINAL FAILURES ATTRIBUTED TO EXACT BASE',counts)
