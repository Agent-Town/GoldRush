from pathlib import Path
import subprocess,os,json,time,sys
root=Path('artifacts/sol/map-art-campaign-2'); phase=sys.argv[1]; out=root/'run-2'; raw=root/'_raw/run-2'
env={**os.environ,'PATH':'/opt/homebrew/bin:'+os.environ['PATH'],'GR_CAPTURE_EXTERNAL_SERVER':'1','GR_CAPTURE_BASE_URL':'http://127.0.0.1:5303','GR_GUARD_NO_ARTIFACT':'1'}
pw=['npx','playwright','test','--workers=1','--project=desktop-chrome','--project=mobile-chrome','--trace=off','--reporter=line','--output='+str(raw/phase)]
checks={
 'build': [('tsc',['npx','tsc','--noEmit']),('build',['npm','run','build']),('full-build',['npm','run','build'])],
 'e5': [('sea-and-river',pw+['e2e/e5-sea-contact.spec.ts','e2e/w1-02-living-water.spec.ts']),('e5-own',pw+['e2e/e5-deepwater-claim.spec.ts','e2e/e5-regatta-race.spec.ts','e2e/e5-stillwater-noise.spec.ts','e2e/e5-flotilla-hulls.spec.ts'])],
 'final-render': [('final-sea-river-deepwater',pw+['e2e/e5-sea-contact.spec.ts','e2e/w1-02-living-water.spec.ts','e2e/e5-deepwater-claim.spec.ts']),('final-plain-others',pw+['e2e/e5-regatta-race.spec.ts','e2e/e5-stillwater-noise.spec.ts','e2e/e5-flotilla-hulls.spec.ts','--grep','plain boot'])],
 'collision': [('landmark-collision',pw+['e2e/landmark-collision.spec.ts','e2e/fort-landmark-collision.spec.ts'])],
 'guards': [('water-and-assets',['node','--test','--test-concurrency=1','scripts/open-sea-water.test.mjs','scripts/claim-boat-asset.test.mjs','scripts/claim-boat-view.test.mjs']),('named-guards',['node','scripts/run-guards.mjs','--only','test:task-guards,test:citations,test:gate-callers'])],
}
rows=[]
for name,cmd in checks[phase]:
 started=time.time(); log=raw/(name+'.log'); e={**env}
 if name=='full-build': e['GR_RELEASE']='full'
 print('START',name,flush=True)
 with log.open('w') as f:
  try: rc=subprocess.run(cmd,env=e,stdout=f,stderr=subprocess.STDOUT,timeout=900).returncode
  except subprocess.TimeoutExpired: rc='timeout'
 rows.append({'name':name,'command':cmd,'exit':rc,'seconds':round(time.time()-started,2),'log':str(log),'release':e.get('GR_RELEASE')})
 (out/(phase+'-gates.json')).write_text(json.dumps(rows,indent=2)+'\n');print('END',name,rc,flush=True)
