"""Write a measured finding from saved rows; interpretation is supplied explicitly."""
import json, sys
from pathlib import Path
contract, verdict, interpretation = sys.argv[1:]
base = Path('artifacts/sol/play-proofs/run-11') / contract
rows=[]
for strategy in ['default', 'restore-ground']:
 for project in ['desktop-chrome','mobile-chrome']:
  p=base/strategy/'driver'/contract/f'row-{project}.json'
  if not p.exists(): continue
  d=json.loads(p.read_text()); s=d.get('finalSnapshot') or {}; defs=s.get('defences',[])
  standing=sum(not b['wrecked'] and b['hp'] > 0 for b in defs)
  cells='; '.join(k+': '+('PASS' if d[k]['ok'] else 'HELD') for k in ['secures','banks','board','reload','clean'])
  rows.append(f"| {project} / {strategy} | {d['peakWave']} | {d['simAtEnd']:.3f} | {d['hpAtEnd']:.2f} | {d['goldAtEnd']} | {s.get('repairs', 'unknown')} | {standing}/{len(defs)} | {cells} | [row]({p.relative_to(base)}) |")
text=f'''# {contract} — {verdict}

{interpretation}

| Project / strategy | Wave | Sim seconds | HP | Gold | Repairs | Pieces standing | Checks | Evidence |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
'''+ '\n'.join(rows)+'''

Each invocation retains its command, exit code and log in the strategy directory; screenshots and full diagnostics sit beside each row. Terminal/last images on failed rides are actual loss or held-objective screens, not secured terminals. Bank/Book/reload images exist only for successful journeys; no replacement or reconstructed bank evidence is supplied for a hold. Standing counts use the final actual build snapshot, not just acknowledged purchases.

Method: real town-board launch, the application's own mode URL, campaign timescale 4, public plain seed, existing progressed profile, native keyboard/HUD actions and read-only diagnostics. Shared driver unchanged. No production, contract, art or balance changes. This proves desktop/390px browser journeys, not hardware-device touch-only play.
'''
(base / ('proof.md' if verdict=='PASS' else 'finding.md')).write_text(text)
