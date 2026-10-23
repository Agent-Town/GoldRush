import fs from 'node:fs';
import path from 'node:path';
import {spawn,spawnSync} from 'node:child_process';
const root=process.cwd(),wt=fs.readFileSync('artifacts/s3307/worktree-path.txt','utf8').trim();
const dir=path.join(root,'artifacts/s3307');
const port=5317,base='http://127.0.0.1:'+port;
const occupied=spawnSync('lsof',['-t','-iTCP:'+port,'-sTCP:LISTEN'],{encoding:'utf8'});
if(occupied.status!==1||occupied.stdout.trim())throw Error('Scratch port occupied');
const env={...process.env,PATH:'/Users/robin/.nvm/versions/node/v26.4.0/bin:/opt/homebrew/bin:'+process.env.PATH,DEVELOPER_DIR:'/Library/Developer/CommandLineTools'};
const fd=fs.openSync(dir+'/vite.txt','a');
const vite=spawn('/Users/robin/.nvm/versions/node/v26.4.0/bin/node',['node_modules/vite/bin/vite.js','--port',String(port),'--strictPort','--host','127.0.0.1'],{cwd:wt,env,stdio:['ignore',fd,fd]});
fs.writeFileSync(dir+'/vite-pid.txt',String(vite.pid)+'\n');
try{
 let ready=false;for(let n=0;n<100;n++){try{const r=await fetch(base,{signal:AbortSignal.timeout(1000)});if(r.ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,300));}if(!ready)throw Error('Vite did not become ready');
 const jobs=[
 ['warm-up','npx','playwright','test','e2e/m2-01-build-menu.spec.ts','--project=desktop-chrome','-g','six ready icons','--workers=1','--reporter=line'],
 ['adjacent desktop and mobile','npx','playwright','test','e2e/task-025-bandits-dont-swim.spec.ts','e2e/m1-01-claim-jumpers-death.spec.ts','e2e/m2-01-build-menu.spec.ts','--workers=1','--reporter=line'],
 ['plain boot desktop and 390px','npx','playwright','test','e2e/f-astra-6-plain-boot.spec.ts','-g','plain the-claim boot','--workers=1','--reporter=line']
 ];
 const log=fs.openSync(dir+'/browser-driver.txt','a');
 const r=spawnSync('/Users/robin/.nvm/versions/node/v26.4.0/bin/node',['scripts/gate-battery.mjs','--cwd',wt,'--label','s3307 browser drain','--transcript',dir+'/browser-gates.txt','--env','PATH='+env.PATH,'--env','GR_CAPTURE_EXTERNAL_SERVER=1','--env','GR_CAPTURE_BASE_URL='+base,JSON.stringify(jobs)],{cwd:root,env,stdio:['ignore',log,log]});fs.closeSync(log);
 fs.writeFileSync(dir+'/browser-result.json',JSON.stringify({code:r.status,signal:r.signal,at:new Date().toISOString()})+'\n');
 for(const project of ['desktop-chrome','mobile-chrome'])for(const [from,to] of [[`artifacts/sol/open-findings/_raw/plain/${project}-the-claim.png`,`${project}-plain.png`],[`artifacts/sol/open-findings/plain-${project}-the-claim.json`,`${project}-plain.json`]])if(fs.existsSync(path.join(wt,from)))fs.copyFileSync(path.join(wt,from),path.join(dir,to));
 console.log('Browser battery exit',r.status);process.exitCode=r.status??1;
}finally{if(vite.pid)spawnSync('kill',['-TERM',String(vite.pid)]);fs.closeSync(fd);}
