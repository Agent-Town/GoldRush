from pathlib import Path
from PIL import Image
import numpy as np,json
p=Path(__file__).parent;new=json.loads((p/'visual-metrics.json').read_text());old=json.loads((p.parent.parent/'run-4/e3-canyon-works/visual-metrics.json').read_text());rows=[]
for r in new['groundRegions']:
 prior=next(x for x in old['groundRegions'] if x['width']==r['width'])
 rows.append({'width':r['width'],'box':r['box'],'run4':prior['after'],'run9Base':r['before'],'run9':r['after']})
body=[]
for r in new['stations']:
 if r['arm']!='after':continue
 prior=next(x for x in old['stations'] if x['arm']=='after' and all(x[k]==r[k] for k in ['width','focus','station']))
 body.append({'width':r['width'],'focus':r['focus'],'station':r['station'],'run4Median':prior['bodyMedian'],'run9Median':r['bodyMedian'],'run4Hud':prior['persistentHudCoveragePercent'],'run9Hud':r['persistentHudCoveragePercent']})
(p/'prior-comparison.json').write_text(json.dumps({'ground':rows,'bodies':body,'method':'Same run-4 region coordinates and body stations. Full ordinary-HUD captures retained; offscreen entries are not counted as unobstructed bodies.'},indent=2)+'\n')
print(json.dumps({'ground':rows,'bodies':body},indent=2))
