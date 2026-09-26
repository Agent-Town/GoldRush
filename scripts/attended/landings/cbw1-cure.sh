#!/bin/bash
# cbw1 cure (in the chain after the merge): the public door document names the new ?rotation= parameter (F-CBW1-4), outside the guarded rotations block; the follow-ups ledgered.
G=$1
node - <<'NODE' >> "$G" 2>&1
const fs=require('fs'); const p='public/skill.md'; let t=fs.readFileSync(p,'utf8');
if (/rotation=<id>|\?rotation=/.test(t)) { console.log('F-CBW1-4: skill.md already names ?rotation=; nothing changed'); process.exit(0); }
// anchor: the first line that documents the public board GET's party or difficulty parameter, outside the guarded rotations block
const start=t.indexOf('skillmd-guard:rotations:start'), end=t.indexOf('skillmd-guard:rotations:end');
const lines=t.split('\n'); let idx=-1, pos=0;
for (let i=0;i<lines.length;i++){ const l=lines[i]; const inBlock = start>=0 && pos>start && pos<end; if(!inBlock && /GET \/api\/standings|`party=|`difficulty=|\?party=|&party=/.test(l)) { idx=i; break; } pos+=l.length+1; }
if (idx<0) { console.log('F-CBW1-4: no parameter anchor found in skill.md; left for a doc slice'); process.exit(0); }
lines.splice(idx+1,0,"- `rotation=<id>` or `rotation=open` (county-board-open-week-1, 2026-09-26): the board of one weekly seed, the open week's by `open`; a week unknown, not yet open or not carrying the contract answers 400 `bad_rotation`; without it the board is the all-time constant-seed one.");
fs.writeFileSync(p, lines.join('\n')); console.log('F-CBW1-4: skill.md names ?rotation= after line '+(idx+1));
NODE
if ! git diff --quiet -- public/skill.md; then node --test --test-reporter=spec scripts/skillmd-guard.test.mjs > /tmp/cbw1-skillmd.txt 2>&1; RC=$?; grep -E "^ℹ (pass|fail)" /tmp/cbw1-skillmd.txt | tr '\n' ' ' >> "$G"; echo >> "$G"; if [ $RC -eq 0 ]; then git add -- public/skill.md && git commit -q -m "drain: county-board-open-week-1 — the public door document names ?rotation= (F-CBW1-4)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" && echo "cure cbw1: skill.md committed $(git rev-parse --short HEAD)" >> "$G"; else git checkout -- public/skill.md; echo "cure cbw1: skill.md guard red after the insertion; reverted, F-CBW1-4 left for a doc slice" >> "$G"; fi; fi
python3 - <<'PY'
p='tasks/BACKLOG.md'; s=open(p,encoding='utf-8').read()
row='🟨 **F-CBW1-7 + F-CBW1-6 — DEFERRED follow-ups from the county-board-open-week-1 landing (2026-09-26):** a week view in the Field Book (optional, F-CBW1-7); regenerate the same-game audit after the board change (cosmetic, F-CBW1-6). Game polish, authored on an owner word or after the ruled slices.\n'
i=s.find('🧭 **OWNER RULINGS 2026-09-26'); s=s[:i]+row+s[i:]; open(p,'w',encoding='utf-8').write(s)
PY
if ! git diff --quiet -- tasks/BACKLOG.md; then git add -- tasks/BACKLOG.md && git commit -q -m "drain: county-board-open-week-1 — the deferred follow-ups ledgered (F-CBW1-7, F-CBW1-6)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" && echo "cure cbw1: ledger row committed $(git rev-parse --short HEAD)" >> "$G"; fi
