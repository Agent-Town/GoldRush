import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const p=fs.readFileSync('artifacts/s3307/node-tap-path.txt','utf8').trim();
if(fs.existsSync(p)){
 const s=fs.readFileSync(p,'utf8');
 const rows=s.split('\n').filter(x=>/^(ok|not ok) [0-9]+ /.test(x));
 console.log('Completed',rows.length,'top-level reds',rows.filter(x=>x.startsWith('not ok')));
 console.log(rows.slice(-2).join('\n'));
 console.log('TAP modified',fs.statSync(p).mtime.toISOString());
}
const children=spawnSync('pgrep',['-P','33420'],{encoding:'utf8'}).stdout.trim().split(/\s+/).filter(Boolean);
for(const p of children){
 const c=spawnSync('ps',['-o','command=','-p',p],{encoding:'utf8'}).stdout;
 console.log('Fixture child',p,c.trim().split(/\s+/).at(-1));
}
console.log(fs.readFileSync('artifacts/s3307/drain-driver.txt','utf8').split('\n').filter(x=>/^=====|^SUMMARY|^OVERALL/.test(x)).join('\n'));
console.log(new Date().toISOString());
