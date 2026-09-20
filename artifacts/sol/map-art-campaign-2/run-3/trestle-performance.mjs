// Four interleaved actual-source/asset runs per arm, retaining every frame.
import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const raw='artifacts/sol/map-art-campaign-2/_raw/run-3/e2-trestle-before/';
const before=readFileSync(raw+'Terrain3dClaimPilot.js','utf8'),bodyBefore=readFileSync(raw+'mine-spur-kit.glb');
const mode=process.env.PERF_MODE??'frozen';assert.ok(['frozen','crossing'].includes(mode));
const out=`artifacts/sol/map-art-campaign-2/run-3/e2-trestle/performance-${mode}-paired.json`;
const browser=await chromium.launch({channel:'chromium'}),rows=[];
try{for(const width of [1280,390])for(let cycle=0;cycle<4;cycle++)for(const arm of (cycle%2?['after','before']:['before','after'])){
 const page=await browser.newPage({viewport:{width,height:width===390?844:800},isMobile:width===390,hasTouch:width===390,deviceScaleFactor:1});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 const errors=[];let bodyRequests=0;page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/src/world/Terrain3dClaimPilot.ts*',async route=>{
  const response=await route.fetch();let body=arm==='before'?before:await response.text();
  assert.equal(body.split('model.name = mount.id;').length,2);
  body=body.replace('model.name = mount.id;',`model.name = mount.id; if(mount.id==='mine-spur-kit')window.__TRESTLE_STOCK__=model;`);
  await route.fulfill({response,body});
 });
 if(arm==='before')await page.route('**/mine-spur-kit.glb*',async route=>{
  const url=new URL(route.request().url());
  if(url.searchParams.has('import')||url.searchParams.has('url'))return route.continue();
  bodyRequests++;await route.fulfill({body:bodyBefore,contentType:'model/gltf-binary'});
 });
 await page.goto('http://127.0.0.1:5303/?debug&epoch=epoch-2-steamworks&contract=e2-trestle&mode=escort&seed=map-art-campaign-2&nowaves&nolevel&nokill&nopause&tier=full');
 await page.waitForFunction(()=>window.__GR_TEST__&&document.querySelector('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState==='mounted');
 const begin=page.getByTestId('contract-briefing-dismiss');if(await begin.isVisible())await begin.click({timeout:2000}).catch(async e=>{if(await begin.isVisible())throw e});
 await page.evaluate(()=>{window.__GR_TEST__.setManualSim(true);window.__GR_GUI__?.hide()});await page.waitForTimeout(1500);
 if(mode==='crossing'){
  await page.evaluate(async()=>{
   const test=window.__GR_TEST__,{Balance}=await import('/src/game/Balance.ts');
   for(const [key,value] of Object.entries({'sparkRig.damage':0,'sparkRig.range':0,'enemy.contactDamage':0}))if(!test.setBalance(key,value))throw Error(key);
   test.teleport(0,7);test.clearEnemies();test.setWave(6);
   const cart=test.escort();if(!cart.enabled||cart.state!=='moving')throw Error('escort must be moving');
   test.advanceSim(Math.max(0,(-3-cart.z)/Balance.contracts.escortCart.speed));
   test.spawnPack(8,7,{hpScale:4,speedScale:0,contactDamageScale:0});
   test.setManualSim(false);
  });
  await page.waitForTimeout(100);
 }
 const stats=await page.evaluate(async mode=>{
  const initialEscort=window.__GR_TEST__.escort();const initialWave=window.__THREE_GAME_DIAGNOSTICS__.wave;const initialEnemies=window.__GR_TEST__.enemyPositions().length;
  const calls=[],triangles=[];
  const frames=[];let last=performance.now();await new Promise(resolve=>{const tick=now=>{frames.push(now-last);last=now;calls.push(window.__THREE_GAME_DIAGNOSTICS__.renderer.calls);triangles.push(window.__THREE_GAME_DIAGNOSTICS__.renderer.triangles);if(frames.length<(mode==='crossing'?360:180))requestAnimationFrame(tick);else resolve()};requestAnimationFrame(tick)});
  let dressingTriangles=0;window.__TRESTLE_STOCK__.traverse(n=>{if(n.isMesh)dressingTriangles+=(n.geometry.index?.count??n.geometry.attributes.position.count)/3});
  const s=[...frames].sort((a,b)=>a-b);return {frames,p95:s[Math.floor(.95*s.length)],renderer:window.__GR_TEST__.renderCensus().renderer,dressingTriangles,calls,triangles,initialEscort,finalEscort:window.__GR_TEST__.escort(),initialWave,initialEnemies,performance:window.__THREE_GAME_DIAGNOSTICS__.performance};
 },mode);
 assert.equal(stats.performance.runtimeVerdict,0);if(mode==='crossing'){assert.equal(stats.initialEscort.state,'moving');assert.ok(stats.finalEscort.z>stats.initialEscort.z);assert.ok(stats.initialEnemies>=8);assert.equal(stats.initialWave,6);}
 assert.equal(stats.dressingTriangles,660);assert.equal(bodyRequests,arm==='before'?1:0);assert.deepEqual(errors,[]);
 rows.push({mode,width,cycle,arm,...stats,bodyRequests,errors});writeFileSync(out,JSON.stringify(rows,null,2)+'\n');console.log(width,cycle,arm,stats.p95,stats.renderer.calls);await page.close();
}}finally{await browser.close()}
