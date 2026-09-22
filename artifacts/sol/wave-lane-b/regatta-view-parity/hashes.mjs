import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ENGINE_SOURCE_INPUTS, computeEngineHash } from '../../../../scripts/assay-replay-agent.mjs';
const root=process.cwd(),files=[];
async function collect(dir) {for(const entry of await readdir(dir,{withFileTypes:true})) {const p=path.join(dir,entry.name);if(entry.isDirectory())await collect(p);else if(entry.isFile() && /\.(?:json|mjs|ts)$/.test(entry.name))files.push(p);}}
for(const input of ENGINE_SOURCE_INPUTS) {const p=path.join(root,input);if(path.extname(input))files.push(p);else await collect(p);}
const changed=new Set(execFileSync('git',['diff','--name-only','HEAD','--','src'],{encoding:'utf8'}).trim().split('\n').filter(Boolean));
const before=createHash('sha256'),after=createHash('sha256');
for(const file of files.sort()) {
 const rel=path.relative(root,file).split(path.sep).join('/'),bytes=await readFile(file);
 const original=changed.has(rel)?execFileSync('git',['show',`HEAD:${rel}`]):bytes;
 before.update(`${rel}\0${original.length}\0`);before.update(original);
 after.update(`${rel}\0${bytes.length}\0`);after.update(bytes);
}
const result={at:new Date().toISOString(),base:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),note:'Before is reconstructed from HEAD source against the same live store bytes used for after; not a claimed preflight store snapshot.',before:before.digest('hex'),after:after.digest('hex'),check:await computeEngineHash(root),sourceOverrides:[...changed]};
result.storeStableDuringCheck=result.after===result.check;
await writeFile('artifacts/sol/wave-lane-b/regatta-view-parity/hash-pair.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result));
