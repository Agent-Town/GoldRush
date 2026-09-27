"""Read saved proof rows; never infer a win from a command's mere completion."""
import json, sys
from pathlib import Path
base = Path('artifacts/sol/play-proofs/run-11')
for contract in sys.argv[1:]:
 for p in sorted((base / contract).glob('*/driver/*/row-*.json')):
  d=json.loads(p.read_text()); s=d.get('finalSnapshot') or {}; defs=s.get('defences',[])
  print(json.dumps({'file':str(p),'project':d['project'],'wave':d['peakWave'],'sim':round(d['simAtEnd'],3),'hp':round(d['hpAtEnd'],2),'gold':d['goldAtEnd'],'repairs':s.get('repairs'),'standing':f"{sum(not b['wrecked'] and b['hp'] > 0 for b in defs)}/{len(defs)}",'cells':{k:d[k] for k in ['boots','secures','banks','board','reload','clean']},'escort':s.get('escort'),'power':s.get('power',{}).get('connect')},ensure_ascii=False))
