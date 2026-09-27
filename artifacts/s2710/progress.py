from pathlib import Path
import subprocess,json,datetime,re
p=Path('/var/folders/cd/p02kvf6s5qgfn47w85hhtzjc0000gn/T/node-guards-tap-ESwFnV/battery.tap')
s=p.read_text().splitlines() if p.exists() else []
rows={}
for l in subprocess.check_output(['ps','-axo','pid,ppid,comm'],text=True).splitlines()[1:]:
 a=l.strip().split(None,2)
 if len(a)==3:rows[int(a[0])]=(int(a[1]),a[2])
desc={11648}
for _ in range(12):desc.update(pid for pid,(parent,_) in rows.items() if parent in desc)
active=[]
for pid in sorted(desc):
 if pid not in rows or not rows[pid][1].endswith('/node') and rows[pid][1]!='node':continue
 try:cmd=subprocess.check_output(['ps','-o','args=','-p',str(pid)],text=True).strip()
 except subprocess.CalledProcessError:continue
 scripts=re.findall(r'(?:scripts|src|ops)/[^ ]+\.(?:mjs|js)',cmd)
 if scripts and len(scripts)<4:active.append({'pid':pid,'scripts':scripts})
v={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'bytes':p.stat().st_size if p.exists() else 0,'completedRecords':sum(x.startswith('ok ') for x in s),'failureRecords':sum(x.startswith('not ok ') for x in s),'active':active}
with Path('artifacts/s2710/progress.jsonl').open('a') as f:f.write(json.dumps(v)+'\n')
print(json.dumps(v))
