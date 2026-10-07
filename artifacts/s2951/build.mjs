import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const prefix='artifacts/s2951/';
const env={...process.env,PATH:'/opt/homebrew/bin:'+process.env.PATH};
for(const [name,bin,args,extra] of [
 ['tsc','npx',['tsc','--noEmit'],{}],
 ['build','npm',['run','build'],{}],
 ['e1-build','npm',['run','build'],{GR_RELEASE:'e1'}]
]){
 const start=Date.now();const fd=fs.openSync(prefix+name+'.txt','w');
 const result=spawnSync(bin,args,{env:{...env,...extra},stdio:['ignore',fd,fd]});fs.closeSync(fd);
 const receipt={name,exitCode:result.status,signal:result.signal,seconds:(Date.now()-start)/1000};
 fs.appendFileSync(prefix+'build-receipts.jsonl',JSON.stringify(receipt)+'\n');console.log(receipt);
 if(result.status!==0)process.exit(result.status??1);
}
const payload=spawnSync(process.execPath,['scripts/first-town-payload.mjs','--json'],{env,encoding:'utf8'});
fs.writeFileSync(prefix+'first-town-payload.json',payload.stdout);
if(payload.status!==0)throw Error(payload.stderr);
const parsed=JSON.parse(payload.stdout);if(parsed.bytes>=52000000)throw Error('E1 payload over budget');
console.log({payloadBytes:parsed.bytes,budget:52000000});
