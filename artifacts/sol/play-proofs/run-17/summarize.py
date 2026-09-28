"""Extract measured rows; missing readings stay null rather than becoming zero."""
import json,pathlib
root=pathlib.Path('artifacts/sol/play-proofs/run-17')
rows=[]
for cid in ['e8-mare-claim','e7-relay-valley','e10-archive-world','e10-ember-shore']:
 for strategy in ['default','restore-ground']:
  for project in ['desktop-chrome','mobile-chrome']:
   folder=root/cid/strategy
   f=folder/f'row-{project}.json'
   if not f.exists(): continue
   r=json.loads(f.read_text());oFile=folder/f'objective-{project}.json';o=json.loads(oFile.read_text()) if oFile.exists() else {}
   air=o.get('atmosphere');relay=o.get('playbookUse');archive=o.get('archive');vent=o.get('preserveVent')
   objective=(air or {}).get('regolith',{}).get('complete') if cid=='e8-mare-claim' else (relay or {}).get('objectiveMet') if cid=='e7-relay-valley' else (archive or {}).get('objectiveAllowsSecure') if cid=='e10-archive-world' else (vent or {}).get('objectiveMet')
   rows.append({'contract':cid,'strategy':strategy,'project':project,'wave':o.get('wave',r.get('peakWave')),'sim':o.get('sim',r.get('simAtEnd')),'hp':o.get('hp',r.get('hpAtEnd')),'gold':o.get('gold',r.get('goldAtEnd')),'repairs':o.get('repairs'),'worksStanding':sum(b['hp']>0 and not b['wrecked'] for b in o.get('defences',[])) if 'defences' in o else None,'worksTotal':len(o['defences']) if 'defences' in o else None,'objectiveMet':objective,'air':air,'relay':relay,'archive':archive,'vent':vent,'squall':o.get('squall'),'hero':o.get('hero'),'cells':{k:r[k] for k in ['boots','secures','banks','board','reload','clean']},'consoleErrors':len(r['consoleErrors']),'pageErrors':len(r['pageErrors']),'row':str(f),'raw':r.get('rawEvidence')})
(root/'measurements.json').write_text(json.dumps(rows,indent=2)+'\n')
for r in rows: print(json.dumps({k:r[k] for k in ['contract','strategy','project','wave','sim','hp','gold','objectiveMet','consoleErrors','pageErrors']}))
