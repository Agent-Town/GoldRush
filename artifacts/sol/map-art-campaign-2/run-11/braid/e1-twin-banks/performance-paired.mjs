import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const out='artifacts/sol/map-art-campaign-2/run-11/braid/e1-twin-banks';
const dependencyVersion=(await(await fetch('http://127.0.0.1:5188/src/world/Terrain.ts')).text()).match(/three\.js(\?v=[^"]+)/)[1];
const transport=source=>source.replace(/(\/node_modules\/\.vite\/deps\/[^"\s?]+)\?v=[a-f0-9]+/g,'$1'+dependencyVersion);
const browser=await chromium.launch({channel:'chromium'}),rows=[];
try{for(const width of [1280,390])for(let cycle=0;cycle<3;cycle++)for(const arm of cycle%2?['after','before']:['before','after']){
 const page=await browser.newPage({viewport:{width,height:width===390?844:800},isMobile:width===390,hasTouch:width===390,deviceScaleFactor:1});
 if(arm==='before')for(const name of ['Terrain','Terrain3dClaimPilot'])await page.route(`**/src/world/${name}.ts*`,route=>route.fulfill({body:transport(readFileSync(`${out}/baseline-${name}.js`,'utf8')),contentType:'application/javascript'}));
 const errors=[];page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5188/?debug&contract=e1-twin-banks&seed=hm06-perf&nowaves&nolevel&nokill&nopause&tier=full');
 await page.waitForFunction(()=>window.__GR_TEST__&&document.querySelector('canvas')?.dataset.terrain3dPilotLandmarkLoadState==='mounted');
 const begin=page.getByTestId('contract-briefing-dismiss');if(await begin.isVisible())await begin.click();
 await page.waitForFunction(()=>window.__THREE_GAME_DIAGNOSTICS__.timeAlive>=6);
 await page.evaluate(()=>{window.__GR_TEST__.setBalance('camera.lag',.012);window.__GR_TEST__.teleport(0,12);window.__GR_GUI__?.hide()});await page.waitForTimeout(1200);
 await page.evaluate(()=>window.__GR_TEST__.setManualSim(true));await page.waitForTimeout(1800);
 const stats=await page.evaluate(async()=>{
  const frames=[];let last=performance.now();await new Promise(resolve=>{const tick=now=>{frames.push(now-last);last=now;if(frames.length<180)requestAnimationFrame(tick);else resolve()};requestAnimationFrame(tick)});
  const gl=document.querySelector('canvas').getContext('webgl2'), ext=gl.getExtension('WEBGL_debug_renderer_info');
  return {frames,p95:[...frames].sort((a,b)=>a-b)[171],frameMs:window.__THREE_GAME_DIAGNOSTICS__.frameMs,renderer:window.__GR_TEST__.renderCensus().renderer,gpu:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),center:window.__GR_TEST__.screenPoint(0,0,.3)};
 });
 assert.deepEqual(errors,[]);assert.ok(stats.center.inView);rows.push({arm,width,cycle,...stats,errors});writeFileSync(`${out}/performance-paired.json`,JSON.stringify(rows,null,2));console.log(JSON.stringify({arm,width,cycle,p95:stats.p95,calls:stats.renderer.calls}));await page.close();
}}finally{await browser.close()}
const summary=[1280,390].map(width=>{const pair={width};for(const arm of ['before','after']){const samples=rows.filter(r=>r.width===width&&r.arm===arm);pair[arm]={p95:samples.map(r=>r.p95).sort((a,b)=>a-b)[1],calls:samples.map(r=>r.renderer.calls).sort((a,b)=>a-b)[1],callRange:[...new Set(samples.map(r=>r.renderer.calls))].sort((a,b)=>a-b)}}pair.p95DeltaPercent=(pair.after.p95/pair.before.p95-1)*100;assert.ok(pair.p95DeltaPercent<=15);assert.ok(pair.after.calls<=pair.before.calls*1.15);return pair});writeFileSync(`${out}/performance-summary.json`,JSON.stringify(summary,null,2));console.log(JSON.stringify(summary));
