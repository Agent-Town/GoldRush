"""Audit scope, rides and applicable evidence; HELD never becomes PASS here."""
import json, subprocess
from pathlib import Path
root=Path(__file__).parent
base='1168df70bd8980049fa11c2fb4bb59f50b9e24d3'
ids=['e4-long-road','e5-deepwater-claim','e5-flotilla','e5-regatta','e5-stillwater','e6-glow-mesa']
allowed={f'e2e/native-proofs/{i}.spec.ts' for i in ids}|{'e2e/native-proofs/driver.ts'}
changed=subprocess.check_output(['git','diff','--name-only',base],text=True).splitlines()
changed+=subprocess.check_output(['git','ls-files','--others','--exclude-standard'],text=True).splitlines()
assert all(p in allowed or p.startswith('artifacts/sol/play-proofs/run-12/') or p.startswith(('logs/','reviews/shots-')) or p.endswith('.png') for p in changed), changed
rides=[]
for id in ids:
    for project in ['desktop-chrome','mobile-chrome']:
        files=sorted(root.glob(f'{id}/*/row-{project}.json'))
        assert 1 <= len(files) <= 2, (id,project,len(files))
        for p in files:
            row=json.loads(p.read_text())
            assert row['contract']==id and row['project']==project
            assert row['boots']['ok'], (str(p),row['boots'])
            assert Path(row['rawEvidence']).exists(), row['rawEvidence']
            assert len(row['samples']) <= 2
            assert (p.parent/f'terminal-{project}.jpg').exists() or (Path(row['rawEvidence']).parent/f'terminal-{project}.jpg').exists(), str(p)
            passed=all(row[k]['ok'] for k in ['secures','banks','board','reload','clean'])
            if passed:
                for label in ['board','bank-cell']:
                    assert (p.parent/f'{label}-{project}.jpg').exists(), (id,label)
                cell=json.loads((p.parent/f'bank-cell-{project}.json').read_text())
                assert cell['originalContext']
                objective=json.loads((p.parent/f'objective-{project}.json').read_text())
                if id=='e5-regatta': assert objective['regatta']['race']['finished']
            rides.append(dict(contract=id,project=project,strategy=p.parent.name,fullDriverPass=passed,consoleErrors=len(row['consoleErrors']),pageErrors=len(row['pageErrors'])))
size=sum(p.stat().st_size for p in root.rglob('*') if p.is_file())
assert size < 25_000_000,size
result=dict(scope=True,rideLimits=True,applicableScreenshots=True,rawRowsExternal=True,workingEvidenceBytes=size,rides=rides)
(root/'verification.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
