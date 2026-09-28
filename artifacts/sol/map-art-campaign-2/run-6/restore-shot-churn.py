"""Preserve and restore only generated PNG churn outside this run's evidence."""
from pathlib import Path
import subprocess, shutil, json, sys
r=Path('artifacts/sol/map-art-campaign-2'); raw=r/'_raw/run-6/churn'/sys.argv[1]; raw.mkdir(parents=True,exist_ok=True)
rows=[]
for p in subprocess.check_output(['git','diff','--name-only'],text=True).splitlines():
 if p.endswith('.png') and not p.startswith(str(r/'run-6')):
  dst=raw/p;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,dst)
  Path(p).write_bytes(subprocess.check_output(['git','show','HEAD:'+p]));rows.append(p)
(r/'run-6'/sys.argv[1]/'churn-restoration.json').write_text(json.dumps(rows,indent=2)+'\n')
print('restored PNGs',len(rows))
