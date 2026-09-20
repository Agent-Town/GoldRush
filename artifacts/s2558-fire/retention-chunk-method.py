import json,subprocess,time
from pathlib import Path
prior=json.loads(Path('artifacts/s2555-fire/chunk-backed-exceptions.json').read_text());rows=[]
def git(*args):return subprocess.check_output(['git',*args],text=True).strip()
refs=sorted(set(r['ref'] for r in prior))
remote=git('ls-remote','origin',*[r.replace('refs/remotes/origin/','refs/heads/') for r in refs])
live={line.split()[1]:line.split()[0] for line in remote.splitlines()}
for old in prior:
 manifest=old['manifest'];ref=old['ref'];branch=ref.replace('refs/remotes/origin/','refs/heads/')
 tip=git('rev-parse',ref);assert live[branch]==tip,(ref,live.get(branch),tip)
 assert Path(manifest).read_text().strip()==git('show','refs/remotes/origin/main:'+manifest)
 f=next(f for f in json.loads(Path(manifest).read_text())['files'] if f['gitBlob']==old['gitBlob'])
 assert f['bytes']==old['bytes'];assert sum(p['bytes'] for p in f['parts'])==f['bytes']
 for p in f['parts']:assert int(git('cat-file','-s',ref+':'+p['path']))==p['bytes']
 rows.append({**old,'verifiedAt':time.strftime('%Y-%m-%dT%H:%M:%S%z'),'partsRefTip':tip})
Path('artifacts/s2558-fire/retention-chunks.json').write_text(json.dumps(rows,indent=2)+'\n')
print('Verified',len(rows),'raw blobs against offsite manifests,',sum(r['parts'] for r in rows),'part sizes,',len(refs),'live origin tips; no reassembly claimed')
