// Diagnostic-only same-page emissive comparison. Production source is not patched on disk.
import {chromium} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const id=process.env.MAP,focusId=process.env.FOCUS;
assert.ok(id&&focusId);
const root=`artifacts/sol/map-art-campaign-2/run-2/${id}${process.env.OUTPUT_SUBDIR ? "/"+process.env.OUTPUT_SUBDIR : ""}`;mkdirSync(root,{recursive:true});
const visualOnly=process.env.VISUAL_ONLY==='1';
const browser=await chromium.launch({channel:'chromium'}),rows=[];
try{for(const width of [1280,390]){
 console.log('OPEN',id,width); const page=await browser.newPage({viewport:{width,height:width===390?844:800},isMobile:width===390,hasTouch:width===390,deviceScaleFactor:1});
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 const errors=[];page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/src/world/Terrain3dClaimPilot.ts*',async route=>{
  const response=await route.fetch();let body=await response.text();const needle='material.emissiveIntensity = calibratedLandmarkIntensity(paint.intensity, contractId);';
  assert.equal(body.split(needle).length,2);
  body=body.replace(needle,needle+' (window.__LANDMARK_MATERIALS__ ??= new Set()).add(material);');
  body=body.replace('model.name = mount.id;', 'model.name = mount.id; (window.__ART_MODELS__ ??= new Map()).set(mount.id, model); window.__ART_MASK__ = (id,on) => { window.__ART_MODELS__.get(id).traverse(n => { if(!n.isMesh)return; if(on){n.userData.maskOriginal=n.material;n.material=new THREE.MeshBasicMaterial({color:0xff00ff,side:THREE.DoubleSide});}else if(n.userData.maskOriginal){n.material.dispose();n.material=n.userData.maskOriginal;delete n.userData.maskOriginal;} }); }; (window.__ART_BOUNDS__ ??= new Map()).set(mount.id, () => { const b = new THREE.Box3().setFromObject(model); return {min:b.min.toArray(),max:b.max.toArray()}; });');
  await route.fulfill({response,body});
 });
 await page.goto(`http://127.0.0.1:5303/?debug&epoch=epoch-7-signal&contract=${id}&seed=map-art-campaign-2&nowaves&nolevel&nokill&nopause&tier=full`);
 await page.waitForFunction(()=>window.__GR_TEST__&&document.querySelector('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState==='mounted');
 assert.equal(await page.evaluate(()=>window.__THREE_GAME_DIAGNOSTICS__.contract.activeId),id);
 if(await page.getByTestId('contract-briefing-dismiss').isVisible())await page.getByTestId('contract-briefing-dismiss').click({timeout:2000}).catch(async e=>{if(await page.getByTestId('contract-briefing-dismiss').isVisible())throw e});
 await page.evaluate(()=>{window.__GR_TEST__.setManualSim(true);window.__GR_GUI__?.hide()});
 console.log('READY',id,width); const mounts=await page.evaluate(()=>JSON.parse(document.querySelector('#game-canvas').dataset.terrain3dPilotLandmarkMounts));
 const focus=mounts.find(m=>m.id===focusId);assert.ok(focus);
 await page.evaluate(m=>window.__GR_TEST__.teleport(m.x,m.z+9),focus);await page.waitForTimeout(1000);
 // Diagnostic-only visibility; plain boots and framing stations retain the actual HUD.
 const diagnosticStyle='body * { visibility:hidden !important; } #game-canvas { visibility:visible !important; }';
 const runs=[];
 for(let cycle=0;cycle<(visualOnly?1:4);cycle++)for(const arm of ['before','after']){
  await page.evaluate(a=>{for(const m of window.__LANDMARK_MATERIALS__)m.emissiveIntensity=a==='before'?.45:.6},arm);await page.waitForTimeout(500);
  const stat=visualOnly ? {p95:null,renderer:await page.evaluate(()=>window.__GR_TEST__.renderCensus().renderer)} : await page.evaluate(async()=>{const samples=[];let last=performance.now();await new Promise(resolve=>{const next=now=>{samples.push(now-last);last=now;if(samples.length<180)requestAnimationFrame(next);else resolve()};requestAnimationFrame(next)});samples.sort((a,b)=>a-b);return {p95:samples[Math.floor(samples.length*.95)],renderer:window.__GR_TEST__.renderCensus().renderer}});
  runs.push({cycle,arm,...stat});if(!cycle){const style=await page.addStyleTag({content:diagnosticStyle});await page.screenshot({path:`${root}/${arm}-lighting-${width}.png`});await style.evaluate(n=>n.remove());}
 }
 const hiddenHud=await page.addStyleTag({content:diagnosticStyle});await page.evaluate(id=>window.__ART_MASK__(id,true),focusId);await page.screenshot({path:`${root}/lighting-mask-${width}.png`});await page.evaluate(id=>window.__ART_MASK__(id,false),focusId);
 await hiddenHud.evaluate(n=>n.remove());
 const stations=[];
 for(const offset of [{x:0,z:9},{x:0,z:0},{x:0,z:-6},{x:9,z:0}]){
  await page.evaluate(({m,d})=>window.__GR_TEST__.teleport(m.x+d.x,m.z+d.z),{m:focus,d:offset});await page.waitForTimeout(600);
  const framing=await page.evaluate(m=>{const ds=document.querySelector('#game-canvas').dataset;const side=JSON.parse(ds.terrain3dPilotLandmarkSides).mounts.find(r=>r.id===m.id);const b=window.__ART_BOUNDS__.get(m.id)();const corners=[];for(const x of [b.min[0],b.max[0]])for(const y of [b.min[1],b.max[1]])for(const z of [b.min[2],b.max[2]])corners.push(window.__GR_TEST__.screenPoint(x,z,y));return {bounds:b,corners,side,base:window.__GR_TEST__.screenPoint(m.x,m.z,side.baseY),top:window.__GR_TEST__.screenPoint(m.x,m.z,side.topY),hero:window.__THREE_GAME_DIAGNOSTICS__.heroRenderPos}},focus);
  await page.screenshot({path:`${root}/station-${offset.x}x${offset.z}z-${width}.png`}); await page.evaluate(id=>window.__ART_MASK__(id,true),focusId); await page.screenshot({path:`${root}/mask-${offset.x}x${offset.z}z-${width}.png`}); await page.evaluate(id=>window.__ART_MASK__(id,false),focusId); stations.push({offset,focus,...framing});
 }
 rows.push({width,runs,stations,errors});writeFileSync(`${root}/lighting-paired.json`,JSON.stringify(rows,null,2)+'\n');console.log(id,width,runs.map(r=>`${r.arm}:${r.p95?.toFixed(1)}/${r.renderer.calls}`).join(' '));assert.deepEqual(errors,[]);await page.close();
}}finally{await browser.close()}
