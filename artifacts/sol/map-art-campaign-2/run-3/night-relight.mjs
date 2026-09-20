// Supplementary lit-state evidence, explicitly debug, with real seven authored fixtures.
import {chromium} from '@playwright/test';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const phase=process.env.PHASE??'before',out='artifacts/sol/map-art-campaign-2/run-3/e1-night-shift';
const browser=await chromium.launch({channel:'chromium'}),rows=[];
try{for(const width of [1280,390]){
 const page=await browser.newPage({viewport:{width,height:width===390?844:800},isMobile:width===390,hasTouch:width===390,deviceScaleFactor:1});page.setDefaultTimeout(120000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.goto('http://127.0.0.1:5303/?debug&contract=e1-night-shift&seed=map-art-campaign-2&nowaves&nolevel&nokill&nopause&tier=full');
 await page.waitForFunction(()=>window.__GR_TEST__&&document.querySelector('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState==='mounted');
 if(await page.getByTestId('contract-briefing-dismiss').isVisible())await page.getByTestId('contract-briefing-dismiss').click();
 const state=await page.evaluate(()=>{
   const api=window.__GR_TEST__;api.setManualSim(true);window.__GR_GUI__?.hide();api.setWave(10);api.grantGold(56);
   const cold=window.__THREE_GAME_DIAGNOSTICS__.build.hp.filter(b=>b.id==='lantern_post');
   const repairs=cold.map(b=>{api.teleport(b.position.x,b.position.z);return api.repair('lantern_post',b.index)});
   api.teleport(8,23);return {cold,repairs};
 });
 await page.waitForTimeout(1200);await page.screenshot({path:`${out}/${phase}-relit-${width}.png`});
 const diagnostics=await page.evaluate(()=>({lighting:window.__THREE_GAME_DIAGNOSTICS__.lighting,build:window.__THREE_GAME_DIAGNOSTICS__.build,hero:window.__THREE_GAME_DIAGNOSTICS__.heroPos,dataset:{...document.querySelector('#game-canvas').dataset}}));
 rows.push({width,state,diagnostics,errors});writeFileSync(`${out}/${phase}-relit.json`,JSON.stringify(rows,null,2)+'\n');
 assert.equal(state.cold.length,7);assert.ok(state.cold.every(b=>b.wrecked));assert.ok(state.repairs.every(Boolean));assert.deepEqual(errors,[]);
 console.log(phase,width,'seven true repairs',errors);await page.close();
}}finally{await browser.close()}
