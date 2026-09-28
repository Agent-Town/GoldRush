import json, math
from pathlib import Path
root = Path(__file__).resolve().parent
results = []
for file in sorted((root / 'e1-twin-banks').rglob('diagnostic-mobile-chrome.json')):
    samples = json.loads(file.read_text())['samples']
    late = [s for s in samples if s['wave'] >= 14]
    if not late:
        continue
    results.append({
        'file': str(file.relative_to(root)), 'samples': len(samples),
        'firstWave14': {k: late[0][k] for k in ['t', 'wave', 'hp', 'gold', 'hero']},
        'terminal': {k: late[-1][k] for k in ['t', 'wave', 'hp', 'gold', 'hero', 'alive', 'repairs']},
        'lateMaxHomeDistance': max(math.hypot(s['hero']['x'], s['hero']['z'] + 12) for s in late),
        'lateNorthBankSamples': sum(s['hero']['z'] > 1.5 for s in late),
        'lateChannelingSamples': sum(s['channeling'] for s in late),
        'minimumStandingAfterWave14': min(sum(d['hp'] > 0 and not d['wrecked'] for d in s['defences']) for s in late),
    })
print(json.dumps(results, indent=2))
