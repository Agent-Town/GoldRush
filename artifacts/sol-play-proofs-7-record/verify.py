import hashlib, json, subprocess
from pathlib import Path
root=Path('artifacts/sol/play-proofs/run-11')
ids=['e1-drill-yard','e1-dry-gulch','e1-night-shift','e2-hill-mine','e2-trestle','e3-moth-season']
base=(root/'base.txt').read_text().strip()
changed=set(subprocess.check_output(['git','diff','--name-only',base],text=True).splitlines())
changed.update(subprocess.check_output(['git','ls-files','--others','--exclude-standard'],text=True).splitlines())
allowed={f'e2e/native-proofs/{id}.spec.ts' for id in ids}
assert all(p.startswith(str(root)+'/') or p in allowed for p in changed), sorted(changed-allowed)
assert hashlib.sha256(Path('e2e/native-proofs/driver.ts').read_bytes()).hexdigest()==(root/'driver-before.sha256').read_text().split()[0]
counts={}
for id in ids:
 for project in ['desktop-chrome','mobile-chrome']:
  paths=list((root/id).rglob(f'row-{project}.json'))
  assert 1 <= len(paths) <= 2, (id,project,len(paths))
  counts[f'{id}/{project}']=len(paths)
  for p in paths:
   d=json.loads(p.read_text())
   if id=='e1-drill-yard':
    assert d['errors']==[]
    if 'initial' not in p.parts:
     assert d['verdict']=='PASS' and d['standingsRequests']==0
     assert d['terminal']['yard']['bell']['wavesCompleted']==1
     for kind in ['terminal','board','no-bank']: assert (p.parent/f'{kind}-{project}.png').exists()
   else:
    assert d['clean']['ok'] and not d['consoleErrors'] and not d['pageErrors']
    assert (p.parent/f'terminal-{project}.png').exists()
    if all(d[k]['ok'] for k in ['secures','banks','board','reload']):
     for kind in ['board','bank-cell','bank-book']: assert (p.parent/f'{kind}-{project}.png').exists()
    else:
     assert not d['secures']['ok'], 'Any later-stage failure needs explicit report coverage'
    strategy=p.parents[2].name
    assert (root/id/strategy/f'{project}.exit').read_text().strip()=='1'
 assert (root/id/('proof.md' if id=='e1-drill-yard' else 'finding.md')).exists()
for check in ['tsc-final','build-final','gate-unset-final']:
 assert (root/f'{check}.exit').read_text().strip()=='0', check
assert '12 skipped' in (root/'gate-unset-final.log').read_text()
report={'scope':'PASS','driver_unchanged':True,'rides':counts,'total_rides':sum(counts.values()),'browser_errors':0,'verdicts':{id:'PASS' if id=='e1-drill-yard' else 'HELD' for id in ids},'note':'HELD native tests retain exit 1; audit passing does not make gameplay holds green.'}
(root/'verification.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
