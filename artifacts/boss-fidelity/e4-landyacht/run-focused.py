import os, json, shutil, subprocess, hashlib
from pathlib import Path
out=Path('artifacts/boss-fidelity/e4-landyacht/focused-gates-1')
out.mkdir(parents=True, exist_ok=False)
paths=['artifacts/e4-landyacht-boss','reviews/shots-ss-05-e4-beats']
before={}
for name in paths:
 p=Path(name)
 if p.exists():
  shutil.copytree(p,out/'before'/name)
  before.update({str(f):hashlib.sha256(f.read_bytes()).hexdigest() for f in p.rglob('*') if f.is_file()})
env={**os.environ,'GR_CAPTURE_BASE_URL':'http://127.0.0.1:5246','GR_CAPTURE_EXTERNAL_SERVER':'1','PLAYWRIGHT_JSON_OUTPUT_NAME':str(out/'results.json')}
cmd=['node','node_modules/@playwright/test/cli.js','test','e2e/e4-landyacht-boss.spec.ts','e2e/er01-e4-census.spec.ts','e2e/ss-05-e4-beats.spec.ts','--project=desktop-chrome','--project=mobile-chrome','--workers=1','--reporter=line,json','--output='+str(out/'test-results')]
try:
 with (out/'run.log').open('w') as log: result=subprocess.run(cmd,env=env,stdout=log,stderr=subprocess.STDOUT)
finally:
 for name in paths:
  p=Path(name)
  if p.exists(): shutil.copytree(p,out/'after'/name)
  bank=out/'before'/name
  if bank.exists(): shutil.copytree(bank,p,dirs_exist_ok=True)
 restored=all(hashlib.sha256(Path(f).read_bytes()).hexdigest()==h for f,h in before.items())
 (out/'receipt.json').write_text(json.dumps({'command':cmd,'returncode':result.returncode,'restored':restored,'originalFiles':len(before)},indent=2))
print(json.dumps({'returncode':result.returncode,'restored':restored}))
raise SystemExit(result.returncode)
