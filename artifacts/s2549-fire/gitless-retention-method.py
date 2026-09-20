import subprocess,json,time
from pathlib import Path
tree=Path('/private/tmp/heat11-5e7a7c0b');rows=[];deferred=[]
assert tree.exists() and not (tree/'.git').exists()
for rel in ['artifacts','reviews','tasks/runs','logs/runs-archive']:
 directory=tree/rel
 for p in directory.rglob('*'):
  if not p.is_file():continue
  st=p.stat();rows.append({'tree':str(tree),'path':str(p.relative_to(tree)),'bytes':st.st_size,'mtime':st.st_mtime,'absolute':str(p)})
assert rows, 'empty gitless evidence control'
print('gitless corpus',len(rows),'files',sum(r['bytes'] for r in rows),'bytes',flush=True)
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
Path('artifacts/s2549-fire/gitless-retention-blobs.json').write_text(json.dumps(out,indent=2)+'\n')
print('Retention',len(rows),'hashes; remote objects',len(known),'counts',counts,'deferred',len(deferred))
for r in exceptions:print(r['verdict'],r['tree'],r['path'],r['bytes'])
