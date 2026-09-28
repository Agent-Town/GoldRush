"""Summarize compact rows and independently retained pre-bank objective captures."""
import json, pathlib
root=pathlib.Path(__file__).parent
rows=[]
for file in sorted(root.glob('*/**/row-*.json')):
    if file.parent.name not in ('default','restore-ground','equivalence'): continue
    r=json.loads(file.read_text())
    obj=file.with_name(file.name.replace('row-','objective-'))
    o=json.loads(obj.read_text()) if obj.exists() else {}
    f=r.get('finalSnapshot') or {}
    standing=sum(b['hp']>0 and not b['wrecked'] for b in f.get('defences',[]))
    rows.append({'contract':r['contract'],'project':r['project'],'strategy':file.parent.name,
      'terminalCaptured':bool(f),'lastObservation':r['samples'][-1] if r['samples'] else None,
      'wave':r['peakWave'] if f else None,'sim':r['simAtEnd'] if f else None,'hp':r['hpAtEnd'] if f else None,'gold':r['goldAtEnd'] if f else None,
      'repairs':f.get('repairs'),'standing':standing if f else None,'pieces':len(f.get('defences',[])) if f else None,
      'secure':r['secures']['ok'],'bank':r['banks']['ok'],'book':r['board']['ok'],'reload':r['reload']['ok'],
      'consoleErrors':len(r['consoleErrors']),'pageErrors':len(r['pageErrors']),
      'stakes':o.get('picnicHold'),'captures':o.get('showroomCaptureObjective'),'latch':o.get('playbookUse'),
      'mirror':o.get('broadcastMirror'),'front':o.get('interferenceFront'),'row':str(file)})
(root/'measurements.json').write_text(json.dumps(rows,indent=2)+'\n')
for r in rows:
    print(json.dumps({k:v for k,v in r.items() if k not in ('stakes','mirror','front','row')}))
