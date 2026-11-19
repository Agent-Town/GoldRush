import fs from 'node:fs';
import {spawnSync,execFileSync} from 'node:child_process';
const dir='artifacts/s3560';
const raw=process.env.HOME+'/.goldrush/fire-evidence/s3560';fs.mkdirSync(raw,{recursive:true,mode:0o700});
if(JSON.parse(fs.readFileSync(dir+'/private-visibility.txt')).visibility!=='PRIVATE')throw Error('Private archive required');
if(Date.now()<Date.parse('2026-11-19T02:10:00Z'))throw Error('Before daily duty window');
const env={...process.env,PATH:'/Library/Developer/CommandLineTools/usr/bin:/Users/robin/.nvm/versions/node/v26.4.0/bin:'+process.env.PATH,RSYNC_RSH:'ssh -o BatchMode=yes -o ConnectTimeout=5 -o ServerAliveInterval=5 -o ServerAliveCountMax=2',GIT_SSH_COMMAND:'ssh -o BatchMode=yes -o ConnectTimeout=5 -o ServerAliveInterval=5 -o ServerAliveCountMax=2'};
function scrub(s){for(const l of fs.readFileSync('.env.local','utf8').split('\n')){const i=l.indexOf('=');if(i<0)continue;const v=l.slice(i+1).trim().replace(/^['"]|['"]$/g,'');if(v.length>7)s=s.split(v).join('[REDACTED]');if(v.includes('@'))s=s.split(v.split('@').at(-1)).join('[PRIVATE HOST]');}return s.replace(/\b(?:sk-(?:ant|proj|live|test)?-?[A-Za-z0-9_-]{24,}|gh[pousr]_[A-Za-z0-9_]{30,}|xox[abp]-[A-Za-z0-9-]{20,})/g,'[REDACTED]');}
const results=[];
for(const [name,args]of [['ledger-pull',['scripts/ledger-backup-pull.mjs']],['ledger-push',['scripts/ledger-mirror-push.mjs']],['fire-memory',['scripts/fire-memory-mirror.mjs']],['mirror-freshness',['scripts/ledger-mirror-freshness.mjs']]]){
 const began=new Date().toISOString();const fd=fs.openSync(raw+'/'+name+'.txt','a',0o600);
 const r=spawnSync(process.execPath,args,{env,stdio:['ignore',fd,fd],timeout:120000,killSignal:'SIGTERM'});fs.closeSync(fd);
 const output=scrub(fs.readFileSync(raw+'/'+name+'.txt','utf8'));fs.writeFileSync(dir+'/'+name+'.txt',output);
 const result={name,began,finished:new Date().toISOString(),code:r.status,signal:r.signal,error:r.error?.code};results.push(result);
 fs.writeFileSync(dir+'/private-duty-results.json',JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify(result));console.log(output);

}
const heads=execFileSync('git',['ls-remote','archive','refs/heads/ledger-backups','refs/heads/fire-memory'],{env,encoding:'utf8',timeout:30000});fs.writeFileSync(dir+'/private-heads.txt',heads);console.log(heads);
