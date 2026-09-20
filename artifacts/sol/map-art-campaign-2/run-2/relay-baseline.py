from pathlib import Path
import subprocess,os,json,time
root=Path('artifacts/sol/map-art-campaign-2');out=root/'run-2/e7-relay-valley';raw=root/'_raw/run-2';p=Path('src/world/Terrain3dClaimPilot.ts');saved=p.read_bytes();(raw/'relay-final-Terrain3dClaimPilot.ts').write_bytes(saved)
env={**os.environ,'PATH':'/opt/homebrew/bin:'+os.environ['PATH']};record={}
def engine():return subprocess.check_output(['node','--input-type=module','-e','import {computeEngineHash} from "./scripts/assay-replay-agent.mjs"; console.log(await computeEngineHash(process.cwd()))'],env=env,text=True).strip()
def check(label):
 return subprocess.run(['python3',str(root/'run-2/map-gates.py'),'e7-relay-valley',label,'e2e/e7-echo-canyon-mirror.spec.ts','e2e/landmark-brightness.spec.ts','--grep','casts no shadow|a playbook used|The Claim keeps|Night Shift keeps'],env=env).returncode
record['candidateEngine']=engine();assert record['candidateEngine']=='14d0ca36b8474f5284c71733530de331e7bac33e87569539f07f4175743ab476'
try:
 p.write_bytes(subprocess.check_output(['git','show','82dd74e86:src/world/Terrain3dClaimPilot.ts']));record['baseEngine']=engine();assert record['baseEngine']=='35db6dcf14954aa36cb232cde030c766e8a9cf21ef77c6e48375666a1a73f809';check('e7-exact-base-narrow')
finally:
 p.write_bytes(saved);record['restoredEngine']=engine();record['byteExactRestoration']=p.read_bytes()==saved;assert record['byteExactRestoration'];(out/'baseline-identity.json').write_text(json.dumps(record,indent=2)+'\n')
check('e7-final-narrow')
