import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const dir='artifacts/s3533';
const env={...process.env,PATH:'/Users/robin/.nvm/versions/node/v26.4.0/bin:/Library/Developer/CommandLineTools/usr/bin:/opt/homebrew/bin:'+process.env.PATH};
const host=fs.readFileSync('.env.local','utf8').match(/^GR_DROPLET_HOST=(.+)$/m)?.[1].trim();
const scrub=s=>host?s.replaceAll(host,'[configured ledger host]'):s;
const invoke=(cmd,args,timeout=240000)=>spawnSync(cmd,args,{encoding:'utf8',env,timeout,maxBuffer:16000000});
const visibility=invoke('gh',['repo','view','Agent-Town/GoldRush-archive','--json','nameWithOwner,visibility'],30000);
if(visibility.status!==0||JSON.parse(visibility.stdout).visibility!=='PRIVATE')throw Error('Archive privacy unverified');
fs.writeFileSync(dir+'/private-visibility.json',visibility.stdout);
const results=[];
for(const [name,script] of [['ledger-pull','ledger-backup-pull'],['ledger-push','ledger-mirror-push']]){
 if(name==='ledger-push'&&results[0].status!==0){results.push({name,skipped:'pull failed'});continue}
 const started=new Date().toISOString(); const r=invoke('node',['scripts/'+script+'.mjs']);
 fs.writeFileSync(dir+'/'+name+'.txt',scrub(r.stdout+r.stderr));
 results.push({name,started,finished:new Date().toISOString(),status:r.status,signal:r.signal,error:r.error?.code});
 console.log(name,r.status,scrub(r.stdout+r.stderr));
 fs.writeFileSync(dir+'/private-duty-results.json',JSON.stringify(results,null,2));
}
const heads=invoke('git',['ls-remote','archive','refs/heads/ledger-backups','refs/heads/fire-memory'],60000);
fs.writeFileSync(dir+'/private-heads.txt',heads.stdout+heads.stderr);console.log(heads.stdout);
const freshness=invoke('node',['scripts/ledger-mirror-freshness.mjs'],60000);
fs.writeFileSync(dir+'/mirror-freshness.txt',freshness.stdout+freshness.stderr);console.log(freshness.stdout+freshness.stderr);
