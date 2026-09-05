// Attributes a named hot function's self time to the callers that reach it, so a finding can name
// a call SITE rather than a symptom. Walks the V8 .cpuprofile node tree; no sampling assumptions
// beyond the profile's own timeDeltas.
import fs from 'node:fs/promises';
import path from 'node:path';
import {out} from './browser.mjs';
const [file,needle='structuredClone',depth='4']=process.argv.slice(2);
const profile=JSON.parse(await fs.readFile(path.isAbsolute(file)?file:path.join(out,file),'utf8'));
const byId=new Map(profile.nodes.map(n=>[n.id,n]));
const parent=new Map();
for(const n of profile.nodes)for(const c of n.children??[])parent.set(c,n.id);
const self=new Map();
for(let i=0;i<(profile.samples?.length??0);i++)self.set(profile.samples[i],(self.get(profile.samples[i])??0)+(profile.timeDeltas?.[i]??0)/1000);
const label=n=>`${n.callFrame.functionName||'(anonymous)'} ${String(n.callFrame.url||'').replace(/^.*\/src\//,'src/').replace(/^file:\/\/.*\//,'')}:${n.callFrame.lineNumber+1}`;
const chains=new Map();let total=0;
for(const [id,ms] of self){
  const node=byId.get(id);if(!node||!(node.callFrame.functionName||'').includes(needle))continue;
  total+=ms;const chain=[];
  for(let p=parent.get(id),d=0;p!==undefined&&d<Number(depth);p=parent.get(p),d++)chain.push(label(byId.get(p)));
  const key=chain.join(' <- ');chains.set(key,(chains.get(key)??0)+ms);
}
const rows=[...chains].sort((a,b)=>b[1]-a[1]).slice(0,12);
console.log(`${needle}: ${total.toFixed(0)} ms self across ${chains.size} distinct caller chains in ${path.basename(file)}`);
for(const [chain,ms] of rows)console.log(`  ${ms.toFixed(0).padStart(7)} ms  ${chain}`);
