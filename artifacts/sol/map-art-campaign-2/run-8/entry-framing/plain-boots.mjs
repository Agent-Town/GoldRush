// Final acceptance boots: no routing, injected game handles, debug flags or test hooks.
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const root='artifacts/sol/map-art-campaign-2/run-8/entry-framing';
const maps=JSON.parse(readFileSync(`${root}/map-plan.json`)).map(row=>row[0]);
const browser=await chromium.launch({channel:'chromium'}), rows=[];
try {
 for(const id of maps)for(const width of [1280,390]){
  const page=await browser.newPage({viewport:{width,height:width===390?844:800},deviceScaleFactor:1,isMobile:width===390,hasTouch:width===390});
  const errors=[];page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push(e.message));
  page.setDefaultTimeout(120000);
  await page.goto('http://127.0.0.1:5303/');
  await page.evaluate(async id=>{(await import('/src/meta/ContractUnlock.ts')).setPreviewUnlockAll(true);(await import('/src/meta/ContractFamilies.ts')).stagePlayerContractLaunch(id)},id);
  await page.goto(`http://127.0.0.1:5303/?contract=${id}&seed=map-art-campaign-2`);
  await page.waitForFunction(()=>document.querySelector('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState==='mounted');
  const begin=page.getByTestId('contract-briefing-dismiss');if(await begin.isVisible())await begin.click();
  await page.waitForTimeout(1250);await page.screenshot({path:`${root}/${id}/plain-peak-${width}.png`});
  await page.waitForTimeout(3300);await page.screenshot({path:`${root}/${id}/plain-return-${width}.png`});
  const state=await page.evaluate(()=>({testHook:typeof window.__GR_TEST__,entryHandle:typeof window.__ENTRY_CONTEXT__,diagnostics:window.__THREE_GAME_DIAGNOSTICS__,dataset:{...document.querySelector('#game-canvas').dataset}}));
  assert.equal(state.testHook,'undefined');assert.equal(state.entryHandle,'undefined');assert.equal(state.diagnostics.contract.activeId,id);assert.deepEqual(errors,[]);
  rows.push({id,width,errors,state});writeFileSync(`${root}/plain-boots.json`,JSON.stringify(rows,null,2)+'\n');console.log(id,width,'zero errors');
  await page.close();
 }
} finally {await browser.close()}
