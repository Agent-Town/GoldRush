from pathlib import Path
from PIL import Image
import json,numpy as np
r=Path(__file__).parent;root=r.parent.parent
current=json.loads((r/'visual-metrics.json').read_text());old=json.loads((root/'run-6/e10-archive-world/visual-metrics.json').read_text());rows=[]
for v in current['groundRegions']:
 before=next(q for q in old['groundRegions'] if q['width']==v['width'])['after'];after=v['after'];rows.append({'width':v['width'],'run6':before,'run8':after,'medianChangePercent':(after['median']/before['median']-1)*100,'rmsChangePercent':(after['rms']/before['rms']-1)*100})
(r/'run6-comparison.json').write_text(json.dumps(rows,indent=2)+'\n')
for key,box,stem in [('ground',(330,270,630,410),'frozen'),('facade',(360,170,835,525),'station-west-stack-ruin-3')]:
 a=[]
 for arm in ['before','after']:
  name=f'{arm}-frozen-1280.png' if stem=='frozen' else f'station-{arm}-west-stack-ruin-3-1280-body.png';im=Image.open(r/name).crop(box);a.append(im.resize((im.width*2,im.height*2)))
 out=Image.new('RGB',(a[0].width*2,a[0].height));out.paste(a[0],(0,0));out.paste(a[1],(a[0].width,0));out.save(r/f'{key}-detail.png')
print(rows)

# Compare existing body measurements with this map's own correction receipt.
station=[]
for v in current['stations']:
    if v['arm']!='after':continue
    matches=[q for q in old['stations'] if q['arm']=='after' and all(q[k]==v[k] for k in ['width','focus','station'])]
    if not matches:continue
    o=matches[0];station.append({k:v[k] for k in ['width','focus','station']}|{'run6Median':o['bodyMedian'],'run8Median':v['bodyMedian'],'run6HudPercent':o['persistentHudCoveragePercent'],'run8HudPercent':v['persistentHudCoveragePercent']})
(r/'run6-body-comparison.json').write_text(json.dumps(station,indent=2)+'\n')
