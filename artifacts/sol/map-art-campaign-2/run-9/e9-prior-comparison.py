"""Compare each current clause with its own run-6 measurement and current A/B."""
from pathlib import Path
from PIL import Image,ImageFilter
import numpy as np,json,sys
name=sys.argv[1];root=Path('artifacts/sol/map-art-campaign-2');out=root/'run-9'/name;prior=root/'run-6'/name
old=json.loads((prior/'visual-metrics.json').read_text());new=json.loads((out/'visual-metrics.json').read_text())
def luminance(im):return np.asarray(im.convert('RGB'),dtype=float)/255@np.array([.2126,.7152,.0722])
def key(r):return (r['width'],r['focus'],str(r['station']))
rows=[]
for r in new['stations']:
 if r['arm']!='after':continue
 matches=[a for a in old['stations'] if a['arm']=='after' and key(a)==key(r)]
 if not matches:continue
 a=matches[0];prefix=f"station-after-{r['focus']}-{r['station']}-{r['width']}"
 def dark(p):
  mask=np.asarray(Image.open(p/(prefix+'-mask.png')).convert('RGB'))/255;m=(mask[:,:,0]>.7)&(mask[:,:,1]<.24)&(mask[:,:,2]>.7);v=luminance(Image.open(p/(prefix+'-body.png')))[m]
  return {'bodyDarkShareBelow01Percent':float((v<.1).mean()*100) if len(v) else None,'bodyMedian':float(np.median(v)) if len(v) else None,'pixels':int(m.sum())}
 rows.append({'width':r['width'],'focus':r['focus'],'station':r['station'],'run6':{**dark(prior),'persistentHudCoveragePercent':a['persistentHudCoveragePercent']},'run9':{**dark(out),'persistentHudCoveragePercent':r['persistentHudCoveragePercent']},'hudDeltaPercentagePoints':r['persistentHudCoveragePercent']-a['persistentHudCoveragePercent'] if r['persistentHudCoveragePercent'] is not None and a['persistentHudCoveragePercent'] is not None else None,'bboxRun6':a['projectedBounds'],'bboxRun9':r['projectedBounds']})
regions=[]
for r in new['groundRegions']:
 a=next(a for a in old['groundRegions'] if a['width']==r['width']);assert a['box']==r['box']
 regions.append({'width':r['width'],'box':r['box'],'run6':a['after'],'run9':r['after'],'rmsChangePercent':(r['after']['rms']/a['after']['rms']-1)*100})
result={'source':'Own run-6 after metrics, identical labelled stations and fixed ground boxes; run-8 HUD changes are retained but not credited to art. Raw sub-0.1% mask differences are reported, not rounded to zero.','stations':rows,'groundRegions':regions}
if name=='e9-far-side':
 im=Image.open(out/'after-frozen-1280.png');l=luminance(im);s=float(np.median(l[542:559,870:1100]));a=float(np.median(l[510:528,870:1100]));result['railStripeRelativeDarknessPercent']=(1-s/a)*100
 result['groundHighPassRms']=[]
 for r in regions:
  im=Image.open(out/f"after-frozen-{r['width']}.png");v=luminance(im)-luminance(im.filter(ImageFilter.GaussianBlur(2)));x0,y0,x1,y1=r['box'];result['groundHighPassRms'].append({'width':r['width'],'rms':float(v[y0:y1,x0:x1].std())})
(out/'prior-comparison.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))
