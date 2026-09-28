import fs from 'node:fs';
import {spawn} from 'node:child_process';
import net from 'node:net';
import {runBattery} from "file:///Users/robin/Claude/Projects/Gold%20Rush/scripts/gate-battery.mjs";
const wt="/Users/robin/.goldrush/s2733/wt-tape",out="/Users/robin/Claude/Projects/Gold Rush/artifacts/s2733";
const env={PATH:'/opt/homebrew/bin:'+process.env.PATH,GR_CAPTURE_EXTERNAL_SERVER:'1',GR_CAPTURE_BASE_URL:'http://127.0.0.1:5413'};
await new Promise((resolve,reject)=>{const s=net.createServer();s.once('error',reject);s.listen(5413,'127.0.0.1',()=>s.close(resolve));});
const fd=fs.openSync(out+'/vite.txt','a');
const server=spawn('/opt/homebrew/bin/node',['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5413','--strictPort'],{cwd:wt,env:{...process.env,...env},stdio:['ignore',fd,fd]});
fs.writeFileSync(out+'/vite-process.json',JSON.stringify({pid:server.pid,at:new Date().toISOString()},null,2));
try {
 let ready=false;for(let i=0;i<60;i++){try{const r=await fetch(env.GR_CAPTURE_BASE_URL);if(r.ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,500));}if(!ready)throw Error('own Vite did not become ready');
 const base=['npx','playwright','test'];
 const warm=runBattery([['warmup',...base,'e2e/task-025-bandits-dont-swim.spec.ts','--project=desktop-chrome','--grep','enemy crossing the river reaches the hero through the ford only']],{cwd:wt,transcript:out+'/browser-gates.txt',label:'s2733 warmup',env});
 if(warm.overall)throw Error('warmup failed');
 const measured=runBattery([["Tape audit and adjacent plain boots",...base,"e2e/e7-tape-toggle-phone-hit-target.spec.ts","e2e/e7-playbook-surface.spec.ts","e2e/task-025-bandits-dont-swim.spec.ts","e2e/m1-01-claim-jumpers-death.spec.ts","e2e/m2-01-build-menu.spec.ts","e2e/f-astra-6-plain-boot.spec.ts","--project=desktop-chrome","--project=mobile-chrome","--output="+out+"/playwright-results"]],{cwd:wt,transcript:out+"/browser-gates.txt",label:"s2733 own and adjacent gates",env});
 fs.writeFileSync(out+"/browser-result.json",JSON.stringify(measured,null,2));
 process.exitCode=measured.overall;
} finally { server.kill("SIGTERM");fs.writeFileSync(out+"/vite-stop.json",JSON.stringify({pid:server.pid,at:new Date().toISOString(),signal:"SIGTERM"},null,2)); }
