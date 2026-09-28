"""Check evidence integrity separately from gameplay acceptance."""
import pathlib,json,subprocess
root=pathlib.Path('artifacts/sol/play-proofs/run-18');base='e24b4d382cf309a3b3ef12daa15330757b8c3318'
rows=json.loads((root/'measurements.json').read_text());checks=[]
def check(name,ok): checks.append({'name':name,'pass':bool(ok)})
for m in rows:
 name=f"{m['contract']}/{m['strategy']}/{m['project']}";f=pathlib.Path(m['row'])
 r=json.loads(f.read_text()); raw=json.loads(pathlib.Path(m['raw']).read_text())
 check(name+' raw fields',{k:v for k,v in r.items() if k not in ['rawEvidence','sampleCount','samples']}=={k:v for k,v in raw.items() if k!='samples'})
 check(name+' samples',r['sampleCount']==len(raw['samples']) and r['samples']==([raw['samples'][0],raw['samples'][-1]] if raw['samples'] else []))
 check(name+' clean',m['consoleErrors']==0 and m['pageErrors']==0)
 o=json.loads(f.with_name(f.name.replace('row-','objective-')).read_text())
 check(name+' plain URL','debug' not in o['url'] and 'seed=' not in o['url'])
 if m['secures']: check(name+' terminal journey',all(m[k] for k in ['banks','board','reload']))
for cid,projects in [('e10-archive-world',2),('e7-relay-valley',1),('e4-long-road',2),('e5-deepwater-claim',2),('e6-showroom',2)]:
 for project in (['desktop-chrome','mobile-chrome'] if projects==2 else ['mobile-chrome']):
  rides=[m for m in rows if m['contract']==cid and m['project']==project]
  check(cid+'/'+project+' ride budget',len(rides)==(2 if cid=='e7-relay-valley' else 1))
  check(cid+'/'+project+' image budget',len(list((root/cid).rglob(f'*{project}.jpg')))<=3)
for project in ['desktop-chrome','mobile-chrome']:
 f=root/f'e5-deepwater-claim/default/wreck-read-{project}.json'
 d=json.loads(f.read_text());check(project+' restored wreck',d['atBirth']['boss']['persistentWreck'] and d['atBirth']['boss']['hulkPresent'])
 check(project+' reentry clean',not d['consoleErrors'] and not d['pageErrors'])
paths=subprocess.check_output(['git','diff','--name-only',base],text=True).splitlines()
allowed={'e2e/native-proofs/driver.ts',*[f'e2e/native-proofs/{cid}.spec.ts' for cid in ['e10-archive-world','e7-relay-valley','e4-long-road','e5-deepwater-claim','e6-showroom']],'artifacts/sol/play-proofs/run-17/run-note.md'}
check('firewall',all(p in allowed or p.startswith('artifacts/sol/play-proofs/run-18/') for p in paths))
check('equivalence',json.loads((root/'driver-equivalence.json').read_text())['pass'])
for cid in ['e5-flotilla','e5-regatta']:
 r=json.loads((root/f'equivalence/{cid}/row-desktop-chrome.json').read_text());raw=json.loads(pathlib.Path(r['rawEvidence']).read_text())
 check(cid+' raw fields',{k:v for k,v in r.items() if k not in ['rawEvidence','sampleCount','samples']}=={k:v for k,v in raw.items() if k!='samples'})
 check(cid+' zero browser errors',not r['consoleErrors'] and not r['pageErrors'])
for project in ['desktop-chrome','mobile-chrome']:
 d=json.loads((root/f'e10-archive-world/default/objective-{project}.json').read_text())
 check(project+' completed Archive hold',d['archive']['completedHolds']>=1)
def campaign(f):
 text=f.read_text().split('## Complete campaign table',1)[1].split('\n## ',1)[0]
 return [line for line in text.splitlines() if line.startswith('| ')]
check('identical 42-map tables',campaign(root/'run-note.md')==campaign(root.parent/'run-17/run-note.md') and len(campaign(root/'run-note.md'))==44)
check('checks green',all(c['exit']==0 for c in json.loads((root/'checks.json').read_text())))
output={'pass':all(c['pass'] for c in checks),'rides':len(rows),'checks':checks}
(root/'verification.json').write_text(json.dumps(output,indent=2)+'\n');print(json.dumps(output));raise SystemExit(0 if output['pass'] else 1)
