// Four interleaved actual-source/asset runs per arm, retaining every frame.
import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const raw='artifacts/sol/map-art-campaign-2/_raw/run-3/twin-baseline-transport/';
const before=readFileSync(raw+'Terrain3dClaimPilot.js','utf8'),bodyBefore=readFileSync(raw+'floodplain_dressing_pack.glb');
const out='artifacts/sol/map-art-campaign-2/run-3/e1-twin-banks/performance-paired.json';
const browser=await chromium.launch({channel:'chromium'}),rows=[];
try{for(const width of [1280,390])for(let cycle=0;cycle<4;cycle++)for(const arm of (cycle%2?['after','before']:['before','after'])){
 const page=await browser.newPage({viewport:{width,height:width===390?844:800},isMobile:width===390,hasTouch:width===390,deviceScaleFactor:1});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 const errors=[];let bodyRequests=0;page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/src/world/Terrain3dClaimPilot.ts*',async route=>{
  const response=await route.fetch();let body=arm==='before'?before:await response.text();
  assert.equal(body.split('model.name = mount.id;').length,2);
  body=body.replace('model.name = mount.id;',`model.name = mount.id; if(mount.id==='floodplain_dressing_pack')window.__TWIN_DRESSING__=model;`);
  await route.fulfill({response,body});
 });
 if(arm==='before')await page.route('**/floodplain_dressing_pack.glb*',async route=>{
  const url=new URL(route.request().url());
  if(url.searchParams.has('import')||url.searchParams.has('url'))return route.continue();
  bodyRequests++;await route.fulfill({body:bodyBefore,contentType:'model/gltf-binary'});
 });
 await page.goto('http://127.0.0.1:5303/?debug&contract=e1-twin-banks&seed=map-art-campaign-2&nowaves&nolevel&nokill&nopause&tier=full');
 await page.waitForFunction(()=>window.__GR_TEST__&&document.querySelector('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState==='mounted');
 const begin=page.getByTestId('contract-briefing-dismiss');if(await begin.isVisible())await begin.click({timeout:2000}).catch(async e=>{if(await begin.isVisible())throw e});
 await page.evaluate(()=>{window.__GR_TEST__.setManualSim(true);window.__GR_GUI__?.hide()});await page.waitForTimeout(1500);
 const stats=await page.evaluate(async()=>{
  const frames=[];let last=performance.now();await new Promise(resolve=>{const tick=now=>{frames.push(now-last);last=now;if(frames.length<180)requestAnimationFrame(tick);else resolve()};requestAnimationFrame(tick)});
  let dressingTriangles=0;window.__TWIN_DRESSING__.traverse(n=>{if(n.isMesh)dressingTriangles+=(n.geometry.index?.count??n.geometry.attributes.position.count)/3});
  const s=[...frames].sort((a,b)=>a-b);return {frames,p95:s[Math.floor(.95*s.length)],renderer:window.__GR_TEST__.renderCensus().renderer,dressingTriangles};
 });
 assert.equal(stats.dressingTriangles,arm==='before'?944:2384);assert.equal(bodyRequests,arm==='before'?1:0);assert.deepEqual(errors,[]);
 rows.push({width,cycle,arm,...stats,bodyRequests,errors});writeFileSync(out,JSON.stringify(rows,null,2)+'\n');console.log(width,cycle,arm,stats.p95,stats.renderer.calls);await page.close();
}}finally{await browser.close()}
