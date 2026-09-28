import fs from 'node:fs';import {spawn} from 'node:child_process';import net from 'node:net';
import {runBattery} from "file:///Users/robin/Claude/Projects/Gold%20Rush/scripts/gate-battery.mjs";
const wt="/Users/robin/.goldrush/fire-s2730/wt-control",out="/Users/robin/Claude/Projects/Gold Rush/artifacts/s2730";
const env={PATH:'/opt/homebrew/bin:'+process.env.PATH,GR_CAPTURE_EXTERNAL_SERVER:'1',GR_CAPTURE_BASE_URL:'http://127.0.0.1:5317'};
await new Promise((resolve,reject)=>{const s=net.createServer();s.once('error',reject);s.listen(5317,'127.0.0.1',()=>s.close(resolve));});
const fd=fs.openSync(out+'/control-vite.txt','a');const server=spawn('/opt/homebrew/bin/node',['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5317','--strictPort'],{cwd:wt,env:{...process.env,...env},stdio:['ignore',fd,fd]});
fs.writeFileSync(out+'/control-vite-process.json',JSON.stringify({pid:server.pid,at:new Date().toISOString()},null,2));
try{let ready=false;for(let i=0;i<60;i++){try{if((await fetch(env.GR_CAPTURE_BASE_URL)).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,500));}if(!ready)throw Error('control Vite not ready');
const warm=runBattery([['control warmup','npx','playwright','test','e2e/task-025-bandits-dont-swim.spec.ts','--project=desktop-chrome','--grep','enemy crossing the river reaches the hero through the ford only']],{cwd:wt,transcript:out+'/control-gates.txt',env});if(warm.overall)throw Error('control warmup failed');
const r=runBattery([['Echo Canyon phone clean-main control','npx','playwright','test','e2e/native-proofs/e7-echo-canyon.spec.ts','--project=mobile-chrome','--output='+out+'/control-results']],{cwd:wt,transcript:out+'/control-gates.txt',label:'same-spec Echo Canyon phone clean-base control',env:{...env,GR_NATIVE_PROOF:'1',GR_NATIVE_RUN:'s2730-control',GR_NATIVE_STRATEGY:'fire-s2730-control'}});
fs.writeFileSync(out+'/control-result.json',JSON.stringify(r,null,2));
}finally{server.kill('SIGTERM');fs.writeFileSync(out+'/control-vite-stop.json',JSON.stringify({pid:server.pid,signal:'SIGTERM',at:new Date().toISOString()},null,2));}
