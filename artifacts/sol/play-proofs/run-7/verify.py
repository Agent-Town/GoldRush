"""Check the recorded acceptance evidence, without running or changing the game."""
import json
import subprocess
from pathlib import Path

root = Path(__file__).resolve().parent
rows = []
for project in ('desktop-chrome', 'mobile-chrome'):
    folder = root / 'e10-river'
    first = json.loads((folder / f'ending-{project}.json').read_text())
    repeat = json.loads((folder / f'repull-{project}.json').read_text())
    native = json.loads((folder / f'first-row-{project}.json').read_text())
    assert all(native[cell]['ok'] for cell in ('boots', 'secures', 'banks', 'board', 'reload', 'clean'))
    assert native['objective']['prelude']['secures']['ok']
    assert native['objective']['prelude']['banks']['ok']
    assert first['literalReload'] and repeat['repull']['ok']
    assert first['errors'] == repeat['errors'] == {'console': [], 'page': []}
    assert first['ceremonyStandings'] == repeat['ceremonyStandings'] == []
    observations = repeat['observations']
    assert [o['kind'] for o in observations] == ['boot', 'first-gold', 'second-gold'] * 2
    boot, pan, second, reboot, repan, resecond = observations
    assert not boot['river'] and boot['gold'] == 0
    assert len(pan['river']) == 1
    score = pan['river'][0]
    assert score['secured'] and score['waves'] == 0 and score['gold'] == 5
    assert first['firstGoldTime'] == score['timeAlive'] <= pan['sim']
    assert pan['raw'] == second['raw']
    assert all(o['river'] == pan['river'] for o in [second, reboot, repan, resecond])
    assert reboot['raw'] == repan['raw'] == resecond['raw']
    assert repeat['nativeCells']['secures']['ok'] and repeat['nativeCells']['board']['ok']
    assert not repeat['nativeCells']['banks']['ok']  # no NEW score is the required repeat result
    raw = first['rawRoute']
    assert [r['target'] for r in raw] == [11.5, 26.5, 30]
    assert all(r['target'] <= r['sim'] < r['target'] + .25 for r in raw)
    for prefix in ('pan', 'book', 'bank-cell', 'repull-book', 'raw'):
        assert (folder / f'{prefix}-{project}.png').stat().st_size > 1000
    rows.append({'project': project, 'verdict': 'PASS', 'firstGoldTime': first['firstGoldTime'],
                 'gold': score['gold'], 'standings': 0, 'console': 0, 'page': 0,
                 'raw': raw})
seed = [json.loads(line) for line in (root / 'seed-measure.log').read_text().splitlines() if line.startswith('{')]
assert seed[0]['riverCompletionKept'] is False and seed[2]['riverCompletionKept'] is True
changed = subprocess.check_output(['git', 'diff', '--name-only', 'HEAD'], text=True).splitlines()
untracked = subprocess.check_output(['git', 'ls-files', '--others', '--exclude-standard'], text=True).splitlines()
allowed = lambda p: p in ('e2e/native-proofs/driver.ts', 'e2e/native-proofs/e10-river-ending.spec.ts') or p.startswith('artifacts/sol/play-proofs/run-7/')
assert all(allowed(p) for p in changed + untracked), [p for p in changed + untracked if not allowed(p)]
# The only shared-driver change must be inside seedEntries.
base = subprocess.check_output(['git', 'show', 'HEAD:e2e/native-proofs/driver.ts'], text=True)
current = Path('e2e/native-proofs/driver.ts').read_text()
assert base.split('function seedEntries')[0] == current.split('function seedEntries')[0]
assert base.split('async function seed(page:')[1] == current.split('async function seed(page:')[1]
print(json.dumps({'verdict': 'PASS', 'projects': rows, 'scope': sorted(set(changed + untracked))}, indent=2))
