import fs from 'node:fs';
import {spawn} from 'node:child_process';
import net from 'node:net';
import {runBattery} from "file:///Users/robin/Claude/Projects/Gold%20Rush/scripts/gate-battery.mjs";
const wt="/Users/robin/.goldrush/s2736/wt-control",out="/Users/robin/Claude/Projects/Gold Rush/artifacts/s2736";
const env={PATH:'/opt/homebrew/bin:'+process.env.PATH,GR_AUDIO_ARM:'control',GR_AUDIO_EVIDENCE:out+'/plain-control',GR_AUDIO_RESULTS:'/Users/robin/.goldrush/s2736/control-plain-results',GR_CAPTURE_EXTERNAL_SERVER:'1',GR_CAPTURE_BASE_URL:'http://127.0.0.1:5416'};
await new Promise((resolve,reject)=>{const s=net.createServer();s.once('error',reject);s.listen(5416,'127.0.0.1',()=>s.close(resolve));});
const fd=fs.openSync(out+'/control-vite.txt','a');
const server=spawn('/opt/homebrew/bin/node',['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5416','--strictPort'],{cwd:wt,env:{...process.env,...env},stdio:['ignore',fd,fd]});
fs.writeFileSync(out+'/control-vite-process.json',JSON.stringify({pid:server.pid,at:new Date().toISOString()},null,2));
try {
 let ready=false;for(let i=0;i<60;i++){try{const r=await fetch(env.GR_CAPTURE_BASE_URL);if(r.ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,500));}if(!ready)throw Error('own Vite did not become ready');
 const base=['npx','playwright','test'];
 const warm=runBattery([['warmup',...base,'e2e/task-025-bandits-dont-swim.spec.ts','--project=desktop-chrome','--grep','enemy crossing the river reaches the hero through the ford only']],{cwd:wt,transcript:out+'/control-gates.txt',label:'s2736 warmup',env});
 if(warm.overall)throw Error('warmup failed');
 const measured=runBattery([["plain same-session baseline",...base,"--config","artifacts/s2736/plain.config.ts","--project=desktop-chrome","--project=mobile-chrome"]],{cwd:wt,transcript:out+"/control-gates.txt",label:"s2736 clean-main baseline",env});
 fs.writeFileSync(out+"/control-result.json",JSON.stringify(measured,null,2));
 process.exitCode=measured.overall;
} finally { server.kill("SIGTERM");fs.writeFileSync(out+"/control-vite-stop.json",JSON.stringify({pid:server.pid,at:new Date().toISOString(),signal:"SIGTERM"},null,2)); }
