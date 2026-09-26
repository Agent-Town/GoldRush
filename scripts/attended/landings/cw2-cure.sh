#!/bin/bash
# cw2 cure (in the chain after the merge, before the gates): regenerate the null floors on the merged tree and prove that ONLY the
# two Canyon Works seeds moved (eventLogHash: the two authored arc turrets at (+-18, 22) now stand because the t2 ramp no longer
# refuses their ground), then declare the owner-facing finding as a desk row.
G=$1; export PATH=/opt/homebrew/bin:$PATH
cp assets/contracts/null-floors.json /tmp/cw2-floors-before.json
node scripts/null-floor-anchors.mjs > "$HOME/.goldrush/land/cw2-floors-regen.log" 2>&1; echo "null floors regenerated rc=$?" >> "$G"
node - <<'NODE' >> "$G" 2>&1
const fs=require('fs');const a=JSON.parse(fs.readFileSync('/tmp/cw2-floors-before.json','utf8'));const b=JSON.parse(fs.readFileSync('assets/contracts/null-floors.json','utf8'));
const moved=[];for(const c of Object.keys(b.floors)){for(const s of Object.keys(b.floors[c])){const x=a.floors[c]?.[s],y=b.floors[c][s];if(JSON.stringify(x)!==JSON.stringify(y))moved.push(s+' '+(x?x.eventLogHash:'new')+' -> '+y.eventLogHash+(x&&(x.waves!==y.waves||x.gold!==y.gold||x.kills!==y.kills||x.secured!==y.secured)?' OUTCOME CHANGED':' (eventLogHash only)'))}}
console.log('floors moved:',moved.length,moved.join(' | '));
const ok=moved.length===2&&moved.every(m=>m.startsWith('e3-canyon-works-0')&&!m.includes('OUTCOME CHANGED'));
if(!ok){console.log('cw2 cure: floors moved beyond the two Canyon Works seeds, or an outcome changed — needs hands');process.exit(1)}
NODE
git add -- assets/contracts/null-floors.json && git commit -q -m "drain: null floors re-pinned on the merged tree — the two Canyon Works seeds' eventLogHash moved because the authored arc turrets now stand (F-CW2-1); 81 other floors byte-identical

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" && echo "cure cw2: floors committed $(git rev-parse --short HEAD)" >> "$G"
node scripts/attended/desk-row.cjs F-CW2-1 "(2026-09-26, from the canyon-works-traversal-2 landing): the Canyon Works' two authored arc turrets at (plus or minus 18, 22) STAND for the first time.** They never did: the old t2 ramp refused their ground and placement skips an unwalkable site. With the ramp slope-legal the contract's own turrets appear, the map gains two free turrets (a balance change made by restoring authored content), the two canyon null floors moved on event hash only (waves, gold, kills identical) and one spec step was re-baselined for the moth the east turret now kills. Landed as the contract's intent; say the word if the turrets should not stand and the drain reverts them. Still not secured by Astra's driver even with the terrain fixed: enemy pressure at the ford and the 240-gold CONNECT cost (F-CW2-3), measured at up to nine times baseline load; a re-run on a quiet host comes before any balance talk." >> "$G" 2>&1
git add -- tasks/BACKLOG.md && git commit -q -m "drain: canyon-works-traversal-2 — the standing turrets declared as an owner desk row (F-CW2-1)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" && echo "cure cw2: desk row committed $(git rev-parse --short HEAD)" >> "$G"
