import os
p="/Users/robin/Claude/Projects/Gold Rush/STATUS.md"
s=open(p,encoding="utf-8").read()
lines=s.split("\n")
old=lines[0].replace("Last updated: ","",1)
arch="- **s912 handoff (line-1 archive):** "+old
lines[0]="ACTIVE 2026-07-22T22:20Z (s913 fire) — DRAIN e7/e10 combined lane-a output (done-moved 22:19, 2 epochs); lane-c auth-dead zombie still owner-kill-owed."
lines.insert(1,arch)
open(p,"w",encoding="utf-8").write("\n".join(lines))
# clean s911 debris
try:
    os.remove("/Users/robin/Claude/Projects/Gold Rush/logs/_s911_lock.py")
    print("removed _s911_lock.py")
except Exception as e:
    print("s911 debris:",e)
print("locked; archived",len(arch),"chars")
