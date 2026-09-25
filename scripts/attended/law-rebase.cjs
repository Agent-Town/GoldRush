// law-rebase.cjs — re-base fire.md's drifted pointers by their BANKED EXCERPTS (a branch grew a cited file above the cited lines).
// Text fix by measurement, never a blind --update: a pointer moves only when its banked excerpt is found at exactly one new line.
// Ported 2026-09-25 from the attended scratchpad's h154-lawfix.cjs (memory law-pointer-update-refingerprints-rot). cwd = the worktree.
const fs=require('fs');const {execFileSync}=require('child_process');
let out='';try{out=execFileSync('node',['scripts/law-pointer-guard.mjs'],{encoding:'utf8'});}catch(e){out=(e.stdout||'')+(e.stderr||'');}
const drift=[...out.matchAll(/POINTER DRIFT (scripts\/fire\.md) -> ([^\s:]+):(\d+)/g)].map(m=>({src:m[1],target:m[2],line:Number(m[3])}));
{const seen=new Set();for(let i=drift.length-1;i>=0;i--){const k=drift[i].src+' -> '+drift[i].target+':'+drift[i].line;if(seen.has(k))drift.splice(i,1);else seen.add(k);}}
if(!drift.length){console.log('no drift');process.exit(0);}
const b=JSON.parse(fs.readFileSync('scripts/law-pointer-baseline.json','utf8'));const entries=b.pointers||b;let fire=fs.readFileSync('scripts/fire.md','utf8');const moved=[];
for(const d of drift){const key=`${d.src} -> ${d.target}:${d.line}`;const v=entries[key];if(!v||!v.excerpt||!v.target)throw new Error('no banked excerpt for '+key);
  const lines=fs.readFileSync(v.target,'utf8').split('\n');const hits=[];lines.forEach((l,i)=>{if(l.includes(v.excerpt))hits.push(i+1);});
  if(hits.length!==1)throw new Error(`excerpt for ${key} found ${hits.length} times in ${v.target}; needs hands`);
  const nl=hits[0];if(nl===d.line)continue;const re=new RegExp('(`?'+d.target.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+':)'+d.line+'(?!\\d)','g');
  const before=fire;fire=fire.replace(re,'$1'+nl);if(fire===before)throw new Error('pointer text for '+key+' not found in fire.md');moved.push(`${d.target}:${d.line}->${nl}`);}
fs.writeFileSync('scripts/fire.md',fire);console.log('re-based: '+(moved.join(', ')||'nothing'));
