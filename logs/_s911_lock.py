import os
p="/Users/robin/Claude/Projects/Gold Rush/STATUS.md"
s=open(p,encoding="utf-8").read()
lines=s.split("\n")
old=lines[0]
arch="- **s910 handoff (line-1 archive):** "+old.replace("Last updated: ","",1)
lines[0]="ACTIVE 2026-07-22T21:44Z (s911 fire) — VERIFY board drain-clean + census live on lane-a + wall lifted/P1s landed; holding, thin-quota."
for i,l in enumerate(lines):
    if l.startswith("- **s910 lock (line-1 archive):**"):
        lines.insert(i,arch); break
open(p,"w",encoding="utf-8").write("\n".join(lines))
print("OK lock; archived len",len(arch))
