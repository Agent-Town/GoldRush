import hashlib,io,json,os,subprocess,tempfile,time,zipfile
from pathlib import Path
root=Path.cwd();out=root/'artifacts/s2558-fire';source=Path('/Users/robin/.codex/worktrees/b9fe/Gold Rush')
ref='refs/heads/save/code-review-evidence-s2558-sanitized';unsafe_ref='refs/heads/save/code-review-evidence-s2558';unsafe_commit='b27b978217b24ae429a31f554868546d5ebf4a9e'
inv=json.loads((out/'retention-review-inventory.json').read_text());rows=inv['files'];excluded=inv['excluded'];headers=json.loads((out/'retention-header-check.json').read_text())
assert len(rows)==278 and len(excluded)==84 and headers['unresolved']==36
env={**os.environ,'GIT_OPTIONAL_LOCKS':'0'}
def git(args,*,cwd=root,input=None,index=None,check=True):
 return subprocess.run(['git',*args],cwd=cwd,input=input,env={**env,**({'GIT_INDEX_FILE':str(index)} if index else {})},capture_output=True,check=check,timeout=240)
def text(args,**kw):return git(args,**kw).stdout.decode().strip()
def sha(data):return hashlib.sha256(data).hexdigest()
def blob(data):return hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
def absent_origin(name):
 p=git(['ls-remote','--exit-code','origin',name],check=False);assert p.returncode==2 and not p.stdout;return True
assert git(['show-ref','--verify','--quiet',ref],check=False).returncode==1
absent_origin(ref);absent_origin(unsafe_ref);assert text(['rev-parse',unsafe_ref])==unsafe_commit
# Credentials exist only in process memory. Receipts carry digests, never values.
values=set()
for h in headers['records']:
 with zipfile.ZipFile(source/h['path']) as z:
  record=json.loads(z.read(h['member']).splitlines()[h['eventLine']-1]);matches=[x['value'] for x in record['snapshot']['request']['headers'] if x['name'].lower()==h['header'].lower()]
 assert len(matches)==1 and sha(matches[0].encode())==h['valueSha256']
 value=matches[0];assert value.lower().startswith('bearer ');values.add(value[7:].encode())
assert len(values)==16 and all(len(v)==64 for v in values)
needles=sorted(values,key=sha);replacements={v:('[REDACTED-LOCAL-TEST-CREDENTIAL-%02d]'%(i+1)).encode() for i,v in enumerate(needles)}
def scan(data):return sum(data.count(v) for v in needles)
def redact(data):
 records=[]
 for v in needles:
  n=data.count(v)
  if n:records.append({'valueSha256':sha(v),'replacements':n,'placeholder':replacements[v].decode()});data=data.replace(v,replacements[v])
 assert scan(data)==0;return data,records
main_head=text(['rev-parse','main']);source_head=text(['rev-parse','HEAD'],cwd=source);source_branch=text(['branch','--show-current'],cwd=source)
assert source_head=='d41ab98ce0d7fbc48bb01e8e87c92c61f148de2d' and source_branch=='sol/code-review-20260908'
newest=0;statted=0
for directory,dirs,files in os.walk(source,followlinks=False):
 dirs[:]=[d for d in dirs if d!='.git']
 for name in files:
  st=(Path(directory)/name).stat();newest=max(newest,st.st_mtime);statted+=1
assert time.time()-newest>=900 and statted>1000
source_paths=''.join(json.dumps(str(source/r['path']))+'\n' for r in rows).encode()
assert text(['hash-object','--stdin-paths'],input=source_paths).splitlines()==[r['blob'] for r in rows]
main_before=git(['status','--porcelain=v1','-uall','-z']).stdout;source_before=git(['status','--porcelain=v1','-uall','-z'],cwd=source).stdout
main_index=Path(text(['rev-parse','--git-path','index']));main_index=main_index if main_index.is_absolute() else root/main_index;index_before=sha(main_index.read_bytes())
manifest={'sourceTree':str(source),'sourceCommit':source_head,'sourceBranch':source_branch,'purpose':'Parentless evidence retention, never a merge candidate. Twelve account trace originals contain unknown local test credentials and are retained ONLY as sanitized derivatives. Originals and scratch remain untouched locally.','redactionPolicy':'Replace all 16 exact unknown 64-character Bearer credential values wherever found in selected file bytes and every uncompressed ZIP member. Preserve original hashes as provenance only. No original credential bytes may be pushed.','files':[],'excluded':[{'path':r['path'],'bytes':r['bytes'],'gitBlob':r['blob'],'reason':r['retentionDecision']} for r in excluded]}
entries=[];changed=[];scanned_zip_members=0;scanned_uncompressed=0;split=0
with tempfile.TemporaryDirectory(prefix='s2558-retention-safe-') as scratch:
 index=Path(scratch)/'index';git(['read-tree','--empty'],index=index)
 for r in rows:
  original=(source/r['path']).read_bytes();assert len(original)==r['bytes'] and sha(original)==r['sha256'] and blob(original)==r['blob']
  member_changes=[];data=original
  if r['path'].endswith('.zip'):
   with zipfile.ZipFile(io.BytesIO(original)) as z:
    members=[]
    for info in z.infolist():
     b=z.read(info);scanned_zip_members+=1;scanned_uncompressed+=len(b);clean,recs=redact(b)
     if recs:member_changes.append({'member':info.filename,'originalBytes':len(b),'originalSha256':sha(b),'sanitizedBytes':len(clean),'sanitizedSha256':sha(clean),'redactions':recs})
     members.append((info,clean))
    if member_changes:
     buf=io.BytesIO()
     with zipfile.ZipFile(buf,'w') as target:
      target.comment=z.comment
      for info,clean in members:target.writestr(info,clean)
     data=buf.getvalue()
  else:
   scanned_uncompressed+=len(data);data,recs=redact(data)
   if recs:member_changes.append({'member':None,'redactions':recs})
  assert scan(data)==0, 'known credential remains in raw stored bytes'
  if r['path'].endswith('.zip'):
   with zipfile.ZipFile(io.BytesIO(data)) as z:
    for info in z.infolist():assert scan(z.read(info))==0, 'credential remains in ZIP member'
  f={'path':r['path'],'mode':r['mode'],'originalGitBlob':r['blob'],'originalBytes':r['bytes'],'originalSha256':r['sha256'],'gitBlob':blob(data),'bytes':len(data),'sha256':sha(data),'retention':'SANITIZED-DERIVATIVE' if member_changes else 'BYTE-EXACT'}
  if member_changes:f['memberRedactions']=member_changes;changed.append(r['path'])
  if len(data)<=100_000_000:
   oid=text(['hash-object','-w','--stdin'],input=data);assert oid==f['gitBlob'];entries.append((r['mode'],oid,r['path']));f['storedAs']=r['path']
  else:
   assert not member_changes, 'oversized redaction needs explicit review';split+=1;f['parts']=[];restored_sha=hashlib.sha256();restored_blob=hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0');size=0
   for n,start in enumerate(range(0,len(data),40*1024*1024)):
    part=data[start:start+40*1024*1024];oid=text(['hash-object','-w','--stdin'],input=part);name=f"{r['path']}.parts/part-{n:03d}";entries.append((r['mode'],oid,name));f['parts'].append({'path':name,'bytes':len(part),'sha256':sha(part),'gitBlob':oid})
    stored=git(['cat-file','blob',oid]).stdout;assert scan(stored)==0;restored_sha.update(stored);restored_blob.update(stored);size+=len(stored)
   assert restored_sha.hexdigest()==r['sha256'] and restored_blob.hexdigest()==r['blob'] and size==r['bytes']
  manifest['files'].append(f)
  print('checked',len(manifest['files']),'of',len(rows),flush=True) if len(manifest['files'])%40==0 else None
 assert len(changed)==12 and split==4 and sum(len(f.get('parts',[])) for f in manifest['files'])==18
 payload=json.dumps(manifest,indent=2)+'\n';assert scan(payload.encode())==0
 manifest_oid=text(['hash-object','-w','--stdin'],input=payload.encode());entries.append(('100644',manifest_oid,'BACKUP-MANIFEST.json'))
 readme=b'Parentless evidence snapshot, not a merge candidate. 278 source proofs: 266 byte-exact, 12 sanitized trace derivatives. All 16 unknown local test Bearer values were replaced throughout every affected ZIP member; original path, size, SHA-256 and Git blob IDs remain provenance in BACKUP-MANIFEST.json. Original traces stay local and are not safe for publication. Four unchanged originals over 100 MB are ordered 40 MiB parts; concatenate and verify original size/SHA-256/Git blob ID. 84 copied Miniflare runtime-state files excluded. No source checkout, main HEAD or main index changes.\n'
 entries.append(('100644',text(['hash-object','-w','--stdin'],input=readme),'BACKUP-README.md'))
 wire=b''.join(f'{mode} {oid}\t{name}\0'.encode() for mode,oid,name in entries);git(['update-index','-z','--index-info'],input=wire,index=index)
 tree=text(['write-tree'],index=index);assert len(git(['ls-tree','-r','-z',tree]).stdout.split(b'\0')[:-1])==len(entries)
 # Re-read every final tree entry from the object database before publication.
 stored_bytes=0;final_zip_members=0
 for mode,oid,name in entries:
  data=git(['cat-file','blob',oid]).stdout;stored_bytes+=len(data);assert scan(data)==0
  if name.endswith('.zip'):
   with zipfile.ZipFile(io.BytesIO(data)) as z:
    for info in z.infolist():assert scan(z.read(info))==0;final_zip_members+=1
 commit=text(['commit-tree',tree,'-F','-'],input=b's2558: retain sanitized code-review proof and reconstructible trace parts\n\nParentless retention only; no implementation adoption. 266 byte-exact proofs and 12 sanitized trace derivatives. 84 copied runtime-state exclusions.\n')
 assert text(['rev-list','--parents','-n','1',commit])==commit
 assert text(['rev-parse','main'])==main_head and sha(main_index.read_bytes())==index_before
 assert git(['status','--porcelain=v1','-uall','-z']).stdout==main_before
 assert git(['status','--porcelain=v1','-uall','-z'],cwd=source).stdout==source_before
 assert text(['hash-object','--stdin-paths'],input=source_paths).splitlines()==[r['blob'] for r in rows]
 git(['update-ref',ref,commit,'0'*40])
 # Parent authorized deletion only of our new unpublished unsafe ref, with expected old SHA.
 absent_origin(unsafe_ref);git(['update-ref','-d',unsafe_ref,unsafe_commit]);assert git(['show-ref','--verify','--quiet',unsafe_ref],check=False).returncode==1
main_after=git(['status','--porcelain=v1','-uall','-z']).stdout;source_after=git(['status','--porcelain=v1','-uall','-z'],cwd=source).stdout
assert main_before==main_after and source_before==source_after and text(['rev-parse','main'])==main_head and sha(main_index.read_bytes())==index_before
receipt={'time':time.strftime('%Y-%m-%dT%H:%M:%S%z'),'ref':ref,'commit':commit,'tree':tree,'parentCount':0,'sourceTree':str(source),'sourceHead':source_head,'sourceNewestMtime':newest,'sourceQuietSeconds':round(time.time()-newest,1),'sourceFullTreeFilesStatted':statted,'originalFiles':278,'originalBytes':sum(r['bytes'] for r in rows),'byteExactFiles':266,'sanitizedDerivatives':12,'sanitizedPaths':changed,'unknownTokenValues':16,'authorizationHeaders':36,'zipMembersScanned':scanned_zip_members,'uncompressedBytesScanned':scanned_uncompressed,'storedFilesScanned':len(entries),'storedBytesScanned':stored_bytes,'finalStoredZipMembersScanned':final_zip_members,'knownCredentialMatchesInFinalSnapshot':0,'splitFiles':4,'parts':18,'splitVerification':'All four unchanged originals streamed from stored Git part blobs and matched original SHA-256, Git blob ID and byte count.','excludedRuntimeScratchFiles':84,'excludedRuntimeScratchBytes':sum(r['bytes'] for r in excluded),'withheldAndDeletedRef':unsafe_ref,'withheldCommit':unsafe_commit,'unsafeRefOriginAbsentBeforeDeletion':True,'deletionExpectedOldShaVerified':True,'deletionReason':'Unknown account-test Bearer values, never pushed; superseded by separately parentless sanitized snapshot. Original files/checkpoints untouched.','mainHeadBefore':main_head,'mainHeadAfter':text(['rev-parse','main']),'mainStatusIdentical':True,'sourceStatusIdentical':True,'mainIndexSha256Before':index_before,'mainIndexSha256After':sha(main_index.read_bytes()),'mainStatusBefore':main_before.decode().split('\0')[:-1],'mainStatusAfter':main_after.decode().split('\0')[:-1],'sourceStatusBefore':source_before.decode().split('\0')[:-1],'sourceStatusAfter':source_after.decode().split('\0')[:-1],'pushed':False}
(out/'retention-sanitized-backup-manifest.json').write_text(payload);(out/'retention-sanitized-salvage.json').write_text(json.dumps(receipt,indent=2)+'\n')
# Root will stage this artifact directory; inspect every file, including our receipts and methods.
artifact_files=0;artifact_bytes=0
for p in out.rglob('*'):
 if p.is_file():
  data=p.read_bytes();artifact_files+=1;artifact_bytes+=len(data);assert scan(data)==0,'credential in main artifact receipt'
(out/'retention-final-credential-scan.json').write_text(json.dumps({'time':time.strftime('%Y-%m-%dT%H:%M:%S%z'),'knownTokenValues':16,'filesScanned':artifact_files,'bytesScanned':artifact_bytes,'matches':0,'scope':'Every regular file under artifacts/s2558-fire, including all header receipts, source search receipts, methods and both original/sanitized manifests. Exact token values only in process memory; no literal values retained in receipts.'},indent=2)+'\n')
print(json.dumps({k:receipt[k] for k in ['ref','commit','byteExactFiles','sanitizedDerivatives','knownCredentialMatchesInFinalSnapshot','withheldAndDeletedRef','mainStatusIdentical','sourceStatusIdentical','pushed']}),flush=True)
