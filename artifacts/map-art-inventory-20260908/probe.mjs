// Scoped read-only browser inventory. Uses the house dossier's door and mount checks.
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { resolveBase } from '../../rehearsal/base-url.mjs';
const out=resolve('artifacts/map-art-inventory-20260908');
const base=resolveBase('PROBE_BASE',{root:process.cwd()});
console.log('base',base);
const inventory=JSON.parse(readFileSync(`${out}/inventory.json`));
const wanted=process.env.ONLY?.split(',');
const stations=process.env.STATIONS==='1';const seen=new Set();
const maps=inventory.maps.filter(m=>(!wanted||wanted.includes(m.id))&&(!stations||(m.terrain&&!seen.has(m.terrain)&&seen.add(m.terrain))));
const browser=await chromium.launch({channel:'chromium'});
const mobile=process.env.MOBILE==='1';const shotDir=stations?'stations':mobile?'shots-mobile':'shots';
const results=[];mkdirSync(`${out}/${shotDir}`,{recursive:true});
for(const map of maps){
 const page=await browser.newPage({viewport:(mobile?{width:390,height:844}:{width:1280,height:800}),deviceScaleFactor:1,isMobile:mobile,hasTouch:mobile});
 const row={id:map.id,errors:[],warnings:[]}; const start=Date.now();
 page.on('pageerror',e=>row.errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')row.errors.push(m.text());if(m.type()==='warning')row.warnings.push(m.text())});
 try{
  await page.goto(`${base}/?debug&era=${map.era}&contract=${map.id}&nowaves&nolevel&nokill&nopause&tier=full&seed=art-inventory`);
  await page.waitForFunction(()=>window.__GR_TEST__&&window.__THREE_GAME_DIAGNOSTICS__?.frame>10,null,{timeout:45000});
  const begin=page.getByTestId('contract-briefing-dismiss');
  if(await begin.isVisible())await begin.click();
  row.door=await page.evaluate(()=>({diagnostics:window.__GR_CONTRACT_REGISTRY__.activeContractDiagnostics(),game:window.__GR_TEST__.activeContract().id}));
  if(row.door.game!==map.id)throw new Error(`Wrong map: ${row.door.game}`);
  await page.waitForFunction(()=>document.querySelector('#game-canvas')?.dataset.terrain3dPilotState!=='loading',null,{timeout:45000});
  if(map.terrain)await page.waitForFunction(()=>['mounted','off','lite'].includes(document.querySelector('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState),null,{timeout:30000});
  row.dataset=await page.locator('#game-canvas').evaluate(e=>Object.fromEntries(Object.entries(e.dataset).filter(([k])=>/terrain3d|run3d|assetLoading/.test(k))));
  row.status=map.terrain?(row.dataset.terrain3dPilotState==='ready'&&row.dataset.terrain3dPilotLandmarkLoadState==='mounted'?(Number(row.dataset.terrain3dPilotLandmarkSkipped)===0?'mounted':'incomplete-landmarks'):'demoted'):'no-sculpt-route';
  // Record overlays; the full viewport remains honest evidence of the normal debug boot.
  row.visibleText=(await page.locator('body').innerText()).slice(0,2000);
  row.shot=`${shotDir}/${map.id}.png`;await page.screenshot({path:`${out}/${row.shot}`});
  if(stations){
   row.stations=[];
   for(const mount of JSON.parse(row.dataset.terrain3dPilotLandmarkMounts??'[]')){
    await page.evaluate(({x,z})=>window.__GR_TEST__.teleport(x,z-6),mount);
    const frame=await page.evaluate(()=>window.__THREE_GAME_DIAGNOSTICS__.frame);
    await page.waitForFunction(f=>window.__THREE_GAME_DIAGNOSTICS__.frame>=f+6,frame,{timeout:10000});
    const shot=`stations/${map.id}--${mount.id}.png`;
    await page.screenshot({path:`${out}/${shot}`});row.stations.push({...mount,shot});
   }
  }
 }catch(e){row.status='failed';row.error=String(e)}
 row.ms=Date.now()-start;results.push(row);writeFileSync(`${out}/browser${stations?'-stations':''}${mobile?'-mobile':''}${wanted?'-focused':''}.json`,JSON.stringify(results,null,2));console.log(map.id,row.status,row.dataset?.terrain3dPilotLandmarks,row.errors.length,row.error??'');await page.close();
}
await browser.close();
