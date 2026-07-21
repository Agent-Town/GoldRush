import fs from 'fs';
const APPLY = process.argv.includes('--apply');
const lines = fs.readFileSync('STATUS.md','utf8').split('\n');
// A "lock (line-1 archive)" bullet is pure pre-work INTENT by construction
// (Mistake #16: locks announce intent; only a merge+review is completion).
// Any real outcome lives in the paired HANDOFF bullet, never the lock bullet.
// Session existence is preserved in git history regardless. Safe to drop all.
const out=[]; let dropped=0;
for(const L of lines){
  if(/^- \*\*s\d+ lock \(line-1 archive\):/.test(L)){dropped++; continue;}
  out.push(L);
}
console.log('lock-intent bullets DROPPED', dropped);
console.log('remaining lines', out.length, '(was', lines.length, ')');
// sanity: durable markers must survive
const joined=out.join('\n');
for(const marker of ['s9au MIGRATION','s9ab','## Where we are','## Done log','Robin owes','s881 handoff (line-1 archive)']){
  console.log((joined.includes(marker)?'OK ':'MISSING ')+marker);
}
if(APPLY){ fs.writeFileSync('STATUS.md', joined); console.log('APPLIED, new bytes', fs.statSync('STATUS.md').size); }
else console.log('DRY-RUN');
