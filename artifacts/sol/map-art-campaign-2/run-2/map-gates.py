from pathlib import Path
import subprocess,os,json,time,sys
root=Path('artifacts/sol/map-art-campaign-2');id=sys.argv[1];label=sys.argv[2];out=root/'run-2'/id;out.mkdir(exist_ok=True)
env={**os.environ,'PATH':'/opt/homebrew/bin:'+os.environ['PATH'],'GR_CAPTURE_EXTERNAL_SERVER':'1','GR_CAPTURE_BASE_URL':'http://127.0.0.1:5303','GR_GUARD_NO_ARTIFACT':'1'}
cmd=['npx','playwright','test','--workers=1','--project=desktop-chrome','--project=mobile-chrome','--trace=off','--reporter=line','--output='+str(root/'_raw/run-2'/label),*sys.argv[3:]]
log=root/'_raw/run-2'/(label+'.log');start=time.time()
with log.open('w') as f:
 try:rc=subprocess.run(cmd,env=env,stdout=f,stderr=subprocess.STDOUT,timeout=900).returncode
 except subprocess.TimeoutExpired:rc='timeout'
r={'exit':rc,'command':cmd,'log':str(log),'seconds':time.time()-start};(out/(label+'-gates.json')).write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r),flush=True)
