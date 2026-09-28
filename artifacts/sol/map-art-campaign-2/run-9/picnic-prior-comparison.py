"""Answer each retained art measurement against Picnic's own run-6 capture."""
from pathlib import Path
import json,subprocess
R=Path('artifacts/sol/map-art-campaign-2');O=R/'run-9/e6-picnic';a=json.loads((R/'run-6/e6-picnic/visual-metrics.json').read_text());b=json.loads((O/'visual-metrics.json').read_text());rows=[]
keys=['bodyPixels','bodyMedian','persistentHudCoveragePercent']
for v in b['stations']:
 if v['arm']!='after':continue
 old=next((r for r in a['stations'] if r['arm']=='after' and all(v[k]==r[k] for k in ['width','focus','station'])),None)
 if old:
  rows.append({k:v[k] for k in ['width','focus','station']}|{'run6':{k:old[k] for k in keys},'run9':{k:v[k] for k in keys},'hudChangePercentagePoints':v['persistentHudCoveragePercent']-old['persistentHudCoveragePercent']})
g=[]
for v in b['groundRegions']:
 old=next(r for r in a['groundRegions'] if r['width']==v['width'])
 g.append({'width':v['width'],'box':v['box'],'run6':old['after'],'run9':v['after'],'rmsChangePercent':(v['after']['rms']/old['after']['rms']-1)*100,'medianChangePercent':(v['after']['median']/old['after']['median']-1)*100})
(O/'prior-comparison.json').write_text(json.dumps({'source':'run-6/e6-picnic/visual-metrics.json','stationComparisons':rows,'ground':g,'shade':'Already mounted by run 7; no run-6 mounted shade metric exists. Supplemental station is explicitly paired against current base, not credited as a new mounting.'},indent=2)+'\n')
P=Path('assets/pilots/map-rebuild-spike');store=P.resolve().parents[1];base=json.loads((O/'base.json').read_text());sizes=[]
for name in ['center-picnic-blanket','west-picnic-blanket','east-picnic-blanket','mesa-civilian-shade']:
 path=f'landmarks/picnic/{name}.glb';old=subprocess.check_output(['git','-C',str(store),'show',base['store']+':pilots/map-rebuild-spike/'+path]);new=(P/path).read_bytes();sizes.append({'asset':path,'beforeBytes':len(old),'afterBytes':len(new),'deltaBytes':len(new)-len(old)})
texture=P/'sources/e6-picnic-fidelity-2/picnic-ground-clean.png';(O/'payload-delta.json').write_text(json.dumps({'glbs':sizes,'rawGlbDelta':sum(r['deltaBytes'] for r in sizes),'runtimeGroundPngBytes':texture.stat().st_size,'totalRawRuntimeDelta':sum(r['deltaBytes'] for r in sizes)+texture.stat().st_size,'releaseE1':'not applicable to this E6-only leg','note':'Uncompressed source bytes, not a measured transfer budget. New cloth image is embedded in each GLB and shares decoded source at runtime under the existing shared-atlas loader.'},indent=2)+'\n')
print(json.dumps({'stations':rows,'ground':g},indent=2))
