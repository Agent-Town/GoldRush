import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {parseArgs} from 'node:util';
import {root,out,write,host} from './browser.mjs';
const {values}=parseArgs({options:{'after-pid':{type:'string'},node:{type:'string',default:process.execPath}}});
const phases=[];
if(values['after-pid']){
 console.log(`Waiting for the existing serial census PID ${values['after-pid']}`);
 while(true){try{process.kill(Number(values['after-pid']),0);}catch{break;}await new Promise(r=>setTimeout(r,5000));}
}
async function run(script,args=[],timeoutMs=30*60000,node=process.execPath){
 const phase={script,args,before:host()};console.log(`START ${script}`);const log=await fs.open(path.join(out,`${script}-phase.log`),'w');
 await new Promise(resolve=>{const child=spawn(node,[`scripts/perf-survey/${script}.mjs`,...args],{cwd:root,stdio:['ignore',log.fd,log.fd]});const timeout=setTimeout(()=>child.kill('SIGTERM'),timeoutMs);child.on('error',e=>{phase.error=String(e);clearTimeout(timeout);resolve();});child.on('exit',(code,signal)=>{phase.code=code;phase.signal=signal;clearTimeout(timeout);resolve();});});
 await log.close();phase.after=host();phases.push(phase);await write('phases.json',phases);console.log(`END ${script}: ${phase.code??phase.error}`);
}
await run('run',['--all','--resume','--minutes','42'],45*60000);
await run('terrain');
await run('sim',['--node',values.node],20*60000,values.node);
await run('worker',[],10*60000);
await run('attribution',['--rounds','2'],20*60000);
await run('zoom',[],5*60000);
await run('memory',[],5*60000);
await run('delivery',['--minutes','24'],26*60000);
await run('validate',[],60000);
console.log('All measurement phases attempted; inspect every phase result before reporting.');
