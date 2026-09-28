import { chromium } from '@playwright/test';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
const out = 'artifacts/sol/map-art-campaign-2/run-11/braid/e1-twin-banks';
const arm = process.argv[2] ?? 'before';
const base = 'http://127.0.0.1:5188';
if (arm === 'before') for (const name of ['Terrain','Terrain3dClaimPilot']) {
 if(existsSync(`${out}/baseline-${name}.js`))continue;
 const response = await fetch(`${base}/src/world/${name}.ts`);
 assert.equal(response.status,200);
 writeFileSync(`${out}/baseline-${name}.js`,await response.text());
}
// Rebase only Vite's optimized-dependency cache URL after a server restart; baseline source stays intact.
const dependencyVersion=(await(await fetch('http://127.0.0.1:5188/src/world/Terrain.ts')).text()).match(/three\.js(\?v=[^"]+)/)[1];
const transport=source=>source.replace(/(\/node_modules\/\.vite\/deps\/[^"\s?]+)\?v=[a-f0-9]+/g,'$1'+dependencyVersion);
const browser = await chromium.launch({channel:'chromium'});
const rows=[];
try { for (const width of [1280,390]) {
 const page=await browser.newPage({viewport:{width,height:width===390?844:800},isMobile:width===390,hasTouch:width===390,deviceScaleFactor:1});
 if(arm==='before')for(const name of ['Terrain','Terrain3dClaimPilot'])await page.route(`**/src/world/${name}.ts*`,route=>route.fulfill({body:transport(readFileSync(`${out}/baseline-${name}.js`,'utf8')),contentType:'application/javascript'}));
 page.setDefaultTimeout(60000); const errors=[];
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base); await page.waitForTimeout(2500);
 await page.evaluate(async()=>{(await import('/src/meta/ContractUnlock.ts')).setPreviewUnlockAll(true);(await import('/src/meta/ContractFamilies.ts')).stagePlayerContractLaunch('e1-twin-banks')});
 await page.goto(`${base}/?contract=e1-twin-banks&seed=hm-06`);
 await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.terrain3dPilotLandmarkLoadState==='mounted');
 const begin=page.getByTestId('contract-briefing-dismiss');if(await begin.isVisible())await begin.click();
 await page.waitForTimeout(1250);
 await page.screenshot({path:`${out}/${arm}-entry-glance-${width}.png`});
 await page.waitForFunction(()=>window.__THREE_GAME_DIAGNOSTICS__.timeAlive>=10);
 await page.screenshot({path:`${out}/${arm}-plain-${width}.png`});
 const plain=await page.evaluate(()=>({diagnostics:window.__THREE_GAME_DIAGNOSTICS__,dataset:{...document.querySelector('canvas').dataset},testHook:typeof window.__GR_TEST__}));
 assert.equal(plain.testHook,'undefined');
 await page.goto(`${base}/?debug&contract=e1-twin-banks&seed=hm-06&nowaves&nolevel&nokill&nopause&tier=full`);
 await page.waitForFunction(()=>window.__GR_TEST__&&document.querySelector('canvas')?.dataset.terrain3dPilotLandmarkLoadState==='mounted');
 const debugBegin=page.getByTestId('contract-briefing-dismiss');if(await debugBegin.isVisible())await debugBegin.click();
 await page.evaluate(()=>{window.__GR_TEST__.setManualSim(true);window.__GR_TEST__.teleport(0,12);window.__GR_GUI__?.hide()});
 await page.waitForTimeout(2500);
 const diagnostic=await page.evaluate(async()=>{
  const t=window.__GR_TEST__;const points=[[0,2],[0,-2],[0,0],[-7.5,.2],[7.4,-.25],[-16,0],[16,0],[-28,0]];
  const samples=points.map(([x,z])=>({x,z,height:t.terrainVisualY(x,z),sample:t.terrainSample(x,z)}));
  const frames=[];let last=performance.now();await new Promise(resolve=>{const tick=now=>{frames.push(now-last);last=now;if(frames.length<180)requestAnimationFrame(tick);else resolve()};requestAnimationFrame(tick)});
  return {samples,frames,p95:[...frames].sort((a,b)=>a-b)[171],renderer:t.renderCensus().renderer,dataset:{...document.querySelector('canvas').dataset}};
 });
 await page.screenshot({path:`${out}/${arm}-braid-${width}.png`});
 rows.push({arm,width,plain,diagnostic,errors});writeFileSync(`${out}/${arm}-capture.json`,JSON.stringify(rows,null,2));
 console.log(JSON.stringify({arm,width,errors,samples:diagnostic.samples,p95:diagnostic.p95,renderer:diagnostic.renderer}));
 assert.deepEqual(errors,[]);await page.close();
}}finally{await browser.close()}
