from pathlib import Path
from PIL import Image
import numpy as np,json,sys
r=Path('artifacts/sol/map-art-campaign-2/run-2')/sys.argv[1];rows=[]
for width in [1280,390]:
 arrays=[np.array(Image.open(r/f'{phase}-lighting-{width}.png').convert('RGB')) for phase in ['before','after']]
 m=np.array(Image.open(r/f'lighting-mask-{width}.png').convert('RGB'));mask=(m[:,:,0]>180)&(m[:,:,1]<60)&(m[:,:,2]>180);assert mask.sum()>100
 values=[(a*[.2126,.7152,.0722]).sum(2)[mask]/255 for a in arrays];med=[float(np.median(a)) for a in values]
 rows.append({'width':width,'visibleBodyPixels':int(mask.sum()),'beforeMedianLuminance':med[0],'afterMedianLuminance':med[1],'medianChangePercent':(med[1]/med[0]-1)*100,'beforeDarkPixelFraction':float((values[0]<.06).mean()),'afterDarkPixelFraction':float((values[1]<.06).mean()),'method':'Diagnostic opaque magenta body pass, depth retained, HUD hidden only for this diagnostic to avoid transient-message contamination; same-page frozen simulation; 0.45 versus 0.6, display RGB luminance.'})
(r/'lighting-metrics.json').write_text(json.dumps(rows,indent=2)+'\n');print(json.dumps(rows,indent=2))
