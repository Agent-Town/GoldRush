"""Run from the lane root after both Incline regressions finish."""
import json
import struct
import subprocess
from pathlib import Path

BASE = 'adac606285211dd2dff461fa0954ca5d7f634675'
ROOT = Path('artifacts/sol/play-proofs/run-2')
STATUS = 'reviews/sol-map-art-current-status-20260909.md'
REPORT = 'artifacts/sol/map-art-campaign-2/report.md'
MAPS = ['e3-blackout-ridge', 'e3-canyon-works', 'e3-fairground']
PROJECTS = ['desktop-chrome', 'mobile-chrome']
CELLS = ['boots', 'secures', 'banks', 'board', 'reload', 'clean']

def git(*args):
    return subprocess.check_output(['git', *args], text=True)

changed = git('diff', '--name-only', BASE).splitlines()
assert all(p.startswith(('e2e/native-proofs/', str(ROOT) + '/')) or p in (STATUS, REPORT) for p in changed), changed
before = git('show', BASE + ':' + STATUS).splitlines()
after = Path(STATUS).read_text().splitlines()
assert len(before) == len(after)
changed_rows = []
for a, b in zip(before, after):
    if a == b:
        continue
    old, new = a.split('|'), b.split('|')
    assert len(old) == len(new) and old[:2] == new[:2] and old[3:] == new[3:]
    assert any(contract in old[1] for contract in MAPS)
    changed_rows.append(old[1].strip())
assert len(changed_rows) == 3
report_before = git('show', BASE + ':' + REPORT)
report_after = Path(REPORT).read_text()
assert report_after.startswith(report_before)
assert report_after[len(report_before):].count('## 2026-09-25 — Native play proofs, run 2') == 1
rows = []
for contract in MAPS + ['e2-incline']:
    for project in PROJECTS:
        directory = ROOT / contract
        row = json.loads((directory / f'row-{project}.json').read_text())
        assert row['project'] == project and row['contract'] == contract
        assert not row['consoleErrors'] and not row['pageErrors'] and row['clean']['ok']
        assert row['boots']['ok']
        if contract == 'e2-incline':
            assert all(row[cell]['ok'] for cell in CELLS)
            assert row['finalSnapshot']['escort']['arrived'] >= row['finalSnapshot']['escort']['required']
        else:
            assert not row['secures']['ok']
        if contract == 'e3-blackout-ridge':
            assert all(row[cell]['ok'] for cell in ['banks', 'board', 'reload'])
            assert all(value == 0 for value in row['powerBanksPeak'].values())
        terminal = directory / f'terminal-{project}.png'
        data = terminal.read_bytes()
        assert data[:8] == b'\x89PNG\r\n\x1a\n'
        dimensions = struct.unpack('>II', data[16:24])
        assert min(dimensions) >= 390
        if row['board']['ok']:
            assert (directory / f'board-{project}.png').is_file()
        rows.append({'contract': contract, 'project': project, 'cells': {cell: row[cell]['ok'] for cell in CELLS}, 'wave': row['peakWave'], 'terminalPixels': dimensions})
result = {'base': BASE, 'headBeforeCloseout': git('rev-parse', 'HEAD').strip(), 'scopePass': True, 'onlySecondColumnChanged': changed_rows, 'oneReportSection': True, 'rows': rows}
(ROOT / 'verification.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result, indent=2))
