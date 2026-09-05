// Merge the parallel census shards (census-b1/b2) back into census.json, keeping one row per key.
import {read,write} from './browser.mjs';
const base=await read('census.json');
const byKey=new Map(base.rows.map(r=>[r.key,r]));
const added=[];
for(const shard of process.argv.slice(2)){
  const s=await read(shard);
  for(const r of s.rows) if(!byKey.has(r.key)){byKey.set(r.key,r);added.push(r.key);}
}
const rows=[...byKey.values()];
await write('census.json',{...base,rows});
console.log(`merged ${added.length} new rows; census now ${rows.length} rows over ${new Set(rows.map(r=>r.map)).size} maps`);
