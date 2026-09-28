"""Verify scope and evidence; never reinterpret a failed objective as a pass."""
import json
import subprocess
from pathlib import Path
base = 'e657f54597128d8b6303af9159086fc5fe7f9170'
root = Path('artifacts/sol/play-proofs/run-5')
status = 'reviews/sol-map-art-current-status-20260909.md'
report = 'artifacts/sol/map-art-campaign-2/report.md'
changed = subprocess.check_output(['git', 'diff', '--name-only', base], text=True).splitlines()
untracked = subprocess.check_output(['git', 'ls-files', '--others', '--exclude-standard'], text=True).splitlines()
assert all(p.startswith(('e2e/native-proofs/', str(root) + '/', 'logs/')) or p in (status, report) for p in changed + untracked), changed + untracked
old = subprocess.check_output(['git', 'show', f'{base}:{status}'], text=True).splitlines()
new = Path(status).read_text().splitlines()
assert len(old) == len(new)
cells = []
for a, b in zip(old, new):
    if a == b: continue
    a, b = a.split('|'), b.split('|')
    assert len(a) == len(b) == 5 and a[:2] == b[:2] and a[3:] == b[3:]
    cells.append(b[1].strip())
previous = subprocess.check_output(['git', 'show', f'{base}:{report}'], text=True)
assert Path(report).read_text().startswith(previous)
assert Path(report).read_text()[len(previous):].count('\n## ') == 1
rows = []
for p in sorted(root.glob('*/row-*.json')):
    r = json.loads(p.read_text())
    assert r['boots']['ok'] and r['clean']['ok'], str(p)
    assert not r['consoleErrors'] and not r['pageErrors'], str(p)
    assert (p.parent / f"terminal-{r['project']}.png").exists(), str(p)
    if r['secures']['ok']:
        assert all(r[c]['ok'] for c in ('banks','board','reload')), str(p)
        assert (p.parent / f"board-{r['project']}.png").exists()
    if r['contract'] == 'e2-incline': assert r['secures']['ok'], str(p)
    rows.append({k:r[k] for k in ('contract','project','peakWave','secures','clean')})
assert len(cells) * 2 + 2 == len(rows), (cells, len(rows))
assert len(cells) == 3 and len(rows) == 8
phone = json.loads((root / 'e9-devils-alley/row-mobile-chrome.json').read_text())
assert all(phone[c]['ok'] for c in ('boots','secures','banks','board','reload','clean'))
for map_id in ('e9-dome-basin','e9-seed-run','e9-devils-alley'):
    for project in ('desktop-chrome','mobile-chrome'):
        assert (root / map_id / f'row-{project}.json').exists()
result = {'scope':'PASS','statusCells':cells,'rowCount':len(rows),'rows':rows}
(root / 'verification.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
