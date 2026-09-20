// Labelled river diagnostics. A shader mask retains real water alpha/depth geography.
import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const out='artifacts/sol/map-art-campaign-2/run-3/e1-twin-banks',raw='artifacts/sol/map-art-campaign-2/_raw/run-3/twin-baseline-transport/';
const oldSource=readFileSync(raw+'Terrain3dClaimPilot.js','utf8'),oldBody=readFileSync(raw+'floodplain_dressing_pack.glb');
const browser=await chromium.launch({channel:'chromium'}),rows=[];
try{for(const width of [1280,390])for(const arm of ['before','after']){
 const page=await browser.newPage({viewport:{width,height:width===390?844:800},isMobile:width===390,hasTouch:width===390,deviceScaleFactor:1});page.setDefaultTimeout(120000);
 const errors=[];page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/src/world/Terrain3dClaimPilot.ts*',async route=>{
  const response=await route.fetch();let body=arm==='before'?oldSource:await response.text();
  const seam='const nextChannelWater = createChannelWater(host.contractId, selected.contract, heightAt);';assert.equal(body.split(seam).length,2);
  body=body.replace(seam,seam+' window.__TWIN_WATER__=nextChannelWater; window.__TWIN_THREE__=THREE;');
  await route.fulfill({response,body});
 });
 if(arm==='before')await page.route('**/floodplain_dressing_pack.glb*',async route=>{
  const url=new URL(route.request().url());if(url.searchParams.has('import')||url.searchParams.has('url'))return route.continue();
  await route.fulfill({body:oldBody,contentType:'model/gltf-binary'});
 });
 await page.goto('http://127.0.0.1:5303/?debug&contract=e1-twin-banks&seed=map-art-campaign-2&nowaves&nolevel&nokill&nopause&tier=full');
 await page.waitForFunction(()=>window.__GR_TEST__&&window.__TWIN_WATER__&&document.querySelector('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState==='mounted');
 const begin=page.getByTestId('contract-briefing-dismiss');if(await begin.isVisible())await begin.click({timeout:2000}).catch(async e=>{if(await begin.isVisible())throw e});
 await page.evaluate(()=>{window.__GR_TEST__.setManualSim(true);window.__GR_GUI__?.hide()});
 for(const [station,x,z] of [['entry',0,-12],['braid',0,9]]){
  await page.evaluate(({x,z})=>window.__GR_TEST__.teleport(x,z),{x,z});await page.waitForTimeout(1000);
  const prefix=`${out}/${arm}-river-${station}-${width}`;await page.screenshot({path:prefix+'.png'});
  const state=await page.evaluate(()=>({hero:window.__THREE_GAME_DIAGNOSTICS__.heroPos,dataset:{...document.querySelector('#game-canvas').dataset}}));
  await page.evaluate(()=>{
   const THREE=window.__TWIN_THREE__,materials=new Set();window.__TWIN_WATER__.traverse(n=>{if(n.isMesh)materials.add(n.material)});
   for(const m of materials){
    const old={compile:m.onBeforeCompile,key:m.customProgramCacheKey,blending:m.blending,fog:m.fog};m.userData.artMaskRestore=old;
    m.onBeforeCompile=(shader,renderer)=>{old.compile.call(m,shader,renderer);shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>','if(diffuseColor.a < 0.10) discard; outgoingLight=vec3(1.0,0.0,1.0); diffuseColor.a=1.0;\n#include <opaque_fragment>')};
    m.customProgramCacheKey=()=>old.key.call(m)+'|art-water-mask';m.blending=THREE.NoBlending;m.fog=false;m.needsUpdate=true;
   }
  });
  const style=await page.addStyleTag({content:'body * {visibility:hidden !important} #game-canvas {visibility:visible !important}'});
  await page.screenshot({path:prefix+'-mask.png'});await style.evaluate(n=>n.remove());await page.screenshot({path:prefix+'-hud-mask.png'});
  await page.evaluate(()=>{const materials=new Set();window.__TWIN_WATER__.traverse(n=>{if(n.isMesh)materials.add(n.material)});for(const m of materials){const old=m.userData.artMaskRestore;m.onBeforeCompile=old.compile;m.customProgramCacheKey=old.key;m.blending=old.blending;m.fog=old.fog;m.needsUpdate=true;delete m.userData.artMaskRestore}});
  rows.push({width,arm,station,state,errors});writeFileSync(`${out}/river-diagnostics.json`,JSON.stringify(rows,null,2)+'\n');
 }
 assert.deepEqual(errors,[]);console.log(width,arm,'river diagnostics captured');await page.close();
}}finally{await browser.close()}
