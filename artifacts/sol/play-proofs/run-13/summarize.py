"""Use frozen pre-bank observations for terminal numbers, including failed banks."""
import json
from pathlib import Path
root = Path(__file__).parent
rows = []
for p in sorted(root.glob('*/*/row-*.json')):
    r = json.loads(p.read_text())
    o = json.loads((p.parent / f"objective-{r['project']}.json").read_text())
    ds = o.get('defences') or []
    rows.append(dict(contract=r['contract'], project=r['project'], strategy=p.parent.name,
        wave=o['wave'], simSeconds=round(o['sim'], 3), hp=o['hp'], gold=o['gold'],
        repairs=o['repairs'], standing=sum(d['hp'] > 0 and not d['wrecked'] for d in ds),
        pieces=len(ds), newBuilds=len(r['builds']), secure=r['secures'], bank=r['banks'],
        board=r['board'], reload=r['reload'], clean=r['clean'], path=str(p.relative_to(root))))
(root / 'measurements.json').write_text(json.dumps(rows, indent=2) + '\n')
for r in rows:
    print(r['contract'], r['project'], r['strategy'], r['wave'], r['simSeconds'], r['hp'], r['gold'], r['repairs'], f"{r['standing']}/{r['pieces']}", r['secure']['ok'], r['bank']['ok'])
