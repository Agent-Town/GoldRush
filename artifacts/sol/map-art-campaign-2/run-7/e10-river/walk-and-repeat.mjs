// Diagnostic staging only. Ordinary no-debug entry is measured by paired-capture.
import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const out='artifacts/sol/map-art-campaign-2/run-7/e10-river';
const contract=JSON.parse(readFileSync('assets/pilots/map-rebuild-spike/river-terrain-contract.json'));
const browser=await chromium.launch({channel:'chromium'}),rows=[];
try {
 for(const width of [1280,390]) {
  const page=await browser.newPage({viewport:{width,height:width===390?844:800},isMobile:width===390,hasTouch:width===390});
  page.setDefaultTimeout(60000);
  const errors=[];
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/src/world/Terrain3dClaimPilot.ts*',async route=>{
   const response=await route.fetch();const body=(await response.text()).replace('function installTerrain3dClaimPilot(host) {','function installTerrain3dClaimPilot(host) {window.__RIVER_TERRAIN__=Terrain;');
   await route.fulfill({response,body});
  });
  await page.goto('http://127.0.0.1:5303/?debug&contract=e10-river&nowaves&nolevel&nopause&tier=full&seed=map-art-campaign-2');
  await page.waitForFunction(()=>window.__GR_TEST__&&document.querySelector('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState==='mounted');
  if(await page.getByTestId('contract-briefing-dismiss').isVisible())await page.getByTestId('contract-briefing-dismiss').click();
  await page.evaluate(()=>window.__GR_TEST__.setManualSim(true));
  const navigation=await page.evaluate(async mounts=>{
   const terrain=window.__RIVER_TERRAIN__,banks=[],ford=[];
   for(const z of [-9,9])for(let x=-63;x<=63;x+=.5)banks.push({x,z,walkable:terrain.sample(x,z).walkable});
   for(let z=-12;z<=12;z+=.25)ford.push({x:0,z,walkable:terrain.sample(0,z).walkable});
   return {banks,ford,blockers:terrain.landmarkBlockers(),mountCenters:mounts.map(m=>({id:m.id,walkable:terrain.sample(m.position[0],m.position[2]).walkable})),dataset:{...document.querySelector('#game-canvas').dataset},contract:window.__THREE_GAME_DIAGNOSTICS__.contract};
  },contract.landmarkMounts);
  assert.equal(navigation.contract.activeId,'e10-river');assert.equal(navigation.contract.fallbackReason,null);
  assert.deepEqual(navigation.blockers,[]);assert.ok([...navigation.banks,...navigation.ford,...navigation.mountCenters].every(p=>p.walkable));
  assert.equal(navigation.dataset.terrain3dPilotWalkSurfaces,'0');
  const routes=[];
  for(const [name,start,axis,sign,key,target] of [
   ['south-bank',[-58,9],'x',1,'KeyD',58],['north-bank',[58,-9],'x',-1,'KeyA',-58],['center-ford',[0,12],'z',-1,'KeyW',-12]
  ]) {
   await page.evaluate(([x,z])=>window.__GR_TEST__.teleport(x,z),start);
   const samples=[];
   await page.keyboard.down(key);
   try {
    for(let step=0;step<60;step++) {
     await page.evaluate(()=>window.__GR_TEST__.advanceSim(.5));
     await page.waitForTimeout(20);
     const hero=await page.evaluate(()=>({...window.__THREE_GAME_DIAGNOSTICS__.heroPos}));samples.push(hero);
     if(sign*(hero[axis]-target)>=0)break;
    }
   } finally {await page.keyboard.up(key)}
   assert.ok(sign*(samples.at(-1)[axis]-target)>=0,`${width} ${name} failed to reach ${target}: ${JSON.stringify(samples.at(-1))}`);
   routes.push({name,start,target,method:'keyboard input and actual advanceSim; no intermediate teleport',samples});
   await page.screenshot({path:`${out}/walk-${name}-${width}.png`});
  }
  const cycles=await page.evaluate(async()=>{
   const T=await import('/@id/three'),{installTerrain3dClaimPilot}=await import('/src/world/Terrain3dClaimPilot.ts'),rows=[];
   for(let cycle=0;cycle<3;cycle++) {
    const scene=new T.Scene(),canvas=document.createElement('canvas');
    const waterMat=new T.MeshStandardMaterial();waterMat.userData.waterUniforms={};
    const water=new T.Mesh(new T.PlaneGeometry(1,1),waterMat);water.userData.assetSlot='terrain.river';scene.add(water);
    const compile=waterMat.onBeforeCompile,key=waterMat.customProgramCacheKey;
    const dispose=installTerrain3dClaimPilot({scene,canvas,contractId:'e10-river',tileId:'frontier-river-claim'});
    await new Promise((resolve,reject)=>{const deadline=performance.now()+30000;function poll(){if(canvas.dataset.terrain3dPilotLandmarkLoadState==='mounted')resolve();else if(performance.now()>deadline)reject(Error(JSON.stringify(canvas.dataset)));else requestAnimationFrame(poll)}poll()});
    const dataset={...canvas.dataset},waterVisible=water.visible,waterPaintInstalled=waterMat.onBeforeCompile!==compile;
    const models=scene.getObjectByName('Terrain3dLandmarks').children.map(o=>({id:o.name,position:o.position.toArray()}));
    dispose();
    rows.push({cycle,dataset,models,waterVisible,waterPaintInstalled,restoredWaterPaint:waterMat.onBeforeCompile===compile&&waterMat.customProgramCacheKey===key,onlyOriginalWaterRemains:scene.children.length===1&&scene.children[0]===water});
    water.geometry.dispose();waterMat.dispose();
   }
   return rows;
  });
  for(const c of cycles){assert.equal(c.models.length,5);assert.equal(c.dataset.terrain3dPilotLandmarkSkipped,'0');assert.equal(c.dataset.terrain3dPilotWalkSurfaces,'0');assert.ok(c.waterVisible&&c.waterPaintInstalled&&c.restoredWaterPaint&&c.onlyOriginalWaterRemains)}
  assert.deepEqual(errors,[]);rows.push({width,navigation,routes,cycles,errors});
  writeFileSync(`${out}/walk-and-repeat.json`,JSON.stringify(rows,null,2)+'\n');console.log(width,'PASS: both banks, ford, zero blockers, three mount/dispose cycles');
  await page.close();
 }
} finally {await browser.close()}
