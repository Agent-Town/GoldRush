import fs from 'node:fs';
import {spawn} from 'node:child_process';
const dir='artifacts/s3326',start=Date.now();
const fd=fs.openSync(dir+'/gazette-control.txt','a');
const child=spawn(process.execPath,['--test','scripts/gazette-scan-space-guard.test.mjs'],{env:{...process.env,PATH:'/Users/robin/.nvm/versions/node/v26.4.0/bin:/opt/homebrew/bin:'+process.env.PATH},stdio:['ignore',fd,fd]});
child.on('close',(code,signal)=>{fs.closeSync(fd);const log=fs.readFileSync(dir+'/gazette-control.txt','utf8');const r={code,signal,node:process.version,seconds:(Date.now()-start)/1000,finished:new Date().toISOString(),summary:log.split('\n').filter(l=>/^ℹ (tests|pass|fail|cancelled|skipped)/.test(l))};fs.writeFileSync(dir+'/gazette-control-result.json',JSON.stringify(r,null,2));console.log(JSON.stringify(r,null,2));process.exitCode=code??1;});
