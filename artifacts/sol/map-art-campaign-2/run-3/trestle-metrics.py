"""Measure saved geometry masks, persistent HUD and fixed display-RGB regions."""
from pathlib import Path
from PIL import Image
import json,numpy as np
root=Path('artifacts/sol/map-art-campaign-2/run-3/e2-trestle')
def rgb(path):return np.asarray(Image.open(path).convert('RGB'),dtype=float)/255
def mask(a):return (a[:,:,0]>.7)&(a[:,:,1]<.24)&(a[:,:,2]>.7)
def lum(a):return a@np.array([.2126,.7152,.0722])
rows=[]
proofs=json.loads((root/'station-proof.json').read_text())
for file in ['extra-station-proof.json','approach-station-proof.json']:
 if (root/file).exists():proofs+=json.loads((root/file).read_text())
for r in proofs:
 p=root/f"station-{r['arm']}-{r['focus']}-{r['back']}-{r['width']}"
 m=mask(rgb(str(p)+'-mask.png'));h=mask(rgb(str(p)+'-persistent-mask.png'));c=r['bodyBounds']['corners'];body=lum(rgb(str(p)+'-body.png'))[m]
 rows.append({k:r[k] for k in ['arm','width','focus','back','hero']}|{'projectedBounds':{'minX':min(p['x'] for p in c),'maxX':max(p['x'] for p in c),'minY':min(p['y'] for p in c),'maxY':max(p['y'] for p in c)},'bodyPixels':int(m.sum()),'persistentHudCoveragePercent':float((m&~h).sum()*100/m.sum()) if m.sum() else None,'bodyMedian':float(np.median(body)) if len(body) else None,'bodyRms':float(np.std(body)) if len(body) else None})
report={'method':'On-screen binary body geometry masks; persistent panels/pause/world-info/touch controls retained, temporary story and announcements excluded only from labelled mask. Normal-HUD frames retained. Full projected bounds distinguish offscreen from HUD-covered. Display-RGB luminance with Rec.709 weights.','stations':rows,'groundRegions':[]}
for w,box in [(1280,[960,365,1110,530]),(390,[285,365,375,500])]:
 x0,y0,x1,y1=box;pair={}
 for arm in ['before','after']:
  v=lum(rgb(root/f'{arm}-frozen-{w}.png'))[y0:y1,x0:x1];pair[arm]={'median':float(np.median(v)),'rms':float(np.std(v)),'darkShareBelow01':float((v<.1).mean())}
 pair['medianChangePercent']=(pair['after']['median']/pair['before']['median']-1)*100;pair['rmsChangePercent']=(pair['after']['rms']/pair['before']['rms']-1)*100
 report['groundRegions'].append({'width':w,'box':box,**pair})
(root/'visual-metrics.json').write_text(json.dumps(report,indent=2)+'\n')
for r in rows:print(r['arm'],r['width'],r['focus'],r['back'],'pixels',r['bodyPixels'],'HUD',round(r['persistentHudCoveragePercent'] or 0,3),'median',round(r['bodyMedian'] or 0,5),'bbox',[round(v,1) for v in r['projectedBounds'].values()])
print('GROUND',report['groundRegions'])
