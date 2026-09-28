"""Area-weighted texture anisotropy on frozen and final source meshes."""
from pathlib import Path
import bpy,sys,json,math
import numpy as np
name,*ids=sys.argv[sys.argv.index('--')+1:];pack=name.removeprefix('e9-');p=Path('assets/pilots/map-rebuild-spike');out=Path('artifacts/sol/map-art-campaign-2/run-9')/name
rows=[]
for arm,path in [('before',p/f'sources/{name}-fidelity-2/landmarks-input.blend'),('after',p/f'landmarks/{pack}/{pack}-landmarks.blend')]:
 bpy.ops.wm.open_mainfile(filepath=str(path.resolve()))
 for id in ids:
  m=bpy.data.objects[id].data;m.calc_loop_triangles();uv=m.uv_layers.active;ratios=[];areas=[];collapsed=0
  for f in m.loop_triangles:
   a,b,c=[m.vertices[i].co for i in f.vertices];e1=b-a;e2=c-a
   if e1.length<1e-9 or e1.cross(e2).length<1e-9:continue
   x=e1.normalized();y=e1.cross(e2).normalized().cross(x);P=np.array([[e1.length,e2.dot(x)],[0,e2.dot(y)]]);u,v,w=[np.array(uv.data[i].uv) for i in f.loops];U=np.column_stack([v-u,w-u]);sv=np.linalg.svd(U@np.linalg.inv(P),compute_uv=False);area=e1.cross(e2).length/2
   if sv[-1]<1e-9:collapsed+=area;continue
   ratios.append(float(sv[0]/sv[-1]));areas.append(area)
  ix=np.argsort(ratios);r=np.array(ratios)[ix];w=np.array(areas)[ix];cum=np.cumsum(w)/sum(w)
  rows.append({'arm':arm,'id':id,'areaWeightedMedianUvAnisotropy':float(r[np.searchsorted(cum,.5)]),'areaWeightedP95UvAnisotropy':float(r[np.searchsorted(cum,.95)]),'collapsedUvAreaSharePercent':collapsed/(sum(w)+collapsed)*100})
(out/'surface-metrics.json').write_text(json.dumps({'method':'Ratio of singular values of per-triangle surface-to-UV Jacobian; 1 is isotropic. Area weighted, collapses reported separately. This tests UV distortion, not visual material fidelity.','rows':rows},indent=2)+'\n');print(rows)
