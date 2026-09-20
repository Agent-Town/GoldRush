// Plain entry captures at the same game clock, with the normal HUD and no test hook.
import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync,copyFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
const out='artifacts/sol/map-art-campaign-2/run-3/e1-baron',raw='artifacts/sol/map-art-campaign-2/_raw/run-3/e1-baron-before/';
const preserve='artifacts/sol/map-art-campaign-2/_raw/run-3/baron-first-plain-captures';mkdirSync(preserve,{recursive:true});
const before=readFileSync(raw+'Terrain3dClaimPilot.js','utf8'),bodyBefore=readFileSync(raw+'oxblood_banners.glb');
const browser=await chromium.launch({channel:'chromium'}),rows=[];
try{for(const width of [1280,390])for(const arm of ['before','after']){
 const page=await browser.newPage({viewport:{width,height:width===390?844:800},isMobile:width===390,hasTouch:width===390,deviceScaleFactor:1});page.setDefaultTimeout(120000);
 const errors=[];page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push(e.message));
 if(arm==='before'){
  await page.route('**/src/world/Terrain3dClaimPilot.ts*',route=>route.fulfill({body:before,contentType:'application/javascript'}));
  await page.route('**/oxblood_banners.glb*',async route=>{const url=new URL(route.request().url());if(url.searchParams.has('import')||url.searchParams.has('url'))return route.continue();await route.fulfill({body:bodyBefore,contentType:'model/gltf-binary'})});
 }
 await page.goto('http://127.0.0.1:5303');await page.evaluate(async()=>{(await import('/src/meta/ContractUnlock.ts')).setPreviewUnlockAll(true);(await import('/src/meta/ContractFamilies.ts')).stagePlayerContractLaunch('e1-baron')});
 await page.goto('http://127.0.0.1:5303/?contract=e1-baron&seed=map-art-campaign-2');
 await page.waitForFunction(()=>document.querySelector('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState==='mounted');
 const begin=page.getByTestId('contract-briefing-dismiss');if(await begin.isVisible())await begin.click({timeout:2000}).catch(async e=>{if(await begin.isVisible())throw e});
 await page.waitForFunction(()=>window.__THREE_GAME_DIAGNOSTICS__.timeAlive>=10);
 const shot=`${arm}-plain-${width}.png`;copyFileSync(`${out}/${shot}`,`${preserve}/${shot}`);
 await page.screenshot({path:`${out}/${shot}`});
 const state=await page.evaluate(()=>({diagnostics:window.__THREE_GAME_DIAGNOSTICS__,dataset:{...document.querySelector('#game-canvas').dataset},testHook:typeof window.__GR_TEST__,visibleText:document.body.innerText}));
 assert.equal(state.testHook,'undefined');assert.equal(state.diagnostics.contract.activeId,'e1-baron');assert.equal(state.dataset.terrain3dPilotRenderSource,'glb');assert.ok(state.diagnostics.timeAlive<11.5);assert.deepEqual(errors,[]);
 rows.push({arm,width,clockTarget:10,state,errors});writeFileSync(`${out}/plain-clock-pair.json`,JSON.stringify(rows,null,2)+'\n');console.log(width,arm,state.diagnostics.timeAlive);await page.close();
}}finally{await browser.close()}
