"""Local-only round-trip using the real scanner, mover, audits and budget. No network."""
import subprocess as sp, pathlib as P, tempfile, json, hashlib, shutil, os
root=P.Path.cwd(); out=root/'artifacts/play-proofs-evidence-retention-1'; sealed='artifacts/sol-play-proofs-7-record'
def git(cwd,*args,**kw): return sp.check_output(['git',*args],cwd=cwd,**kw)
def run(args): return sp.check_output(args,cwd=root,stderr=sp.STDOUT).decode()
base=P.Path(tempfile.mkdtemp(prefix='gr-run11-retention-')); repo=base/'repo'; archive=base/'archive'; repo.mkdir(); archive.mkdir()
for d in [repo,archive]:
 git(d,'init','-q'); git(d,'config','user.name','Local retention fixture'); git(d,'config','user.email','fixture@localhost')
objects=git(root,'rev-parse','--git-common-dir',text=True).strip(); objects=(root/objects).resolve()/'objects'
(repo/'.git/objects/info/alternates').write_text(str(objects)+'\n')
head=git(root,'rev-parse','HEAD',text=True).strip(); git(repo,'read-tree',head); git(repo,'update-ref','HEAD',head)
files=git(root,'ls-files','-z').decode().split('\0')
for f in files:
 if f and (f.startswith(('scripts/','e2e/','src/','.claude/skills/','reviews/')) or f in ['vite.config.ts','package.json']):
  p=repo/f; p.parent.mkdir(parents=True,exist_ok=True); shutil.copyfile(root/f,p)
for f in ['artifacts/sol/play-proofs/run-11',sealed,'artifacts/play-proofs-evidence-retention-1']:
 shutil.copytree(root/f,repo/f,dirs_exist_ok=True); git(repo,'add','--',f)
for row in json.loads((out/'source-checks.json').read_text()):
 if row.get('originalPath'):
  shutil.copyfile(root/row['originalPath'],repo/row['originalPath']); git(repo,'add','--',row['originalPath'])
# Literal fixture citation is confined to this independent repository.
f=repo/'reviews/retention-local-fixture.md'; f.write_text('Evidence: `'+sealed+'/e1-drill-yard/board-desktop-chrome.png`.\n'); git(repo,'add','--','reviews/retention-local-fixture.md')
git(repo,'commit','-qm','fixture: run 11 sealed packaging')
plan=json.loads(run(['node',str(root/'scripts/evidence-offload.mjs'),'--root',str(repo),'--plan','--json']))
candidate=next(x for x in plan['candidates'] if x['subtree']==sealed); assert candidate['movableFiles']==230 and not candidate['keep']
(out/'offload-plan.json').write_text(json.dumps(candidate,indent=2)+'\n')
git(archive,'checkout','-q','--orphan','evidence')
# Only a local bare destination; neither repository has a real remote.
git(base,'init','-q','--bare',str(base/'archive.git')); git(archive,'remote','add','origin',str(base/'archive.git'))
log=run(['node',str(root/'scripts/evidence-offload.mjs'),'--root',str(repo),'--apply',sealed,'--archive-worktree',str(archive)])
(out/'fixture-offload.log').write_text(log)
index=json.loads((repo/'artifacts/ARCHIVE-INDEX.json').read_text()); manifest=json.loads((out/'manifest.json').read_text()); moved=0
for row in manifest['files']:
 p=row['retainedPath']
 if p.startswith(sealed+'/'):
  e=index['files'][p]; b=git(archive,'show',e['archiveCommit']+':evidence/'+p); assert not (repo/p).exists(); moved+=1
  assert e['bytes']==row['bytes'] and e['sha256']==row['sha256']
 else: b=(repo/p).read_bytes()
 assert len(b)==row['bytes'] and hashlib.sha256(b).hexdigest()==row['sha256']
assert moved==230 and len(index['files'])==230
assert (repo/'artifacts/play-proofs-evidence-retention-1/report.md').exists()
assert (repo/'artifacts/play-proofs-evidence-retention-1/manifest.json').exists()
for name,path in [('fixture-index.json','artifacts/ARCHIVE-INDEX.json'),('fixture-ARCHIVED.md',sealed+'/ARCHIVED.md'),('fixture-PREVIEW.png',sealed+'/PREVIEW.png')]: shutil.copyfile(repo/path,out/name)
audit=run(['node',str(root/'scripts/review-evidence-audit.mjs'),'--root',str(repo),'--all']); (out/'fixture-audit.log').write_text(audit)
assert 'ARCHIVED=1' in audit and 'ON-DISK-UNTRACKED=0' in audit
budget=json.loads(run(['node',str(root/'scripts/evidence-budget.mjs'),head,'HEAD','--root',str(repo),'--json'])); assert budget['added']<40000000
(out/'fixture-budget.json').write_text(json.dumps(budget,indent=2)+'\n')
result=dict(fixture=str(base),base=head,packagedCommit=git(repo,'rev-parse','HEAD^',text=True).strip(),offloadedCommit=git(repo,'rev-parse','HEAD',text=True).strip(),archiveCommit=git(archive,'rev-parse','HEAD',text=True).strip(),verifiedFiles=231,movedFiles=moved,movedBytes=candidate['movableBytes'],fixtureAddedBytes=budget['added'],remoteWrites=False)
(out/'fixture-result.json').write_text(json.dumps(result,indent=2)+'\n'); print(json.dumps(result,indent=2))
