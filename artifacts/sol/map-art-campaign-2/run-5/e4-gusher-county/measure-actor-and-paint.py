"""Measure real sprite occlusion and the landmark's red-paint footprint from labelled masks."""
from pathlib import Path
from PIL import Image
import numpy as np,json
p=Path(__file__).parent
rgb=lambda f:np.asarray(Image.open(f).convert('RGB'),dtype=float)/255
magenta=lambda a:(a[:,:,0]>.7)&(a[:,:,1]<.24)&(a[:,:,2]>.7)
actors=[];paint=[]
for w in [1280,390]:
 for arm in ['before','after']:
  pref=p/f'station-{arm}-county-camp-rig-entry-{w}'
  v=magenta(rgb(str(pref)+'-hero-visible.png'));u=magenta(rgb(str(pref)+'-hero-unoccluded.png'));assert u.sum()>500
  actors.append({'width':w,'arm':arm,'visiblePixels':int(v.sum()),'unoccludedPixels':int(u.sum()),'occludedPercent':float(100*(1-v.sum()/u.sum()))})
  pref=p/f'station-{arm}-county-camp-rig-5-{w}';a=rgb(str(pref)+'-body.png');m=magenta(rgb(str(pref)+'-mask.png'));red=(a[:,:,0]>2.2*a[:,:,1])&(a[:,:,0]>3*a[:,:,2])&(a[:,:,0]>.15)&m
  paint.append({'width':w,'arm':arm,'bodyPixels':int(m.sum()),'redPixels':int(red.sum()),'redSharePercent':float(100*red.sum()/m.sum())})
(p/'actor-visibility.json').write_text(json.dumps({'method':'Real HomesteaderHero sprites, original atlas alpha/animation shader; magenta RGB diagnostic. Original depthTest versus disabled depthTest at the same frozen entry pose. All diagnostic changes restored; no character/sprite asset edited. Normal-HUD plain boards separate. Two consecutive frames can differ by a few edge pixels.','rows':actors},indent=2)+'\n')
(p/'paint-footprint.json').write_text(json.dumps({'method':'5 m masked camp body; red-dominant pixels have R>2.2G, R>3B and R>0.15 in display RGB. Includes both reduced cabin silhouette and remapped sheet paint; not a luminance gain claim.','rows':paint},indent=2)+'\n');print(actors);print(paint)
