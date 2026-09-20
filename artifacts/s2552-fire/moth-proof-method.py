import hashlib, json, os, subprocess, time
from pathlib import Path
root=Path('/private/tmp/gr-gate-s2552')
out=Path('/Users/robin/Claude/Projects/Gold Rush/artifacts/s2552-fire')
retained=root/'artifacts/e3-moth-season/ride-e3-moth-season-01.json'
scratch=root/'test-results/evidence/e3-moth-season/ride-e3-moth-season-01.json'
def state(p):
 return {'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'mtimeNs':p.stat().st_mtime_ns}
env=os.environ.copy();env['PATH']='/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin';env.pop('GR_REFRESH_EVIDENCE',None)
rows=[];before=state(retained)
for name,refresh,args in [('default-before',False,[]),('refresh',True,['--test-name-pattern=^the corridor circuit']),('default-after',False,[])]:
 current=env.copy()
 if refresh:current['GR_REFRESH_EVIDENCE']='1'
 previous=state(retained);started=time.monotonic()
 result=subprocess.run(['/opt/homebrew/bin/node','--test',*args,'scripts/moth-season-pressure.test.mjs'],cwd=root,env=current,text=True,capture_output=True)
 (out/('moth-'+name+'.txt')).write_text(result.stdout+result.stderr)
 after=state(retained)
 row={'stage':name,'rc':result.returncode,'seconds':round(time.monotonic()-started,3),'before':previous,'after':after};rows.append(row)
 (out/'moth-proof.json').write_text(json.dumps(rows,indent=2)+'\n')
 print(name,result.returncode,row['seconds'],flush=True)
 assert result.returncode==0,'see preserved Moth transcript'
 assert after['sha256']==before['sha256'],'current retained recording unexpectedly changed'
 if refresh: assert after['mtimeNs']>previous['mtimeNs'],'explicit refresh did not write'
 else:
  assert after==previous,'default run touched retained bytes or mtime'
  assert scratch.exists() and state(scratch)['sha256']==before['sha256'],'default scratch output missing or differs'
j=json.loads(retained.read_text());assert len(j['trace'])==138;assert j['outcome']['eventLogHash']=='fnv1a32:f7af6739'
print('current 138-row recording preserved; explicit write proved; both plain runs wrote identical scratch bytes',flush=True)
