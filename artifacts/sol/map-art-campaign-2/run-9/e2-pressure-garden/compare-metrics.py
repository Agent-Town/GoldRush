from pathlib import Path
from PIL import Image
import numpy as np,json
p=Path(__file__).parent;new=json.loads((p/'visual-metrics.json').read_text());old=json.loads((p.parent.parent/'run-4/e2-pressure-garden/visual-metrics.json').read_text());rows=[]
for r in new['groundRegions']:
 prior=next(x for x in old['groundRegions'] if x['width']==r['width'])
 rows.append({'width':r['width'],'box':r['box'],'run4':prior['after'],'run9Base':r['before'],'run9':r['after']})
body=[]
for r in new['stations']:
 if r['arm']!='after' or r['station']=='entry':continue
 prior=next(x for x in old['stations'] if x['arm']=='after' and all(x[k]==r[k] for k in ['width','focus','station']))
 body.append({'width':r['width'],'focus':r['focus'],'station':r['station'],'run4Median':prior['bodyMedian'],'run9Median':r['bodyMedian'],'run4Hud':prior['persistentHudCoveragePercent'],'run9Hud':r['persistentHudCoveragePercent']})
def lum(a):return np.array(a.convert('RGB'),dtype=float)/255 @ np.array([.2126,.7152,.0722])
water=[]
for width,rect,edge in [(1280,[300,224,600,278],[300,175,600,196]),(390,[20,235,200,265],[20,192,200,209])]:
 pair={}
 for arm in ['before','after']:
  im=Image.open(p/f'{arm}-frozen-{width}.png');center=lum(im.crop(rect));margin=lum(im.crop(edge));pair[arm]={'median':float(np.median(center)),'rms':float(center.std()),'marginMedian':float(np.median(margin)),'deepMarginContrast':float(abs(np.median(center)-np.median(margin)))}
 water.append({'width':width,'deepBox':rect,'marginBox':edge,**pair,'contrastReductionPercent':(1-pair['after']['deepMarginContrast']/pair['before']['deepMarginContrast'])*100})
(p/'prior-comparison.json').write_text(json.dumps({'ground':rows,'bodies':body,'water':water,'method':'Same run-4 region coordinates and body stations; water boxes compare centre-block to near-margin luminance, not a water-depth measurement. Camera settle and dynamic mask edges create subpixel noise; all normal-HUD captures retained.'},indent=2)+'\n')
print(json.dumps({'ground':rows,'water':water},indent=2))
