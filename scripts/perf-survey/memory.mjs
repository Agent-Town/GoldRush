import {launch,pageFor,boot,snapshot,read,write,host} from './browser.mjs';
const inventory=await read('inventory.json'),env=await launch();const result={at:new Date().toISOString(),method:'One warm cycle then five measured cycles; full tier 390x844 DPR1. CDP forces GC before retained heap readings. Native town->run and contract transitions reload the document; run->town and town->menu->town call application dispose in the same document.',cycles:[]};
const {page,context,errors}=await pageFor(env.browser,{width:390,height:844});await page.addInitScript(()=>globalThis.__SURVEY_DOCUMENT_ID__=crypto.randomUUID());
const cdp=await context.newCDPSession(page);
async function reading(){await page.waitForTimeout(2000);await cdp.send('HeapProfiler.collectGarbage');const scene=await snapshot(page);return {documentId:await page.evaluate(()=>__SURVEY_DOCUMENT_ID__),heap:scene.heap,renderer:scene.renderer,gpuEstimate:scene.gpuEstimate,dataset:scene.canvas.dataset};}
try{
 for(let cycle=0;cycle<=5;cycle++){
  const map=inventory.maps.find(m=>m.id===['the-claim','e1-dry-gulch','e1-twin-banks','e1-night-shift','the-claim','e1-dry-gulch'][cycle]);
  const row={cycle,warmup:cycle===0,map:map.id,before:host()};
  try{
   await boot(page,env.base,map,'full','wave1');row.run=await reading();
   await page.evaluate(()=>document.querySelector('[data-testid="pause-back-to-town"]')?.click());
   await page.waitForFunction(()=>window.__GR_TOWN_DIAGNOSTICS__,null,{timeout:30000});row.townAfterRun=await reading();
   await page.getByTestId('town-exit').click();await page.getByTestId('start-menu-enter-town').click();await page.waitForFunction(()=>window.__GR_TOWN_DIAGNOSTICS__,null,{timeout:30000});row.townAfterReload=await reading();row.status='measured';
  }catch(e){row.status='failed';row.failure=String(e);}
  row.after=host();result.cycles.push(row);result.errors=errors;await write('memory.json',result);console.log(`cycle ${cycle} ${map.id}: ${row.status} ${row.failure??''}`);
 }
 // The same-document repetition is the leak-sensitive control, not a sequence of hard reloads.
 result.sameDocument=[];
 for(let cycle=0;cycle<=5;cycle++){
  await page.getByTestId('town-exit').click();await page.getByTestId('start-menu-enter-town').click();await page.waitForFunction(()=>window.__GR_TOWN_DIAGNOSTICS__,null,{timeout:30000});
  result.sameDocument.push({cycle,warmup:cycle===0,...await reading()});await write('memory.json',result);
 }
 await page.screenshot({path:new URL('../../artifacts/perf-survey/town-memory.png',import.meta.url).pathname});
}finally{await cdp.detach();await context.close();await env.close();}
