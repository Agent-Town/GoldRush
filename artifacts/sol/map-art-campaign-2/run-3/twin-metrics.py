"""Twin Banks field contrast, actual landmark silhouettes and HUD coverage."""
from pathlib import Path
from PIL import Image
import numpy as np,json
r=Path('artifacts/sol/map-art-campaign-2/run-3/e1-twin-banks')
def image(name):return np.array(Image.open(r/name).convert('RGB'))
def mask(a):return (a[:,:,0]>180)&(a[:,:,1]<60)&(a[:,:,2]>180)
def luma(a):return (a*[.2126,.7152,.0722]).sum(2)/255
rows=[]
for phase in ['before','after','before-winch','after-winch']:
 for row in json.loads((r/f'{phase}.json').read_text()):
  for station in row['stations']:
   width=row['width'];back=station['back'];prefix=f'{phase}-{back}-{width}'
   body=image(prefix+'-body.png');m=mask(image(prefix+'-mask.png'));hud=mask(image(prefix+'-hud-mask.png'));values=luma(body)[m]
   points=station['corners'];bounds={key:float(fn(p[c] for p in points)) for key,fn,c in [('minX',min,'x'),('maxX',max,'x'),('minY',min,'y'),('maxY',max,'y')]}
   rows.append({'phase':phase,'width':width,'id':station['focus'],'back':back,'pixels':int(m.sum()),'hudCoveragePercent':float(100*(m&~hud).sum()/m.sum()) if m.sum() else None,'medianLuminance':float(np.median(values)) if len(values) else None,'projectedAabb':bounds,'fullyOffscreen':bounds['maxX']<0 or bounds['minX']>width or bounds['maxY']<0 or bounds['minY']>(844 if width==390 else 800),'heroPosition':station['hero']})
regions=[]
for width,rect in [(1280,(430,260,720,380)),(390,(40,300,350,400))]:
 samples=[]
 for phase in ['before','after']:
  x0,y0,x1,y1=rect;a=luma(image(f'{phase}-frozen-{width}.png')[y0:y1,x0:x1]);samples.append({'phase':phase,'mean':float(a.mean()),'median':float(np.median(a)),'rmsContrast':float(a.std())})
 regions.append({'width':width,'rect':rect,'samples':samples})
d={'method':'Unretouched frozen browser captures; display RGB luminance, spatial RMS. Binary magenta geometry masks measure HUD coverage of the on-screen body only. A body with zero on-screen pixels has null coverage, never a misleading zero. Projected AABB is reported separately. Plain-entry framing is not the declared viewing station.','body':rows,'groundRegions':regions,'wholeBodyEmissive':{'before':.45,'after':.45,'ceiling':.6}}
(r/'visual-metrics.json').write_text(json.dumps(d,indent=2)+'\n');print(json.dumps(regions,indent=2))
