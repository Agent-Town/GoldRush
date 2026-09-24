from pathlib import Path
from statistics import median
import json
r=Path(__file__).parent
out=[]
for mid in ['e1-twin-banks','e2-trestle','e7-relay-rush']:
 rows=json.loads((r/mid/'performance.json').read_text())
 for width in [1280,390]:
  arms={arm:[p for p in rows if p['width']==width and p['arm']==arm] for arm in ['before','after']}
  assert all(len(v)==4 for v in arms.values())
  p95={arm:median(p['p95'] for p in values) for arm,values in arms.items()}
  calls={arm:sorted({c for p in values for c in p['calls']}) for arm,values in arms.items()}
  delta=(p95['after']/p95['before']-1)*100
  drawDelta=(max(calls['after'])/max(calls['before'])-1)*100
  record={'map':mid,'width':width,'beforeP95':p95['before'],'afterP95':p95['after'],'deltaPercent':delta,'beforeCalls':calls['before'],'afterCalls':calls['after'],'maxDrawDeltaPercent':drawDelta,'samplesPerArm':4,'framesPerRun':180,'pass':delta<=15 and drawDelta<=15}
  out.append(record);print(record);assert record['pass']
(r/'performance-summary.json').write_text(json.dumps(out,indent=2)+'\n')
