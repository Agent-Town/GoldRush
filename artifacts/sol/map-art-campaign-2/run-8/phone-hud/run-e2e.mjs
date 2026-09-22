// Read-only test orchestration; use the existing specs and one browser worker.
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, createWriteStream } from 'node:fs';
import { sourceHash } from '../../../../../scripts/phone-hud-entry-census.mjs';
const out='artifacts/sol/map-art-campaign-2/run-8/phone-hud';
const started=Date.now();
while (true) {
  const census=JSON.parse(readFileSync(`${out}/after.json`,'utf8'));
  if(census.rows.length===12 && census.sourceHash===sourceHash()) break;
  if(Date.now()-started>600000) throw Error('Complete current census required before E2E');
  await new Promise(r=>setTimeout(r,1000));
}
const summaries=[];
async function run(name,specs,projects){
 const log=createWriteStream(`${out}/${name}.log`);
 const args=['playwright','test',...specs,...projects.map(p=>`--project=${p}`),'--workers=1','--reporter=line,json'];
 const env={...process.env,GR_CAPTURE_EXTERNAL_SERVER:'1',GR_CAPTURE_BASE_URL:'http://127.0.0.1:5312',PLAYWRIGHT_JSON_OUTPUT_FILE:`${out}/${name}.json`};
 const child=spawn('npx',args,{env,stdio:['ignore','pipe','pipe']});
 child.stdout.pipe(log,{end:false});child.stderr.pipe(log,{end:false});
 const code=await new Promise((resolve,reject)=>{child.on('error',reject);child.on('exit',resolve)});
 log.end();summaries.push({name,args,exitCode:code});writeFileSync(`${out}/e2e-exits.json`,JSON.stringify(summaries,null,2)+'\n');
 console.log(name,code);
}
await run('e2e-hud',JSON.parse(readFileSync(`${out}/hud-spec-roster.json`)).specs,['desktop-chrome','mobile-chrome']);
await run('e2e-campaign',['e2e/e8-low-orbit-momentum.spec.ts','e2e/e9-seed-run-caravan.spec.ts','e2e/e7-relay-rush-front.spec.ts','e2e/e7-dead-band-suppression.spec.ts','e2e/ss-07-e6-beats.spec.ts'],['mobile-chrome']);
