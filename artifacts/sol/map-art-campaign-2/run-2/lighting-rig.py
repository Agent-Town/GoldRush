from pathlib import Path
import subprocess,os,json,shutil,sys,time
name=sys.argv[1];scenes=sys.argv[2];epoch=sys.argv[3];root=Path('artifacts/sol/map-art-campaign-2');out=root/'run-2'/name;out.mkdir(exist_ok=True);rows=[]
phases=[(sys.argv[4],'')] if len(sys.argv)>4 else [('baseline',''),('max','&lmemissive=0.6')]
for phase,query in phases:
 label='campaign2-'+name+'-'+phase
 env={**os.environ,'PATH':'/opt/homebrew/bin:'+os.environ['PATH'],'GR_CAPTURE_EXTERNAL_SERVER':'1','GR_CAPTURE_BASE_URL':'http://127.0.0.1:5303','GR_LIGHTING_CALIBRATION':'1','GR_LIGHTING_PHASE':label,'GR_LIGHTING_SCENES':scenes,'GR_LIGHTING_QUERY':'&epoch='+epoch+query}
 cmd=['npx','playwright','test','e2e/landmark-brightness.spec.ts','--grep','reference rig','--workers=1','--project=desktop-chrome','--project=mobile-chrome','--trace=off','--reporter=line']
 log=root/'_raw/run-2'/(label+'.log');start=time.time()
 with log.open('w') as f:rc=subprocess.run(cmd,env=env,stdout=f,stderr=subprocess.STDOUT).returncode
 files=[]
 for p in Path('artifacts/landmark-lighting-calibration').glob(label+'-*'):
  shutil.copy2(p,out/p.name);files.append(p.name)
 rows.append({'phase':phase,'exit':rc,'command':cmd,'query':env['GR_LIGHTING_QUERY'],'seconds':time.time()-start,'files':files});(out/('rig-'+('-'.join(p for p,q in phases))+'-receipt.json')).write_text(json.dumps(rows,indent=2)+'\n');print(name,phase,rc,flush=True)
 if rc:break
