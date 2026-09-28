"""Compare declared inspection stations against their own last measured figures."""
from pathlib import Path
import json,sys
name,run=sys.argv[1:];root=Path('artifacts/sol/map-art-campaign-2');p=root/'run-9'/name
old=json.loads((root/f'run-{run}'/name/'visual-metrics.json').read_text());now=json.loads((p/'visual-metrics.json').read_text())
c=json.loads((Path('assets/pilots/map-rebuild-spike')/(name.removeprefix('e7-')+'-terrain-contract.json')).read_text())
rows=[]
for station in c['landmarkAcceptanceStations']:
 for width in [1280,390]:
  def find(data,arm):return next((r for r in data['stations'] if r['arm']==arm and r['focus']==station['id'] and r['station']==station['backMeters'] and r['width']==width),None)
  a,b,fresh=find(old,'after'),find(now,'after'),find(now,'before')
  if not b:continue
  rows.append({'id':station['id'],'station':station['backMeters'],'width':width,'previousRun':int(run),'previousHudPercent':a['persistentHudCoveragePercent'] if a else None,'currentHudPercent':b['persistentHudCoveragePercent'],'risePercentagePoints':b['persistentHudCoveragePercent']-a['persistentHudCoveragePercent'] if a and a['persistentHudCoveragePercent'] is not None else None,'freshBeforeHudPercent':fresh['persistentHudCoveragePercent'] if fresh else None,'previousBodyMedian':a['bodyMedian'] if a else None,'currentBodyMedian':b['bodyMedian'],'note':'Earlier figure absent, not zero' if not a else 'Compare silhouette changes and tiny edge-mask variation separately from UI placement'})
ground=[]
for b in now['groundRegions']:
 a=next(r for r in old['groundRegions'] if r['width']==b['width']);assert a['box']==b['box']
 ground.append({'width':b['width'],'sameFixedBox':True,'previous':a['after'],'current':b['after']})
report={'previousRun':int(run),'declaredStations':rows,'ground':ground}
(p/'prior-comparison.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
