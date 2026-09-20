// Actual pre-change Vite response versus current source, four interleaved boots per arm.
import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const before=readFileSync('artifacts/sol/map-art-campaign-2/_raw/run-3/NightShift-baseline-vite.js','utf8');
const out='artifacts/sol/map-art-campaign-2/run-3/e1-night-shift/performance-paired.json';
const browser=await chromium.launch({channel:'chromium'}),rows=[];
try{for(const width of [1280,390])for(let cycle=0;cycle<4;cycle++)for(const arm of (cycle%2?['after','before']:['before','after'])){
 const page=await browser.newPage({viewport:{width,height:width===390?844:800},isMobile:width===390,hasTouch:width===390,deviceScaleFactor:1});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 const errors=[];page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push(e.message));
 if(arm==='before')await page.route('**/src/world/Terrain3dClaimPilot.ts*',route=>route.fulfill({body:before,contentType:'application/javascript'}));
 await page.goto('http://127.0.0.1:5303/?debug&contract=e1-night-shift&seed=map-art-campaign-2&nowaves&nolevel&nokill&nopause&tier=full');
 await page.waitForFunction(()=>window.__GR_TEST__&&document.querySelector('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState==='mounted');
 if(await page.getByTestId('contract-briefing-dismiss').isVisible())await page.getByTestId('contract-briefing-dismiss').click();
 await page.evaluate(()=>{window.__GR_TEST__.setManualSim(true);window.__GR_GUI__?.hide()});await page.waitForTimeout(1500);
 const stats=await page.evaluate(async()=>{
  const frames=[];let last=performance.now();await new Promise(resolve=>{const tick=now=>{frames.push(now-last);last=now;if(frames.length<180)requestAnimationFrame(tick);else resolve()};requestAnimationFrame(tick)});
  const s=[...frames].sort((a,b)=>a-b);return {frames,p95:s[Math.floor(.95*s.length)],renderer:window.__GR_TEST__.renderCensus().renderer,water:document.querySelector('#game-canvas').dataset.terrain3dPilotSculptWater??'absent'};
 });
 assert.equal(stats.water,arm==='before'?'absent':'living-water-quad');assert.deepEqual(errors,[]);
 rows.push({width,cycle,arm,...stats,errors});writeFileSync(out,JSON.stringify(rows,null,2)+'\n');console.log(width,cycle,arm,stats.p95,stats.renderer.calls);await page.close();
}}finally{await browser.close()}
