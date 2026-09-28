"""Validate saved outcomes and the task boundary; does not rerun gameplay."""
import json
import subprocess
from pathlib import Path
root = Path(__file__).resolve().parent
base = (root / 'base.txt').read_text().strip()
allowed = {'e2e/native-proofs/driver.ts', 'e2e/native-proofs/e9-old-canal.spec.ts', 'e2e/native-proofs/e1-twin-banks.spec.ts', 'e2e/native-proofs/e2-incline.spec.ts'}
changed = subprocess.check_output(['git', 'diff', '--name-only', base], text=True).splitlines()
assert all(p in allowed or p.startswith('artifacts/sol/play-proofs/run-8/') for p in changed), changed
before = subprocess.check_output(['git', 'show', f'{base}:e2e/native-proofs/driver.ts'], text=True)
after = Path('e2e/native-proofs/driver.ts').read_text()
assert [l.strip() for l in before.splitlines() if 'expect(' in l] == [l.strip() for l in after.splitlines() if 'expect(' in l]
diagnosis_driver = subprocess.check_output(['git', 'show', '7fbb85e38:e2e/native-proofs/driver.ts'], text=True)
assert diagnosis_driver == before, 'Diagnosis must precede strategy implementation'
subprocess.run(['node', str(root / 'verify-default.mjs')], check=True, capture_output=True)
results = []
for folder in ['diagnostic/e9-old-canal', 'e9-old-canal', 'e2-incline']:
    for project in ['desktop-chrome', 'mobile-chrome']:
        row = json.loads((root / folder / f'row-{project}.json').read_text())
        assert row['boots']['ok'] and row['clean']['ok']
        expected = folder == 'e2-incline' or (folder == 'e9-old-canal' and project == 'mobile-chrome')
        assert row['secures']['ok'] == expected
        if expected:
            assert all(row[cell]['ok'] for cell in ['banks', 'board', 'reload'])
            assert (root / folder / f'board-{project}.png').exists()
        assert (root / folder / f'terminal-{project}.png').exists()
        results.append({'folder': folder, 'project': project, 'wave': row['peakWave'], 'sim': row['simAtEnd'], 'gold': row['goldAtEnd'], 'gameplayPass': expected})
assert '44 skipped' in (root / 'gate-unset.log').read_text()
assert '2 passed' in (root / 'incline.log').read_text()
assert '2 passed' in (root / 'adjacent.log').read_text()
assert (root / 'tsc-final.log').read_text() == ''
report = {'scopeAndSavedOutcomes': 'PASS', 'defaultSyntaxEquivalent': True, 'rows': results,
          'evidenceGate': 'HELD: separate Old Canal phone bank-cell screenshot was not captured; no fabricated substitute',
          'twinBanks': 'NOT RUN: Old Canal did not pass both projects'}
(root / 'verification.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
