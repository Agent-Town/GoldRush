// Diagnostic-only old/new geometry swap; plain boots independently verify production.
import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
const id=process.env.MAP;assert.ok(['e8-mare-claim','e8-eclipse'].includes(id));
const out=`artifacts/sol/map-art-campaign-2/run-2/${id}`;mkdirSync(out,{recursive:true});
const original=readFileSync('artifacts/sol/map-art-campaign-2/_raw/run-2/mare-original/air-pad-dome.glb').toString('base64');
const browser=await chromium.launch({channel:'chromium'}),rows=[];
try {for(const width of [1280,390]) {
 const page=await browser.newPage({viewport:{width,height:width===390?844:800},isMobile:width===390,hasTouch:width===390,deviceScaleFactor:1});
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);const errors=[];
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/src/world/Terrain3dClaimPilot.ts*',async route=>{const response=await route.fetch();let body=await response.text();const needle='model.name = mount.id;';assert.equal(body.split(needle).length,2);body=body.replace(needle,needle+' if(mount.id.includes("air-pad-dome")){ (window.__DOMES__ ??= []).push(model); window.__DOME_LOADER__=loader; }');await route.fulfill({response,body});});
 await page.goto(`http://127.0.0.1:5303/?debug&epoch=epoch-8-orbital&contract=${id}&seed=map-art-campaign-2&nowaves&nolevel&nokill&nopause&tier=full`);
 await page.waitForFunction(()=>window.__GR_TEST__&&document.querySelector('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState==='mounted');
 assert.equal(await page.evaluate(()=>window.__THREE_GAME_DIAGNOSTICS__.contract.activeId),id);
 if(await page.getByTestId('contract-briefing-dismiss').isVisible())await page.getByTestId('contract-briefing-dismiss').click();
 const proof=await page.evaluate(async encoded=>{
  window.__GR_TEST__.setManualSim(true);window.__GR_GUI__?.hide();window.__GR_TEST__.teleport(0,9);
  const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));const gltf=await new Promise((res,rej)=>window.__DOME_LOADER__.parse(bytes.buffer,'',res,rej));
  const old=new Map();gltf.scene.traverse(n=>{if(n.isMesh)old.set(n.material.name,n.geometry)});
  const proof=[];window.__DOME_PAIRS__=[];
  for(const model of window.__DOMES__)model.traverse(n=>{if(!n.isMesh)return;const geo=old.get(n.material.name);if(!geo)throw Error('Missing original primitive '+n.material.name);window.__DOME_PAIRS__.push({mesh:n,before:geo.clone(),after:n.geometry});proof.push({mount:model.name,material:n.material.name,before:geo.index.count/3,after:n.geometry.index.count/3});});
  return proof;
 },original);assert.equal(proof.length,6);
 const runs=[];
 for(let cycle=0;cycle<4;cycle++)for(const arm of ['before','after']){
  await page.evaluate(a=>{for(const p of window.__DOME_PAIRS__)p.mesh.geometry=p[a]},arm);await page.waitForTimeout(500);
  const result=await page.evaluate(async()=>{const frames=[];let last=performance.now();await new Promise(resolve=>{function next(now){frames.push(now-last);last=now;if(frames.length<180)requestAnimationFrame(next);else resolve()}requestAnimationFrame(next)});const sorted=[...frames].sort((a,b)=>a-b);return {frames,p95:sorted[Math.floor(sorted.length*.95)],renderer:window.__GR_TEST__.renderCensus().renderer}});runs.push({cycle,arm,...result});
  if(!cycle){await page.screenshot({path:`${out}/${arm}-dome-station-${width}.png`});const style=await page.addStyleTag({content:'body * { visibility:hidden !important; } #game-canvas { visibility:visible !important; }'});await page.screenshot({path:`${out}/${arm}-dome-detail-${width}.png`});await style.evaluate(n=>n.remove());}
 }
 rows.push({width,station:{x:0,z:9},proof,runs,errors,fixture:'Same production materials, transforms and atlas. Each mount has separate old/new geometry, both retained throughout measurement. Manual simulation, fixed camera, normal HUD during timing.'});writeFileSync(`${out}/dome-paired.json`,JSON.stringify(rows,null,2)+'\n');console.log(id,width,runs.map(r=>`${r.arm}:${r.p95.toFixed(2)}/${r.renderer.calls}/${r.renderer.triangles}`).join(' '));assert.deepEqual(errors,[]);await page.close();
}}finally{await browser.close()}
