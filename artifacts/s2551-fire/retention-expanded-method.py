import subprocess,json,time
from pathlib import Path
j=json.loads(Path('artifacts/s2551-fire/worktree-retention.json').read_text()); rows=[]; deferred=[]
for t in j['trees']:
 live = t['tree'] != str(Path.cwd()) and any(f['ageSeconds'] < 900 for f in t.get('evidenceCandidates', []))
 for f in t.get('evidenceCandidates',[]):
  p=Path(t['tree'])/f['path']
  if f['path'].startswith('artifacts/s2551-fire/') or live or t['tree']=='/private/tmp/gr-gate-s2551':
   deferred.append({'tree':t['tree'],**f}); continue
  if p.exists(): rows.append({'tree':t['tree'],**f,'absolute':str(p)})
paths=''.join(json.dumps(r['absolute'],ensure_ascii=False)+'\n' for r in rows)
hashes=subprocess.check_output(['git','hash-object','--stdin-paths'],input=paths,text=True).splitlines(); assert len(hashes)==len(rows)
check=subprocess.check_output(['git','cat-file','--batch-check'],input='\n'.join(hashes)+'\n',text=True).splitlines(); assert len(check)==len(rows)
remote=subprocess.check_output(['git','rev-list','--objects','--remotes'],text=True)
assert len(remote)>1000,'empty remote control'
known={line.split(' ',1)[0] for line in remote.splitlines()}; counts={}; exceptions=[]
for r,h,c in zip(rows,hashes,check):
 verdict='REMOTE-SAFE' if h in known else 'AT-RISK' if c.endswith(' missing') else 'LOCAL-ONLY'
 counts[verdict]=counts.get(verdict,0)+1
 if verdict!='REMOTE-SAFE': exceptions.append({**r,'blob':h,'verdict':verdict})
out={'time':time.strftime('%Y-%m-%dT%H:%M:%S%z'),'files':len(rows),'hashes':len(hashes),'remoteObjects':len(known),'counts':counts,'exceptions':exceptions,'deferred':deferred}
Path('artifacts/s2551-fire/retention-blobs-expanded.json').write_text(json.dumps(out,indent=2)+'\n')
print('Retention',len(rows),'hashes; remote objects',len(known),'counts',counts,'deferred',len(deferred))
for r in exceptions:print(r['verdict'],r['tree'],r['path'],r['bytes'])
