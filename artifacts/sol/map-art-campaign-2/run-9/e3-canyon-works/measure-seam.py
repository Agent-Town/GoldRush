from pathlib import Path
from PIL import Image
import json,numpy as np
p=Path(__file__).parent;prior=json.loads((p.parent.parent/'run-4/e3-canyon-works/seam-metrics.json').read_text());rows=[]
for r in prior:
 w=r['width'];x0,y0,x1,y1=r['seamBox'];row={'width':w,'seamBox':r['seamBox'],'run4':r['after']}
 for arm in ['before','after']:
  lum=np.asarray(Image.open(p/f'{arm}-frozen-{w}.png').convert('RGB'),dtype=float)/255@np.array([.2126,.7152,.0722]);v=lum[y0:y1,x0:x1]
  row[arm]={'brightPixelsAbove05':int((v>.5).sum()),'median':float(np.median(v)),'max':float(v.max()),'maxMeanAdjacentRowStep':float(abs(np.diff(v.mean(axis=1))).max())}
 rows.append(row)
(p/'seam-metrics.json').write_text(json.dumps(rows,indent=2)+'\n')
for r in rows:print(r['width'],r['before']['maxMeanAdjacentRowStep'],r['after']['maxMeanAdjacentRowStep'])
