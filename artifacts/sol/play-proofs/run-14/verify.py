"""Audit retained measurements, scope and ride limits without promoting holds."""
import json, subprocess, re
from collections import Counter
from pathlib import Path
root = Path(__file__).parent
base = (root / 'base.txt').read_text().strip()
ids = ['e7-relay-valley','e8-mare-claim','e10-archive-world','e10-ember-shore']
allowed = {f'e2e/native-proofs/{i}.spec.ts' for i in ids}
changed = subprocess.check_output(['git','diff','--name-only',base],text=True).splitlines()
changed += subprocess.check_output(['git','ls-files','--others','--exclude-standard'],text=True).splitlines()
assert all(p in allowed or p.startswith('artifacts/sol/play-proofs/run-14/') or p.startswith(('logs/','reviews/shots-')) or p.endswith('.png') for p in changed), changed
assert not subprocess.check_output(['git','diff',base,'--','e2e/native-proofs/driver.ts'],text=True)
rides=[]
for id in ids:
    assert (root/id/'finding.md').exists() or (root/id/'proof.md').exists(), id
    for project in ['desktop-chrome','mobile-chrome']:
        files = sorted(root.glob(f'{id}/*/row-{project}.json'))
        assert 1 <= len(files) <= 2, (id,project,len(files))
        assert any(p.parent.name == 'default' for p in files)
        for p in files:
            row=json.loads(p.read_text()); raw=json.loads(Path(row['rawEvidence']).read_text())
            assert row['clean']['ok'] and not row['consoleErrors'] and not row['pageErrors']
            assert row['contract']==id and row['project']==project and row['boots']['ok']
            assert row['sampleCount']==len(raw['samples'])
            raw['samples']=[raw['samples'][0],raw['samples'][-1]] if raw['samples'] else []
            compact={k:v for k,v in row.items() if k not in ['sampleCount','rawEvidence']}
            assert raw == compact, str(p)
            o=json.loads((p.parent/f'objective-{project}.json').read_text())
            assert 'debug' not in o['url'] and 'seed=' not in o['url']
            assert (p.parent/f'terminal-{project}.jpg').exists() or (Path(row['rawEvidence']).parent/f'terminal-{project}.jpg').exists()
            full=all(row[k]['ok'] for k in ['secures','banks','board','reload','clean'])
            if full:
                for label in ['board','bank-cell']: assert (p.parent/f'{label}-{project}.jpg').exists()
                assert json.loads((p.parent/f'bank-cell-{project}.json').read_text())['originalContext']
                if id=='e8-mare-claim': assert o['atmosphere']['regolith']['complete']
                if id=='e10-archive-world': assert o['archive']['objectiveAllowsSecure']
                if id=='e10-ember-shore': assert o['preserveVent']['objectiveMet']
            rides.append(dict(contract=id,project=project,strategy=p.parent.name,fullDriverPass=full,consoleErrors=len(row['consoleErrors']),pageErrors=len(row['pageErrors'])))
note=(root/'run-note.md').read_text().split('## Complete campaign table')[1].split('## Recommendation')[0]
table=[x for x in note.splitlines() if x.startswith('| ')][2:]
inventory=[]
for p in Path('assets/contracts').glob('*/contracts.json'):
    inventory.extend(x['id'] for x in json.loads(p.read_text())['contracts'])
found=[]
for row in table:
    matches=[id for id in inventory if id in row]
    assert len(matches)==1,(row,matches)
    found.extend(matches)
assert len(table)==42 and Counter(found)==Counter(inventory)
verdicts=Counter()
for row in table:
    v=row.split('|')[2].strip()
    verdicts[next(k for k in ['PROVED both screens','PROVED one screen','PARTIAL','HELD','DEFECT corrected'] if v.startswith(k))]+=1
assert verdicts=={'PROVED both screens':7,'PROVED one screen':3,'PARTIAL':2,'HELD':29,'DEFECT corrected':1},verdicts
size=sum(p.stat().st_size for p in root.rglob('*') if p.is_file())
assert size<25_000_000,size
result=dict(campaignInventory=42,campaignVerdicts=dict(verdicts),scope=True,sharedDriverUnchanged=True,rawRowEquivalence=True,rideLimits=True,applicableScreenshots=True,workingEvidenceBytes=size,rides=rides)
(root/'verification.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
