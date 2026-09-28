import fs from 'node:fs';
import {spawn} from 'node:child_process';
import net from 'node:net';
import {runBattery} from "file:///Users/robin/Claude/Projects/Gold%20Rush/scripts/gate-battery.mjs";
const wt="/Users/robin/.goldrush/s2747/wt-aif1",out="/Users/robin/Claude/Projects/Gold Rush/artifacts/s2747";
const env={PATH:'/opt/homebrew/bin:'+process.env.PATH,GR_CAPTURE_EXTERNAL_SERVER:'1',GR_CAPTURE_BASE_URL:'http://127.0.0.1:5188'};
await new Promise((resolve,reject)=>{const s=net.createServer();s.once('error',reject);s.listen(5188,'127.0.0.1',()=>s.close(resolve));});
const fd=fs.openSync(out+'/candidate-vite.txt','a');
const server=spawn('/opt/homebrew/bin/node',['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5188','--strictPort'],{cwd:wt,env:{...process.env,...env},stdio:['ignore',fd,fd]});
fs.writeFileSync(out+'/candidate-vite-process.json',JSON.stringify({pid:server.pid,at:new Date().toISOString()},null,2));
try{let ready=false;for(let i=0;i<60;i++){try{const r=await fetch(env.GR_CAPTURE_BASE_URL);if(r.ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,500));}if(!ready)throw Error('Own Vite failed readiness');
const warm=runBattery([['warmup','npx','playwright','test','e2e/task-025-bandits-dont-swim.spec.ts','--project=desktop-chrome','--grep','enemy crossing the river reaches the hero through the ford only','--workers=1','--output=/Users/robin/.goldrush/s2747/warm-results']],{cwd:wt,env,transcript:out+'/candidate-browser.txt',label:'s2747 warmup'});if(warm.overall)throw Error('Warmup failed');
const result=runBattery([['own and adjacent','npx','playwright','test','e2e/audio-integration.spec.ts','e2e/050-audio-mix-and-access.spec.ts','e2e/audio-music-toggle.spec.ts','e2e/m2-01-build-menu.spec.ts','e2e/task-025-bandits-dont-swim.spec.ts','e2e/m1-01-claim-jumpers-death.spec.ts','--project=desktop-chrome','--project=mobile-chrome','--workers=1','--output=/Users/robin/.goldrush/s2747/browser-results'],['plain boots','node','artifacts/s2747/plain-boots.mjs']],{cwd:wt,env,transcript:out+'/candidate-browser.txt',label:'s2747 own, adjacent and plain boots'});fs.writeFileSync(out+'/candidate-browser-result.json',JSON.stringify(result,null,2));process.exitCode=result.overall;
}finally{server.kill('SIGTERM');fs.writeFileSync(out+'/candidate-vite-stop.json',JSON.stringify({pid:server.pid,signal:'SIGTERM',at:new Date().toISOString()},null,2));}
