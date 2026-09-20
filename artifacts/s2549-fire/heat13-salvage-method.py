from pathlib import Path
import subprocess,json,os,tempfile,hashlib,time
root=Path.cwd();out=root/'artifacts/s2549-fire';arena=Path('/private/tmp/heat13-569a41f9');branch='save/heat13-finished-evidence-s2549';ref='refs/heads/'+branch
j=json.loads((out/'retention-blobs.json').read_text());rows=[r for r in j['exceptions'] if r['tree']==str(arena)]
assert len(rows)==562 and sum(r['bytes'] for r in rows)==88986172
scan=json.loads((out/'heat13-secret-shape-scan.json').read_text());assert scan['files']==len(rows) and scan['hits']==[]
def git(args,**kw):return subprocess.check_output(['git',*args],**kw)
assert subprocess.run(['git','show-ref','--verify','--quiet',ref]).returncode==1
before={str(p):git(['status','--porcelain','-uall'],cwd=p) for p in [root,arena]}
head=git(['rev-parse','HEAD']);index_before=git(['diff','--cached','--binary'])
for r in rows:
 p=Path(r['absolute']);s=p.stat();assert s.st_size==r['bytes'] and s.st_mtime==r['mtime'];assert time.time()-s.st_mtime>900
paths=''.join(json.dumps(r['absolute'])+'\n' for r in rows)
hashes=git(['hash-object','-w','--stdin-paths'],input=paths,text=True).splitlines();assert hashes==[r['blob'] for r in rows]
fd,index=tempfile.mkstemp(prefix='s2549-heat13-index-');os.close(fd);os.unlink(index)
env={**os.environ,'GIT_INDEX_FILE':index}
try:
 git(['read-tree','--empty'],env=env)
 records=b''.join((f"{'100755' if Path(r['absolute']).stat().st_mode & 0o111 else '100644'} {h}\t{r['path']}\0").encode() for r,h in zip(rows,hashes))
 git(['update-index','-z','--index-info'],input=records,env=env)
 tree=git(['write-tree'],env=env).decode().strip()
 message='s2549: preserve finished heat 13 evidence without changing its arena\n\n562 quiet untracked paths, 88,986,172 bytes, no parent and no main merge. Queue2 ended 2026-09-07T16:48:52Z; no heat process found. 159 blobs were absent, 403 local-only. Blob identity and mtime verified before capture; credential-shape scan found no matches.\n'
 commit=git(['commit-tree',tree],input=message,text=True).strip()
 git(['update-ref',ref,commit,'0'*40])
finally:
 if Path(index).exists():Path(index).unlink()
after={str(p):git(['status','--porcelain','-uall'],cwd=p) for p in [root,arena]}
assert before==after,'working-tree status changed during capture'
assert git(['rev-parse','HEAD'])==head and git(['diff','--cached','--binary'])==index_before
assert len(git(['ls-tree','-r','--name-only',commit],text=True).splitlines())==len(rows)
assert len(git(['rev-list','--parents','-n','1',commit],text=True).split())==1
record={'branch':branch,'commit':commit,'parentless':True,'files':len(rows),'bytes':sum(r['bytes'] for r in rows),'statusCountsBefore':{k:len(v.splitlines()) for k,v in before.items()},'statusCountsAfter':{k:len(v.splitlines()) for k,v in after.items()},'mainAndArenaStatusIdentical':True,'mainHeadAndIndexIdentical':True,'push':'pending'}
(out/'heat13-salvage.json').write_text(json.dumps(record,indent=2)+'\n');print(json.dumps(record))
