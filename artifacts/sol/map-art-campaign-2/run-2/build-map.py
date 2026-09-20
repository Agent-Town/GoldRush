from pathlib import Path
import subprocess,os,json,time,sys
root=Path('artifacts/sol/map-art-campaign-2');id=sys.argv[1];out=root/'run-2'/id;rows=[]
env={**os.environ,'PATH':'/opt/homebrew/bin:'+os.environ['PATH']}
for name,cmd in [('tsc',['npx','tsc','--noEmit']),('build',['npm','run','build']),('full-build',['npm','run','build'])]:
 log=root/'_raw/run-2'/f'{id}-{name}.log';e={**env};start=time.time()
 if name=='full-build':e['GR_RELEASE']='full'
 with log.open('w') as f:rc=subprocess.run(cmd,env=e,stdout=f,stderr=subprocess.STDOUT,timeout=900).returncode
 rows.append({'name':name,'command':cmd,'exit':rc,'seconds':time.time()-start,'log':str(log)});(out/'build-gates.json').write_text(json.dumps(rows,indent=2)+'\n');print(id,name,rc,flush=True)
 if rc:break
