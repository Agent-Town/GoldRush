"""Reproducible body masks, visible HUD coverage, fixed-region detail, and geometry bounds."""
from pathlib import Path
from PIL import Image
import numpy as np,json
r=Path('artifacts/sol/map-art-campaign-2/run-3/e1-night-shift')
def image(name):return np.array(Image.open(r/name).convert('RGB'))
def magenta(a):return (a[:,:,0]>180)&(a[:,:,1]<60)&(a[:,:,2]>180)
def luma(a):return (a*[.2126,.7152,.0722]).sum(2)/255
rows=[]
for width in (1280,390):
 for phase,back in [('before',20),('before',14),('before',9),('before-close',5),('after',5),('before','entry'),('after','entry')]:
  prefix=f'{phase}-{back}-{width}'
  a=image(prefix+'-body.png');mask=magenta(image(prefix+'-mask.png'));hud=magenta(image(prefix+'-hud-mask.png'))
  assert mask.sum()>100
  values=luma(a)[mask]
  data=next(v for v in json.loads((r/f'{phase}.json').read_text()) if v['width']==width)
  station=next(s for s in data['stations'] if s['back']==back)
  corners=station['corners'];bounds={k:float(fn(p[c] for p in corners)) for k,fn,c in [('minX',min,'x'),('maxX',max,'x'),('minY',min,'y'),('maxY',max,'y')]}
  rows.append({'width':width,'phase':phase,'back':back,'pixels':int(mask.sum()),'hudCoveragePercent':float(100*(mask&~hud).sum()/mask.sum()),'medianLuminance':float(np.median(values)),'darkShare':float((values<.06).mean()),'projectedAabb':bounds,'heroPosition':station['hero']})
regions=[]
for label,fileSuffix,rect in [('river','frozen-1280',(180,210,420,290)),('relit-yard','relit-1280',(565,315,720,395))]:
 samples=[]
 for phase in ('before','after'):
  x0,y0,x1,y1=rect;v=luma(image(f'{phase}-{fileSuffix}.png')[y0:y1,x0:x1])
  samples.append({'phase':phase,'meanLuminance':float(v.mean()),'rmsContrast':float(v.std()),'medianLuminance':float(np.median(v))})
 regions.append({'label':label,'rect':rect,'samples':samples})
report={'method':'Unretouched browser images, display RGB luma. Magenta opaque diagnostic material keeps original geometry/depth; masks with and without visible HUD measure occlusion of the on-screen body only. Projected AABB separately discloses offscreen extent. Diagnostic stand-offs are not plain boot changes. Near-zero differences below 0.01 percent are edge/time sampling noise. Fixed crops are spatial measurements, not temporal motion quality scores.','wholeBodyEmission':{'before':0,'after':0,'ceiling':.6,'note':'GLB emissive factor is black and no emissive map is installed. Material emissiveIntensity default 1 has no nonzero radiance. Local pools are source-radius-bound light, not a whole-body lift.'},'body':rows,'fixedRegions':regions}
(r/'visual-metrics.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(regions,indent=2))
