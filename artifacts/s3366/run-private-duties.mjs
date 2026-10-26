import fs from 'node:fs';
import {spawn} from 'node:child_process';
const dir='artifacts/s3366';
const earliest=Date.parse('2026-10-26T02:10:00Z');
const wait=Math.max(0,earliest-Date.now());
console.log('Private duties scheduled within this fire for the required 02:10 UTC threshold; wait ms',wait);
if(wait) await new Promise(resolve=>setTimeout(resolve,wait));
const results=[];
async function run(name,cmd,args){
  const started=new Date().toISOString();
  const fd=fs.openSync(dir+'/'+name+'.txt','a');
  const code=await new Promise((resolve,reject)=>{const c=spawn(cmd,args,{stdio:['ignore',fd,fd]});c.on('error',reject);c.on('close',resolve);});
  fs.closeSync(fd);
  const result={name,cmd,args,started,finished:new Date().toISOString(),code};
  results.push(result);
  fs.writeFileSync(dir+'/private-duty-results.json',JSON.stringify(results,null,2));
  console.log(result);
  return code;
}
const pull=await run('ledger-pull',process.execPath,['scripts/ledger-backup-pull.mjs']);
if(pull===0) await run('ledger-push',process.execPath,['scripts/ledger-mirror-push.mjs']);
// FM-01 already discharged by s3365 today; verify its receipt and live head instead.
await run('mirror-freshness',process.execPath,['scripts/ledger-mirror-freshness.mjs']);
await run('private-heads','git',['ls-remote','archive','refs/heads/ledger-backups','refs/heads/fire-memory']);
