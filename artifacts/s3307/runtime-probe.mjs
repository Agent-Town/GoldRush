import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const host=fs.readFileSync('.env.local','utf8').match(/^GR_DROPLET_HOST=(.*)$/m)?.[1].trim().replace(/^['"]|['"]$/g,'');
if(!host)throw Error('Missing configured host');
const source=`import fs from 'node:fs';import {execFileSync} from 'node:child_process';import {computeEngineHash} from './scripts/assay-replay-agent.mjs';
const run=(...args)=>execFileSync('systemctl',args,{encoding:'utf8'}).trim();
const services=Object.fromEntries(['goldrush-ledger','goldrush-assay'].map(s=>{const pid=run('show',s,'-p','MainPID','--value');return [s,{state:run('is-active',s),restarts:run('show',s,'-p','NRestarts','--value'),executable:fs.readlinkSync('/proc/'+pid+'/exe')}]}));
const rotations=JSON.parse(fs.readFileSync('assets/rotations/rotation-seeds.json','utf8'));
const env=fs.readFileSync('/etc/goldrush-assay.env','utf8');
console.log(JSON.stringify({at:new Date().toISOString(),services,build:env.match(/^ASSAY_BUILD_ID=(.*)$/m)?.[1],engineHash:await computeEngineHash('/opt/goldrush'),rotations,backup:run('show','goldrush-ledger-backup','-p','Result','-p','ExecMainStatus','-p','ExecMainExitTimestamp'),backupTimer:run('show','goldrush-ledger-backup.timer','-p','LastTriggerUSec','-p','NextElapseUSecRealtime')},null,2));`;
const q=s=>"'"+s.replaceAll("'","'\\''")+"'";
const result=spawnSync('ssh',['-o','BatchMode=yes','-o','ConnectTimeout=10',host,'cd /opt/goldrush && /root/.nvm/versions/node/v26.12.1/bin/node --input-type=module -e '+q(source)],{encoding:'utf8',timeout:45000,maxBuffer:1024*1024});
if(result.status!==0){fs.writeFileSync('artifacts/s3307/runtime-probe-error.txt',(result.stderr||'probe failed').replace(/\d{1,3}(?:\.\d{1,3}){3}/g,'<ip>'));throw Error('Read-only runtime probe failed, exit '+result.status);}
const data=JSON.parse(result.stdout);fs.writeFileSync('artifacts/s3307/droplet-runtime.json',JSON.stringify(data,null,2)+'\n');console.log(JSON.stringify({...data,rotations: data.rotations.rotations?.map(r=>r.id)},null,2));
