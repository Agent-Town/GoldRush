"""Summarize frozen-source byte deltas and paired masks without changing assets."""
from pathlib import Path
import json,subprocess
p=Path('assets/pilots/map-rebuild-spike');o=Path(__file__).resolve().parent;base=json.loads((o/'base.json').read_text());store=p.resolve().parents[1]
a=json.loads((p/'sources/e4-boneyard-fidelity-2/landmark-input-contract.json').read_text());b=json.loads((p/'landmarks/boneyard/boneyard-landmark-pack-contract.json').read_text());rows=[]
ids=['half-buried-sleeper','flivver-row-west-b','flivver-row-east-b']
for id in ids:
 path=f'landmarks/boneyard/{id}.glb';old=subprocess.check_output(['git','-C',str(store),'show',base['store']+':pilots/map-rebuild-spike/'+path]);new=(p/path).read_bytes()
 rows.append({'id':id,'trianglesBefore':a['assets'][id]['triangles'],'trianglesAfter':b['assets'][id]['triangles'],'budget':b['assets'][id]['triangleBudget'],'glbBytesBefore':len(old),'glbBytesAfter':len(new),'glbByteDelta':len(new)-len(old),'sameBounds':a['assets'][id]['bounds']==b['assets'][id]['bounds'],'meshCountBefore':a['assets'][id].get('meshCount',1),'meshCountAfter':b['assets'][id].get('meshCount',1),'materialCountBefore':a['assets'][id].get('materialCount',1),'materialCountAfter':b['assets'][id].get('materialCount',1)})
(o/'model-deltas.json').write_text(json.dumps(rows,indent=2)+'\n')
v=json.loads((o/'visual-metrics.json').read_text());rows=[]
for id in ids:
 for w in [1280,390]:
  a,b=[next(r for r in v['stations'] if r['focus']==id and r['width']==w and r['arm']==arm) for arm in ['before','after']]
  rows.append({'id':id,'width':w,'beforePixels':a['bodyPixels'],'afterPixels':b['bodyPixels'],'changePercent':100*(b['bodyPixels']/a['bodyPixels']-1),'sourceBoundsUnchanged':True})
(o/'silhouette-comparison.json').write_text(json.dumps(rows,indent=2)+'\n')
