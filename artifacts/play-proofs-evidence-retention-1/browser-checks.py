import subprocess as sp, os, json, time, urllib.request, sys
out='artifacts/play-proofs-evidence-retention-1/'
env=os.environ.copy(); env.pop('GR_NATIVE_PROOF',None); env.update(GR_CAPTURE_EXTERNAL_SERVER='1',GR_CAPTURE_BASE_URL='http://127.0.0.1:5303')
with open(out+'vite.log','a') as log:
 server=sp.Popen(['node','node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5303','--strictPort'],stdout=log,stderr=sp.STDOUT,env=env)
 try:
  for _ in range(60):
   if server.poll() is not None: raise RuntimeError('own Vite exited')
   try:
    urllib.request.urlopen('http://127.0.0.1:5303/@vite/client'); break
   except Exception: time.sleep(1)
  jobs=[['warm plain boots','node',out+'boot.mjs']]
  specs=['e2e/native-proofs/'+s+'.spec.ts' for s in ['e1-drill-yard','e1-dry-gulch','e1-night-shift','e2-hill-mine','e2-trestle','e3-moth-season']]
  jobs.append(['unset native specs','npx','playwright','test',*specs,'--project=desktop-chrome','--project=mobile-chrome','--trace=off','--output='+out+'unset-results'])
  for project in ['desktop-chrome','mobile-chrome']:
   jobs.append([project+' adjacent','npx','playwright','test','e2e/task-025-bandits-dont-swim.spec.ts','e2e/m1-01-claim-jumpers-death.spec.ts','e2e/m2-01-build-menu.spec.ts','--project='+project,'--trace=off','--output='+out+project+'-results'])
  jobs.append(['measured plain boots','node',out+'boot.mjs'])
  if '--boots-only' in sys.argv: jobs=[['corrected plain boots','node',out+'boot.mjs']]
  raise SystemExit(sp.call(['node','scripts/gate-battery.mjs','--transcript',out+'browser-battery.log',json.dumps(jobs)],env=env))
 finally:
  server.terminate(); server.wait(timeout=20)
