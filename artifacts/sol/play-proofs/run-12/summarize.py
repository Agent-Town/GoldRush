"""Compact measured rides; never infer a pass from survival alone."""
import json
from pathlib import Path
root = Path(__file__).parent
rows = []
for p in sorted(root.glob('*/*/row-*.json')):
    r = json.loads(p.read_text())
    s = r.get('finalSnapshot') or {}
    ds = s.get('defences', [])
    rows.append(dict(contract=r['contract'], project=r['project'], strategy=p.parts[-3], wave=r['peakWave'], simSeconds=round(r['simAtEnd'], 3), hp=r['hpAtEnd'], gold=r['goldAtEnd'], repairs=s.get('repairs'), standing=sum(d['hp'] > 0 and not d['wrecked'] for d in ds), pieces=len(ds), newBuilds=len(r['builds']), secure=r['secures'], bank=r['banks'], board=r['board'], reload=r['reload'], clean=r['clean'], path=str(p.relative_to(root))))
(root / 'measurements.json').write_text(json.dumps(rows, indent=2) + '\n')
for r in rows:
    print(r['contract'], r['project'], r['strategy'], r['wave'], r['simSeconds'], r['hp'], r['gold'], r['repairs'], f"{r['standing']}/{r['pieces']}", r['secure']['ok'], r['bank']['ok'])
