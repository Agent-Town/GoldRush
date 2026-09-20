// Four interleaved actual-source/asset runs per arm, retaining every frame.
import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const raw='artifacts/sol/map-art-campaign-2/_raw/run-3/e1-baron-before/';
const before=readFileSync(raw+'Terrain3dClaimPilot.js','utf8'),bodyBefore=readFileSync(raw+'oxblood_banners.glb');
const mode=process.env.PERF_MODE??'frozen';assert.ok(['frozen','volley'].includes(mode));
const out=`artifacts/sol/map-art-campaign-2/run-3/e1-baron/performance-${mode}-paired.json`;
const browser=await chromium.launch({channel:'chromium'}),rows=[];
try{for(const width of [1280,390])for(let cycle=0;cycle<4;cycle++)for(const arm of (cycle%2?['after','before']:['before','after'])){
 const page=await browser.newPage({viewport:{width,height:width===390?844:800},isMobile:width===390,hasTouch:width===390,deviceScaleFactor:1});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 const errors=[];let bodyRequests=0;page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/src/world/Terrain3dClaimPilot.ts*',async route=>{
  const response=await route.fetch();let body=arm==='before'?before:await response.text();
  assert.equal(body.split('model.name = mount.id;').length,2);
  body=body.replace('model.name = mount.id;',`model.name = mount.id; if(mount.id==='oxblood_banners')window.__BARON_STANDARDS__=model;`);
  await route.fulfill({response,body});
 });
 if(arm==='before')await page.route('**/oxblood_banners.glb*',async route=>{
  const url=new URL(route.request().url());
  if(url.searchParams.has('import')||url.searchParams.has('url'))return route.continue();
  bodyRequests++;await route.fulfill({body:bodyBefore,contentType:'model/gltf-binary'});
 });
 await page.goto('http://127.0.0.1:5303/?debug&contract=e1-baron&seed=map-art-campaign-2&nowaves&nolevel&nokill&nopause&tier=full');
 await page.waitForFunction(()=>window.__GR_TEST__&&document.querySelector('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState==='mounted');
 const begin=page.getByTestId('contract-briefing-dismiss');if(await begin.isVisible())await begin.click({timeout:2000}).catch(async e=>{if(await begin.isVisible())throw e});
 await page.evaluate(()=>{window.__GR_TEST__.setManualSim(true);window.__GR_GUI__?.hide()});await page.waitForTimeout(1500);
 if(mode==='volley'){
  await page.evaluate(()=>{
   const test=window.__GR_TEST__;
   for(const [key,value] of Object.entries({'sparkRig.damage':0,'sparkRig.range':0,'enemy.contactDamage':0}))if(!test.setBalance(key,value))throw Error(key);
   const rocket=test.activeContract().twist.baron.rocketVolley;
   Object.assign(rocket,{damage:11,radius:3,cadenceSeconds:2,telegraphSeconds:.25,airTime:.35,spreadRadius:.08});
   test.teleport(0,12);if(!test.placeFree('palisade',.8,12,0))throw Error('volley target');
   test.spawnPack(1,12,{eliteKind:'baron',hpScale:4,speedScale:.001,visualScale:4,banner:true,heroPursuitRange:45,buildingDamageScale:12,supportBuildingDamageScale:8});
   test.advanceSim(2.5);test.setManualSim(false);
  });
  await page.waitForTimeout(600);
 }
 const stats=await page.evaluate(async mode=>{
  const initialVolleys=window.__THREE_GAME_DIAGNOSTICS__.baronRocket.volleys;
  const calls=[],triangles=[];
  const frames=[];let last=performance.now();await new Promise(resolve=>{const tick=now=>{frames.push(now-last);last=now;calls.push(window.__THREE_GAME_DIAGNOSTICS__.renderer.calls);triangles.push(window.__THREE_GAME_DIAGNOSTICS__.renderer.triangles);if(frames.length<(mode==='volley'?360:180))requestAnimationFrame(tick);else resolve()};requestAnimationFrame(tick)});
  let dressingTriangles=0;window.__BARON_STANDARDS__.traverse(n=>{if(n.isMesh)dressingTriangles+=(n.geometry.index?.count??n.geometry.attributes.position.count)/3});
  const s=[...frames].sort((a,b)=>a-b);return {frames,p95:s[Math.floor(.95*s.length)],renderer:window.__GR_TEST__.renderCensus().renderer,dressingTriangles,calls,triangles,initialVolleys,finalVolleys:window.__THREE_GAME_DIAGNOSTICS__.baronRocket.volleys,performance:window.__THREE_GAME_DIAGNOSTICS__.performance};
 },mode);
 assert.equal(stats.performance.runtimeVerdict,0);if(mode==='volley')assert.ok(stats.finalVolleys>stats.initialVolleys);
 assert.equal(stats.dressingTriangles,arm==='before'?1500:2400);assert.equal(bodyRequests,arm==='before'?1:0);assert.deepEqual(errors,[]);
 rows.push({mode,width,cycle,arm,...stats,bodyRequests,errors});writeFileSync(out,JSON.stringify(rows,null,2)+'\n');console.log(width,cycle,arm,stats.p95,stats.renderer.calls);await page.close();
}}finally{await browser.close()}
