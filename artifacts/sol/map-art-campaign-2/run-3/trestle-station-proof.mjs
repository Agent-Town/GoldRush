// Isolate persistent HUD coverage while retaining normal-HUD reference captures.
import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const raw='artifacts/sol/map-art-campaign-2/_raw/run-3/e2-trestle-before/',out='artifacts/sol/map-art-campaign-2/run-3/e2-trestle';
const before=readFileSync(raw+'Terrain3dClaimPilot.js','utf8'),bodyBefore=readFileSync(raw+'mine-spur-kit.glb');
const keep='#game-canvas,.hud-panel,.hud-panel *,.hud-pause,.hud-pause *,.world-info-note,.world-info-note *,#touch-controls,#touch-controls *';
const allStations=[['trestle-crossing','entry',12,-18],['trestle-crossing',14,0,14],['trestle-crossing',9,0,9],['trestle-crossing',5,0,5],['south-boiler-site','entry',12,-18],['south-boiler-site',5,12,-7],['south-boiler-site',3,12,-9],['mine-spur-kit','entry',12,-18],['mine-spur-kit',5,-14,-13],['trestle-crossing',7,0,7],['mine-spur-kit',7,-14,-11],['mine-spur-kit',8,-14,-10],['south-approach-kit','entry',12,-18],['south-approach-kit',9,0,-13],['south-approach-kit',14,0,-8],['south-approach-kit',20,0,-2]];
const stations=allStations.filter(s=>process.env.EXTRA==='2'?(s[1]===8||s[0]==='south-approach-kit'):process.env.EXTRA?s[1]===7:(s[1]!==7&&s[1]!==8&&s[0]!=='south-approach-kit'));
const proofFile=out+(process.env.EXTRA==='2'?'/approach-station-proof.json':process.env.EXTRA?'/extra-station-proof.json':'/station-proof.json');
const arms=(process.env.ARMS??'before,after').split(',');
const rows=process.env.ARMS?JSON.parse(readFileSync(proofFile,'utf8')).filter(r=>!arms.includes(r.arm)):[];
const browser=await chromium.launch({channel:'chromium'});
try{for(const width of [1280,390])for(const arm of arms){
 const page=await browser.newPage({viewport:{width,height:width===390?844:800},isMobile:width===390,hasTouch:width===390,deviceScaleFactor:1});page.setDefaultTimeout(120000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.route('**/src/world/Terrain3dClaimPilot.ts*',async route=>{
  const response=await route.fetch();let body=arm==='before'?before:await response.text();
  body=body.replace('model.name = mount.id;',`model.name = mount.id; (window.__ART_MODELS__??=new Map()).set(mount.id,model);window.__ART_THREE__=THREE;`);
  await route.fulfill({response,body});
 });
 if(arm==='before')await page.route('**/mine-spur-kit.glb*',async route=>{const u=new URL(route.request().url());if(u.searchParams.has('import')||u.searchParams.has('url'))return route.continue();await route.fulfill({body:bodyBefore,contentType:'model/gltf-binary'})});
 await page.goto('http://127.0.0.1:5303/?debug&epoch=epoch-2-steamworks&contract=e2-trestle&seed=map-art-campaign-2&nowaves&nolevel&nokill&nopause&tier=full');
 await page.waitForFunction(()=>window.__GR_TEST__&&document.querySelector('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState==='mounted');
 const begin=page.getByTestId('contract-briefing-dismiss');if(await begin.isVisible())await begin.click({timeout:2000}).catch(async e=>{if(await begin.isVisible())throw e});
 assert.equal(await page.evaluate(()=>window.__THREE_GAME_DIAGNOSTICS__.contract.activeId),'e2-trestle');
 await page.evaluate(()=>{window.__GR_TEST__.setManualSim(true);window.__GR_GUI__?.hide()});
 for(const [focus,back,x,z] of stations){
  await page.evaluate(({x,z})=>window.__GR_TEST__.teleport(x,z),{x,z});await page.waitForTimeout(1500);
  const prefix=`${out}/station-${arm}-${focus}-${back}-${width}`;
  const state=await page.evaluate(({focus,arm})=>{
   const model=window.__ART_MODELS__.get(focus),T=window.__ART_THREE__,primary=[];
   model.updateWorldMatrix(true,true);

   const bodyBox=new T.Box3().setFromObject(model),bodyCorners=[];for(const x of [bodyBox.min.x,bodyBox.max.x])for(const y of [bodyBox.min.y,bodyBox.max.y])for(const z of [bodyBox.min.z,bodyBox.max.z])bodyCorners.push(window.__GR_TEST__.screenPoint(x,z,y));
   const bodyBounds={world:{min:bodyBox.min.toArray(),max:bodyBox.max.toArray()},corners:bodyCorners};
   let primaryBounds=null;
   if(primary.length){const b=new T.Box3().setFromPoints(primary),corners=[];for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])corners.push(window.__GR_TEST__.screenPoint(x,z,y));primaryBounds={world:{min:b.min.toArray(),max:b.max.toArray()},corners};}
   let scene=model;while(scene.parent)scene=scene.parent;const water=[];
   scene.traverse(n=>{if(['SculptLivingWater','terrain.river','terrain.ford'].includes(n.name)){let visible=true;for(let p=n;p;p=p.parent)visible&&=p.visible;water.push({name:n.name,visible,y:n.position.y,depthTest:n.material?.depthTest,depthWrite:n.material?.depthWrite})}});
   return {hero:window.__THREE_GAME_DIAGNOSTICS__.heroPos,performance:window.__THREE_GAME_DIAGNOSTICS__.performance,bodyBounds,primaryBounds,water,materials:JSON.parse(document.querySelector('#game-canvas').dataset.terrain3dPilotLandmarkMaterials),persistentSelector:'.hud-panel,.hud-pause,.world-info-note,#touch-controls'};
  },{focus,arm});
  assert.equal(state.performance.runtimeVerdict,0);for(const m of state.materials)assert.ok(m.emissiveIntensity[1]<=.6);
  assert.equal(state.water.filter(w=>w.visible).length,1);assert.equal(state.water.find(w=>w.visible).name,'SculptLivingWater');
  await page.screenshot({path:prefix+'-normal.png'});
  if(state.primaryBounds){await page.waitForTimeout(650);await page.screenshot({path:prefix+'-motion.png'});}
  const noHud=await page.addStyleTag({content:'body *{visibility:hidden!important}#game-canvas{visibility:visible!important}'});
  await page.screenshot({path:prefix+'-body.png'});await noHud.evaluate(n=>n.remove());
  await page.evaluate(focus=>window.__ART_MODELS__.get(focus).traverse(n=>{if(n.isMesh){n.userData.oldMaterial=n.material;n.material=new window.__ART_THREE__.MeshBasicMaterial({color:0xff00ff,side:2})}}),focus);
  const all=await page.addStyleTag({content:'body *{visibility:hidden!important}#game-canvas{visibility:visible!important}'});
  await page.screenshot({path:prefix+'-mask.png'});await all.evaluate(n=>n.remove());
  const persistent=await page.addStyleTag({content:`body *{visibility:hidden!important}${keep}{visibility:visible!important}`});
  await page.screenshot({path:prefix+'-persistent-mask.png'});await persistent.evaluate(n=>n.remove());
  await page.evaluate(focus=>window.__ART_MODELS__.get(focus).traverse(n=>{if(n.isMesh&&n.userData.oldMaterial){n.material.dispose();n.material=n.userData.oldMaterial;delete n.userData.oldMaterial}}),focus);
  rows.push({width,arm,focus,back,...state,errors});writeFileSync(proofFile,JSON.stringify(rows,null,2)+'\n');
 }
 assert.deepEqual(errors,[]);console.log(width,arm,'PASS');await page.close();
}}finally{await browser.close()}
