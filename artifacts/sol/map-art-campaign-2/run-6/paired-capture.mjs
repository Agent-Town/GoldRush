// Evidence only: exact saved source for before, ordinary source for after.
// Plain captures have no debug flag or added diagnostic handles. Masks are labelled.
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const id=process.env.MAP, mode=process.env.MODE??'plain';
assert.ok(id);assert.ok(['plain','stations','performance'].includes(mode));
const out=`artifacts/sol/map-art-campaign-2/run-6/${id}`;
const raw=`artifacts/sol/map-art-campaign-2/_raw/run-6/${id}-before`;
const config=JSON.parse(readFileSync(`${out}/capture-config.json`,'utf8'));
const base='http://127.0.0.1:5303',rows=[];
const browser=await chromium.launch({channel:'chromium'});
const keep='#game-canvas,.hud-panel,.hud-panel *,.hud-pause,.hud-pause *,.world-info-note,.world-info-note *,#touch-controls,#touch-controls *';
try {for(const width of [1280,390])for(let cycle=0;cycle<(mode==='performance'?4:1);cycle++)for(const arm of (process.env.ARM?[process.env.ARM]:(cycle%2?['after','before']:['before','after']))){
 const page=await browser.newPage({viewport:{width,height:width===390?844:800},isMobile:width===390,hasTouch:width===390,deviceScaleFactor:1});
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 const errors=[];page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE ERROR',e.message)});
 for(const source of ['Terrain3dClaimPilot','Water'])await page.route(`**/src/world/${source}.ts*`,async route=>{
  const response=await route.fetch();const live=await response.text();let body=arm==='before'?readFileSync(`${raw}/${source}.js`,'utf8'):live;
  // Vite may re-optimize dependencies after the baseline capture; source bytes
  // stay frozen, but the optimizer URL must resolve to today's identical module.
  const deps=new Map([...live.matchAll(/\/node_modules\/\.vite\/deps\/([^?"']+)\?v=[a-f0-9]+/g)].map(m=>[m[1],m[0]]));
  body=body.replace(/\/node_modules\/\.vite\/deps\/([^?"']+)\?v=[a-f0-9]+/g,(url,file)=>deps.get(file)??url);
  if(mode==='stations'&&source==='Terrain3dClaimPilot'){
   assert.equal(body.split('model.name = mount.id;').length,2);
   body=body.replace('nextPanorama.name = mount.id;', "nextPanorama.name = mount.id; (window.__ART_MODELS__??=new Map()).set('panorama',nextPanorama);");
   body=body.replace('model.name = mount.id;','model.name = mount.id; (window.__ART_MODELS__??=new Map()).set(mount.id,model);window.__ART_THREE__=THREE;');
  }
  await route.fulfill({response,body});
 });
 if(arm==='before')for(const asset of config.assets??[])await page.route(`**/${asset.name}*`,route=>{
  const u=new URL(route.request().url());
  if(u.searchParams.has('import')||u.searchParams.has('url'))return route.continue();
  return route.fulfill({body:readFileSync(`${raw}/${asset.name}`),contentType:asset.type});
 });
 if(mode==='plain'){
  await page.goto(base);await page.evaluate(async id=>{(await import('/src/meta/ContractUnlock.ts')).setPreviewUnlockAll(true);(await import('/src/meta/ContractFamilies.ts')).stagePlayerContractLaunch(id)},id);
 }
 await page.goto(`${base}/?${mode==='plain'?'':`debug&epoch=${config.epoch}&nowaves&nolevel&nokill&nopause&tier=full&`}contract=${id}&seed=map-art-campaign-2`);
 await page.waitForFunction(()=>document.querySelector('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState==='mounted');
 const begin=page.getByTestId('contract-briefing-dismiss');if(await begin.isVisible())await begin.click({timeout:2000}).catch(async e=>{if(await begin.isVisible())throw e});
 assert.equal(await page.evaluate(()=>window.__THREE_GAME_DIAGNOSTICS__.contract.activeId),id);
 if(mode==='plain'){
  await page.waitForFunction(()=>window.__THREE_GAME_DIAGNOSTICS__.timeAlive>=10);
  await page.screenshot({path:`${out}/${arm}-plain-${width}.png`});
  const state=await page.evaluate(()=>({diagnostics:window.__THREE_GAME_DIAGNOSTICS__,dataset:{...document.querySelector('#game-canvas').dataset},testHook:typeof window.__GR_TEST__}));
  assert.equal(state.testHook,'undefined');assert.ok(state.diagnostics.timeAlive<11.5);assert.equal(state.dataset.terrain3dPilotRenderSource,'glb');
  rows.push({width,arm,state,errors});
 }else{
  await page.evaluate(()=>{window.__GR_TEST__.setManualSim(true);window.__GR_GUI__?.hide()});await page.waitForTimeout(1500);
  assert.equal(await page.evaluate(()=>window.__THREE_GAME_DIAGNOSTICS__.performance.runtimeVerdict),0);
  if(mode==='performance'){
   const stats=await page.evaluate(async()=>{
    const frames=[],calls=[],triangles=[];let last=performance.now();await new Promise(resolve=>{const tick=now=>{frames.push(now-last);last=now;calls.push(window.__THREE_GAME_DIAGNOSTICS__.renderer.calls);triangles.push(window.__THREE_GAME_DIAGNOSTICS__.renderer.triangles);if(frames.length<180)requestAnimationFrame(tick);else resolve()};requestAnimationFrame(tick)});
    const sorted=[...frames].sort((a,b)=>a-b);return {frames,calls,triangles,p95:sorted[Math.floor(.95*sorted.length)]};
   });rows.push({width,arm,cycle,...stats,errors});console.log(width,cycle,arm,stats.p95,[...new Set(stats.calls)]);
  }else{
   await page.screenshot({path:`${out}/${arm}-frozen-${width}.png`});
   for(const [focus,station,x,z,stationArm] of config.stations){
    if(stationArm && stationArm!==arm)continue;
    await page.evaluate(({x,z})=>window.__GR_TEST__.teleport(x,z),{x,z});await page.waitForTimeout(900);
    const prefix=`${out}/station-${arm}-${focus}-${station}-${width}`;
    const state=await page.evaluate(focus=>{
     const model=window.__ART_MODELS__.get(focus),T=window.__ART_THREE__;if(!model)throw Error('missing '+focus);
     model.updateWorldMatrix(true,true);const box=new T.Box3().setFromObject(model),corners=[];
     for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z])corners.push(window.__GR_TEST__.screenPoint(x,z,y));
     return {hero:window.__THREE_GAME_DIAGNOSTICS__.heroPos,bounds:{min:box.min.toArray(),max:box.max.toArray(),corners},materials:JSON.parse(document.querySelector('#game-canvas').dataset.terrain3dPilotLandmarkMaterials)};
    },focus);
    await page.screenshot({path:prefix+'-normal.png'});
    const noHud=await page.addStyleTag({content:'body *{visibility:hidden!important}#game-canvas{visibility:visible!important}'});
    await page.screenshot({path:prefix+'-body.png'});
    await page.evaluate(focus=>window.__ART_MODELS__.get(focus).traverse(n=>{if(n.isMesh){n.userData.savedMaterial=n.material;n.material=new window.__ART_THREE__.MeshBasicMaterial({color:0xff00ff,side:2})}}),focus);
    await page.screenshot({path:prefix+'-mask.png'});await noHud.evaluate(n=>n.remove());
    const persistent=await page.addStyleTag({content:`body *{visibility:hidden!important}${keep}{visibility:visible!important}`});
    await page.screenshot({path:prefix+'-persistent-mask.png'});await persistent.evaluate(n=>n.remove());
    await page.evaluate(focus=>window.__ART_MODELS__.get(focus).traverse(n=>{if(n.isMesh&&n.userData.savedMaterial){n.material.dispose();n.material=n.userData.savedMaterial;delete n.userData.savedMaterial}}),focus);
    if(((id==='e4-gusher-county'&&focus==='county-camp-rig')||config.actorMaskAtEntry)&&station==='entry'){
     const hide=await page.addStyleTag({content:'body *{visibility:hidden!important}#game-canvas{visibility:visible!important}'});
     await page.evaluate(focus=>{
      let scene=window.__ART_MODELS__.get(focus);while(scene.parent)scene=scene.parent;
      const hero=scene.getObjectByName('HomesteaderHero');if(!hero)throw Error('hero missing');window.__ART_HERO__=[];
      hero.traverse(n=>{if(n.isSprite){const old=n.material,m=old.clone();m.onBeforeCompile=(shader,renderer)=>{old.onBeforeCompile(shader,renderer);shader.fragmentShader=shader.fragmentShader.replace('outgoingLight = diffuseColor.rgb;', 'outgoingLight = vec3(1.0,0.0,1.0);')};m.customProgramCacheKey=()=>old.customProgramCacheKey()+'|actor-mask';m.toneMapped=false;m.fog=false;n.material=m;window.__ART_HERO__.push([n,old]);}});
     },focus);
     await page.screenshot({path:prefix+'-hero-visible.png'});
     await page.evaluate(()=>window.__ART_HERO__.forEach(([n])=>{n.material.depthTest=false;n.material.needsUpdate=true}));
     await page.screenshot({path:prefix+'-hero-unoccluded.png'});
     await page.evaluate(()=>window.__ART_HERO__.forEach(([n,old])=>{n.material.dispose();n.material=old}));await hide.evaluate(n=>n.remove());
    }
    rows.push({width,arm,focus,station,...state,errors});
   }
  }
 }
 assert.deepEqual(errors,[]);writeFileSync(`${out}/${mode}-paired.json`,JSON.stringify(rows,null,2)+'\n');console.log(mode,width,arm,'PASS');await page.close();
}}finally{await browser.close()}
