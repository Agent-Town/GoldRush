"""Read retained terminal observations; never infer a passed objective from survival."""
import json
from pathlib import Path
root=Path(__file__).parent
rows=[]
for p in sorted(root.glob('*/*/row-*.json')):
 r=json.loads(p.read_text());o=json.loads(p.with_name(p.name.replace('row-','objective-')).read_text())
 ds=o.get('defences') or []
 rows.append(dict(contract=r['contract'],project=r['project'],strategy=p.parent.name,
  wave=o['wave'],sim=o['sim'],hp=o['hp'],gold=o['gold'],repairs=o['repairs'],standing=sum(d['hp']>0 for d in ds),pieces=len(ds),
  checks={k:r[k] for k in ['boots','secures','banks','board','reload','clean']},
  objective={k:o.get(k) for k in ['playbookUse','air','atmosphere','physics','archive','preserveVent','squall']},evidence=str(p.relative_to(root))))
(root/'measurements.json').write_text(json.dumps(rows,indent=2)+'\n')
for r in rows:
 print(r['contract'],r['project'],r['strategy'],r['wave'],round(r['sim'],3),r['hp'],r['gold'],r['repairs'],f"{r['standing']}/{r['pieces']}")
