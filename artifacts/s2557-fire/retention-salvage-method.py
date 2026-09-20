import json, os, subprocess, tempfile, time
from pathlib import Path
root=Path.cwd(); source=Path('/Users/robin/.codex/worktrees/572c/Gold Rush')
branch='save/attended-worktree-evidence-s2557'; ref='refs/heads/'+branch
receipt=root/'artifacts/s2557-fire/retention-salvage.json'
assert not receipt.exists(), 'receipt exists'
env={**os.environ,'GIT_OPTIONAL_LOCKS':'0'}
def git(args, *, cwd=root, input=None, index=None, check=True):
 e={**env,**({'GIT_INDEX_FILE':str(index)} if index else {})}
 return subprocess.run(['git',*args],cwd=cwd,env=e,input=input,capture_output=True,check=check)
def text(args, **opts): return git(args,**opts).stdout.decode().strip()
rows=[r for r in json.loads((root/'artifacts/s2557-fire/retention-exception-comparison.json').read_text())['additionalExceptions'] if r['tree']==str(source)]
assert len(rows)==39 and sum(r['bytes'] for r in rows)==35391000
assert all(r['path'].startswith('artifacts/boss-art-fidelity-2026-09-08/') for r in rows)
assert git(['show-ref','--verify','--quiet',ref],check=False).returncode==1, 'ref exists or cannot verify'
remote=git(['ls-remote','--exit-code','origin',ref],check=False)
assert remote.returncode==2 and not remote.stdout, 'remote ref exists or cannot verify'
source_head=text(['rev-parse','HEAD'],cwd=source)
source_branch=text(['branch','--show-current'],cwd=source)
assert source_branch=='sol/boss-art-fidelity-review', 'source owner changed'
all_untracked=git(['ls-files','--others','--exclude-standard','-z'],cwd=source).stdout.split(b'\0')[:-1]
newest=max((source/n.decode()).stat().st_mtime for n in all_untracked if (source/n.decode()).is_file())
assert time.time()-newest>=900, 'foreign tree recently written; defer'
for r in rows:
 p=source/r['path']; s=p.stat()
 assert not p.is_symlink() and s.st_size==r['bytes'] and s.st_mtime==r['mtime'], 'source changed'
 r['mode']='100755' if s.st_mode & 0o111 else '100644'
paths=''.join(json.dumps(str(source/r['path']))+'\n' for r in rows).encode()
hashes=text(['hash-object','--stdin-paths'],input=paths).splitlines()
assert hashes==[r['blob'] for r in rows], 'source blob changed'
# Read-only secret-pattern check; never print matched content.
import re
secret=re.compile(rb'-----BEGIN [A-Z ]*PRIVATE KEY-----|(?:sk|rk)-[A-Za-z0-9_-]{30,}|AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{30,}')
assert not [r['path'] for r in rows if Path(r['path']).suffix not in ('.png','.webp') and secret.search((source/r['path']).read_bytes())], 'potential secret; stop before publishing'
main_before=git(['status','--porcelain=v1','-uall','-z']).stdout
source_before=git(['status','--porcelain=v1','-uall','-z'],cwd=source).stdout
main_head_before=text(['rev-parse','main'])
with tempfile.TemporaryDirectory(prefix='s2557-retention-index-') as scratch:
 index=Path(scratch)/'index'
 git(['read-tree','--empty'],index=index)
 entries=b''.join((r['mode']+' '+r['blob']+'\t'+r['path']).encode()+b'\0' for r in rows)
 git(['update-index','-z','--index-info'],input=entries,index=index)
 tree=text(['write-tree'],index=index)
 listing=git(['ls-tree','-r','-z',tree]).stdout.split(b'\0')[:-1]
 assert len(listing)==39, 'save tree has unexpected files'
 message=('s2557: retain quiet boss-art review evidence without touching its checkout\n\n'
  'Retention only; no art adoption or merge authorization. Parentless snapshot.\n'
  'Source tree: '+str(source)+'\nSource branch: '+source_branch+'\nSource HEAD: '+source_head+'\n'
  'All 39 paths retain their source-relative names under artifacts/boss-art-fidelity-2026-09-08/.\n'
  '35,391,000 bytes; source blobs verified against the read-only census immediately before capture.\n')
 commit=text(['commit-tree',tree,'-F','-'],input=message.encode())
 assert len(text(['rev-list','--parents','-n','1',commit]).split())==1, 'snapshot is not parentless'
 git(['update-ref',ref,commit,'0'*40])
main_after=git(['status','--porcelain=v1','-uall','-z']).stdout
source_after=git(['status','--porcelain=v1','-uall','-z'],cwd=source).stdout
main_head_after=text(['rev-parse','main'])
for r in rows:
 s=(source/r['path']).stat()
 assert s.st_size==r['bytes'] and s.st_mtime==r['mtime'], 'source changed during snapshot'
out={'time':time.strftime('%Y-%m-%dT%H:%M:%S%z'),'branch':branch,'commit':commit,'tree':tree,'parentCount':0,'sourceTree':str(source),'sourceHead':source_head,'sourceBranch':source_branch,'sourceNewestMtime':newest,'sourceQuietSeconds':round(time.time()-newest,1),'files':rows,'fileCount':len(rows),'bytes':sum(r['bytes'] for r in rows),'mainHeadBefore':main_head_before,'mainHeadAfter':main_head_after,'mainStatusIdentical':main_before==main_after,'sourceStatusIdentical':source_before==source_after,'mainStatusBefore':main_before.decode().split('\0')[:-1],'mainStatusAfter':main_after.decode().split('\0')[:-1],'sourceStatusBefore':source_before.decode().split('\0')[:-1],'sourceStatusAfter':source_after.decode().split('\0')[:-1],'pushed':False}
receipt.write_text(json.dumps(out,indent=2)+'\n')
assert out['mainStatusIdentical'] and out['sourceStatusIdentical'] and main_head_before==main_head_after, 'concurrent mutation; inspect receipt before push'
print('Retained',len(rows),'files',out['bytes'],'bytes at',branch,commit,'parentless; source/main status byte-identical; NOT PUSHED')
