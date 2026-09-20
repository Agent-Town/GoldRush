from pathlib import Path
import subprocess, os, time, datetime, json, hashlib, sys
root=Path.cwd();out=root/'artifacts/s2546-fire';env=os.environ.copy();env['PATH']='/Users/robin/.nvm/versions/node/v26.4.0/bin:'+env['PATH'];assert 'CLAUDE_CONFIG_DIR' in env
ver=subprocess.check_output(['node','--version'],env=env,text=True).strip();assert ver=='v26.4.0'
probe="""import {spawnSync} from 'node:child_process';import{runsNodeGuardsBattery}from './scripts/node-guards-concurrency.mjs';const p=spawnSync('pgrep',['-f','run-node-guards'],{encoding:'utf8'});if(p.status===1){console.log('[]');process.exit(0)}if(p.error||p.status!==0)throw Error('pgrep unavailable');const r=spawnSync('ps',['-o','pid=,ppid=,command=','-p',p.stdout.trim().split(/\\s+/).join(',')],{encoding:'utf8',maxBuffer:64<<20});if(r.error||r.status!==0)throw Error('ps unavailable');const rows=r.stdout.trim().split('\\n').map(l=>l.match(/^\\s*(\\d+)\\s+(\\d+)\\s+(.+)$/));if(rows.some(r=>!r))throw Error('bad row');console.log(JSON.stringify(rows.filter(r=>runsNodeGuardsBattery(r[3])).map(r=>({pid:+r[1],ppid:+r[2],bytes:r[3].length}))));"""
pre=json.loads(subprocess.check_output(['node','--input-type=module','-e',probe],env=env,text=True));assert pre==[],f'foreign Node battery live: {pre}'
start=time.monotonic();stamp=datetime.datetime.now().astimezone().isoformat();head=subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip()
with (out/'closing-ledger.txt').open('wb') as f:
 p=subprocess.Popen(['npm','run','test:ledger-guards'],stdout=f,stderr=subprocess.STDOUT,env=env,start_new_session=True)
 print(f'Closing ledger pid/group {p.pid}, started {stamp}, handoff {head}',flush=True)
 rc=p.wait()
b=(out/'closing-ledger.txt').read_bytes();record={'startedAt':stamp,'finishedAt':datetime.datetime.now().astimezone().isoformat(),'elapsedSeconds':round(time.monotonic()-start,3),'node':ver,'command':'npm run test:ledger-guards','handoff':head,'pid':p.pid,'preflightBatteries':pre,'exitCode':rc,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()};(out/'closing-ledger.json').write_text(json.dumps(record,indent=2)+'\n');print(json.dumps(record),flush=True);sys.exit(rc)
