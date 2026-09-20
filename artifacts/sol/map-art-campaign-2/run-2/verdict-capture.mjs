// Evidence for verdict-only rows: identical production bytes in both arms, no source patch.
import {chromium} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const id=process.env.MAP;assert.ok(id);const out=`artifacts/sol/map-art-campaign-2/run-2/${id}`;mkdirSync(out,{recursive:true});
const base='http://127.0.0.1:5303';const browser=await chromium.launch({channel:'chromium'});const rows=[];
try{for(const width of [1280,390]){
 const page=await browser.newPage({viewport:{width,height:width===390?844:800},isMobile:width===390,hasTouch:width===390,deviceScaleFactor:1});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 const errors=[];page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push(e.message));
 const plain=[];
 for(const phase of ['before','after']){
  await page.goto(base);await page.evaluate(async id=>{(await import('/src/meta/ContractUnlock.ts')).setPreviewUnlockAll(true);(await import('/src/meta/ContractFamilies.ts')).stagePlayerContractLaunch(id)},id);
  await page.goto(`${base}/?contract=${id}&seed=map-art-campaign-2`);
  await page.waitForFunction(()=>window.__THREE_GAME_DIAGNOSTICS__?.frame>10);
  assert.equal(await page.evaluate(()=>window.__THREE_GAME_DIAGNOSTICS__.contract.activeId),id);
  const state=await page.evaluate(()=>document.querySelector('#game-canvas')?.dataset.terrain3dPilotState);
  if(state==='loading')await page.waitForFunction(()=>document.querySelector('#game-canvas')?.dataset.terrain3dPilotState!=='loading');
  const ready=await page.evaluate(()=>document.querySelector('#game-canvas')?.dataset.terrain3dPilotState==='ready');
  if(ready)await page.waitForFunction(()=>['mounted','none'].includes(document.querySelector('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState));
  if(await page.getByTestId('contract-briefing-dismiss').isVisible())await page.getByTestId('contract-briefing-dismiss').click();
  await page.waitForTimeout(3000);await page.screenshot({path:`${out}/${phase}-plain-${width}.png`});
  const snapshot=await page.evaluate(()=>({diagnostics:window.__THREE_GAME_DIAGNOSTICS__,dataset:{...document.querySelector('#game-canvas').dataset},testHook:typeof window.__GR_TEST__}));assert.equal(snapshot.testHook,'undefined');plain.push({phase,...snapshot});
 }
 const epoch=plain[0].diagnostics.contract.epochId;
 await page.goto(`${base}/?debug&epoch=${epoch}&contract=${id}&seed=map-art-campaign-2&nowaves&nolevel&nokill&nopause&tier=full`);
 await page.waitForFunction(()=>window.__GR_TEST__&&window.__THREE_GAME_DIAGNOSTICS__?.frame>10);assert.equal(await page.evaluate(()=>window.__THREE_GAME_DIAGNOSTICS__.contract.activeId),id);
 const pilot=plain[0].dataset.terrain3dPilotState;
 if(pilot==='ready')await page.waitForFunction(()=>['mounted','none'].includes(document.querySelector('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState));
 if(await page.getByTestId('contract-briefing-dismiss').isVisible())await page.getByTestId('contract-briefing-dismiss').click();
 await page.evaluate(()=>{window.__GR_TEST__.setManualSim(true);window.__GR_GUI__?.hide()});await page.waitForTimeout(600);
 const runs=[];
 for(let cycle=0;cycle<4;cycle++)for(const arm of ['before','after']){
  const stats=await page.evaluate(async()=>{const frames=[];let last=performance.now();await new Promise(resolve=>{const next=now=>{frames.push(now-last);last=now;if(frames.length<180)requestAnimationFrame(next);else resolve()};requestAnimationFrame(next)});const s=[...frames].sort((a,b)=>a-b);return {frames,p95:s[Math.floor(s.length*.95)],renderer:window.__GR_TEST__.renderCensus().renderer}});runs.push({cycle,arm,...stats});
 }
 rows.push({width,plain,runs,errors,comparison:'Verdict-only: both arms use identical source and asset bytes. Repeated samples measure current rendering and host variability; no improvement or causal regression is claimed.'});writeFileSync(`${out}/verdict-captures.json`,JSON.stringify(rows,null,2)+'\n');console.log(id,width,'pilot',pilot,'errors',errors.length,'p95',runs.map(r=>r.p95.toFixed(1)),'draws',runs.map(r=>r.renderer.calls));assert.deepEqual(errors,[]);await page.close();
}}finally{await browser.close()}
