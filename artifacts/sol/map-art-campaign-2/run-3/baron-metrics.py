"""Baron river/scorch contrast, actual landmark silhouettes and HUD coverage."""
from pathlib import Path
from PIL import Image
import numpy as np,json
r=Path('artifacts/sol/map-art-campaign-2/run-3/e1-baron')
def image(name):return np.array(Image.open(r/name).convert('RGB'))
def mask(a):return (a[:,:,0]>180)&(a[:,:,1]<60)&(a[:,:,2]>180)
def luma(a):return (a*[.2126,.7152,.0722]).sum(2)/255
rows=[]
for phase in ['before','after','before-rig','before-rig-close','after-rig','before-banner','after-banner']:
 for row in json.loads((r/f'{phase}.json').read_text()):
  for station in row['stations']:
   width=row['width'];back=station['back'];prefix=f'{phase}-{back}-{width}'
   body=image(prefix+'-body.png');m=mask(image(prefix+'-mask.png'));hud=mask(image(prefix+'-hud-mask.png'));values=luma(body)[m]
   points=station['corners'];bounds={key:float(fn(p[c] for p in points)) for key,fn,c in [('minX',min,'x'),('maxX',max,'x'),('minY',min,'y'),('maxY',max,'y')]}
   rows.append({'phase':phase,'width':width,'id':station['focus'],'back':back,'pixels':int(m.sum()),'hudCoveragePercent':float(100*(m&~hud).sum()/m.sum()) if m.sum() else None,'medianLuminance':float(np.median(values)) if len(values) else None,'projectedAabb':bounds,'fullyOffscreen':bounds['maxX']<0 or bounds['minX']>width or bounds['maxY']<0 or bounds['minY']>(844 if width==390 else 800),'heroPosition':station['hero']})
regions=[]
# Fixed screen regions chosen on the before board, outside added standards and HUD.
for width,kind,rect in [(1280,'river',(230,205,480,300)),(390,'river',(25,225,115,310)),
                         (1280,'scorch',(435,582,535,626)),(390,'scorch',(0,582,82,626)),
                         (1280,'lit-ground',(750,485,900,570)),(390,'lit-ground',(240,500,330,570))]:
 samples=[]
 for phase in ['before','after']:
  x0,y0,x1,y1=rect;a=luma(image(f'{phase}-entry-{width}-body.png')[y0:y1,x0:x1]);samples.append({'phase':phase,'mean':float(a.mean()),'median':float(np.median(a)),'rmsContrast':float(a.std()),'darkShareBelow01':float((a<.1).mean()*100)})
 regions.append({'width':width,'kind':kind,'rect':rect,'samples':samples})
d={'method':'Unretouched frozen browser captures at original hero and full lighting. Display RGB luminance and spatial RMS; binary magenta masks measure HUD coverage of the on-screen body only. Offscreen bounds are reported separately. Region locations fixed before reading after values. Whole-body emission checked from live material diagnostics.',
   'body':rows,'regions':regions}
(r/'visual-metrics.json').write_text(json.dumps(d,indent=2)+'\n');print(json.dumps(regions,indent=2))
