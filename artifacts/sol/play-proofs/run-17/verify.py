"""Audit provenance, ride limits, terminal claims and the task firewall."""
import pathlib,json,subprocess
root=pathlib.Path('artifacts/sol/play-proofs/run-17'); base='3bac7b9e44f1f8e24065451a58b87e0e29d4657d'
rows=json.loads((root/'measurements.json').read_text());checks=[]
def check(name,ok):
 checks.append({'name':name,'pass':bool(ok)})
for m in rows:
 name=f"{m['contract']}/{m['strategy']}/{m['project']}"
 r=json.loads(pathlib.Path(m['row']).read_text());raw=json.loads(pathlib.Path(m['raw']).read_text())
 compare={k:v for k,v in r.items() if k not in ['rawEvidence','sampleCount','samples','terminalImage']}
 check(name+' raw fields',compare=={k:v for k,v in raw.items() if k!='samples'})
 check(name+' raw samples',r['sampleCount']==len(raw['samples']) and r['samples']==[raw['samples'][i] for i in [0,-1]] if raw['samples'] else r['samples']==[])
 check(name+' clean',m['consoleErrors']==0 and m['pageErrors']==0)
 objective=json.loads((pathlib.Path(m['row']).parent/f"objective-{m['project']}.json").read_text())
 check(name+' plain URL','debug' not in objective['url'] and 'seed=' not in objective['url'])
 if m['strategy']=='restore-ground':
  defaults=[d for d in rows if d['contract']==m['contract'] and d['project']==m['project'] and d['strategy']=='default']
  check(name+' eligible',len(defaults)==1 and defaults[0]['objectiveMet'] is True and defaults[0]['hp']==0)
 if r['secures']['ok']:
  check(name+' full terminal',m['objectiveMet'] is True and all(r[k]['ok'] for k in ['banks','board','reload','clean']))
for cid in ['e8-mare-claim','e7-relay-valley','e10-archive-world','e10-ember-shore']:
 for project in ['desktop-chrome','mobile-chrome']:
  rides=[m for m in rows if m['contract']==cid and m['project']==project]
  check(cid+'/'+project+' ride limit',1<=len(rides)<=2)
  images=list((root/cid).rglob(f'*{project}.jpg'))
  check(cid+'/'+project+' image budget',len(images)<=3)
paths=subprocess.check_output(['git','diff','--name-only',base],text=True).splitlines()
allowed={'e2e/native-proofs/driver.ts',*[f'e2e/native-proofs/{cid}.spec.ts' for cid in ['e8-mare-claim','e7-relay-valley','e10-archive-world','e10-ember-shore']],'artifacts/sol/play-proofs/run-16/run-note.md'}
check('firewall',all(p in allowed or p.startswith('artifacts/sol/play-proofs/run-17/') for p in paths))
check('equivalence',json.loads((root/'driver-equivalence.json').read_text())['pass'])
for cid in ['e5-flotilla','e5-regatta']:
 r=json.loads((root/f'equivalence/{cid}/row-desktop-chrome.json').read_text())
 raw=json.loads(pathlib.Path(r['rawEvidence']).read_text())
 check(cid+' equivalence raw fields',{k:v for k,v in r.items() if k not in ['rawEvidence','sampleCount','samples']}=={k:v for k,v in raw.items() if k!='samples'})
 check(cid+' equivalence zero errors',not r['consoleErrors'] and not r['pageErrors'])
def campaign(file):
 text=file.read_text().split('## Complete campaign table',1)[1].split('\n## ',1)[0]
 return [line for line in text.splitlines() if line.startswith('| ')]
check('campaign tables identical and 42 maps',campaign(root/'run-note.md')==campaign(root.parent/'run-16/run-note.md') and len(campaign(root/'run-note.md'))==44)

check('required checks',all(c['exit']==0 for c in json.loads((root/'checks.json').read_text())))
result={'pass':all(c['pass'] for c in checks),'rides':len(rows),'checks':checks}
(root/'verification.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result));raise SystemExit(0 if result['pass'] else 1)
