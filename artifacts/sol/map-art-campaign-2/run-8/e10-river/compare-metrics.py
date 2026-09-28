from pathlib import Path
from PIL import Image
import numpy as np,json
r=Path(__file__).parent;current=json.loads((r/'visual-metrics.json').read_text());old=json.loads((r.parent.parent/'run-6/e10-river/visual-metrics.json').read_text());rows=[]
for v in old['rows']:
 width=v['width'];box=v['box'];pair={}
 for arm in ['before','after']:
  a=np.array(Image.open(r/f'{arm}-frozen-{width}.png').crop(box).convert('RGB'),dtype=float)/255;y=a@np.array([.2126,.7152,.0722]);pair[arm]={'median':float(np.median(y)),'rms':float(np.std(y))}
 after=pair['after'];before=v['after'];rows.append({'width':width,'region':v['region'],'box':box,'run6':before,'run8Base':pair['before'],'run8':after,'medianChangePercent':(after['median']/before['median']-1)*100,'rmsChangePercent':(after['rms']/before['rms']-1)*100})
control=[]
for width,kind,box in [(390,'uncovered-ground',[20,455,100,510])]:
 pair={};arrays=[]
 for arm in ['before','after']:
  a=np.array(Image.open(r/f'{arm}-frozen-{width}.png').crop(box).convert('RGB'),dtype=float)/255;arrays.append(a);y=a@np.array([.2126,.7152,.0722]);pair[arm]={'median':float(np.median(y)),'rms':float(np.std(y))}
 control.append({'width':width,'kind':kind,'box':box,**pair,'identicalPixels':bool(np.array_equal(*arrays))})
(r/'run6-comparison.json').write_text(json.dumps({'rows':rows,'controls':control,'interpretation':'Phone fixed region includes additional rock silhouettes; increased RMS is disclosed, not described as lower texture noise. Ground-only control and byte-exact floor separately verify original pigment preservation.'},indent=2)+'\n');print(rows,control)
