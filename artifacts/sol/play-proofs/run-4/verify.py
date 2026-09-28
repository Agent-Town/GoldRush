"""Check scope and retained evidence without changing gameplay or acceptance thresholds."""
import json
import subprocess
from pathlib import Path

base = 'e6336dd0c0ab196de897c5f1f3cb25df42ce360c'
root = Path('artifacts/sol/play-proofs/run-4')
status = 'reviews/sol-map-art-current-status-20260909.md'
report = 'artifacts/sol/map-art-campaign-2/report.md'
changed = subprocess.check_output(['git', 'diff', '--name-only', base], text=True).splitlines()
assert all(p.startswith(('e2e/native-proofs/', str(root) + '/')) or p in (status, report) for p in changed), changed
old = subprocess.check_output(['git', 'show', f'{base}:{status}'], text=True).splitlines()
new = Path(status).read_text().splitlines()
assert len(old) == len(new)
changed_cells = []
for before, after in zip(old, new):
    if before == after:
        continue
    a, b = before.split('|'), after.split('|')
    assert len(a) == len(b) == 5 and a[:2] == b[:2] and a[3:] == b[3:]
    changed_cells.append(b[1].strip())
assert len(changed_cells) == 3, changed_cells
previous_report = subprocess.check_output(['git', 'show', f'{base}:{report}'], text=True)
assert Path(report).read_text().startswith(previous_report)
assert Path(report).read_text()[len(previous_report):].count('\n## ') == 1
rows = []
for path in sorted(root.glob('*/row-*.json')):
    row = json.loads(path.read_text())
    assert row['boots']['ok'] and row['clean']['ok'], str(path)
    assert not row['consoleErrors'] and not row['pageErrors'], str(path)
    assert (path.parent / f"terminal-{row['project']}.png").exists()
    if row['contract'] in ('the-claim', 'e2-incline'):
        assert all(row[c]['ok'] for c in ('boots', 'secures', 'banks', 'board', 'reload', 'clean')), str(path)
        assert (path.parent / f"board-{row['project']}.png").exists()
    rows.append({'contract': row['contract'], 'project': row['project'], 'wave': row['peakWave'], 'secures': row['secures']['ok']})
assert len(rows) == 9, rows
result = {'scope': 'PASS', 'statusCells': changed_cells, 'rows': rows, 'rowCount': len(rows), 'errors': 0}
(root / 'verification.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result, indent=2))
