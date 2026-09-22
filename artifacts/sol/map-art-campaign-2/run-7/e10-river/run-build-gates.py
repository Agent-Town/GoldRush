from pathlib import Path
import subprocess,os,json,time
out=Path(__file__).parent
env={**os.environ,'PATH':'/opt/homebrew/bin:'+os.environ['PATH']}
rows=[]
for name,cmd,extra in [('tsc',['npx','tsc','--noEmit'],{}),('build-default',['npm','run','build'],{}),('build-full',['npm','run','build'],{'GR_RELEASE':'full'}),('build-e1',['npm','run','build'],{'GR_RELEASE':'e1'}),('first-town-payload',['node','scripts/first-town-payload.mjs'],{})]:
 start=time.monotonic()
 with (out/(name+'.log')).open('w') as log:r=subprocess.run(cmd,env={**env,**extra},stdout=log,stderr=subprocess.STDOUT)
 rows.append(dict(name=name,command=cmd,env=extra,code=r.returncode,seconds=round(time.monotonic()-start,3)))
 (out/'build-gates.json').write_text(json.dumps(rows,indent=2)+'\n')
 print(name,r.returncode,flush=True)
raise SystemExit(any(r['code'] for r in rows))
