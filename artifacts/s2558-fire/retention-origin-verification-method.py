import hashlib,json,os,subprocess,time,zipfile
from pathlib import Path
root=Path.cwd();out=root/'artifacts/s2558-fire';source=Path('/Users/robin/.codex/worktrees/b9fe/Gold Rush');ref='refs/heads/save/code-review-evidence-s2558-sanitized';expected='4ca5559a7204d637142ec0c49dfb1fb8164a84d4';unsafe='refs/heads/save/code-review-evidence-s2558'
env={**os.environ,'GIT_OPTIONAL_LOCKS':'0'}
def git(args,check=True):return subprocess.run(['git',*args],cwd=root,env=env,capture_output=True,check=check,timeout=240)
def text(args):return git(args).stdout.decode().strip()
remote=text(['ls-remote','--exit-code','origin',ref]);assert remote.split()==[expected,ref]
absent=git(['ls-remote','--exit-code','origin',unsafe],check=False);assert absent.returncode==2 and not absent.stdout
assert git(['show-ref','--verify','--quiet',unsafe],check=False).returncode==1
assert text(['rev-parse',ref])==expected and text(['rev-list','--parents','-n','1',expected])==expected
manifest_data=(out/'retention-sanitized-backup-manifest.json').read_bytes();assert git(['show',expected+':BACKUP-MANIFEST.json']).stdout==manifest_data
manifest=json.loads(manifest_data);origin_objects={x.split(' ',1)[0] for x in text(['rev-list','--objects','--remotes=origin']).splitlines()}
assert expected in origin_objects
raw_safe=[];raw_local=[]
inv=json.loads((out/'retention-review-inventory.json').read_text())
for r in inv['files']+inv['excluded']:
 (raw_safe if r['blob'] in origin_objects else raw_local).append(r['path'])
assert len(raw_safe)==262 and len(raw_local)==100
oversized=[f for f in manifest['files'] if 'parts' in f];redacted=[f for f in manifest['files'] if f['retention']=='SANITIZED-DERIVATIVE']
assert len(oversized)==4 and len(redacted)==12
for f in manifest['files']:
 if 'storedAs' in f:assert f['gitBlob'] in origin_objects
 else:
  for part in f['parts']:assert part['gitBlob'] in origin_objects
ledger_blob=text(['rev-parse','refs/remotes/origin/main:artifacts/ledger-backups/ledger-2026-09-08.db']);assert ledger_blob=='f575e82a115d1989bb95631d93d8c67e3d7523e3' and ledger_blob in origin_objects
receipt={'time':time.strftime('%Y-%m-%dT%H:%M:%S%z'),'ref':ref,'expectedCommit':expected,'liveOriginTip':remote,'parentCount':0,'manifestMatchesStoredSnapshot':True,'retainedFiles':278,'byteExactSourceFiles':266,'sanitizedDerivatives':12,'retainedPayloadBytes':sum(f['bytes'] for f in manifest['files']),'splitFiles':4,'parts':18,'allRetainedObjectsReachableFromOrigin':True,'b9feInitialLocalOnlyFiles':362,'b9feOriginalBlobsNowRemoteSafe':262,'b9feOriginalBlobsStillLocalOnly':100,'stillLocalOnlyClasses':{'excludedRuntimeScratch':84,'credentialBearingOriginalsWithSanitizedDerivatives':12,'verifiedChunkBackedOriginals':4},'unsafeRefAbsentLocally':True,'unsafeRefAbsentFromOrigin':True,'ledgerBackupDischargedBy':'d9b598a8a278923a0f9de021ecaa39c84c4f0f2b','ledgerBackupBlobOnOriginMain':ledger_blob,'publicationScope':'Only the parentless sanitized save ref; original credential-bearing trace blobs and copied runtime state were excluded. No historical owner-held stream was pushed.'}
(out/'retention-origin-verification.json').write_text(json.dumps(receipt,indent=2)+'\n')
# Final, post-report privacy scan: no credentials are read into shell arguments or receipts.
headers=json.loads((out/'retention-header-check.json').read_text());tokens=set()
for h in headers['records']:
 with zipfile.ZipFile(source/h['path']) as z:record=json.loads(z.read(h['member']).splitlines()[h['eventLine']-1])
 vals=[x['value'] for x in record['snapshot']['request']['headers'] if x['name'].lower()==h['header'].lower()]
 assert len(vals)==1 and hashlib.sha256(vals[0].encode()).hexdigest()==h['valueSha256'] and vals[0].lower().startswith('bearer ');tokens.add(vals[0][7:].encode())
assert len(tokens)==16
count=0;total=0
for p in out.rglob('*'):
 if p.is_file():
  b=p.read_bytes();count+=1;total+=len(b);assert not any(v in b for v in tokens),'credential in main artifact'
(out/'retention-final-credential-scan.json').write_text(json.dumps({'time':time.strftime('%Y-%m-%dT%H:%M:%S%z'),'knownTokenValues':16,'filesScanned':count,'bytesScanned':total,'matches':0,'scope':'Every regular file under artifacts/s2558-fire after report, origin receipt and all salvage/privacy receipts were written. Exact credential values remained only in process memory. The new scan receipt carries no values.'},indent=2)+'\n')
print(json.dumps(receipt),flush=True)
