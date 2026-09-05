import {launch,pageFor,boot,snapshot,read,write,host} from './browser.mjs';
const inventory=await read('inventory.json'),env=await launch();const result={at:new Date().toISOString(),method:'One warm cycle then five measured cycles; full tier 390x844 DPR1. CDP forces GC before retained heap readings. Native town->run and contract transitions reload the document; run->town and town->menu->town call application dispose in the same document.',cycles:[]};
const {page,context,errors}=await pageFor(env.browser,{width:390,height:844});await page.addInitScript(()=>globalThis.__SURVEY_DOCUMENT_ID__=crypto.randomUUID());
const cdp=await context.newCDPSession(page);
// The start menu tears the run scene down, so a reading taken there has no perspective scene to
// walk. Heap after a forced GC is still the number the leak question needs, so degrade to it
// rather than failing the cycle. documentId proves whether the step reloaded the document.
async function reading(label){
 await page.waitForTimeout(2000);await cdp.send('HeapProfiler.collectGarbage');
 const documentId=await page.evaluate(()=>globalThis.__SURVEY_DOCUMENT_ID__??null).catch(()=>null);
 const heapOnly=await page.evaluate(()=>performance.memory?.usedJSHeapSize??null).catch(()=>null);
 const hasScene=await page.evaluate(()=>Boolean(globalThis.__PERF_SURVEY__?.scene)).catch(()=>false);
 if(!hasScene)return {label,documentId,heap:heapOnly,renderer:null,gpuEstimate:null,dataset:null,sceneWalked:false};
 try{const scene=await snapshot(page);return {label,documentId,heap:scene.heap,renderer:scene.renderer,gpuEstimate:scene.gpuEstimate,dataset:scene.canvas.dataset,sceneWalked:true};}
 catch(e){return {label,documentId,heap:heapOnly,renderer:null,gpuEstimate:null,dataset:null,sceneWalked:false,snapshotError:String(e)};}
}
try{
 for(let cycle=0;cycle<=5;cycle++){
  const map=inventory.maps.find(m=>m.id===['the-claim','e1-dry-gulch','e1-twin-banks','e1-night-shift','the-claim','e1-dry-gulch'][cycle]);
  const row={cycle,warmup:cycle===0,map:map.id,before:host()};
  try{
   await boot(page,env.base,map,'full','wave1');row.run=await reading('run');
   // The pause menu must be OPENED before its Back-to-Town chip exists (Hud.ts:552 hides pauseMeta
   // while unpaused), and that chip lands on the START MENU, not the town. Both were wrong before.
   // The HUD pause BUTTON is the reliable seam: keyboard pause needs canvas focus and can be
   // swallowed by a story card. Both keys and the button reach the same InputController action.
   await page.getByTestId('hud-pause').click({timeout:20000});
   await page.waitForSelector('[data-testid="pause-back-to-town"]',{state:'visible',timeout:20000});
   await page.getByTestId('pause-back-to-town').click();
   await page.waitForSelector('[data-testid="start-menu-enter-town"]',{state:'visible',timeout:20000});
   row.menuAfterRun=await reading('menu-after-run');
   await page.getByTestId('start-menu-enter-town').click();
   await page.waitForFunction(()=>window.__GR_TOWN_DIAGNOSTICS__,null,{timeout:40000});row.townAfterRun=await reading('town-after-run');
   await page.getByTestId('town-exit').click();await page.waitForSelector('[data-testid="start-menu-enter-town"]',{state:'visible',timeout:20000});await page.getByTestId('start-menu-enter-town').click();await page.waitForFunction(()=>window.__GR_TOWN_DIAGNOSTICS__,null,{timeout:40000});row.townAfterReload=await reading('town-after-menu-round-trip');row.status='measured';
  }catch(e){row.status='failed';row.failure=String(e);}
  row.after=host();result.cycles.push(row);result.errors=errors;await write('memory.json',result);console.log(`cycle ${cycle} ${map.id}: ${row.status} run=${row.run?.heap} menu=${row.menuAfterRun?.heap} town=${row.townAfterRun?.heap} town2=${row.townAfterReload?.heap} ${row.failure??''}`);
 }
 // The same-document repetition is the leak-sensitive control, not a sequence of hard reloads.
 // Runs even when the cycle arm failed: it is the arm that actually answers the leak question.
 result.sameDocument=[];
 try{
  await page.waitForFunction(()=>window.__GR_TOWN_DIAGNOSTICS__,null,{timeout:5000}).catch(async()=>{
   await page.goto(`${env.base}/?debug&tier=full`,{waitUntil:'domcontentloaded',timeout:60000});
   await page.getByTestId('start-menu-enter-town').click({timeout:30000});
   await page.waitForFunction(()=>window.__GR_TOWN_DIAGNOSTICS__,null,{timeout:40000});
  });
  result.sameDocument.push({cycle:-1,warmup:true,label:'town entered',...await reading('town')});
  for(let cycle=0;cycle<=5;cycle++){
   await page.getByTestId('town-exit').click();await page.waitForSelector('[data-testid="start-menu-enter-town"]',{state:'visible',timeout:20000});await page.getByTestId('start-menu-enter-town').click();await page.waitForFunction(()=>window.__GR_TOWN_DIAGNOSTICS__,null,{timeout:40000});
   result.sameDocument.push({cycle,warmup:cycle===0,...await reading('town')});await write('memory.json',result);
   console.log(`sameDocument cycle ${cycle}: heap=${result.sameDocument.at(-1).heap}`);
  }
 }catch(e){result.sameDocumentFailure=String(e);await write('memory.json',result);console.log('sameDocument failed: '+e);}
 await page.screenshot({path:new URL('../../artifacts/perf-survey/town-memory.png',import.meta.url).pathname});
}finally{await cdp.detach();await context.close();await env.close();}
