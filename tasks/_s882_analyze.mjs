import fs from 'fs';
const lines = fs.readFileSync('STATUS.md','utf8').split('\n');
// event markers that mean a handoff recorded REAL work -> never touch
const EVENT=/SHIPPED|drain lane|drained|merged s|\bmerge\b|gazette|DRAIN|F-S\d|review file|reviews\/|deploy(ed)?|RE-LAND|CODEX-RESUMED|authored|refill(ed)?|re-queue/i;
const NOOP=/near-no-op/i, DRY=/board dry/i, PROBE=/probe/i;
let collapsibleHand=0, collBytes=0, keptEvent=0, keptRecent=0;
const RECENT=new Set(); // keep newest N handoffs verbatim
// find all handoff session numbers, sort desc, keep top 8
const nums=[];
for(const L of lines){const m=L.match(/^- \*\*s(\d+) handoff \(line-1 archive\):/); if(m)nums.push(+m[1]);}
nums.sort((a,b)=>b-a);
for(const n of nums.slice(0,8)) RECENT.add(n);
for(const L of lines){
  const mH=L.match(/^- \*\*s(\d+) handoff \(line-1 archive\):/);
  if(!mH) continue;
  const n=+mH[1];
  if(L.length<=1500) continue; // already compact
  if(RECENT.has(n)){keptRecent++; continue;}
  if(EVENT.test(L)){keptEvent++; continue;}
  if(NOOP.test(L)&&DRY.test(L)&&PROBE.test(L)){collapsibleHand++; collBytes+=L.length;}
  else keptEvent++; // anything not clearly no-op is kept
}
console.log('collapsible pure-noop handoff bullets',collapsibleHand,'bytes',collBytes);
console.log('kept (event-bearing or ambiguous)',keptEvent,'kept recent verbatim',keptRecent);
