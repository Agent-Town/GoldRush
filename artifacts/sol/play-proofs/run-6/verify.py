"""Check scope and recorded evidence without promoting held assertions."""
import json
import subprocess
from pathlib import Path
root = Path('artifacts/sol/play-proofs/run-6')
base = (root / 'base.txt').read_text().strip()
status = 'reviews/sol-map-art-current-status-20260909.md'
report = 'artifacts/sol/map-art-campaign-2/report.md'
changed = subprocess.check_output(['git','diff','--name-only',base],text=True).splitlines()
untracked = subprocess.check_output(['git','ls-files','--others','--exclude-standard'],text=True).splitlines()
assert all(p.startswith(('e2e/native-proofs/',str(root)+'/', 'logs/')) or p in (status,report) for p in changed+untracked), changed+untracked
old = subprocess.check_output(['git','show',f'{base}:{status}'],text=True).splitlines()
new = Path(status).read_text().splitlines()
assert len(old) == len(new)
cells = []
for a,b in zip(old,new):
    if a == b: continue
    aa,bb = a.split('|'),b.split('|')
    assert len(aa) == len(bb) == 5 and aa[:2] == bb[:2] and aa[3:] == bb[3:]
    if 'e10-last-claim' in aa[1] or 'e10-river' in aa[1]: assert aa[2].strip() in bb[2]
    cells.append(bb[1].strip())
assert len(cells) == 3, cells
previous = subprocess.check_output(['git','show',f'{base}:{report}'],text=True)
current = Path(report).read_text()
assert current.startswith(previous) and current[len(previous):].count('\n## ') == 1
rows=[]
for map_id in ('e2-incline','e9-old-canal','e10-last-claim','e10-river'):
    for project in ('desktop-chrome','mobile-chrome'):
        folder=root/map_id
        r=json.loads((folder/f'row-{project}.json').read_text())
        assert r['contract']==map_id and r['project']==project
        assert r['boots']['ok'] and r['clean']['ok'], (map_id,project,r['boots'],r['clean'])
        assert not r['consoleErrors'] and not r['pageErrors']
        assert (folder/f'terminal-{project}.png').exists()
        for c in ('boots','secures','banks','board','reload','clean'):
            assert isinstance(r[c]['ok'],bool) and r[c]['detail']
        if r['board']['ok']: assert (folder/f'board-{project}.png').exists()
        if map_id=='e2-incline': assert all(r[c]['ok'] for c in ('secures','banks','board','reload'))
        rows.append({k:r[k] for k in ('contract','project','peakWave','secures','banks','board','reload','clean')})
for map_id in ('e9-old-canal','e10-last-claim','e10-river'):
    spec=Path(f'e2e/native-proofs/{map_id}.spec.ts').read_text()
    assert "test.skip(!process.env.GR_NATIVE_PROOF" in spec
result={'scope':'PASS','statusCells':cells,'rowCount':len(rows),'rows':rows}
(root/'verification.json').write_text(json.dumps(result,indent=2)+'\n')
print('PASS: allowed paths, three objective-only cells, prior E10 instruments preserved, eight rows and terminal boards')
