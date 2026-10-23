import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
if(Date.now()<Date.parse('2026-10-23T02:10:00Z'))throw Error('Private duty is not due before 02:10 UTC');
const dir='artifacts/s3307';
const visibility=JSON.parse(fs.readFileSync(dir+'/private-visibility.json','utf8'));
if(visibility.visibility!=='PRIVATE'||visibility.nameWithOwner!=='Agent-Town/GoldRush-archive')throw Error('Private destination not verified');
const env={...process.env,PATH:'/Users/robin/.nvm/versions/node/v26.4.0/bin:/opt/homebrew/bin:'+process.env.PATH};
for(const [name,script] of [['ledger-pull','ledger-backup-pull.mjs'],['ledger-push','ledger-mirror-push.mjs'],['fire-memory','fire-memory-mirror.mjs'],['mirror-freshness-after','ledger-mirror-freshness.mjs']]){
 const r=spawnSync('/Users/robin/.nvm/versions/node/v26.4.0/bin/node',['scripts/'+script],{env,encoding:'utf8',maxBuffer:16*1024*1024,timeout:180000});
 const log=(r.stdout+r.stderr).replace(/\d{1,3}(?:\.\d{1,3}){3}/g,'<ip>');fs.writeFileSync(`${dir}/${name}.txt`,log);fs.writeFileSync(`${dir}/${name}-result.json`,JSON.stringify({code:r.status,signal:r.signal,at:new Date().toISOString()})+'\n');console.log(name,r.status,log.slice(-2200));
 if(r.status!==0){process.exitCode=1;break;}
}
const heads=spawnSync('git',['ls-remote','archive','refs/heads/ledger-backups','refs/heads/fire-memory'],{encoding:'utf8',timeout:30000});fs.writeFileSync(dir+'/private-heads-after.txt',heads.stdout);console.log(heads.stdout);if(heads.status!==0)process.exitCode=1;
