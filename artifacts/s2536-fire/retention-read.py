import subprocess, json, time
from pathlib import Path
root=Path.cwd(); now=time.time(); rows=[]
blocks=subprocess.check_output(['git','worktree','list','--porcelain'],text=True).split('\n\n')
for b in blocks:
 line=next((l for l in b.splitlines() if l.startswith('worktree ')),None)
 if not line: continue
 tree=line[9:]; row={'tree':tree,'prunable':'\nprunable' in b}; rows.append(row)
 try:
  tracked=subprocess.check_output(['git','ls-files','-z'],cwd=tree,stderr=subprocess.PIPE).split(b'\0')[:-1]
  assert len(tracked)>0,'zero tracked control'
  read=subprocess.check_output(['git','ls-files','--others','--exclude-standard','-z'],cwd=tree,stderr=subprocess.PIPE).split(b'\0')[:-1]
  names=[n.decode() for n in read]; row.update(verdict='answered',tracked=len(tracked),untracked=len(names),names=names)
  found=[]
  for n in names:
   p=Path(tree)/n
   if p.is_file() and (n.startswith(('artifacts/','reviews/shots-','tasks/runs/','logs/runs-archive/')) or p.suffix in ['.png','.webp','.jsonl'] and not n.startswith(('.claude/','logs/'))):
    s=p.stat(); found.append({'path':n,'bytes':s.st_size,'mtime':s.st_mtime,'ageSeconds':round(now-s.st_mtime,1)})
  row['evidenceCandidates']=found
 except (OSError,subprocess.CalledProcessError,AssertionError) as e:
  row.update(verdict='could-not-answer',error=str(e))
output={'time':time.strftime('%Y-%m-%dT%H:%M:%S%z'),'trees':rows}
Path('artifacts/s2536-fire/worktree-retention.json').write_text(json.dumps(output,indent=2)+'\n')
print('trees',len(rows),'answered',sum(r['verdict']=='answered' for r in rows),'could-not-answer',sum(r['verdict']!='answered' for r in rows),'evidence paths',sum(len(r.get('evidenceCandidates',[])) for r in rows))
for r in rows:
 if r['verdict']!='answered': print(r['tree'],r['verdict'])
