"""Audit campaign evidence and scope without running the drain's node battery."""
from pathlib import Path
import json, re, subprocess

BASE = '0340775f852153e619e76ba00ce705323e5f19c2'
ROOT = Path('artifacts/sol/map-art-campaign-2')
RUN = ROOT / 'run-2'
STATUS = 'reviews/sol-map-art-current-status-20260909.md'

def git(*args):
    return subprocess.check_output(['git', *args], text=True)

before = git('show', f'{BASE}:{STATUS}')
after = Path(STATUS).read_text()
def rows(text):
    return {re.search(r'\((e\d-[^)]+)\)', line)[1]: line.split('|')[1:4]
            for line in text.splitlines() if line.startswith('|') and re.search(r'\((e\d-[^)]+)\)', line)}
a, b = rows(before), rows(after)
assert len(a) == len(b) == 42
assert {k: v[:2] for k, v in a.items()} == {k: v[:2] for k, v in b.items()}
original_report = git('show', f'{BASE}:{ROOT}/report.md')
assert (ROOT / 'report.md').read_text().startswith(original_report)

pending = json.loads((RUN / 'pending-manifest.json').read_text())
assert len(pending) == 23
checks = []
for item in pending:
    folder = RUN / item['id']
    assert 'pending corrections and concept verdict' not in b[item['id']][2]
    captures = json.loads((folder / 'verdict-captures.json').read_text())
    assert sorted(r['width'] for r in captures) == [390, 1280]
    for r in captures:
        assert r['errors'] == [] and len(r['plain']) == 2
        assert len(r['runs']) == 8
        for arm in ['before', 'after']:
            assert len([v for v in r['runs'] if v['arm'] == arm]) == 4
        for sample in r['runs']:
            assert len(sample['frames']) == 180
        for p in r['plain']:
            assert p['diagnostics']['contract']['activeId'] == item['id']
            assert p['testHook'] == 'undefined'
        assert (folder / f"board-{r['width']}.png").is_file()
    budgets = json.loads((folder / 'asset-budgets.json').read_text())
    if isinstance(budgets, list):
        assert all(v['actualTriangles'] == v['declaredTriangles'] <= v['budget'] for v in budgets)
    else:
        assert budgets['state'] != 'ready'
    assert (folder / 'review.md').is_file()
    checks.append({**item, 'plainBoots': 4, 'errors': 0, 'timingRuns': 16,
                   'verdict': (folder / 'status.txt').read_text().strip(),
                   'budgetState': 'within authored caps' if isinstance(budgets, list) else budgets['state']})

changes = git('diff', '--name-status', BASE, 'HEAD').splitlines()
allowed_files = {STATUS, 'src/world/Water.ts', 'src/world/Terrain3dClaimPilot.ts'}
files = []
for line in changes:
    state, path = line.split('\t')
    allowed = path in allowed_files or path.startswith(('assets/pilots/map-rebuild-spike/', str(ROOT) + '/'))
    allowed |= path.startswith('e2e/') and state == 'A'
    allowed |= path.startswith('src/entities/')
    assert allowed, (state, path)
    assert '/_raw/' not in path
    assert not path.endswith(('.zip', '.mp4', '.webm', '.mov'))
    size = int(git('cat-file', '-s', f'HEAD:{path}'))
    assert size <= 50_000_000, (path, size)
    files.append({'status': state, 'path': path, 'bytes': size})
git('diff', '--check', BASE)
engine = subprocess.check_output(['/opt/homebrew/bin/node', '--input-type=module', '-e',
    'import {computeEngineHash} from "./scripts/assay-replay-agent.mjs"; console.log(await computeEngineHash(process.cwd()))'], text=True).strip()
assert engine == '32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb'
result = {'base': BASE, 'auditedHead': git('rev-parse', 'HEAD').strip(), 'engine': engine,
          'objectiveRowsPreserved': 42, 'firstReportPreserved': True,
          'pendingVerdictsCompleted': len(checks), 'pendingPlainBoots': 92,
          'pendingTimingRuns': 368, 'pendingFrameSamples': 66240,
          'pendingMaps': checks, 'changedFiles': files,
          'scope': 'Committed campaign diff; final closeout documents are checked again after commit. No drain battery.'}
(RUN / 'closeout-audit.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps({k: result[k] for k in ['auditedHead', 'engine', 'objectiveRowsPreserved', 'firstReportPreserved', 'pendingVerdictsCompleted', 'pendingPlainBoots', 'pendingTimingRuns']}))
