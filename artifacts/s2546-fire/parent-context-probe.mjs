import assert from 'node:assert/strict';
import { spawnSync, spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { runsNodeGuardsBattery } from '/Users/robin/Claude/Projects/Gold Rush/scripts/node-guards-concurrency.mjs';
function batteries(){
 const g=spawnSync('pgrep',['-f','run-node-guards'],{encoding:'utf8'});
 if(g.status===1)return [];
 assert.equal(g.status,0);assert.equal(g.error,undefined);
 const r=spawnSync('ps',['-o','pid=,ppid=,command=','-p',g.stdout.trim().split(/\s+/).join(',')],{encoding:'utf8',maxBuffer:64<<20});
 assert.equal(r.error,undefined);assert.ok(r.status===0||r.status===1);
 return r.stdout.trim().split('\n').filter(Boolean).map(l=>{const m=l.match(/^\s*(\d+)\s+(\d+)\s+(.+)$/);assert.ok(m);return {pid:+m[1],ppid:+m[2],runsBattery:runsNodeGuardsBattery(m[3]),bytes:Buffer.byteLength(m[3])};}).filter(r=>r.runsBattery);
}
const before=batteries();if(before.length){console.log('WAIT: genuine battery active',JSON.stringify(before));process.exit(3);}
const output='artifacts/s2546-fire/';
const direct=spawnSync(process.execPath,['--test','scripts/node-guards-contention.test.mjs'],{encoding:'utf8',timeout:60000,maxBuffer:64<<20});
writeFileSync(output+'contention-direct.txt',direct.stdout+direct.stderr);
assert.equal(direct.error,undefined);assert.equal(direct.status,0,'direct control must pass before testing parent context');
assert.deepEqual(batteries(),[]);
const child=spawn(process.execPath,['scripts/run-node-guards.mjs','scripts/node-guards-contention.test.mjs'],{stdio:['ignore','pipe','pipe']});
let text='';child.stdout.on('data',c=>text+=c);child.stderr.on('data',c=>text+=c);
const ended=new Promise((resolve,reject)=>{child.once('error',reject);child.once('close',(code,signal)=>resolve({code,signal}));});
await new Promise(r=>setTimeout(r,1000));const during=batteries();
const end=await ended;writeFileSync(output+'contention-under-harness.txt',text);
const after=batteries();const result={node:process.execPath,observedAt:new Date().toISOString(),before,directStatus:direct.status,parentPid:child.pid,during,end,after,proof:'same unmodified test direct versus under its own battery launcher'};
writeFileSync(output+'contention-parent-context.json',JSON.stringify(result,null,2)+'\n');
assert.deepEqual(during.map(r=>r.pid),[child.pid],'only the test own parent harness may explain the nested refusal');
assert.equal(end.code,1);assert.match(text,/node-guards board did not stay quiet for 300ms/);assert.deepEqual(after,[]);
console.log(JSON.stringify(result,null,2));
