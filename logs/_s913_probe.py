import sys
p='STATUS.md'
with open(p) as f:
    lines=f.readlines()
print('total lines', len(lines))
print('line1 len', len(lines[0]))
ls=sorted(((len(l),i) for i,l in enumerate(lines)), reverse=True)[:8]
for L,i in ls:
    print('line',i+1,'len',L)
# total size
import os
print('bytes', os.path.getsize(p))
