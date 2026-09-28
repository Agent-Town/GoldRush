"""Extract measured rows without replacing failed cells or lost/aborted rides."""
import json,pathlib
root=pathlib.Path('artifacts/sol/play-proofs/run-18'); rows=[]
for cid in ['e10-archive-world','e7-relay-valley','e4-long-road','e5-deepwater-claim','e6-showroom']:
 for f in sorted((root/cid).glob('*/row-*.json')):
  r=json.loads(f.read_text()); o=json.loads(f.with_name(f.name.replace('row-','objective-')).read_text())
  final=r.get('finalSnapshot') or {}; works=o.get('defences') or []
  objective=(o.get('archive') or {}).get('objectiveAllowsSecure') if cid=='e10-archive-world' else (o.get('playbookUse') or {}).get('objectiveMet') if cid=='e7-relay-valley' else (o.get('showroom') or {}).get('complete') if cid=='e6-showroom' else r['secures']['ok']
  rows.append({'contract':cid,'strategy':f.parent.name,'project':r['project'],'row':str(f),'raw':r['rawEvidence'],
   'wave':r['peakWave'],'sim':r['simAtEnd'],'hp':r['hpAtEnd'],'gold':r['goldAtEnd'],'repairs':o.get('repairs'),
   'standing':sum(b['hp']>0 and not b['wrecked'] for b in works),'totalWorks':len(works),
   'objectiveMet':objective,'secures':r['secures']['ok'],'banks':r['banks']['ok'],'board':r['board']['ok'],'reload':r['reload']['ok'],
   'consoleErrors':len(r['consoleErrors']),'pageErrors':len(r['pageErrors']), 'detail':r['secures']['detail']})
(root/'measurements.json').write_text(json.dumps(rows,indent=2)+'\n')
for row in rows: print(json.dumps(row))
