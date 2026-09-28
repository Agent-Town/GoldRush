"""Retain all four actual-source runs; expose modes rather than hiding slow samples."""
from pathlib import Path
import json, statistics, sys
folder=Path('artifacts/sol/map-art-campaign-2/run-8')/sys.argv[1]
data=json.loads((folder/'performance-paired.json').read_text())
assert len(data)==16
rows=[]
for width in (1280,390):
    pair={}
    for arm in ('before','after'):
        runs=[r for r in data if r['width']==width and r['arm']==arm]
        assert len(runs)==4 and all(not r['errors'] for r in runs)
        values=sorted(r['p95'] for r in runs);clusters=[]
        for v in values:
            if not clusters or v/clusters[-1][-1]>1.35: clusters.append([])
            clusters[-1].append(v)
        pair[arm]={'p95':values,'median':statistics.median(values),'modes':clusters,
                   'calls':sorted({v for r in runs for v in r['calls']}),
                   'triangles':sorted({v for r in runs for v in r['triangles']})}
    delta=(pair['after']['median']/pair['before']['median']-1)*100
    same_mode=len(pair['before']['modes'])==len(pair['after']['modes'])==1
    rows.append({'width':width,**pair,'pooledMedianChangePercent':delta,'singleMode':same_mode,
                 'within15Percent':same_mode and delta<=15 and max(pair['after']['calls'])<=max(pair['before']['calls'])*1.15})
report={'method':'Four fresh boots per arm and viewport, alternating order, 180 retained rAF intervals per boot. Full-tier frozen diagnostic with ordinary HUD. Gaps over 35% expose separate timing modes; unmatched modes require review, never automatic acceptance.','rows':rows}
(folder/'performance-summary.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(rows,indent=2))
