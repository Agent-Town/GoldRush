#!/bin/bash
# tpf1 cure (in the chain after the merge): the F-RVA1-6 finding row closes with its cure.
G=$1
python3 - <<'PY'
import re
p='tasks/BACKLOG.md'; s=open(p,encoding='utf-8').read()
m=re.search(r'^🔎 \*\*F-RVA1-6 — MEASURED[^\n]*$', s, re.M)
if m:
    line='✅ '+m.group(0)[len('🔎 '):]+' ✅ FIXED by `tape-pause-fix-1` (Astra, landed 2026-09-27): the replay ignores recorded pauses; old and new reels replay and verify.'
    s=s[:m.start()]+line+s[m.end():]; open(p,'w',encoding='utf-8').write(s); print('F-RVA1-6 closed')
else: print('F-RVA1-6 row not found')
PY
if ! git diff --quiet -- tasks/BACKLOG.md; then git add -- tasks/BACKLOG.md && git commit -q -m "drain: tape-pause-fix-1 — F-RVA1-6 closed with its cure

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" && echo "cure tpf1: F-RVA1-6 closed $(git rev-parse --short HEAD)" >> "$G" || { echo "cure tpf1: commit failed — needs hands" >> "$G"; exit 1; }; else echo "cure tpf1: nothing to change" >> "$G"; fi
