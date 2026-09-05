// Is the per-frame layout read (get clientWidth) something a PLAYER pays, or an artefact of the
// ?debug/?profile seams the survey itself boots with? A/B on identical maps, same session.
import {launch,pageFor,profile,topFunctions,sample,summarize,write,host} from './browser.mjs';
const env=await launch();const rows=[];
try{
 for(const map of ['the-claim','e9-seed-run'])for(const arm of ['debug-profile','plain']){
  const {page,context,errors}=await pageFor(env.browser,{width:1280,height:800});
  const q=arm==='debug-profile'
   ? `debug=&profile=&tier=full&seed=perf-survey-20260905&nopause=&nolevel=&nokill=&contract=${map}`
   : `tier=full&seed=perf-survey-20260905&contract=${map}`;
  const row={map,arm,query:q,before:host(),errors};
  try{
   await page.goto(`${env.base}/?${q}`,{waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForFunction(()=>globalThis.__PERF_SURVEY__?.scene,{timeout:60000});
   await page.waitForTimeout(6000);
   await page.evaluate(()=>document.querySelector('[data-testid="contract-briefing-dismiss"]')?.click());
   await page.waitForTimeout(1500);
   const cpu=await profile(page,6000);const top=topFunctions(cpu);
   const find=n=>top.find(f=>f.name===n)?.selfMs??0;
   const measured=await sample(page,5000);
   Object.assign(row,{status:'measured',
    clientWidthSelfMs:find('get clientWidth')+find('get clientHeight'),
    updateMatrixWorldSelfMs:find('updateMatrixWorld'),idleSelfMs:find('(idle)'),
    gcSelfMs:find('(garbage collector)'),
    framesIn5s:measured.rows.length,renderMsP50:summarize(measured).renderMs.p50,
    top10:top.slice(0,10)});
  }catch(e){row.status='failed';row.failure=String(e);}
  row.after=host();rows.push(row);await write('debugcost.json',{at:new Date().toISOString(),
   method:'Same build, same map, one browser. debug-profile arm boots the seams the census uses; plain arm boots none. 6 s CDP CPU profile at 1 ms sampling, then a 5 s frame sample.',rows});
  console.log(`${map} ${arm}: clientWidth=${row.clientWidthSelfMs?.toFixed(0)}ms matrices=${row.updateMatrixWorldSelfMs?.toFixed(0)}ms frames5s=${row.framesIn5s} load=${row.after.load[0].toFixed(1)} ${row.failure??''}`);
  await context.close();
 }
}finally{await env.close();}
