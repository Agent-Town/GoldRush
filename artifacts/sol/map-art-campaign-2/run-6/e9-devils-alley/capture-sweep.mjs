import {chromium} from '@playwright/test';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const out='artifacts/sol/map-art-campaign-2/run-6/e9-devils-alley',browser=await chromium.launch({channel:'chromium'}),rows=[];
try{for(const width of [1280,390]){
 const page=await browser.newPage({viewport:{width,height:width===390?844:800},isMobile:width===390,hasTouch:width===390});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.goto('http://127.0.0.1:5303/?contract=e9-devils-alley&nolevel&nopause&seed=da01&debug');
 await page.waitForFunction(()=>window.__GR_TEST__&&document.querySelector('#game-canvas').dataset.terrain3dPilotLandmarkLoadState==='mounted');
 const begin=page.getByTestId('contract-briefing-dismiss');if(await begin.isVisible())await begin.evaluate(b=>b.click());
 await page.evaluate(()=>{window.__GR_TEST__.setManualSim(true);window.__GR_TEST__.setBalance('enemy.contactDamage',0);window.__GR_GUI__?.hide()});
 let state;
 for(let i=0;i<120;i++){
  state=await page.evaluate(()=>window.__THREE_GAME_DIAGNOSTICS__.devilsAlleyPresentation);
  if(state.columnVisible&&state.routeId==='center-devil-sweep'&&Math.abs(state.columnAt.x)<5)break;
  await page.evaluate(()=>window.__GR_TEST__.advanceSim(2));
 }
 assert.ok(state.columnVisible&&state.routeId==='center-devil-sweep');
 await page.evaluate(at=>window.__GR_TEST__.teleport(at.x,at.z+10),state.columnAt);await page.waitForTimeout(1000);
 await page.screenshot({path:`${out}/later-center-sweep-${width}.png`});
 rows.push({width,state,diagnostics:await page.evaluate(()=>window.__THREE_GAME_DIAGNOSTICS__.devilsAlley),errors});assert.deepEqual(errors,[]);await page.close();
}}finally{await browser.close()}
writeFileSync(`${out}/later-sweep-proof.json`,JSON.stringify(rows,null,2)+'\n');console.log('Both later-state sweep captures passed');
