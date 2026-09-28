from pathlib import Path
import json
r=Path(__file__).parent;root=r.parent;rows=[]
for name in ['e4-dust-flats','e4-long-road','e4-gusher-county','e4-boneyard']:
 d=json.loads((root/name/'visual-metrics.json').read_text());run=6 if name=='e4-boneyard' else 5;old=json.loads((root.parent/f'run-{run}'/name/'visual-metrics.json').read_text());ground=[]
 for v in d['groundRegions']:
  matches=[x for x in old.get('groundRegions',[]) if x['width']==v['width'] and x['box']==v['box']]
  ground.append(v|{'comparisonRun':run,'priorCorrection':matches[0]['after'] if matches else None})
 rows.append({'map':name,'ground':ground,'vehicleStations':d['stations'],'maximumEmission':d['maximumWholeBodyEmission']})
(r/'map-comparison.json').write_text(json.dumps(rows,indent=2)+'\n')
for row in rows:print(row['map'],[(v['width'],v['before']['rms'],v['after']['rms'],v['priorCorrection']) for v in row['ground']])
