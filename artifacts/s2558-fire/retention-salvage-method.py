import hashlib,json,os,subprocess,tempfile,time
from pathlib import Path
root=Path.cwd();out=root/'artifacts/s2558-fire';source=Path('/Users/robin/.codex/worktrees/b9fe/Gold Rush');ref='refs/heads/save/code-review-evidence-s2558'
inv=json.loads((out/'retention-review-inventory.json').read_text());rows=inv['files'];excluded=inv['excluded']
assert len(rows)==278 and sum(r['bytes'] for r in rows)==1317128263
assert len(excluded)==84 and not inv['highPrecisionFindings'] and not inv['nonLoopbackSensitiveHeaders']
assert not (out/'retention-salvage.json').exists()
env={**os.environ,'GIT_OPTIONAL_LOCKS':'0'}
def git(args,*,cwd=root,input=None,index=None,check=True):
 e={**env,**({'GIT_INDEX_FILE':str(index)} if index else {})}
 return subprocess.run(['git',*args],cwd=cwd,input=input,env=e,capture_output=True,check=check,timeout=240)
def text(args,**opts):return git(args,**opts).stdout.decode().strip()
assert git(['show-ref','--verify','--quiet',ref],check=False).returncode==1
remote=git(['ls-remote','--exit-code','origin',ref],check=False);assert remote.returncode==2 and not remote.stdout
source_head=text(['rev-parse','HEAD'],cwd=source);source_branch=text(['branch','--show-current'],cwd=source)
assert source_head=='d41ab98ce0d7fbc48bb01e8e87c92c61f148de2d' and source_branch=='sol/code-review-20260908'
newest=0;stat_files=0
for directory,dirs,files in os.walk(source,followlinks=False):
 dirs[:]=[d for d in dirs if d!='.git']
 for name in files:
  st=(Path(directory)/name).stat();newest=max(newest,st.st_mtime);stat_files+=1
assert stat_files>1000 and time.time()-newest>=900, 'foreign tree has recent writes; defer'
for r in rows:
 p=source/r['path'];st=p.stat();assert not p.is_symlink() and st.st_size==r['bytes'] and st.st_mtime==r['mtime'], 'source changed'
paths=''.join(json.dumps(str(source/r['path']))+'\n' for r in rows).encode()
assert text(['hash-object','--stdin-paths'],input=paths).splitlines()==[r['blob'] for r in rows]
main_head=text(['rev-parse','main']);main_before=git(['status','--porcelain=v1','-uall','-z']).stdout;source_before=git(['status','--porcelain=v1','-uall','-z'],cwd=source).stdout
manifest={'sourceTree':str(source),'sourceCommit':source_head,'sourceBranch':source_branch,'purpose':'Parentless retention of quiet code-review proof/report artifacts, no implementation adoption or merge authorization. Copied Miniflare runtime state excluded.','files':[],'excluded':[{'path':r['path'],'bytes':r['bytes'],'gitBlob':r['blob'],'reason':r['retentionDecision']} for r in excluded]}
entries=[];chunk_bytes=40*1024*1024;split=0
with tempfile.TemporaryDirectory(prefix='s2558-retention-index-') as scratch:
 index=Path(scratch)/'index';git(['read-tree','--empty'],index=index)
 for r in rows:
  data=(source/r['path']).read_bytes();sha=hashlib.sha256(data).hexdigest();blob=hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
  assert sha==r['sha256'] and blob==r['blob'] and len(data)==r['bytes'], 'source bytes changed'
  f={'path':r['path'],'mode':r['mode'],'gitBlob':blob,'bytes':len(data),'sha256':sha}
  if len(data)<=100_000_000:
   entries.append((r['mode'],blob,r['path']));f['storedAs']=r['path']
  else:
   split+=1;f['parts']=[];restore_sha=hashlib.sha256();restore_blob=hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0');restored_bytes=0
   for n,start in enumerate(range(0,len(data),chunk_bytes)):
    part=data[start:start+chunk_bytes];partpath=f"{r['path']}.parts/part-{n:03d}";part_oid=text(['hash-object','-w','--stdin'],input=part)
    entries.append((r['mode'],part_oid,partpath));f['parts'].append({'path':partpath,'bytes':len(part),'sha256':hashlib.sha256(part).hexdigest(),'gitBlob':part_oid})
    stored=git(['cat-file','blob',part_oid]).stdout;restore_sha.update(stored);restore_blob.update(stored);restored_bytes+=len(stored)
   assert restore_sha.hexdigest()==sha and restore_blob.hexdigest()==blob and restored_bytes==len(data)
  manifest['files'].append(f)
 assert split==4 and sum(len(f.get('parts',[])) for f in manifest['files'])==18
 payload=json.dumps(manifest,indent=2)+'\n';manifest_oid=text(['hash-object','-w','--stdin'],input=payload.encode());entries.append(('100644',manifest_oid,'BACKUP-MANIFEST.json'))
 readme=('Parentless code-review evidence retention; not a merge candidate. BACKUP-MANIFEST.json records original source paths, modes, sizes, SHA-256 and Git blob IDs. Four originals over 100 MB are stored as ordered 40 MiB parts. Concatenate parts in order in separate scratch and verify size, SHA-256 and Git blob ID. All new split files were streamed from stored git blobs and checked before this ref was created. 84 copied Miniflare runtime-state files are excluded as disposable tool scratch. Source and main checkout/index were not changed.\n')
 readme_oid=text(['hash-object','-w','--stdin'],input=readme.encode());entries.append(('100644',readme_oid,'BACKUP-README.md'))
 wire=b''.join(f'{mode} {oid}\t{name}\0'.encode() for mode,oid,name in entries);git(['update-index','-z','--index-info'],input=wire,index=index)
 saved_tree=text(['write-tree'],index=index);assert len(git(['ls-tree','-r','-z',saved_tree]).stdout.split(b'\0')[:-1])==len(entries)
 commit=text(['commit-tree',saved_tree,'-F','-'],input=('s2558: retain quiet code-review proof with four reconstructible trace streams\n\nRetention only; no implementation adoption or merge authorization. Parentless snapshot.\nSource '+str(source)+'\nSource branch '+source_branch+'\nSource HEAD '+source_head+'\n278 original proof/report files, 1,317,128,263 bytes; 84 runtime-state exclusions.\n').encode())
 assert text(['rev-list','--parents','-n','1',commit])==commit
 assert text(['rev-parse','main'])==main_head
 assert git(['status','--porcelain=v1','-uall','-z']).stdout==main_before, 'main concurrently changed before ref creation'
 assert git(['status','--porcelain=v1','-uall','-z'],cwd=source).stdout==source_before, 'source concurrently changed before ref creation'
 assert text(['hash-object','--stdin-paths'],input=paths).splitlines()==[r['blob'] for r in rows]
 git(['update-ref',ref,commit,'0'*40])
main_after=git(['status','--porcelain=v1','-uall','-z']).stdout;source_after=git(['status','--porcelain=v1','-uall','-z'],cwd=source).stdout
assert main_before==main_after and source_before==source_after and text(['rev-parse','main'])==main_head
receipt={'time':time.strftime('%Y-%m-%dT%H:%M:%S%z'),'ref':ref,'commit':commit,'tree':saved_tree,'parentCount':0,'sourceTree':str(source),'sourceHead':source_head,'sourceBranch':source_branch,'sourceNewestMtime':newest,'sourceQuietSeconds':round(time.time()-newest,1),'sourceFullTreeFilesStatted':stat_files,'files':len(rows),'bytes':sum(r['bytes'] for r in rows),'storedFiles':len(entries),'splitFiles':split,'parts':18,'excludedFiles':len(excluded),'excludedBytes':sum(r['bytes'] for r in excluded),'mainHeadBefore':main_head,'mainHeadAfter':text(['rev-parse','main']),'mainStatusIdentical':main_before==main_after,'sourceStatusIdentical':source_before==source_after,'mainStatusBefore':main_before.decode().split('\0')[:-1],'mainStatusAfter':main_after.decode().split('\0')[:-1],'sourceStatusBefore':source_before.decode().split('\0')[:-1],'sourceStatusAfter':source_after.decode().split('\0')[:-1],'splitVerification':'All four reconstructed in-memory by streaming stored git part blobs; original SHA-256, git blob ID, and bytes exact.','pushed':False}
(out/'retention-backup-manifest.json').write_text(payload);(out/'retention-salvage.json').write_text(json.dumps(receipt,indent=2)+'\n')
print('Retained',len(rows),'proof files,',receipt['bytes'],'bytes;',ref,commit,'parentless;',len(excluded),'runtime scratch exclusions; main/source untouched; NOT PUSHED',flush=True)
