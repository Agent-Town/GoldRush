"""Permanent panel coverage and a bounded screen-space check of the new standard."""
from pathlib import Path
from PIL import Image
import numpy as np,json,sys
label="cart-station" if "--cart" in sys.argv else "station"
root=Path('artifacts/sol/map-art-campaign-2/run-3/e1-baron')
def rgb(p):return np.asarray(Image.open(p).convert('RGB')).astype(float)
def magenta(a):return (a[:,:,0]>180)&(a[:,:,1]<60)&(a[:,:,2]>180)
rows=[]
for r in json.loads((root/(label+'-proof.json')).read_text()):
 p=root/f"station-{r['arm']}-{r['focus']}-{r['back']}-{r['width']}"
 mask=magenta(rgb(str(p)+'-mask.png'));hud=magenta(rgb(str(p)+'-persistent-mask.png'))
 row={k:r[k] for k in ['arm','width','focus','back','hero','water']}
 row.update(bodyPixels=int(mask.sum()),persistentHudCoveragePercent=float((mask&~hud).sum()*100/mask.sum()) if mask.sum() else None)
 if r.get('bodyBounds'):
  pts=r['bodyBounds']['corners'];row['projectedBounds']={'minX':min(p['x'] for p in pts),'maxX':max(p['x'] for p in pts),'minY':min(p['y'] for p in pts),'maxY':max(p['y'] for p in pts)}
 if r['primaryBounds']:
  points=r['primaryBounds']['corners'];h,w=mask.shape
  x0=max(0,int(min(p['x'] for p in points))-6);x1=min(w,int(max(p['x'] for p in points))+7)
  y0=max(0,int(min(p['y'] for p in points))-6);y1=min(h,int(max(p['y'] for p in points))+7)
  primary=mask[y0:y1,x0:x1];visible=hud[y0:y1,x0:x1]
  first=rgb(str(p)+'-normal.png')[y0:y1,x0:x1];second=rgb(str(p)+'-motion.png')[y0:y1,x0:x1]
  delta=np.max(np.abs(first-second),axis=2)
  row['primaryStandard']={'projectedBounds':{'minX':min(v['x'] for v in points),'maxX':max(v['x'] for v in points),'minY':min(v['y'] for v in points),'maxY':max(v['y'] for v in points)},'maskRect':[x0,y0,x1,y1],'pixels':int(primary.sum()),'persistentHudCoveragePercent':float((primary&~visible).sum()*100/primary.sum()),'motionOver650ms':{'changedAbove10RgbPercent':float((delta>10).sum()*100/delta.size),'meanAbsoluteMaxRgbDelta':float(delta.mean()),'limitation':'Fixed primary-standard region, original camera and frozen sim. Screen-space indication includes incidental background changes; the unchanged source-bound sway shader is the animation owner.'}}
 rows.append(row)
report={'method':'Binary geometry masks with actual persistent HUD panels, pause control, world-info note and touch controls retained. Story cards and wave/agent announcements excluded only from the labelled diagnostic mask; normal-HUD frames are retained. Percentages count on-screen body pixels; sub-0.1% edge differences are not claimed as meaningful occlusion.','rows':rows}
(root/(label+'-metrics.json')).write_text(json.dumps(report,indent=2)+'\n')
for r in rows:print(r['arm'],r['width'],r['focus'],r['back'],r['bodyPixels'],round(r['persistentHudCoveragePercent'] or 0,3),r.get('primaryStandard'))
