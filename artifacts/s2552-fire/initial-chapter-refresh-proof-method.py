import hashlib, json, os, shutil, subprocess, time
from pathlib import Path
root=Path('/private/tmp/gr-gate-s2552')
out=Path('/Users/robin/Claude/Projects/Gold Rush/artifacts/s2552-fire')
retained=root/'reviews/shots-ss-06-e5-beats'
files=sorted(retained.glob('desktop-chrome-*.png'));assert len(files)==5
original={str(p):p.read_bytes() for p in files};mtimes={str(p):p.stat().st_mtime_ns for p in files}
env=os.environ.copy();env.update(PATH='/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin',CLAUDE_CONFIG_DIR='/Users/robin/.claude-fires',GR_REFRESH_EVIDENCE='1',GR_CAPTURE_BASE_URL='http://127.0.0.1:5313',GR_CAPTURE_EXTERNAL_SERVER='1')
args=['npx','playwright','test','e2e/ss-06-e5-beats.spec.ts','--grep=^a player-selected Deepwater town','--project=desktop-chrome','--workers=1','--trace=off','--reporter=line','--output=/private/tmp/gr-gate-s2552/refresh-results']
started=time.monotonic()
try:
 result=subprocess.run(args,cwd=root,env=env,text=True,capture_output=True)
 (out/'chapter-refresh.txt').write_text(result.stdout+result.stderr)
 changes=[]
 for p in files:
  changes.append({'path':str(p.relative_to(root)),'written':p.stat().st_mtime_ns>mtimes[str(p)],'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
  target=out/'explicit-refresh-shots'/p.name;target.parent.mkdir(exist_ok=True);shutil.copyfile(p,target)
finally:
 for p,data in original.items():Path(p).write_bytes(data)
rows=json.loads((out/'retained-before.json').read_text());unchanged=all(hashlib.sha256((root/r['path']).read_bytes()).hexdigest()==r['sha256'] for r in rows)
proof={'rc':result.returncode,'seconds':round(time.monotonic()-started,3),'explicitWrites':changes,'restoredRetainedFiles':len(rows),'allRestored':unchanged}
(out/'chapter-refresh-proof.json').write_text(json.dumps(proof,indent=2)+'\n')
print(json.dumps(proof),flush=True)
assert result.returncode==0 and all(r['written'] for r in changes) and unchanged
