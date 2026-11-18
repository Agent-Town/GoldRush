import fs from 'node:fs';
import {spawn} from 'node:child_process';
const started=Date.now(), dir='artifacts/s3550';
const env={...process.env,PATH:'/Library/Developer/CommandLineTools/usr/bin:'+process.env.PATH};
const fd=fs.openSync(dir+'/gazette-direct-git.txt','a');
const awake=spawn('/usr/bin/caffeinate',['-i','-w',String(process.pid)],{stdio:'ignore'});awake.unref();
const child=spawn(process.execPath,['--test','scripts/gazette-scan-space-guard.test.mjs'],{env,stdio:['ignore',fd,fd]});
console.log(JSON.stringify({pid:child.pid,changedPremise:'Resolve git directly to CommandLineTools, avoiding the /usr/bin developer-tool shim. Same test, scan window, assertions and timeout.'}));
child.on('close',(code,signal)=>{fs.closeSync(fd);awake.kill('SIGTERM');const out=fs.readFileSync(dir+'/gazette-direct-git.txt','utf8');const result={code,signal,seconds:(Date.now()-started)/1000,summary:out.split('\n').filter(l=>/^(ℹ|✖|✔)/.test(l))};fs.writeFileSync(dir+'/gazette-direct-git-result.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));process.exitCode=code??1;});
