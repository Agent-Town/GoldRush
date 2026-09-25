#!/bin/bash
# hm06 cure (bookkeeping only, in the chain after the merge): close the F-TB-1 desk row in the ledger and mark HM-06 landed in the held-maps spec.
G=$1; node - <<'NODE' >> "$G" 2>&1 || exit 1
const fs=require('fs');
let b=fs.readFileSync('tasks/BACKLOG.md','utf8');
const i=b.indexOf("🔺 **F-TB-1 — OWNER'S DESK (2026-09-24, from the E1 control reds):");
if(i>=0){const j=b.indexOf('**',i+8);const k=b.indexOf('**',j+2);if(k>0&&!b.slice(i,k+40).includes('✅ CLOSED')){b=b.slice(0,k+2)+" ✅ RULED 2026-09-24 \"(5) (b)\", CLOSED 2026-09-25: landed by `hm-06-twin-banks-braid-water` run 2 (the water follows the braid; the two band tests re-pinned)."+b.slice(k+2);fs.writeFileSync('tasks/BACKLOG.md',b);console.log('cure: F-TB-1 row closed');}else console.log('cure: F-TB-1 row already closed or unshaped');}
else console.log('cure: F-TB-1 desk row not found in the index (may live in a split part); nothing changed');
let s=fs.readFileSync('specs/held-maps/README.md','utf8');const h=s.match(/^(#+ .*HM-06[^\n]*)$/m);
if(h&&!h[1].includes('LANDED')){s=s.replace(h[1],h[1]+' (LANDED 2026-09-25, Astra run 2, `reviews/hm-06-twin-banks-braid-water.md`)');fs.writeFileSync('specs/held-maps/README.md',s);console.log('cure: HM-06 heading marked landed');}else console.log('cure: HM-06 heading unchanged');
NODE
git add -- tasks/BACKLOG.md specs/held-maps/README.md; git diff --cached --quiet || git commit -q -m "drain: hm-06 bookkeeping cure — the F-TB-1 desk row closed by the landing, the held-maps spec marks HM-06 landed

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
echo "cure hm06: committed $(git rev-parse --short HEAD)" >> "$G"
